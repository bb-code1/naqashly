import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Slider } from '../../components/ui/Slider';
import { client } from '../../api/client';
import { ENV } from '../../config/env';

export const ProductivityModule = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [timelineLevel, setTimelineLevel] = useState('YEARLY');
  const [category, setCategory] = useState('CAREER');

  const timerRefs = useRef({});

  const fetchGoals = () => {
    setLoading(true);
    client.get('/productivity/goals')
      .then(res => {
        setGoals(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('[ProductivityModule] Failed to fetch live goals:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!title) return;

    client.post('/productivity/goals', {
      title,
      timelineLevel,
      category,
      priority: 'HIGH'
    }).then(() => {
      setTitle('');
      setShowAddForm(false);
      fetchGoals();
    }).catch(err => console.error('[ProductivityModule] Error creating goal:', err));
  };

  const handleSliderDrag = (id, newProgress) => {
    // 60 FPS Local UI update
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, progressPercentage: newProgress, isCompleted: newProgress === 100 } : g)));

    // Debounce HTTP API dispatches by 300ms
    if (timerRefs.current[id]) clearTimeout(timerRefs.current[id]);

    timerRefs.current[id] = setTimeout(() => {
      client.put(`/productivity/goals/${id}/progress`, { progressPercentage: newProgress })
        .catch(err => console.error('[ProductivityModule] Failed to sync goal progress:', err));
    }, ENV.DEBOUNCE_SLIDER_MS);
  };

  return (
    <Card className="col-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          🎯 Goal Targets
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant="indigo">productivity :8083</Badge>
          <Button variant="secondary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'X' : '+'}
          </Button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddGoal} style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Goal Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '6px' }}
            required
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={timelineLevel}
              onChange={e => setTimelineLevel(e.target.value)}
              style={{ flex: 1, padding: '0.4rem', background: '#0E131F', border: '1px solid var(--border-subtle)', color: '#FFF', borderRadius: '6px' }}
            >
              <option value="DAILY">DAILY</option>
              <option value="WEEKLY">WEEKLY</option>
              <option value="MONTHLY">MONTHLY</option>
              <option value="YEARLY">YEARLY</option>
            </select>
            <Button type="submit">Save Goal</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading live goals from PostgreSQL...</div>
      ) : goals.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No goals target found. Click "+" above to create your first goal!</div>
      ) : (
        goals.map(g => (
          <div key={g.id} style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-heading)' }}>{g.title}</div>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-indigo)', fontWeight: '600' }}>{g.timelineLevel}</span>
            </div>

            <Slider
              value={g.progressPercentage}
              onChange={(e) => handleSliderDrag(g.id, Number(e.target.value))}
            />
          </div>
        ))
      )}
    </Card>
  );
};
