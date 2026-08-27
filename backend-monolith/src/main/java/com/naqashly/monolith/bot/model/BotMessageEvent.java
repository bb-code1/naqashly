package com.naqashly.monolith.bot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

/**
 * <h1>Normalized Multi-Channel Bot Message Event</h1>
 * 
 * <p><b>WHAT:</b> Platform-agnostic contract representing a chat message normalized from any provider.</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BotMessageEvent {

    private String messageId;

    private ChannelType channel;

    private String channelUserId;

    private String senderName;

    private String textContent;

    @Builder.Default
    private Long internalUserId = 1L;

    @Builder.Default
    private ZonedDateTime timestamp = ZonedDateTime.now();
}
