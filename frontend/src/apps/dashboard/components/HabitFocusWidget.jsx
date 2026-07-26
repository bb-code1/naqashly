import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🌿 Today's Habit Focus Widget (Interactive 1-Tap Dashboard Checklist)
 * 
 * Allows users to check off completed habits directly from the Executive Dashboard!
 */
export const HabitFocusWidget = ({ habits = [], loading = false, onToggleHabit, onNavigateMode }) => {
  return (
    <div style={{
      background: 'var(--bg-surface-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '20px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.1rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🌿</span> Today's Habit Focus
        </h3>
        <button
          type="button"
          onClick={() => onNavigateMode?.('ROUTINE')}
          style={{ background: 'transparent', border: 'none', color: '#10B981', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
        >
          Open Routine OS ➔
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading routines...</div>
      ) : habits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No habits configured today. Click "+ Habit" to add your first routine!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <AnimatePresence>
            {habits.slice(0, 5).map(h => {
              const isDone = h.status === 'COMPLETED';
              return (
                <motion.div
                  key={h.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  whileHover={{ scale: 1.01, background: isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface)' }}
                  onClick={() => onToggleHabit?.(h.id, !isDone)}
                  style={{
                    background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
                    border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                    borderRadius: '12px',
                    padding: '0.8rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <motion.div
                      whileTap={{ scale: 0.8 }}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: `2px solid ${isDone ? '#10B981' : 'var(--border-subtle)'}`,
                        background: isDone ? '#10B981' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontSize: '0.8rem',
                        fontWeight: '900'
                      }}
                    >
                      {isDone && '✓'}
                    </motion.div>

                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: '800',
                      color: isDone ? 'var(--text-muted)' : 'var(--text-heading)',
                      textDecoration: isDone ? 'line-through' : 'none'
                    }}>
                      {h.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                      ⏱️ {h.targetMinutes || 15}m
                    </span>
                    {isDone && (
                      <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '800', background: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        Done
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
