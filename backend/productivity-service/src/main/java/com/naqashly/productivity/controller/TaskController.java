package com.naqashly.productivity.controller;

import com.naqashly.productivity.entity.Task;
import com.naqashly.productivity.entity.TaskPriority;
import com.naqashly.productivity.entity.TaskStatus;
import com.naqashly.productivity.repository.TaskRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

/**
 * <h1>Productivity Task Controller</h1>
 * 
 * <p><b>WHAT:</b> REST API controller exposing task management endpoints under {@code /api/v1/productivity/tasks}.</p>
 * <p><b>WHY:</b> Manages user todo items, status updates (marking tasks complete), priority queues, and deletions.</p>
 * <p><b>HOW:</b> Reads {@code X-User-Id} HTTP header injected by {@code api-gateway} after successful RS256 JWT signature verification.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see TaskRepository
 */
@RestController
@RequestMapping("/api/v1/productivity/tasks")
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * Get All Tasks for Authenticated User (with Optional Status Filter).
     * 
     * @param userId User ID extracted from {@code X-User-Id} header.
     * @param status Optional TaskStatus query parameter (TODO, IN_PROGRESS, COMPLETED, CANCELLED).
     * @return List of user {@link Task} objects.
     */
    @GetMapping
    public ResponseEntity<List<Task>> getUserTasks(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                   @RequestParam(required = false) TaskStatus status) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Task> tasks;
        if (status != null) {
            tasks = taskRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
        } else {
            tasks = taskRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }

        return ResponseEntity.ok(tasks);
    }

    /**
     * Create New Task.
     * 
     * @param userId User ID extracted from {@code X-User-Id} header.
     * @param request Create task payload.
     * @return ResponseEntity with created {@link Task}.
     */
    @PostMapping
    public ResponseEntity<?> createTask(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                        @Valid @RequestBody CreateTaskRequest request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        Task task = Task.builder()
                .userId(userId)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory() != null ? request.getCategory() : "General")
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .status(TaskStatus.TODO)
                .dueDate(request.getDueDate())
                .build();

        Task savedTask = taskRepository.save(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);
    }

    /**
     * Update Task Progression Status (e.g., Mark Task Complete).
     * 
     * <p><b>WHAT:</b> Updates the status of an existing task owned by the caller.</p>
     * <p><b>WHY:</b> Essential endpoint used by UI dashboards and automated chat commands (e.g., Telegram webhook marking task complete).</p>
     * 
     * @param id Target Task Primary Key ID.
     * @param userId User ID extracted from {@code X-User-Id} header.
     * @param request Status update payload.
     * @return ResponseEntity containing updated {@link Task}.
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long id,
                                              @RequestHeader(value = "X-User-Id", required = false) Long userId,
                                              @Valid @RequestBody UpdateStatusRequest request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        Task task = taskRepository.findByIdAndUserId(id, userId).orElse(null);
        if (task == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Task not found or unauthorized"));
        }

        task.setStatus(request.getStatus());
        Task updatedTask = taskRepository.save(task);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * Delete Task.
     * 
     * @param id Target Task Primary Key ID.
     * @param userId User ID extracted from {@code X-User-Id} header.
     * @return ResponseEntity with success status.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id,
                                        @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        Task task = taskRepository.findByIdAndUserId(id, userId).orElse(null);
        if (task == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Task not found or unauthorized"));
        }

        taskRepository.delete(task);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully", "id", id));
    }

    /** Create Task Request DTO Payload. */
    @Data
    public static class CreateTaskRequest {
        @NotBlank(message = "Task title is required")
        private String title;

        private String description;

        private String category = "General";

        private TaskPriority priority = TaskPriority.MEDIUM;

        private ZonedDateTime dueDate;
    }

    /** Update Status Request DTO Payload. */
    @Data
    public static class UpdateStatusRequest {
        @NotNull(message = "Task status is required")
        private TaskStatus status;
    }
}
