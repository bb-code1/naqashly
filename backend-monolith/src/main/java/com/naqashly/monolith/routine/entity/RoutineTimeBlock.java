package com.naqashly.monolith.routine.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;

/**
 * 🧱 Routine Time Block JPA Entity
 * 
 * Maps user-customized time blocks to PostgreSQL (naqashly_routine_db).
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "routine_time_blocks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutineTimeBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "block_key", nullable = false)
    private String blockKey; // "MORNING", "AFTERNOON", "EVENING", "CUSTOM_1"

    @Column(nullable = false)
    private String label; // "🌅 Morning Block"

    @Builder.Default
    @Column(name = "start_time", nullable = false)
    private String startTime = "06:00";

    @Builder.Default
    @Column(name = "end_time", nullable = false)
    private String endTime = "12:00";

    @Builder.Default
    @Column(name = "is_solar_bound", nullable = false)
    private Boolean isSolarBound = false;

    @Column(name = "solar_start_event")
    private String solarStartEvent; // "FAJR", "DHUHR", "MAGHRIB"

    @Column(name = "solar_end_event")
    private String solarEndEvent; // "DHUHR", "MAGHRIB", "FAJR"

    @Builder.Default
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
