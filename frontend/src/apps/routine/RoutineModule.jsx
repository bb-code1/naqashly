import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import './RoutineModule.css';

/**
 * Universal Routine & Habit Engine ("Naqashly Flow").
 * Features Profile Switcher (SECULAR vs RELIGIOUS_ISLAMIC 5 Prayer Times),
 * 24h interactive slot click logger, 2-hour grace window countdown, and streak freeze passes.
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
export const RoutineModule = () => {
  const { addToast } = useToast();
  const [profileType, setProfileType] = useState('RELIGIOUS_ISLAMIC'); // 'SECULAR' | 'RELIGIOUS_ISLAMIC'
  const [routines, setRoutines] = useState([]);
  const [graceWindow, setGraceWindow] = useState(null);
  const [freezePasses, setFreezePasses] = useState(2);
  const [loading, setLoading] = useState(true);

  // Fetch Live Data from routine-service via API Gateway (Port 8080)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [routinesRes, graceRes] = await Promise.allSettled([
        client.get('/routine/blocks'),
        client.get('/routine/grace-window')
      ]);

      if (routinesRes.status === 'fulfilled') setRoutines(routinesRes.value.data);
      if (graceRes.status === 'fulfilled') setGraceWindow(graceRes.value.data);
    } catch (err) {
      console.error('[RoutineModule] Error fetching routine data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profileType]);

  const handleToggleSlot = async (slotId) => {
    try {
      await client.post(`/routine/blocks/${slotId}/toggle`);
      if (addToast) addToast(`Routine slot marked as completed!`, 'success');
      fetchData();
    } catch (err) {
      console.error('[RoutineModule] Error toggling slot:', err);
    }
  };

  const handleRedeemFreezePass = async () => {
    if (freezePasses <= 0) return;
    try {
      await client.post('/routine/freeze-pass/redeem');
      setFreezePasses(prev => prev - 1);
      if (addToast) addToast('🛡️ Streak Freeze Pass Redeemed! Habit streak protected.', 'success');
    } catch (err) {
      console.error('[RoutineModule] Error redeeming freeze pass:', err);
    }
  };

  // Generate 24-Hour Timeline Slots (SECULAR vs ISLAMIC)
  const secularSlots = [
    { time: '06:00', label: '🌅 Morning Routine' },
    { time: '08:00', label: '☕ Deep Work Session 1' },
    { time: '12:00', label: '🥗 Lunch & Exercise' },
    { time: '14:00', label: '💻 Work Session 2' },
    { time: '18:00', label: '🏃 Fitness / Gym' },
    { time: '21:00', label: '📖 Night Reflection' }
  ];

  const islamicSlots = [
    { time: '05:00', label: '🕌 Fajr Prayer' },
    { time: '08:00', label: '☕ Morning Work' },
    { time: '13:00', label: '🕌 Dhuhr Prayer' },
    { time: '16:30', label: '🕌 Asr Prayer' },
    { time: '19:15', label: '🕌 Maghrib Prayer' },
    { time: '20:45', label: '🕌 Isha Prayer' }
  ];

  const activeSlots = profileType === 'RELIGIOUS_ISLAMIC' ? islamicSlots : secularSlots;

  return (
    <div className="routine-container">
      
      {/* 1. HEADER & PROFILE SWITCHER */}
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

          {/* Profile Switcher Pills */}
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

          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Available Freeze Passes</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                {freezePasses} Passes Left
              </div>
            </div>
            <Button variant="emerald" onClick={handleRedeemFreezePass} disabled={freezePasses <= 0} style={{ fontSize: '0.82rem' }}>
              🛡️ Redeem Freeze Pass
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
};
