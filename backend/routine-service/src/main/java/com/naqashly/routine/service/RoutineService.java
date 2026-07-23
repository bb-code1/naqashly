package com.naqashly.routine.service;

import com.naqashly.routine.config.PresetCatalogConfig;
import com.naqashly.routine.entity.*;
import com.naqashly.routine.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * <h1>Core Routine & Habit Management Orchestrator Service</h1>
 * 
 * <p><b>WHAT:</b> Orchestrates routine profile creation, template seeding, multi-routine activation, and habit completion logging.</p>
 * <p><b>WHY:</b> Central business logic decoupling template blueprints from user database mutations.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see StreakCalculatorService
 * @see PresetCatalogConfig
 */
@Service
public class RoutineService {

    private static final Logger log = LoggerFactory.getLogger(RoutineService.class);

    private final UserRoutineRepository routineRepository;
    private final RoutineBlockRepository blockRepository;
    private final HabitContractRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final StreakCalculatorService streakCalculator;

    public RoutineService(UserRoutineRepository routineRepository,
                          RoutineBlockRepository blockRepository,
                          HabitContractRepository habitRepository,
                          HabitLogRepository habitLogRepository,
                          StreakCalculatorService streakCalculator) {
        this.routineRepository = routineRepository;
        this.blockRepository = blockRepository;
        this.habitRepository = habitRepository;
        this.habitLogRepository = habitLogRepository;
        this.streakCalculator = streakCalculator;
    }

    /**
     * Create and Seed a New Routine Profile from Blueprint Preset.
     * 
     * @param userId Target user ID.
     * @param title Routine title (e.g. "Workday", "Weekend").
     * @param presetName Blueprint preset name ("SECULAR", "ISLAMIC", "PRODUCTIVITY", "CUSTOM").
     * @param daysOfWeek Days of week string (e.g. "MON,TUE,WED,THU,FRI").
     * @return Saved {@link UserRoutine}.
     */
    @Transactional
    public UserRoutine createRoutineFromPreset(Long userId, String title, String presetName, String daysOfWeek) {
        // Deactivate active routine if this is the first routine
        List<UserRoutine> existing = routineRepository.findByUserIdOrderByCreatedAtDesc(userId);
        boolean makeActive = existing.isEmpty();

        UserRoutine routine = UserRoutine.builder()
                .userId(userId)
                .title(title)
                .isActive(makeActive)
                .daysOfWeek(daysOfWeek != null ? daysOfWeek : "MON,TUE,WED,THU,FRI")
                .timeZone("Asia/Karachi")
                .build();

        UserRoutine savedRoutine = routineRepository.save(routine);

        // Seed Routine Blocks from Preset Blueprint
        List<PresetCatalogConfig.PresetBlock> presetBlocks = PresetCatalogConfig.getBlocksForPreset(presetName);
        for (PresetCatalogConfig.PresetBlock pb : presetBlocks) {
            RoutineBlock block = RoutineBlock.builder()
                    .routine(savedRoutine)
                    .startTime(LocalTime.parse(pb.getStartTime()))
                    .endTime(LocalTime.parse(pb.getEndTime()))
                    .title(pb.getTitle())
                    .category(pb.getCategory())
                    .isFlexible(pb.getIsFlexible())
                    .build();
            savedRoutine.getBlocks().add(block);
        }
        routineRepository.save(savedRoutine);

        // Seed Habit Contracts from Preset Blueprint
        List<PresetCatalogConfig.PresetHabit> presetHabits = PresetCatalogConfig.getHabitsForPreset(presetName);
        for (PresetCatalogConfig.PresetHabit ph : presetHabits) {
            HabitContract habit = HabitContract.builder()
                    .userId(userId)
                    .routineId(savedRoutine.getId())
                    .title(ph.getTitle())
                    .category(ph.getCategory())
                    .targetCount(ph.getTargetCount())
                    .currentStreak(0)
                    .longestStreak(0)
                    .freezePassesAvailable(2)
                    .build();
            habitRepository.save(habit);
        }

        log.info("Successfully created and seeded routine [{}] for user {} from preset [{}]", title, userId, presetName);
        return savedRoutine;
    }

    /**
     * Set a Routine Profile as Currently Active.
     * 
     * @param userId Target user ID.
     * @param routineId Target routine ID.
     * @return Updated {@link UserRoutine}.
     */
    @Transactional
    public UserRoutine activateRoutine(Long userId, Long routineId) {
        List<UserRoutine> userRoutines = routineRepository.findByUserIdOrderByCreatedAtDesc(userId);
        UserRoutine target = null;

        for (UserRoutine r : userRoutines) {
            if (r.getId().equals(routineId)) {
                r.setIsActive(true);
                target = r;
            } else {
                r.setIsActive(false);
            }
        }
        routineRepository.saveAll(userRoutines);

        if (target == null) {
            throw new IllegalArgumentException("Routine #" + routineId + " not found for user " + userId);
        }

        log.info("Activated Routine #{} '{}' for user {}", routineId, target.getTitle(), userId);
        return target;
    }

    /**
     * Log Habit Completion with Midnight Grace Window Evaluation.
     * 
     * @param userId Target user ID.
     * @param habitTitle Habit title.
     * @param sourceChannel Logging source ("WEB_DASHBOARD", "TELEGRAM", "WHATSAPP").
     * @param notes Optional notes string.
     * @return Result Map with habit status and streak count.
     */
    @Transactional
    public Map<String, Object> logHabit(Long userId, String habitTitle, String sourceChannel, String notes) {
        // Find habit by title
        HabitContract habit = habitRepository.findByUserIdAndTitleIgnoreCase(userId, habitTitle)
                .orElseGet(() -> {
                    // Auto-create habit if not found
                    UserRoutine activeRoutine = routineRepository.findByUserIdAndIsActiveTrue(userId).orElse(null);
                    Long routineId = activeRoutine != null ? activeRoutine.getId() : 1L;

                    return habitRepository.save(HabitContract.builder()
                            .userId(userId)
                            .routineId(routineId)
                            .title(habitTitle)
                            .category("CUSTOM")
                            .targetCount(1)
                            .currentStreak(0)
                            .longestStreak(0)
                            .freezePassesAvailable(2)
                            .build());
                });

        ZonedDateTime now = ZonedDateTime.now();
        LocalDate logicalDate = streakCalculator.resolveLogicalDate(now);

        // Process streak math
        streakCalculator.processStreakIncrement(habit, logicalDate);
        habitRepository.save(habit);

        // Create Habit Log audit record
        HabitLog habitLog = HabitLog.builder()
                .habitId(habit.getId())
                .userId(userId)
                .loggedForDate(logicalDate)
                .sourceChannel(sourceChannel != null ? sourceChannel : "WEB_DASHBOARD")
                .notes(notes)
                .build();
        habitLogRepository.save(habitLog);

        log.info("Logged habit [{}] for user {}. Logical Date: {}. Current Streak: {}", 
                habit.getTitle(), userId, logicalDate, habit.getCurrentStreak());

        return Map.of(
                "status", "SUCCESS",
                "habitId", habit.getId(),
                "habitTitle", habit.getTitle(),
                "currentStreak", habit.getCurrentStreak(),
                "longestStreak", habit.getLongestStreak(),
                "freezePassesLeft", habit.getFreezePassesAvailable(),
                "logicalDate", logicalDate.toString()
        );
    }

    /** Fetch User Routines. */
    public List<UserRoutine> getUserRoutines(Long userId) {
        return routineRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /** Fetch Active Routine. */
    public Optional<UserRoutine> getActiveRoutine(Long userId) {
        return routineRepository.findByUserIdAndIsActiveTrue(userId);
    }

    /** Fetch Habit Contracts. */
    public List<HabitContract> getHabitContracts(Long userId) {
        return habitRepository.findByUserId(userId);
    }
}
