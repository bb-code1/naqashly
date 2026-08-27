package com.naqashly.routine.repository;

import com.naqashly.routine.entity.HabitContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for {@link HabitContract}.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface HabitContractRepository extends JpaRepository<HabitContract, Long> {

    List<HabitContract> findByUserIdAndRoutineId(Long userId, Long routineId);

    List<HabitContract> findByUserId(Long userId);

    Optional<HabitContract> findByIdAndUserId(Long id, Long userId);

    Optional<HabitContract> findByUserIdAndTitleIgnoreCase(Long userId, String title);
}
