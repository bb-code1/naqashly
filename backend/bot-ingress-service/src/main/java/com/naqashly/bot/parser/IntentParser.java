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
