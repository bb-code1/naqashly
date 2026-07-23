package com.naqashly.productivity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

/**
 * <h1>Productivity Task JPA Entity Specification</h1>
 * 
 * <p><b>WHAT:</b> Relational database entity mapping the {@code tasks} table in PostgreSQL ({@code naqashly_productivity_db}).</p>
 * <p><b>WHY:</b> Represents user todo items, deadlines, category tags, and completion statuses.</p>
 * <p><b>HOW:</b> Uses JPA ORM annotations alongside Lombok for boilerplate getter/setter generation.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see TaskStatus
 * @see TaskPriority
 */
@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    /** Unique Primary Key Task ID. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Owner User ID matching primary key in auth-service users table. */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** Task Title / Summary. */
    @Column(nullable = false)
    private String title;

    /** Detailed task description memo. */
    private String description;

    /** Current Progression Status (TODO, IN_PROGRESS, COMPLETED, CANCELLED). */
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.TODO;

    /** Task Priority Level (LOW, MEDIUM, HIGH, URGENT). */
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority = TaskPriority.MEDIUM;

    /** Category Tag (e.g., "Work", "Personal", "Health", "Learning"). */
    @Column(nullable = false)
    private String category;

    /** Optional Due Date Timestamp. */
    @Column(name = "due_date")
    private ZonedDateTime dueDate;

    /** Timestamp of Task Creation. */
    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    /** Timestamp of Last Task Update. */
    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    /** Pre-persist lifecycle callback. */
    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
        updatedAt = ZonedDateTime.now();
    }

    /** Pre-update lifecycle callback. */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
