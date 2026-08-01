package com.naqashly.routine.controller;

import com.naqashly.routine.entity.Habit;
import com.naqashly.routine.entity.HabitLog;
import com.naqashly.routine.entity.RoutineTimeBlock;
import com.naqashly.routine.entity.UserRoutineSettings;
import com.naqashly.routine.repository.HabitLogRepository;
import com.naqashly.routine.repository.HabitRepository;
import com.naqashly.routine.repository.RoutineTimeBlockRepository;
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
import com.naqashly.routine.event.HabitCompletedEvent;
import com.naqashly.routine.event.HabitEventPublisher;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/v1/routine/habits")
public class HabitController {

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private HabitLogRepository habitLogRepository;

    @Autowired
    private UserRoutineSettingsRepository settingsRepository;

    @Autowired
    private RoutineTimeBlockRepository timeBlockRepository;

    @Autowired
    private HabitEventPublisher habitEventPublisher;

    /**
     * Fetch user's routine settings (routineMode, selectedCity, calculationMethod).
     */
    @GetMapping("/settings")
    public ResponseEntity<UserRoutineSettings> getSettings(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = parseUserId(userIdHeader);
        UserRoutineSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> settingsRepository.save(UserRoutineSettings.builder()
                        .userId(userId)
                        .routineMode("CLOCK")
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
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
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
     * Fetch user's custom routine time blocks from PostgreSQL.
     * Seeds 3 default blocks (Morning, Afternoon, Evening) if none exist.
     */
    @GetMapping("/blocks")
    public ResponseEntity<List<RoutineTimeBlock>> getTimeBlocks(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = parseUserId(userIdHeader);
        List<RoutineTimeBlock> blocks = timeBlockRepository.findByUserIdOrderByDisplayOrderAsc(userId);

        if (blocks.isEmpty()) {
            List<RoutineTimeBlock> defaultBlocks = List.of(
                RoutineTimeBlock.builder().userId(userId).blockKey("MORNING").label("🌅 Morning Block").startTime("06:00").endTime("12:00").isSolarBound(false).displayOrder(1).build(),
                RoutineTimeBlock.builder().userId(userId).blockKey("AFTERNOON").label("☀️ Afternoon Block").startTime("12:00").endTime("18:00").isSolarBound(false).displayOrder(2).build(),
                RoutineTimeBlock.builder().userId(userId).blockKey("EVENING").label("🌙 Evening Block").startTime("18:00").endTime("24:00").isSolarBound(false).displayOrder(3).build()
            );
            blocks = timeBlockRepository.saveAll(defaultBlocks);
        }

        return ResponseEntity.ok(blocks);
    }

    /**
     * Create a new custom routine time block.
     */
    @PostMapping("/blocks")
    public ResponseEntity<RoutineTimeBlock> createTimeBlock(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestBody RoutineTimeBlock timeBlock) {
        Long userId = parseUserId(userIdHeader);
        timeBlock.setUserId(userId);
        if (timeBlock.getDisplayOrder() == null) timeBlock.setDisplayOrder(99);
        RoutineTimeBlock saved = timeBlockRepository.save(timeBlock);
        return ResponseEntity.ok(saved);
    }

    /**
     * Update an existing routine time block by ID.
     */
    @PutMapping("/blocks/{id}")
    public ResponseEntity<RoutineTimeBlock> updateTimeBlock(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable("id") Long id,
            @RequestBody RoutineTimeBlock request) {
        Long userId = parseUserId(userIdHeader);
        Optional<RoutineTimeBlock> opt = timeBlockRepository.findById(id);

        if (opt.isPresent() && opt.get().getUserId().equals(userId)) {
            RoutineTimeBlock existing = opt.get();
            if (request.getLabel() != null) existing.setLabel(request.getLabel());
            if (request.getStartTime() != null) existing.setStartTime(request.getStartTime());
            if (request.getEndTime() != null) existing.setEndTime(request.getEndTime());
            if (request.getIsSolarBound() != null) existing.setIsSolarBound(request.getIsSolarBound());
            if (request.getSolarStartEvent() != null) existing.setSolarStartEvent(request.getSolarStartEvent());
            if (request.getSolarEndEvent() != null) existing.setSolarEndEvent(request.getSolarEndEvent());
            if (request.getDisplayOrder() != null) existing.setDisplayOrder(request.getDisplayOrder());

            RoutineTimeBlock updated = timeBlockRepository.save(existing);
            return ResponseEntity.ok(updated);
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * Delete a custom time block by ID.
     */
    @DeleteMapping("/blocks/{id}")
    public ResponseEntity<Void> deleteTimeBlock(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable("id") Long id) {
        Long userId = parseUserId(userIdHeader);
        Optional<RoutineTimeBlock> opt = timeBlockRepository.findById(id);

        if (opt.isPresent() && opt.get().getUserId().equals(userId)) {
            timeBlockRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }

    /**
     * Fetch all habit contracts for a user with status merged for logical date.
     */
    @GetMapping
    public ResponseEntity<List<Habit>> getHabits(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
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
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestBody Habit habit) {
        Long userId = parseUserId(userIdHeader);
        habit.setUserId(userId);
        if (habit.getStreakCount() == null) habit.setStreakCount(0);
        if (habit.getIsFreezeProtected() == null) habit.setIsFreezeProtected(false);
        if (habit.getFrequencyType() == null) habit.setFrequencyType("DAILY");
        if (habit.getWeeklyTargetCount() == null) habit.setWeeklyTargetCount(1);
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
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
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
            existing.setAnchorHabitId(request.getAnchorHabitId());
            if (request.getIsPrayer() != null) existing.setIsPrayer(request.getIsPrayer());
            if (request.getFrequencyType() != null) existing.setFrequencyType(request.getFrequencyType());
            if (request.getFrequencyDays() != null) existing.setFrequencyDays(request.getFrequencyDays());
            if (request.getWeeklyTargetCount() != null) existing.setWeeklyTargetCount(request.getWeeklyTargetCount());

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
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
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
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestParam("pack") String pack) {
        Long userId = parseUserId(userIdHeader);

        // Remove existing habits for user
        List<Habit> existing = habitRepository.findByUserIdOrderByCreatedAtAsc(userId);
        if (!existing.isEmpty()) {
            habitRepository.deleteAll(existing);
        }

        List<Habit> seeded = switch (pack.toUpperCase()) {
            case "ISLAMIC" -> List.of(
                Habit.builder().userId(userId).title("Fajr").category("SPIRITUAL").window("MORNING").targetMinutes(15).isPrayer(true).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("Quran").category("SPIRITUAL").window("MORNING").targetMinutes(15).isPrayer(false).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("Zuhur").category("SPIRITUAL").window("AFTERNOON").targetMinutes(15).isPrayer(true).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("Jumu'ah").category("SPIRITUAL").window("AFTERNOON").targetMinutes(15).isPrayer(true).frequencyType("WEEKLY_DAYS").frequencyDays("FRI").streakCount(1).build(),
                Habit.builder().userId(userId).title("Asr").category("SPIRITUAL").window("AFTERNOON").targetMinutes(15).isPrayer(true).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("Magrib").category("SPIRITUAL").window("EVENING").targetMinutes(15).isPrayer(true).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("Isha").category("SPIRITUAL").window("EVENING").targetMinutes(15).isPrayer(true).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("Tahajud").category("SPIRITUAL").window("EVENING").targetMinutes(15).isPrayer(true).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("Azkar").category("SPIRITUAL").window("EVENING").targetMinutes(15).isPrayer(false).frequencyType("DAILY").streakCount(1).build()
            );
            case "DEEP_WORK" -> List.of(
                Habit.builder().userId(userId).title("Deep Work: System Architecture Sprint").category("PRODUCTIVITY").window("MORNING").targetMinutes(90).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("Code Review & PR Approvals").category("PRODUCTIVITY").window("AFTERNOON").targetMinutes(30).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("Team Standup & Inbox Zero").category("PRODUCTIVITY").window("AFTERNOON").targetMinutes(20).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("💪 Gym / Workout Session").category("HEALTH").window("EVENING").targetMinutes(60).frequencyType("WEEKLY_TARGET").weeklyTargetCount(3).streakCount(1).build(),
                Habit.builder().userId(userId).title("Daily Engineering Journal Retrospective").category("LEARNING").window("EVENING").targetMinutes(20).frequencyType("DAILY").streakCount(1).build()
            );
            case "CHRISTIAN" -> List.of(
                Habit.builder().userId(userId).title("Morning Devotion & Prayer").category("SPIRITUAL").window("MORNING").targetMinutes(20).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("Bible Scripture Study & Journaling").category("SPIRITUAL").window("AFTERNOON").targetMinutes(25).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("Evening Reflection & Family Prayer").category("SPIRITUAL").window("EVENING").targetMinutes(20).frequencyType("DAILY").streakCount(1).build()
            );
            case "HINDU" -> List.of(
                Habit.builder().userId(userId).title("Morning Puja & Mantra Chanting").category("SPIRITUAL").window("MORNING").targetMinutes(20).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("Bhagavad Gita Reading & Meditation").category("SPIRITUAL").window("AFTERNOON").targetMinutes(25).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("Evening Aarti & Reflection").category("SPIRITUAL").window("EVENING").targetMinutes(20).frequencyType("DAILY").streakCount(1).build()
            );
            case "CUSTOM" -> List.of();
            default -> List.of(
                Habit.builder().userId(userId).title("Morning Meditation & Breathwork").category("MINDFULNESS").window("MORNING").targetMinutes(15).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("Hydration & High-Protein Breakfast").category("HEALTH").window("MORNING").targetMinutes(20).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("💪 Gym / Workout Session").category("HEALTH").window("AFTERNOON").targetMinutes(45).frequencyType("WEEKLY_TARGET").weeklyTargetCount(3).streakCount(1).build(),
                Habit.builder().userId(userId).title("Technical Book Reading (20 Pages)").category("LEARNING").window("EVENING").targetMinutes(30).frequencyType("DAILY").streakCount(1).build(),
                Habit.builder().userId(userId).title("Evening Gratitude Journal & Wind-Down").category("MINDFULNESS").window("EVENING").targetMinutes(15).frequencyType("DAILY").streakCount(1).build()
            );
        };

        // Re-configure Routine Settings & Time Blocks based on Preset Blueprint
        UserRoutineSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> UserRoutineSettings.builder().userId(userId).build());

        // Clear existing custom time blocks for user
        List<RoutineTimeBlock> existingBlocks = timeBlockRepository.findByUserIdOrderByDisplayOrderAsc(userId);
        if (!existingBlocks.isEmpty()) {
            timeBlockRepository.deleteAll(existingBlocks);
        }

        switch (pack.toUpperCase()) {
            case "ISLAMIC" -> {
                settings.setRoutineMode("SOLAR");
                timeBlockRepository.saveAll(List.of(
                    RoutineTimeBlock.builder().userId(userId).blockKey("MORNING").label("🌅 Morning Block").startTime("04:30").endTime("12:30").isSolarBound(true).solarStartEvent("FAJR").solarEndEvent("DHUHR").displayOrder(1).build(),
                    RoutineTimeBlock.builder().userId(userId).blockKey("AFTERNOON").label("☀️ Afternoon Block").startTime("12:30").endTime("18:30").isSolarBound(true).solarStartEvent("DHUHR").solarEndEvent("MAGHRIB").displayOrder(2).build(),
                    RoutineTimeBlock.builder().userId(userId).blockKey("EVENING").label("🌙 Evening & Night Block").startTime("18:30").endTime("04:30").isSolarBound(true).solarStartEvent("MAGHRIB").solarEndEvent("FAJR").displayOrder(3).build()
                ));
            }
            case "DEEP_WORK" -> {
                settings.setRoutineMode("CLOCK");
                timeBlockRepository.saveAll(List.of(
                    RoutineTimeBlock.builder().userId(userId).blockKey("MORNING").label("🌅 Deep Work Morning Sprint").startTime("08:00").endTime("12:00").isSolarBound(false).displayOrder(1).build(),
                    RoutineTimeBlock.builder().userId(userId).blockKey("AFTERNOON").label("☀️ Code Review & Standups").startTime("12:00").endTime("17:00").isSolarBound(false).displayOrder(2).build(),
                    RoutineTimeBlock.builder().userId(userId).blockKey("EVENING").label("🌙 Engineering Retro & Wind-down").startTime("17:00").endTime("22:00").isSolarBound(false).displayOrder(3).build()
                ));
            }
            case "CHRISTIAN", "HINDU" -> {
                settings.setRoutineMode("CLOCK");
                timeBlockRepository.saveAll(List.of(
                    RoutineTimeBlock.builder().userId(userId).blockKey("MORNING").label("🌅 Morning Devotion & Meditation").startTime("06:00").endTime("12:00").isSolarBound(false).displayOrder(1).build(),
                    RoutineTimeBlock.builder().userId(userId).blockKey("AFTERNOON").label("☀️ Scripture Study & Reflection").startTime("12:00").endTime("18:00").isSolarBound(false).displayOrder(2).build(),
                    RoutineTimeBlock.builder().userId(userId).blockKey("EVENING").label("🌙 Evening Family Prayer").startTime("18:00").endTime("22:00").isSolarBound(false).displayOrder(3).build()
                ));
            }
            default -> {
                settings.setRoutineMode("CLOCK");
                timeBlockRepository.saveAll(List.of(
                    RoutineTimeBlock.builder().userId(userId).blockKey("MORNING").label("🌅 Morning Meditation & Health").startTime("06:00").endTime("12:00").isSolarBound(false).displayOrder(1).build(),
                    RoutineTimeBlock.builder().userId(userId).blockKey("AFTERNOON").label("☀️ Afternoon Focus & Sprint").startTime("12:00").endTime("18:00").isSolarBound(false).displayOrder(2).build(),
                    RoutineTimeBlock.builder().userId(userId).blockKey("EVENING").label("🌙 Evening Reading & Gratitude").startTime("18:00").endTime("22:00").isSolarBound(false).displayOrder(3).build()
                ));
            }
        }
        settingsRepository.save(settings);

        List<Habit> saved = habitRepository.saveAll(seeded);
        return ResponseEntity.ok(saved);
    }

    /**
     * Log habit status with 2-Hour Midnight Grace Window evaluation.
     */
    @PostMapping("/log")
    public ResponseEntity<HabitLog> logHabitStatus(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
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

            String oldStatus = existingOpt.map(HabitLog::getStatus).orElse("PENDING");
            String newStatus = logRequest.getStatus();

            if ("COMPLETED".equals(newStatus) && !"COMPLETED".equals(oldStatus)) {
                // Determine if streak is consecutive
                List<HabitLog> pastCompleted = habitLogRepository.findByUserIdAndHabitIdAndStatusOrderByLogDateDesc(userId, h.getId(), "COMPLETED");
                Optional<HabitLog> lastCompletedOpt = pastCompleted.stream()
                        .filter(l -> !l.getLogDate().equals(logicalDate))
                        .findFirst();

                if (lastCompletedOpt.isPresent()) {
                    LocalDate lastDate = lastCompletedOpt.get().getLogDate();
                    if (lastDate.equals(logicalDate.minusDays(1))) {
                        // Consecutive day streak continue
                        h.setStreakCount((h.getStreakCount() == null ? 0 : h.getStreakCount()) + 1);
                    } else {
                        // Reset streak to 1 because of a gap
                        h.setStreakCount(1);
                    }
                } else {
                    // No past completions, start at 1
                    h.setStreakCount(1);
                }
            } else if (!"COMPLETED".equals(newStatus) && "COMPLETED".equals(oldStatus)) {
                // Transition away from completed
                int currentStreak = h.getStreakCount() == null ? 0 : h.getStreakCount();
                h.setStreakCount(Math.max(0, currentStreak - 1));
            }

            habitRepository.save(h);

            // 🌟 Event-Driven Architecture: Asynchronously publish HabitCompletedEvent to productivity-service
            if (h.getLinkedGoalId() != null && ("COMPLETED".equals(logRequest.getStatus()) || "PARTIAL".equals(logRequest.getStatus()))) {
                habitEventPublisher.publishHabitCompleted(new HabitCompletedEvent(
                        userId,
                        h.getId(),
                        h.getLinkedGoalId(),
                        logRequest.getCompletionPercentage(),
                        logRequest.getStatus()
                ));
            }
        });

        return ResponseEntity.ok(saved);
    }

    /**
     * Fetch 52-Week (365-Day) Habit Completion History for Heatmap & Analytics.
     */
    @GetMapping("/history")
    public ResponseEntity<List<HabitLog>> getHabitHistory(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestParam(name = "days", defaultValue = "365") Integer days) {
        Long userId = parseUserId(userIdHeader);
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);

        List<HabitLog> history = habitLogRepository.findByUserIdAndLogDateBetween(userId, startDate, endDate);
        return ResponseEntity.ok(history);
    }

    /**
     * Fetch User Consistency Score & Completion Stats.
     */
    @GetMapping("/analytics/consistency")
    public ResponseEntity<java.util.Map<String, Object>> getConsistencyScore(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = parseUserId(userIdHeader);
        List<Habit> habits = habitRepository.findByUserIdOrderByCreatedAtAsc(userId);
        long completed = habits.stream().filter(h -> "COMPLETED".equals(h.getStatus())).count();
        long total = habits.size();
        int pct = total > 0 ? (int) Math.round(((double) completed / total) * 100) : 0;
        return ResponseEntity.ok(java.util.Map.of(
            "consistencyPercentage", pct,
            "totalHabits", total,
            "completedHabits", completed
        ));
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
