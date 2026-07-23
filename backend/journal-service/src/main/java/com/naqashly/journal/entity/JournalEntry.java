package com.naqashly.journal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;

/**
 * <h1>Categorized Journal Entry JPA Entity</h1>
 * 
 * <p><b>WHAT:</b> Structured chronological journal entry (e.g. Office work logs, Career learnings, General reflections).</p>
 * <p><b>WHY:</b> Stores categorized daily reflections with tag tags and duration metadata.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "journal_entries", indexes = {
    @Index(name = "idx_journal_entries_user_id", columnList = "user_id"),
    @Index(name = "idx_journal_entries_category", columnList = "category")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false, length = 50)
    private String category; // OFFICE_WORK, CAREER_LEARNING, REFLECTIONS, TRAVEL

    @Column(length = 200)
    private String tags; // e.g. "Java, Microservices, Spring"

    @Column(name = "project_name", length = 100)
    private String projectName;

    @Column(name = "ticket_id", length = 50)
    private String ticketId;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;
}
