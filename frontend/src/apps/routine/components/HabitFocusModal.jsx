import React, { useState, useEffect, useRef } from 'react';
import { startSoundscape, stopSoundscape, setSoundscapeVolume } from '../../../utils/soundscapeEngine';
import { playAmbientChime } from '../../../utils/notificationEngine';
import { Button } from '../../../components/ui/Button';

/**
 * ⏱️ Habit Focus Session Stopwatch & Ambient Soundscape Modal Component
 * 
 * Immersive focus timer counting down targetMinutes with Web Audio API soundscapes.
 * Automatically logs 100% completion in PostgreSQL when timer reaches 00:00.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const HabitFocusModal = ({ habit, onComplete, onClose }) => {
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
      if (onComplete) {
        onComplete(habit);
      }
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, secondsLeft, habit, onComplete]);

  // Add +5 Minutes
  const handleAddFiveMins = () => {
    setSecondsLeft(prev => prev + 300);
    setTotalSeconds(prev => prev + 300);
  };

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // SVG ring progress percentage
  const progressPct = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;
  const strokeDashoffset = 283 - (283 * (100 - progressPct)) / 100;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(10, 15, 30, 0.88)',
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
        maxWidth: '520px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px' }}>
            ⏱️ Active Focus Session
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--text-heading)', margin: '0.25rem 0 0 0' }}>
            {habit?.title || 'Habit Focus Session'}
          </h2>
        </div>

        {/* Circular Progress Ring & Digital Timer */}
        <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="200" height="200" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="45" stroke="var(--border-subtle)" strokeWidth="6" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#10B981"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>

          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-heading)', fontFamily: 'monospace', letterSpacing: '-1px' }}>
              {formatTime(secondsLeft)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '0.2rem' }}>
              {isActive ? '🔥 Session in Progress' : secondsLeft === 0 ? '🎉 Completed!' : '⏸️ Paused'}
            </div>
          </div>
        </div>

        {/* Stopwatch Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'center' }}>
          <Button
            variant={isActive ? 'subtle' : 'emerald'}
            onClick={() => setIsActive(!isActive)}
            style={{ padding: '0.65rem 1.25rem', fontWeight: '800' }}
          >
            {isActive ? '⏸️ Pause' : '▶ Resume'}
          </Button>

          <Button
            variant="subtle"
            onClick={handleAddFiveMins}
            style={{ padding: '0.65rem 1rem', fontWeight: '800' }}
          >
            +5 Mins
          </Button>

          <Button
            variant="emerald"
            onClick={() => {
              stopSoundscape();
              playAmbientChime();
              if (onComplete) onComplete(habit);
              onClose();
            }}
            style={{ padding: '0.65rem 1.25rem', fontWeight: '800' }}
          >
            ✅ Finish & Log 100%
          </Button>
        </div>

        {/* Ambient Soundscapes Synthesizer Bar */}
        <div style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-heading)' }}>
              🎧 Ambient Focus Soundscape:
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>
              Web Audio Synthesizer
            </span>
          </div>

          {/* Soundscape Options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem' }}>
            {[
              { id: 'OFF', label: '🔇 Off' },
              { id: 'RAIN', label: '🌧️ Rain' },
              { id: 'FOREST', label: '🌲 Forest' },
              { id: 'BINAURAL', label: '🎧 Beats' },
              { id: 'WHITE_NOISE', label: '⚡ White' }
            ].map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSoundscape(s.id)}
                style={{
                  background: activeSoundscape === s.id ? '#6366F1' : 'var(--bg-surface-elevated)',
                  color: activeSoundscape === s.id ? '#fff' : 'var(--text-heading)',
                  border: `1px solid ${activeSoundscape === s.id ? '#6366F1' : 'var(--border-subtle)'}`,
                  borderRadius: '8px',
                  padding: '0.4rem 0.2rem',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Volume Slider */}
          {activeSoundscape !== 'OFF' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)' }}>🔊 Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                style={{ flex: 1, accentColor: '#6366F1', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-heading)', width: '32px' }}>
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            stopSoundscape();
            onClose();
          }}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
        >
          Cancel & Close Session
        </button>
      </div>
    </div>
  );
};
