package com.naqashly.bot.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.naqashly.bot.model.BotMessageEvent;
import com.naqashly.bot.model.ChannelType;
import org.springframework.stereotype.Component;

/**
 * <h1>WhatsApp Business Cloud API Webhook Payload Adapter</h1>
 * 
 * <p><b>WHAT:</b> Converts Meta WhatsApp Cloud API JSON webhook payloads into normalized {@link BotMessageEvent} instances.</p>
 * <p><b>HOW:</b> Navigates Meta {@code entry[0].changes[0].value.messages[0]} JSON tree structure to extract phone number ({@code from}), message ID ({@code id}), and text body ({@code text.body}).</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see ChannelAdapter
 */
@Component
public class WhatsAppAdapter implements ChannelAdapter {

    @Override
    public ChannelType getChannelType() {
        return ChannelType.WHATSAPP;
    }

    @Override
    public BotMessageEvent parsePayload(JsonNode payload) {
        try {
            // Meta WhatsApp Cloud API JSON structure: entry[0].changes[0].value.messages[0]
            JsonNode messageNode = payload;
            if (payload.has("entry") && payload.get("entry").isArray() && payload.get("entry").size() > 0) {
                JsonNode entry = payload.get("entry").get(0);
                if (entry.has("changes") && entry.get("changes").isArray() && entry.get("changes").size() > 0) {
                    JsonNode valueNode = entry.get("changes").get(0).get("value");
                    if (valueNode.has("messages") && valueNode.get("messages").isArray() && valueNode.get("messages").size() > 0) {
                        messageNode = valueNode.get("messages").get(0);
                    }
                }
            }

            String messageId = messageNode.has("id") ? messageNode.get("id").asText() : "wa_" + System.currentTimeMillis();
            String fromPhone = messageNode.has("from") ? messageNode.get("from").asText() : "whatsapp_user";
            
            String textContent = "";
            if (messageNode.has("text") && messageNode.get("text").has("body")) {
                textContent = messageNode.get("text").get("body").asText();
            } else if (messageNode.has("body")) {
                textContent = messageNode.get("body").asText();
            }

            return BotMessageEvent.builder()
                    .messageId(messageId)
                    .channel(ChannelType.WHATSAPP)
                    .channelUserId(fromPhone)
                    .senderName("WhatsApp User (" + fromPhone + ")")
                    .textContent(textContent)
                    .build();
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse WhatsApp webhook payload: " + e.getMessage(), e);
        }
    }
}
