import React from 'react';
import { motion } from 'framer-motion';

/**
 * 🌿 Habit Card Component with 3-State Tap Toggling & Prayer Quality Ratings
 */
export const HabitCardItem = ({
  habit,
  onCycleStatus,
  onRateQuality,
  onOpenFocus,
  onEdit,
  onDelete,
  layout = 'list'
}) => {
  const isCompleted = habit.status === 'COMPLETED';
  const isPartial = habit.status === 'PARTIAL';

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

  const isSpiritualHabit = Boolean(
    habit.category === 'SPIRITUAL' ||
    isPrayerHabit ||
    habit.title?.toLowerCase().includes('adhkar') ||
    habit.title?.toLowerCase().includes('quran') ||
    habit.title?.toLowerCase().includes('sadhana') ||
    habit.title?.toLowerCase().includes('puja') ||
    habit.title?.toLowerCase().includes('devotion') ||
    habit.title?.toLowerCase().includes('bible')
  );

  const getStatusBadge = () => {
    if (isCompleted) {
      if (isPrayerHabit) {
        if (!habit.qualityGrade) {
          return { text: '⚠️ 90% (Pending Rating)', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' };
        }
        if (habit.qualityGrade === 'JAMAAT') {
          return { text: '🕌 In Jama\'at (100%)', bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: 'rgba(16, 185, 129, 0.3)' };
        }
        if (habit.qualityGrade === 'ON_TIME') {
          return { text: '⏰ On Time (90%)', bg: 'rgba(99, 102, 241, 0.15)', color: '#6366F1', border: 'rgba(99, 102, 241, 0.3)' };
        }
        if (habit.qualityGrade === 'LATE') {
          return { text: '⏳ Late / Qada (50%)', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' };
        }
      }
      return { text: '✅ Completed (100%)', bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: 'rgba(16, 185, 129, 0.3)' };
    }
    if (isPartial) {
      return { text: '⏳ Partial (50%)', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' };
    }
    return { text: '⭕ Pending (0%)', bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', border: 'var(--border-subtle)' };
  };

  const badge = getStatusBadge();
  const isPendingPrayerGrade = isCompleted && isPrayerHabit && !habit.qualityGrade;

  if (layout === 'grid') {
    const win = (habit.window || 'MORNING').toUpperCase();
    const icon = win === 'MORNING' ? '🌅' : win === 'AFTERNOON' ? '☀️' : '🌙';

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2 }}
        style={{
          background: 'var(--bg-surface-elevated)',
          border: `1px solid ${isPendingPrayerGrade ? 'rgba(245, 158, 11, 0.5)' : isCompleted ? 'rgba(16, 185, 129, 0.4)' : isPartial ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}`,
          borderRadius: '16px',
          padding: '0.85rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '145px',
          boxSizing: 'border-box',
          boxShadow: isCompleted ? '0 6px 18px rgba(16, 185, 129, 0.08)' : '0 3px 10px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
      >
        {/* Top Header Row: Block Icon + Title & Tiny Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {icon} {win}
            </span>
            <h4 style={{
              fontSize: '0.92rem',
              fontWeight: '800',
              color: 'var(--text-heading)',
              margin: '0.15rem 0 0 0',
              lineHeight: '1.2',
              textDecoration: isCompleted && !isPendingPrayerGrade ? 'line-through' : 'none',
              opacity: isCompleted ? 0.9 : 1
            }}>
              {habit.title}
            </h4>
          </div>

          {/* Compact Actions */}
          <div style={{ display: 'flex', gap: '0.35rem', opacity: 0.7, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => onEdit(habit)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
              title="Edit"
            >
              ✏️
            </button>
            <button
              type="button"
              onClick={() => onDelete(habit)}
              style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Middle Streak Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
          <span>⏱️ {habit.targetMinutes}m</span>
          <span>🔥 {habit.streakCount}d streak</span>
        </div>

        {/* Bottom Selection Option row (persisted for prayers, or conditional for lifestyle) */}
        <div style={{ width: '100%', marginTop: 'auto' }}>
          {isPrayerHabit ? (
            <div style={{ display: 'flex', width: '100%', gap: '0.2rem', background: 'rgba(255,255,255,0.02)', padding: '0.15rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}>
              <button
                type="button"
                onClick={() => onRateQuality(habit.id, 'JAMAAT')}
                style={{
                  flex: 1,
                  background: habit.qualityGrade === 'JAMAAT' ? 'rgba(16, 185, 129, 0.22)' : 'transparent',
                  border: 'none',
                  color: habit.qualityGrade === 'JAMAAT' ? '#10B981' : 'var(--text-muted)',
                  borderRadius: '4px',
                  padding: '0.3rem 0',
                  fontSize: '0.62rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
                title="Jama'at"
              >
                🕌
              </button>

              <button
                type="button"
                onClick={() => onRateQuality(habit.id, 'ON_TIME')}
                style={{
                  flex: 1,
                  background: habit.qualityGrade === 'ON_TIME' ? 'rgba(99, 102, 241, 0.22)' : 'transparent',
                  border: 'none',
                  color: habit.qualityGrade === 'ON_TIME' ? '#6366F1' : 'var(--text-muted)',
                  borderRadius: '4px',
                  padding: '0.3rem 0',
                  fontSize: '0.62rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
                title="On Time"
              >
                ⏰
              </button>

              <button
                type="button"
                onClick={() => onRateQuality(habit.id, 'LATE')}
                style={{
                  flex: 1,
                  background: habit.qualityGrade === 'LATE' ? 'rgba(245, 158, 11, 0.22)' : 'transparent',
                  border: 'none',
                  color: habit.qualityGrade === 'LATE' ? '#F59E0B' : 'var(--text-muted)',
                  borderRadius: '4px',
                  padding: '0.3rem 0',
                  fontSize: '0.62rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
                title="Late"
              >
                ⏳
              </button>
            </div>
          ) : (
            <>
              {isCompleted ? (
                <div style={{ display: 'flex', width: '100%', gap: '0.2rem', background: 'rgba(255,255,255,0.02)', padding: '0.15rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', boxSizing: 'border-box' }}>
                  <button
                    type="button"
                    onClick={() => onRateQuality(habit.id, 'EXCELLENT')}
                    style={{
                      flex: 1,
                      background: habit.qualityGrade === 'EXCELLENT' ? 'rgba(16, 185, 129, 0.22)' : 'transparent',
                      border: 'none',
                      color: habit.qualityGrade === 'EXCELLENT' ? '#10B981' : 'var(--text-muted)',
                      borderRadius: '4px',
                      padding: '0.3rem 0',
                      fontSize: '0.62rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      textAlign: 'center',
                      outline: 'none'
                    }}
                    title="Focus"
                  >
                    🌟
                  </button>
                  <button
                    type="button"
                    onClick={() => onRateQuality(habit.id, 'GOOD')}
                    style={{
                      flex: 1,
                      background: habit.qualityGrade === 'GOOD' ? 'rgba(99, 102, 241, 0.22)' : 'transparent',
                      border: 'none',
                      color: habit.qualityGrade === 'GOOD' ? '#6366F1' : 'var(--text-muted)',
                      borderRadius: '4px',
                      padding: '0.3rem 0',
                      fontSize: '0.62rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      textAlign: 'center',
                      outline: 'none'
                    }}
                    title="Good"
                  >
                    👍
                  </button>
                  <button
                    type="button"
                    onClick={() => onRateQuality(habit.id, 'POOR')}
                    style={{
                      flex: 1,
                      background: habit.qualityGrade === 'POOR' ? 'rgba(239, 68, 68, 0.22)' : 'transparent',
                      border: 'none',
                      color: habit.qualityGrade === 'POOR' ? '#EF4444' : 'var(--text-muted)',
                      borderRadius: '4px',
                      padding: '0.3rem 0',
                      fontSize: '0.62rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      textAlign: 'center',
                      outline: 'none'
                    }}
                    title="Rushed"
                  >
                    ⚠️
                  </button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onCycleStatus(habit.id)}
                  style={{
                    width: '100%',
                    background: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`,
                    padding: '0.35rem 0',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    outline: 'none',
                    textAlign: 'center',
                    boxShadow: isCompleted ? '0 0 10px rgba(16, 185, 129, 0.15)' : 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {badge.text}
                </motion.button>
              )}
            </>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      style={{
        background: 'var(--bg-surface-elevated)',
        border: `1px solid ${isPendingPrayerGrade ? 'rgba(245, 158, 11, 0.5)' : isCompleted ? 'rgba(16, 185, 129, 0.4)' : isPartial ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}`,
        borderRadius: '16px',
        padding: '1.1rem 1.4rem',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: isCompleted ? '0 8px 25px rgba(16, 185, 129, 0.12)' : '0 4px 15px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Habit Details Column */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '260px' }}>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '800',
              color: 'var(--text-heading)',
              margin: 0,
              textDecoration: isCompleted && !isPendingPrayerGrade ? 'line-through' : 'none',
              opacity: isCompleted ? 0.9 : 1
            }}>
              {habit.title}
            </h4>

            {/* Category Tag */}
            <span style={{
              fontSize: '0.68rem',
              fontWeight: '800',
              background: 'rgba(99, 102, 241, 0.12)',
              color: '#6366F1',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              padding: '0.1rem 0.45rem',
              borderRadius: '5px'
            }}>
              {habit.category || 'PRODUCTIVITY'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            <span>⏱️ {habit.targetMinutes} Mins</span>
            <span>🔥 {habit.streakCount} Day Streak</span>
            {habit.isFreezeProtected && <span>🧊 Freeze Protected</span>}
          </div>
        </div>

      </div>

      {/* Right Controls & Status Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        
        {/* Status Badge Toggle */}
        {isPrayerHabit ? (
          /* Persistent 3-Button selection for Prayers */
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => onRateQuality(habit.id, 'JAMAAT')}
              style={{
                background: habit.qualityGrade === 'JAMAAT' ? 'rgba(16, 185, 129, 0.22)' : 'transparent',
                border: habit.qualityGrade === 'JAMAAT' ? '1px solid #10B981' : '1px solid transparent',
                color: habit.qualityGrade === 'JAMAAT' ? '#10B981' : 'var(--text-muted)',
                borderRadius: '6px',
                padding: '0.38rem 0.65rem',
                fontSize: '0.74rem',
                fontWeight: '800',
                cursor: 'pointer',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'all 0.15s ease'
              }}
              title="In Jama'at (100% Quality)"
            >
              🕌 <span style={{ fontSize: '0.68rem' }}>Jama'at</span>
            </button>

            <button
              type="button"
              onClick={() => onRateQuality(habit.id, 'ON_TIME')}
              style={{
                background: habit.qualityGrade === 'ON_TIME' ? 'rgba(99, 102, 241, 0.22)' : 'transparent',
                border: habit.qualityGrade === 'ON_TIME' ? '1px solid #6366F1' : '1px solid transparent',
                color: habit.qualityGrade === 'ON_TIME' ? '#6366F1' : 'var(--text-muted)',
                borderRadius: '6px',
                padding: '0.38rem 0.65rem',
                fontSize: '0.74rem',
                fontWeight: '800',
                cursor: 'pointer',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'all 0.15s ease'
              }}
              title="On Time (90% Quality)"
            >
              ⏰ <span style={{ fontSize: '0.68rem' }}>On Time</span>
            </button>

            <button
              type="button"
              onClick={() => onRateQuality(habit.id, 'LATE')}
              style={{
                background: habit.qualityGrade === 'LATE' ? 'rgba(245, 158, 11, 0.22)' : 'transparent',
                border: habit.qualityGrade === 'LATE' ? '1px solid #F59E0B' : '1px solid transparent',
                color: habit.qualityGrade === 'LATE' ? '#F59E0B' : 'var(--text-muted)',
                borderRadius: '6px',
                padding: '0.38rem 0.65rem',
                fontSize: '0.74rem',
                fontWeight: '800',
                cursor: 'pointer',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'all 0.15s ease'
              }}
              title="Late / Qada (50% Quality)"
            >
              ⏳ <span style={{ fontSize: '0.68rem' }}>Late</span>
            </button>
          </div>
        ) : (
          /* Standard status badge & rating workflow for Lifestyle/Growth */
          <>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onCycleStatus(habit.id)}
              style={{
                background: badge.bg,
                color: badge.color,
                border: `1px solid ${badge.border}`,
                padding: '0.38rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: isCompleted ? '0 0 12px rgba(16, 185, 129, 0.15)' : 'none',
                boxSizing: 'border-box'
              }}
              title="Click to Cycle Status: Pending (0%) -> Partial (50%) -> Completed (100%)"
            >
              {badge.text}
            </motion.button>

            {isCompleted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => onRateQuality(habit.id, 'EXCELLENT')}
                  style={{
                    background: habit.qualityGrade === 'EXCELLENT' ? 'rgba(16, 185, 129, 0.22)' : 'transparent',
                    border: habit.qualityGrade === 'EXCELLENT' ? '1px solid #10B981' : '1px solid transparent',
                    color: habit.qualityGrade === 'EXCELLENT' ? '#10B981' : 'var(--text-muted)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.15s ease'
                  }}
                  title="High Focus & Excellence (100% Quality)"
                >
                  🌟 <span style={{ fontSize: '0.65rem' }}>Focus</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRateQuality(habit.id, 'GOOD')}
                  style={{
                    background: habit.qualityGrade === 'GOOD' ? 'rgba(99, 102, 241, 0.22)' : 'transparent',
                    border: habit.qualityGrade === 'GOOD' ? '1px solid #6366F1' : '1px solid transparent',
                    color: habit.qualityGrade === 'GOOD' ? '#6366F1' : 'var(--text-muted)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.15s ease'
                  }}
                  title="Standard Quality (80% Quality)"
                >
                  👍 <span style={{ fontSize: '0.65rem' }}>Good</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRateQuality(habit.id, 'POOR')}
                  style={{
                    background: habit.qualityGrade === 'POOR' ? 'rgba(239, 68, 68, 0.22)' : 'transparent',
                    border: habit.qualityGrade === 'POOR' ? '1px solid #EF4444' : '1px solid transparent',
                    color: habit.qualityGrade === 'POOR' ? '#EF4444' : 'var(--text-muted)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.15s ease'
                  }}
                  title="Distracted / Rushed (50% Quality)"
                >
                  ⚠️ <span style={{ fontSize: '0.65rem' }}>Rushed</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Focus Mode Trigger */}
        {!isSpiritualHabit && (
          <button
            type="button"
            onClick={() => onOpenFocus(habit)}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '8px', padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
            title="Start Focus Timer"
          >
            🎯 Focus
          </button>
        )}

        {/* Edit Trigger */}
        <button
          type="button"
          onClick={() => onEdit(habit)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', opacity: 0.7 }}
          title="Edit Habit"
        >
          ✏️
        </button>

        {/* Delete Trigger */}
        <button
          type="button"
          onClick={() => onDelete(habit)}
          style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '0.9rem', cursor: 'pointer', opacity: 0.7 }}
          title="Delete Habit"
        >
          🗑️
        </button>

      </div>
    </motion.div>
  );
};
