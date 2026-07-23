package com.naqashly.bot.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Map;

/**
 * <h1>Production-Grade Bot Command Kafka Event Payload DTO</h1>
 * 
 * <p><b>WHAT:</b> Serializable JSON event schema published to Kafka topic {@code bot-commands-topic}.</p>
 * <p><b>WHY:</b> Asynchronously decouples chat webhook ingress from downstream database processing in {@code productivity-service} and {@code finance-service}.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BotCommandEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    /** Unique event ID for consumer idempotency / deduplication. */
    private String eventId;

    /** Source Channel Provider (TELEGRAM, WHATSAPP, etc.). */
    private String channel;

    /** External sender chat ID or phone number. */
    private String channelUserId;

    /** Internal Naqashly User ID. */
    private Long internalUserId;

    /** Parsed Intent Action (MARK_TASK_COMPLETE, ADD_TASK, LOG_EXPENSE, etc.). */
    private String action;

    /** Extracted command parameters (taskId, amount, category, title). */
    private Map<String, Object> parameters;

    /** Original raw text message. */
    private String rawText;

    /** Event creation timestamp string. */
    private String timestamp;
}
