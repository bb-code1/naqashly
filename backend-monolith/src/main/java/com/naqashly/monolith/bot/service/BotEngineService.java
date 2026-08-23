package com.naqashly.monolith.bot.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.naqashly.monolith.bot.model.BotMessageEvent;
import com.naqashly.monolith.bot.model.IntentAction;
import com.naqashly.monolith.bot.model.ParsedIntent;
import com.naqashly.monolith.bot.parser.IntentParser;
import com.naqashly.monolith.finance.entity.DebtRecord;
import com.naqashly.monolith.finance.entity.DebtStatus;
import com.naqashly.monolith.finance.entity.DebtType;
import com.naqashly.monolith.finance.entity.Person;
import com.naqashly.monolith.finance.entity.Transaction;
import com.naqashly.monolith.finance.entity.TransactionType;
import com.naqashly.monolith.finance.entity.Wallet;
import com.naqashly.monolith.finance.repository.DebtRecordRepository;
import com.naqashly.monolith.finance.repository.PersonRepository;
import com.naqashly.monolith.finance.repository.TransactionRepository;
import com.naqashly.monolith.finance.repository.WalletRepository;
import com.naqashly.monolith.journal.entity.Note;
import com.naqashly.monolith.journal.repository.NoteRepository;
import com.naqashly.monolith.productivity.entity.Task;
import com.naqashly.monolith.productivity.entity.TaskPriority;
import com.naqashly.monolith.productivity.entity.TaskStatus;
import com.naqashly.monolith.productivity.repository.TaskRepository;
import com.naqashly.monolith.routine.entity.HabitContract;
import com.naqashly.monolith.routine.repository.HabitContractRepository;
import com.naqashly.monolith.routine.service.RoutineService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.*;

/**
 * <h1>Ask Naqash Conversational Bot Engine</h1>
 * 
 * <p><b>WHAT:</b> State machine orchestrating guided conversational steps and AI intent parsing for the Ask Naqash widget in the monolith.</p>
 */
@Slf4j
@Service
public class BotEngineService {

    private final RoutineService routineService;
    private final HabitContractRepository habitContractRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final TaskRepository taskRepository;
    private final NoteRepository noteRepository;
    private final DebtRecordRepository debtRecordRepository;
    private final PersonRepository personRepository;
    private final IntentParser intentParser;
    private final ObjectMapper objectMapper;
    private final ChatModel chatModel;

    public BotEngineService(RoutineService routineService,
                            HabitContractRepository habitContractRepository,
                            WalletRepository walletRepository,
                            TransactionRepository transactionRepository,
                            TaskRepository taskRepository,
                            NoteRepository noteRepository,
                            DebtRecordRepository debtRecordRepository,
                            PersonRepository personRepository,
                            IntentParser intentParser,
                            ObjectMapper objectMapper,
                            Optional<ChatModel> chatModel) {
        this.routineService = routineService;
        this.habitContractRepository = habitContractRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.taskRepository = taskRepository;
        this.noteRepository = noteRepository;
        this.debtRecordRepository = debtRecordRepository;
        this.personRepository = personRepository;
        this.intentParser = intentParser;
        this.objectMapper = objectMapper;
        this.chatModel = chatModel.orElse(null);
    }

    @Transactional
    public Map<String, Object> processMessage(Long userId, String message, String context, Map<String, Object> meta) {
        log.info("Processing bot query for userId {} in context [{}]: {}", userId, context, message);

        String trimmedMsg = message != null ? message.trim() : "";
        String activeContext = context != null ? context.toUpperCase() : "WELCOME";
        Map<String, Object> activeMeta = meta != null ? new HashMap<>(meta) : new HashMap<>();

        // Handle cancel / restart commands
        if (isCancelCommand(trimmedMsg)) {
            return getWelcomeMenu("Cancelled! Let's start fresh. 🌿 What are we tracking today?");
        }

        // 0.5. Evaluate Intent-Driven Command shortcut (attempt Regex first, fallback to Gemini AI)
        ParsedIntent intent = null;
        boolean processedViaAI = false;

        if (!trimmedMsg.equalsIgnoreCase("menu") && !trimmedMsg.equalsIgnoreCase("help") && !trimmedMsg.isBlank()) {
            try {
                ParsedIntent regexIntent = intentParser.parse(BotMessageEvent.builder()
                        .textContent(trimmedMsg)
                        .internalUserId(userId)
                        .build());
                if (regexIntent.getAction() != IntentAction.UNKNOWN) {
                    intent = regexIntent;
                    log.info("Regex parsed web chat intent successfully: {}", regexIntent.getAction());
                }
            } catch (Exception e) {
                log.error("Regex parsing in Web Chat failed: {}", e.getMessage());
            }

            if ((intent == null || intent.getAction() == IntentAction.UNKNOWN)) {
                try {
                    intent = parseGeminiIntent(trimmedMsg);
                    if (intent != null && intent.getAction() != IntentAction.UNKNOWN) {
                        processedViaAI = true;
                        log.info("Gemini parsed web chat intent successfully: {}", intent.getAction());
                    }
                } catch (Exception e) {
                    log.warn("Gemini call failed: {}", e.getMessage());
                }
            }
        }

        if (intent != null && intent.getAction() != IntentAction.UNKNOWN) {
            if ("MISSING_AMOUNT".equals(intent.getExplanation())) {
                if (intent.getParameters().containsKey("category")) {
                    activeMeta.put("category", intent.getParameters().get("category"));
                }
                return Map.of(
                        "status", "SUCCESS",
                        "type", "options",
                        "text", "💵 I detected you want to log an expense, but I need the amount. How much did you spend?",
                        "context", "AWAITING_EXPENSE_AMOUNT",
                        "data", Map.of(
                            "chips", List.of("5.00", "10.00", "20.00", "50.00"),
                            "meta", activeMeta
                        )
                );
            }

            Map<String, Object> directResponse = executeIntentDirectly(userId, intent);
            if (processedViaAI) {
                Map<String, Object> aiResponse = new HashMap<>(directResponse);
                aiResponse.put("text", "✨ [AI Mode] " + directResponse.get("text"));
                return aiResponse;
            }
            return directResponse;
        }

        try {
            return switch (activeContext) {
                case "WELCOME" -> handleWelcomeSelection(userId, trimmedMsg);
                
                // --- EXPENSE FLOW ---
                case "AWAITING_EXPENSE_AMOUNT" -> handleExpenseAmount(userId, trimmedMsg);
                case "AWAITING_EXPENSE_CATEGORY" -> handleExpenseCategory(userId, trimmedMsg, activeMeta);

                // --- TASK FLOW ---
                case "AWAITING_TASK_ACTION" -> handleTaskAction(userId, trimmedMsg);
                case "AWAITING_TASK_TITLE" -> handleTaskTitle(trimmedMsg);
                case "AWAITING_TASK_PRIORITY" -> handleTaskPriority(userId, trimmedMsg, activeMeta);

                // --- HABIT FLOW ---
                case "AWAITING_HABIT_SELECT" -> handleHabitSelect(userId, trimmedMsg);

                default -> getWelcomeMenu("I didn't quite get that. Let's restart! 🌿 What would you like to do?");
            };
        } catch (Exception e) {
            log.error("Failed to process conversational bot interaction: context={}, message={}, error={}", 
                    activeContext, trimmedMsg, e.getMessage(), e);
            return Map.of(
                    "status", "ERROR",
                    "type", "text",
                    "text", "⚠️ Sorry, I encountered an issue executing that command. Let's start over!",
                    "context", "WELCOME",
                    "data", Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown exception")
            );
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
                "2. ADD_TASK: requires parameters 'title' (string), 'priority' (optional string: LOW, MEDIUM, HIGH). Interpret commands like 'add Buy milk', 'todo read book', 'add high priority task deploy backend' as ADD_TASK.\n" +
                "3. COMPLETE_TASK: requires parameters 'taskId' (number). Interpret commands like 'done task 5' or 'complete task 12' as COMPLETE_TASK.\n" +
                "4. LOG_HABIT: requires parameter 'title' (string). Interpret commands like 'log workout', 'done habit meditation', 'completed workout' as LOG_HABIT.\n" +
                "5. LOG_NOTE: requires parameters 'content' (string), 'title' (string, optional). LOG_NOTE represents static information, thoughts, memories, reminders or reflections you want to store and retrieve later (but never check off as complete). Examples: 'note: buy milk', 'remember that server ip is 10.0.0.5', 'had a productive meeting today'. If the input is just information or a fact, treat it as LOG_NOTE.\n" +
                "6. GET_RECENT_NOTES: requires no parameters. Interpret commands like 'what are my notes', 'show notes', 'recent notes' as GET_RECENT_NOTES.\n" +
                "7. GET_SPENDING_SUMMARY: requires parameter 'period' (string, e.g., 'month' or 'week'). Interpret commands like 'spending this month', 'total spent', 'how much did I spend this week' as GET_SPENDING_SUMMARY.\n" +
                "8. LOG_DEBT: requires parameters 'personName' (string), 'amount' (number), 'type' (string: GIVE_LOAN, TAKE_LOAN, RECEIVE_PAYMENT, MAKE_PAYMENT). Interpret commands like 'Zahid owes me 50' as LOG_DEBT (type: GIVE_LOAN), 'I owe Imran 100' or 'borrowed 100 from Imran' as LOG_DEBT (type: TAKE_LOAN), 'Zahid paid back 50' as LOG_DEBT (type: RECEIVE_PAYMENT), 'Paid 20 to Imran' as LOG_DEBT (type: MAKE_PAYMENT).\n" +
                "9. GET_DEBT_SUMMARY: requires no parameters. Interpret commands like 'who owes me money', 'what are my debts', 'active loans' as GET_DEBT_SUMMARY.\n" +
                "10. DELETE_TASK: requires parameter 'taskId' (number). Interpret commands like 'delete task 5', 'remove task 12' as DELETE_TASK.\n" +
                "11. GET_ACTIVE_TASKS: requires parameter 'status' (optional string: TODO, IN_PROGRESS, COMPLETED, CANCELLED). Interpret commands like 'what is on my todo list', 'show my tasks', 'completed tasks' as GET_ACTIVE_TASKS.\n" +
                "12. GET_HABIT_STATS: requires parameter 'title' (optional string). Interpret commands like 'streaks', 'habit stats', 'how am I doing with my workout' as GET_HABIT_STATS.\n" +
                "13. GET_TODAYS_HABITS: requires no parameters. Interpret commands like 'what habits do I have left today', 'my habits today' as GET_TODAYS_HABITS.\n" +
                "14. SEED_PRESET_PACK: requires parameter 'pack' (string: ISLAMIC, DEEP_WORK, CHRISTIAN, HINDU). Interpret commands like 'seed Islamic habits', 'load Deep Work habits' as SEED_PRESET_PACK.\n" +
                "15. UNKNOWN: if the input does not match any of the above.\n\n" +
                "Respond ONLY with a valid JSON object matching this schema:\n" +
                "{\n" +
                "  \"action\": \"LOG_EXPENSE | ADD_TASK | COMPLETE_TASK | LOG_HABIT | LOG_NOTE | GET_RECENT_NOTES | GET_SPENDING_SUMMARY | LOG_DEBT | GET_DEBT_SUMMARY | DELETE_TASK | GET_ACTIVE_TASKS | GET_HABIT_STATS | GET_TODAYS_HABITS | SEED_PRESET_PACK | UNKNOWN\",\n" +
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
            else if ("LOG_NOTE".equals(actionStr)) action = IntentAction.LOG_NOTE;
            else if ("GET_RECENT_NOTES".equals(actionStr)) action = IntentAction.GET_RECENT_NOTES;
            else if ("GET_SPENDING_SUMMARY".equals(actionStr)) action = IntentAction.GET_SPENDING_SUMMARY;
            else if ("LOG_DEBT".equals(actionStr)) action = IntentAction.LOG_DEBT;
            else if ("GET_DEBT_SUMMARY".equals(actionStr)) action = IntentAction.GET_DEBT_SUMMARY;
            else if ("DELETE_TASK".equals(actionStr)) action = IntentAction.DELETE_TASK;
            else if ("GET_ACTIVE_TASKS".equals(actionStr)) action = IntentAction.GET_ACTIVE_TASKS;
            else if ("GET_HABIT_STATS".equals(actionStr)) action = IntentAction.GET_HABIT_STATS;
            else if ("GET_TODAYS_HABITS".equals(actionStr)) action = IntentAction.GET_TODAYS_HABITS;
            else if ("SEED_PRESET_PACK".equals(actionStr)) action = IntentAction.SEED_PRESET_PACK;

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
                if (params.containsKey("content")) {
                    mappedParams.put("content", params.get("content").toString());
                }
                if (params.containsKey("period")) {
                    mappedParams.put("period", params.get("period").toString());
                }
                if (params.containsKey("personName")) {
                    mappedParams.put("personName", params.get("personName").toString());
                }
                if (params.containsKey("type")) {
                    mappedParams.put("type", params.get("type").toString());
                }
                if (params.containsKey("priority")) {
                    mappedParams.put("priority", params.get("priority").toString());
                }
                if (params.containsKey("status")) {
                    mappedParams.put("status", params.get("status").toString());
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

    private Map<String, Object> executeIntentDirectly(Long userId, ParsedIntent intent) {
        try {
            switch (intent.getAction()) {
                case CHECK_BALANCE: {
                    List<Wallet> wallets = walletRepository.findByUserId(userId);
                    if (wallets.isEmpty()) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", "💰 You don't have any wallets set up yet!",
                                "context", "WELCOME"
                        );
                    }
                    StringBuilder sb = new StringBuilder("💰 **Your Active Wallet Balances:**\n");
                    for (Wallet w : wallets) {
                        sb.append(String.format("• %s: ₹%s %s\n", w.getName(), w.getBalance() != null ? w.getBalance() : "0.00", w.getCurrency()));
                    }
                    return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", sb.toString(),
                                "context", "WELCOME"
                    );
                }

                case LOG_EXPENSE: {
                    BigDecimal amount = (BigDecimal) intent.getParameters().get("amount");
                    String category = (String) intent.getParameters().get("category");

                    if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", "⚠️ Please specify a valid positive amount for your expense (e.g. spent 50 or log expense 12.50).",
                                "context", "WELCOME"
                        );
                    }

                    List<Wallet> wallets = walletRepository.findByUserId(userId);
                    Long walletId;
                    if (wallets.isEmpty()) {
                        Wallet newWallet = walletRepository.save(Wallet.builder()
                                .userId(userId)
                                .name("Personal Cash")
                                .currency("INR")
                                .balance(BigDecimal.ZERO)
                                .build());
                        walletId = newWallet.getId();
                    } else {
                        walletId = wallets.get(0).getId();
                    }

                    Wallet wallet = walletRepository.findByIdAndUserId(walletId, userId).orElse(null);
                    if (wallet == null) {
                        throw new IllegalArgumentException("Wallet not found");
                    }
                    wallet.setBalance(wallet.getBalance().subtract(amount));
                    walletRepository.save(wallet);

                    Transaction transaction = Transaction.builder()
                            .walletId(wallet.getId())
                            .transactionType(TransactionType.EXPENSE)
                            .amount(amount)
                            .category(category)
                            .description("Logged via Ask Naqash intent shortcut")
                            .build();

                    Transaction savedTransaction = transactionRepository.save(transaction);

                    return Map.of(
                            "status", "SUCCESS",
                            "type", "receipt",
                            "text", String.format("⚡ **Transaction Logged!** Spent ₹%s on %s.", amount, category),
                            "context", "WELCOME",
                            "data", Map.of(
                                    "transaction", savedTransaction,
                                    "updatedWalletBalance", wallet.getBalance()
                            )
                    );
                }

                case ADD_TASK: {
                    String title = (String) intent.getParameters().get("title");
                    if (title == null || title.trim().isBlank()) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", "⚠️ Please specify a valid title for the task (e.g. add Buy milk).",
                                "context", "WELCOME"
                        );
                    }
                    String priorityStr = (String) intent.getParameters().getOrDefault("priority", "MEDIUM");
                    TaskPriority priority = TaskPriority.MEDIUM;
                    try {
                        priority = TaskPriority.valueOf(priorityStr.toUpperCase().trim());
                    } catch (Exception ignored) {}

                    Task task = Task.builder()
                            .userId(userId)
                            .title(title)
                            .priority(priority)
                            .category("General")
                            .status(TaskStatus.TODO)
                            .description("Created via Ask Naqash intent shortcut")
                            .build();
                    taskRepository.save(task);

                    return Map.of(
                            "status", "SUCCESS",
                            "type", "text",
                            "text", String.format("⚡ **Task Created!** Created %s priority task: \"%s\" (ID: %s)", task.getPriority(), task.getTitle(), task.getId()),
                            "context", "WELCOME",
                            "data", task
                    );
                }

                case MARK_TASK_COMPLETE: {
                    Long taskId = (Long) intent.getParameters().get("taskId");
                    if (taskId == null || taskId <= 0) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", "⚠️ Please specify a valid task ID (e.g. done task 5).",
                                "context", "WELCOME"
                        );
                    }
                    Task task = taskRepository.findByIdAndUserId(taskId, userId).orElse(null);
                    if (task == null) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", String.format("⚠️ Task #%s was not found.", taskId),
                                "context", "WELCOME"
                        );
                    }
                    task.setStatus(TaskStatus.COMPLETED);
                    taskRepository.save(task);

                    return Map.of(
                            "status", "SUCCESS",
                            "type", "text",
                            "text", String.format("⚡ **Task Completed!** Marked task #%s (\"%s\") as completed.", taskId, task.getTitle()),
                            "context", "WELCOME",
                            "data", task
                    );
                }

                case LOG_HABIT: {
                    String title = (String) intent.getParameters().get("title");
                    List<HabitContract> habits = habitContractRepository.findByUserId(userId);
                    HabitContract matchedHabit = null;
                    for (HabitContract h : habits) {
                        if (h.getTitle().equalsIgnoreCase(title) || h.getTitle().toLowerCase().contains(title.toLowerCase())) {
                            matchedHabit = h;
                            break;
                        }
                    }

                    if (matchedHabit == null) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", String.format("❌ Could not find a habit matching \"%s\". Make sure it matches one of your active habits.", title),
                                "context", "WELCOME"
                        );
                    }

                    Map<String, Object> logResult = routineService.logHabit(userId, matchedHabit.getTitle(), "WEB_DASHBOARD", "Logged via Ask Naqash intent shortcut");

                    return Map.of(
                            "status", "SUCCESS",
                            "type", "text",
                            "text", String.format("⚡ **Habit Logged!** Completed habit \"%s\" successfully.", matchedHabit.getTitle()),
                            "context", "WELCOME",
                            "data", logResult
                    );
                }

                case LOG_NOTE: {
                    String content = (String) intent.getParameters().get("content");
                    String title = (String) intent.getParameters().get("title");

                    if (content == null || content.trim().isBlank()) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", "⚠️ Please specify some text content for your note.",
                                "context", "WELCOME"
                        );
                    }

                    if (title == null || title.trim().isBlank()) {
                        title = content.length() > 25 ? content.substring(0, 22) + "..." : content;
                    }

                    Note note = Note.builder()
                            .userId(userId)
                            .title(title)
                            .content(content)
                            .category("GENERAL")
                            .isPinned(false)
                            .isEncrypted(false)
                            .build();
                    noteRepository.save(note);

                    return Map.of(
                            "status", "SUCCESS",
                            "type", "text",
                            "text", String.format("⚡ **Note Saved!** Saved note: \"%s\" (ID: %s)", note.getTitle(), note.getId()),
                            "context", "WELCOME",
                            "data", note
                    );
                }

                case GET_RECENT_NOTES: {
                    List<Note> notes = noteRepository.findByUserIdOrderByIsPinnedDescCreatedAtDesc(userId);
                    if (notes.isEmpty()) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", "📋 You don't have any notes saved yet! Use `note: [text]` to create one.",
                                "context", "WELCOME"
                        );
                    }
                    StringBuilder sb = new StringBuilder("📋 **Your Recent Notes:**\n\n");
                    for (Note n : notes) {
                        sb.append(String.format("• <b>%s</b>: %s\n", n.getTitle(), n.getContent()));
                    }
                    return Map.of(
                            "status", "SUCCESS",
                            "type", "text",
                            "text", sb.toString(),
                            "context", "WELCOME",
                            "data", notes
                    );
                }

                case GET_SPENDING_SUMMARY: {
                    List<Wallet> wallets = walletRepository.findByUserId(userId);
                    List<Long> walletIds = wallets.stream().map(Wallet::getId).toList();
                    List<Transaction> txs = transactionRepository.findByWalletIdInOrderByCreatedAtDesc(walletIds);
                    String period = (String) intent.getParameters().getOrDefault("period", "month");

                    BigDecimal total = BigDecimal.ZERO;
                    ZonedDateTime cutoff = "week".equalsIgnoreCase(period)
                            ? ZonedDateTime.now().minusWeeks(1)
                            : ZonedDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

                    for (Transaction tx : txs) {
                        if (tx.getTransactionType() == TransactionType.EXPENSE) {
                            if (tx.getCreatedAt().isAfter(cutoff)) {
                                total = total.add(tx.getAmount());
                            }
                        }
                    }

                    String durationText = "week".equalsIgnoreCase(period) ? "last 7 days" : "this calendar month";
                    return Map.of(
                            "status", "SUCCESS",
                            "type", "text",
                            "text", String.format("💵 **Spending Summary:**\nYour total expenses for **%s** is **₹%s**.", durationText, total),
                            "context", "WELCOME",
                            "data", txs
                    );
                }

                case LOG_DEBT: {
                    String personName = (String) intent.getParameters().get("personName");
                    if (personName != null) {
                        personName = capitalizeName(personName);
                    }
                    BigDecimal amount = (BigDecimal) intent.getParameters().get("amount");
                    String type = (String) intent.getParameters().get("type"); // GIVE_LOAN, TAKE_LOAN, RECEIVE_PAYMENT, MAKE_PAYMENT

                    if (personName == null || amount == null || type == null) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", "⚠️ Incomplete debt command. Please specify name, amount, and if they owe you or you owe them.",
                                "context", "WELCOME"
                        );
                    }

                    if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", "⚠️ Amount must be greater than zero.",
                                "context", "WELCOME"
                        );
                    }

                    final String finalName = personName;
                    Person person = personRepository.findByUserIdAndNameIgnoreCase(userId, personName)
                            .stream().findFirst()
                            .orElseGet(() -> personRepository.save(Person.builder()
                                    .userId(userId)
                                    .name(finalName)
                                    .build()));

                    DebtType debtType = DebtType.GIVE_LOAN;
                    try {
                        debtType = DebtType.valueOf(type.toUpperCase());
                    } catch (Exception ignored) {}

                    DebtRecord record = DebtRecord.builder()
                            .userId(userId)
                            .personId(person.getId())
                            .personName(person.getName())
                            .amount(amount)
                            .paidAmount(BigDecimal.ZERO)
                            .debtType(debtType)
                            .status(DebtStatus.PAID)
                            .build();

                    debtRecordRepository.save(record);

                    String actionText = "";
                    if (debtType == DebtType.GIVE_LOAN) {
                        actionText = String.format("Recorded that **%s** owes you **₹%s**.", personName, amount);
                    } else if (debtType == DebtType.TAKE_LOAN) {
                        actionText = String.format("Recorded that you owe **%s** **₹%s**.", personName, amount);
                    } else if (debtType == DebtType.RECEIVE_PAYMENT) {
                        actionText = String.format("Recorded repayment of **₹%s** received from **%s**.", amount, personName);
                    } else if (debtType == DebtType.MAKE_PAYMENT) {
                        actionText = String.format("Recorded payment of **₹%s** made to **%s**.", amount, personName);
                    }

                    return Map.of(
                            "status", "SUCCESS",
                            "type", "text",
                            "text", "⚡ **Debt Ledger Updated!** " + actionText,
                            "context", "WELCOME",
                            "data", record
                    );
                }

                case GET_DEBT_SUMMARY: {
                    List<DebtRecord> records = debtRecordRepository.findByUserIdOrderByCreatedAtAsc(userId);
                    if (records.isEmpty()) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", "🤝 You don't have any active debts or loans logged!",
                                "context", "WELCOME"
                        );
                    }

                    Map<String, BigDecimal> netBalances = new HashMap<>();
                    for (DebtRecord record : records) {
                        if (record.getStatus() == DebtStatus.PAID) {
                            continue; // skip settled records
                        }

                        String name = record.getPersonName();
                        if (name == null || name.isBlank()) {
                            continue;
                        }
                        name = capitalizeName(name);

                        BigDecimal remaining = record.getAmount().subtract(record.getPaidAmount());
                        if (record.getDebtType() == DebtType.DEBIT) {
                            remaining = remaining.negate();
                        }

                        netBalances.put(name, netBalances.getOrDefault(name, BigDecimal.ZERO).add(remaining));
                    }

                    if (netBalances.isEmpty()) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", "🤝 All your logged debts and loans are fully paid and settled!",
                                "context", "WELCOME"
                        );
                    }

                    StringBuilder sb = new StringBuilder("🤝 **Your Interpersonal Debt Summary:**\n\n");
                    BigDecimal totalIwe = BigDecimal.ZERO;
                    BigDecimal totalTheyOwe = BigDecimal.ZERO;

                    for (Map.Entry<String, BigDecimal> entry : netBalances.entrySet()) {
                        BigDecimal bal = entry.getValue();
                        if (bal.compareTo(BigDecimal.ZERO) > 0) {
                            sb.append(String.format("• **%s** owes you: **₹%s**\n", entry.getKey(), bal));
                            totalTheyOwe = totalTheyOwe.add(bal);
                        } else if (bal.compareTo(BigDecimal.ZERO) < 0) {
                            sb.append(String.format("• You owe **%s**: **₹%s**\n", entry.getKey(), bal.negate()));
                            totalIwe = totalIwe.add(bal.negate());
                        }
                    }

                    sb.append(String.format("\n💰 **Totals:**\n• Total owed to you: **₹%s**\n• Total you owe others: **₹%s**", totalTheyOwe, totalIwe));

                    return Map.of(
                            "status", "SUCCESS",
                            "type", "text",
                            "text", sb.toString(),
                            "context", "WELCOME",
                            "data", records
                    );
                }

                case DELETE_TASK: {
                    Long taskId = (Long) intent.getParameters().get("taskId");
                    if (taskId == null) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", "⚠️ Please specify a valid task ID number to delete (e.g. delete task 5).",
                                "context", "WELCOME"
                        );
                    }
                    Task task = taskRepository.findByIdAndUserId(taskId, userId).orElse(null);
                    if (task == null) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", String.format("⚠️ Task #%s was not found or could not be deleted.", taskId),
                                "context", "WELCOME"
                        );
                    }
                    taskRepository.delete(task);
                    return Map.of(
                            "status", "SUCCESS",
                            "type", "text",
                            "text", String.format("🗑️ **Task Deleted!** Removed task #%s successfully.", taskId),
                            "context", "WELCOME"
                    );
                }

                case GET_ACTIVE_TASKS: {
                    String statusStr = (String) intent.getParameters().get("status");
                    TaskStatus status = null;
                    if (statusStr != null) {
                        try {
                            status = TaskStatus.valueOf(statusStr);
                        } catch (Exception ignored) {}
                    }

                    List<Task> tasks;
                    if (status != null) {
                        tasks = taskRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
                    } else {
                        tasks = taskRepository.findByUserIdOrderByCreatedAtDesc(userId);
                    }

                    List<Task> displayList = new ArrayList<>();
                    for (Task t : tasks) {
                        if (status != null) {
                            displayList.add(t);
                        } else {
                            if (t.getStatus() == TaskStatus.TODO || t.getStatus() == TaskStatus.IN_PROGRESS) {
                                displayList.add(t);
                            }
                        }
                    }

                    String titleText = "📋 **Your TODO Tasks:**\n";
                    if (status != null) {
                        titleText = String.format("📋 **Your %s Tasks:**\n", status);
                    }

                    return Map.of(
                            "status", "SUCCESS",
                            "type", "task_list",
                            "text", displayList.isEmpty() ? "🎉 No tasks match this criteria!" : titleText,
                            "context", "WELCOME",
                            "data", displayList
                    );
                }

                case GET_HABIT_STATS: {
                    List<HabitContract> habits = habitContractRepository.findByUserId(userId);
                    if (habits.isEmpty()) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", "🧘 You don't have any habits configured yet!",
                                "context", "WELCOME"
                        );
                    }

                    String queryName = (String) intent.getParameters().get("habitName");
                    if (queryName != null && !queryName.isBlank()) {
                        HabitContract matched = null;
                        for (HabitContract h : habits) {
                            if (h.getTitle().equalsIgnoreCase(queryName) || h.getTitle().toLowerCase().contains(queryName.toLowerCase())) {
                                matched = h;
                                break;
                            }
                        }
                        if (matched == null) {
                            return Map.of(
                                    "status", "SUCCESS",
                                    "type", "text",
                                    "text", String.format("⚠️ Could not find a habit matching \"%s\".", queryName),
                                    "context", "WELCOME"
                            );
                        }
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", String.format("📊 **Consistency Check: \"%s\"**\n\n" +
                                        "🔥 **Streak**: %s days\n" +
                                        "🏷️ **Category**: %s\n" +
                                        "⚡ **Longest Streak**: %s days\n" +
                                        "❄️ **Freeze Passes**: %s available", 
                                        matched.getTitle(), 
                                        matched.getCurrentStreak() != null ? matched.getCurrentStreak() : 0,
                                        matched.getCategory() != null ? matched.getCategory() : "General",
                                        matched.getLongestStreak() != null ? matched.getLongestStreak() : 0,
                                        matched.getFreezePassesAvailable() != null ? matched.getFreezePassesAvailable() : 0),
                                "context", "WELCOME",
                                "data", matched
                        );
                    }

                    StringBuilder sb = new StringBuilder("🧘 **Your Habits Streaks & Stats:**\n\n");
                    for (HabitContract h : habits) {
                        sb.append(String.format("• **%s**: 🔥 %s days streak (Best: %s)\n", 
                                h.getTitle(), 
                                h.getCurrentStreak() != null ? h.getCurrentStreak() : 0,
                                h.getLongestStreak() != null ? h.getLongestStreak() : 0));
                    }
                    return Map.of(
                            "status", "SUCCESS",
                            "type", "text",
                            "text", sb.toString(),
                            "context", "WELCOME",
                            "data", habits
                    );
                }

                case GET_TODAYS_HABITS: {
                    List<HabitContract> habits = habitContractRepository.findByUserId(userId);
                    List<HabitContract> remaining = new ArrayList<>();
                    for (HabitContract h : habits) {
                        if (h.getLastCompletedDate() == null || !h.getLastCompletedDate().equals(java.time.LocalDate.now())) {
                            remaining.add(h);
                        }
                    }

                    if (remaining.isEmpty()) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", "🎉 **Amazing!** You have completed all your habits for today! Keep up the consistency! 🚀",
                                "context", "WELCOME"
                        );
                    }

                    StringBuilder sb = new StringBuilder("🧘 **Your Remaining Habits for Today:**\n\n");
                    for (HabitContract h : remaining) {
                        sb.append(String.format("• **%s** (%s) [🔥 %s day streak]\n", 
                                h.getTitle(), 
                                h.getCategory().toLowerCase(),
                                h.getCurrentStreak() != null ? h.getCurrentStreak() : 0));
                    }
                    return Map.of(
                            "status", "SUCCESS",
                            "type", "text",
                            "text", sb.toString(),
                            "context", "WELCOME",
                            "data", remaining
                    );
                }

                case SEED_PRESET_PACK: {
                    String pack = (String) intent.getParameters().get("pack");
                    if (pack == null || pack.isBlank()) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", "⚠️ Please specify a valid preset pack to seed (e.g. seed Islamic habits or seed Deep Work habits).",
                                "context", "WELCOME"
                        );
                    }
                    
                    String normalizedPack = pack.toUpperCase().trim();
                    if (!"ISLAMIC".equals(normalizedPack) && !"DEEP_WORK".equals(normalizedPack) && !"CHRISTIAN".equals(normalizedPack) && !"HINDU".equals(normalizedPack)) {
                        return Map.of(
                                "status", "SUCCESS",
                                "type", "text",
                                "text", "⚠️ Unsupported preset pack. Available options: `ISLAMIC`, `DEEP_WORK`, `CHRISTIAN`, `HINDU`.",
                                "context", "WELCOME"
                        );
                    }

                    routineService.createRoutineFromPreset(userId, normalizedPack + " Routine", normalizedPack, "MON,TUE,WED,THU,FRI,SAT,SUN");
                    List<HabitContract> seeded = habitContractRepository.findByUserId(userId);

                    StringBuilder sb = new StringBuilder(String.format("⚡ **Preset Pack '%s' Seeded!**\n\n", normalizedPack));
                    sb.append("Seeded starter habits and set up corresponding routine time blocks:\n\n");
                    for (HabitContract h : seeded) {
                        sb.append(String.format("• **%s** (%s)\n", h.getTitle(), h.getCategory().toLowerCase()));
                    }
                    return Map.of(
                            "status", "SUCCESS",
                            "type", "text",
                            "text", sb.toString(),
                            "context", "WELCOME",
                            "data", seeded
                    );
                }

                case HELP: {
                    return Map.of(
                            "status", "SUCCESS",
                            "type", "text",
                            "text", "🌿 **Ask Naqash Intent Command Guide** 🤖\n\n" +
                                  "You can type commands directly instead of navigating menus:\n\n" +
                                  "💵 **Log Expense**: `spent 45 food`, `-50 bills`, `spent ₹15 shopping`\n" +
                                  "📋 **Add Task**: `add Buy milk`, `add high priority task deploy backend`\n" +
                                  "📋 **View Tasks**: `show my tasks`, `tasks completed`\n" +
                                  "🗑️ **Delete Task**: `delete task 12`\n" +
                                  "🎯 **Complete Task**: `done task 12`, `complete 5`\n" +
                                  "🧘 **Log Habit**: `done habit meditation`, `completed workout`\n" +
                                  "🧘 **Habit Stats**: `streaks`, `habit stats`, `consistency Fajr`\n" +
                                  "🧘 **Seed Preset**: `seed Islamic habits`, `load Deep Work habits`\n" +
                                  "💰 **Check Balance**: `balance`, `wallets`\n\n" +
                                  "Type `cancel` or `menu` at any time to return.",
                            "context", "WELCOME"
                    );
                }

                default:
                    return Map.of(
                            "status", "SUCCESS",
                            "type", "text",
                            "text", "⚠️ Unrecognized AI parsed action.",
                            "context", "WELCOME"
                    );
            }
        } catch (Exception e) {
            log.error("Failed to execute direct intent action", e);
            return Map.of(
                    "status", "SUCCESS",
                    "type", "text",
                    "text", "⚠️ Failsafe: Failed to execute intent: " + e.getMessage(),
                    "context", "WELCOME"
            );
        }
    }

    private String capitalizeName(String name) {
        if (name == null || name.isBlank()) return "";
        String[] words = name.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (w.length() > 0) {
                sb.append(Character.toUpperCase(w.charAt(0)))
                  .append(w.substring(1).toLowerCase())
                  .append(" ");
            }
        }
        return sb.toString().trim();
    }

    private Map<String, Object> handleWelcomeSelection(Long userId, String choice) {
        return switch (choice.toUpperCase()) {
            case "LOG_EXPENSE" -> Map.of(
                    "status", "SUCCESS",
                    "type", "options",
                    "text", "💵 Understood! How much did you spend?",
                    "context", "AWAITING_EXPENSE_AMOUNT",
                    "data", Map.of("chips", List.of("5.00", "10.00", "20.00", "50.00"))
            );

            case "MANAGE_TASKS" -> Map.of(
                    "status", "SUCCESS",
                    "type", "options",
                    "text", "📋 How would you like to manage your tasks today?",
                    "context", "AWAITING_TASK_ACTION",
                    "data", Map.of("options", List.of(
                            Map.of("label", "🔍 View Active Tasks", "value", "VIEW_ACTIVE_TASKS"),
                            Map.of("label", "➕ Add New Task", "value", "ADD_TASK")
                    ))
            );

            case "LOG_HABIT" -> {
                List<HabitContract> habits = habitContractRepository.findByUserId(userId);
                if (habits.isEmpty()) {
                    yield Map.of(
                            "status", "SUCCESS",
                            "type", "text",
                            "text", "You don't have any habits configured yet! Go to the **Routine** dashboard page to create one.",
                            "context", "WELCOME",
                            "data", Map.of()
                    );
                }
                
                List<Map<String, String>> habitOptions = new ArrayList<>();
                for (HabitContract h : habits) {
                    habitOptions.add(Map.of("label", h.getTitle(), "value", String.valueOf(h.getId())));
                }

                yield Map.of(
                        "status", "SUCCESS",
                        "type", "options",
                        "text", "🧘 Which habit did you complete today?",
                        "context", "AWAITING_HABIT_SELECT",
                        "data", Map.of("options", habitOptions)
                );
            }

            default -> getWelcomeMenu("Please select one of the core options below:");
        };
    }

    private Map<String, Object> handleExpenseAmount(Long userId, String message) {
        BigDecimal amount;
        try {
            amount = new BigDecimal(message.replaceAll("[₹$]", "").trim());
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new NumberFormatException();
            }
        } catch (NumberFormatException e) {
            return Map.of(
                    "status", "SUCCESS",
                    "type", "options",
                    "text", "❌ Please enter a valid positive numeric amount (e.g. 15.50 or 50):",
                    "context", "AWAITING_EXPENSE_AMOUNT",
                    "data", Map.of("chips", List.of("5.00", "10.00", "20.00", "50.00"))
            );
        }

        List<Wallet> wallets = walletRepository.findByUserId(userId);
        Long targetWalletId;
        if (wallets.isEmpty()) {
            Wallet newWallet = walletRepository.save(Wallet.builder()
                    .userId(userId)
                    .name("Personal Cash")
                    .currency("INR")
                    .balance(BigDecimal.ZERO)
                    .build());
            targetWalletId = newWallet.getId();
        } else {
            targetWalletId = wallets.get(0).getId();
        }

        List<String> categories = List.of("Food", "Transport", "Groceries", "Shopping", "Entertainment", "Bills");
        List<Map<String, String>> catOptions = new ArrayList<>();
        for (String cat : categories) {
            catOptions.add(Map.of("label", cat, "value", cat));
        }

        return Map.of(
                "status", "SUCCESS",
                "type", "options",
                "text", String.format("What category was the expense of ₹%s for?", amount),
                "context", "AWAITING_EXPENSE_CATEGORY",
                "data", Map.of(
                        "options", catOptions,
                        "meta", Map.of("amount", amount, "walletId", targetWalletId)
                )
        );
    }

    private Map<String, Object> handleExpenseCategory(Long userId, String message, Map<String, Object> meta) {
        BigDecimal amount = new BigDecimal(String.valueOf(meta.get("amount")));
        Long walletId = Long.parseLong(String.valueOf(meta.get("walletId")));
        String category = message;

        Wallet wallet = walletRepository.findByIdAndUserId(walletId, userId).orElse(null);
        if (wallet == null) {
            throw new IllegalArgumentException("Wallet not found");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        Transaction transaction = Transaction.builder()
                .walletId(wallet.getId())
                .transactionType(TransactionType.EXPENSE)
                .amount(amount)
                .category(category)
                .description("Logged via Ask Naqash bot helper")
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        return Map.of(
                "status", "SUCCESS",
                "type", "receipt",
                "text", String.format("Done! Logged expense of ₹%s under category '%s'.", amount, category),
                "context", "WELCOME",
                "data", Map.of(
                        "transaction", savedTransaction,
                        "updatedWalletBalance", wallet.getBalance()
                )
        );
    }

    private Map<String, Object> handleTaskAction(Long userId, String choice) {
        if (choice.toUpperCase().equals("VIEW_ACTIVE_TASKS")) {
            List<Task> tasks = taskRepository.findByUserIdOrderByCreatedAtDesc(userId);
            
            List<Task> activeTasks = new ArrayList<>();
            for (Task t : tasks) {
                if (t.getStatus() == TaskStatus.TODO || t.getStatus() == TaskStatus.IN_PROGRESS) {
                    activeTasks.add(t);
                }
            }

            return Map.of(
                    "status", "SUCCESS",
                    "type", "task_list",
                    "text", activeTasks.isEmpty() ? "🎉 You have no active tasks right now!" : "Here are your active TODO tasks:",
                    "context", "WELCOME",
                    "data", activeTasks
            );
        } else if (choice.toUpperCase().equals("ADD_TASK")) {
            return Map.of(
                    "status", "SUCCESS",
                    "type", "text",
                    "text", "📋 Please type the title of the task you want to create:",
                    "context", "AWAITING_TASK_TITLE",
                    "data", Map.of()
            );
        }

        return getWelcomeMenu("Please select one of the task options below:");
    }

    private Map<String, Object> handleTaskTitle(String message) {
        if (message.isBlank()) {
            return Map.of(
                    "status", "SUCCESS",
                    "type", "text",
                    "text", "❌ Task title cannot be blank. Please enter a task title:",
                    "context", "AWAITING_TASK_TITLE",
                    "data", Map.of()
            );
        }

        List<Map<String, String>> priorityOptions = List.of(
            Map.of("label", "🔴 High Priority", "value", "HIGH"),
            Map.of("label", "🟡 Medium Priority", "value", "MEDIUM"),
            Map.of("label", "🟢 Low Priority", "value", "LOW")
        );

        return Map.of(
                "status", "SUCCESS",
                "type", "options",
                "text", String.format("What priority should we set for '%s'?", message),
                "context", "AWAITING_TASK_PRIORITY",
                "data", Map.of(
                        "options", priorityOptions,
                        "meta", Map.of("title", message)
                )
        );
    }

    private Map<String, Object> handleTaskPriority(Long userId, String message, Map<String, Object> meta) {
        String title = String.valueOf(meta.get("title"));
        String priorityStr = message.toUpperCase();
        TaskPriority priority = TaskPriority.MEDIUM;
        try {
            priority = TaskPriority.valueOf(priorityStr);
        } catch (IllegalArgumentException e) {
            // fallback
        }

        Task task = Task.builder()
                .userId(userId)
                .title(title)
                .priority(priority)
                .category("General")
                .status(TaskStatus.TODO)
                .description("Created via Ask Naqash web companion")
                .build();

        taskRepository.save(task);

        return Map.of(
                "status", "SUCCESS",
                "type", "text",
                "text", String.format("Successfully created task '%s' with %s priority! 📋", title, priority),
                "context", "WELCOME",
                "data", task
        );
    }

    private Map<String, Object> handleHabitSelect(Long userId, String message) {
        Long habitId;
        try {
            habitId = Long.parseLong(message);
        } catch (NumberFormatException e) {
            return handleWelcomeSelection(userId, "LOG_HABIT"); // Back to habit selection options
        }

        HabitContract habit = habitContractRepository.findById(habitId).orElse(null);
        if (habit == null || !habit.getUserId().equals(userId)) {
            return getWelcomeMenu("❌ Matched habit could not be found or verified.");
        }

        routineService.logHabit(userId, habit.getTitle(), "WEB_DASHBOARD", "Logged via Ask Naqash");

        return Map.of(
                "status", "SUCCESS",
                "type", "text",
                "text", "Awesome job! Habit completion logged. Keep the streak alive! 🔥",
                "context", "WELCOME",
                "data", Map.of()
        );
    }

    private boolean isCancelCommand(String msg) {
        if (msg == null) return false;
        String clean = msg.trim().toLowerCase();
        return clean.equals("cancel") || clean.equals("exit") || clean.equals("restart") || clean.equals("start over") || clean.equals("clear");
    }

    private Map<String, Object> getWelcomeMenu(String text) {
        return Map.of(
                "status", "SUCCESS",
                "type", "options",
                "text", text,
                "context", "WELCOME",
                "data", Map.of(
                        "options", List.of(
                                Map.of("label", "💵 Log Expense", "value", "LOG_EXPENSE"),
                                Map.of("label", "📋 Manage Tasks", "value", "MANAGE_TASKS"),
                                Map.of("label", "🧘 Log Habit Completion", "value", "LOG_HABIT")
                        )
                )
        );
    }
}
