package com.naqashly.bot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitDto {
    private Long id;
    private Long userId;
    private String title;
    private String category;
    private String window; // MORNING, AFTERNOON, EVENING
    private Integer streakCount;
    private String status; // TODO, COMPLETED, MISSED
}
