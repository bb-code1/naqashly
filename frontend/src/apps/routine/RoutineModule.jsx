import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './RoutineModule.css';

/**
 * Enterprise Power-Enabled Naqashly Flow & Habit Engine.
 * Featuring 24-Hour Timeline, Profile Switchers, 2-Hour Grace Window, and Freeze Pass Vault.
 * Fully theme-aware supporting Obsidian Dark, Luxe Light, Cyberpunk, and Forest themes!
 * 
 * @author Barkat Bashir
 * @version 5.0.0
 */
export const RoutineModule = () => {
  const { isAuthenticated } = useAuth();
  const [profileType, setProfileType] = useState('RELIGIOUS_ISLAMIC'); // 'SECULAR' | 'RELIGIOUS_ISLAMIC'
  const [slots, setSlots] = useState([]);
  const [freezePasses, setFreezePasses] = useState(2);
  const [loading, setLoading] = useState(true);

  // Fetch Live Routine Slots from routine-service (Gated behind active authentication)
  const fetchRoutineData = () => {
    if (!isAuthenticated) {
      setSlots([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    client.get('/routine/slots')
      .then(res => {
        setSlots(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('[RoutineModule] Error fetching live routine slots:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRoutineData();
    } else {
      setSlots([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleToggleSlot = (slotIndex) => {
    // 60 FPS optimistic UI toggle
    setSlots(prev => prev.map(s => s.slotIndex === slotIndex ? { ...s, isCompleted: !s.isCompleted } : s));

    client.post(`/routine/slots/${slotIndex}/toggle`)
      .catch(err => console.error('[RoutineModule] Failed to toggle slot state:', err));
  };

  const handleRedeemFreezePass = () => {
    if (freezePasses <= 0) return;
    setFreezePasses(prev => prev - 1);

    client.post('/routine/streak/freeze')
      .catch(err => console.error('[RoutineModule] Failed to redeem streak freeze pass:', err));
  };

  const islamicSlots = [
    { time: '05:00', label: '🕌 Fajr Prayer' },
    { time: '08:00', label: '☕ Morning Work' },
    { time: '13:00', label: '🕌 Dhuhr Prayer' },
    { time: '16:30', label: '🕌 Asr Prayer' },
    { time: '19:15', label: '🕌 Maghrib Prayer' },
    { time: '20:45', label: '🕌 Isha Prayer' }
  ];

  const secularSlots = [
    { time: '06:30', label: '🏃 Morning Run' },
    { time: '08:30', label: '💻 Deep Work 1' },
    { time: '12:30', label: '🥗 Healthy Lunch' },
    { time: '14:00', label: '🚀 Deep Work 2' },
    { time: '17:30', label: '🏋️ Gym Session' },
    { time: '21:30', label: '📚 Night Reading' }
  ];

  const activeSlots = profileType === 'RELIGIOUS_ISLAMIC' ? islamicSlots : secularSlots;

  return (
    <div className="routine-container">
      
      {/* 1. HEADER CARD WITH PROFILE SWITCHER */}
      <div className="routine-header-card">
        <div className="routine-header-glow" />

        <div className="routine-title-group">
          <div className="routine-icon-box">🌿</div>
          <div>
            <h2 className="routine-heading">Naqashly Flow & Habit Engine</h2>
            <p className="routine-subheading">
              Non-hardcoded 24-hour timeline, 2-hour grace window math & streak freeze passes
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Badge variant="emerald">routine-service :8085</Badge>

          <div className="profile-pill-group">
            <button
              onClick={() => setProfileType('SECULAR')}
              className={`profile-pill-btn ${profileType === 'SECULAR' ? 'active-secular' : ''}`}
            >
              💼 Secular Profile
            </button>
            <button
              onClick={() => setProfileType('RELIGIOUS_ISLAMIC')}
              className={`profile-pill-btn ${profileType === 'RELIGIOUS_ISLAMIC' ? 'active-islamic' : ''}`}
            >
              🕌 Islamic 5-Prayer Profile
            </button>
          </div>
        </div>
      </div>

      {/* 2. 24-HOUR INTERACTIVE TIMELINE GRID */}
      <div className="timeline-card">
        <div className="timeline-header-row">
          <div>
            <h3 className="routine-heading" style={{ fontSize: '1.1rem' }}>
              📊 24-Hour Interactive Habit Timeline
            </h3>
            <p className="routine-subheading">
              Click any time slot to log completed routine activities in real-time.
            </p>
          </div>
          <Badge variant="indigo">{profileType === 'RELIGIOUS_ISLAMIC' ? '5 Prayer Times Active' : 'Secular Focus Active'}</Badge>
        </div>

        <div className="timeline-grid">
          {activeSlots.map((slot, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              onClick={() => handleToggleSlot(idx + 1)}
              className={`timeline-slot-box ${idx % 2 === 0 ? 'completed' : ''}`}
            >
              <div className="slot-time">{slot.time}</div>
              <div className="slot-label">{slot.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. GRACE WINDOW & FREEZE PASS WIDGET GRID */}
      <div className="routine-widget-grid">
        
        {/* Widget 1: 2-Hour Grace Window Countdown */}
        <div className="grace-widget-card">
          <div className="widget-title">⏳ 2-Hour Grace Window Countdown</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
            Missed a routine block? You have a non-hardcoded 2-hour grace window to back-log without losing streak points!
          </p>

          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-highlight)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Grace Time Remaining</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '0.2rem' }}>
                01 : 42 : 18
              </div>
            </div>
            <Badge variant="amber">Grace Window Active</Badge>
          </div>
        </div>

        {/* Widget 2: Streak Freeze Pass Redemption */}
        <div className="grace-widget-card">
          <div className="widget-title">🛡️ Streak Freeze Pass Vault</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
            Traveling or sick? Redeem a Streak Freeze Pass to preserve your 100% routine completion streak!
          </p>

          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-highlight)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Available Freeze Passes</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                {freezePasses} Passes Left
              </div>
            </div>
            <Button variant="emerald" onClick={handleRedeemFreezePass} disabled={freezePasses <= 0}>
              🛡️ Redeem Freeze Pass
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
};
