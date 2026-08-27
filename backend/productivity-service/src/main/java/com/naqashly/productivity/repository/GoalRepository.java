package com.naqashly.productivity.repository;

import com.naqashly.productivity.entity.Goal;
import com.naqashly.productivity.entity.TimelineLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for {@link Goal}.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Goal> findByUserIdAndTimelineLevelOrderByCreatedAtDesc(Long userId, TimelineLevel timelineLevel);

    Optional<Goal> findByIdAndUserId(Long id, Long userId);
}
