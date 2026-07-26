import React from 'react';
import { motion } from 'framer-motion';

/**
 * 🎯 Focus Goals & Milestone Progress Widget
 * 
 * Displays active macro targets with visual progress sliders.
 */
export const GoalsProgressWidget = ({ goals = [], loading = false, onNavigateMode }) => {
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
          <span>🎯</span> Focus & Goal Sliders
        </h3>
        <button
          type="button"
          onClick={() => onNavigateMode?.('PRODUCTIVITY')}
          style={{ background: 'transparent', border: 'none', color: '#EC4899', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {goals.slice(0, 3).map(g => {
            const pct = g.progressPercentage || 0;
            return (
              <motion.div
                key={g.id}
                whileHover={{ scale: 1.01 }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)' }}>
                    🎯 {g.title}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#EC4899', fontFamily: 'var(--font-mono)' }}>
                    {pct}%
                  </span>
                </div>

                <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #10B981 0%, #EC4899 100%)',
                      borderRadius: '4px'
                    }}
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
