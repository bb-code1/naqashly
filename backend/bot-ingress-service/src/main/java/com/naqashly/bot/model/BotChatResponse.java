package com.naqashly.bot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BotChatResponse {
    private String status;      // SUCCESS, ERROR
    private String type;        // text, task_list, receipt, options
    private String text;        // Message display text
    private String context;     // Next step's context key
    private Object data;        // Associated payload (e.g. list of tasks, list of categories)
}
