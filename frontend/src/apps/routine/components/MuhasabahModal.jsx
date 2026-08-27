import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';

/**
 * 📜 Nightly Muhasabah Retrospective Modal Component
 * 
 * End-of-day self-reflection capturing Mood, Daily Win, Top Blocker, and calculating
 * an automatic Muhasabah Performance Grade (A+, A, B, C) stored in PostgreSQL.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const MuhasabahModal = ({
  isOpen,
  onClose,
  completedCount = 0,
  totalCount = 1,
  onSaveMuhasabah
}) => {
  const [mood, setMood] = useState('INSPIRED');
  const [dailyWin, setDailyWin] = useState('');
  const [topBlocker, setTopBlocker] = useState('');

  if (!isOpen) return null;

  // Completion Percentage calculation
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Automated Muhasabah Performance Grade calculation
  let grade = 'C';
  let gradeBadgeColor = '#EF4444';
  let gradeTitle = 'Growth Opportunity';

  if (completionPct >= 85) {
    grade = 'A+';
    gradeBadgeColor = '#10B981';
    gradeTitle = 'Mastery & Alignment 🔥';
  } else if (completionPct >= 70) {
    grade = 'A';
    gradeBadgeColor = '#10B981';
    gradeTitle = 'Strong Execution 🚀';
  } else if (completionPct >= 50) {
    grade = 'B';
    gradeBadgeColor = '#F59E0B';
    gradeTitle = 'Solid Momentum ⚡';
  }

  const handleSave = (e) => {
    e.preventDefault();
    if (onSaveMuhasabah) {
      onSaveMuhasabah({
        mood,
        dailyWin,
        topBlocker,
        muhasabahGrade: grade
      });
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(10, 15, 30, 0.85)',
      backdropFilter: 'blur(16px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '540px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '900', color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px' }}>
            ✨ SELF-REFLECTION
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-heading)', margin: '0.25rem 0 0 0' }}>
            Day Review
          </h2>
        </div>

        {/* Calculated Grade Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
          border: `1px solid ${gradeBadgeColor}40`,
          borderRadius: '16px',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>
              TODAY'S EXECUTION SCORE ({completedCount}/{totalCount} Habits Done)
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-heading)', marginTop: '0.2rem' }}>
              {gradeTitle}
            </div>
          </div>

          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: gradeBadgeColor,
            color: '#fff',
            fontSize: '1.6rem',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 16px ${gradeBadgeColor}40`
          }}>
            {grade}
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Mood Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
              1. How was your inner state & energy today?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
              {[
                { id: 'INSPIRED', label: '🌟 Inspired' },
                { id: 'PEACEFUL', label: '😌 Peaceful' },
                { id: 'NEUTRAL', label: '😐 Neutral' },
                { id: 'EXHAUSTED', label: '😓 Exhausted' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  style={{
                    background: mood === m.id ? '#6366F1' : 'var(--bg-surface)',
                    color: mood === m.id ? '#fff' : 'var(--text-heading)',
                    border: `1px solid ${mood === m.id ? '#6366F1' : 'var(--border-subtle)'}`,
                    borderRadius: '10px',
                    padding: '0.5rem 0.25rem',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Win */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
              2. What was your biggest win today?
            </label>
            <input
              type="text"
              placeholder="e.g. Completed System Architecture Sprint & Fajr Prayer on time!"
              value={dailyWin}
              onChange={(e) => setDailyWin(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.85rem',
                color: 'var(--text-heading)',
                outline: 'none'
              }}
            />
          </div>

          {/* Top Blocker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
              3. What friction or blocker slowed you down?
            </label>
            <input
              type="text"
              placeholder="e.g. Unexpected context switching in afternoon."
              value={topBlocker}
              onChange={(e) => setTopBlocker(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.85rem',
                color: 'var(--text-heading)',
                outline: 'none'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="emerald" style={{ fontWeight: '800' }}>
              💾 Save Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
