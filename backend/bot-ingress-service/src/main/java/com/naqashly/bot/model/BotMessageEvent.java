package com.naqashly.bot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

/**
 * <h1>Normalized Multi-Channel Bot Message Event Domain Contract</h1>
 * 
 * <p><b>WHAT:</b> Platform-agnostic domain event contract representing a chat message normalized from any provider (Telegram, WhatsApp, Slack, Custom).</p>
 * <p><b>WHY:</b> Decouples platform-specific JSON schemas (e.g. Telegram {@code update_id} structure vs. WhatsApp {@code entry[0].changes} structure) into a single unified object format for intent processing.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see ChannelType
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BotMessageEvent {

    /** Unique message ID provided by chat platform. */
    private String messageId;

    /** Source Channel Provider (TELEGRAM, WHATSAPP, SLACK, CUSTOM). */
    private ChannelType channel;

    /** External Chat / User ID (e.g. Telegram chat_id or WhatsApp phone number). */
    private String channelUserId;

    /** Sender display name. */
    private String senderName;

    /** Raw user message text content. */
    private String textContent;

    /** Internal Naqashly User ID mapped from channelUserId (defaults to 1 for demo). */
    @Builder.Default
    private Long internalUserId = 1L;

    /** Timestamp of message receipt. */
    @Builder.Default
    private ZonedDateTime timestamp = ZonedDateTime.now();
}
