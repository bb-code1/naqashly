import React, { useMemo } from 'react';

/**
 * 🕌 Prayer & Quran Deep-Dive Analytics Component
 * 
 * Provides rich, visual insights into prayer execution quality, individual prayer consistency,
 * Friday Surah Al-Kahf completions, and Daily Quran study metrics.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const PrayerAnalyticsDashboard = ({
  historyLogs = [],
  habits = []
}) => {
  // 1. Identify Prayer and Quran Habits
  const prayerHabits = useMemo(() => {
    return habits.filter(h => 
      h.isPrayer ||
      h.title?.toLowerCase().includes('prayer') ||
      h.title?.toLowerCase().includes('tahajjud') ||
      h.title?.toLowerCase().includes('fajr') ||
      h.title?.toLowerCase().includes('dhuhr') ||
      h.title?.toLowerCase().includes('asr') ||
      h.title?.toLowerCase().includes('maghrib') ||
      h.title?.toLowerCase().includes('isha')
    );
  }, [habits]);

  const quranHabits = useMemo(() => {
    return habits.filter(h => 
      h.title?.toLowerCase().includes('quran') ||
      h.title?.toLowerCase().includes('hifz') ||
      h.title?.toLowerCase().includes('tafsir')
    );
  }, [habits]);

  const kahfHabit = useMemo(() => {
    return habits.find(h => h.title?.toLowerCase().includes('kahf'));
  }, [habits]);

  // Helper to extract prayer keys for specific rendering
  const getPrayerKey = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('fajr')) return 'Fajr';
    if (t.includes('dhuhr')) return 'Dhuhr';
    if (t.includes('asr')) return 'Asr';
    if (t.includes('maghrib')) return 'Maghrib';
    if (t.includes('isha')) return 'Isha';
    if (t.includes('tahajjud')) return 'Tahajjud';
    return title;
  };

  // 2. Calculations
  const stats = useMemo(() => {
    const prayerIds = prayerHabits.map(h => Number(h.id));
    const logs = historyLogs.filter(l => prayerIds.includes(Number(l.habitId)));

    // Quality Stats
    let totalQualityLogs = 0;
    let jamaatCount = 0;
    let onTimeCount = 0;
    let lateCount = 0;

    logs.forEach(log => {
      if (log.completionPercentage > 0) {
        totalQualityLogs++;
        if (log.qualityGrade === 'JAMAAT') jamaatCount++;
        else if (log.qualityGrade === 'ON_TIME') onTimeCount++;
        else if (log.qualityGrade === 'LATE') lateCount++;
        else onTimeCount++; // Default fallback
      }
    });

    const divisor = totalQualityLogs || 1;
    const jamaatPct = Math.round((jamaatCount / divisor) * 100);
    const onTimePct = Math.round((onTimeCount / divisor) * 100);
    const latePct = Math.round((lateCount / divisor) * 100);

    // Individual Prayer Matrix
    const prayerMatrix = prayerHabits.map(h => {
      const hLogs = historyLogs.filter(l => Number(l.habitId) === Number(h.id));
      const completedDays = hLogs.filter(l => l.completionPercentage > 0).length;
      const successPct = hLogs.length > 0 ? Math.round((completedDays / hLogs.length) * 100) : (h.status === 'COMPLETED' ? 100 : 0);

      // Streak calculation
      let currentStreak = h.streakCount || 0;
      let peakStreak = h.streakCount || 0;

      return {
        id: h.id,
        name: getPrayerKey(h.title),
        originalTitle: h.title,
        successPct,
        currentStreak,
        peakStreak
      };
    });

    // Quran Stats
    const quranStats = quranHabits.map(h => {
      const hLogs = historyLogs.filter(l => Number(l.habitId) === Number(h.id));
      const completedDays = hLogs.filter(l => l.completionPercentage > 0).length;
      const successPct = hLogs.length > 0 ? Math.round((completedDays / hLogs.length) * 100) : (h.status === 'COMPLETED' ? 100 : 0);

      return {
        id: h.id,
        title: h.title,
        successPct,
        streak: h.streakCount || 0
      };
    });

    // Surah Al-Kahf Friday Tracking (Last 8 Fridays)
    const fridays = [];
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sun, 5 = Fri
    
    // Find last Friday
    const lastFriday = new Date(today);
    const daysToFriday = (currentDay >= 5) ? (currentDay - 5) : (currentDay + 2);
    lastFriday.setDate(today.getDate() - daysToFriday);

    for (let i = 0; i < 8; i++) {
      const f = new Date(lastFriday);
      f.setDate(lastFriday.getDate() - (i * 7));
      const fStr = f.toISOString().split('T')[0];

      let completed = false;
      if (kahfHabit) {
        const kLog = historyLogs.find(l => Number(l.habitId) === Number(kahfHabit.id) && l.logDate === fStr);
        completed = kLog ? kLog.completionPercentage > 0 : false;
      }

      fridays.push({
        dateStr: fStr,
        label: f.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed
      });
    }
    fridays.reverse();

    return {
      jamaatPct,
      onTimePct,
      latePct,
      totalQualityLogs,
      prayerMatrix,
      quranStats,
      fridays
    };
  }, [historyLogs, prayerHabits, quranHabits, kahfHabit]);

  return (
    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      
      {/* Header Info */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🕌 Spiritual & Solstice Analytics
        </h3>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
          Quality and consistency analysis for prayers and Quranic devotions.
        </p>
      </div>

      {/* Grid Allocation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
        
        {/* Column 1: Execution Quality Distribution */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
            🕌 Quality Distribution
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {/* Jama'at */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                <span style={{ color: '#10B981' }}>🕌 In Jama'at</span>
                <span>{stats.jamaatPct}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${stats.jamaatPct}%`, height: '100%', background: '#10B981', borderRadius: '3px' }} />
              </div>
            </div>

            {/* On Time */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                <span style={{ color: '#6366F1' }}>⏰ On Time</span>
                <span>{stats.onTimePct}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${stats.onTimePct}%`, height: '100%', background: '#6366F1', borderRadius: '3px' }} />
              </div>
            </div>

            {/* Late */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                <span style={{ color: '#F59E0B' }}>⏳ Late / Qada</span>
                <span>{stats.latePct}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${stats.latePct}%`, height: '100%', background: '#F59E0B', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Individual Prayer Consistency */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
            📈 Solstice Consistency
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', maxHeight: '180px', overflowY: 'auto' }}>
            {stats.prayerMatrix.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: '700' }}>
                <span style={{ color: 'var(--text-heading)' }}>{p.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>🔥 {p.currentStreak}d</span>
                  <span style={{ background: p.successPct >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)', color: p.successPct >= 80 ? '#10B981' : 'var(--text-heading)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.68rem' }}>
                    {p.successPct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Quran & Friday Surah Al-Kahf */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
            📖 Quran & Friday Special
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {/* Daily Quran */}
            {stats.quranStats.map((q, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: '700', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-heading)' }}>📖 {q.title.replace('📚 ', '')}</span>
                  <span style={{ color: '#10B981' }}>🔥 {q.streak}d ({q.successPct}%)</span>
                </div>
              </div>
            ))}

            {/* Friday Al-Kahf Tracker */}
            <div style={{ marginTop: '0.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                🕌 SURAH AL-KAHF (LAST 8 FRIDAYS):
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {stats.fridays.map((f, idx) => (
                  <div
                    key={idx}
                    title={`${f.label}: ${f.completed ? 'Completed' : 'Pending'}`}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: f.completed ? '#10B981' : 'var(--bg-surface-elevated)',
                      border: `1.5px solid ${f.completed ? '#10B981' : 'var(--border-subtle)'}`,
                      color: f.completed ? '#fff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      fontSize: '0.55rem',
                      fontWeight: '900'
                    }}
                  >
                    {f.completed ? '✓' : 'K'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
