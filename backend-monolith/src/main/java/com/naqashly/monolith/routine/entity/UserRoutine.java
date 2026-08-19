package com.naqashly.monolith.routine.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * <h1>User Routine Template JPA Entity</h1>
 * 
 * <p><b>WHAT:</b> Named routine schedule owned by a user (e.g. "Mon-Fri Workday", "Weekend Chill", "Vacation").</p>
 * <p><b>WHY:</b> Allows users to maintain multiple distinct routine profiles and switch between them on demand or by day of week.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "user_routines", indexes = {
    @Index(name = "idx_user_routines_user_id", columnList = "user_id"),
    @Index(name = "idx_user_routines_is_active", columnList = "is_active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRoutine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "days_of_week", length = 100)
    private String daysOfWeek; // e.g. "MON,TUE,WED,THU,FRI"

    @Column(name = "time_zone", length = 50)
    private String timeZone; // e.g. "Asia/Karachi", "America/New_York"

    @OneToMany(mappedBy = "routine", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RoutineBlock> blocks = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;
}
