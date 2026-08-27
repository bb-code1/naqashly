package com.naqashly.bot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitLogDto {
    private Long habitId;
    private String status; // TODO, COMPLETED, MISSED
    private Integer completionPercentage;
    private String qualityGrade; // optional quality rating
}
