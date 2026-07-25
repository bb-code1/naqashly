package com.naqashly.routine.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

/**
 * <h1>UserRoutineSettings JPA Entity Specification</h1>
 * 
 * <p><b>WHAT:</b> Relational database entity mapping the {@code user_routine_settings} table in PostgreSQL.</p>
 * <p><b>WHY:</b> Stores user's preferred routine mode (SOLAR vs CLOCK), selected city, and astronomical calculation method.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "user_routine_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRoutineSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Builder.Default
    @Column(name = "routine_mode", nullable = false)
    private String routineMode = "SOLAR"; // "SOLAR" | "CLOCK"

    @Builder.Default
    @Column(name = "selected_city", nullable = false)
    private String selectedCity = "London, UK";

    @Builder.Default
    @Column(name = "calculation_method", nullable = false)
    private String calculationMethod = "MWL";

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
