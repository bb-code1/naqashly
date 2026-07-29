import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 🌿 Today's Habit Focus Widget (Interactive 1-Tap Dashboard Checklist)
 * 
 * Allows users to check off completed habits directly from the Executive Dashboard!
 */
export const HabitFocusWidget = ({ habits = [], loading = false, onToggleHabit, onNavigateMode }) => {
  return (
    <div className="dashboard-card widget-habits">
      {/* Header Row */}
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">
          <span>🌿</span> Today's Habit Focus
        </h3>
        <button
          type="button"
          onClick={() => onNavigateMode?.('ROUTINE')}
          className="dashboard-card-link"
          style={{ color: '#10B981' }}
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
        <div className="dashboard-card-body">
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
                  className="dashboard-card-item"
                  style={{
                    background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
                    borderColor: isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'
                  }}
                >
                  <div className="dashboard-card-item-left">
                    <motion.div
                      whileTap={{ scale: 0.8 }}
                      className="dashboard-card-item-circle"
                      style={{
                        borderColor: isDone ? '#10B981' : 'var(--border-subtle)',
                        background: isDone ? '#10B981' : 'transparent'
                      }}
                    >
                      {isDone && '✓'}
                    </motion.div>

                    <span
                      className="dashboard-card-item-title"
                      style={{
                        color: isDone ? 'var(--text-muted)' : 'var(--text-heading)',
                        textDecoration: isDone ? 'line-through' : 'none'
                      }}
                    >
                      {h.title}
                    </span>
                  </div>

                  <div className="dashboard-card-item-right">
                    <span className="dashboard-card-item-badge">
                      ⏱️ {h.targetMinutes || 15}m
                    </span>
                    {isDone && (
                      <span className="dashboard-card-item-tag" style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.15)' }}>
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
