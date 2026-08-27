import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';

/**
 * Enterprise Single-Task Spotlight Card & Web Audio Ambient Sound Studio Component (Decluttered & Responsive).
 */
export const FocusSpotlightCard = ({
  tasks = [],
  onCompleteTask,
  style = {}
}) => {
  const spotlightTask = tasks.find(t => t.status !== 'COMPLETED' && (t.priority === 'HIGH' || t.priority === 'URGENT'))
    || tasks.find(t => t.status !== 'COMPLETED')
    || null;

  const [customMinutes, setCustomMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const [activeSound, setActiveSound] = useState('OFF');
  const audioCtxRef = useRef(null);
  const noiseNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  const applyCustomDuration = (mins) => {
    const valid = Math.max(1, Math.min(300, Number(mins) || 25));
    setCustomMinutes(valid);
    setIsRunning(false);
    setTimeLeft(valid * 60);
  };

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

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

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (soundType === 'RAIN' || soundType === 'WAVES') {
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          data[i] = b0 + b1 + b2 + b3 + b4 + b5 + white * 0.5362;
          data[i] *= 0.11;
        } else {
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

  useEffect(() => {
    return () => stopAmbientSound();
  }, []);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Card className="focus-spotlight-wrapper" style={style}>
      <div className="focus-spotlight-header">
        <div>
          <Badge variant="indigo">🎯 FOCUS NOW SPOTLIGHT</Badge>
          <p className="focus-spotlight-description">
            Single-task focus mode designed to eliminate distractions and induce deep work state.
          </p>
        </div>

        {/* Ambient Sound Studio Selector */}
        <div className="focus-spotlight-ambient-bar">
          <span className="ambient-bar-label">🎧 Sound:</span>
          <button
            type="button"
            onClick={() => playAmbientSound(activeSound === 'RAIN' ? 'OFF' : 'RAIN')}
            className={`ambient-sound-btn ${activeSound === 'RAIN' ? 'active' : ''}`}
          >
            🌧️ Rain
          </button>
          <button
            type="button"
            onClick={() => playAmbientSound(activeSound === 'WAVES' ? 'OFF' : 'WAVES')}
            className={`ambient-sound-btn ${activeSound === 'WAVES' ? 'active' : ''}`}
          >
            🌊 Waves
          </button>
          <button
            type="button"
            onClick={() => playAmbientSound(activeSound === 'BEATS' ? 'OFF' : 'BEATS')}
            className={`ambient-sound-btn ${activeSound === 'BEATS' ? 'active' : ''}`}
          >
            🎧 Deep Focus
          </button>
        </div>
      </div>

      {spotlightTask ? (
        <div className="focus-spotlight-task-box">
          
          {/* Spotlight Task Title & Metadata */}
          <div className="focus-spotlight-task-details">
            <div className="task-details-meta-row">
              <Badge variant={spotlightTask.priority === 'HIGH' || spotlightTask.priority === 'URGENT' ? 'danger' : 'indigo'}>
                {spotlightTask.priority}
              </Badge>
              <span className="task-category-label">🏷️ {spotlightTask.category || 'General'}</span>
            </div>
            <h2 className="task-title-heading">
              {spotlightTask.title}
            </h2>
            {spotlightTask.description && (
              <p className="task-desc-paragraph">
                {spotlightTask.description}
              </p>
            )}
          </div>

          {/* Integrated Pomodoro Clock & Customizable Duration Controls */}
          <div className="focus-spotlight-timer-controls">
            <div className="focus-spotlight-timer-row">
              <div className="focus-spotlight-clock-display font-mono">
                {formatTimer(timeLeft)}
              </div>

              <div className="focus-spotlight-actions-group">
                <div className="actions-group-controls">
                  <Button
                    variant={isRunning ? 'amber' : 'indigo'}
                    onClick={() => setIsRunning(!isRunning)}
                    className="timer-control-btn btn-focus-now"
                  >
                    {isRunning ? '⏸️ Pause' : '▶️ Focus Now'}
                  </Button>
                  <Button
                    variant="subtle"
                    onClick={() => applyCustomDuration(customMinutes)}
                    className="timer-control-btn btn-reset"
                  >
                    🔄 Reset
                  </Button>
                </div>

                <Button
                  variant="emerald"
                  onClick={() => onCompleteTask && onCompleteTask(spotlightTask.id)}
                  className="btn-complete-advance"
                >
                  ✓ Complete & Advance
                </Button>
              </div>
            </div>

            {/* Custom Duration Presets & Input Bar */}
            <div className="focus-spotlight-duration-preset-bar">
              <span className="duration-bar-label">⏱️ Duration:</span>
              <div className="presets-scroll-wrap">
                {[15, 25, 45, 60, 90].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => applyCustomDuration(m)}
                    className={`preset-btn ${customMinutes === m ? 'active' : ''}`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
              <div className="custom-input-box">
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={customMinutes}
                  onChange={(e) => applyCustomDuration(e.target.value)}
                  className="duration-number-input"
                />
                <span className="custom-input-unit">min</span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="focus-spotlight-empty">
          🎉 All priority tasks completed! Add a new task to initiate Focus Spotlight mode.
        </div>
      )}
    </Card>
  );
};
