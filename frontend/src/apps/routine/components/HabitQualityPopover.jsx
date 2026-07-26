import React from 'react';

/**
 * 🕌 Progressive Disclosure 3-Pill Prayer Quality Popover Component
 * 
 * Pops open on long-press or micro-dot tap, allowing 1-tap quality logging
 * (Jama'at vs On Time vs Late) without cluttering the main UI!
 * 
 * @author Barkat Bashir
 * @version 1.1.0
 */
export const HabitQualityPopover = ({ habit, onSelectGrade, onEditHabit, onDeleteHabit, onClose }) => {
  if (!habit) return null;

  const isPrayerHabit = Boolean(
    habit.isPrayer ||
    habit.title?.toLowerCase().includes('prayer') ||
    habit.title?.toLowerCase().includes('tahajjud') ||
    habit.title?.toLowerCase().includes('fajr') ||
    habit.title?.toLowerCase().includes('dhuhr') ||
    habit.title?.toLowerCase().includes('asr') ||
    habit.title?.toLowerCase().includes('maghrib') ||
    habit.title?.toLowerCase().includes('isha')
  );

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
              ⭐ Rate Habit Execution Quality
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              {habit.title}
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Quality Rating Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {isPrayerHabit ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onSelectGrade?.(habit.id, 'JAMAAT');
                  onClose();
                }}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  color: '#10B981',
                  borderRadius: '10px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                🕌 In Jama'at (100% Quality)
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectGrade?.(habit.id, 'ON_TIME');
                  onClose();
                }}
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid #6366F1',
                  color: '#6366F1',
                  borderRadius: '10px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                ⏰ On Time (85% Quality)
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectGrade?.(habit.id, 'LATE');
                  onClose();
                }}
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid #F59E0B',
                  color: '#F59E0B',
                  borderRadius: '10px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                ⏳ Late / Qada (50% Quality)
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  onSelectGrade?.(habit.id, 'EXCELLENT');
                  onClose();
                }}
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  color: '#10B981',
                  borderRadius: '10px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                🌟 High Focus & Excellence (100%)
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectGrade?.(habit.id, 'GOOD');
                  onClose();
                }}
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid #6366F1',
                  color: '#6366F1',
                  borderRadius: '10px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                👍 Standard Quality (80%)
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectGrade?.(habit.id, 'POOR');
                  onClose();
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #EF4444',
                  color: '#EF4444',
                  borderRadius: '10px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                ⚠️ Distracted / Rushed (50%)
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
