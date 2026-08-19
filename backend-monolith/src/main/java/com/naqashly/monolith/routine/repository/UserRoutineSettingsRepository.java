package com.naqashly.monolith.routine.repository;

import com.naqashly.monolith.routine.entity.UserRoutineSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * <h1>UserRoutineSettings Spring Data JPA Repository</h1>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface UserRoutineSettingsRepository extends JpaRepository<UserRoutineSettings, Long> {
    Optional<UserRoutineSettings> findByUserId(Long userId);
}
