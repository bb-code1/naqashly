package com.naqashly.monolith.routine.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.ZonedDateTime;

/**
 * <h1>Streak Freeze Audit Ledger JPA Entity</h1>
 * 
 * <p><b>WHAT:</b> Audit record of when a user consumed a streak freeze pass to protect their streak.</p>
 * <p><b>WHY:</b> Tracks streak freeze pass usage for user transparency and analytics.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "streak_freeze_logs", indexes = {
    @Index(name = "idx_freeze_logs_user_id", columnList = "user_id"),
    @Index(name = "idx_freeze_logs_habit_id", columnList = "habit_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StreakFreezeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "habit_id", nullable = false)
    private Long habitId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "frozen_date", nullable = false)
    private LocalDate frozenDate;

    @Column(length = 255)
    private String reason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;
}
