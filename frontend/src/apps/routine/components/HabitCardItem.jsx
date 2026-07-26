import React from 'react';
import { motion } from 'framer-motion';

/**
 * 🌿 Habit Card Component with 3-State Tap Toggling (0% -> 50% -> 100%)
 */
export const HabitCardItem = ({
  habit,
  onCycleStatus,
  onOpenPopover,
  onOpenFocus,
  onEdit,
  onDelete
}) => {
  const isCompleted = habit.status === 'COMPLETED';
  const isPartial = habit.status === 'PARTIAL';

  const getStatusBadge = () => {
    if (isCompleted) {
      return { text: '✅ Completed (100%)', bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: 'rgba(16, 185, 129, 0.3)' };
    }
    if (isPartial) {
      return { text: '⏳ Partial (50%)', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' };
    }
    return { text: '⭕ Pending (0%)', bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', border: 'var(--border-subtle)' };
  };

  const badge = getStatusBadge();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      style={{
        background: 'var(--bg-surface-elevated)',
        border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.4)' : isPartial ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}`,
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
        
        {/* 3-State Tap Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onCycleStatus(habit.id)}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: isCompleted ? 'linear-gradient(135deg, #10B981, #059669)' : isPartial ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'var(--bg-surface)',
            border: `2px solid ${isCompleted ? '#10B981' : isPartial ? '#F59E0B' : 'var(--border-subtle)'}`,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            fontSize: '1.2rem',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: isCompleted ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none'
          }}
          title="Tap to Cycle: 0% -> 50% -> 100%"
        >
          {isCompleted ? '✓' : isPartial ? '½' : '○'}
        </motion.button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '800',
              color: 'var(--text-heading)',
              margin: 0,
              textDecoration: isCompleted ? 'line-through' : 'none',
              opacity: isCompleted ? 0.85 : 1
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
        
        {/* Status Badge */}
        <div style={{
          background: badge.bg,
          color: badge.color,
          border: `1px solid ${badge.border}`,
          padding: '0.35rem 0.75rem',
          borderRadius: '8px',
          fontSize: '0.78rem',
          fontWeight: '800'
        }}>
          {badge.text}
        </div>

        {/* Quality Rating Trigger */}
        {isCompleted && (
          <button
            type="button"
            onClick={() => onOpenPopover(habit.id)}
            style={{
              background: habit.qualityGrade ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: habit.qualityGrade ? '#10B981' : 'var(--text-muted)',
              borderRadius: '8px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            {habit.qualityGrade ? `⭐ Grade: ${habit.qualityGrade}` : '⭐ Rate Quality'}
          </button>
        )}

        {/* Focus Mode Trigger */}
        <button
          type="button"
          onClick={() => onOpenFocus(habit)}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '8px', padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
          title="Start 15-Min Focus Timer"
        >
          🎯 Focus
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
