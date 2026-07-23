package com.naqashly.bot.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.naqashly.bot.model.BotMessageEvent;
import com.naqashly.bot.model.ChannelType;

/**
 * <h1>Chat Provider Channel Adapter Interface (Strategy Pattern)</h1>
 * 
 * <p><b>WHAT:</b> Common interface for chat platform webhook payload converters.</p>
 * <p><b>WHY:</b> Enables adding new chat integrations (WhatsApp, Slack, Discord) without changing core engine code.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see BotMessageEvent
 */
public interface ChannelAdapter {

    /**
     * Get Supported Channel Provider Type.
     * 
     * @return {@link ChannelType} supported by this adapter.
     */
    ChannelType getChannelType();

    /**
     * Parse Raw JSON Node Payload into Normalized {@link BotMessageEvent}.
     * 
     * @param payload Jackson {@link JsonNode} representing raw webhook body.
     * @return Normalized {@link BotMessageEvent} object.
     * @throws IllegalArgumentException if payload structure is unparseable.
     */
    BotMessageEvent parsePayload(JsonNode payload);
}
