package com.naqashly.productivity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

/**
 * <h1>FocusSession JPA Entity Specification</h1>
 * 
 * <p><b>WHAT:</b> Relational database entity mapping the {@code focus_sessions} table in PostgreSQL.</p>
 * <p><b>WHY:</b> Permanently logs every completed Deep Work Pomodoro focus sprint across days, weeks, and years.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "focus_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FocusSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Builder.Default
    @Column(nullable = false)
    private String mode = "FOCUS"; // "FOCUS" | "SHORT_BREAK" | "LONG_BREAK"

    @Builder.Default
    @Column(name = "completed_at", nullable = false, updatable = false)
    private ZonedDateTime completedAt = ZonedDateTime.now();

    @PrePersist
    protected void onCreate() {
        completedAt = ZonedDateTime.now();
    }
}
