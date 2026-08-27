package com.naqashly.monolith.productivity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

/**
 * <h1>TimeBlock JPA Entity Specification</h1>
 * 
 * <p><b>WHAT:</b> Maps scheduled time-blocking calendar slots to the {@code time_blocks} table in PostgreSQL.</p>
 * <p><b>WHY:</b> Ensures calendar slots persist across server reboots, logins, and browser sessions.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "time_blocks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "task_id")
    private Long taskId;

    @Column(nullable = false)
    private String title;

    @Column(name = "slot_time", nullable = false)
    private String slotTime; // e.g. "09:00 AM"

    @Column(name = "block_date", nullable = false)
    private String blockDate; // e.g. "2026-07-25"

    @Column(name = "day_index", nullable = false)
    private Integer dayIndex; // 0 to 6

    @Builder.Default
    @Column(nullable = false)
    private String priority = "HIGH";

    @Builder.Default
    @Column(nullable = false)
    private String status = "TODO"; // "TODO" | "COMPLETED"

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
    }
}
