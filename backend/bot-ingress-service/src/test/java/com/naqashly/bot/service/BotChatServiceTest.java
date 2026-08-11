package com.naqashly.bot.service;

import com.naqashly.bot.client.AuthClient;
import com.naqashly.bot.client.TelegramClient;
import com.naqashly.bot.client.FinanceClient;
import com.naqashly.bot.client.ProductivityClient;
import com.naqashly.bot.client.RoutineClient;
import com.naqashly.bot.model.*;
import com.naqashly.bot.parser.IntentParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.model.ChatModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class BotChatServiceTest {

    private BotChatService botChatService;

    @Mock
    private ProductivityClient productivityClient;

    @Mock
    private FinanceClient financeClient;

    @Mock
    private RoutineClient routineClient;

    @Mock
    private IntentParser intentParser;

    @Mock
    private AuthClient authClient;

    @Mock
    private TelegramClient telegramClient;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private ChatModel chatModel;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        botChatService = new BotChatService(
                productivityClient, financeClient, routineClient, intentParser,
                authClient, telegramClient, objectMapper, java.util.Optional.of(chatModel)
        );
    }

    @Test
    public void testProcessWebChatCancelCommand() {
        BotChatRequest request = BotChatRequest.builder()
                .message("cancel")
                .context("WELCOME")
                .build();

        BotChatResponse response = botChatService.processWebChat("1", request);

        assertEquals("SUCCESS", response.getStatus());
        assertEquals("options", response.getType());
        assertTrue(response.getText().contains("Cancelled"));
        assertEquals("WELCOME", response.getContext());
    }

    @Test
    public void testProcessWebChatDirectIntentLogExpense() {
        // Setup direct intent parsing for "spent 20.00 food"
        BotChatRequest request = BotChatRequest.builder()
                .message("spent 20.00 food")
                .context("WELCOME")
                .build();

        Map<String, Object> params = new HashMap<>();
        params.put("amount", new BigDecimal("20.00"));
        params.put("category", "food");

        ParsedIntent intent = ParsedIntent.builder()
                .action(IntentAction.LOG_EXPENSE)
                .parameters(params)
                .explanation("Match spent 20.00 food")
                .build();

        when(intentParser.parse(any(BotMessageEvent.class))).thenReturn(intent);
        
        // Mock finance client wallets & transactions
        WalletDto mockWallet = WalletDto.builder().id(10L).name("Cash").currency("USD").balance(BigDecimal.TEN).build();
        when(financeClient.getWallets()).thenReturn(List.of(mockWallet));
        when(financeClient.createTransaction(any(CreateTransactionRequest.class)))
                .thenReturn(Map.of("id", "tx_123", "amount", new BigDecimal("20.00"), "category", "food"));

        BotChatResponse response = botChatService.processWebChat("1", request);

        assertEquals("SUCCESS", response.getStatus());
        assertEquals("receipt", response.getType());
        assertTrue(response.getText().contains("Transaction Logged"));
        verify(financeClient, times(1)).createTransaction(any(CreateTransactionRequest.class));
    }

    @Test
    public void testProcessWebChatDirectIntentAddTask() {
        // Setup direct intent parsing for "add Buy groceries"
        BotChatRequest request = BotChatRequest.builder()
                .message("add Buy groceries")
                .context("WELCOME")
                .build();

        Map<String, Object> params = new HashMap<>();
        params.put("title", "Buy groceries");

        ParsedIntent intent = ParsedIntent.builder()
                .action(IntentAction.ADD_TASK)
                .parameters(params)
                .explanation("Match add Buy groceries")
                .build();

        when(intentParser.parse(any(BotMessageEvent.class))).thenReturn(intent);

        TaskDto mockTask = TaskDto.builder().id(5L).title("Buy groceries").priority("MEDIUM").status("TODO").build();
        when(productivityClient.createTask(any(CreateTaskRequest.class))).thenReturn(mockTask);

        BotChatResponse response = botChatService.processWebChat("1", request);

        assertEquals("SUCCESS", response.getStatus());
        assertEquals("text", response.getType());
        assertTrue(response.getText().contains("Task Created"));
        verify(productivityClient, times(1)).createTask(any(CreateTaskRequest.class));
    }

    @Test
    public void testProcessWebChatDirectIntentCheckBalance() {
        BotChatRequest request = BotChatRequest.builder()
                .message("balance")
                .context("WELCOME")
                .build();

        ParsedIntent intent = ParsedIntent.builder()
                .action(IntentAction.CHECK_BALANCE)
                .parameters(new HashMap<>())
                .explanation("Match check balance")
                .build();

        when(intentParser.parse(any(BotMessageEvent.class))).thenReturn(intent);

        WalletDto mockWallet = WalletDto.builder().id(10L).name("Cash").currency("USD").balance(new BigDecimal("100.00")).build();
        when(financeClient.getWallets()).thenReturn(List.of(mockWallet));

        BotChatResponse response = botChatService.processWebChat("1", request);

        assertEquals("SUCCESS", response.getStatus());
        assertEquals("text", response.getType());
        assertTrue(response.getText().contains("Cash: $100.00 USD"));
    }

    @Test
    public void testProcessWebChatGuidedExpenseFlowStart() {
        // Under standard guided dialog welcome choice
        BotChatRequest request = BotChatRequest.builder()
                .message("LOG_EXPENSE")
                .context("WELCOME")
                .build();

        // Ensure IntentParser does not match any direct shortcut
        when(intentParser.parse(any(BotMessageEvent.class))).thenReturn(
                ParsedIntent.builder().action(IntentAction.UNKNOWN).build()
        );

        BotChatResponse response = botChatService.processWebChat("1", request);

        assertEquals("SUCCESS", response.getStatus());
        assertEquals("options", response.getType());
        assertEquals("AWAITING_EXPENSE_AMOUNT", response.getContext());
    }
}
