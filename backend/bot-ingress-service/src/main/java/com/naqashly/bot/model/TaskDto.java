package com.naqashly.bot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private String category;
    private String priority; // e.g., LOW, MEDIUM, HIGH
    private String status;   // e.g., TODO, IN_PROGRESS, COMPLETED, CANCELLED
    private ZonedDateTime dueDate;
}
