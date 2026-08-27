package com.naqashly.routine.repository;

import com.naqashly.routine.entity.ProcessedEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 🛡️ Kafka Processed Event Repository (Routine Service)
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface ProcessedEventRepository extends JpaRepository<ProcessedEvent, String> {
}
