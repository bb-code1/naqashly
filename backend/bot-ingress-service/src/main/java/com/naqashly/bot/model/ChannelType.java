package com.naqashly.bot.model;

/**
 * <h1>Chat Provider Channel Type Enum</h1>
 * 
 * <p><b>WHAT:</b> Supported chat platform providers.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
public enum ChannelType {
    /** Telegram Bot API provider. */
    TELEGRAM,

    /** WhatsApp Business Cloud API provider. */
    WHATSAPP,

    /** Slack API provider. */
    SLACK,

    /** Custom channel or generic webhook provider. */
    CUSTOM
}
