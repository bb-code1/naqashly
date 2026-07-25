package com.naqashly.routine.controller;

import com.naqashly.routine.entity.Habit;
import com.naqashly.routine.entity.HabitLog;
import com.naqashly.routine.entity.UserRoutineSettings;
import com.naqashly.routine.repository.HabitLogRepository;
import com.naqashly.routine.repository.HabitRepository;
import com.naqashly.routine.repository.UserRoutineSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

/**
 * <h1>Habit REST Controller Endpoints</h1>
 * 
 * <p>Exposes REST endpoints for querying, creating, and logging habit contracts in PostgreSQL.</p>
 * <p>Includes 2-Hour Midnight Grace Window Math to prevent streak drops between 00:00 and 02:00 AM.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/routine/habits")
public class HabitController {

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private HabitLogRepository habitLogRepository;

    @Autowired
    private UserRoutineSettingsRepository settingsRepository;

    /**
     * Fetch user's routine settings (routineMode, selectedCity, calculationMethod).
     */
    @GetMapping("/settings")
    public ResponseEntity<UserRoutineSettings> getSettings(@RequestHeader("X-User-Id") String userIdHeader) {
        Long userId = parseUserId(userIdHeader);
        UserRoutineSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> settingsRepository.save(UserRoutineSettings.builder()
                        .userId(userId)
                        .routineMode("SOLAR")
                        .selectedCity("London, UK")
                        .calculationMethod("MWL")
                        .build()));
        return ResponseEntity.ok(settings);
    }

    /**
     * Update user's routine settings in PostgreSQL.
     */
    @PutMapping("/settings")
    public ResponseEntity<UserRoutineSettings> updateSettings(
            @RequestHeader("X-User-Id") String userIdHeader,
            @RequestBody UserRoutineSettings request) {
        Long userId = parseUserId(userIdHeader);
        UserRoutineSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> UserRoutineSettings.builder().userId(userId).build());

        if (request.getRoutineMode() != null) settings.setRoutineMode(request.getRoutineMode());
        if (request.getSelectedCity() != null) settings.setSelectedCity(request.getSelectedCity());
        if (request.getCalculationMethod() != null) settings.setCalculationMethod(request.getCalculationMethod());

        UserRoutineSettings saved = settingsRepository.save(settings);
        return ResponseEntity.ok(saved);
    }

    /**
     * Fetch all habit contracts for a user with status merged for logical date.
     */
    @GetMapping
    public ResponseEntity<List<Habit>> getHabits(@RequestHeader("X-User-Id") String userIdHeader) {
        Long userId = parseUserId(userIdHeader);
        List<Habit> habits = habitRepository.findByUserIdOrderByCreatedAtAsc(userId);

        // Seed default starter habits if user has zero habits
        if (habits.isEmpty()) {
            habits = seedDefaultHabits(userId);
        }

        // Merge today's habit logs for current 2-hour logical date
        LocalDate logicalDate = calculateLogicalDate(ZonedDateTime.now());
        for (Habit h : habits) {
            Optional<HabitLog> logOpt = habitLogRepository.findByUserIdAndHabitIdAndLogDate(userId, h.getId(), logicalDate);
            if (logOpt.isPresent()) {
                HabitLog l = logOpt.get();
                h.setStatus(l.getStatus());
                h.setCompletionPercentage(l.getCompletionPercentage());
                if (l.getQualityGrade() != null) {
                    h.setQualityGrade(l.getQualityGrade());
                }
            }
        }

        return ResponseEntity.ok(habits);
    }

    /**
     * Create a new custom habit contract.
     */
    @PostMapping
    public ResponseEntity<Habit> createHabit(
            @RequestHeader("X-User-Id") String userIdHeader,
            @RequestBody Habit habit) {
        Long userId = parseUserId(userIdHeader);
        habit.setUserId(userId);
        if (habit.getStreakCount() == null) habit.setStreakCount(0);
        if (habit.getIsFreezeProtected() == null) habit.setIsFreezeProtected(false);
        if (habit.getIsPrayer() == null) {
            String t = habit.getTitle() == null ? "" : habit.getTitle().toLowerCase();
            boolean autoPrayer = t.contains("prayer") || t.contains("tahajjud") || t.contains("fajr") || t.contains("dhuhr") || t.contains("asr") || t.contains("maghrib") || t.contains("isha");
            habit.setIsPrayer(autoPrayer);
        }

        Habit saved = habitRepository.save(habit);
        return ResponseEntity.ok(saved);
    }

    /**
     * Update an existing habit contract by ID.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Habit> updateHabit(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable("id") Long id,
            @RequestBody Habit request) {
        Long userId = parseUserId(userIdHeader);
        Optional<Habit> habitOpt = habitRepository.findById(id);

        if (habitOpt.isPresent() && habitOpt.get().getUserId().equals(userId)) {
            Habit existing = habitOpt.get();
            if (request.getTitle() != null) existing.setTitle(request.getTitle());
            if (request.getCategory() != null) existing.setCategory(request.getCategory());
            if (request.getWindow() != null) existing.setWindow(request.getWindow());
            if (request.getTargetMinutes() != null) existing.setTargetMinutes(request.getTargetMinutes());
            if (request.getLinkedGoalId() != null) existing.setLinkedGoalId(request.getLinkedGoalId());
            if (request.getIsPrayer() != null) existing.setIsPrayer(request.getIsPrayer());

            Habit updated = habitRepository.save(existing);
            return ResponseEntity.ok(updated);
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * Delete a habit contract by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable("id") Long id) {
        Long userId = parseUserId(userIdHeader);
        Optional<Habit> habitOpt = habitRepository.findById(id);

        if (habitOpt.isPresent() && habitOpt.get().getUserId().equals(userId)) {
            habitRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * 1-Click Atomic Preset Pack Seeding Endpoint.
     */
    @PostMapping("/preset")
    public ResponseEntity<List<Habit>> seedPresetPack(
            @RequestHeader("X-User-Id") String userIdHeader,
            @RequestParam("pack") String pack) {
        Long userId = parseUserId(userIdHeader);

        // Remove existing habits for user
        List<Habit> existing = habitRepository.findByUserIdOrderByCreatedAtAsc(userId);
        if (!existing.isEmpty()) {
            habitRepository.deleteAll(existing);
        }

        List<Habit> seeded = switch (pack.toUpperCase()) {
            case "ISLAMIC" -> List.of(
                Habit.builder().userId(userId).title("🌅 Fajr Prayer").category("SPIRITUAL").window("MORNING").targetMinutes(15).isPrayer(true).streakCount(1).build(),
                Habit.builder().userId(userId).title("📖 Morning Adhkar & Quran Recitation").category("SPIRITUAL").window("MORNING").targetMinutes(20).isPrayer(false).streakCount(1).build(),
                Habit.builder().userId(userId).title("🌤️ Dhuhr Prayer").category("SPIRITUAL").window("AFTERNOON").targetMinutes(15).isPrayer(true).streakCount(1).build(),
                Habit.builder().userId(userId).title("⛅ Asr Prayer & Evening Adhkar").category("SPIRITUAL").window("AFTERNOON").targetMinutes(15).isPrayer(true).streakCount(1).build(),
                Habit.builder().userId(userId).title("🌇 Maghrib Prayer").category("SPIRITUAL").window("EVENING").targetMinutes(15).isPrayer(true).streakCount(1).build(),
                Habit.builder().userId(userId).title("🌌 Isha Prayer & Witr").category("SPIRITUAL").window("EVENING").targetMinutes(15).isPrayer(true).streakCount(1).build(),
                Habit.builder().userId(userId).title("🌙 Tahajjud & Pre-Fajr Night Prayer").category("SPIRITUAL").window("EVENING").targetMinutes(15).isPrayer(true).streakCount(1).build(),
                Habit.builder().userId(userId).title("📚 Quran Hifz & Tafsir Study").category("SPIRITUAL").window("EVENING").targetMinutes(20).isPrayer(false).streakCount(1).build()
            );
            case "DEEP_WORK" -> List.of(
                Habit.builder().userId(userId).title("Deep Work: System Architecture Sprint").category("PRODUCTIVITY").window("MORNING").targetMinutes(90).streakCount(1).build(),
                Habit.builder().userId(userId).title("Code Review & PR Approvals").category("PRODUCTIVITY").window("AFTERNOON").targetMinutes(30).streakCount(1).build(),
                Habit.builder().userId(userId).title("Team Standup & Inbox Zero").category("PRODUCTIVITY").window("AFTERNOON").targetMinutes(20).streakCount(1).build(),
                Habit.builder().userId(userId).title("Daily Engineering Journal Retrospective").category("LEARNING").window("EVENING").targetMinutes(20).streakCount(1).build()
            );
            case "CHRISTIAN" -> List.of(
                Habit.builder().userId(userId).title("Morning Devotion & Prayer").category("SPIRITUAL").window("MORNING").targetMinutes(20).streakCount(1).build(),
                Habit.builder().userId(userId).title("Bible Scripture Study & Journaling").category("SPIRITUAL").window("AFTERNOON").targetMinutes(25).streakCount(1).build(),
                Habit.builder().userId(userId).title("Evening Reflection & Family Prayer").category("SPIRITUAL").window("EVENING").targetMinutes(20).streakCount(1).build()
            );
            case "HINDU" -> List.of(
                Habit.builder().userId(userId).title("Morning Puja & Mantra Chanting").category("SPIRITUAL").window("MORNING").targetMinutes(20).streakCount(1).build(),
                Habit.builder().userId(userId).title("Bhagavad Gita Reading & Meditation").category("SPIRITUAL").window("AFTERNOON").targetMinutes(25).streakCount(1).build(),
                Habit.builder().userId(userId).title("Evening Aarti & Reflection").category("SPIRITUAL").window("EVENING").targetMinutes(20).streakCount(1).build()
            );
            case "CUSTOM" -> List.of();
            default -> List.of(
                Habit.builder().userId(userId).title("Morning Meditation & Breathwork").category("MINDFULNESS").window("MORNING").targetMinutes(15).streakCount(1).build(),
                Habit.builder().userId(userId).title("Hydration & High-Protein Breakfast").category("HEALTH").window("MORNING").targetMinutes(20).streakCount(1).build(),
                Habit.builder().userId(userId).title("Technical Book Reading (20 Pages)").category("LEARNING").window("EVENING").targetMinutes(30).streakCount(1).build(),
                Habit.builder().userId(userId).title("Evening Gratitude Journal & Wind-Down").category("MINDFULNESS").window("EVENING").targetMinutes(15).streakCount(1).build()
            );
        };

        if (seeded.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<Habit> saved = habitRepository.saveAll(seeded);
        return ResponseEntity.ok(saved);
    }

    /**
     * Log habit status with 2-Hour Midnight Grace Window evaluation.
     */
    @PostMapping("/log")
    public ResponseEntity<HabitLog> logHabitStatus(
            @RequestHeader("X-User-Id") String userIdHeader,
            @RequestBody HabitLog logRequest) {
        Long userId = parseUserId(userIdHeader);
        ZonedDateTime now = ZonedDateTime.now();
        LocalDate logicalDate = calculateLogicalDate(now);

        Optional<HabitLog> existingOpt = habitLogRepository.findByUserIdAndHabitIdAndLogDate(userId, logRequest.getHabitId(), logicalDate);
        HabitLog log = existingOpt.orElseGet(() -> HabitLog.builder()
                .userId(userId)
                .habitId(logRequest.getHabitId())
                .logDate(logicalDate)
                .build());

        log.setStatus(logRequest.getStatus());
        log.setCompletionPercentage(logRequest.getCompletionPercentage());
        if (logRequest.getQualityGrade() != null) log.setQualityGrade(logRequest.getQualityGrade());
        log.setLoggedAt(now);

        HabitLog saved = habitLogRepository.save(log);

        // Update habit streak count and qualityGrade in parent entity
        habitRepository.findById(logRequest.getHabitId()).ifPresent(h -> {
            if (logRequest.getQualityGrade() != null) {
                h.setQualityGrade(logRequest.getQualityGrade());
            }
            if ("COMPLETED".equals(logRequest.getStatus())) {
                h.setStreakCount((h.getStreakCount() == null ? 0 : h.getStreakCount()) + 1);
            } else if ("PENDING".equals(logRequest.getStatus()) && h.getStreakCount() != null && h.getStreakCount() > 0) {
                h.setStreakCount(h.getStreakCount() - 1);
            }
            habitRepository.save(h);
        });

        return ResponseEntity.ok(saved);
    }

    /**
     * 2-Hour Midnight Grace Window Math.
     * If logged between 00:00 and 02:00 AM, counts for yesterday's logical date.
     */
    private LocalDate calculateLogicalDate(ZonedDateTime now) {
        if (now.getHour() < 2) {
            return now.toLocalDate().minusDays(1);
        }
        return now.toLocalDate();
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

    private List<Habit> seedDefaultHabits(Long userId) {
        List<Habit> defaults = List.of(
            Habit.builder().userId(userId).title("Morning Meditation & Breathwork").category("MINDFULNESS").window("MORNING").targetMinutes(15).streakCount(7).build(),
            Habit.builder().userId(userId).title("Hydration & High-Protein Breakfast").category("HEALTH").window("MORNING").targetMinutes(20).streakCount(14).build(),
            Habit.builder().userId(userId).title("Deep Work: System Architecture Sprint").category("PRODUCTIVITY").window("AFTERNOON").targetMinutes(90).streakCount(5).build(),
            Habit.builder().userId(userId).title("Technical Book Reading (20 Pages)").category("LEARNING").window("EVENING").targetMinutes(30).streakCount(12).build()
        );
        return habitRepository.saveAll(defaults);
    }
}
