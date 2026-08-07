import React, { useState, useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

/**
 * Native Naqashly Interactive Time-Blocking Calendar Component (Refactored & Scrollable).
 */
export const TimeBlockerCalendar = ({
  tasks = [],
  goals = [],
  habits = [],
  dbTimeBlocks = [],
  onSaveTimeBlock,
  onDeleteTimeBlock,
  onUpdateTaskStatus,
  onOpenCreateTaskModal
}) => {
  const [startHour, setStartHour] = useState(7);    // Default 07:00 AM
  const [endHour, setEndHour] = useState(21);      // Default 09:00 PM
  const [dayRangeMode, setDayRangeMode] = useState('7-DAY'); // '7-DAY' | '5-DAY' | 'SINGLE'
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedTaskToBlock, setSelectedTaskToBlock] = useState(null);

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = startHour; h <= endHour; h++) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      const formatted = `${String(displayHour).padStart(2, '0')}:00 ${ampm}`;
      slots.push(formatted);
    }
    return slots;
  }, [startHour, endHour]);

  const weekDays = useMemo(() => {
    const list = [];
    const baseDate = customDate ? new Date(customDate + 'T00:00:00') : new Date();

    if (dayRangeMode === 'SINGLE') {
      const isToday = baseDate.toDateString() === new Date().toDateString();
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      list.push({
        dateStr: baseDate.toISOString().split('T')[0],
        dayName: daysOfWeek[baseDate.getDay()],
        formattedDate: `${baseDate.getMonth() + 1}/${baseDate.getDate()}`,
        isToday
      });
      return list;
    }

    const currentDay = baseDate.getDay();
    const distanceToMon = (currentDay === 0 ? -6 : 1 - currentDay) + (currentWeekOffset * 7);
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + distanceToMon);

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const totalDays = dayRangeMode === '5-DAY' ? 5 : 7;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = d.toDateString() === new Date().toDateString();

      list.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: daysOfWeek[i],
        formattedDate: `${d.getMonth() + 1}/${d.getDate()}`,
        isToday
      });
    }
    return list;
  }, [customDate, currentWeekOffset, dayRangeMode]);

  const [scheduledBlocks, setScheduledBlocks] = useState([
    { id: 101, dayIndex: 0, slot: '09:00 AM', title: 'Deep Work: System Architecture', priority: 'HIGH', status: 'COMPLETED' },
    { id: 102, dayIndex: 1, slot: '10:00 AM', title: 'Sprint Security Audit', priority: 'URGENT', status: 'TODO' },
    { id: 103, dayIndex: 2, slot: '02:00 PM', title: 'Database Optimization', priority: 'HIGH', status: 'TODO' },
    { id: 104, dayIndex: 3, slot: '11:00 AM', title: 'Refactor Productivity Suite', priority: 'MEDIUM', status: 'COMPLETED' }
  ]);

  const habitBlocks = useMemo(() => {
    const list = [];
    if (!habits || habits.length === 0) return list;

    weekDays.forEach((day, dayIdx) => {
      habits.forEach(h => {
        let slotTime = null;
        if (h.window === 'MORNING') slotTime = '08:00 AM';
        else if (h.window === 'AFTERNOON') slotTime = '01:00 PM';
        else if (h.window === 'EVENING') slotTime = '07:00 PM';

        if (slotTime) {
          list.push({
            id: `habit-${h.id}-${dayIdx}`,
            dayIndex: dayIdx,
            slot: slotTime,
            blockDate: day.dateStr,
            title: `🌿 ${h.title}`,
            priority: 'MEDIUM',
            status: day.isToday ? h.status : 'TODO',
            isHabit: true,
            originalHabitId: h.id
          });
        }
      });
    });
    return list;
  }, [habits, weekDays]);

  const allBlocks = useMemo(() => {
    const dbFormatted = dbTimeBlocks.map(b => ({
      id: b.id,
      dayIndex: b.dayIndex,
      slot: b.slotTime,
      blockDate: b.blockDate,
      title: b.title,
      priority: b.priority || 'HIGH',
      status: b.status || 'TODO',
      taskId: b.taskId
    }));
    const uniqueDbIds = new Set(dbFormatted.map(b => `${b.dayIndex}-${b.slot}`));
    const localFiltered = scheduledBlocks.filter(b => !uniqueDbIds.has(`${b.dayIndex}-${b.slot}`));
    const mergedTasks = [...dbFormatted, ...localFiltered];

    const occupiedSlots = new Set(mergedTasks.map(b => `${b.dayIndex}-${b.slot}`));
    const filteredHabits = habitBlocks.filter(hb => !occupiedSlots.has(`${hb.dayIndex}-${hb.slot}`));

    return [...mergedTasks, ...filteredHabits];
  }, [dbTimeBlocks, scheduledBlocks, habitBlocks]);

  const unscheduledTasks = useMemo(() => {
    return tasks.filter(t => t.status !== 'COMPLETED');
  }, [tasks]);

  const handleSlotClick = async (dayIndex, slotTime) => {
    if (!selectedTaskToBlock) return;
    const targetDay = weekDays[dayIndex];
    if (!targetDay) return;

    if (onSaveTimeBlock) {
      await onSaveTimeBlock({
        dayIndex,
        slotTime,
        blockDate: targetDay.dateStr,
        title: selectedTaskToBlock.title,
        priority: selectedTaskToBlock.priority,
        taskId: selectedTaskToBlock.id
      });
    } else {
      const newBlock = {
        id: Date.now(),
        dayIndex,
        slot: slotTime,
        title: selectedTaskToBlock.title,
        priority: selectedTaskToBlock.priority,
        status: 'TODO',
        taskId: selectedTaskToBlock.id
      };
      setScheduledBlocks(prev => [...prev, newBlock]);
    }
    setSelectedTaskToBlock(null);
  };

  const toggleBlockStatus = async (blockId, taskId) => {
    const block = allBlocks.find(b => b.id === blockId);
    if (!block) return;
    if (block.isHabit) return; // Habits completed via routine module/dashboard

    const isCompleted = block.status === 'COMPLETED';
    const nextStatus = isCompleted ? 'TODO' : 'COMPLETED';

    if (dbTimeBlocks.some(b => b.id === blockId)) {
      if (onSaveTimeBlock) {
        await onSaveTimeBlock({
          id: block.id,
          dayIndex: block.dayIndex,
          slotTime: block.slot,
          blockDate: block.blockDate,
          title: block.title,
          priority: block.priority,
          taskId: block.taskId,
          status: nextStatus
        });
      }
    } else {
      setScheduledBlocks(prev => prev.map(b => {
        if (b.id === blockId) {
          return { ...b, status: nextStatus };
        }
        return b;
      }));
    }
  };

  const prevWeek = () => setCurrentWeekOffset(o => o - 1);
  const nextWeek = () => setCurrentWeekOffset(o => o + 1);
  const resetWeek = () => {
    setCurrentWeekOffset(0);
    setCustomDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <Card className="calendar-card-panel">
      {/* Calendar Header Controls */}
      <div className="calendar-panel-header">
        <div className="calendar-left-nav">
          <h3 className="calendar-panel-title">📅 Time-Blocker</h3>
          <div className="calendar-week-nav-row">
            <button type="button" onClick={prevWeek} className="nav-week-btn">← Prev Week</button>
            <button type="button" onClick={resetWeek} className="nav-week-btn font-bold">Today</button>
            <button type="button" onClick={nextWeek} className="nav-week-btn">Next Week →</button>
          </div>
        </div>

        <div className="calendar-right-settings">
          <div className="settings-controls-row">
            {/* View Mode */}
            <div className="select-wrapper">
              <select
                value={dayRangeMode}
                onChange={(e) => setDayRangeMode(e.target.value)}
                className="calendar-mode-select"
              >
                <option value="7-DAY">7 Days View</option>
                <option value="5-DAY">5 Days View</option>
                <option value="SINGLE">Single Day</option>
              </select>
            </div>

            {/* Custom Date Input */}
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setCurrentWeekOffset(0);
              }}
              className="calendar-date-picker-input"
            />

            {/* Time Presets */}
            <div className="time-range-presets-row">
              <button
                type="button"
                onClick={() => { setStartHour(7); setEndHour(21); }}
                className={`preset-range-btn ${startHour === 7 && endHour === 21 ? 'active' : ''}`}
              >
                🌅 Day (7a-9p)
              </button>

              <button
                type="button"
                onClick={() => { setStartHour(8); setEndHour(18); }}
                className={`preset-range-btn ${startHour === 8 && endHour === 18 ? 'active' : ''}`}
              >
                ☀️ Work (8a-6p)
              </button>

              <button
                type="button"
                onClick={() => { setStartHour(18); setEndHour(23); }}
                className={`preset-range-btn ${startHour === 18 && endHour === 23 ? 'active' : ''}`}
              >
                🌙 Eve (6p-11p)
              </button>

              <button
                type="button"
                onClick={() => { setStartHour(0); setEndHour(23); }}
                className={`preset-range-btn ${startHour === 0 && endHour === 23 ? 'active' : ''}`}
              >
                🌐 24h Full
              </button>
            </div>

            {/* Micro Stepper Pills */}
            <div className="time-stepper-pill-box">
              <button
                type="button"
                onClick={() => setStartHour(h => Math.max(0, h - 1))}
                disabled={startHour === 0}
                className="stepper-btn"
              >
                ‹
              </button>
              <span className="stepper-value font-mono">
                {startHour === 0 ? '12:00 AM' : startHour === 12 ? '12:00 PM' : `${String(startHour % 12 === 0 ? 12 : startHour % 12).padStart(2, '0')}:00 ${startHour >= 12 ? 'PM' : 'AM'}`}
              </span>
              <button
                type="button"
                onClick={() => setStartHour(h => Math.min(endHour - 1, h + 1))}
                disabled={startHour >= endHour - 1}
                className="stepper-btn"
              >
                ›
              </button>
              <span className="stepper-separator">to</span>
              <button
                type="button"
                onClick={() => setEndHour(h => Math.max(startHour + 1, h - 1))}
                disabled={endHour <= startHour + 1}
                className="stepper-btn"
              >
                ‹
              </button>
              <span className="stepper-value font-mono">
                {endHour === 0 ? '12:00 AM' : endHour === 12 ? '12:00 PM' : `${String(endHour % 12 === 0 ? 12 : endHour % 12).padStart(2, '0')}:00 ${endHour >= 12 ? 'PM' : 'AM'}`}
              </span>
              <button
                type="button"
                onClick={() => setEndHour(h => Math.min(23, h + 1))}
                disabled={endHour === 23}
                className="stepper-btn"
              >
                ›
              </button>
            </div>
          </div>

          {onOpenCreateTaskModal && (
            <Button variant="emerald" onClick={onOpenCreateTaskModal}>+ Priority Task</Button>
          )}
        </div>
      </div>

      <div className="calendar-layout-grid">
        {/* Left Sidebar: Unscheduled Tasks Drawer */}
        <div className="calendar-unscheduled-drawer">
          <h4 className="drawer-title">
            <span>📋 Unscheduled Tasks ({unscheduledTasks.length})</span>
          </h4>
          <p className="drawer-help-text">
            Click a task below, then click any calendar time slot to schedule it.
          </p>

          {unscheduledTasks.length === 0 ? (
            <div className="drawer-empty-label">
              🎉 All tasks scheduled or completed!
            </div>
          ) : (
            <div className="drawer-tasks-scroll-list">
              {unscheduledTasks.map(t => {
                const isSelected = selectedTaskToBlock?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskToBlock(isSelected ? null : t)}
                    className={`unscheduled-task-row-card ${isSelected ? 'active' : ''}`}
                  >
                    <div className="unscheduled-task-title">
                      {t.title}
                    </div>
                    <div className="unscheduled-task-meta-row">
                      <span className="unscheduled-task-category">🏷️ {t.category || 'General'}</span>
                      <Badge variant={t.priority === 'HIGH' || t.priority === 'URGENT' ? 'danger' : 'indigo'}>
                        {t.priority}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Main Grid: High-Contrast Time Grid */}
        <div className="calendar-grid-scroll-container">
          <table className="calendar-table-grid">
            {/* Header Row: Days of Week */}
            <thead>
              <tr className="calendar-header-tr">
                <th className="calendar-time-col-header">
                  Time Slot
                </th>
                {weekDays.map((d, dayIdx) => (
                  <th
                    key={dayIdx}
                    className={`calendar-day-col-header ${d.isToday ? 'today-highlight' : ''}`}
                  >
                    <div className={`day-name-label ${d.isToday ? 'today-text' : ''}`}>
                      {d.dayName}
                    </div>
                    <div className="day-date-label">{d.formattedDate}</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Time Slot Rows */}
            <tbody>
              {timeSlots.map((slotTime, slotIdx) => (
                <tr key={slotIdx} className="calendar-slot-tr">
                  {/* Left Column: High Contrast Theme-Aware Slot Time */}
                  <td className="calendar-time-cell font-mono">
                    {slotTime}
                  </td>

                  {/* Day Columns */}
                  {weekDays.map((d, dayIdx) => {
                    const block = allBlocks.find(b => b.dayIndex === dayIdx && b.slot === slotTime);
                    const isSelectedMode = selectedTaskToBlock !== null;

                    return (
                      <td
                        key={dayIdx}
                        onClick={() => handleSlotClick(dayIdx, slotTime)}
                        className={`calendar-day-cell ${isSelectedMode ? 'selecting-mode' : ''}`}
                      >
                        {block ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBlockStatus(block.id, block.taskId);
                            }}
                            className={`calendar-block-item ${block.isHabit ? 'habit' : ''} ${block.status === 'COMPLETED' ? 'completed' : block.priority === 'URGENT' ? 'urgent' : 'pending'}`}
                          >
                            <div className={`block-item-title ${block.status === 'COMPLETED' ? 'strikethrough' : ''}`}>
                              {block.status === 'COMPLETED' ? '✓ ' : ''}{block.title}
                            </div>
                            <div className={`block-item-action-label ${block.status === 'COMPLETED' ? 'completed-text' : ''}`}>
                              {block.isHabit ? 'Habit' : block.status === 'COMPLETED' ? 'Done' : 'Click to complete'}
                            </div>
                          </div>
                        ) : isSelectedMode ? (
                          <div className="calendar-schedule-affordance">
                            <div className="calendar-schedule-label">+ Schedule Here</div>
                            <div className="calendar-block-preview font-mono">
                              ✨ Place: {selectedTaskToBlock.title}
                            </div>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};
