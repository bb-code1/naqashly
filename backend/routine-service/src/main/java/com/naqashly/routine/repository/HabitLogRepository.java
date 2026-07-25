package com.naqashly.routine.repository;

import com.naqashly.routine.entity.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * <h1>HabitLog Spring Data JPA Repository</h1>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {
    List<HabitLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);
    List<HabitLog> findByUserIdAndLogDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    Optional<HabitLog> findByUserIdAndHabitIdAndLogDate(Long userId, Long habitId, LocalDate logDate);
}
