import React, { useState, useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

/**
 * Native Naqashly Interactive Time-Blocking Calendar Component.
 * Supports 24-Hour Custom Range Selection, Custom Date Picker, Day Range Filters,
 * High-Contrast Dark Theme Time Text, Unscheduled Task Drawer, and Task Completion Auto-Advance.
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
export const TimeBlockerCalendar = ({
  tasks = [],
  goals = [],
  dbTimeBlocks = [],
  onSaveTimeBlock,
  onDeleteTimeBlock,
  onUpdateTaskStatus,
  onOpenCreateTaskModal
}) => {
  // User Customizable Time & Date Preferences
  const [startHour, setStartHour] = useState(7);    // Default 07:00 AM
  const [endHour, setEndHour] = useState(21);      // Default 09:00 PM
  const [dayRangeMode, setDayRangeMode] = useState('7-DAY'); // '7-DAY' | '5-DAY' | 'SINGLE'
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedTaskToBlock, setSelectedTaskToBlock] = useState(null);

  // Compute Dynamic Time Slots based on user's custom startHour and endHour (All 24 Hours Supported)
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

  // Compute Days of Active Week / Custom Selected Date
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

    // Move to Monday of target week
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

  // Merge Local & DB Scheduled Time Blocks State Mapping
  const [scheduledBlocks, setScheduledBlocks] = useState([
    { id: 101, dayIndex: 0, slot: '09:00 AM', title: 'Deep Work: System Architecture', priority: 'HIGH', status: 'COMPLETED' },
    { id: 102, dayIndex: 1, slot: '10:00 AM', title: 'Sprint Security Audit', priority: 'URGENT', status: 'TODO' },
    { id: 103, dayIndex: 2, slot: '02:00 PM', title: 'Database Optimization', priority: 'HIGH', status: 'TODO' },
    { id: 104, dayIndex: 3, slot: '11:00 AM', title: 'Refactor Productivity Suite', priority: 'MEDIUM', status: 'COMPLETED' }
  ]);

  // Combine DB & Local Blocks
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
    return [...scheduledBlocks, ...dbFormatted];
  }, [scheduledBlocks, dbTimeBlocks]);

  // Unscheduled Pending Tasks
  const unscheduledTasks = useMemo(() => {
    return tasks.filter(t => t.status !== 'COMPLETED');
  }, [tasks]);

  // Add Task to Time Slot with Live DB Sync
  const handleSlotClick = (dayIdx, slotTime) => {
    if (selectedTaskToBlock) {
      const targetDateStr = weekDays[dayIdx]?.dateStr || customDate;
      const newBlock = {
        id: Date.now(),
        dayIndex: dayIdx,
        slotTime: slotTime,
        blockDate: targetDateStr,
        title: selectedTaskToBlock.title,
        priority: selectedTaskToBlock.priority || 'HIGH',
        status: selectedTaskToBlock.status || 'TODO',
        taskId: selectedTaskToBlock.id
      };
      setScheduledBlocks(prev => [...prev.filter(b => !(b.dayIndex === dayIdx && b.slot === slotTime)), newBlock]);

      if (onSaveTimeBlock) {
        onSaveTimeBlock(newBlock);
      }
      setSelectedTaskToBlock(null);
    }
  };

  // Toggle Block Completion with Live DB Sync
  const toggleBlockStatus = (blockId, taskId) => {
    setScheduledBlocks(prev => prev.map(b => {
      if (b.id === blockId) {
        const nextStatus = b.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
        if (taskId && onUpdateTaskStatus) {
          onUpdateTaskStatus(taskId, nextStatus);
        }
        const updated = { ...b, status: nextStatus };
        if (onSaveTimeBlock && typeof blockId === 'number' && blockId > 1000) {
          onSaveTimeBlock(updated);
        }
        return updated;
      }
      return b;
    }));
  };

  return (
    <Card style={{ padding: '1.5rem' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📅 Native Interactive Time-Blocker Calendar
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Schedule tasks into hourly focus slots. Click any slot to block time or complete focus blocks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Custom Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>📅 Date:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setCurrentWeekOffset(0);
              }}
              style={{
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-heading)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.2rem 0.45rem',
                fontSize: '0.78rem',
                outline: 'none',
                fontWeight: '700'
              }}
            />
          </div>

          {/* Week Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Button variant="subtle" onClick={() => setCurrentWeekOffset(p => p - 1)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
              ◀ Prev
            </Button>
            <Button variant="subtle" onClick={() => { setCustomDate(new Date().toISOString().split('T')[0]); setCurrentWeekOffset(0); }} style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem', fontWeight: '700' }}>
              Today
            </Button>
            <Button variant="subtle" onClick={() => setCurrentWeekOffset(p => p + 1)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
              Next ▶
            </Button>
          </div>

          {/* Day Range Mode Selector */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setDayRangeMode('7-DAY')}
              style={{
                background: dayRangeMode === '7-DAY' ? 'var(--accent-indigo)' : 'transparent',
                color: dayRangeMode === '7-DAY' ? '#FFF' : 'var(--text-muted)',
                border: 'none', borderRadius: '6px', padding: '0.3rem 0.65rem', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer'
              }}
            >
              7-Day Week
            </button>
            <button
              type="button"
              onClick={() => setDayRangeMode('5-DAY')}
              style={{
                background: dayRangeMode === '5-DAY' ? 'var(--accent-indigo)' : 'transparent',
                color: dayRangeMode === '5-DAY' ? '#FFF' : 'var(--text-muted)',
                border: 'none', borderRadius: '6px', padding: '0.3rem 0.65rem', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer'
              }}
            >
              5-Day Work
            </button>
            <button
              type="button"
              onClick={() => setDayRangeMode('SINGLE')}
              style={{
                background: dayRangeMode === 'SINGLE' ? 'var(--accent-indigo)' : 'transparent',
                color: dayRangeMode === 'SINGLE' ? '#FFF' : 'var(--text-muted)',
                border: 'none', borderRadius: '6px', padding: '0.3rem 0.65rem', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer'
              }}
            >
              Single Day
            </button>
          </div>

          {/* Micro-Pill Hour Presets & Sleek Steppers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-heading)', fontWeight: '700' }}>Hours:</span>

            {/* 1-Click Presets */}
            <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', gap: '0.2rem' }}>
              <button
                type="button"
                onClick={() => { setStartHour(8); setEndHour(18); }}
                style={{
                  background: startHour === 8 && endHour === 18 ? 'var(--accent-indigo)' : 'transparent',
                  color: startHour === 8 && endHour === 18 ? '#FFF' : 'var(--text-muted)',
                  border: 'none', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer'
                }}
              >
                ☀️ Work (8a-6p)
              </button>

              <button
                type="button"
                onClick={() => { setStartHour(18); setEndHour(23); }}
                style={{
                  background: startHour === 18 && endHour === 23 ? 'var(--accent-indigo)' : 'transparent',
                  color: startHour === 18 && endHour === 23 ? '#FFF' : 'var(--text-muted)',
                  border: 'none', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer'
                }}
              >
                🌙 Eve (6p-11p)
              </button>

              <button
                type="button"
                onClick={() => { setStartHour(0); setEndHour(23); }}
                style={{
                  background: startHour === 0 && endHour === 23 ? 'var(--accent-indigo)' : 'transparent',
                  color: startHour === 0 && endHour === 23 ? '#FFF' : 'var(--text-muted)',
                  border: 'none', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer'
                }}
              >
                🌐 24h Full
              </button>
            </div>

            {/* Micro Stepper Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.15rem 0.4rem' }}>
              <button
                type="button"
                onClick={() => setStartHour(h => Math.max(0, h - 1))}
                disabled={startHour === 0}
                style={{ background: 'none', border: 'none', color: 'var(--text-heading)', fontWeight: '800', cursor: 'pointer', opacity: startHour === 0 ? 0.3 : 1, padding: '0 0.2rem' }}
              >
                ‹
              </button>

              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-indigo)', fontFamily: 'var(--font-mono)' }}>
                {startHour === 0 ? '12:00 AM' : startHour === 12 ? '12:00 PM' : `${String(startHour % 12 === 0 ? 12 : startHour % 12).padStart(2, '0')}:00 ${startHour >= 12 ? 'PM' : 'AM'}`}
              </span>

              <button
                type="button"
                onClick={() => setStartHour(h => Math.min(endHour - 1, h + 1))}
                disabled={startHour >= endHour - 1}
                style={{ background: 'none', border: 'none', color: 'var(--text-heading)', fontWeight: '800', cursor: 'pointer', opacity: startHour >= endHour - 1 ? 0.3 : 1, padding: '0 0.2rem' }}
              >
                ›
              </button>

              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0.15rem' }}>to</span>

              <button
                type="button"
                onClick={() => setEndHour(h => Math.max(startHour + 1, h - 1))}
                disabled={endHour <= startHour + 1}
                style={{ background: 'none', border: 'none', color: 'var(--text-heading)', fontWeight: '800', cursor: 'pointer', opacity: endHour <= startHour + 1 ? 0.3 : 1, padding: '0 0.2rem' }}
              >
                ‹
              </button>

              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-indigo)', fontFamily: 'var(--font-mono)' }}>
                {endHour === 0 ? '12:00 AM' : endHour === 12 ? '12:00 PM' : `${String(endHour % 12 === 0 ? 12 : endHour % 12).padStart(2, '0')}:00 ${endHour >= 12 ? 'PM' : 'AM'}`}
              </span>

              <button
                type="button"
                onClick={() => setEndHour(h => Math.min(23, h + 1))}
                disabled={endHour === 23}
                style={{ background: 'none', border: 'none', color: 'var(--text-heading)', fontWeight: '800', cursor: 'pointer', opacity: endHour === 23 ? 0.3 : 1, padding: '0 0.2rem' }}
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

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem' }}>
        {/* Left Sidebar: Unscheduled Tasks Drawer */}
        <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)', margin: '0 0 0.75rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📋 Unscheduled Tasks ({unscheduledTasks.length})</span>
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
            Click a task below, then click any calendar time slot to schedule it.
          </p>

          {unscheduledTasks.length === 0 ? (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
              🎉 All tasks scheduled or completed!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '420px', overflowY: 'auto' }}>
              {unscheduledTasks.map(t => {
                const isSelected = selectedTaskToBlock?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskToBlock(isSelected ? null : t)}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.15rem ease'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-heading)' }}>
                      {t.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>🏷️ {t.category || 'General'}</span>
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
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '12px', background: 'var(--bg-surface)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            {/* Header Row: Days of Week */}
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ width: '95px', padding: '0.75rem 0.5rem', fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-heading)', textAlign: 'center', borderRight: '1px solid var(--border-subtle)' }}>
                  Time Slot
                </th>
                {weekDays.map((d, dayIdx) => (
                  <th
                    key={dayIdx}
                    style={{
                      padding: '0.75rem 0.5rem',
                      textAlign: 'center',
                      background: d.isToday ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
                      borderLeft: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: d.isToday ? 'var(--accent-indigo)' : 'var(--text-heading)' }}>
                      {d.dayName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>{d.formattedDate}</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Time Slot Rows */}
            <tbody>
              {timeSlots.map((slotTime, slotIdx) => (
                <tr key={slotIdx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {/* Left Column: High Contrast Theme-Aware Slot Time */}
                  <td style={{ padding: '0.6rem 0.4rem', fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-heading)', textAlign: 'center', background: 'var(--bg-surface-elevated)', fontFamily: 'var(--font-mono)', borderRight: '1px solid var(--border-subtle)' }}>
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
                        style={{
                          padding: '0.35rem',
                          height: '52px',
                          borderLeft: '1px solid var(--border-subtle)',
                          background: isSelectedMode ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                          cursor: isSelectedMode ? 'pointer' : 'default',
                          verticalAlign: 'top'
                        }}
                      >
                        {block ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBlockStatus(block.id, block.taskId);
                            }}
                            style={{
                              background: block.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.12)' : block.priority === 'URGENT' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                              border: block.status === 'COMPLETED' ? '1px solid var(--accent-emerald)' : block.priority === 'URGENT' ? '1px solid var(--accent-danger)' : '1px solid var(--accent-indigo)',
                              borderRadius: '6px',
                              padding: '0.35rem 0.45rem',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              color: 'var(--text-heading)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justify: 'space-between',
                              height: '100%',
                              transition: 'transform 0.15s ease'
                            }}
                          >
                            <div style={{ textDecoration: block.status === 'COMPLETED' ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {block.status === 'COMPLETED' ? '✓ ' : ''}{block.title}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: block.status === 'COMPLETED' ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                              {block.status === 'COMPLETED' ? 'Done' : 'Click to complete'}
                            </div>
                          </div>
                        ) : isSelectedMode ? (
                          <div style={{ fontSize: '0.68rem', color: 'var(--accent-indigo)', textAlign: 'center', marginTop: '0.5rem', fontWeight: '600' }}>
                            + Schedule Here
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
