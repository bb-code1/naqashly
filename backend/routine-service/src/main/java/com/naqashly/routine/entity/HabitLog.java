package com.naqashly.routine.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.ZonedDateTime;

/**
 * <h1>HabitLog JPA Entity Specification</h1>
 * 
 * <p><b>WHAT:</b> Relational database entity mapping the {@code habit_logs} table in PostgreSQL.</p>
 * <p><b>WHY:</b> Tracks daily habit completions, partial credits (50%), and 2-hour midnight grace window logs.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "habit_logs", indexes = {
    @Index(name = "idx_habit_logs_user_date", columnList = "user_id, log_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "habit_id", nullable = false)
    private Long habitId;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "logged_for_date")
    private LocalDate loggedForDate;

    @Column(name = "source_channel")
    private String sourceChannel;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "quality_grade")
    private String qualityGrade; // "JAMAAT" | "ON_TIME" | "LATE"

    @Builder.Default
    @Column(nullable = false)
    private String status = "PENDING"; // "PENDING" | "PARTIAL" | "COMPLETED"

    @Builder.Default
    @Column(name = "completion_percentage", nullable = false)
    private Integer completionPercentage = 0; // 0, 50, 100

    @Builder.Default
    @Column(name = "logged_at", nullable = false)
    private ZonedDateTime loggedAt = ZonedDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (loggedForDate == null) {
            loggedForDate = logDate;
        }
        if (logDate == null) {
            logDate = loggedForDate;
        }
        loggedAt = ZonedDateTime.now();
    }
}
