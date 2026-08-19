package com.naqashly.monolith.productivity.repository;

import com.naqashly.monolith.productivity.entity.FocusSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * <h1>FocusSession Spring Data JPA Repository</h1>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface FocusSessionRepository extends JpaRepository<FocusSession, Long> {
    List<FocusSession> findByUserIdOrderByCompletedAtDesc(Long userId);
}
