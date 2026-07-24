import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { POMODORO_PRESETS, AMBIENT_SOUNDS } from '../../../constants/productivityConstants';

/**
 * Decoupled Deep Work Pomodoro Studio & Adaptive Psychological Break Component.
 * Encapsulates Timer Display, Custom Duration Selectors, Cycle Dots, and Ambient Sound Studio.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
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
    <Card className="pomodoro-timer-card">
      {/* Mode Presets Header */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        {POMODORO_PRESETS.map(p => (
          <button
            key={p.mode}
            onClick={() => switchPomodoroMode(p.mode)}
            className={`productivity-tab-btn ${pomodoroMode === p.mode ? 'active' : ''}`}
            style={{ borderColor: pomodoroMode === p.mode ? p.color : 'transparent' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Duration Presets & Input Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>⏱️ Quick Set Timer:</span>
        {[15, 25, 45, 60, 90, 120].map(m => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setCustomTimerMinutes(m);
              setCustomTimerDuration(m);
            }}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: customTimerMinutes === m ? 'var(--accent-indigo)' : 'var(--bg-surface-elevated)',
              color: customTimerMinutes === m ? '#FFF' : 'var(--text-heading)',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {m}m
          </button>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
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
              width: '55px',
              padding: '0.25rem 0.45rem',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-heading)',
              fontSize: '0.8rem',
              textAlign: 'center',
              outline: 'none',
              fontWeight: '700'
            }}
          />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>min</span>
        </div>
      </div>

      {/* Main Circular Time Display */}
      <div className="pomodoro-circle-display">
        <div className="pomodoro-time-text">{formatTime(secondsLeft)}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '0.3rem' }}>
          {pomodoroMode === 'FOCUS' ? '🎯 DEEP FOCUS' : pomodoroMode === 'LONG_BREAK' ? '🌴 RESTORATIVE LONG REST' : '☕ SHORT REST BREAK'}
        </div>
      </div>

      {/* 🧠 ADAPTIVE PSYCHOLOGICAL BREAK & CYCLE PROGRESS BAR */}
      <div style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Left: Cycle Progress Indicators (● ● ● ○) */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            🧠 Psychological Cycle: {completedSessionsInCycle} of {targetSessions} Sessions Completed
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
            {Array.from({ length: targetSessions }, (_, i) => i + 1).map(step => {
              const isDone = step <= completedSessionsInCycle;
              return (
                <div
                  key={step}
                  title={`Session #${step}`}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: isDone ? 'var(--accent-emerald)' : 'var(--bg-surface)',
                    border: isDone ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                    transition: 'all 0.3s ease'
                  }}
                />
              );
            })}
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>
              ({targetSessions - completedSessionsInCycle} more until 🌴 {longBreakMinutes}m Long Rest)
            </span>
          </div>
        </div>

        {/* Right: Target & Break Config Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Target Sessions:</span>
            <select
              value={targetSessions}
              onChange={(e) => setTargetSessions(Number(e.target.value))}
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-heading)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.2rem 0.45rem',
                fontSize: '0.78rem',
                outline: 'none',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {[2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} Sessions</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Short Rest:</span>
            <select
              value={shortBreakMinutes}
              onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-heading)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.2rem 0.45rem',
                fontSize: '0.78rem',
                outline: 'none',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {[3, 5, 10, 15].map(num => (
                <option key={num} value={num}>{num} min</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Long Rest:</span>
            <select
              value={longBreakMinutes}
              onChange={(e) => setLongBreakMinutes(Number(e.target.value))}
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-heading)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.2rem 0.45rem',
                fontSize: '0.78rem',
                outline: 'none',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {[15, 20, 25, 30, 45].map(num => (
                <option key={num} value={num}>{num} min</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
        <Button
          variant={isTimerRunning ? 'danger' : 'emerald'}
          onClick={toggleTimer}
          style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: '800' }}
        >
          {isTimerRunning ? '⏸️ Pause Focus' : '▶️ Start Deep Work'}
        </Button>

        <Button variant="secondary" onClick={resetTimer} style={{ padding: '0.75rem 1.25rem' }}>
          🔄 Reset Timer
        </Button>
      </div>

      {/* Ambient Focus Sound Selector */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '700' }}>Ambient Focus Sound:</span>
        {AMBIENT_SOUNDS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSound(s.id)}
            className={`productivity-tab-btn ${activeSound === s.id ? 'active' : ''}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </Card>
  );
};
