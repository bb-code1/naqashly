package com.naqashly.monolith.productivity.controller;

import com.naqashly.monolith.productivity.entity.FocusSession;
import com.naqashly.monolith.productivity.repository.FocusSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * <h1>FocusSession REST Controller Endpoints</h1>
 * 
 * <p>Exposes REST endpoints for querying and logging completed focus sessions in PostgreSQL.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/productivity/focus-sessions")
public class FocusSessionController {

    @Autowired
    private FocusSessionRepository focusSessionRepository;

    /**
     * Fetch all completed focus sessions for a user.
     */
    @GetMapping
    public ResponseEntity<List<FocusSession>> getFocusSessions(@RequestHeader("X-User-Id") String userIdHeader) {
        Long userId = parseUserId(userIdHeader);
        List<FocusSession> sessions = focusSessionRepository.findByUserIdOrderByCompletedAtDesc(userId);
        return ResponseEntity.ok(sessions);
    }

    /**
     * Log a newly completed focus session sprint.
     */
    @PostMapping
    public ResponseEntity<FocusSession> logFocusSession(
            @RequestHeader("X-User-Id") String userIdHeader,
            @RequestBody FocusSession session) {
        Long userId = parseUserId(userIdHeader);
        session.setUserId(userId);
        if (session.getDurationMinutes() == null || session.getDurationMinutes() <= 0) {
            session.setDurationMinutes(25);
        }
        FocusSession saved = focusSessionRepository.save(session);
        return ResponseEntity.ok(saved);
    }

    private Long parseUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            return 1L;
        }
        try {
            return Long.parseLong(userIdHeader);
        } catch (NumberFormatException e) {
            return 1L;
        }
    }
}
