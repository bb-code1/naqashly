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
    if (t.includes('tahajjud')) return 'Tahajjud';
    if (t.includes('fajr')) return 'Fajr';
    if (t.includes('dhuhr')) return 'Dhuhr';
    if (t.includes('asr')) return 'Asr';
    if (t.includes('maghrib')) return 'Maghrib';
    if (t.includes('isha')) return 'Isha';
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
    <div className="prayer-analytics-card">
      
      {/* Header Info */}
      <div className="prayer-analytics-header">
        <h3 className="prayer-analytics-title">
          Orison Compliance Deep-Dive
        </h3>
        <p className="prayer-analytics-subtitle">
          Quality and consistency analysis for prayers and Quranic devotions.
        </p>
      </div>

      {/* Grid Allocation */}
      <div className="prayer-analytics-grid">
        
        {/* Column 1: Execution Quality Distribution */}
        <div className="prayer-analytics-column">
          <h4 className="prayer-analytics-column-header">
            🕌 Quality Distribution
          </h4>
          <div className="prayer-analytics-column-list">
            {/* Jama'at */}
            <div>
              <div className="prayer-progress-row-header font-green">
                <span>🕌 In Jama'at</span>
                <span>{stats.jamaatPct}%</span>
              </div>
              <div className="prayer-progress-track">
                <div className="prayer-progress-fill jamaat" style={{ width: `${stats.jamaatPct}%` }} />
              </div>
            </div>

            {/* On Time */}
            <div>
              <div className="prayer-progress-row-header font-indigo">
                <span>⏰ On Time</span>
                <span>{stats.onTimePct}%</span>
              </div>
              <div className="prayer-progress-track">
                <div className="prayer-progress-fill on-time" style={{ width: `${stats.onTimePct}%` }} />
              </div>
            </div>

            {/* Late */}
            <div>
              <div className="prayer-progress-row-header font-amber">
                <span>⏳ Late / Qada</span>
                <span>{stats.latePct}%</span>
              </div>
              <div className="prayer-progress-track">
                <div className="prayer-progress-fill late" style={{ width: `${stats.latePct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Individual Prayer Consistency */}
        <div className="prayer-analytics-column">
          <h4 className="prayer-analytics-column-header">
            📈 Solstice Consistency
          </h4>
          <div className="prayer-analytics-column-list space-small">
            {stats.prayerMatrix.map((p, idx) => (
              <div key={idx} className="prayer-consistency-row">
                <span className="prayer-consistency-name">{p.name}</span>
                <div className="prayer-consistency-badge-row">
                  <span className="prayer-consistency-streak">🔥 {p.currentStreak}d</span>
                  <span className={`prayer-success-badge ${p.successPct >= 80 ? 'high' : ''}`}>
                    {p.successPct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Quran & Friday Surah Al-Kahf */}
        <div className="prayer-analytics-column">
          <h4 className="prayer-analytics-column-header">
            📖 Quran & Friday Special
          </h4>
          <div className="prayer-analytics-column-list">
            {/* Daily Quran */}
            {stats.quranStats.map((q, idx) => (
              <div key={idx} className="quran-status-row">
                <div className="quran-status-title-row">
                  <span>📖 {q.title.replace('📚 ', '')}</span>
                  <span className="font-green">🔥 {q.streak}d ({q.successPct}%)</span>
                </div>
              </div>
            ))}

            {/* Friday Al-Kahf Tracker */}
            <div className="kahf-tracker-section">
              <div className="kahf-tracker-title">
                🕌 SURAH AL-KAHF (LAST 8 FRIDAYS):
              </div>
              <div className="kahf-bubbles-row">
                {stats.fridays.map((f, idx) => (
                  <div
                    key={idx}
                    title={`${f.label}: ${f.completed ? 'Completed' : 'Pending'}`}
                    className={`kahf-bubble-circle ${f.completed ? 'completed' : ''}`}
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
