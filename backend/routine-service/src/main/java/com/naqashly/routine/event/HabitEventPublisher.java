package com.naqashly.routine.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * 📡 Production-Grade Event Publisher Service (routine-service)
 * 
 * Asynchronously dispatches HabitCompletedEvent to productivity-service (Port 8084)
 * with zero-blocking latency on the main user execution thread.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Service
public class HabitEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(HabitEventPublisher.class);
    private final RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${app.services.productivity-url}")
    private String productivityUrl;

    public HabitEventPublisher() {
        this.restTemplate = new RestTemplate();
    }

    @Async
    public void publishHabitCompleted(HabitCompletedEvent event) {
        if (event == null || event.getLinkedGoalId() == null) {
            return;
        }

        log.info("🌐 [HabitEventPublisher] Asynchronously publishing HabitCompletedEvent (eventId: {}) for linkedGoalId: {}",
                event.getEventId(), event.getLinkedGoalId());

        try {
            String baseUrl = productivityUrl != null ? productivityUrl.trim() : "http://localhost:8084";
            if (baseUrl.endsWith("/")) {
                baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
            }
            String targetUrl = baseUrl + "/api/v1/productivity/events/habit-completed";
            
            restTemplate.postForObject(targetUrl, event, String.class);
            log.info("✅ [HabitEventPublisher] Successfully delivered HabitCompletedEvent (eventId: {}) to productivity-service!", event.getEventId());
        } catch (Exception e) {
            log.warn("⚠️ [HabitEventPublisher] Asynchronous event delivery warning for eventId: {}. Reason: {}",
                    event.getEventId(), e.getMessage());
        }
    }
}
