package com.naqashly.productivity.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Map;

/**
 * <h1>Bot Command Kafka Event DTO (Consumer Side)</h1>
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

    private String eventId;
    private String channel;
    private String channelUserId;
    private Long internalUserId;
    private String action;
    private Map<String, Object> parameters;
    private String rawText;
    private String timestamp;
}
