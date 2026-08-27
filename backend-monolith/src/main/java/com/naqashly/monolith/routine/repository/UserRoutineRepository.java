package com.naqashly.monolith.routine.repository;

import com.naqashly.monolith.routine.entity.UserRoutine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for {@link UserRoutine}.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface UserRoutineRepository extends JpaRepository<UserRoutine, Long> {

    List<UserRoutine> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<UserRoutine> findByUserIdAndIsActiveTrue(Long userId);

    Optional<UserRoutine> findByIdAndUserId(Long id, Long userId);
}
