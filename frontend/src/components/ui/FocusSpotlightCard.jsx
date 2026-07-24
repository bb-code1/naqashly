import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';

/**
 * Enterprise Single-Task Spotlight Card & Web Audio Ambient Sound Studio Component.
 * Features auto-spotlighting #1 urgent task, integrated countdown timer, native Web Audio ambient sound generator,
 * and 1-click task completion auto-advance.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const FocusSpotlightCard = ({
  tasks = [],
  onCompleteTask,
  style = {}
}) => {
  // Find highest priority pending task
  const spotlightTask = tasks.find(t => t.status !== 'COMPLETED' && (t.priority === 'HIGH' || t.priority === 'URGENT'))
    || tasks.find(t => t.status !== 'COMPLETED')
    || null;

  // Timer State (25 Minutes = 1500 Seconds)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Web Audio API Ambient Sound State
  const [activeSound, setActiveSound] = useState('OFF'); // 'OFF' | 'RAIN' | 'WAVES' | 'BEATS'
  const audioCtxRef = useRef(null);
  const noiseNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Timer Countdown Logic
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Auto-complete or trigger notification
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Web Audio Ambient Synthesizer Engine
  const stopAmbientSound = () => {
    if (noiseNodeRef.current) {
      try { noiseNodeRef.current.stop(); } catch (e) {}
      noiseNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  const playAmbientSound = (soundType) => {
    stopAmbientSound();

    if (soundType === 'OFF') {
      setActiveSound('OFF');
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2; // 2 Seconds Buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink / Brown Noise Generation for Calming Rain & Ocean Waves
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (soundType === 'RAIN' || soundType === 'WAVES') {
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          data[i] *= 0.11; // Volume balance
          b6 = white * 0.115926;
        } else {
          // Deep Beats Binaural Sine Generator
          data[i] = Math.sin(2 * Math.PI * 110 * (i / ctx.sampleRate)) * 0.1;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);

      noise.connect(gainNode);
      gainNode.connect(ctx.destination);
      noise.start();

      noiseNodeRef.current = noise;
      gainNodeRef.current = gainNode;
      setActiveSound(soundType);
    } catch (e) {
      console.warn('Web Audio Ambient Synthesizer Error:', e);
      setActiveSound('OFF');
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => stopAmbientSound();
  }, []);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Card style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid var(--accent-indigo)', borderRadius: '16px', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <Badge variant="indigo">🎯 FOCUS NOW SPOTLIGHT</Badge>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Single-task focus mode designed to eliminate distractions and induce deep work state.
          </p>
        </div>

        {/* Ambient Sound Studio Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-surface)', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>🎧 Sound:</span>
          <button
            type="button"
            onClick={() => playAmbientSound(activeSound === 'RAIN' ? 'OFF' : 'RAIN')}
            style={{
              background: activeSound === 'RAIN' ? 'var(--accent-indigo)' : 'transparent',
              color: activeSound === 'RAIN' ? '#FFF' : 'var(--text-heading)',
              border: 'none', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer'
            }}
          >
            🌧️ Rain
          </button>
          <button
            type="button"
            onClick={() => playAmbientSound(activeSound === 'WAVES' ? 'OFF' : 'WAVES')}
            style={{
              background: activeSound === 'WAVES' ? 'var(--accent-indigo)' : 'transparent',
              color: activeSound === 'WAVES' ? '#FFF' : 'var(--text-heading)',
              border: 'none', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer'
            }}
          >
            🌊 Waves
          </button>
          <button
            type="button"
            onClick={() => playAmbientSound(activeSound === 'BEATS' ? 'OFF' : 'BEATS')}
            style={{
              background: activeSound === 'BEATS' ? 'var(--accent-indigo)' : 'transparent',
              color: activeSound === 'BEATS' ? '#FFF' : 'var(--text-heading)',
              border: 'none', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer'
            }}
          >
            🎧 Deep Focus
          </button>
        </div>
      </div>

      {spotlightTask ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          {/* Spotlight Task Title & Metadata */}
          <div style={{ flex: '1', minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Badge variant={spotlightTask.priority === 'HIGH' || spotlightTask.priority === 'URGENT' ? 'danger' : 'indigo'}>
                {spotlightTask.priority} PRIORITY
              </Badge>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🏷️ {spotlightTask.category || 'General'}</span>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
              {spotlightTask.title}
            </h2>
            {spotlightTask.description && (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {spotlightTask.description}
              </p>
            )}
          </div>

          {/* Integrated Pomodoro Clock & Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: '900', color: 'var(--accent-indigo)', background: 'var(--bg-surface-elevated)', padding: '0.4rem 1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              {formatTimer(timeLeft)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <Button
                  variant={isRunning ? 'amber' : 'indigo'}
                  onClick={() => setIsRunning(!isRunning)}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                >
                  {isRunning ? '⏸️ Pause' : '▶️ Focus Now'}
                </Button>
                <Button
                  variant="subtle"
                  onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }}
                  style={{ padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
                >
                  🔄 Reset
                </Button>
              </div>

              <Button
                variant="emerald"
                onClick={() => onCompleteTask && onCompleteTask(spotlightTask.id)}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem', fontWeight: '800' }}
              >
                ✓ Complete & Advance
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          🎉 All high-priority tasks completed! Add a new task to initiate Focus Spotlight mode.
        </div>
      )}
    </Card>
  );
};
