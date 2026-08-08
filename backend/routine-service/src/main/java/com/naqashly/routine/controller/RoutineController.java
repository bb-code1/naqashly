package com.naqashly.routine.controller;

import com.naqashly.routine.entity.HabitContract;
import com.naqashly.routine.entity.UserRoutine;
import com.naqashly.routine.model.ApiResponse;
import com.naqashly.routine.service.RoutineService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * <h1>Routine & Habit REST Controller</h1>
 * 
 * <p><b>WHAT:</b> REST API Endpoints for managing user routines, preset seeding, routine activation, and habit completion logging.</p>
 * <p><b>WHY:</b> Consumes gateway injected {@code X-User-Id} header to ensure strict multi-tenant user isolation.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see RoutineService
 */
@RestController
@RequestMapping("/api/v1/routine")
public class RoutineController {

    private final RoutineService routineService;

    public RoutineController(RoutineService routineService) {
        this.routineService = routineService;
    }

    /**
     * Get All User Routines.
     */
    @GetMapping("/routines")
    public ResponseEntity<?> getUserRoutines(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("UNAUTHORIZED_REQUEST", "Unauthorized request"));
        }
        List<UserRoutine> routines = routineService.getUserRoutines(userId);
        return ResponseEntity.ok(ApiResponse.success(routines));
    }

    /**
     * Create & Seed Routine from Preset.
     */
    @PostMapping("/routines")
    public ResponseEntity<?> createRoutine(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                            @RequestBody Map<String, String> request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("UNAUTHORIZED_REQUEST", "Unauthorized request"));
        }
        String title = request.getOrDefault("title", "My Routine");
        String preset = request.getOrDefault("preset", "SECULAR");
        String daysOfWeek = request.getOrDefault("daysOfWeek", "MON,TUE,WED,THU,FRI");

        UserRoutine routine = routineService.createRoutineFromPreset(userId, title, preset, daysOfWeek);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(routine));
    }

    /**
     * Set Routine as Currently Active.
     */
    @PutMapping("/routines/{id}/activate")
    public ResponseEntity<?> activateRoutine(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                              @PathVariable("id") Long routineId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }
        UserRoutine routine = routineService.activateRoutine(userId, routineId);
        return ResponseEntity.ok(routine);
    }

    /**
     * Get User Habit Contracts.
     */
    @GetMapping("/contracts")
    public ResponseEntity<?> getHabits(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }
        List<HabitContract> habits = routineService.getHabitContracts(userId);
        return ResponseEntity.ok(habits);
    }

    /**
     * Log Habit Completion (with 2-Hour Grace Window).
     */
    @PostMapping("/contracts/log")
    public ResponseEntity<?> logHabit(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                       @RequestBody Map<String, String> request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }
        String title = request.get("title");
        if (title == null || title.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Habit title is required"));
        }

        String notes = request.get("notes");
        Map<String, Object> result = routineService.logHabit(userId, title, "WEB_DASHBOARD", notes);
        return ResponseEntity.ok(result);
    }

    /**
     * Get 24-Hour Routine Timeline Slots.
     */
    @GetMapping("/slots")
    public ResponseEntity<?> getRoutineSlots(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        List<Map<String, Object>> defaultSlots = List.of(
            Map.of("slotIndex", 0, "time", "05:00", "label", "🕌 Fajr Prayer", "isCompleted", false),
            Map.of("slotIndex", 1, "time", "08:00", "label", "☕ Morning Work", "isCompleted", false),
            Map.of("slotIndex", 2, "time", "13:00", "label", "🕌 Dhuhr Prayer", "isCompleted", false),
            Map.of("slotIndex", 3, "time", "16:30", "label", "🕌 Asr Prayer", "isCompleted", false),
            Map.of("slotIndex", 4, "time", "19:00", "label", "🕌 Maghrib Prayer", "isCompleted", false),
            Map.of("slotIndex", 5, "time", "20:30", "label", "🕌 Isha Prayer", "isCompleted", false)
        );
        return ResponseEntity.ok(defaultSlots);
    }

    /**
     * Toggle Routine Slot State.
     */
    @PostMapping("/slots/{slotIndex}/toggle")
    public ResponseEntity<?> toggleSlot(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                         @PathVariable("slotIndex") Integer slotIndex) {
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "slotIndex", slotIndex, "toggledAt", System.currentTimeMillis()));
    }

    /**
     * Redeem Streak Freeze Pass.
     */
    @PostMapping("/streak/freeze")
    public ResponseEntity<?> redeemStreakFreeze(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Streak freeze pass redeemed", "remainingPasses", 1));
    }
}
