import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { POMODORO_PRESETS, AMBIENT_SOUNDS } from '../../../constants/productivityConstants';

/**
 * Compact Deep Work Pomodoro Studio Component.
 * Features sleek compact layout, presets, quick duration setter, and ambient sound selector.
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
export const PomodoroStudioCard = ({
  pomodoroMode,
  secondsLeft,
  isTimerRunning,
  activeSound,
  targetSessions,
  setTargetSessions,
  completedSessionsInCycle,
  shortBreakMinutes,
  setShortBreakMinutes,
  longBreakMinutes,
  setLongBreakMinutes,
  switchPomodoroMode,
  setCustomTimerDuration,
  toggleTimer,
  resetTimer,
  setActiveSound,
  formatTime
}) => {
  const [customTimerMinutes, setCustomTimerMinutes] = useState(25);

  return (
    <Card className="pomodoro-timer-card" style={{ maxWidth: '680px', margin: '0 auto', padding: '1.25rem 1.5rem' }}>
      {/* Mode Presets Header */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
        {POMODORO_PRESETS.map(p => (
          <button
            key={p.mode}
            onClick={() => switchPomodoroMode(p.mode)}
            className={`productivity-tab-btn ${pomodoroMode === p.mode ? 'active' : ''}`}
            style={{ borderColor: pomodoroMode === p.mode ? p.color : 'transparent', padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Quick Set Timer Presets & Input Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>⏱️ Duration:</span>
        {[15, 25, 45, 60, 90].map(m => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setCustomTimerMinutes(m);
              setCustomTimerDuration(m);
            }}
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              border: 'none',
              background: customTimerMinutes === m ? 'var(--accent-indigo)' : 'var(--bg-surface-elevated)',
              color: customTimerMinutes === m ? '#FFF' : 'var(--text-heading)',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {m}m
          </button>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <input
            type="number"
            min="1"
            max="300"
            value={customTimerMinutes}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCustomTimerMinutes(val);
              if (val > 0) setCustomTimerDuration(val);
            }}
            style={{
              width: '45px',
              padding: '0.15rem 0.35rem',
              borderRadius: '4px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-heading)',
              fontSize: '0.75rem',
              textAlign: 'center',
              outline: 'none',
              fontWeight: '700'
            }}
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>min</span>
        </div>
      </div>

      {/* Main Time Circle Display */}
      <div className="pomodoro-circle-display" style={{ margin: '0.5rem auto 1rem auto' }}>
        <div className="pomodoro-time-text" style={{ fontSize: '2.5rem' }}>{formatTime(secondsLeft)}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '0.2rem' }}>
          {pomodoroMode === 'FOCUS' ? '🎯 DEEP FOCUS' : pomodoroMode === 'LONG_BREAK' ? '🌴 RESTORATIVE LONG REST' : '☕ SHORT REST BREAK'}
        </div>
      </div>

      {/* Psychological Cycle Dots Indicator */}
      <div style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '0.65rem 0.85rem',
        marginBottom: '1rem',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-heading)' }}>Cycle:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {Array.from({ length: targetSessions }, (_, i) => i + 1).map(step => {
              const isDone = step <= completedSessionsInCycle;
              return (
                <div
                  key={step}
                  title={`Session #${step}`}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: isDone ? 'var(--accent-emerald)' : 'var(--bg-surface)',
                    border: isDone ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)'
                  }}
                />
              );
            })}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            ({completedSessionsInCycle}/{targetSessions} done)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
          <select
            value={targetSessions}
            onChange={(e) => setTargetSessions(Number(e.target.value))}
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-heading)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '0.15rem 0.35rem',
              fontSize: '0.72rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {[2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} Sessions Target</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
        <Button
          variant={isTimerRunning ? 'danger' : 'emerald'}
          onClick={toggleTimer}
          style={{ padding: '0.55rem 1.5rem', fontSize: '0.9rem', fontWeight: '800' }}
        >
          {isTimerRunning ? '⏸️ Pause' : '▶️ Start Work'}
        </Button>

        <Button variant="secondary" onClick={resetTimer} style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}>
          🔄 Reset
        </Button>
      </div>

      {/* Ambient Focus Sound Selector */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>Sound:</span>
        {AMBIENT_SOUNDS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSound(s.id)}
            className={`productivity-tab-btn ${activeSound === s.id ? 'active' : ''}`}
            style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </Card>
  );
};
