package com.naqashly.bot.service;

import com.naqashly.bot.client.AuthClient;
import com.naqashly.bot.client.TelegramClient;
import com.naqashly.bot.client.FinanceClient;
import com.naqashly.bot.client.ProductivityClient;
import com.naqashly.bot.client.RoutineClient;
import com.naqashly.bot.model.*;
import com.naqashly.bot.parser.IntentParser;
import com.naqashly.bot.config.UserContextHolder;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.retry.annotation.Retryable;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.math.BigDecimal;
import java.util.*;

/**
 * <h1>BotChatService</h1>
 * 
 * <p><b>WHAT:</b> State machine orchestrating guided conversational steps for the Ask Naqash widget.</p>
 * <p><b>WHY:</b> Keeps the microservice stateless by parsing incoming step context and executing mutations via Feign Clients.</p>
 */
@Slf4j
@Service
public class BotChatService {

    private final ProductivityClient productivityClient;
    private final FinanceClient financeClient;
    private final RoutineClient routineClient;
    private final IntentParser intentParser;
    private final AuthClient authClient;
    private final TelegramClient telegramClient;
    private final ObjectMapper objectMapper;
    private final ChatModel chatModel;

    @Value("${app.telegram.bot-token}")
    private String botToken;

    public BotChatService(ProductivityClient productivityClient,
                          FinanceClient financeClient,
                          RoutineClient routineClient,
                          IntentParser intentParser,
                          AuthClient authClient,
                          TelegramClient telegramClient,
                          ObjectMapper objectMapper,
                          Optional<ChatModel> chatModel) {
        this.productivityClient = productivityClient;
        this.financeClient = financeClient;
        this.routineClient = routineClient;
        this.intentParser = intentParser;
        this.authClient = authClient;
        this.telegramClient = telegramClient;
        this.objectMapper = objectMapper;
        this.chatModel = chatModel.orElse(null);
    }

    /**
     * Process incoming chat requests based on stateless step-by-step context.
     */
    public BotChatResponse processWebChat(String userId, BotChatRequest request) {
        String message = request.getMessage() != null ? request.getMessage().trim() : "";
        String context = request.getContext() != null ? request.getContext().toUpperCase() : "WELCOME";
        Map<String, Object> meta = request.getMeta() != null ? request.getMeta() : new HashMap<>();

        // 0. Global Cancel / Reset Interceptor
        if (isCancelCommand(message)) {
            return getWelcomeMenu("Cancelled! Let's start fresh. 🌿 What are we tracking today?");
        }

        // 0.5. Evaluate Intent-Driven Command shortcut (attempt Gemini first, fallback to Regex)
        ParsedIntent intent = null;
        boolean processedViaAI = false;

        if (!isCancelCommand(message) && !message.equalsIgnoreCase("menu") && !message.equalsIgnoreCase("help") && !message.isBlank()) {
            try {
                intent = parseGeminiIntent(message);
                if (intent != null && intent.getAction() != IntentAction.UNKNOWN) {
                    processedViaAI = true;
                    log.info("Gemini parsed web chat intent successfully: {}", intent.getAction());
                }
            } catch (Exception e) {
                log.warn("Gemini call failed or circuit breaker tripped, falling back to Regex in Web Chat: {}", e.getMessage());
            }
        }

        if (!processedViaAI && !message.isBlank()) {
            intent = intentParser.parse(BotMessageEvent.builder()
                    .textContent(message)
                    .internalUserId(Long.parseLong(userId))
                    .build());
        }

        if (intent != null && intent.getAction() != IntentAction.UNKNOWN) {
            if ("MISSING_AMOUNT".equals(intent.getExplanation())) {
                if (intent.getParameters().containsKey("category")) {
                    meta.put("category", intent.getParameters().get("category"));
                }
                if (intent.getParameters().containsKey("description")) {
                    meta.put("description", intent.getParameters().get("description"));
                }
                return BotChatResponse.builder()
                        .status("SUCCESS")
                        .type("options")
                        .text("💵 I detected you want to log an expense, but I need the amount. How much did you spend?")
                        .context("AWAITING_EXPENSE_AMOUNT")
                        .data(Map.of(
                            "chips", List.of("5.00", "10.00", "20.00", "50.00"),
                            "meta", meta
                        ))
                        .build();
            }
            BotChatResponse directResponse = executeIntentDirectly(userId, intent);
            if (processedViaAI) {
                return BotChatResponse.builder()
                        .status(directResponse.getStatus())
                        .type(directResponse.getType())
                        .text("✨ [AI Mode] " + directResponse.getText())
                        .context(directResponse.getContext())
                        .data(directResponse.getData())
                        .build();
            }
            return directResponse;
        }

        try {
            return switch (context) {
                case "WELCOME" -> handleWelcomeSelection(message);
                
                // --- EXPENSE FLOW ---
                case "AWAITING_EXPENSE_AMOUNT" -> handleExpenseAmount(message);
                case "AWAITING_EXPENSE_CATEGORY" -> handleExpenseCategory(message, meta);

                // --- TASK FLOW ---
                case "AWAITING_TASK_ACTION" -> handleTaskAction(message);
                case "AWAITING_TASK_TITLE" -> handleTaskTitle(message);
                case "AWAITING_TASK_PRIORITY" -> handleTaskPriority(message, meta);

                // --- HABIT FLOW ---
                case "AWAITING_HABIT_SELECT" -> handleHabitSelect(message);

                default -> getWelcomeMenu("I didn't quite get that. Let's restart! 🌿 What would you like to do?");
            };
        } catch (Exception e) {
            log.error("Failed to process conversational bot interaction context: {}, message length: {}. Error: {}", 
                    context, message.length(), e.getMessage(), e);
            return BotChatResponse.builder()
                    .status("ERROR")
                    .type("text")
                    .text("⚠️ Sorry, I encountered an issue executing that command. Let's start over!")
                    .context("WELCOME")
                    .data(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown exception"))
                    .build();
        }
    }

    private boolean isCancelCommand(String msg) {
        String cleaned = msg.toLowerCase();
        return cleaned.equals("cancel") || cleaned.equals("exit") || cleaned.equals("nevermind") || cleaned.equals("stop") || cleaned.equals("restart");
    }

    /**
     * Render the default Welcome Menu.
     */
    private BotChatResponse getWelcomeMenu(String greetingText) {
        List<Map<String, String>> welcomeOptions = List.of(
            Map.of("label", "💵 Log an Expense", "value", "LOG_EXPENSE"),
            Map.of("label", "📋 Manage Tasks", "value", "MANAGE_TASKS"),
            Map.of("label", "🧘 Log Completed Habit", "value", "LOG_HABIT")
        );

        return BotChatResponse.builder()
                .status("SUCCESS")
                .type("options")
                .text(greetingText)
                .context("WELCOME")
                .data(Map.of("options", welcomeOptions))
                .build();
    }

    /**
     * Step 1: User chose a path from the welcome options.
     */
    private BotChatResponse handleWelcomeSelection(String choice) {
        return switch (choice.toUpperCase()) {
            case "LOG_EXPENSE" -> BotChatResponse.builder()
                    .status("SUCCESS")
                    .type("options")
                    .text("💵 Understood! How much did you spend?")
                    .context("AWAITING_EXPENSE_AMOUNT")
                    .data(Map.of("chips", List.of("5.00", "10.00", "20.00", "50.00")))
                    .build();

            case "MANAGE_TASKS" -> BotChatResponse.builder()
                    .status("SUCCESS")
                    .type("options")
                    .text("📋 How would you like to manage your tasks today?")
                    .context("AWAITING_TASK_ACTION")
                    .data(Map.of("options", List.of(
                            Map.of("label", "🔍 View Active Tasks", "value", "VIEW_ACTIVE_TASKS"),
                            Map.of("label", "➕ Add New Task", "value", "ADD_TASK")
                    )))
                    .build();

            case "LOG_HABIT" -> {
                List<HabitDto> habits = routineClient.getHabits();
                if (habits.isEmpty()) {
                    yield BotChatResponse.builder()
                            .status("SUCCESS")
                            .type("text")
                            .text("You don't have any habits configured yet! Go to the **Routine** dashboard page to create one.")
                            .context("WELCOME")
                            .build();
                }
                
                List<Map<String, String>> habitOptions = new ArrayList<>();
                for (HabitDto h : habits) {
                    habitOptions.add(Map.of("label", h.getTitle(), "value", String.valueOf(h.getId())));
                }

                yield BotChatResponse.builder()
                        .status("SUCCESS")
                        .type("options")
                        .text("🧘 Which habit did you complete today?")
                        .context("AWAITING_HABIT_SELECT")
                        .data(Map.of("options", habitOptions))
                        .build();
            }

            default -> getWelcomeMenu("Please select one of the core options below:");
        };
    }

    // =========================================================================
    // 💵 EXPENSE guided FLOW
    // =========================================================================

    private BotChatResponse handleExpenseAmount(String message) {
        BigDecimal amount;
        try {
            amount = new BigDecimal(message.replace("$", "").trim());
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new NumberFormatException();
            }
        } catch (NumberFormatException e) {
            return BotChatResponse.builder()
                    .status("SUCCESS")
                    .type("options")
                    .text("❌ Please enter a valid positive numeric amount (e.g. 15.50 or 50):")
                    .context("AWAITING_EXPENSE_AMOUNT")
                    .data(Map.of("chips", List.of("5.00", "10.00", "20.00", "50.00")))
                    .build();
        }

        // Check user wallets
        List<WalletDto> wallets = financeClient.getWallets();
        Long targetWalletId;
        if (wallets.isEmpty()) {
            // Provision default wallet
            WalletDto newWallet = financeClient.createWallet(CreateWalletRequest.builder()
                    .name("Personal Cash")
                    .currency("USD")
                    .initialBalance(BigDecimal.ZERO)
                    .build());
            targetWalletId = newWallet.getId();
        } else {
            targetWalletId = wallets.get(0).getId(); // Fallback to first wallet
        }

        List<String> categories = List.of("Food", "Transport", "Groceries", "Shopping", "Entertainment", "Bills");
        List<Map<String, String>> catOptions = new ArrayList<>();
        for (String cat : categories) {
            catOptions.add(Map.of("label", cat, "value", cat));
        }

        return BotChatResponse.builder()
                .status("SUCCESS")
                .type("options")
                .text(String.format("What category was the expense of $%s for?", amount))
                .context("AWAITING_EXPENSE_CATEGORY")
                .data(Map.of(
                        "options", catOptions,
                        "meta", Map.of("amount", amount, "walletId", targetWalletId)
                ))
                .build();
    }

    private BotChatResponse handleExpenseCategory(String message, Map<String, Object> meta) {
        BigDecimal amount = new BigDecimal(String.valueOf(meta.get("amount")));
        Long walletId = Long.parseLong(String.valueOf(meta.get("walletId")));
        String category = message;

        Map<String, Object> txResult = financeClient.createTransaction(CreateTransactionRequest.builder()
                .walletId(walletId)
                .transactionType("EXPENSE")
                .amount(amount)
                .category(category)
                .description("Logged via Ask Naqash web helper")
                .build());

        return BotChatResponse.builder()
                .status("SUCCESS")
                .type("receipt")
                .text(String.format("Done! Logged expense of $%s under category '%s'.", amount, category))
                .context("WELCOME")
                .data(txResult)
                .build();
    }

    // =========================================================================
    // 📋 TASK guided FLOW
    // =========================================================================

    private BotChatResponse handleTaskAction(String choice) {
        if (choice.toUpperCase().equals("VIEW_ACTIVE_TASKS")) {
            List<TaskDto> tasks = productivityClient.getTasks();
            
            // Filter only TODO/IN_PROGRESS tasks
            List<TaskDto> activeTasks = new ArrayList<>();
            for (TaskDto t : tasks) {
                if ("TODO".equals(t.getStatus()) || "IN_PROGRESS".equals(t.getStatus())) {
                    activeTasks.add(t);
                }
            }

            return BotChatResponse.builder()
                    .status("SUCCESS")
                    .type("task_list")
                    .text(activeTasks.isEmpty() ? "🎉 You have no active tasks right now!" : "Here are your active TODO tasks:")
                    .context("WELCOME")
                    .data(activeTasks)
                    .build();
        } else if (choice.toUpperCase().equals("ADD_TASK")) {
            return BotChatResponse.builder()
                    .status("SUCCESS")
                    .type("text")
                    .text("📋 Please type the title of the task you want to create:")
                    .context("AWAITING_TASK_TITLE")
                    .build();
        }

        return getWelcomeMenu("Please select one of the task options below:");
    }

    private BotChatResponse handleTaskTitle(String message) {
        if (message.isBlank()) {
            return BotChatResponse.builder()
                    .status("SUCCESS")
                    .type("text")
                    .text("❌ Task title cannot be blank. Please enter a task title:")
                    .context("AWAITING_TASK_TITLE")
                    .build();
        }

        List<Map<String, String>> priorityOptions = List.of(
            Map.of("label", "🔴 High Priority", "value", "HIGH"),
            Map.of("label", "🟡 Medium Priority", "value", "MEDIUM"),
            Map.of("label", "🟢 Low Priority", "value", "LOW")
        );

        return BotChatResponse.builder()
                .status("SUCCESS")
                .type("options")
                .text(String.format("What priority should we set for '%s'?", message))
                .context("AWAITING_TASK_PRIORITY")
                .data(Map.of(
                        "options", priorityOptions,
                        "meta", Map.of("title", message)
                ))
                .build();
    }

    private BotChatResponse handleTaskPriority(String message, Map<String, Object> meta) {
        String title = String.valueOf(meta.get("title"));
        String priority = message.toUpperCase();

        TaskDto task = productivityClient.createTask(CreateTaskRequest.builder()
                .title(title)
                .priority(priority)
                .category("General")
                .description("Created via Ask Naqash web companion")
                .build());

        return BotChatResponse.builder()
                .status("SUCCESS")
                .type("text")
                .text(String.format("Successfully created task '%s' with %s priority! 📋", title, priority))
                .context("WELCOME")
                .data(task)
                .build();
    }

    // =========================================================================
    // 🧘 HABIT guided FLOW
    // =========================================================================

    private BotChatResponse handleHabitSelect(String message) {
        Long habitId;
        try {
            habitId = Long.parseLong(message);
        } catch (NumberFormatException e) {
            return handleWelcomeSelection("LOG_HABIT"); // Back to habit selection options
        }

        routineClient.logHabitStatus(HabitLogDto.builder()
                .habitId(habitId)
                .status("COMPLETED")
                .completionPercentage(100)
                .build());

        return BotChatResponse.builder()
                .status("SUCCESS")
                .type("text")
                .text("Awesome job! Habit completion logged. Keep the streak alive! 🔥")
                .context("WELCOME")
                .build();
    }

    private BotChatResponse executeIntentDirectly(String userId, ParsedIntent intent) {
        try {
            switch (intent.getAction()) {
                case CHECK_BALANCE: {
                    List<WalletDto> wallets = financeClient.getWallets();
                    if (wallets.isEmpty()) {
                        return BotChatResponse.builder()
                                .status("SUCCESS")
                                .type("text")
                                .text("💰 You don't have any wallets set up yet!")
                                .context("WELCOME")
                                .build();
                    }
                    StringBuilder sb = new StringBuilder("💰 **Your Active Wallet Balances:**\n");
                    for (WalletDto w : wallets) {
                        sb.append(String.format("• %s: $%s %s\n", w.getName(), w.getBalance() != null ? w.getBalance() : "0.00", w.getCurrency()));
                    }
                    return BotChatResponse.builder()
                                .status("SUCCESS")
                                .type("text")
                                .text(sb.toString())
                                .context("WELCOME")
                                .build();
                }

                case LOG_EXPENSE: {
                    BigDecimal amount = (BigDecimal) intent.getParameters().get("amount");
                    String category = (String) intent.getParameters().get("category");

                    List<WalletDto> wallets = financeClient.getWallets();
                    Long walletId;
                    if (wallets.isEmpty()) {
                        WalletDto newWallet = financeClient.createWallet(CreateWalletRequest.builder()
                                .name("Personal Cash")
                                .currency("USD")
                                .initialBalance(BigDecimal.ZERO)
                                .build());
                        walletId = newWallet.getId();
                    } else {
                        walletId = wallets.get(0).getId();
                    }

                    Map<String, Object> txResult = financeClient.createTransaction(CreateTransactionRequest.builder()
                            .walletId(walletId)
                            .transactionType("EXPENSE")
                            .amount(amount)
                            .category(category)
                            .description("Logged via Ask Naqash intent shortcut")
                            .build());

                    return BotChatResponse.builder()
                            .status("SUCCESS")
                            .type("receipt")
                            .text(String.format("⚡ **Transaction Logged!** Spent $%s on %s.", amount, category))
                            .context("WELCOME")
                            .data(txResult)
                            .build();
                }

                case ADD_TASK: {
                    String title = (String) intent.getParameters().get("title");
                    TaskDto task = productivityClient.createTask(CreateTaskRequest.builder()
                            .title(title)
                            .priority("MEDIUM")
                            .build());
                    return BotChatResponse.builder()
                            .status("SUCCESS")
                            .type("text")
                            .text(String.format("⚡ **Task Created!** Created medium priority task: \"%s\" (ID: %s)", task.getTitle(), task.getId()))
                            .context("WELCOME")
                            .data(task)
                            .build();
                }

                case MARK_TASK_COMPLETE: {
                    Long taskId = (Long) intent.getParameters().get("taskId");
                    TaskDto task = productivityClient.updateTaskStatus(taskId, UpdateStatusRequest.builder()
                            .status("COMPLETED")
                            .build());
                    return BotChatResponse.builder()
                            .status("SUCCESS")
                            .type("text")
                            .text(String.format("⚡ **Task Completed!** Marked task #%s (\"%s\") as completed.", taskId, task.getTitle()))
                            .context("WELCOME")
                            .data(task)
                            .build();
                }

                case LOG_HABIT: {
                    String title = (String) intent.getParameters().get("title");
                    List<HabitDto> habits = routineClient.getHabits();
                    HabitDto matchedHabit = null;
                    for (HabitDto h : habits) {
                        if (h.getTitle().equalsIgnoreCase(title) || h.getTitle().toLowerCase().contains(title.toLowerCase())) {
                            matchedHabit = h;
                            break;
                        }
                    }

                    if (matchedHabit == null) {
                        return BotChatResponse.builder()
                                .status("SUCCESS")
                                .type("text")
                                .text(String.format("❌ Could not find a habit matching \"%s\". Make sure it matches one of your active habits.", title))
                                .context("WELCOME")
                                .build();
                    }

                    HabitLogDto logDto = routineClient.logHabitStatus(HabitLogDto.builder()
                            .habitId(matchedHabit.getId())
                            .status("COMPLETED")
                            .completionPercentage(100)
                            .build());

                    return BotChatResponse.builder()
                            .status("SUCCESS")
                            .type("text")
                            .text(String.format("⚡ **Habit Logged!** Completed habit \"%s\" successfully.", matchedHabit.getTitle()))
                            .context("WELCOME")
                            .data(logDto)
                            .build();
                }

                case HELP: {
                    return BotChatResponse.builder()
                            .status("SUCCESS")
                            .type("text")
                            .text("🌿 **Ask Naqash Intent Command Guide** 🤖\n\n" +
                                  "You can type commands directly instead of navigating menus:\n\n" +
                                  "💵 **Log Expense**: `spent 45 food`, `-50 bills`, `spent $15 shopping`\n" +
                                  "📋 **Add Task**: `add Buy milk`, `create read book`\n" +
                                  "🎯 **Complete Task**: `done task 12`, `complete 5`\n" +
                                  "🧘 **Log Habit**: `done habit meditation`, `completed workout`\n" +
                                  "💰 **Check Balance**: `balance`, `wallets`\n\n" +
                                  "Type `cancel` or `menu` at any time to return.")
                            .context("WELCOME")
                            .build();
                }

                default:
                    return getWelcomeMenu("Please select one of the options below:");
            }
        } catch (Exception e) {
            log.error("Failed to execute parsed intent directly: {}", e.getMessage(), e);
            return BotChatResponse.builder()
                    .status("ERROR")
                    .type("text")
                    .text("❌ Encountered an issue executing command: " + e.getMessage())
                    .context("WELCOME")
                    .build();
        }
    }

    @Async("botTaskExecutor")
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @org.springframework.retry.annotation.Backoff(delay = 1000, multiplier = 2))
    public void processTelegramUpdateAsync(Long chatId, String text) {
        Map<String, Object> userProfile;
        try {
            userProfile = authClient.getUserByChatId(chatId);
        } catch (Exception e) {
            log.warn("Telegram chat ID {} not associated with any account", chatId);
            sendInstructions(chatId, "⚠️ <b>Not Linked</b>\n\nYour Telegram account is not connected to Naqashly. Log into the Web Dashboard, click <b>'Link Telegram Bot'</b> to link your profile.");
            return;
        }

        String userId = String.valueOf(userProfile.get("userId"));
        String context = String.valueOf(userProfile.get("telegramContext"));
        String metaStr = String.valueOf(userProfile.get("telegramMeta"));

        if ("/cancel".equalsIgnoreCase(text) || "cancel".equalsIgnoreCase(text)) {
            context = "WELCOME";
            metaStr = "{}";
            text = "cancel";
        } else if ("/menu".equalsIgnoreCase(text) || "menu".equalsIgnoreCase(text)) {
            context = "WELCOME";
            metaStr = "{}";
            text = "menu";
        }

        Map<String, Object> metaMap = new HashMap<>();
        if (metaStr != null && !metaStr.isBlank() && !metaStr.equals("null")) {
            try {
                metaMap = objectMapper.readValue(metaStr, new TypeReference<Map<String, Object>>() {});
            } catch (Exception ignored) {}
        }

        try {
            UserContextHolder.setUserId(userId);

            ParsedIntent parsedIntent = null;
            boolean processedViaAI = false;

            if (!"cancel".equalsIgnoreCase(text) && !"menu".equalsIgnoreCase(text) && !"help".equalsIgnoreCase(text)) {
                try {
                    parsedIntent = parseGeminiIntent(text);
                    if (parsedIntent != null && parsedIntent.getAction() != IntentAction.UNKNOWN) {
                        processedViaAI = true;
                        log.info("Gemini parsed user intent successfully: {}", parsedIntent.getAction());
                    }
                } catch (Exception e) {
                    log.warn("Gemini call failed or circuit breaker tripped, falling back to Regex: {}", e.getMessage());
                }
            }

            if (!processedViaAI) {
                try {
                    ParsedIntent regexIntent = intentParser.parse(BotMessageEvent.builder()
                            .textContent(text)
                            .internalUserId(Long.parseLong(userId))
                            .build());
                    if (regexIntent.getAction() != IntentAction.UNKNOWN) {
                        parsedIntent = regexIntent;
                        log.info("Regex parsed user intent successfully: {}", regexIntent.getAction());
                    }
                } catch (Exception e) {
                    log.error("Regex parsing failed: {}", e.getMessage());
                }
            }

            BotChatResponse chatResponse;
            if (parsedIntent != null && parsedIntent.getAction() != IntentAction.UNKNOWN) {
                if ("MISSING_AMOUNT".equals(parsedIntent.getExplanation())) {
                    Map<String, Object> meta = new HashMap<>(metaMap);
                    if (parsedIntent.getParameters().containsKey("category")) {
                        meta.put("category", parsedIntent.getParameters().get("category"));
                    }
                    if (parsedIntent.getParameters().containsKey("description")) {
                        meta.put("description", parsedIntent.getParameters().get("description"));
                    }
                    authClient.updateTelegramState(chatId, "AWAITING_EXPENSE_AMOUNT", objectMapper.writeValueAsString(meta));
                    sendInstructions(chatId, "💵 I detected you want to log an expense, but I need the amount. How much did you spend?");
                    return;
                }
                chatResponse = executeIntentDirectly(userId, parsedIntent);
                if (processedViaAI) {
                    chatResponse = BotChatResponse.builder()
                            .status(chatResponse.getStatus())
                            .type(chatResponse.getType())
                            .text("✨ [AI Mode] " + chatResponse.getText())
                            .context(chatResponse.getContext())
                            .data(chatResponse.getData())
                            .build();
                }
            } else {
                if (text.length() > 30 && !"cancel".equalsIgnoreCase(text) && !"menu".equalsIgnoreCase(text)) {
                    queueOfflineMessage(chatId, userId, text);
                    sendInstructions(chatId, "📥 <b>Note Queued</b>\n\nOur AI brain is currently offline and this note is too complex for basic commands. I have saved it in your offline backlog queue and will process it automatically as soon as my systems are online!");
                    return;
                }

                BotChatRequest chatRequest = BotChatRequest.builder()
                        .message(text)
                        .context(context)
                        .meta(metaMap)
                        .build();
                chatResponse = processWebChat(userId, chatRequest);
            }

            String newMetaStr = "{}";
            if (chatResponse.getData() instanceof Map) {
                Map<String, Object> dataMap = (Map<String, Object>) chatResponse.getData();
                if (dataMap.containsKey("meta")) {
                    newMetaStr = objectMapper.writeValueAsString(dataMap.get("meta"));
                }
            }
            authClient.updateTelegramState(chatId, chatResponse.getContext(), newMetaStr);
            sendTelegramMessage(chatId, chatResponse);

        } catch (Exception e) {
            log.error("Error processing Telegram async update", e);
        } finally {
            UserContextHolder.clear();
        }
    }

    private ParsedIntent parseGeminiIntent(String text) {
        if (chatModel == null) {
            log.warn("Gemini ChatModel is not configured or disabled. Skipping AI parsing.");
            return null;
        }
        String systemPrompt = "You are the AI assistant for Naqashly Life OS. Your job is to parse the user's natural language input into a structured JSON action representation.\n" +
                "Select one of these actions:\n" +
                "1. LOG_EXPENSE: requires parameters 'amount' (number), 'category' (string), 'description' (string). Interpret both past and present/imperative actions (e.g., 'spent 300', 'spend 300', 'paid 300', 'buy coffee 5') as LOG_EXPENSE.\n" +
                "   CRITICAL: The 'category' parameter MUST be mapped to one of these exact values: Food, Transport, Rent, Shopping, Bills, General. Map unrecognized categories to the closest match (e.g., 'uber' or 'taxi' to 'Transport', 'groceries' to 'Food').\n" +
                "2. ADD_TASK: requires parameters 'title' (string). Interpret both past and present actions (e.g., 'add Buy milk', 'todo read book') as ADD_TASK.\n" +
                "3. COMPLETE_TASK: requires parameters 'taskId' (number). Interpret commands like 'done task 5' or 'complete task 12' as COMPLETE_TASK.\n" +
                "4. LOG_HABIT: requires parameter 'title' (string). Interpret commands like 'log workout' or 'done meditation' as LOG_HABIT.\n" +
                "5. UNKNOWN: if the input does not match any of the above.\n\n" +
                "Respond ONLY with a valid JSON object matching this schema:\n" +
                "{\n" +
                "  \"action\": \"LOG_EXPENSE | ADD_TASK | COMPLETE_TASK | LOG_HABIT | UNKNOWN\",\n" +
                "  \"parameters\": {\n" +
                "     ... parameters specific to the action ...\n" +
                "  }\n" +
                "}\n" +
                "Do not include any markdown styling like ```json or explanation. Respond with raw JSON text only.";

        long startTime = System.currentTimeMillis();
        String responseJson = chatModel.call(new Prompt(systemPrompt + "\n\nUser Input: " + text)).getResult().getOutput().getText();
        long duration = System.currentTimeMillis() - startTime;
        log.info("Gemini LLM parsed intent in {} ms", duration);
        log.info("Gemini raw response: {}", responseJson);

        try {
            responseJson = responseJson.trim();
            if (responseJson.startsWith("```")) {
                responseJson = responseJson.substring(responseJson.indexOf("{"), responseJson.lastIndexOf("}") + 1);
            }

            Map<String, Object> geminiResult = objectMapper.readValue(responseJson, new TypeReference<Map<String, Object>>() {});
            String actionStr = (String) geminiResult.get("action");
            Map<String, Object> params = (Map<String, Object>) geminiResult.get("parameters");

            IntentAction action = IntentAction.UNKNOWN;
            if ("LOG_EXPENSE".equals(actionStr)) action = IntentAction.LOG_EXPENSE;
            else if ("ADD_TASK".equals(actionStr)) action = IntentAction.ADD_TASK;
            else if ("COMPLETE_TASK".equals(actionStr)) action = IntentAction.MARK_TASK_COMPLETE;
            else if ("LOG_HABIT".equals(actionStr)) action = IntentAction.LOG_HABIT;

            Map<String, Object> mappedParams = new HashMap<>();
            if (params != null) {
                if (params.containsKey("amount") && params.get("amount") != null && !params.get("amount").toString().isBlank()) {
                    try {
                        mappedParams.put("amount", new BigDecimal(params.get("amount").toString()));
                    } catch (Exception ignored) {}
                }
                if (params.containsKey("category")) {
                    mappedParams.put("category", params.get("category").toString());
                }
                if (params.containsKey("title")) {
                    mappedParams.put("title", params.get("title").toString());
                }
                if (params.containsKey("taskId") && params.get("taskId") != null && !params.get("taskId").toString().isBlank()) {
                    try {
                        mappedParams.put("taskId", Long.valueOf(params.get("taskId").toString()));
                    } catch (Exception ignored) {}
                }
            }

            String explanation = null;
            if (action == IntentAction.LOG_EXPENSE) {
                if (!mappedParams.containsKey("amount")) {
                    explanation = "MISSING_AMOUNT";
                }
            }

            return ParsedIntent.builder()
                    .action(action)
                    .parameters(mappedParams)
                    .explanation(explanation)
                    .build();
        } catch (Exception e) {
            log.error("Failed to parse Gemini intent JSON output: {}", e.getMessage());
            return null;
        }
    }

    private synchronized void queueOfflineMessage(Long chatId, String userId, String text) {
        try {
            File file = new File("pending_logs.json");
            List<Map<String, Object>> list = new ArrayList<>();
            if (file.exists()) {
                try {
                    list = objectMapper.readValue(file, new TypeReference<List<Map<String, Object>>>() {});
                } catch (Exception ignored) {}
            }
            Map<String, Object> item = new HashMap<>();
            item.put("chatId", chatId);
            item.put("userId", userId);
            item.put("text", text);
            item.put("timestamp", new Date().toString());
            list.add(item);
            objectMapper.writeValue(file, list);
            log.info("Successfully queued offline message to pending_logs.json");
        } catch (Exception e) {
            log.error("Failed to queue offline message to pending_logs.json", e);
        }
    }

    private void sendInstructions(Long chatId, String text) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("chat_id", chatId);
        payload.put("text", text);
        payload.put("parse_mode", "HTML");
        try {
            telegramClient.sendMessage(botToken, payload);
        } catch (Exception e) {
            log.error("Failed to send instruction message to Telegram", e);
        }
    }

    private void sendTelegramMessage(Long chatId, BotChatResponse response) {
        String outputText = response.getText();

        if ("task_list".equals(response.getType()) && response.getData() instanceof List) {
            List<Map<String, Object>> tasks = (List<Map<String, Object>>) response.getData();
            StringBuilder sb = new StringBuilder();
            sb.append("<b>📋 Here are your active TODO tasks:</b>\n\n");
            if (tasks.isEmpty()) {
                sb.append("No active tasks found! Create one via: `/menu` ➔ Add Task.");
            } else {
                for (Map<String, Object> t : tasks) {
                    sb.append(String.format("• <b>[ID: %s]</b> %s (Priority: %s)\n", t.get("id"), t.get("title"), t.get("priority")));
                }
            }
            outputText = sb.toString();
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("chat_id", chatId);
        payload.put("text", outputText);
        payload.put("parse_mode", "HTML");
        try {
            telegramClient.sendMessage(botToken, payload);
        } catch (Exception e) {
            log.error("Failed to send message to Telegram", e);
        }
    }
}
