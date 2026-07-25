import React from 'react';

/**
 * 🕌 Progressive Disclosure 3-Pill Prayer Quality Popover Component
 * 
 * Pops open on long-press or micro-dot tap, allowing 1-tap quality logging
 * (Jama'at vs On Time vs Late) without cluttering the main UI!
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const HabitQualityPopover = ({ habit, onSelectGrade, onDeleteHabit, onClose }) => {
  const isPrayerHabit = habit.isPrayer || habit.title?.toLowerCase().includes('prayer') || habit.title?.toLowerCase().includes('tahajjud') || habit.title?.toLowerCase().includes('fajr') || habit.title?.toLowerCase().includes('dhuhr') || habit.title?.toLowerCase().includes('asr') || habit.title?.toLowerCase().includes('maghrib') || habit.title?.toLowerCase().includes('isha');

  return (
    <div style={{ position: 'absolute', right: '0', top: '100%', marginTop: '0.35rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.5rem', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)', zIndex: 99, display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
      {isPrayerHabit && (
        <>
          <button
            type="button"
            onClick={() => {
              onSelectGrade(habit.id, 'JAMAAT');
              onClose();
            }}
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10B981',
              color: '#10B981',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            🕌 In Jama'at (100%)
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectGrade(habit.id, 'ON_TIME');
              onClose();
            }}
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid #6366F1',
              color: '#6366F1',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            ⏰ On Time (85%)
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectGrade(habit.id, 'LATE');
              onClose();
            }}
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid #F59E0B',
              color: '#F59E0B',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            ⏳ Late (50%)
          </button>
        </>
      )}

      {onDeleteHabit && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Delete habit "${habit.title}"?`)) {
              onDeleteHabit(habit.id);
            }
            onClose();
          }}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            color: '#EF4444',
            borderRadius: '6px',
            padding: '0.35rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: '800',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          🗑️ Delete
        </button>
      )}
    </div>
  );
};
