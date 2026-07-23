package com.naqashly.bot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.naqashly.bot.adapter.ChannelAdapter;
import com.naqashly.bot.model.*;
import com.naqashly.bot.parser.IntentParser;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * <h1>Multi-Channel Bot Orchestration & Action Dispatcher Service</h1>
 * 
 * <p><b>WHAT:</b> Central service orchestrating adapter selection, message normalization, intent parsing, downstream service dispatching, and chat response generation.</p>
 * <p><b>WHY:</b> Decouples webhook HTTP controllers from execution logic, providing a single pipeline for all chat providers.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see ChannelAdapter
 * @see IntentParser
 */
@Service
public class BotDispatcherService {

    private final List<ChannelAdapter> channelAdapters;
    private final IntentParser intentParser;
    private final RestTemplate restTemplate;

    private static final String PRODUCTIVITY_SERVICE_URL = "http://localhost:8083/api/v1/productivity/tasks";
    private static final String FINANCE_SERVICE_URL = "http://localhost:8082/api/v1/finance";

    public BotDispatcherService(List<ChannelAdapter> channelAdapters,
                                IntentParser intentParser,
                                RestTemplate restTemplate) {
        this.channelAdapters = channelAdapters;
        this.intentParser = intentParser;
        this.restTemplate = restTemplate;
    }

    /**
     * Process Webhook Payload End-to-End.
     * 
     * @param channelName Provider name ("telegram", "whatsapp", etc.).
     * @param rawPayload Raw Jackson {@link JsonNode} JSON body.
     * @return Dispatch result Map containing response status, intent action, and chat reply message.
     */
    public Map<String, Object> processWebhook(String channelName, JsonNode rawPayload) {
        // 1. Resolve matching channel adapter
        ChannelType targetChannel = parseChannelName(channelName);
        ChannelAdapter adapter = channelAdapters.stream()
                .filter(a -> a.getChannelType() == targetChannel)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported channel provider: " + channelName));

        // 2. Normalize raw payload to BotMessageEvent
        BotMessageEvent event = adapter.parsePayload(rawPayload);

        // 3. Classify intent action
        ParsedIntent intent = intentParser.parse(event);

        // 4. Dispatch action to target microservice or format help menu
        String botReplyText = executeIntentAction(intent);

        return Map.of(
                "status", "SUCCESS",
                "channel", event.getChannel().name(),
                "sender", event.getSenderName(),
                "action", intent.getAction().name(),
                "explanation", intent.getExplanation(),
                "botReply", botReplyText
        );
    }

    /**
     * Execute Microservice Action based on Parsed Intent.
     * 
     * @param intent {@link ParsedIntent} DTO.
     * @return Formatted natural language reply message for the chat bot to send back.
     */
    private String executeIntentAction(ParsedIntent intent) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", String.valueOf(intent.getSourceEvent().getInternalUserId()));
        headers.set("Content-Type", "application/json");

        try {
            switch (intent.getAction()) {
                case MARK_TASK_COMPLETE -> {
                    Long taskId = (Long) intent.getParameters().get("taskId");
                    String url = PRODUCTIVITY_SERVICE_URL + "/" + taskId + "/status";
                    Map<String, String> body = Map.of("status", "COMPLETED");
                    HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(body, headers);
                    
                    restTemplate.exchange(url, HttpMethod.PUT, requestEntity, Map.class);
                    return "✅ Task #" + taskId + " marked as COMPLETED!";
                }

                case ADD_TASK -> {
                    String title = (String) intent.getParameters().get("title");
                    Map<String, String> body = Map.of("title", title, "category", "Chat Bot", "priority", "MEDIUM");
                    HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(body, headers);
                    
                    ResponseEntity<Map> response = restTemplate.postForEntity(PRODUCTIVITY_SERVICE_URL, requestEntity, Map.class);
                    Object newTaskId = response.getBody() != null ? response.getBody().get("id") : "?";
                    return "📝 Task created successfully: '" + title + "' (Task #" + newTaskId + ")";
                }

                case LOG_EXPENSE -> {
                    BigDecimal amount = (BigDecimal) intent.getParameters().get("amount");
                    String category = (String) intent.getParameters().get("category");
                    
                    String url = FINANCE_SERVICE_URL + "/transactions";
                    Map<String, Object> body = Map.of(
                            "walletId", 1,
                            "transactionType", "EXPENSE",
                            "amount", amount,
                            "category", category,
                            "description", "Logged via " + intent.getSourceEvent().getChannel() + " Bot"
                    );
                    HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
                    
                    ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
                    Object updatedBalance = response.getBody() != null ? response.getBody().get("updatedWalletBalance") : "updated";
                    return "💳 Recorded expense of $" + amount + " for '" + category + "'. New balance: $" + updatedBalance;
                }

                case CHECK_BALANCE -> {
                    String url = FINANCE_SERVICE_URL + "/wallets";
                    HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
                    ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, List.class);
                    return "📊 Wallet Balances: " + (response.getBody() != null ? response.getBody().toString() : "No wallets found");
                }

                case HELP, UNKNOWN -> {
                    return getHelpReplyText(intent.getSourceEvent().getTextContent());
                }

                default -> {
                    return getHelpReplyText(intent.getSourceEvent().getTextContent());
                }
            }
        } catch (Exception e) {
            return "⚠️ Failed to execute command (" + e.getMessage() + "). Please check task ID or parameters.";
        }
    }

    /**
     * Interactive Help Menu Formatter for Unknown or Help Commands.
     */
    private String getHelpReplyText(String originalText) {
        return """
                ❓ I didn't quite get that: "%s"
                
                Here are the valid commands I understand:
                
                📋 Task Commands:
                • Done task <id>  (e.g., "Done task 1")
                • Add task <title> (e.g., "Add task Buy groceries")
                
                💰 Finance Commands:
                • Spent $<amount> on <category> (e.g., "Spent $45 on groceries")
                • Balance (View active wallet balances)
                """.formatted(originalText != null ? originalText : "");
    }

    /** Helper to parse string channel name to enum. */
    private ChannelType parseChannelName(String name) {
        if (name == null) return ChannelType.CUSTOM;
        return switch (name.toLowerCase()) {
            case "telegram", "tg" -> ChannelType.TELEGRAM;
            case "whatsapp", "wa" -> ChannelType.WHATSAPP;
            case "slack" -> ChannelType.SLACK;
            default -> ChannelType.CUSTOM;
        };
    }
}
