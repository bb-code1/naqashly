package com.naqashly.routine.repository;

import com.naqashly.routine.entity.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for {@link HabitLog}.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {

    List<HabitLog> findByUserIdAndLoggedForDate(Long userId, LocalDate loggedForDate);

    Optional<HabitLog> findByHabitIdAndLoggedForDate(Long habitId, LocalDate loggedForDate);

    List<HabitLog> findByUserIdOrderByCompletedAtDesc(Long userId);
}
