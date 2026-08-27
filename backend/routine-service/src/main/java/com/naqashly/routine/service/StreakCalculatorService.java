package com.naqashly.routine.service;

import com.naqashly.routine.entity.HabitContract;
import com.naqashly.routine.entity.StreakFreezeLog;
import com.naqashly.routine.repository.StreakFreezeLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * <h1>Streak Math & Midnight Grace Window Calculator Engine</h1>
 * 
 * <p><b>WHAT:</b> Calculates habit streak increments, 2-hour midnight grace windows, and automatic freeze pass protections.</p>
 * <p><b>WHY:</b> Prevents user frustration by allowing habits logged between midnight and 02:00 AM to count for the previous day, and consumes freeze passes when a day is missed.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Service
public class StreakCalculatorService {

    private static final Logger log = LoggerFactory.getLogger(StreakCalculatorService.class);
    private static final LocalTime GRACE_WINDOW_END = LocalTime.of(2, 0); // 02:00 AM

    private final StreakFreezeLogRepository freezeLogRepository;

    public StreakCalculatorService(StreakFreezeLogRepository freezeLogRepository) {
        this.freezeLogRepository = freezeLogRepository;
    }

    /**
     * Compute Logical Target Date accounting for 2-hour midnight grace period.
     * 
     * @param now Current {@link ZonedDateTime} timestamp.
     * @return Target {@link LocalDate} (if now is between 00:00 and 02:00 AM, returns yesterday).
     */
    public LocalDate resolveLogicalDate(ZonedDateTime now) {
        LocalTime time = now.toLocalTime();
        if (time.isBefore(GRACE_WINDOW_END)) {
            log.info("Midnight Grace Window Active: Timestamp {} maps to logical date yesterday {}", now, now.toLocalDate().minusDays(1));
            return now.toLocalDate().minusDays(1);
        }
        return now.toLocalDate();
    }

    /**
     * Evaluate and update streak count on a habit contract.
     * 
     * @param habit Target {@link HabitContract}.
     * @param targetDate Resolved logical completion date.
     */
    public void processStreakIncrement(HabitContract habit, LocalDate targetDate) {
        LocalDate lastDate = habit.getLastCompletedDate();

        if (lastDate == null) {
            // First time completing habit
            habit.setCurrentStreak(1);
            habit.setLongestStreak(Math.max(1, habit.getLongestStreak()));
            habit.setLastCompletedDate(targetDate);
            log.info("Habit [{}] initial completion: Streak = 1", habit.getTitle());
            return;
        }

        if (lastDate.equals(targetDate)) {
            log.info("Habit [{}] already completed for target date {}", habit.getTitle(), targetDate);
            return;
        }

        if (lastDate.equals(targetDate.minusDays(1))) {
            // Consecutive day completion!
            int newStreak = habit.getCurrentStreak() + 1;
            habit.setCurrentStreak(newStreak);
            habit.setLongestStreak(Math.max(newStreak, habit.getLongestStreak()));
            habit.setLastCompletedDate(targetDate);
            log.info("Habit [{}] consecutive completion: New Streak = {}", habit.getTitle(), newStreak);
            return;
        }

        // Missed one or more days! Check for Streak Freeze Protection
        long daysDiff = targetDate.toEpochDay() - lastDate.toEpochDay();
        if (daysDiff == 2 && habit.getFreezePassesAvailable() > 0) {
            // Missed exactly 1 day — Consume Streak Freeze Pass!
            habit.setFreezePassesAvailable(habit.getFreezePassesAvailable() - 1);
            int newStreak = habit.getCurrentStreak() + 1;
            habit.setCurrentStreak(newStreak);
            habit.setLongestStreak(Math.max(newStreak, habit.getLongestStreak()));
            habit.setLastCompletedDate(targetDate);

            // Record audit log
            StreakFreezeLog freezeLog = StreakFreezeLog.builder()
                    .habitId(habit.getId())
                    .userId(habit.getUserId())
                    .frozenDate(targetDate.minusDays(1))
                    .reason("Automatic Freeze Pass protection for missed day " + targetDate.minusDays(1))
                    .build();
            freezeLogRepository.save(freezeLog);

            log.info("Habit [{}] consumed Streak Freeze Pass for {}! Protected Streak = {}", habit.getTitle(), targetDate.minusDays(1), newStreak);
        } else {
            // Streak broken — Reset to 1
            log.warn("Habit [{}] streak broken (Last: {}, Target: {}). Resetting streak from {} to 1.", 
                    habit.getTitle(), lastDate, targetDate, habit.getCurrentStreak());
            habit.setCurrentStreak(1);
            habit.setLastCompletedDate(targetDate);
        }
    }
}
