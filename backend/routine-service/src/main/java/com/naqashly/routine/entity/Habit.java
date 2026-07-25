package com.naqashly.routine.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

/**
 * <h1>Habit JPA Entity Specification</h1>
 * 
 * <p><b>WHAT:</b> Relational database entity mapping the {@code habits} table in PostgreSQL.</p>
 * <p><b>WHY:</b> Stores user-customized habits, contextual time windows, target minutes, and streak counters.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "habits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Builder.Default
    @Column(nullable = false)
    private String category = "PRODUCTIVITY"; // "PRODUCTIVITY" | "MINDFULNESS" | "HEALTH" | "LEARNING" | "SPIRITUAL"

    @Builder.Default
    @Column(name = "window_name", nullable = false)
    private String window = "MORNING"; // "MORNING" | "AFTERNOON" | "EVENING"

    @Builder.Default
    @Column(name = "target_minutes", nullable = false)
    private Integer targetMinutes = 15;

    @Builder.Default
    @Column(name = "streak_count", nullable = false)
    private Integer streakCount = 0;

    @Builder.Default
    @Column(name = "is_freeze_protected", nullable = false)
    private Boolean isFreezeProtected = false;

    @Column(name = "linked_goal_id")
    private Long linkedGoalId;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
    }
}
