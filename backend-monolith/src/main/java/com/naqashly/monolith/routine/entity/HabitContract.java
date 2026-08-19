package com.naqashly.monolith.routine.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.ZonedDateTime;

/**
 * <h1>Habit Contract JPA Entity</h1>
 * 
 * <p><b>WHAT:</b> Trackable habit item with current streak, longest streak, and monthly freeze passes.</p>
 * <p><b>WHY:</b> Tracks daily consistency and preserves streaks via grace windows and freeze passes.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "habit_contracts", indexes = {
    @Index(name = "idx_habit_contracts_user_id", columnList = "user_id"),
    @Index(name = "idx_habit_contracts_routine_id", columnList = "routine_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "routine_id", nullable = false)
    private Long routineId;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 50)
    private String category; // MINDFULNESS, HEALTH, LEARNING, SPIRITUAL

    @Column(name = "target_count", nullable = false)
    private Integer targetCount;

    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak;

    @Column(name = "longest_streak", nullable = false)
    private Integer longestStreak;

    @Column(name = "freeze_passes_available", nullable = false)
    private Integer freezePassesAvailable; // Default 2 per month

    @Column(name = "last_completed_date")
    private LocalDate lastCompletedDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;
}
