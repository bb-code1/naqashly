package com.naqashly.productivity.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * <h1>ProductivitySettings JPA Entity Specification</h1>
 * 
 * <p><b>WHAT:</b> Relational database entity mapping the {@code productivity_settings} table in PostgreSQL.</p>
 * <p><b>WHY:</b> Stores user-customized working hours and Pomodoro preferences across devices and logins.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "productivity_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductivitySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Builder.Default
    @Column(name = "target_sessions", nullable = false)
    private Integer targetSessions = 4;

    @Builder.Default
    @Column(name = "short_break_minutes", nullable = false)
    private Integer shortBreakMinutes = 5;

    @Builder.Default
    @Column(name = "long_break_minutes", nullable = false)
    private Integer longBreakMinutes = 25;

    @Builder.Default
    @Column(name = "start_hour", nullable = false)
    private Integer startHour = 7;

    @Builder.Default
    @Column(name = "end_hour", nullable = false)
    private Integer endHour = 21;
}
