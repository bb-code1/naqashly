package com.naqashly.monolith.routine.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.context.annotation.Configuration;

import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

/**
 * <h1>Read-Only Preset Catalog Blueprints</h1>
 * 
 * <p><b>WHAT:</b> Immutable preset routine templates (Secular, Mindfulness, Productivity, Islamic, Christian, etc.).</p>
 * <p><b>WHY:</b> Decouples preset definitions from database schemas while offering starter kits that users can seed and customize 100%.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Configuration
public class PresetCatalogConfig {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PresetBlock {
        private String startTime;
        private String endTime;
        private String title;
        private String category;
        private Boolean isFlexible;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PresetHabit {
        private String title;
        private String category;
        private Integer targetCount;
    }

    /**
     * Get Routine Block Presets for a given Profile Blueprint.
     */
    public static List<PresetBlock> getBlocksForPreset(String presetName) {
        if (presetName == null) return Collections.emptyList();

        return switch (presetName.toUpperCase()) {
            case "SECULAR", "MINDFULNESS" -> List.of(
                    new PresetBlock("06:00", "07:00", "Morning Meditation & Priming", "MINDFULNESS", true),
                    new PresetBlock("07:00", "08:30", "Exercise & Healthy Breakfast", "HEALTH", false),
                    new PresetBlock("09:00", "17:00", "Deep Focused Work & Learning", "WORK", false),
                    new PresetBlock("18:00", "19:30", "Physical Workout & Cardio", "HEALTH", true),
                    new PresetBlock("21:30", "22:30", "Evening Reflection & Gratitude", "REST", true)
            );
            case "PRODUCTIVITY" -> List.of(
                    new PresetBlock("05:30", "06:30", "Cold Shower & Workout", "HEALTH", false),
                    new PresetBlock("07:00", "08:30", "Deep Work Sprint #1", "WORK", false),
                    new PresetBlock("09:00", "17:00", "Execution & Team Collaboration", "WORK", false),
                    new PresetBlock("20:30", "22:00", "Reading & Skill Building", "WORK", true)
            );
            case "ISLAMIC" -> List.of(
                    new PresetBlock("05:00", "06:00", "Fajr Prayer & Morning Azkaar", "SPIRITUAL", false),
                    new PresetBlock("09:00", "17:00", "Work & Midday Prayers", "WORK", false),
                    new PresetBlock("21:30", "22:30", "Isha Prayer & Quran Reading", "SPIRITUAL", true)
            );
            case "CHRISTIAN" -> List.of(
                    new PresetBlock("06:30", "07:30", "Morning Devotional & Prayer", "SPIRITUAL", true),
                    new PresetBlock("09:00", "17:00", "Career & Daily Work", "WORK", false),
                    new PresetBlock("21:00", "22:00", "Bible Study & Evening Peace", "SPIRITUAL", true)
            );
            default -> Collections.emptyList(); // CUSTOM starts blank!
        };
    }

    /**
     * Get Habit Contract Presets for a given Profile Blueprint.
     */
    public static List<PresetHabit> getHabitsForPreset(String presetName) {
        if (presetName == null) return Collections.emptyList();

        return switch (presetName.toUpperCase()) {
            case "SECULAR", "MINDFULNESS" -> List.of(
                    new PresetHabit("Morning Meditation", "MINDFULNESS", 1),
                    new PresetHabit("Gratitude Journaling", "MINDFULNESS", 1),
                    new PresetHabit("Daily Exercise", "HEALTH", 1),
                    new PresetHabit("Read 15 Pages", "LEARNING", 1)
            );
            case "PRODUCTIVITY" -> List.of(
                    new PresetHabit("Deep Work 2+ Hours", "WORK", 1),
                    new PresetHabit("Daily Workout", "HEALTH", 1),
                    new PresetHabit("No Distractions Sprint", "WORK", 1)
            );
            case "ISLAMIC" -> List.of(
                    new PresetHabit("5 Daily Prayers", "SPIRITUAL", 5),
                    new PresetHabit("Quran Recitation", "SPIRITUAL", 1),
                    new PresetHabit("Morning Azkaar", "SPIRITUAL", 1)
            );
            case "CHRISTIAN" -> List.of(
                    new PresetHabit("Morning Devotional", "SPIRITUAL", 1),
                    new PresetHabit("Bible Reading", "SPIRITUAL", 1),
                    new PresetHabit("Evening Gratitude", "SPIRITUAL", 1)
            );
            default -> Collections.emptyList();
        };
    }
}
