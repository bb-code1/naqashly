import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VelocityHeatmap } from '../../../components/ui/VelocityHeatmap';

export const ProductivityAnalyticsDrawer = ({
  showAnalyticsDrawer,
  setShowAnalyticsDrawer,
  goals,
  velocityDays,
  focusStreak
}) => {
  return (
    <AnimatePresence>
      {showAnalyticsDrawer && (
        <>
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAnalyticsDrawer(false)}
            className="drawer-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998
            }}
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="drawer-panel"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100%',
              maxWidth: '520px',
              height: '100vh',
              background: 'rgba(15, 15, 20, 0.95)',
              backdropFilter: 'blur(24px)',
              borderLeft: '1px solid var(--border-subtle)',
              boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.6)',
              zIndex: 9999,
              padding: '1.5rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              boxSizing: 'border-box'
            }}
          >
            {/* Drawer Header Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>
                  📊 Productivity Insights
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Goal distributions and focus consistency telemetry.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAnalyticsDrawer(false)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-heading)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                ✕
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* 1. Goals Breakdown */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '1.25rem', borderRadius: '14px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-heading)', margin: '0 0 1rem 0' }}>
                  🎯 Goal Categories
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {['CAREER', 'FINANCE', 'HEALTH', 'PERSONAL'].map(cat => {
                    const count = goals.filter(g => g.category === cat).length;
                    const pct = goals.length > 0 ? (count / goals.length) * 100 : 0;
                    return (
                      <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '700' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{cat}</span>
                          <span style={{ color: 'var(--text-heading)' }}>{count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-indigo)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Focus Heatmap */}
              <VelocityHeatmap
                days={velocityDays}
                streak={focusStreak}
                peakWindow="09:30 AM - 12:30 PM"
                title="Focus Velocity Heatmap"
                subtitle="Track daily focus consistency and streak status."
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
