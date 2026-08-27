package com.naqashly.monolith.routine.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.ZonedDateTime;

/**
 * 📜 Muhasabah Daily Self-Reflection JPA Entity Specification
 * 
 * Stores nightly retrospective logs (Mood, Daily Win, Top Blocker, Muhasabah Grade)
 * in PostgreSQL table `muhasabah_logs`.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "muhasabah_logs", indexes = {
    @Index(name = "idx_muhasabah_user_date", columnList = "user_id, log_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MuhasabahLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(nullable = false, length = 50)
    private String mood; // INSPIRED | PEACEFUL | NEUTRAL | EXHAUSTED

    @Column(name = "daily_win", columnDefinition = "TEXT")
    private String dailyWin;

    @Column(name = "top_blocker", columnDefinition = "TEXT")
    private String topBlocker;

    @Column(name = "muhasabah_grade", nullable = false, length = 10)
    private String muhasabahGrade; // A+ | A | B | C

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;
}
