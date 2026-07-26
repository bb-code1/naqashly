import React, { useState, useEffect } from 'react';
import * as routineApi from '../../../api/routineApi';

/**
 * 📜 Muhasabah History & Retrospective Journal Component
 * 
 * Renders past daily self-reflection logs, performance grade trends (A+, A, B, C),
 * mood badges, and a scrollable feed of Daily Wins & Friction Blockers.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const MuhasabahJournal = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await routineApi.getMuhasabahHistory();
        if (data && Array.isArray(data)) {
          setHistory(data);
        }
      } catch (err) {
        console.warn('[MuhasabahJournal] Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getMoodBadge = (m) => {
    switch (m) {
      case 'INSPIRED': return { emoji: '🌟', label: 'Inspired' };
      case 'PEACEFUL': return { emoji: '😌', label: 'Peaceful' };
      case 'NEUTRAL': return { emoji: '😐', label: 'Neutral' };
      case 'EXHAUSTED': return { emoji: '😓', label: 'Exhausted' };
      default: return { emoji: '🌟', label: m || 'Inspired' };
    }
  };

  const getGradeColor = (g) => {
    switch (g) {
      case 'A+': return '#10B981';
      case 'A': return '#10B981';
      case 'B': return '#F59E0B';
      case 'C': return '#EF4444';
      default: return '#6366F1';
    }
  };

  return (
    <div style={{
      background: 'var(--bg-surface-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '20px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      {/* Journal Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px' }}>
            📜 Retrospective History
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-heading)', margin: '0.2rem 0 0 0' }}>
            Muhasabah Reflective Journal
          </h3>
        </div>

        <span style={{ fontSize: '0.78rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.25rem 0.65rem', borderRadius: '8px', fontWeight: '800' }}>
          {history.length} Reflections Logged
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Loading your retrospective journal...
        </div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--bg-surface)', border: '1px dashed var(--border-subtle)', borderRadius: '14px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📜</div>
          <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-heading)' }}>No Muhasabah Entries Logged Yet</div>
          <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
            Click <strong>"📜 Nightly Muhasabah"</strong> in the top header bar tonight to log your first daily win & retrospective!
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.35rem' }}>
          {history.map(item => {
            const moodInfo = getMoodBadge(item.mood);
            const gradeColor = getGradeColor(item.muhasabahGrade);

            return (
              <div key={item.id} style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}>
                {/* Entry Card Top Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1rem' }}>📅</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)' }}>
                      {item.logDate}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '700', color: 'var(--text-muted)' }}>
                      {moodInfo.emoji} {moodInfo.label}
                    </span>
                  </div>

                  <div style={{
                    background: gradeColor,
                    color: '#fff',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '900',
                    boxShadow: `0 4px 10px ${gradeColor}40`
                  }}>
                    Grade: {item.muhasabahGrade}
                  </div>
                </div>

                {/* Daily Win */}
                {item.dailyWin && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.06)', borderLeft: '3px solid #10B981', padding: '0.65rem 0.85rem', borderRadius: '0 8px 8px 0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#10B981', textTransform: 'uppercase' }}>
                      🏆 Daily Win
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-heading)', fontWeight: '700', marginTop: '0.15rem' }}>
                      {item.dailyWin}
                    </div>
                  </div>
                )}

                {/* Top Blocker */}
                {item.topBlocker && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.06)', borderLeft: '3px solid #EF4444', padding: '0.65rem 0.85rem', borderRadius: '0 8px 8px 0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#EF4444', textTransform: 'uppercase' }}>
                      🚧 Friction / Top Blocker
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-heading)', fontWeight: '700', marginTop: '0.15rem' }}>
                      {item.topBlocker}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
