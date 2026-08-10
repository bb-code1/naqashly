package com.naqashly.bot.parser;

import com.naqashly.bot.model.BotMessageEvent;
import com.naqashly.bot.model.ChannelType;
import com.naqashly.bot.model.IntentAction;
import com.naqashly.bot.model.ParsedIntent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

public class IntentParserTest {

    private IntentParser intentParser;

    @BeforeEach
    public void setUp() {
        intentParser = new IntentParser();
    }

    @Test
    public void testParseCompleteTask() {
        BotMessageEvent event = BotMessageEvent.builder()
                .textContent("done task 5")
                .channel(ChannelType.CUSTOM)
                .channelUserId("user_1")
                .build();

        ParsedIntent intent = intentParser.parse(event);

        assertEquals(IntentAction.MARK_TASK_COMPLETE, intent.getAction());
        assertEquals(5L, intent.getParameters().get("taskId"));
    }

    @Test
    public void testParseCompleteTaskAlternative() {
        BotMessageEvent event = BotMessageEvent.builder()
                .textContent("complete 12")
                .channel(ChannelType.CUSTOM)
                .channelUserId("user_1")
                .build();

        ParsedIntent intent = intentParser.parse(event);

        assertEquals(IntentAction.MARK_TASK_COMPLETE, intent.getAction());
        assertEquals(12L, intent.getParameters().get("taskId"));
    }

    @Test
    public void testParseLogExpense() {
        BotMessageEvent event = BotMessageEvent.builder()
                .textContent("spent $45.50 on groceries")
                .channel(ChannelType.CUSTOM)
                .channelUserId("user_1")
                .build();

        ParsedIntent intent = intentParser.parse(event);

        assertEquals(IntentAction.LOG_EXPENSE, intent.getAction());
        assertEquals(new BigDecimal("45.50"), intent.getParameters().get("amount"));
        assertEquals("groceries", intent.getParameters().get("category"));
    }

    @Test
    public void testParseLogExpenseAlternative() {
        BotMessageEvent event = BotMessageEvent.builder()
                .textContent("- 15 transport")
                .channel(ChannelType.CUSTOM)
                .channelUserId("user_1")
                .build();

        ParsedIntent intent = intentParser.parse(event);

        assertEquals(IntentAction.LOG_EXPENSE, intent.getAction());
        assertEquals(new BigDecimal("15"), intent.getParameters().get("amount"));
        assertEquals("transport", intent.getParameters().get("category"));
    }

    @Test
    public void testParseLogExpenseFlexibleOrdering() {
        BotMessageEvent event = BotMessageEvent.builder()
                .textContent("Add Expense Chicken 200")
                .channel(ChannelType.CUSTOM)
                .channelUserId("user_1")
                .build();

        ParsedIntent intent = intentParser.parse(event);

        assertEquals(IntentAction.LOG_EXPENSE, intent.getAction());
        assertEquals(new BigDecimal("200"), intent.getParameters().get("amount"));
        assertEquals("Chicken", intent.getParameters().get("category"));
    }

    @Test
    public void testParseAddTask() {
        BotMessageEvent event = BotMessageEvent.builder()
                .textContent("add Buy groceries")
                .channel(ChannelType.CUSTOM)
                .channelUserId("user_1")
                .build();

        ParsedIntent intent = intentParser.parse(event);

        assertEquals(IntentAction.ADD_TASK, intent.getAction());
        assertEquals("Buy groceries", intent.getParameters().get("title"));
    }

    @Test
    public void testParseCheckBalance() {
        BotMessageEvent event = BotMessageEvent.builder()
                .textContent("balance")
                .channel(ChannelType.CUSTOM)
                .channelUserId("user_1")
                .build();

        ParsedIntent intent = intentParser.parse(event);

        assertEquals(IntentAction.CHECK_BALANCE, intent.getAction());
    }

    @Test
    public void testParseLogHabit() {
        BotMessageEvent event = BotMessageEvent.builder()
                .textContent("completed meditation")
                .channel(ChannelType.CUSTOM)
                .channelUserId("user_1")
                .build();

        ParsedIntent intent = intentParser.parse(event);

        assertEquals(IntentAction.LOG_HABIT, intent.getAction());
        assertEquals("meditation", intent.getParameters().get("title"));
    }

    @Test
    public void testParseHelp() {
        BotMessageEvent event = BotMessageEvent.builder()
                .textContent("/help")
                .channel(ChannelType.CUSTOM)
                .channelUserId("user_1")
                .build();

        ParsedIntent intent = intentParser.parse(event);

        assertEquals(IntentAction.HELP, intent.getAction());
    }

    @Test
    public void testParseUnknown() {
        BotMessageEvent event = BotMessageEvent.builder()
                .textContent("Hello bot, how is the weather today?")
                .channel(ChannelType.CUSTOM)
                .channelUserId("user_1")
                .build();

        ParsedIntent intent = intentParser.parse(event);

        assertEquals(IntentAction.UNKNOWN, intent.getAction());
    }
}
