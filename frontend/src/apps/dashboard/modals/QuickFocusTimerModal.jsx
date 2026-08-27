import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/Button';

/**
 * ⏱️ Quick Executive Focus Session (Pomodoro Timer) Modal
 * 
 * 25-minute classic & custom focus timer with start/pause/reset controls.
 */
export const QuickFocusTimerModal = ({ isOpen, onClose }) => {
  const [sessionMinutes, setSessionMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    setTimeLeft(sessionMinutes * 60);
    setIsRunning(false);
  }, [sessionMinutes]);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      setCompletedSessions(prev => prev + 1);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalSeconds = sessionMinutes * 60;
  const progressPct = Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100);

  const handleSelectPreset = (mins) => {
    setSessionMinutes(mins);
    setTimeLeft(mins * 60);
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(sessionMinutes * 60);
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" style={{ zIndex: 10000 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="modal-dialog wallet-modal"
          style={{ maxWidth: '480px', textAlign: 'center' }}
        >
          <div className="modal-header">
            <div>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                ⏱️ Executive Focus Session (Pomodoro)
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Uninterrupted Deep Work Mode
              </p>
            </div>
            <button type="button" onClick={onClose} className="modal-close-btn">✕</button>
          </div>

          <div style={{ padding: '1.25rem 0' }}>
            
            {/* Session Preset Selector Pills */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {[15, 25, 45].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelectPreset(m)}
                  style={{
                    background: sessionMinutes === m ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
                    border: `1px solid ${sessionMinutes === m ? '#10B981' : 'var(--border-subtle)'}`,
                    color: sessionMinutes === m ? '#10B981' : 'var(--text-muted)',
                    borderRadius: '10px',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  {m} Mins {m === 25 ? '(Classic)' : m === 45 ? '(Deep)' : ''}
                </button>
              ))}
            </div>

            {/* Giant Timer Readout Box */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '2px solid var(--border-subtle)',
              borderRadius: '24px',
              padding: '2rem 1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Progress Fill Line */}
              <div style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                height: '4px',
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #10B981, #38BDF8)',
                transition: 'width 1s linear'
              }} />

              <div style={{
                fontSize: '4.5rem',
                fontWeight: '900',
                fontFamily: 'var(--font-mono)',
                color: isRunning ? '#10B981' : 'var(--text-heading)',
                letterSpacing: '2px'
              }}>
                {formattedTime}
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: '700' }}>
                {isRunning ? '⚡ Focus Mode Active — Zero Distractions!' : timeLeft === 0 ? '🏆 Session Complete! Outstanding Focus!' : 'Press Start to Begin Focus Session'}
              </div>
            </div>

            {/* Timer Controls Row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <Button
                variant={isRunning ? 'secondary' : 'emerald'}
                onClick={() => setIsRunning(!isRunning)}
                style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', fontWeight: '800' }}
              >
                {isRunning ? '⏸️ Pause' : '▶️ Start Focus Session'}
              </Button>

              <Button
                variant="outline"
                onClick={handleReset}
                style={{ padding: '0.75rem 1.2rem', fontSize: '0.85rem' }}
              >
                🔄 Reset
              </Button>
            </div>

            {completedSessions > 0 && (
              <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '800', marginTop: '0.5rem' }}>
                🏆 {completedSessions} Focus Session{completedSessions > 1 ? 's' : ''} Completed Today!
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
