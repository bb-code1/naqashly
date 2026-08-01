package com.naqashly.productivity.controller;

import com.naqashly.productivity.entity.*;
import com.naqashly.productivity.repository.GoalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * <h1>Goals Dashboard & Progress Slider REST Controller</h1>
 * 
 * <p><b>WHAT:</b> REST API endpoints for managing structured objective targets and updating 0% to 100% progress sliders.</p>
 * <p><b>WHY:</b> Tracks timeline-based execution levels across Daily, Weekly, Monthly, Yearly, and Lifetime targets.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/productivity/goals")
public class GoalController {

    private static final Logger log = LoggerFactory.getLogger(GoalController.class);
    private final GoalRepository goalRepository;

    public GoalController(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    /**
     * Get All Goals for User.
     */
    @GetMapping
    public ResponseEntity<?> getGoals(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                      @RequestParam(value = "timelineLevel", required = false) String levelStr) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        List<Goal> goals;
        if (levelStr != null && !levelStr.isBlank()) {
            TimelineLevel level = TimelineLevel.valueOf(levelStr.toUpperCase());
            goals = goalRepository.findByUserIdAndTimelineLevelOrderByCreatedAtDesc(userId, level);
        } else {
            goals = goalRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return ResponseEntity.ok(goals);
    }

    /**
     * Create Goal Target.
     */
    @PostMapping
    @Transactional
    public ResponseEntity<?> createGoal(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                        @RequestBody Map<String, Object> request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        String title = (String) request.get("title");
        String categoryStr = (String) request.get("category"); // CAREER, FINANCES, HEALTH, PERSONAL, SPIRITUAL
        String levelStr = (String) request.get("timelineLevel"); // DAILY, WEEKLY, MONTHLY, YEARLY, LIFETIME

        if (title == null || categoryStr == null || levelStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "title, category, and timelineLevel are required"));
        }

        String description = (String) request.get("description");
        String priorityStr = (String) request.getOrDefault("priority", "MEDIUM");
        String targetDateStr = (String) request.get("targetDate");

        GoalCategory category = GoalCategory.valueOf(categoryStr.toUpperCase());
        TimelineLevel level = TimelineLevel.valueOf(levelStr.toUpperCase());
        TaskPriority priority = TaskPriority.valueOf(priorityStr.toUpperCase());
        LocalDate targetDate = null;
        if (targetDateStr != null && !targetDateStr.isBlank()) {
            try {
                if (targetDateStr.contains("T")) {
                    targetDate = java.time.ZonedDateTime.parse(targetDateStr).toLocalDate();
                } else {
                    targetDate = LocalDate.parse(targetDateStr);
                }
            } catch (Exception e) {
                log.warn("Could not parse targetDate string '{}', falling back to today", targetDateStr);
                targetDate = LocalDate.now();
            }
        }

        Goal goal = Goal.builder()
                .userId(userId)
                .title(title)
                .description(description)
                .category(category)
                .priority(priority)
                .timelineLevel(level)
                .progressPercentage(0)
                .isCompleted(false)
                .targetDate(targetDate)
                .build();

        Goal saved = goalRepository.save(goal);
        log.info("Created Goal #{} [{}] '{}' with timeline {}", saved.getId(), category, title, level);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Update Progress Slider (0% to 100%). Auto-completes at 100%.
     */
    @PutMapping("/{id}/progress")
    @Transactional
    public ResponseEntity<?> updateProgress(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                            @PathVariable("id") Long id,
                                            @RequestBody Map<String, Integer> request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        Integer progress = request.get("progressPercentage");
        if (progress == null || progress < 0 || progress > 100) {
            return ResponseEntity.badRequest().body(Map.of("message", "progressPercentage must be between 0 and 100"));
        }

        Goal goal = goalRepository.findByIdAndUserId(id, userId).orElse(null);
        if (goal == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Goal target not found"));
        }

        goal.setProgressPercentage(progress);
        goal.setIsCompleted(progress == 100);

        Goal updated = goalRepository.save(goal);
        log.info("Updated Goal #{} progress slider to {}%. Completed: {}", id, progress, updated.getIsCompleted());

        return ResponseEntity.ok(updated);
    }

    /**
     * Update Goal targets (edit).
     */
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateGoal(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                        @PathVariable("id") Long id,
                                        @RequestBody Map<String, Object> request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        Goal goal = goalRepository.findByIdAndUserId(id, userId).orElse(null);
        if (goal == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Goal target not found"));
        }

        String title = (String) request.get("title");
        String categoryStr = (String) request.get("category");
        String levelStr = (String) request.get("timelineLevel");
        String priorityStr = (String) request.get("priority");
        String targetDateStr = (String) request.get("targetDate");
        String description = (String) request.get("description");
        Boolean isCompleted = (Boolean) request.get("isCompleted");
        Integer progressPercentage = (Integer) request.get("progressPercentage");

        if (title != null) goal.setTitle(title);
        if (description != null) goal.setDescription(description);
        if (categoryStr != null) goal.setCategory(GoalCategory.valueOf(categoryStr.toUpperCase()));
        if (levelStr != null) goal.setTimelineLevel(TimelineLevel.valueOf(levelStr.toUpperCase()));
        if (priorityStr != null) goal.setPriority(TaskPriority.valueOf(priorityStr.toUpperCase()));
        if (isCompleted != null) goal.setIsCompleted(isCompleted);
        if (progressPercentage != null) {
            goal.setProgressPercentage(progressPercentage);
            if (progressPercentage >= 100) {
                goal.setIsCompleted(true);
            }
        }

        if (targetDateStr != null) {
            if (targetDateStr.isBlank()) {
                goal.setTargetDate(null);
            } else {
                try {
                    if (targetDateStr.contains("T")) {
                        goal.setTargetDate(java.time.ZonedDateTime.parse(targetDateStr).toLocalDate());
                    } else {
                        goal.setTargetDate(LocalDate.parse(targetDateStr));
                    }
                } catch (Exception e) {
                    log.warn("Could not parse targetDate string '{}'", targetDateStr);
                }
            }
        }

        Goal saved = goalRepository.save(goal);
        log.info("Updated Goal #{} Details. Category: {}, Title: '{}'", id, saved.getCategory(), saved.getTitle());
        return ResponseEntity.ok(saved);
    }

    /**
     * Delete Goal target.
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteGoal(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                        @PathVariable("id") Long id) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        Goal goal = goalRepository.findByIdAndUserId(id, userId).orElse(null);
        if (goal == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Goal target not found"));
        }

        goalRepository.delete(goal);
        log.info("Deleted Goal #{} belonging to user {}", id, userId);
        return ResponseEntity.noContent().build();
    }
}
