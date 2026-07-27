import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/Button';

/**
 * 🎯 Productivity Header & Actions Component
 * Follows the visual language of the Routine and Finance modules.
 */
export const ProductivityHeader = ({
  focusStreak = 0,
  avgGoalProgress = 0,
  completedTasksCount = 0,
  totalFocusHoursLogged = 0,
  onOpenGoalModal,
  onOpenTaskModal,
  onOpenAnalytics
}) => {
  return (
    <div style={{
      background: 'var(--bg-surface-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '20px',
      padding: '1.25rem 1.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      marginBottom: '1.5rem'
    }}>
      {/* Top Banner Row: Title + Stats Pills + Action Suite */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-indigo)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            🎯 FOCUS & GOAL PERFORMANCE SYSTEM
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-heading)', margin: '0.15rem 0 0 0', letterSpacing: '-0.02em' }}>
            Goal Performance Cockpit
          </h2>
        </div>

        {/* Stats Snapshot Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}>
            🔥 Focus Streak: <span style={{ color: 'var(--accent-indigo)' }}>{focusStreak} days</span>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}>
            🎯 Goal Completion: <span style={{ color: '#10B981' }}>{avgGoalProgress}%</span>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}>
            ✅ Tasks Done: <span style={{ color: '#38BDF8' }}>{completedTasksCount}</span>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}>
            ⏱️ Focus Time: <span style={{ color: '#F59E0B' }}>{totalFocusHoursLogged} hrs</span>
          </div>
        </div>

        {/* Action Controls Suite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Button variant="indigo" onClick={onOpenGoalModal} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
            🎯 + Goal Target
          </Button>

          <Button variant="emerald" onClick={onOpenTaskModal} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
            🌿 + Priority Task
          </Button>

          <Button variant="outline" onClick={onOpenAnalytics} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderColor: 'var(--accent-indigo)', color: 'var(--accent-indigo)' }}>
            📊 Analytics
          </Button>
        </div>

      </div>
    </div>
  );
};
