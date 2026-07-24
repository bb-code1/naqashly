import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';

/**
 * Universal Reusable 7-Day / 30-Day Activity Velocity & Focus Heatmap Component.
 * Can be reused across Productivity (Focus Hours), Finance (Spending Velocity),
 * Routine (Habit Streaks), and Journal (Writing Activity).
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const VelocityHeatmap = ({
  days = [],
  streak = 0,
  peakWindow = '09:30 AM - 12:30 PM',
  title = '7-Day Productivity Velocity & Focus Heatmap',
  subtitle = 'Track daily consistency, active streaks, and peak activity windows.',
  targetHoursPerDay = 4,
  style = {}
}) => {
  return (
    <Card style={{ marginTop: '1.5rem', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 {title}
          </h3>
          {subtitle && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {streak > 0 && <Badge variant="emerald">🔥 {streak}-Day Streak</Badge>}
          {peakWindow && <Badge variant="indigo">⚡ Peak: {peakWindow}</Badge>}
        </div>
      </div>

      {/* Daily Velocity Bar Graph & Heatmap Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, days.length)}, 1fr)`, gap: '0.75rem', marginTop: '1rem' }}>
        {days.map((day, idx) => {
          const val = Number(day.hours || day.value || 0);
          const ratio = Math.min(100, (val / targetHoursPerDay) * 100);
          const isHigh = val >= (targetHoursPerDay * 0.75);
          const isMid = val > 0;

          return (
            <div
              key={idx}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '0.85rem 0.6rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                {day.dayName}
              </span>

              {/* Height Progress Bar */}
              <div style={{ height: '70px', width: '12px', background: 'var(--bg-surface)', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                <div
                  style={{
                    width: '100%',
                    height: `${ratio}%`,
                    background: isHigh ? 'var(--accent-emerald)' : isMid ? 'var(--accent-indigo)' : 'var(--border-subtle)',
                    borderRadius: '6px',
                    transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>

              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
                {val}h
              </span>
              {day.tasksDone !== undefined && (
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{day.tasksDone} tasks</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
