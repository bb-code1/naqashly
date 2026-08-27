package com.naqashly.monolith.productivity.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.ZonedDateTime;

/**
 * <h1>Goal Objective Target JPA Entity with Progress Slider</h1>
 * 
 * <p><b>WHAT:</b> Structured objective target with timeline level and 0% to 100% progress slider.</p>
 * <p><b>WHY:</b> Tracks execution levels across Daily, Weekly, Monthly, Yearly, and Lifetime goals.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "goals", indexes = {
    @Index(name = "idx_goals_user_id", columnList = "user_id"),
    @Index(name = "idx_goals_timeline_level", columnList = "timeline_level")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private GoalCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "timeline_level", nullable = false, length = 20)
    private TimelineLevel timelineLevel; // DAILY, WEEKLY, MONTHLY, YEARLY, LIFETIME

    @Column(name = "progress_percentage", nullable = false)
    private Integer progressPercentage; // 0 to 100

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;
}
