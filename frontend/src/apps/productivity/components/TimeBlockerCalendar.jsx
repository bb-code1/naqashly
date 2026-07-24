import React, { useState, useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

/**
 * Native Naqashly Interactive 7-Day Time-Blocking Calendar Component.
 * Supports Day & 7-Day Week Time Grids, Unscheded Task Drawer, 1-Click Time Slotting,
 * and Task Completion Auto-Advance.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const TimeBlockerCalendar = ({
  tasks = [],
  goals = [],
  onUpdateTaskStatus,
  onOpenCreateTaskModal
}) => {
  const [viewMode, setViewMode] = useState('week'); // 'day' | 'week'
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedTaskToBlock, setSelectedTaskToBlock] = useState(null);

  // Time Slots (08:00 AM to 08:00 PM)
  const timeSlots = useMemo(() => [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
  ], []);

  // Compute 7 Days of Active Week based on currentWeekOffset
  const weekDays = useMemo(() => {
    const list = [];
    const now = new Date();
    // Move to Monday of current week
    const currentDay = now.getDay();
    const distanceToMon = (currentDay === 0 ? -6 : 1 - currentDay) + (currentWeekOffset * 7);
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMon);

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = d.toDateString() === now.toDateString();

      list.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: daysOfWeek[i],
        formattedDate: `${d.getMonth() + 1}/${d.getDate()}`,
        isToday
      });
    }
    return list;
  }, [currentWeekOffset]);

  // Scheduled Time Blocks Mock / State Mapping
  const [scheduledBlocks, setScheduledBlocks] = useState([
    { id: 101, dayIndex: 0, slot: '09:00 AM', title: 'Deep Work: System Architecture', priority: 'HIGH', status: 'COMPLETED' },
    { id: 102, dayIndex: 1, slot: '10:00 AM', title: 'Sprint Security Audit', priority: 'URGENT', status: 'TODO' },
    { id: 103, dayIndex: 2, slot: '02:00 PM', title: 'Database Optimization', priority: 'HIGH', status: 'TODO' },
    { id: 104, dayIndex: 3, slot: '11:00 AM', title: 'Refactor Productivity Suite', priority: 'MEDIUM', status: 'COMPLETED' }
  ]);

  // Unscheduled Pending Tasks
  const unscheduledTasks = useMemo(() => {
    return tasks.filter(t => t.status !== 'COMPLETED');
  }, [tasks]);

  // Add Task to Time Slot
  const handleSlotClick = (dayIdx, slotTime) => {
    if (selectedTaskToBlock) {
      // Add selected task to block
      const newBlock = {
        id: Date.now(),
        dayIndex: dayIdx,
        slot: slotTime,
        title: selectedTaskToBlock.title,
        priority: selectedTaskToBlock.priority || 'HIGH',
        status: selectedTaskToBlock.status || 'TODO',
        taskId: selectedTaskToBlock.id
      };
      setScheduledBlocks(prev => [...prev.filter(b => !(b.dayIndex === dayIdx && b.slot === slotTime)), newBlock]);
      setSelectedTaskToBlock(null);
    }
  };

  // Toggle Block Completion
  const toggleBlockStatus = (blockId, taskId) => {
    setScheduledBlocks(prev => prev.map(b => {
      if (b.id === blockId) {
        const nextStatus = b.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
        if (taskId && onUpdateTaskStatus) {
          onUpdateTaskStatus(taskId, nextStatus);
        }
        return { ...b, status: nextStatus };
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
          {/* Week Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Button variant="subtle" onClick={() => setCurrentWeekOffset(p => p - 1)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
              ◀ Prev Week
            </Button>
            <Button variant="subtle" onClick={() => setCurrentWeekOffset(0)} style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem', fontWeight: '700' }}>
              Current Week
            </Button>
            <Button variant="subtle" onClick={() => setCurrentWeekOffset(p => p + 1)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
              Next Week ▶
            </Button>
          </div>

          {/* View Switcher Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              style={{
                background: viewMode === 'week' ? 'var(--accent-indigo)' : 'transparent',
                color: viewMode === 'week' ? '#FFF' : 'var(--text-muted)',
                border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer'
              }}
            >
              7-Day Week
            </button>
            <button
              type="button"
              onClick={() => setViewMode('day')}
              style={{
                background: viewMode === 'day' ? 'var(--accent-indigo)' : 'transparent',
                color: viewMode === 'day' ? '#FFF' : 'var(--text-muted)',
                border: 'none', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer'
              }}
            >
              Day Schedule
            </button>
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

        {/* Right Main Grid: 7-Day Time Grid */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            {/* Header Row: Days of Week */}
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ width: '85px', padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Time
                </th>
                {(viewMode === 'week' ? weekDays : [weekDays.find(d => d.isToday) || weekDays[0]]).map((d, dayIdx) => (
                  <th
                    key={dayIdx}
                    style={{
                      padding: '0.75rem 0.5rem',
                      textAlign: 'center',
                      background: d.isToday ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      borderLeft: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: d.isToday ? 'var(--accent-indigo)' : 'var(--text-heading)' }}>
                      {d.dayName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.formattedDate}</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Time Slot Rows */}
            <tbody>
              {timeSlots.map((slotTime, slotIdx) => (
                <tr key={slotIdx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {/* Left Column: Slot Time */}
                  <td style={{ padding: '0.6rem 0.4rem', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textAlign: 'center', background: 'var(--bg-surface-elevated)', fontFamily: 'var(--font-mono)' }}>
                    {slotTime}
                  </td>

                  {/* Day Columns */}
                  {(viewMode === 'week' ? weekDays : [weekDays.find(d => d.isToday) || weekDays[0]]).map((d, dayIdx) => {
                    const block = scheduledBlocks.find(b => b.dayIndex === dayIdx && b.slot === slotTime);
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
