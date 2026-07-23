package com.naqashly.bot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.naqashly.bot.adapter.ChannelAdapter;
import com.naqashly.bot.config.KafkaProducerConfig;
import com.naqashly.bot.event.BotCommandEvent;
import com.naqashly.bot.model.*;
import com.naqashly.bot.parser.IntentParser;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * <h1>Multi-Channel Bot Orchestration & Kafka Event Publisher Service</h1>
 * 
 * <p><b>WHAT:</b> Central service orchestrating adapter selection, message normalization, intent parsing, and publishing events to Apache Kafka ({@code bot-commands-topic}).</p>
 * <p><b>WHY:</b> Asynchronously decouples chat webhook HTTP ingress from downstream microservice database operations, allowing instant webhook responses (&lt; 30ms).</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see ChannelAdapter
 * @see IntentParser
 * @see KafkaTemplate
 */
@Service
public class BotDispatcherService {

    private final List<ChannelAdapter> channelAdapters;
    private final IntentParser intentParser;
    private final KafkaTemplate<String, BotCommandEvent> kafkaTemplate;

    public BotDispatcherService(List<ChannelAdapter> channelAdapters,
                                IntentParser intentParser,
                                KafkaTemplate<String, BotCommandEvent> kafkaTemplate) {
        this.channelAdapters = channelAdapters;
        this.intentParser = intentParser;
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Process Webhook Payload End-to-End & Publish Event to Kafka.
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

        // 4. Publish Event to Kafka or Format Help Menu
        String botReplyText;
        if (intent.getAction() == IntentAction.UNKNOWN || intent.getAction() == IntentAction.HELP) {
            botReplyText = getHelpReplyText(event.getTextContent());
        } else {
            // Build production-grade Kafka Command Event
            String eventId = "evt_" + UUID.randomUUID().toString().substring(0, 8);
            BotCommandEvent commandEvent = BotCommandEvent.builder()
                    .eventId(eventId)
                    .channel(event.getChannel().name())
                    .channelUserId(event.getChannelUserId())
                    .internalUserId(event.getInternalUserId())
                    .action(intent.getAction().name())
                    .parameters(intent.getParameters())
                    .rawText(event.getTextContent())
                    .timestamp(ZonedDateTime.now().toString())
                    .build();

            // Publish asynchronously to Kafka topic 'bot-commands-topic'
            kafkaTemplate.send(KafkaProducerConfig.BOT_COMMANDS_TOPIC, eventId, commandEvent);

            botReplyText = formatSuccessAcknowledgement(intent, eventId);
        }

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
     * Instant Acknowledgement Formatter.
     */
    private String formatSuccessAcknowledgement(ParsedIntent intent, String eventId) {
        return switch (intent.getAction()) {
            case MARK_TASK_COMPLETE -> "⚡ Processing request: Mark Task #" + intent.getParameters().get("taskId") + " as COMPLETED (Event: " + eventId + ")";
            case ADD_TASK -> "⚡ Processing request: Create Task '" + intent.getParameters().get("title") + "' (Event: " + eventId + ")";
            case LOG_EXPENSE -> "⚡ Processing request: Log Expense $" + intent.getParameters().get("amount") + " for '" + intent.getParameters().get("category") + "' (Event: " + eventId + ")";
            case CHECK_BALANCE -> "⚡ Processing request: Querying active wallet balances (Event: " + eventId + ")";
            default -> "⚡ Event dispatched to processing queue (Event: " + eventId + ")";
        };
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
