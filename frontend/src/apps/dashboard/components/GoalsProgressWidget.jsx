import React from 'react';
import { motion } from 'framer-motion';

/**
 * 🎯 Focus Goals & Milestone Progress Widget
 * 
 * Displays active macro targets with visual progress sliders.
 */
export const GoalsProgressWidget = ({ goals = [], loading = false, onNavigateMode }) => {
  return (
    <div className="dashboard-card widget-goals">
      {/* Header Row */}
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">
          <span>🎯</span> Focus & Goal Sliders
        </h3>
        <button
          type="button"
          onClick={() => onNavigateMode?.('PRODUCTIVITY')}
          className="dashboard-card-link"
          style={{ color: '#EC4899' }}
        >
          Open Focus App ➔
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading goals...</div>
      ) : goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No active goals logged. Click "+ Add Goal" to start tracking!
        </div>
      ) : (
        <div className="dashboard-card-body">
          {goals.slice(0, 3).map(g => {
            const pct = g.progressPercentage || 0;
            return (
              <motion.div
                key={g.id}
                whileHover={{ scale: 1.01 }}
                className="dashboard-goal-item"
              >
                <div className="dashboard-goal-row">
                  <span className="dashboard-goal-title">
                    🎯 {g.title}
                  </span>
                  <span className="dashboard-goal-percentage" style={{ color: '#EC4899' }}>
                    {pct}%
                  </span>
                </div>

                <div className="dashboard-goal-track">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="dashboard-goal-fill"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
