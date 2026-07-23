package com.naqashly.bot.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.naqashly.bot.model.BotMessageEvent;
import com.naqashly.bot.model.ChannelType;
import org.springframework.stereotype.Component;

/**
 * <h1>Telegram Bot Webhook Payload Adapter</h1>
 * 
 * <p><b>WHAT:</b> Converts Telegram Bot API JSON {@code Update} payloads into normalized {@link BotMessageEvent} instances.</p>
 * <p><b>HOW:</b> Extracts {@code message.message_id}, {@code message.chat.id}, {@code message.from.first_name}, and {@code message.text}.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see ChannelAdapter
 */
@Component
public class TelegramAdapter implements ChannelAdapter {

    @Override
    public ChannelType getChannelType() {
        return ChannelType.TELEGRAM;
    }

    @Override
    public BotMessageEvent parsePayload(JsonNode payload) {
        try {
            JsonNode messageNode = payload.has("message") ? payload.get("message") : payload;
            
            String messageId = messageNode.has("message_id") ? messageNode.get("message_id").asText() : "tg_" + System.currentTimeMillis();
            
            String chatId = "unknown";
            if (messageNode.has("chat") && messageNode.get("chat").has("id")) {
                chatId = messageNode.get("chat").get("id").asText();
            } else if (messageNode.has("from") && messageNode.get("from").has("id")) {
                chatId = messageNode.get("from").get("id").asText();
            }

            String senderName = "Telegram User";
            if (messageNode.has("from")) {
                JsonNode fromNode = messageNode.get("from");
                if (fromNode.has("first_name")) {
                    senderName = fromNode.get("first_name").asText();
                }
            }

            String textContent = messageNode.has("text") ? messageNode.get("text").asText() : "";

            return BotMessageEvent.builder()
                    .messageId(messageId)
                    .channel(ChannelType.TELEGRAM)
                    .channelUserId(chatId)
                    .senderName(senderName)
                    .textContent(textContent)
                    .build();
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse Telegram webhook payload: " + e.getMessage(), e);
        }
    }
}
