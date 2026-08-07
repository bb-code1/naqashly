import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculateSolarBoundaries } from '../../../utils/solarCalculator';

/**
 * 📅 Today's Schedule & Daily Blueprint Timeline Widget
 * 
 * Displays today's scheduled tasks and habits chronologically with HSL glassmorphism.
 */
export const TodayScheduleWidget = ({
  timeBlocks = [],
  tasks = [],
  habits = [],
  selectedCity = null,
  routineMode = 'SOLAR',
  onNavigateMode,
  onUpdateBlockStatus
}) => {
  const todayDateStr = new Date().toISOString().split('T')[0];

  // 1. Calculate Solar boundaries
  const solar = selectedCity ? calculateSolarBoundaries(selectedCity) : null;

  // Helper to parse time strings to 24h hour numbers for chronological sorting
  const getHourValue = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(' ')[0].split(':');
    const hour = Number(parts[0]);
    const isPM = timeStr.includes('PM');
    return isPM ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
  };

  const getHourSlot = (timeStr) => {
    if (!timeStr) return null;
    try {
      const realHour = getHourValue(timeStr);
      const ampm = realHour >= 12 ? 'PM' : 'AM';
      const displayHour = realHour % 12 === 0 ? 12 : realHour % 12;
      return `${String(displayHour).padStart(2, '0')}:00 ${ampm}`;
    } catch (e) {
      return null;
    }
  };

  // 2. Filter & format today's database time blocks
  const todayTaskBlocks = useMemo(() => {
    return timeBlocks
      .filter(b => b.blockDate === todayDateStr)
      .map(b => ({
        id: b.id,
        slotTime: b.slotTime,
        hourVal: getHourValue(b.slotTime),
        title: b.title,
        status: b.status || 'TODO',
        priority: b.priority || 'HIGH',
        isHabit: false,
        rawBlock: b
      }));
  }, [timeBlocks, todayDateStr]);

  // 3. Map active habits into today's timeline slots
  const todayHabitBlocks = useMemo(() => {
    const list = [];
    if (!habits || habits.length === 0) return list;

    habits.forEach(h => {
      let slotTime = null;
      const titleLower = h.title.toLowerCase();

      // Map prayers specifically
      if (h.isPrayer || titleLower.includes('fajr')) {
        slotTime = getHourSlot(solar?.fajrStr) || '05:00 AM';
      } else if (titleLower.includes('dhuhr') || titleLower.includes('zuhr') || titleLower.includes('zuhur')) {
        slotTime = getHourSlot(solar?.dhuhrStr) || '12:00 PM';
      } else if (titleLower.includes('asr')) {
        slotTime = getHourSlot(solar?.asrStr) || '03:00 PM';
      } else if (titleLower.includes('maghrib')) {
        slotTime = getHourSlot(solar?.maghribStr) || '06:00 PM';
      } else if (titleLower.includes('isha')) {
        slotTime = getHourSlot(solar?.ishaStr) || '08:00 PM';
      } else {
        // Map standard window habits
        if (h.window === 'MORNING') {
          slotTime = routineMode === 'SOLAR' ? (getHourSlot(solar?.fajrStr) || '05:00 AM') : '08:00 AM';
        } else if (h.window === 'AFTERNOON') {
          slotTime = routineMode === 'SOLAR' ? (getHourSlot(solar?.dhuhrStr) || '12:00 PM') : '01:00 PM';
        } else if (h.window === 'EVENING') {
          slotTime = routineMode === 'SOLAR' ? (getHourSlot(solar?.maghribStr) || '06:00 PM') : '07:00 PM';
        }
      }

      if (slotTime) {
        list.push({
          id: `habit-${h.id}`,
          slotTime,
          hourVal: getHourValue(slotTime),
          title: h.title,
          status: h.status || 'PENDING',
          priority: 'MEDIUM',
          isHabit: true,
          rawHabit: h
        });
      }
    });
    return list;
  }, [habits, solar, routineMode]);

  // 4. Merge and sort chronologically
  const timelineItems = useMemo(() => {
    const occupiedSlots = new Set(todayTaskBlocks.map(b => b.slotTime));
    const filteredHabits = todayHabitBlocks.filter(hb => !occupiedSlots.has(hb.slotTime));
    return [...todayTaskBlocks, ...filteredHabits].sort((a, b) => a.hourVal - b.hourVal);
  }, [todayTaskBlocks, todayHabitBlocks]);

  const handleToggle = async (item) => {
    if (item.isHabit) return; // Habits managed via dashboard habit widget
    if (onUpdateBlockStatus) {
      const nextStatus = item.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
      await onUpdateBlockStatus({
        ...item.rawBlock,
        status: nextStatus
      });
    }
  };

  return (
    <div className="dashboard-card widget-goals">
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">
          <span>📅</span> Today's Blueprint
        </h3>
        <button
          type="button"
          onClick={() => onNavigateMode?.('PRODUCTIVITY')}
          className="dashboard-card-link"
          style={{ color: '#6366F1' }}
        >
          Open Calendar ➔
        </button>
      </div>

      {timelineItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No scheduled routines or tasks for today. Open the calendar to plan your day!
        </div>
      ) : (
        <div className="dashboard-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {timelineItems.map(item => {
            const isDone = item.status === 'COMPLETED' || item.status === 'SUCCESS';
            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleToggle(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  background: item.isHabit 
                    ? (isDone ? 'hsla(160, 80%, 45%, 0.12)' : 'hsla(160, 80%, 45%, 0.04)')
                    : (isDone ? 'hsla(142, 70%, 45%, 0.12)' : 'hsla(230, 80%, 65%, 0.08)'),
                  border: item.isHabit
                    ? (isDone ? '1px solid hsla(160, 80%, 45%, 0.5)' : '1px dashed hsla(160, 80%, 45%, 0.35)')
                    : (isDone ? '1px solid hsla(142, 70%, 45%, 0.5)' : '1px solid hsla(230, 80%, 65%, 0.3)'),
                  cursor: item.isHabit ? 'default' : 'pointer',
                  boxShadow: isDone ? '0 4px 12px rgba(16, 185, 129, 0.08)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '900', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {item.slotTime}
                  </span>
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    color: 'var(--text-heading)',
                    textDecoration: isDone ? 'line-through' : 'none',
                    opacity: isDone ? 0.7 : 1
                  }}>
                    {item.title}
                  </span>
                </div>

                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  color: isDone ? '#10B981' : '#6366F1',
                  background: isDone ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '6px'
                }}>
                  {isDone ? 'Done' : item.isHabit ? 'Habit' : 'Todo'}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
