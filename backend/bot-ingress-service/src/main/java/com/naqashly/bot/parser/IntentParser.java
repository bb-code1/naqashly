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

    /** Pattern 3: Log Expense ("Spent $45 on groceries", "Expense 120 electronics", "-50 food"). */
    private static final Pattern PATTERN_LOG_EXPENSE = Pattern.compile(
            "(?i)^(?:spent|expense|paid|-)\\s+\\$?(\\d+(?:\\.\\d{1,2})?)\\s+(?:on|for|in)?\\s*(.+)$"
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
        Matcher expenseMatcher = PATTERN_LOG_EXPENSE.matcher(text);
        if (expenseMatcher.matches()) {
            BigDecimal amount = new BigDecimal(expenseMatcher.group(1));
            String category = expenseMatcher.group(2).trim();
            params.put("amount", amount);
            params.put("category", category);
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.LOG_EXPENSE)
                    .parameters(params)
                    .explanation("Matched intent: Log Expense $" + amount + " on " + category)
                    .build();
        }

        // 3. Evaluate Add Task
        Matcher addTaskMatcher = PATTERN_ADD_TASK.matcher(text);
        if (addTaskMatcher.matches()) {
            String taskTitle = addTaskMatcher.group(1).trim();
            params.put("title", taskTitle);
            return ParsedIntent.builder()
                    .sourceEvent(event)
                    .action(IntentAction.ADD_TASK)
                    .parameters(params)
                    .explanation("Matched intent: Create Task '" + taskTitle + "'")
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
