package com.naqashly.monolith.routine.repository;

import com.naqashly.monolith.routine.entity.StreakFreezeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA Repository for {@link StreakFreezeLog}.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface StreakFreezeLogRepository extends JpaRepository<StreakFreezeLog, Long> {

    List<StreakFreezeLog> findByUserId(Long userId);

    List<StreakFreezeLog> findByHabitId(Long habitId);
}
