package com.naqashly.routine.event;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 📦 Immutable Event DTO for Cross-Service Habit Completion Events
 * 
 * Dispatched by routine-service to inform productivity-service (Port 8084)
 * whenever a user completes a habit linked to a macro Goal.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
public class HabitCompletedEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String eventId;
    private Long userId;
    private Long habitId;
    private Long linkedGoalId;
    private Integer completionPercentage;
    private String status;
    private LocalDateTime timestamp;

    public HabitCompletedEvent() {
        this.eventId = UUID.randomUUID().toString();
        this.timestamp = LocalDateTime.now();
    }

    public HabitCompletedEvent(Long userId, Long habitId, Long linkedGoalId, Integer completionPercentage, String status) {
        this.eventId = UUID.randomUUID().toString();
        this.userId = userId;
        this.habitId = habitId;
        this.linkedGoalId = linkedGoalId;
        this.completionPercentage = completionPercentage;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getHabitId() {
        return habitId;
    }

    public void setHabitId(Long habitId) {
        this.habitId = habitId;
    }

    public Long getLinkedGoalId() {
        return linkedGoalId;
    }

    public void setLinkedGoalId(Long linkedGoalId) {
        this.linkedGoalId = linkedGoalId;
    }

    public Integer getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(Integer completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
