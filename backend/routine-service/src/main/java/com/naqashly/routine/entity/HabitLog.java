package com.naqashly.routine.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.ZonedDateTime;

/**
 * <h1>Habit Completion Audit Ledger JPA Entity</h1>
 * 
 * <p><b>WHAT:</b> Immutable audit record of a habit completion.</p>
 * <p><b>WHY:</b> Stores completion timestamps, target logical date (accounting for midnight grace windows), and source channel (WEB, TELEGRAM, WHATSAPP).</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "habit_logs", indexes = {
    @Index(name = "idx_habit_logs_user_id", columnList = "user_id"),
    @Index(name = "idx_habit_logs_habit_id", columnList = "habit_id"),
    @Index(name = "idx_habit_logs_logged_for_date", columnList = "logged_for_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "habit_id", nullable = false)
    private Long habitId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "logged_for_date", nullable = false)
    private LocalDate loggedForDate;

    @Column(name = "source_channel", nullable = false, length = 30)
    private String sourceChannel; // WEB_DASHBOARD, TELEGRAM, WHATSAPP

    @Column(length = 255)
    private String notes;

    @CreationTimestamp
    @Column(name = "completed_at", nullable = false, updatable = false)
    private ZonedDateTime completedAt;
}
