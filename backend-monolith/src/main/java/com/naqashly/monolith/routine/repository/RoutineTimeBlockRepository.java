package com.naqashly.monolith.routine.repository;

import com.naqashly.monolith.routine.entity.RoutineTimeBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 🧱 Routine Time Block JPA Repository
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface RoutineTimeBlockRepository extends JpaRepository<RoutineTimeBlock, Long> {
    List<RoutineTimeBlock> findByUserIdOrderByDisplayOrderAsc(Long userId);
}
