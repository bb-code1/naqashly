package com.naqashly.journal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;

/**
 * <h1>Saved Document Link & Web Reference JPA Entity</h1>
 * 
 * <p><b>WHAT:</b> Bookmark reference entity storing saved URLs, titles, and category tags.</p>
 * <p><b>WHY:</b> Organizes external web references, Google Drive templates, and documentation links.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "document_links", indexes = {
    @Index(name = "idx_doc_links_user_id", columnList = "user_id"),
    @Index(name = "idx_doc_links_category", columnList = "category")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String url;

    @Column(nullable = false, length = 50)
    private String category; // REFERENCE, TEMPLATE, ARCHIVE

    @Column(length = 255)
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;
}
