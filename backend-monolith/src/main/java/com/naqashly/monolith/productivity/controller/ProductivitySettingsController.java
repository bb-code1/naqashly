package com.naqashly.monolith.productivity.controller;

import com.naqashly.monolith.productivity.entity.ProductivitySettings;
import com.naqashly.monolith.productivity.repository.ProductivitySettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * <h1>ProductivitySettings REST Controller Endpoints</h1>
 * 
 * <p>Exposes REST endpoints for querying and updating user productivity preferences in PostgreSQL.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/productivity/settings")
public class ProductivitySettingsController {

    @Autowired
    private ProductivitySettingsRepository settingsRepository;

    /**
     * Fetch user productivity settings.
     */
    @GetMapping
    public ResponseEntity<ProductivitySettings> getSettings(@RequestHeader("X-User-Id") String userIdHeader) {
        Long userId = parseUserId(userIdHeader);
        ProductivitySettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> ProductivitySettings.builder()
                        .userId(userId)
                        .targetSessions(4)
                        .shortBreakMinutes(5)
                        .longBreakMinutes(25)
                        .startHour(7)
                        .endHour(21)
                        .build());
        return ResponseEntity.ok(settings);
    }

    /**
     * Save/Update user productivity settings.
     */
    @PutMapping
    public ResponseEntity<ProductivitySettings> updateSettings(
            @RequestHeader("X-User-Id") String userIdHeader,
            @RequestBody ProductivitySettings updated) {
        Long userId = parseUserId(userIdHeader);
        ProductivitySettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> ProductivitySettings.builder().userId(userId).build());

        if (updated.getTargetSessions() != null) settings.setTargetSessions(updated.getTargetSessions());
        if (updated.getShortBreakMinutes() != null) settings.setShortBreakMinutes(updated.getShortBreakMinutes());
        if (updated.getLongBreakMinutes() != null) settings.setLongBreakMinutes(updated.getLongBreakMinutes());
        if (updated.getStartHour() != null) settings.setStartHour(updated.getStartHour());
        if (updated.getEndHour() != null) settings.setEndHour(updated.getEndHour());

        ProductivitySettings saved = settingsRepository.save(settings);
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
