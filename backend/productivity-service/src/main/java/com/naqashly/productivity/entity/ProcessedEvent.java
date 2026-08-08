package com.naqashly.productivity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

/**
 * 🛡️ Kafka Processed Event Deduplication Entity (Productivity Service)
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "processed_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessedEvent {

    @Id
    @Column(name = "event_id", length = 100)
    private String eventId;

    @Column(name = "processed_at", nullable = false)
    private ZonedDateTime processedAt;
}
