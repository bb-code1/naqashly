import React, { useState, useEffect } from 'react';
import * as routineApi from '../../api/routineApi';
import * as productivityApi from '../../api/productivityApi';
import { financeApi } from '../../api/financeApi';
import { client } from '../../api/client';

/**
 * 📊 Master 4-Pillar Executive Command Center Dashboard
 * 
 * Aggregates all 4 pillars of the Naqashly Life OS:
 * 1. 🌿 Routine & Habit Engine (Port 8085)
 * 2. 🎯 Productivity & Goal Engine (Port 8084)
 * 3. 💰 Financial Ledger & Multi-Wallet Hub (Port 8082)
 * 4. 📝 Journal & Reflection Engine (Port 8083)
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
export const ExecutiveDashboard = ({ onNavigateMode }) => {
  const [routineHabits, setRoutineHabits] = useState([]);
  const [consistencyScore, setConsistencyScore] = useState(0);
  const [todayMuhasabah, setTodayMuhasabah] = useState(null);
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch Routine Data
        const [habitsData, scoreData, muhasabahData] = await Promise.allSettled([
          routineApi.getHabits(),
          routineApi.getConsistencyScore(),
          routineApi.getTodayMuhasabah()
        ]);

        if (habitsData.status === 'fulfilled' && Array.isArray(habitsData.value)) {
          setRoutineHabits(habitsData.value);
        }
        if (scoreData.status === 'fulfilled' && scoreData.value?.consistencyPercentage !== undefined) {
          setConsistencyScore(scoreData.value.consistencyPercentage);
        }
        if (muhasabahData.status === 'fulfilled') {
          setTodayMuhasabah(muhasabahData.value);
        }

        // Fetch Productivity Data
        const [goalsData, tasksData] = await Promise.allSettled([
          productivityApi.getGoals(),
          productivityApi.getTasks()
        ]);

        if (goalsData.status === 'fulfilled' && Array.isArray(goalsData.value)) {
          setGoals(goalsData.value);
        }
        if (tasksData.status === 'fulfilled' && Array.isArray(tasksData.value)) {
          setTasks(tasksData.value);
        }

        // Fetch Finance Data
        const [walletsData, txData] = await Promise.allSettled([
          financeApi.getWallets(),
          financeApi.getTransactions()
        ]);

        if (walletsData.status === 'fulfilled' && walletsData.value?.data && Array.isArray(walletsData.value.data)) {
          setWallets(walletsData.value.data);
        }
        if (txData.status === 'fulfilled' && txData.value?.data && Array.isArray(txData.value.data)) {
          setTransactions(txData.value.data);
        }

        // Fetch Journal Notes Data
        try {
          const notesRes = await client.get('/journal/notes');
          if (notesRes?.data && Array.isArray(notesRes.data)) {
            setNotes(notesRes.data);
          }
        } catch (err) {
          // Fallback if backend offline
        }

      } catch (err) {
        console.warn('[ExecutiveDashboard] Multi-pillar data fetch warning:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const completedHabits = routineHabits.filter(h => h.status === 'COMPLETED').length;
  const totalHabits = routineHabits.length;
  const routinePct = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  // Calculate Net Wallet Balance (INR)
  const totalNetBalance = wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);

  // AI Advisor Recommendation Generator across 4 Pillars
  const getAiRecommendation = () => {
    if (todayMuhasabah?.topBlocker) {
      return `💡 AI Executive Nudge: Your top blocker today was "${todayMuhasabah.topBlocker}". Try starting a 15-minute Focus Session on your anchor habit to rebuild momentum!`;
    }
    if (totalNetBalance > 0 && routinePct > 70) {
      return `🌟 AI Executive Nudge: Outstanding balance across 4 pillars! Routine momentum is ${routinePct}% with healthy net wallet balances of ₹${totalNetBalance.toLocaleString()}.`;
    }
    return `⚡ AI Executive Nudge: Routine execution is at ${routinePct}%. Complete 1 more habit to elevate your daily consistency score!`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* 👑 EXECUTIVE WELCOME HERO CARD */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '20px',
        padding: '1.75rem 2rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: '900', color: '#10B981', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            ⚡ 4-PILLAR EXECUTIVE COMMAND CENTER
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-heading)', margin: '0.3rem 0 0.2rem 0', letterSpacing: '-0.02em' }}>
            Welcome Back, Executive 👑
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Unified Platform Command Center across Routine OS, Goals, Financial Ledger & Mind Journaling.
          </p>
        </div>

        {/* 4-PILLAR METRIC PILLS */}
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.75rem 1.1rem', textAlign: 'center', minWidth: '110px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)' }}>🌿 ROUTINE DAY</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#10B981', marginTop: '0.15rem' }}>{routinePct}%</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.75rem 1.1rem', textAlign: 'center', minWidth: '110px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)' }}>🎯 GOALS</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#6366F1', marginTop: '0.15rem' }}>{goals.length} Active</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.75rem 1.1rem', textAlign: 'center', minWidth: '110px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)' }}>💰 NET WALLETS</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#F59E0B', marginTop: '0.15rem' }}>
              ₹{totalNetBalance.toLocaleString()}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.75rem 1.1rem', textAlign: 'center', minWidth: '110px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)' }}>📝 JOURNAL</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#EC4899', marginTop: '0.15rem' }}>
              {notes.length} Notes
            </div>
          </div>
        </div>
      </div>

      {/* 🤖 AI MULTI-DOMAIN EXECUTIVE ADVISOR INSIGHT */}
      <div style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        padding: '1rem 1.35rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem'
      }}>
        <div style={{ fontSize: '1.5rem' }}>🤖</div>
        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-heading)' }}>
          {getAiRecommendation()}
        </div>
      </div>

      {/* ⚡ 4-CARD PILLAR GRID (2x2) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        
        {/* PILLAR 1: ROUTINE & HABIT OS */}
        <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🌿 Routine & Habit Engine
            </h3>
            <button
              onClick={() => onNavigateMode?.('ROUTINE')}
              style={{ background: 'transparent', border: 'none', color: '#10B981', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
            >
              Open Routine OS ➔
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading routines...</div>
          ) : routineHabits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No habits configured.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {routineHabits.slice(0, 4).map(h => (
                <div key={h.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{h.status === 'COMPLETED' ? '✓' : '⭕'}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: h.status === 'COMPLETED' ? 'var(--text-muted)' : 'var(--text-heading)', textDecoration: h.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                      {h.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>⏱️ {h.targetMinutes}m</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PILLAR 2: PRODUCTIVITY & GOALS */}
        <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🎯 Productivity & Macro Goals
            </h3>
            <button
              onClick={() => onNavigateMode?.('PRODUCTIVITY')}
              style={{ background: 'transparent', border: 'none', color: '#6366F1', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
            >
              Open Focus App ➔
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading goals...</div>
          ) : goals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active goals.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {goals.slice(0, 3).map(g => (
                <div key={g.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)' }}>🎯 {g.title}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#6366F1' }}>{g.progressPercentage || 0}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${g.progressPercentage || 0}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #6366F1)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PILLAR 3: FINANCIAL LEDGER & WALLETS */}
        <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              💰 Financial Ledger & Wallets
            </h3>
            <button
              onClick={() => onNavigateMode?.('FINANCE')}
              style={{ background: 'transparent', border: 'none', color: '#F59E0B', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
            >
              Open Ledger ➔
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading wallets...</div>
          ) : wallets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No wallets logged yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {wallets.slice(0, 3).map(w => (
                <div key={w.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)' }}>💳 {w.name}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#F59E0B' }}>₹{Number(w.balance || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PILLAR 4: JOURNAL & MIND REFLECTIONS */}
        <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📝 Journal & Mind Reflections
            </h3>
            <button
              onClick={() => onNavigateMode?.('JOURNAL')}
              style={{ background: 'transparent', border: 'none', color: '#EC4899', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
            >
              Open Journal ➔
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading notes...</div>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No notes logged yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {notes.slice(0, 3).map(n => (
                <div key={n.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)' }}>📝 {n.title}</span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '800' }}>
                    {n.category || 'WORK'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
