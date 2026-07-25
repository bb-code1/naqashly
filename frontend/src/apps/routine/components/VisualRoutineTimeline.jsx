import React, { useMemo } from 'react';
import { CONTEXTUAL_WINDOWS } from '../../../constants/routineConstants';

/**
 * 🎨 Dynamic 24-Hour Visual Routine Timeline Bar
 * 
 * Renders a horizontal glowing timeline bar segmenting the day into contextual windows,
 * using current LocalTime bounds to highlight the ACTIVE window with a neon glow.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const VisualRoutineTimeline = ({ habits = [] }) => {
  const currentHour = new Date().getHours();

  // Determine active contextual window ID based on current LocalTime
  const activeWindowId = useMemo(() => {
    if (currentHour >= 6 && currentHour < 12) return 'MORNING';
    if (currentHour >= 12 && currentHour < 18) return 'AFTERNOON';
    return 'EVENING';
  }, [currentHour]);

  return (
    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🎨 24-Hour Visual Timeline Progress</span>
        </h3>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)', fontWeight: '700' }}>
          Current Hour: {String(currentHour).padStart(2, '0')}:00
        </span>
      </div>

      {/* Timeline Segments Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
        {CONTEXTUAL_WINDOWS.map(win => {
          const isActive = win.id === activeWindowId;
          const windowHabits = habits.filter(h => h.window === win.id);
          const completedCount = windowHabits.filter(h => h.status === 'COMPLETED').length;
          const totalCount = windowHabits.length;
          const pct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

          return (
            <div
              key={win.id}
              style={{
                flex: 1,
                minWidth: '160px',
                padding: '0.75rem 0.85rem',
                borderRadius: '10px',
                background: isActive ? `${win.color}15` : 'transparent',
                border: `1px solid ${isActive ? win.color : 'var(--border-subtle)'}`,
                boxShadow: isActive ? `0 0 14px ${win.color}35` : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: isActive ? win.color : 'var(--text-heading)' }}>
                  {win.label}
                </span>
                {isActive && (
                  <span style={{ fontSize: '0.68rem', fontWeight: '900', color: '#10B981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #10B981' }}>
                    🟢 ACTIVE NOW
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {win.subtitle}
              </div>

              {/* Window Micro Progress Bar */}
              <div style={{ height: '5px', background: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden', marginTop: '0.2rem' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: win.color, transition: 'width 0.4s ease' }} />
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right', fontWeight: '700' }}>
                {completedCount} / {totalCount} Done ({pct}%)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
