package com.naqashly.bot.parser;

import com.naqashly.bot.model.BotMessageEvent;
import com.naqashly.bot.model.IntentAction;
import com.naqashly.bot.model.ParsedIntent;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * <h1>Natural Command Text Intent Parser Engine</h1>
 * 
 * <p><b>WHAT:</b> High-performance regular expression intent classification engine converting raw chat text into structured microservice action commands.</p>
 * <p><b>WHY:</b> Classifies user intents deterministically without incurring external API or LLM token costs.</p>
 * <p><b>HOW:</b> Evaluates pre-compiled regular expression patterns for task completion, expense logging, task creation, balance checks, and help fallbacks.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see ParsedIntent
 * @see IntentAction
 */
@Component
public class IntentParser {

    /** Pattern 1: Mark Task Complete ("Done task 1", "/complete 2"). */
    private static final Pattern PATTERN_COMPLETE_TASK = Pattern.compile(
            "(?i)^(?:done|complete|finish|done task|complete task)\\s+(?:task\\s+)?(\\d+)$"
    );

    /** Pattern 2: Add Task ("Add task Buy milk", "/add Read book"). */
    private static final Pattern PATTERN_ADD_TASK = Pattern.compile(
            "(?i)^(?:add|create|new)\\s+(?:task\\s+)?(.+)$"
    );

    /** Pattern 3: Log Expense ("Spent $45 on groceries", "Add expense food 50", "-50 food"). */
    private static final Pattern PATTERN_LOG_EXPENSE_TRIGGER = Pattern.compile(
            "(?i)^(?:spent|expense|paid|add expense|new expense|create expense|-)\\s+(.+)$"
    );

    /** Pattern 4: Check Balance ("balance", "/wallets"). */
    private static final Pattern PATTERN_CHECK_BALANCE = Pattern.compile(
            "(?i)^(?:balance|wallets|money|/balance)$"
    );

    /** Pattern 5: Help Request ("help", "/help", "commands"). */
    private static final Pattern PATTERN_HELP = Pattern.compile(
            "(?i)^(?:help|commands|options|\\?|/help|/start)$"
    );

    /** Pattern 6: Log Habit ("Done meditation", "Completed morning prayer", "Habit workout"). */
    private static final Pattern PATTERN_LOG_HABIT = Pattern.compile(
            "(?i)^(?:done habit|habit|completed|finished)\\s+(.+)$"
    );

    /** Pattern 7: Log Note ("Note: buy milk", "Remember to call mom", "Journal today was great"). */
    private static final Pattern PATTERN_LOG_NOTE_TRIGGER = Pattern.compile(
            "(?i)^(?:note|memo|journal|log note|remember)[\\s:]+(.+)$"
    );

    /** Pattern 8: Get Recent Notes ("what are my notes", "show notes", "recent notes", "notes"). */
    private static final Pattern PATTERN_GET_RECENT_NOTES = Pattern.compile(
            "(?i)^(?:notes|show notes|recent notes|what are my notes|/notes)$"
    );

    /** Pattern 9: Get Spending Summary ("spending this month", "total spent"). */
    private static final Pattern PATTERN_GET_SPENDING_SUMMARY = Pattern.compile(
            "(?i)^(?:spent|spending|expenses|total spent)\\s*(?:this\\s+month|last\\s+week|month|week)?$"
    );

    /** Pattern 10: Log Debt - Lend ("Zahid owes me 50"). */
    private static final Pattern PATTERN_DEBT_LEND = Pattern.compile(
            "(?i)^([a-zA-Z]+)\\s+owes\\s+me\\s+\\$?(\\d+(?:\\.\\d+)?)$"
    );

    /** Pattern 11: Log Debt - Borrow ("I owe Imran 100"). */
    private static final Pattern PATTERN_DEBT_BORROW = Pattern.compile(
            "(?i)^I\\s+owe\\s+([a-zA-Z]+)\\s+\\$?(\\d+(?:\\.\\d+)?)$"
    );

    /** Pattern 12: Log Debt - Repay ("Zahid paid back 50"). */
    private static final Pattern PATTERN_DEBT_REPAY = Pattern.compile(
            "(?i)^([a-zA-Z]+)\\s+paid\\s+back\\s+\\$?(\\d+(?:\\.\\d+)?)$"
    );

    /** Pattern 13: Get Debt Summary ("who owes me money", "debts"). */
    private static final Pattern PATTERN_GET_DEBT_SUMMARY = Pattern.compile(
            "(?i)^(?:who\\s+owes\\s+me|my\\s+debts|active\\s+loans|debts|/debts)$"
    );

    /** Pattern 14: Delete Task ("delete task 5", "remove task 12"). */
    private static final Pattern PATTERN_DELETE_TASK = Pattern.compile(
            "(?i)^(?:delete|remove|clear)\\s+task\\s+(\\d+)$"
    );

    /** Pattern 15: Get Active Tasks list ("what is on my todo list", "show my tasks"). */
    private static final Pattern PATTERN_GET_ACTIVE_TASKS = Pattern.compile(
            "(?i)^(?:what\\s+is\\s+on\\s+my\\s+todo\\s+list|show\\s+my\\s+tasks|tasks|todo)(?:\\s+(completed|done|active|pending|in-progress|in\\s+progress))?$"
    );

    /** Pattern 16: Get Habit Stats/Streaks ("streaks", "habit stats"). */
    private static final Pattern PATTERN_GET_HABIT_STATS = Pattern.compile(
            "(?i)^(?:streaks|habit\\s+stats|consistency|how\\s+am\\s+I\\s+doing\\s+with\\s+my\\s+habits)(?:\\s+(.+))?$"
    );

    /** Pattern 17: Get Today's Remaining Habits ("what habits do I have left today", "habits"). */
    private static final Pattern PATTERN_GET_TODAYS_HABITS = Pattern.compile(
            "(?i)^(?:what\\s+habits\\s+do\\s+I\\s+have\\s+left\\s+today|my\\s+habits\\s+today|habits|remaining\\s+habits)$"
    );

    /** Pattern 18: Seed Habits Preset Pack ("seed Islamic habits", "load Deep Work habits"). */
    private static final Pattern PATTERN_SEED_PRESET_PACK = Pattern.compile(
            "(?i)^(?:seed|load|reset)\\s+(islamic|deep\\s+work|christian|hindu)\\s+habits$"
    );

    /**
     * Parse Normalized Message Event into Classified {@link ParsedIntent}.
     * 
     * @param event Normalized {@link BotMessageEvent}.
     * @return Classified {@link ParsedIntent} result DTO.
     */
    public ParsedIntent parse(BotMessageEvent event) {
        if (event == null || event.getTextContent() == null || event.getTextContent().isBlank()) {
            return buildUnknownIntent(event, "Empty or missing message body");
        }

        String text = event.getTextContent().trim();
        Map<String, Object> params = new HashMap<>();

        // 1. Evaluate Task Completion
        Matcher completeMatcher = PATTERN_COMPLETE_TASK.matcher(text);
        if (completeMatcher.matches()) {
            Long taskId = Long.parseLong(completeMatcher.group(1));
            params.put("taskId", taskId);
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.MARK_TASK_COMPLETE)
                    .parameters(params)
                    .explanation("Matched intent: Mark Task " + taskId + " Complete")
                    .build();
        }

        // 2. Evaluate Log Expense
        Matcher expenseTriggerMatcher = PATTERN_LOG_EXPENSE_TRIGGER.matcher(text);
        if (expenseTriggerMatcher.matches()) {
            String remaining = expenseTriggerMatcher.group(1).trim();
            // Find a decimal/integer amount (optionally prefixed with $)
            Pattern numberPattern = Pattern.compile("\\$?(\\d+(?:\\.\\d{1,2})?)");
            Matcher numberMatcher = numberPattern.matcher(remaining);
            if (numberMatcher.find()) {
                BigDecimal amount = new BigDecimal(numberMatcher.group(1));
                // Extract category by removing the matched amount substring
                String category = remaining.replace(numberMatcher.group(0), "").trim();
                // Strip common prepositions at the start (e.g. "on", "for")
                category = category.replaceAll("(?i)^\\s*(?:on|for|in)\\s+", "").trim();
                if (!category.isEmpty()) {
                    params.put("amount", amount);
                    params.put("category", category);
                    return ParsedIntent.builder()
                            .sourceEvent(event)
                            .action(IntentAction.LOG_EXPENSE)
                            .parameters(params)
                            .explanation("Matched intent: Log Expense $" + amount + " on " + category)
                            .build();
                }
            }
        }

        // 3. Evaluate Add Task
        Matcher addTaskMatcher = PATTERN_ADD_TASK.matcher(text);
        if (addTaskMatcher.matches()) {
            String matched = addTaskMatcher.group(1).trim();
            String priority = "MEDIUM";
            String title = matched;
            String lower = matched.toLowerCase();
            if (lower.startsWith("high priority task ")) {
                priority = "HIGH";
                title = matched.substring("high priority task ".length()).trim();
            } else if (lower.startsWith("low priority task ")) {
                priority = "LOW";
                title = matched.substring("low priority task ".length()).trim();
            } else if (lower.startsWith("medium priority task ")) {
                priority = "MEDIUM";
                title = matched.substring("medium priority task ".length()).trim();
            }
            params.put("title", title);
            params.put("priority", priority);
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.ADD_TASK)
                    .parameters(params)
                    .explanation("Matched intent: Create Task '" + title + "' with priority " + priority)
                    .build();
        }

        // 4. Evaluate Check Balance
        Matcher balanceMatcher = PATTERN_CHECK_BALANCE.matcher(text);
        if (balanceMatcher.matches()) {
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.CHECK_BALANCE)
                    .parameters(params)
                    .explanation("Matched intent: Check Wallet Balances")
                    .build();
        }

        // 5. Evaluate Log Habit
        Matcher habitMatcher = PATTERN_LOG_HABIT.matcher(text);
        if (habitMatcher.matches()) {
            String habitTitle = habitMatcher.group(1).trim();
            params.put("title", habitTitle);
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.LOG_HABIT)
                    .parameters(params)
                    .explanation("Matched intent: Log Habit '" + habitTitle + "'")
                    .build();
        }

        // 6. Evaluate Log Note
        Matcher logNoteMatcher = PATTERN_LOG_NOTE_TRIGGER.matcher(text);
        if (logNoteMatcher.matches()) {
            String content = logNoteMatcher.group(1).trim();
            params.put("content", content);
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.LOG_NOTE)
                    .parameters(params)
                    .explanation("Matched intent: Log Note")
                    .build();
        }

        // 7. Evaluate Get Recent Notes
        Matcher getNotesMatcher = PATTERN_GET_RECENT_NOTES.matcher(text);
        if (getNotesMatcher.matches()) {
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.GET_RECENT_NOTES)
                    .parameters(params)
                    .explanation("Matched intent: Get Recent Notes")
                    .build();
        }

        // 8. Evaluate Get Spending Summary
        Matcher spendingSummaryMatcher = PATTERN_GET_SPENDING_SUMMARY.matcher(text);
        if (spendingSummaryMatcher.matches()) {
            String period = "month";
            String lower = text.toLowerCase();
            if (lower.contains("week")) {
                period = "week";
            }
            params.put("period", period);
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.GET_SPENDING_SUMMARY)
                    .parameters(params)
                    .explanation("Matched intent: Get Spending Summary")
                    .build();
        }

        // 9. Evaluate Log Debt - Lend
        Matcher lendMatcher = PATTERN_DEBT_LEND.matcher(text);
        if (lendMatcher.matches()) {
            String personName = lendMatcher.group(1);
            String amount = lendMatcher.group(2);
            params.put("personName", personName);
            params.put("amount", new java.math.BigDecimal(amount));
            params.put("type", "GIVE_LOAN");
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.LOG_DEBT)
                    .parameters(params)
                    .explanation("Matched intent: Log Debt (Lend)")
                    .build();
        }

        // 10. Evaluate Log Debt - Borrow
        Matcher borrowMatcher = PATTERN_DEBT_BORROW.matcher(text);
        if (borrowMatcher.matches()) {
            String personName = borrowMatcher.group(1);
            String amount = borrowMatcher.group(2);
            params.put("personName", personName);
            params.put("amount", new java.math.BigDecimal(amount));
            params.put("type", "TAKE_LOAN");
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.LOG_DEBT)
                    .parameters(params)
                    .explanation("Matched intent: Log Debt (Borrow)")
                    .build();
        }

        // 11. Evaluate Log Debt - Repay
        Matcher repayMatcher = PATTERN_DEBT_REPAY.matcher(text);
        if (repayMatcher.matches()) {
            String personName = repayMatcher.group(1);
            String amount = repayMatcher.group(2);
            params.put("personName", personName);
            params.put("amount", new java.math.BigDecimal(amount));
            params.put("type", "RECEIVE_PAYMENT");
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.LOG_DEBT)
                    .parameters(params)
                    .explanation("Matched intent: Log Debt (Repay)")
                    .build();
        }

        // 12. Evaluate Get Debt Summary
        Matcher debtSummaryMatcher = PATTERN_GET_DEBT_SUMMARY.matcher(text);
        if (debtSummaryMatcher.matches()) {
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.GET_DEBT_SUMMARY)
                    .parameters(params)
                    .explanation("Matched intent: Get Debt Summary")
                    .build();
        }

        // 13. Evaluate Delete Task
        Matcher deleteMatcher = PATTERN_DELETE_TASK.matcher(text);
        if (deleteMatcher.matches()) {
            Long taskId = Long.parseLong(deleteMatcher.group(1));
            params.put("taskId", taskId);
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.DELETE_TASK)
                    .parameters(params)
                    .explanation("Matched intent: Delete Task " + taskId)
                    .build();
        }

        // 14. Evaluate Get Active Tasks List
        Matcher getTasksMatcher = PATTERN_GET_ACTIVE_TASKS.matcher(text);
        if (getTasksMatcher.matches()) {
            String status = null;
            String filterGroup = getTasksMatcher.group(1);
            if (filterGroup != null) {
                String filterLower = filterGroup.toLowerCase();
                if (filterLower.contains("done") || filterLower.contains("completed")) {
                    status = "COMPLETED";
                } else if (filterLower.contains("active") || filterLower.contains("pending")) {
                    status = "TODO";
                } else if (filterLower.contains("in-progress") || filterLower.contains("in progress")) {
                    status = "IN_PROGRESS";
                }
            }
            params.put("status", status);
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.GET_ACTIVE_TASKS)
                    .parameters(params)
                    .explanation("Matched intent: Get Active Tasks List")
                    .build();
        }

        // 5. Evaluate Help Request
        Matcher helpMatcher = PATTERN_HELP.matcher(text);
        if (helpMatcher.matches()) {
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.HELP)
                    .parameters(params)
                    .explanation("Matched intent: Help Guide Request")
                    .build();
        }

        // 16. Evaluate Get Habit Stats
        Matcher statsMatcher = PATTERN_GET_HABIT_STATS.matcher(text);
        if (statsMatcher.matches()) {
            String habitName = statsMatcher.group(1);
            if (habitName != null) {
                params.put("habitName", habitName.trim());
            }
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.GET_HABIT_STATS)
                    .parameters(params)
                    .explanation("Matched intent: Get Habit Stats")
                    .build();
        }

        // 17. Evaluate Get Today's Remaining Habits
        Matcher todaysHabitsMatcher = PATTERN_GET_TODAYS_HABITS.matcher(text);
        if (todaysHabitsMatcher.matches()) {
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.GET_TODAYS_HABITS)
                    .parameters(params)
                    .explanation("Matched intent: Get Today's Remaining Habits")
                    .build();
        }

        // 18. Evaluate Seed Habits Preset Pack
        Matcher presetMatcher = PATTERN_SEED_PRESET_PACK.matcher(text);
        if (presetMatcher.matches()) {
            String pack = presetMatcher.group(1).trim().toUpperCase();
            if ("DEEP WORK".equals(pack)) pack = "DEEP_WORK";
            params.put("pack", pack);
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.SEED_PRESET_PACK)
                    .parameters(params)
                    .explanation("Matched intent: Seed Preset Pack " + pack)
                    .build();
        }

        // Fallback Unrecognized Intent
        return buildUnknownIntent(event, "Unrecognized command structure");
    }

    /**
     * Fallback Intent Builder.
     */
    private ParsedIntent buildUnknownIntent(BotMessageEvent event, String reason) {
        return ParsedIntent.builder()
                .sourceEvent(event)
                .action(IntentAction.UNKNOWN)
                .explanation(reason)
                .build();
    }
}
