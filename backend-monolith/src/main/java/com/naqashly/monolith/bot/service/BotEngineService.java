package com.naqashly.monolith.bot.service;

import com.naqashly.monolith.routine.service.RoutineService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * <h1>Ask Naqash In-Memory Bot Engine</h1>
 * 
 * <p><b>WHAT:</b> Command and conversational processing engine for the Naqashly Life OS.</p>
 * <p><b>WHY:</b> In the monolith, it directly invokes domain services in-memory without HTTP network latency.</p>
 */
@Slf4j
@Service
public class BotEngineService {

    private final RoutineService routineService;

    public BotEngineService(RoutineService routineService) {
        this.routineService = routineService;
    }

    public Map<String, Object> processMessage(Long userId, String message) {
        log.info("Processing bot query for userId {}: {}", userId, message);

        String trimmed = message != null ? message.trim().toLowerCase() : "";
        String responseText;

        if (trimmed.contains("routine") || trimmed.contains("habit")) {
            var routines = routineService.getUserRoutines(userId);
            responseText = "You currently have " + (routines != null ? routines.size() : 0) + " routine profile(s) configured.";
        } else if (trimmed.contains("help") || trimmed.contains("command")) {
            responseText = "Salam! I am Naqash, your Life OS companion. You can ask me about your routines, habits, tasks, or daily reflections.";
        } else {
            responseText = "Received your message: \"" + message + "\". How can I assist you with your routine, productivity, or habits today?";
        }

        return Map.of(
                "reply", responseText,
                "userId", userId,
                "timestamp", System.currentTimeMillis()
        );
    }
}
