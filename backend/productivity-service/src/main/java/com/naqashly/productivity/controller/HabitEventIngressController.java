package com.naqashly.productivity.controller;

import com.naqashly.productivity.entity.Goal;
import com.naqashly.productivity.repository.GoalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 📥 Production-Grade Event Ingress Controller (productivity-service)
 * 
 * Consumes HabitCompletedEvent published by routine-service (Port 8085).
 * Implements Idempotency Guard (Event Deduplication) and updates goal progress in PostgreSQL.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/productivity/events")
public class HabitEventIngressController {

    private static final Logger log = LoggerFactory.getLogger(HabitEventIngressController.class);

    // In-Memory Idempotency Cache (In enterprise production, backed by Redis or idempotency_log table)
    private static final Set<String> PROCESSED_EVENT_IDS = ConcurrentHashMap.newKeySet();

    @Autowired
    private GoalRepository goalRepository;

    @PostMapping("/habit-completed")
    public ResponseEntity<Map<String, Object>> handleHabitCompletedEvent(@RequestBody HabitCompletedEventPayload event) {
        if (event == null || event.getLinkedGoalId() == null || event.getEventId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid event payload"));
        }

        // 🛡️ Production Standard: Idempotency Check (Prevent duplicate event processing)
        if (PROCESSED_EVENT_IDS.contains(event.getEventId())) {
            log.warn("⚠️ [GoalEventConsumer] Duplicate HabitCompletedEvent detected (eventId: {}). Ignoring to maintain idempotency.", event.getEventId());
            return ResponseEntity.ok(Map.of("status", "IGNORED_DUPLICATE", "eventId", event.getEventId()));
        }

        PROCESSED_EVENT_IDS.add(event.getEventId());

        log.info("📩 [GoalEventConsumer] Received HabitCompletedEvent (eventId: {}) for linkedGoalId: {}",
                event.getEventId(), event.getLinkedGoalId());

        Optional<Goal> goalOpt = goalRepository.findById(event.getLinkedGoalId());
        if (goalOpt.isPresent()) {
            Goal goal = goalOpt.get();
            int currentProgress = goal.getProgressPercentage() == null ? 0 : goal.getProgressPercentage();
            
            // Auto-advance goal progress by +5% (capped at 100%)
            int newProgress = Math.min(100, currentProgress + 5);
            goal.setProgressPercentage(newProgress);
            
            if (newProgress >= 100) {
                goal.setIsCompleted(true);
            }

            Goal updatedGoal = goalRepository.save(goal);
            log.info("✅ [GoalEventConsumer] Successfully processed eventId: {}. Advanced Goal #{} ('{}') progress from {}% -> {}% in PostgreSQL!",
                    event.getEventId(), updatedGoal.getId(), updatedGoal.getTitle(), currentProgress, newProgress);

            return ResponseEntity.ok(Map.of(
                    "status", "PROCESSED",
                    "eventId", event.getEventId(),
                    "goalId", updatedGoal.getId(),
                    "newProgress", newProgress
            ));
        } else {
            log.warn("⚠️ [GoalEventConsumer] Target Goal #{} not found for eventId: {}", event.getLinkedGoalId(), event.getEventId());
            return ResponseEntity.ok(Map.of("status", "GOAL_NOT_FOUND", "eventId", event.getEventId()));
        }
    }

    public static class HabitCompletedEventPayload implements Serializable {
        private String eventId;
        private Long userId;
        private Long habitId;
        private Long linkedGoalId;
        private Integer completionPercentage;
        private String status;

        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getHabitId() { return habitId; }
        public void setHabitId(Long habitId) { this.habitId = habitId; }
        public Long getLinkedGoalId() { return linkedGoalId; }
        public void setLinkedGoalId(Long linkedGoalId) { this.linkedGoalId = linkedGoalId; }
        public Integer getCompletionPercentage() { return completionPercentage; }
        public void setCompletionPercentage(Integer completionPercentage) { this.completionPercentage = completionPercentage; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
