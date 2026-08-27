package com.naqashly.routine.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

/**
 * <h1>Time-Bounded Routine Block JPA Entity</h1>
 * 
 * <p><b>WHAT:</b> Scheduled time block within a routine (e.g. "06:00 to 07:00 Morning Priming").</p>
 * <p><b>WHY:</b> Models human daily schedules as time-bounded activity blocks for 24-hour visual progress bars.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "routine_blocks", indexes = {
    @Index(name = "idx_routine_blocks_routine_id", columnList = "routine_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutineBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_id", nullable = false)
    @JsonIgnore
    private UserRoutine routine;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 50)
    private String category; // MINDFULNESS, WORK, HEALTH, REST, SPIRITUAL

    @Column(name = "is_flexible", nullable = false)
    private Boolean isFlexible;
}
