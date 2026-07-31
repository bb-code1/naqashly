package com.naqashly.bot.service;

import com.naqashly.bot.client.FinanceClient;
import com.naqashly.bot.client.ProductivityClient;
import com.naqashly.bot.client.RoutineClient;
import com.naqashly.bot.model.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

/**
 * <h1>BotChatService</h1>
 * 
 * <p><b>WHAT:</b> State machine orchestrating guided conversational steps for the Ask Naqash widget.</p>
 * <p><b>WHY:</b> Keeps the microservice stateless by parsing incoming step context and executing mutations via Feign Clients.</p>
 */
@Service
public class BotChatService {

    private final ProductivityClient productivityClient;
    private final FinanceClient financeClient;
    private final RoutineClient routineClient;

    public BotChatService(ProductivityClient productivityClient,
                          FinanceClient financeClient,
                          RoutineClient routineClient) {
        this.productivityClient = productivityClient;
        this.financeClient = financeClient;
        this.routineClient = routineClient;
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
            e.printStackTrace();
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
}
