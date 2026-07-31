package com.naqashly.bot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BotChatRequest {
    private String message;
    private String context;
    private Map<String, Object> meta;
}
