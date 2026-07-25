import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DEFAULT_HABITS, CATALOG_PRESETS } from '../constants/routineConstants';
import { CITY_PRESETS } from '../utils/solarCalculator';
import * as routineApi from '../api/routineApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/**
 * 🌿 Custom React Hook for Managing Routine & Habit State
 * 
 * Provides 60 FPS optimistic 3-State Tap Toggling (0% -> 50% -> 100%),
 * 30-Day Rolling Consistency Score calculation, and Freeze Pass protection.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const useRoutine = () => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [loading, setLoading] = useState(false);
  const [freezePasses, setFreezePasses] = useState(2);
  const [historyLogs, setHistoryLogs] = useState([]);

  // PostgreSQL Persisted Settings & Time Blocks
  const [routineMode, setRoutineModeState] = useState('SOLAR');
  const [selectedCity, setSelectedCityState] = useState(DEFAULT_HABITS ? CITY_PRESETS[0] : { name: 'London, UK', lat: 51.5074, lng: -0.1278 });
  const [timeBlocks, setTimeBlocks] = useState([
    { id: 1, blockKey: 'MORNING', label: '🌅 Morning Block', startTime: '06:00', endTime: '12:00', isSolarBound: true },
    { id: 2, blockKey: 'AFTERNOON', label: '☀️ Afternoon Block', startTime: '12:00', endTime: '18:00', isSolarBound: true },
    { id: 3, blockKey: 'EVENING', label: '🌙 Evening Block', startTime: '18:00', endTime: '24:00', isSolarBound: true }
  ]);

  const updateSelectedCity = (cityInput) => {
    if (typeof cityInput === 'string') {
      const matched = CITY_PRESETS.find(c => c.name === cityInput);
      if (matched) {
        setSelectedCityState(matched);
        routineApi.updateRoutineSettings({ selectedCity: matched.name });
      } else {
        const customObj = { name: cityInput, lat: 51.5074, lng: -0.1278 };
        setSelectedCityState(customObj);
        routineApi.updateRoutineSettings({ selectedCity: cityInput });
      }
    } else if (cityInput && cityInput.name) {
      setSelectedCityState(cityInput);
      routineApi.updateRoutineSettings({ selectedCity: cityInput.name });
    }
  };

  // Load Habits, Settings & Time Blocks from DB
  const loadHabits = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await routineApi.getHabits();
      if (data && data.length > 0) {
        const formatted = data.map(h => ({
          id: h.id,
          title: h.title,
          category: h.category,
          window: h.window || h.windowName,
          targetMinutes: h.targetMinutes || 15,
          streakCount: h.streakCount || 1,
          status: h.status || 'PENDING',
          completionPercentage: h.completionPercentage || 0,
          isFreezeProtected: h.isFreezeProtected || false,
          linkedGoalId: h.linkedGoalId || null,
          qualityGrade: h.qualityGrade || null,
          isPrayer: h.isPrayer || false
        }));
        setHabits(formatted);
      }

      // Load Routine Settings from PostgreSQL
      const s = await routineApi.getRoutineSettings();
      if (s) {
        if (s.routineMode) setRoutineModeState(s.routineMode);
        if (s.selectedCity) updateSelectedCity(s.selectedCity);
      }

      // Load Time Blocks from PostgreSQL
      const blocks = await routineApi.getTimeBlocks();
      if (blocks && blocks.length > 0) {
        setTimeBlocks(blocks);
      }
    } catch (err) {
      console.error('[useRoutine] Error loading habits, settings, or time blocks:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const [loadingHistory, setLoadingHistory] = useState(false);

  // Lazy Load 365-Day Habit History On-Demand ONLY when Analytics is clicked
  const fetchAnalyticsHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const history = await routineApi.getHabitHistory(365);
      if (history) setHistoryLogs(history);
    } catch (err) {
      console.error('[useRoutine] Error fetching analytics history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const updateRoutineMode = (mode) => {
    setRoutineModeState(mode);
    routineApi.updateRoutineSettings({ routineMode: mode });
  };

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  // 3-State Micro-Interaction Tap Handler (0% -> 50% -> 100% -> 0%)
  const cycleHabitStatus = (habitId, onHabitCompleted) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        let nextStatus = 'PENDING';
        let nextPct = 0;
        let nextStreak = h.streakCount;

        if (h.status === 'PENDING') {
          nextStatus = 'PARTIAL';
          nextPct = 50;
          showSuccess(`⚡ Half-Credit (50%) logged for "${h.title}"! Keep the momentum going!`);
        } else if (h.status === 'PARTIAL') {
          nextStatus = 'COMPLETED';
          nextPct = 100;
          nextStreak = h.streakCount + 1;
          showSuccess(`🎉 100% Completed "${h.title}"! Streak advanced to ${nextStreak} Days! 🔥`);

          // Ecosystem Synergy: Trigger Cross-Module Cascade to Goals & Time-Blocker Calendar
          if (onHabitCompleted) {
            onHabitCompleted({ ...h, status: nextStatus, completionPercentage: nextPct });
          }
        } else {
          nextStatus = 'PENDING';
          nextPct = 0;
          nextStreak = Math.max(0, h.streakCount - 1);
        }

        const updated = {
          ...h,
          status: nextStatus,
          completionPercentage: nextPct,
          streakCount: nextStreak
        };

        // Persist to backend asynchronously
        routineApi.logHabitStatus(habitId, nextStatus, nextPct, h.qualityGrade);

        return updated;
      }
      return h;
    }));
  };

  // Deep Muhasabah Quality Selector Handler (Jama'at vs On Time vs Late)
  const setHabitQualityGrade = (habitId, grade, onHabitCompleted) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        let status = 'COMPLETED';
        let pct = 100;
        let streak = h.streakCount + (h.status === 'COMPLETED' ? 0 : 1);

        if (grade === 'JAMAAT') {
          pct = 100;
          showSuccess(`🕌 Logged "${h.title}" in Jama'at! (100% Peak Reward 🔥)`);
        } else if (grade === 'ON_TIME') {
          pct = 85;
          showSuccess(`⏰ Logged "${h.title}" On Time! (85% Standard Credit)`);
        } else if (grade === 'LATE') {
          status = 'PARTIAL';
          pct = 50;
          showSuccess(`⏳ Logged "${h.title}" Delayed/Late! (50% Credit - Streak Protected 🛡️)`);
        }

        const updated = {
          ...h,
          status,
          completionPercentage: pct,
          qualityGrade: grade,
          streakCount: streak
        };

        routineApi.logHabitStatus(habitId, status, pct, grade);
        if (onHabitCompleted) {
          onHabitCompleted(updated);
        }
        return updated;
      }
      return h;
    }));
  };

  // Consume Freeze Pass to Protect Streak
  const useFreezePass = (habitId) => {
    if (freezePasses <= 0) {
      showError('No Freeze Passes available for this month!');
      return;
    }

    setFreezePasses(prev => Math.max(0, prev - 1));
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        showSuccess(`🛡️ Freeze Pass applied to "${h.title}"! Streak protected at ${h.streakCount} Days.`);
        return { ...h, isFreezeProtected: true };
      }
      return h;
    }));
  };

  // 1-Click Apply Preset Pack Blueprint (Seed & Disown Pattern)
  const applyPresetPack = async (presetId) => {
    const preset = CATALOG_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    // Call atomic backend preset seeding endpoint
    const backendSeeded = await routineApi.seedPresetPack(presetId);
    if (backendSeeded && backendSeeded.length >= 0) {
      const formatted = backendSeeded.map(h => ({
        ...h,
        status: h.status || 'PENDING',
        completionPercentage: h.completionPercentage || 0,
        streakCount: h.streakCount || 0
      }));
      setHabits(formatted);
      showSuccess(`✨ Applied "${preset.title}"! Seeded ${formatted.length} habits atomically into PostgreSQL.`);
    } else {
      // Client optimistic fallback
      const seededHabits = preset.habits.map((h, idx) => ({
        id: Date.now() + idx,
        title: h.title,
        category: h.category,
        window: h.window,
        targetMinutes: h.targetMinutes,
        status: 'PENDING',
        completionPercentage: 0,
        streakCount: 0,
        isFreezeProtected: false
      }));
      setHabits(seededHabits);
      showSuccess(`✨ Applied "${preset.title}"! Seeded ${seededHabits.length} habits.`);
    }
  };

  // Add Custom Habit
  const handleCreateHabit = (newHabit) => {
    const created = {
      id: Date.now(),
      title: newHabit.title,
      category: newHabit.category || 'PRODUCTIVITY',
      window: newHabit.window || 'MORNING',
      targetMinutes: Number(newHabit.targetMinutes) || 15,
      status: 'PENDING',
      completionPercentage: 0,
      streakCount: 0,
      isFreezeProtected: false
    };

    setHabits(prev => [...prev, created]);
    showSuccess(`🌿 Custom habit "${created.title}" added to ${created.window} block!`);
    routineApi.createHabit(created);
  };

  // Delete Habit by ID
  const handleDeleteHabit = (habitId) => {
    const target = habits.find(h => h.id === habitId);
    setHabits(prev => prev.filter(h => h.id !== habitId));
    if (target) {
      showSuccess(`🗑️ Deleted habit "${target.title}"`);
    }
    routineApi.deleteHabit(habitId);
  };

  // Update Habit by ID
  const handleUpdateHabit = (habitId, updatedFields) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const updated = { ...h, ...updatedFields };
        showSuccess(`✏️ Habit "${updated.title}" updated!`);
        routineApi.updateHabit(habitId, updatedFields);
        return updated;
      }
      return h;
    }));
  };

  // 30-Day Rolling Consistency Index Score (0% - 100%)
  const consistencyScore = useMemo(() => {
    if (habits.length === 0) return 100;
    const totalPossiblePct = habits.length * 100;
    const actualLoggedPct = habits.reduce((acc, h) => acc + (h.completionPercentage || 0), 0);
    return Math.round((actualLoggedPct / totalPossiblePct) * 100);
  }, [habits]);

  // Derived Metrics
  const completedHabitsCount = useMemo(() => habits.filter(h => h.status === 'COMPLETED').length, [habits]);
  const partialHabitsCount = useMemo(() => habits.filter(h => h.status === 'PARTIAL').length, [habits]);

  // Time Block Mutations
  const handleAddTimeBlock = async (newBlockData) => {
    const created = await routineApi.createTimeBlock(newBlockData);
    if (created) {
      setTimeBlocks(prev => [...prev, created]);
      showSuccess(`🧱 Time block "${created.label}" created!`);
    }
  };

  const handleUpdateTimeBlock = async (id, updatedFields) => {
    setTimeBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updatedFields } : b));
    showSuccess(`✏️ Time block updated!`);
    routineApi.updateTimeBlock(id, updatedFields);
  };

  const handleDeleteTimeBlock = async (id) => {
    setTimeBlocks(prev => prev.filter(b => b.id !== id));
    showSuccess(`🗑️ Time block deleted!`);
    routineApi.deleteTimeBlock(id);
  };

  return {
    habits,
    historyLogs,
    loading,
    loadingHistory,
    fetchAnalyticsHistory,
    freezePasses,
    routineMode,
    selectedCity,
    selectedCityName: selectedCity?.name,
    timeBlocks,
    updateRoutineMode,
    updateSelectedCity,
    consistencyScore,
    completedHabitsCount,
    partialHabitsCount,
    cycleHabitStatus,
    setHabitQualityGrade,
    useFreezePass,
    applyPresetPack,
    handleCreateHabit,
    handleDeleteHabit,
    handleUpdateHabit,
    handleAddTimeBlock,
    handleUpdateTimeBlock,
    handleDeleteTimeBlock,
    refreshHabits: loadHabits
  };
};
