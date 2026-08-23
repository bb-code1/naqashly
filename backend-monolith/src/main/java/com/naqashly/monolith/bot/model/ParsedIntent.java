package com.naqashly.monolith.bot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

/**
 * <h1>Parsed Intent Result DTO</h1>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParsedIntent {

    private BotMessageEvent sourceEvent;

    private IntentAction action;

    @Builder.Default
    private Map<String, Object> parameters = new HashMap<>();

    private String explanation;
}
