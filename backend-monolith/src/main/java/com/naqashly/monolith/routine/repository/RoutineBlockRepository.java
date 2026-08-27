package com.naqashly.monolith.routine.repository;

import com.naqashly.monolith.routine.entity.RoutineBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA Repository for {@link RoutineBlock}.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface RoutineBlockRepository extends JpaRepository<RoutineBlock, Long> {

    List<RoutineBlock> findByRoutineIdOrderByStartTimeAsc(Long routineId);
}
