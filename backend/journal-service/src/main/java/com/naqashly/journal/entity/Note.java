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
 * <h1>Personal Note & Scratchpad JPA Entity</h1>
 * 
 * <p><b>WHAT:</b> Unstructured Markdown note item (e.g. meeting notes, quick scratchpad ideas).</p>
 * <p><b>WHY:</b> Enables fast text note taking with pinned status and category filtering.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "notes", indexes = {
    @Index(name = "idx_notes_user_id", columnList = "user_id"),
    @Index(name = "idx_notes_category", columnList = "category")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_pinned", nullable = false)
    private Boolean isPinned;

    @Column(nullable = false, length = 50)
    private String category; // GENERAL, WORK, IDEAS, PERSONAL

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;
}
