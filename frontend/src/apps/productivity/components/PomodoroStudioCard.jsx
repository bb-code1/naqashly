import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { POMODORO_PRESETS, AMBIENT_SOUNDS } from '../../../constants/productivityConstants';

/**
 * Compact Deep Work Pomodoro Studio Component (Refactored & Responsive).
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
      <div className="pomodoro-presets-header">
        {POMODORO_PRESETS.map(p => (
          <button
            key={p.mode}
            onClick={() => switchPomodoroMode(p.mode)}
            className={`productivity-tab-btn preset-mode-btn ${pomodoroMode === p.mode ? 'active' : ''}`}
            style={{ borderColor: pomodoroMode === p.mode ? p.color : 'transparent' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Quick Set Timer Presets & Input Bar */}
      <div className="pomodoro-duration-preset-bar">
        <span className="duration-label">⏱️ Duration:</span>
        <div className="presets-list-wrap">
          {[15, 25, 45, 60, 90].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setCustomTimerMinutes(m);
                setCustomTimerDuration(m);
              }}
              className={`duration-preset-btn ${customTimerMinutes === m ? 'active' : ''}`}
            >
              {m}m
            </button>
          ))}
        </div>
        <div className="custom-duration-input-box">
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
            className="duration-number-input"
          />
          <span className="duration-unit">min</span>
        </div>
      </div>

      {/* Main Time Circle Display */}
      <div className="pomodoro-circle-display">
        <div className="pomodoro-time-text">{formatTime(secondsLeft)}</div>
        <div className="pomodoro-mode-display-label">
          {pomodoroMode === 'FOCUS' ? '🎯 DEEP FOCUS' : pomodoroMode === 'LONG_BREAK' ? '🌴 RESTORATIVE LONG REST' : '☕ SHORT REST BREAK'}
        </div>
      </div>

      {/* Psychological Cycle Dots Indicator */}
      <div className="pomodoro-cycle-card">
        <div className="cycle-indicator-group">
          <span className="cycle-label">Cycle:</span>
          <div className="cycle-dots-row">
            {Array.from({ length: targetSessions }, (_, i) => i + 1).map(step => {
              const isDone = step <= completedSessionsInCycle;
              return (
                <div
                  key={step}
                  title={`Session #${step}`}
                  className={`cycle-dot ${isDone ? 'done' : ''}`}
                />
              );
            })}
          </div>
          <span className="cycle-fraction">
            ({completedSessionsInCycle}/{targetSessions} done)
          </span>
        </div>

        <div className="cycle-target-dropdown-box">
          <select
            value={targetSessions}
            onChange={(e) => setTargetSessions(Number(e.target.value))}
            className="cycle-target-select"
          >
            {[2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} Sessions Target</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Controls */}
      <div className="pomodoro-action-controls">
        <Button
          variant={isTimerRunning ? 'danger' : 'emerald'}
          onClick={toggleTimer}
          className="pomodoro-start-btn"
        >
          {isTimerRunning ? '⏸️ Pause' : '▶️ Start Work'}
        </Button>

        <Button variant="secondary" onClick={resetTimer} className="pomodoro-reset-btn">
          🔄 Reset
        </Button>
      </div>

      {/* Ambient Focus Sound Selector */}
      <div className="pomodoro-ambient-selector">
        <span className="ambient-label">Sound:</span>
        <div className="ambient-sounds-list-wrap">
          {AMBIENT_SOUNDS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSound(s.id)}
              className={`productivity-tab-btn sound-option-btn ${activeSound === s.id ? 'active' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};
