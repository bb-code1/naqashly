import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as routineApi from '../../api/routineApi';
import * as productivityApi from '../../api/productivityApi';
import { financeApi } from '../../api/financeApi';
import { client } from '../../api/client';

import { ExecutiveHeader } from './components/ExecutiveHeader';
import { ExecutiveMetricsBar } from './components/ExecutiveMetricsBar';
import { AiAdvisorNudge } from './components/AiAdvisorNudge';
import { HabitFocusWidget } from './components/HabitFocusWidget';
import { FinanceLedgerWidget } from './components/FinanceLedgerWidget';
import { GoalsProgressWidget } from './components/GoalsProgressWidget';
import { PrivateDiaryWidget } from './components/PrivateDiaryWidget';

/**
 * 👑 Master Modular Executive Dashboard Orchestrator Component
 * 
 * Modular Architecture:
 * ├── ExecutiveHeader.jsx          (Personal Greeting & 4 Quick Launchers)
 * ├── ExecutiveMetricsBar.jsx      (4 High-Level Glassmorphic Snapshot Pills)
 * ├── AiAdvisorNudge.jsx           (AI Personal Accountability Nudge)
 * ├── HabitFocusWidget.jsx         (Interactive 1-Tap Habit Checklist)
 * ├── FinanceLedgerWidget.jsx      (Debt Summaries & Recent Activity)
 * ├── GoalsProgressWidget.jsx      (Focus Goal Sliders & Milestones)
 * └── PrivateDiaryWidget.jsx       (Encrypted Reflections & Notes)
 * 
 * @author Barkat Bashir
 * @version 3.0.0
 */
export const ExecutiveDashboard = ({ onNavigateMode }) => {
  const { user } = useAuth();
  
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
          console.warn('[ExecutiveDashboard] Journal notes fetch warning:', err);
        }

      } catch (err) {
        console.warn('[ExecutiveDashboard] Multi-pillar data fetch warning:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle 1-Tap Habit Completion Direct from Dashboard
  const handleToggleHabit = async (habitId, isCompleted) => {
    try {
      // Optimistic Local State Update
      setRoutineHabits(prev => prev.map(h => {
        if (h.id === habitId) {
          return { ...h, status: isCompleted ? 'COMPLETED' : 'PENDING' };
        }
        return h;
      }));

      if (isCompleted) {
        await routineApi.logHabitStatus(habitId, 'COMPLETED', 100, 'EXCELLENT');
      }
    } catch (err) {
      console.error('[ExecutiveDashboard] Failed to toggle habit status:', err);
    }
  };

  const completedHabitsCount = routineHabits.filter(h => h.status === 'COMPLETED').length;
  const totalHabitsCount = routineHabits.length;
  const routinePct = totalHabitsCount > 0 ? Math.round((completedHabitsCount / totalHabitsCount) * 100) : 0;
  const totalNetBalance = wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);

  const displayName = user?.username || user?.email?.split('@')[0] || 'Executive';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* 1. PERSONALIZED EXECUTIVE LAUNCHPAD HEADER */}
      <ExecutiveHeader
        userName={displayName}
        onNavigateMode={onNavigateMode}
      />

      {/* 2. 4-PILLAR GLASSMORPHIC METRICS SNAPSHOT BAR */}
      <ExecutiveMetricsBar
        routinePct={routinePct}
        completedHabitsCount={completedHabitsCount}
        totalHabitsCount={totalHabitsCount}
        netBalance={totalNetBalance}
        goalsCount={goals.length}
        notesCount={notes.length}
        onNavigateMode={onNavigateMode}
      />

      {/* 3. AI PERSONAL ACCOUNTABILITY ADVISOR NUDGE */}
      <AiAdvisorNudge
        routinePct={routinePct}
        netBalance={totalNetBalance}
        topBlocker={todayMuhasabah?.topBlocker}
      />

      {/* 4. MODULAR 4-PILLAR ACTION WIDGETS GRID (2x2) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        
        {/* WIDGET 1: 🌿 TODAY'S HABIT FOCUS (1-TAP CHECKLIST) */}
        <HabitFocusWidget
          habits={routineHabits}
          loading={loading}
          onToggleHabit={handleToggleHabit}
          onNavigateMode={onNavigateMode}
        />

        {/* WIDGET 2: 🏦 DEBT & MONEY LEDGER */}
        <FinanceLedgerWidget
          wallets={wallets}
          transactions={transactions}
          loading={loading}
          onNavigateMode={onNavigateMode}
        />

        {/* WIDGET 3: 🎯 FOCUS GOALS & MILESTONE SLIDERS */}
        <GoalsProgressWidget
          goals={goals}
          loading={loading}
          onNavigateMode={onNavigateMode}
        />

        {/* WIDGET 4: 📖 PRIVATE DIARY REFLECTIONS */}
        <PrivateDiaryWidget
          notes={notes}
          loading={loading}
          onNavigateMode={onNavigateMode}
        />

      </div>
    </div>
  );
};
