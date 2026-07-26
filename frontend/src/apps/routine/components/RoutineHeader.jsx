import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/Button';

/**
 * 🌿 Routine Header & Window Navigation Component
 */
export const RoutineHeader = ({
  activeWindowTab,
  onSelectWindowTab,
  consistencyScore = 0,
  completedHabitsCount = 0,
  totalHabitsCount = 0,
  freezePasses = 0,
  routineMode = 'SOLAR',
  onOpenPrefs,
  onOpenMuhasabah,
  onOpenAnalytics,
  onOpenAddModal
}) => {
  const WINDOW_TABS = [
    { key: 'MORNING', label: '🌅 Morning Block', color: '#10B981' },
    { key: 'AFTERNOON', label: '☀️ Afternoon Block', color: '#38BDF8' },
    { key: 'EVENING', label: '🌙 Evening Block', color: '#8B5CF6' }
  ];

  return (
    <div style={{
      background: 'var(--bg-surface-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '20px',
      padding: '1.25rem 1.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.18)'
    }}>
      {/* Top Banner Row: Title + Stats Pills + Action Suite */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-emerald)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            🌿 UNIVERSAL ROUTINE & HABIT ENGINE
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-heading)', margin: '0.15rem 0 0 0', letterSpacing: '-0.02em' }}>
            Daily Routine Blueprint
          </h2>
        </div>

        {/* Stats Snapshot Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}>
            🔥 Streak Consistency: <span style={{ color: '#10B981' }}>{consistencyScore}%</span>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}>
            ✅ Completed Today: <span style={{ color: '#38BDF8' }}>{completedHabitsCount} / {totalHabitsCount}</span>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}>
            🧊 Freeze Passes: <span style={{ color: '#F59E0B' }}>{freezePasses}</span>
          </div>

        </div>

        {/* Action Controls Suite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          
          <Button variant="emerald" onClick={onOpenAddModal} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
            🌿 + New Habit
          </Button>

          <Button variant="secondary" onClick={onOpenMuhasabah} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderColor: '#8B5CF6', color: '#8B5CF6' }}>
            🌙 Evening Audit
          </Button>

          <Button variant="outline" onClick={onOpenAnalytics} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
            📊 Analytics
          </Button>

          <Button variant="outline" onClick={onOpenPrefs} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
            ⚙️ Settings
          </Button>

        </div>

      </div>

      {/* 3 Contextual Window Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', background: 'var(--bg-surface)', padding: '0.35rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
        {WINDOW_TABS.map(w => {
          const isActive = activeWindowTab === w.key;
          return (
            <motion.button
              key={w.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectWindowTab(w.key)}
              style={{
                flex: 1,
                minWidth: '140px',
                background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                color: isActive ? w.color : 'var(--text-muted)',
                border: `1px solid ${isActive ? w.color : 'transparent'}`,
                borderRadius: '10px',
                padding: '0.6rem 1rem',
                fontSize: '0.88rem',
                fontWeight: '800',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: isActive ? `0 0 15px ${w.color}25` : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {w.label}
            </motion.button>
          );
        })}
      </div>

    </div>
  );
};
