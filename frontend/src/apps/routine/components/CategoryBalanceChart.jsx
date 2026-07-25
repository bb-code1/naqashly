import React, { useMemo } from 'react';
import { HABIT_CATEGORIES } from '../../../constants/routineConstants';

/**
 * 🧭 Category Balance Radar & Time Allocation Chart Component
 * 
 * Visual breakdown of daily target minutes and completion percentages
 * across Spiritual, Productivity, Health, Learning, and Mindfulness categories.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const CategoryBalanceChart = ({ habits = [] }) => {
  const categoryStats = useMemo(() => {
    const totalMinutesAll = habits.reduce((acc, h) => acc + (Number(h.targetMinutes) || 15), 0) || 1;

    return HABIT_CATEGORIES.map(cat => {
      const catHabits = habits.filter(h => h.category === cat.id);
      const targetMins = catHabits.reduce((acc, h) => acc + (Number(h.targetMinutes) || 15), 0);
      const sharePct = Math.round((targetMins / totalMinutesAll) * 100);
      const completedCount = catHabits.filter(h => h.status === 'COMPLETED').length;
      const completionPct = catHabits.length > 0 ? Math.round((completedCount / catHabits.length) * 100) : 0;

      return {
        ...cat,
        habitCount: catHabits.length,
        targetMins,
        sharePct,
        completionPct
      };
    }).filter(stat => stat.habitCount > 0); // Only active categories chosen by the user!
  }, [habits]);

  const totalDailyMins = useMemo(() => habits.reduce((acc, h) => acc + (Number(h.targetMinutes) || 15), 0), [habits]);

  return (
    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🧭 Life OS Category Balance Radar
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            {totalDailyMins} Mins Daily Target allocated across 5 Core Life Domains
          </p>
        </div>

        <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#6366F1', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
          🎯 {habits.length} Habits Tracked
        </div>
      </div>

      {/* Category Progress & Balance Rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
        {categoryStats.map(stat => (
          <div
            key={stat.id}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: stat.color }}>
                {stat.label}
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                {stat.targetMins}m ({stat.sharePct}%)
              </span>
            </div>

            {/* Custom Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${stat.sharePct}%`,
                  height: '100%',
                  background: stat.color,
                  borderRadius: '999px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              <span>{stat.habitCount} Habit{stat.habitCount === 1 ? '' : 's'}</span>
              <span style={{ fontWeight: '700', color: stat.completionPct >= 100 ? '#10B981' : 'var(--text-heading)' }}>
                {stat.completionPct}% Done Today
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
