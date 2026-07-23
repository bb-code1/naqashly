package com.naqashly.bot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

/**
 * <h1>Parsed Intent Result DTO</h1>
 * 
 * <p><b>WHAT:</b> Structure representing classified intent actions and extracted key-value parameters.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see IntentAction
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParsedIntent {

    /** Original raw message event. */
    private BotMessageEvent sourceEvent;

    /** Classified Intent Action. */
    private IntentAction action;

    /** Extracted parameter map (e.g. "taskId": 1, "amount": 45.0, "category": "groceries"). */
    @Builder.Default
    private Map<String, Object> parameters = new HashMap<>();

    /** Friendly status explanation message. */
    private String explanation;
}
