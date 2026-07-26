import React, { useState, useMemo } from 'react';

/**
 * 📊 GitHub-Style Dynamic Activity Heatmap Component
 * 
 * Renders configurable contribution grid (1 Month default, 3 Months, 6 Months, or Full Year).
 * Aligns month headers precisely over week columns to prevent label overlapping.
 * Includes interactive dropdown filters for individual habits and category filters.
 * 
 * @author Barkat Bashir
 * @version 4.0.0
 */
export const ConsistencyHeatmap = ({
  historyLogs = [],
  habits = []
}) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [timeHorizon, setTimeHorizon] = useState('1M'); // '1M' | '3M' | '6M' | '1Y'
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  // Determine total days to display based on selected Time Horizon
  const targetDays = useMemo(() => {
    switch (timeHorizon) {
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': default: return 364;
    }
  }, [timeHorizon]);

  // Compute selected filter title dynamically
  const selectedFilterTitle = useMemo(() => {
    if (selectedFilter === 'ALL') return 'Overall System Routine';
    if (selectedFilter.startsWith('CAT:')) {
      const cat = selectedFilter.replace('CAT:', '');
      return `Category: ${cat}`;
    }
    if (selectedFilter.startsWith('HABIT:')) {
      const hId = Number(selectedFilter.replace('HABIT:', ''));
      const habit = habits.find(h => Number(h.id) === hId);
      return habit ? habit.title : 'Selected Habit';
    }
    return 'Routine';
  }, [selectedFilter, habits]);

  // Generate weeks of dates ending today with dynamic filter & horizon logic
  const { weeks, monthLabels, totalCompletions, currentStreak, lifetimeSuccessPct } = useMemo(() => {
    const today = new Date();
    const daysArr = [];

    // Filter history logs based on active selection (Habit vs Category vs All)
    let activeLogs = historyLogs;
    if (selectedFilter.startsWith('HABIT:')) {
      const hId = Number(selectedFilter.replace('HABIT:', ''));
      activeLogs = historyLogs.filter(l => Number(l.habitId) === hId);
    } else if (selectedFilter.startsWith('CAT:')) {
      const catId = selectedFilter.replace('CAT:', '');
      const catHabitIds = habits.filter(h => h.category === catId).map(h => Number(h.id));
      activeLogs = historyLogs.filter(l => catHabitIds.includes(Number(l.habitId)));
    }
    
    // Map logs into quick lookup map: 'YYYY-MM-DD' -> pct
    const logMap = {};
    activeLogs.forEach(log => {
      if (log.logDate) {
        logMap[log.logDate] = log.completionPercentage || (log.status === 'COMPLETED' ? 100 : log.status === 'PARTIAL' ? 50 : 0);
      }
    });

    // Generate days according to targetDays (30 for 1M, 364 for 1Y)
    for (let i = targetDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Day of week: 0 = Sun, 1 = Mon ... 6 = Sat -> convert so Mon is index 0
      const rawDay = d.getDay();
      const dayIndex = rawDay === 0 ? 6 : rawDay - 1;

      // Strictly database driven: 0 if no record exists in habit_logs table for this date
      let pct = logMap[dateStr] !== undefined ? logMap[dateStr] : 0;

      // Determine intensity level 0 to 4
      let level = 0;
      if (pct >= 75) level = 4;
      else if (pct >= 50) level = 3;
      else if (pct >= 25) level = 2;
      else if (pct > 0) level = 1;

      daysArr.push({
        dateStr,
        dateObj: d,
        dayIndex,
        pct,
        level,
        monthStr: d.toLocaleString('default', { month: 'short' }),
        dayStr: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      });
    }

    // Group into weeks (arrays of 7 days)
    const weeksArr = [];
    let currentWeek = [];
    
    // Pad first week if it doesn't start on Monday
    const firstDay = daysArr[0];
    if (firstDay) {
      for (let p = 0; p < firstDay.dayIndex; p++) {
        currentWeek.push(null);
      }
    }

    daysArr.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      weeksArr.push(currentWeek);
    }

    // Calculate month header labels with precise colIndex spacing & min 3-col collision guard
    const labels = [];
    let lastMonth = '';
    let lastColIndex = -10;

    weeksArr.forEach((w, wIdx) => {
      const validDay = w.find(d => d !== null);
      if (validDay && validDay.monthStr !== lastMonth) {
        // Enforce at least 3 columns (~42px) distance to prevent label overlap (e.g. JulAug)
        if (wIdx - lastColIndex >= 3) {
          labels.push({ colIndex: wIdx, label: validDay.monthStr });
          lastMonth = validDay.monthStr;
          lastColIndex = wIdx;
        }
      }
    });

    const activeCompletions = daysArr.filter(d => d.pct > 0).length;
    const avgPct = daysArr.length > 0 ? Math.round(daysArr.reduce((acc, d) => acc + d.pct, 0) / daysArr.length) : 0;

    // Calculate exact real-time consecutive active streak from DB history
    let streakCount = 0;
    for (let i = daysArr.length - 1; i >= 0; i--) {
      if (daysArr[i].pct > 0) {
        streakCount++;
      } else {
        if (i === daysArr.length - 1) continue; // Allow today if pending
        break;
      }
    }

    return {
      weeks: weeksArr,
      monthLabels: labels,
      totalCompletions: activeCompletions,
      currentStreak: streakCount,
      lifetimeSuccessPct: avgPct
    };
  }, [historyLogs, habits, selectedFilter, targetDays]);

  // Intensity level colors
  const getCellColor = (level) => {
    switch (level) {
      case 4: return '#10B981'; // 100% Emerald
      case 3: return 'rgba(16, 185, 129, 0.75)';
      case 2: return 'rgba(16, 185, 129, 0.45)';
      case 1: return 'rgba(16, 185, 129, 0.22)';
      default: return 'var(--bg-surface)';
    }
  };

  return (
    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Header Info & Filter Dropdown Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 Consistency Heatmap
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            🔄 Active Filter: <strong style={{ color: 'var(--accent-primary, #6366F1)' }}>{selectedFilterTitle}</strong>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            {totalCompletions} Active Days Logged over past {targetDays} days ({lifetimeSuccessPct}% Consistency)
          </p>
        </div>

        {/* Dynamic Filter Dropdown */}
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-heading)',
            borderRadius: '8px',
            padding: '0.4rem 0.8rem',
            fontSize: '0.75rem',
            fontWeight: '800',
            cursor: 'pointer',
            outline: 'none',
            maxWidth: '240px'
          }}
        >
          <option value="ALL">🌟 All Habits (Overall Routine)</option>
          <optgroup label="📂 Filter by Category">
            <option value="CAT:SPIRITUAL">✨ Spiritual & Reflection</option>
            <option value="CAT:PRODUCTIVITY">🚀 Productivity</option>
            <option value="CAT:HEALTH">💪 Health & Fitness</option>
            <option value="CAT:LEARNING">📚 Learning & Growth</option>
            <option value="CAT:MINDFULNESS">🧘 Mindfulness</option>
          </optgroup>
          {habits && habits.length > 0 && (
            <optgroup label="📋 Filter by Individual Habit">
              {habits.map(h => (
                <option key={h.id} value={`HABIT:${h.id}`}>
                  {h.title}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Grid Controls: Time Horizon Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.2rem', borderRadius: '8px' }}>
          {[
            { id: '1M', label: '📅 1 Month' },
            { id: '3M', label: '3 Months' },
            { id: '6M', label: '6 Months' },
            { id: '1Y', label: '🗓️ Full Year' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTimeHorizon(t.id)}
              style={{
                background: timeHorizon === t.id ? 'var(--accent-primary, #6366F1)' : 'transparent',
                color: timeHorizon === t.id ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', borderRadius: '8px', padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: '800', color: '#10B981' }}>
          🔥 {currentStreak} Day Peak Streak
        </div>
      </div>

      {/* Grid Container */}
      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem', position: 'relative' }}>
        {/* Month Labels Header */}
        <div style={{ display: 'flex', position: 'relative', height: '20px', marginLeft: '32px', marginBottom: '4px' }}>
          {monthLabels.map((m, idx) => (
            <span
              key={idx}
              style={{
                position: 'absolute',
                left: `${m.colIndex * 14}px`,
                fontSize: '0.72rem',
                fontWeight: '700',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap'
              }}
            >
              {m.label}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {/* Day of Week Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', width: '28px', paddingTop: '2px' }}>
            <span style={{ height: '11px', lineHeight: '11px' }}>Mon</span>
            <span style={{ height: '11px', lineHeight: '11px' }}></span>
            <span style={{ height: '11px', lineHeight: '11px' }}>Wed</span>
            <span style={{ height: '11px', lineHeight: '11px' }}></span>
            <span style={{ height: '11px', lineHeight: '11px' }}>Fri</span>
            <span style={{ height: '11px', lineHeight: '11px' }}></span>
            <span style={{ height: '11px', lineHeight: '11px' }}>Sun</span>
          </div>

          {/* Grid */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {weeks.map((week, wIdx) => (
              <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {week.map((day, dIdx) => {
                  if (!day) {
                    return <div key={dIdx} style={{ width: '11px', height: '11px', visibility: 'hidden' }} />;
                  }
                  const isHovered = hoveredCell && hoveredCell.dateStr === day.dateStr;

                  return (
                    <div
                      key={dIdx}
                      onMouseEnter={() => setHoveredCell(day)}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        width: '11px',
                        height: '11px',
                        borderRadius: '2px',
                        background: getCellColor(day.level),
                        border: day.level === 0 ? '1px solid var(--border-subtle)' : '1px solid rgba(16, 185, 129, 0.3)',
                        cursor: 'pointer',
                        transform: isHovered ? 'scale(1.4)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                        zIndex: isHovered ? 10 : 1,
                        boxShadow: isHovered ? '0 0 10px rgba(16, 185, 129, 0.8)' : 'none'
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Hover Tooltip & Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-heading)', fontWeight: '700' }}>
          {hoveredCell ? (
            <span>
              📅 <strong>{hoveredCell.dayStr}</strong>: {hoveredCell.pct}% Consistency ({hoveredCell.pct >= 100 ? 'Completed 🔥' : hoveredCell.pct >= 50 ? 'Partial Credit ⚡' : 'Pending'})
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Hover over any cell to inspect daily completion scores for {selectedFilterTitle}</span>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>
          <span>Less</span>
          <div style={{ width: '11px', height: '11px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '2px' }} />
          <div style={{ width: '11px', height: '11px', background: 'rgba(16, 185, 129, 0.22)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '2px' }} />
          <div style={{ width: '11px', height: '11px', background: 'rgba(16, 185, 129, 0.45)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '2px' }} />
          <div style={{ width: '11px', height: '11px', background: 'rgba(16, 185, 129, 0.75)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '2px' }} />
          <div style={{ width: '11px', height: '11px', background: '#10B981', borderRadius: '2px' }} />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
