import React, { useState, useEffect, useRef } from 'react';
import { startSoundscape, stopSoundscape, setSoundscapeVolume } from '../../../utils/soundscapeEngine';
import { playAmbientChime } from '../../../utils/notificationEngine';
import { Button } from '../../../components/ui/Button';

/**
 * ⏱️ Habit Focus Session Stopwatch & Ambient Soundscape Modal Component
 * 
 * Immersive focus timer counting down targetMinutes with Web Audio API soundscapes.
 * Automatically logs 100% completion when timer reaches 00:00.
 */
export const HabitFocusModal = ({ habit, onComplete, onClose }) => {
  if (!habit) return null;

  const initialSeconds = Math.max(60, (Number(habit?.targetMinutes) || 15) * 60);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const [activeSoundscape, setActiveSoundscape] = useState('RAIN');
  const [volume, setVolume] = useState(0.4);

  const timerRef = useRef(null);

  // Soundscape lifecycle
  useEffect(() => {
    if (activeSoundscape !== 'OFF') {
      startSoundscape(activeSoundscape, volume);
    } else {
      stopSoundscape();
    }

    return () => stopSoundscape();
  }, [activeSoundscape]);

  // Volume slider update
  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setSoundscapeVolume(v);
  };

  // Countdown timer interval
  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      stopSoundscape();
      playAmbientChime();
      if (onComplete) onComplete(habit);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, secondsLeft, habit, onComplete]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPct = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 100;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', textAlign: 'center' }}>
        
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--accent-emerald)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            ⏱️ ACTIVE FOCUS SESSION
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-heading)', margin: '0.2rem 0 0 0' }}>
            {habit.title}
          </h3>
        </div>

        {/* Circular Progress Display */}
        <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="100" cy="100" r="85" stroke="var(--border-subtle)" strokeWidth="12" fill="transparent" />
            <circle
              cx="100"
              cy="100"
              r="85"
              stroke="#10B981"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 85}
              strokeDashoffset={(2 * Math.PI * 85) * (1 - progressPct / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
              {formattedTime}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {isActive ? '🔥 Session in Progress' : '⏸️ Session Paused'}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <Button variant={isActive ? 'secondary' : 'emerald'} onClick={() => setIsActive(!isActive)}>
            {isActive ? '⏸️ Pause' : '▶️ Resume'}
          </Button>
          <Button variant="secondary" onClick={() => setSecondsLeft(prev => prev + 300)}>
            +5 Mins
          </Button>
          <Button variant="emerald" onClick={() => { if (onComplete) onComplete(habit); onClose(); }}>
            ✓ Finish & Log 100%
          </Button>
        </div>

        {/* Soundscape Selector */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-heading)' }}>🎧 Ambient Focus Soundscape:</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Web Audio Synthesizer</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
            {[
              { id: 'OFF', label: '🔇 Off' },
              { id: 'RAIN', label: '🌧️ Rain' },
              { id: 'FOREST', label: '🌲 Forest' },
              { id: 'BEATS', label: '🎧 Beats' },
              { id: 'WHITE', label: '⚡ White' }
            ].map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSoundscape(s.id)}
                style={{
                  background: activeSoundscape === s.id ? 'var(--accent-primary, #6366F1)' : 'var(--bg-surface-elevated)',
                  color: activeSoundscape === s.id ? '#FFF' : 'var(--text-heading)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.2rem',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {activeSoundscape !== 'OFF' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)' }}>🔊 Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                style={{ flex: 1, accentColor: '#6366F1' }}
              />
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-heading)', width: '30px' }}>{Math.round(volume * 100)}%</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
        >
          Cancel & Close Session
        </button>

      </div>
    </div>
  );
};
