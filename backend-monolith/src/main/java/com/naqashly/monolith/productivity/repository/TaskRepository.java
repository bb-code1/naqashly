package com.naqashly.monolith.productivity.repository;

import com.naqashly.monolith.productivity.entity.Task;
import com.naqashly.monolith.productivity.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * <h1>Task Spring Data JPA Repository</h1>
 * 
 * <p><b>WHAT:</b> Data Access Object (DAO) interface for executing database operations against the {@link Task} entity.</p>
 * <p><b>WHY:</b> Abstracts SQL queries for fetching user tasks, filtering by status, and updating task records.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see JpaRepository
 * @see Task
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Query All Tasks for Owner User ID.
     * 
     * @param userId Owner User ID.
     * @return List of matching {@link Task} instances.
     */
    List<Task> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Query Tasks by User ID and Status.
     * 
     * @param userId Owner User ID.
     * @param status Task progression status.
     * @return List of matching {@link Task} instances.
     */
    List<Task> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, TaskStatus status);

    /**
     * Find Specific Task by ID and User ID.
     * 
     * @param id Task Primary Key.
     * @param userId Owner User ID.
     * @return Optional containing matched {@link Task}.
     */
    Optional<Task> findByIdAndUserId(Long id, Long userId);
}
