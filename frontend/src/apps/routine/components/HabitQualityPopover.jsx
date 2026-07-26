import React from 'react';

/**
 * 🕌 Progressive Disclosure 3-Pill Prayer Quality Popover Component
 * 
 * Pops open on long-press or micro-dot tap, allowing 1-tap quality logging
 * (Jama'at vs On Time vs Late) without cluttering the main UI!
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
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        padding: '1.5rem 1.75rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
        width: '100%',
        maxWidth: '440px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>
              ⭐ Rate Execution Quality
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              {habit.title}
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Quality Rating Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
                  borderRadius: '12px',
                  padding: '0.75rem 1.1rem',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between'
                }}
              >
                <span>🕌 In Jama'at</span>
                <span style={{ fontSize: '0.78rem', background: 'rgba(16, 185, 129, 0.25)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>100% Quality</span>
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
                  borderRadius: '12px',
                  padding: '0.75rem 1.1rem',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between'
                }}
              >
                <span>⏰ On Time</span>
                <span style={{ fontSize: '0.78rem', background: 'rgba(99, 102, 241, 0.25)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>90% Quality</span>
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
                  borderRadius: '12px',
                  padding: '0.75rem 1.1rem',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between'
                }}
              >
                <span>⏳ Late / Qada</span>
                <span style={{ fontSize: '0.78rem', background: 'rgba(245, 158, 11, 0.25)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>50% Quality</span>
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
                  borderRadius: '12px',
                  padding: '0.75rem 1.1rem',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between'
                }}
              >
                <span>🌟 High Focus & Excellence</span>
                <span style={{ fontSize: '0.78rem', background: 'rgba(16, 185, 129, 0.25)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>100%</span>
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
                  borderRadius: '12px',
                  padding: '0.75rem 1.1rem',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between'
                }}
              >
                <span>👍 Standard Quality</span>
                <span style={{ fontSize: '0.78rem', background: 'rgba(99, 102, 241, 0.25)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>80%</span>
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
                  borderRadius: '12px',
                  padding: '0.75rem 1.1rem',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between'
                }}
              >
                <span>⚠️ Distracted / Rushed</span>
                <span style={{ fontSize: '0.78rem', background: 'rgba(239, 68, 68, 0.25)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>50%</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
