package com.naqashly.bot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteDto {
    private Long id;
    private Long userId;
    private String title;
    private String content;
    private String category;
    private Boolean isPinned;
    private Boolean isEncrypted;
    private String mood;
    private String locationTag;
    private String weatherTag;
    private String tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
