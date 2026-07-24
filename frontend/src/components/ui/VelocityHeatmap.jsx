import React, { useState, useMemo } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';

/**
 * Enterprise Universal Multi-Horizon Velocity & Focus Heatmap Component.
 * Supports 7-Day Velocity Bar Graph, 30-Day Monthly Heatmap Grid, and 1-Year GitHub-Style Activity Grid!
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
export const VelocityHeatmap = ({
  days = [],
  streak = 0,
  peakWindow = '09:30 AM - 12:30 PM',
  title = 'Productivity Velocity & Focus Heatmap',
  subtitle = 'Track daily consistency, active streaks, and peak activity windows.',
  targetHoursPerDay = 4,
  style = {}
}) => {
  const [timeRange, setTimeRange] = useState('7d'); // '7d' | '30d' | '1y'

  // Generate 30-Day Data
  const monthData = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayNum = d.getDate();
      const val = (i % 3 === 0) ? 4.5 : (i % 2 === 0 ? 3.0 : (i % 5 === 0 ? 0 : 2.0));
      list.push({
        dayNum,
        dateStr: d.toISOString().split('T')[0],
        value: val
      });
    }
    return list;
  }, []);

  // Generate 365-Day (52 Weeks) Heatmap Data for 1-Year GitHub Grid
  const yearData = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const randVal = (i % 7 === 0 || i % 13 === 0) ? 0 : (i % 3 === 0 ? 5 : (i % 2 === 0 ? 3 : 1.5));
      list.push({
        dateStr: d.toISOString().split('T')[0],
        value: randVal
      });
    }
    return list;
  }, []);

  // Dynamic Title & Subtitle Generator based on active Time Horizon
  const dynamicTitle = useMemo(() => {
    if (timeRange === '30d') return '30-Day Monthly Productivity & Focus Heatmap';
    if (timeRange === '1y') return '1-Year (365-Day) Productivity Velocity & Focus Grid';
    return title || '7-Day Productivity Velocity & Focus Heatmap';
  }, [timeRange, title]);

  const dynamicSubtitle = useMemo(() => {
    if (timeRange === '30d') return 'Visualizing daily focus hours and task outputs over the past 30 days.';
    if (timeRange === '1y') return 'GitHub-style 52-week activity contribution grid showing long-term focus momentum.';
    return subtitle || 'Track daily focus consistency, active focus streaks, and peak productivity windows.';
  }, [timeRange, subtitle]);

  return (
    <Card style={{ marginTop: '1.5rem', ...style }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 {dynamicTitle}
          </h3>
          {dynamicSubtitle && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {dynamicSubtitle}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Time Range Selector Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setTimeRange('7d')}
              style={{
                background: timeRange === '7d' ? 'var(--accent-indigo)' : 'transparent',
                color: timeRange === '7d' ? '#FFF' : 'var(--text-muted)',
                border: 'none', borderRadius: '6px', padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer'
              }}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('30d')}
              style={{
                background: timeRange === '30d' ? 'var(--accent-indigo)' : 'transparent',
                color: timeRange === '30d' ? '#FFF' : 'var(--text-muted)',
                border: 'none', borderRadius: '6px', padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer'
              }}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('1y')}
              style={{
                background: timeRange === '1y' ? 'var(--accent-indigo)' : 'transparent',
                color: timeRange === '1y' ? '#FFF' : 'var(--text-muted)',
                border: 'none', borderRadius: '6px', padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer'
              }}
            >
              1 Year
            </button>
          </div>

          {streak > 0 && <Badge variant="emerald">🔥 {streak}-Day Streak</Badge>}
          {peakWindow && <Badge variant="indigo">⚡ Peak: {peakWindow}</Badge>}
        </div>
      </div>

      {/* 1. 7-DAY VIEW (Detailed Velocity Bar Graph) */}
      {timeRange === '7d' && (
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
      )}

      {/* 2. 30-DAY VIEW (Monthly Grid Blocks) */}
      {timeRange === '30d' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
          {monthData.map((d, idx) => {
            const isHigh = d.value >= 4;
            const isMid = d.value > 0;
            return (
              <div
                key={idx}
                title={`${d.dateStr}: ${d.value} hours logged`}
                style={{
                  background: isHigh ? 'var(--accent-emerald)' : isMid ? 'rgba(99, 102, 241, 0.4)' : 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.3rem',
                  textAlign: 'center',
                  color: isHigh || isMid ? '#FFF' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}
              >
                Day {d.dayNum}
                <div style={{ fontSize: '0.68rem', marginTop: '0.15rem', opacity: 0.85 }}>{d.value}h</div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. 1-YEAR VIEW (GitHub-Style Contribution Grid) */}
      {timeRange === '1y' && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: '600' }}>
            Yearly Activity Heatmap Grid (365 Days • GitHub Contribution Format)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(52, 1fr)', gap: '3px', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {yearData.map((d, idx) => {
              const bg = d.value >= 4 ? '#10B981' : d.value >= 2 ? '#6366F1' : d.value > 0 ? '#818CF8' : 'var(--bg-surface-elevated)';
              return (
                <div
                  key={idx}
                  title={`${d.dateStr}: ${d.value} hours`}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    background: bg,
                    borderRadius: '2px',
                    border: '1px solid var(--border-subtle)'
                  }}
                />
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
            <span>Less</span>
            <span style={{ width: '10px', height: '10px', background: 'var(--bg-surface-elevated)', borderRadius: '2px' }} />
            <span style={{ width: '10px', height: '10px', background: '#818CF8', borderRadius: '2px' }} />
            <span style={{ width: '10px', height: '10px', background: '#6366F1', borderRadius: '2px' }} />
            <span style={{ width: '10px', height: '10px', background: '#10B981', borderRadius: '2px' }} />
            <span>More Focus</span>
          </div>
        </div>
      )}
    </Card>
  );
};
