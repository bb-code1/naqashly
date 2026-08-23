package com.naqashly.monolith.bot.service;

import com.naqashly.monolith.finance.entity.Transaction;
import com.naqashly.monolith.finance.entity.TransactionType;
import com.naqashly.monolith.finance.entity.Wallet;
import com.naqashly.monolith.finance.repository.TransactionRepository;
import com.naqashly.monolith.finance.repository.WalletRepository;
import com.naqashly.monolith.productivity.entity.Task;
import com.naqashly.monolith.productivity.entity.TaskPriority;
import com.naqashly.monolith.productivity.entity.TaskStatus;
import com.naqashly.monolith.productivity.repository.TaskRepository;
import com.naqashly.monolith.routine.entity.HabitContract;
import com.naqashly.monolith.routine.repository.HabitContractRepository;
import com.naqashly.monolith.routine.service.RoutineService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

/**
 * <h1>Ask Naqash Conversational Bot Engine</h1>
 * 
 * <p><b>WHAT:</b> State machine orchestrating guided conversational steps for the Ask Naqash widget in the monolith.</p>
 */
@Slf4j
@Service
public class BotEngineService {

    private final RoutineService routineService;
    private final HabitContractRepository habitContractRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final TaskRepository taskRepository;

    public BotEngineService(RoutineService routineService,
                            HabitContractRepository habitContractRepository,
                            WalletRepository walletRepository,
                            TransactionRepository transactionRepository,
                            TaskRepository taskRepository) {
        this.routineService = routineService;
        this.habitContractRepository = habitContractRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.taskRepository = taskRepository;
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

    private boolean isCancelCommand(String msg) {
        String cleaned = msg.toLowerCase();
        return cleaned.equals("cancel") || cleaned.equals("exit") || cleaned.equals("nevermind") || cleaned.equals("stop") || cleaned.equals("restart");
    }

    private Map<String, Object> getWelcomeMenu(String greetingText) {
        List<Map<String, String>> welcomeOptions = List.of(
            Map.of("label", "💵 Log an Expense", "value", "LOG_EXPENSE"),
            Map.of("label", "📋 Manage Tasks", "value", "MANAGE_TASKS"),
            Map.of("label", "🧘 Log Completed Habit", "value", "LOG_HABIT")
        );

        return Map.of(
                "status", "SUCCESS",
                "type", "options",
                "text", greetingText,
                "context", "WELCOME",
                "data", Map.of("options", welcomeOptions)
        );
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

        // Check user wallets
        List<Wallet> wallets = walletRepository.findByUserId(userId);
        Long targetWalletId;
        if (wallets.isEmpty()) {
            // Provision default wallet
            Wallet newWallet = walletRepository.save(Wallet.builder()
                    .userId(userId)
                    .name("Personal Cash")
                    .currency("INR")
                    .balance(BigDecimal.ZERO)
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

        // Adjust wallet balance
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
            
            // Filter only TODO/IN_PROGRESS tasks
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
}
