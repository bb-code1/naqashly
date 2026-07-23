import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { client } from '../../api/client';

export const RoutineModule = () => {
  const [routines, setRoutines] = useState([]);
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    // Fetch user habits from routine-service via API Gateway
    client.get('/routine/habits')
      .then(res => setHabits(res.data))
      .catch(() => {
        // Fallback demo data
        setHabits([
          { id: 1, title: 'Morning Meditation', currentStreak: 14, freezePassesAvailable: 2 },
          { id: 2, title: 'Gratitude Journaling', currentStreak: 9, freezePassesAvailable: 2 },
          { id: 3, title: 'Daily Exercise', currentStreak: 5, freezePassesAvailable: 1 }
        ]);
      });
  }, []);

  return (
    <Card className="col-12">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          🌿 Daily Routine Timeline
        </div>
        <Badge variant="emerald">ACTIVE PROFILE: WORKDAY</Badge>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: '140px', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem 0.85rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.4rem' }}>06:00 - 07:00</div>
          <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>Meditation</div>
          <span style={{ fontSize: '0.7rem', fontWeight: '600', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'var(--accent-emerald-glow)', color: 'var(--accent-emerald)' }}>Completed</span>
        </div>

        <div style={{ flex: 1, minWidth: '140px', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem 0.85rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.4rem' }}>07:00 - 08:30</div>
          <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>Exercise & Bkfast</div>
          <span style={{ fontSize: '0.7rem', fontWeight: '600', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'var(--accent-emerald-glow)', color: 'var(--accent-emerald)' }}>Completed</span>
        </div>

        <div style={{ flex: 1, minWidth: '140px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid var(--accent-indigo)', borderRadius: 'var(--radius-md)', padding: '1rem 0.85rem', boxShadow: '0 0 20px var(--accent-indigo-glow)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.4rem' }}>09:00 - 17:00</div>
          <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>Deep Work Session</div>
          <span style={{ fontSize: '0.7rem', fontWeight: '600', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'var(--accent-indigo-glow)', color: 'var(--accent-indigo)' }}>ACTIVE NOW</span>
        </div>

        <div style={{ flex: 1, minWidth: '140px', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem 0.85rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.4rem' }}>18:00 - 19:30</div>
          <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>Cardio Workout</div>
          <span style={{ fontSize: '0.7rem', fontWeight: '600', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-muted)' }}>Upcoming</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
        {habits.map(h => (
          <div key={h.id} style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-heading)' }}>{h.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{h.freezePassesAvailable ?? 2} Freeze Passes Left</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-emerald)', background: 'var(--accent-emerald-glow)', padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
              🔥 {h.currentStreak ?? 0} Days
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
