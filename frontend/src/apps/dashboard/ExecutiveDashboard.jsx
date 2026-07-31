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
import { ChatWidget } from './components/ChatWidget';
import './ExecutiveDashboard.css';

import { QuickHabitModal } from './modals/QuickHabitModal';
import { QuickMoneyModal } from './modals/QuickMoneyModal';
import { QuickGoalModal } from './modals/QuickGoalModal';
import { QuickDiaryModal } from './modals/QuickDiaryModal';
import { QuickFocusTimerModal } from './modals/QuickFocusTimerModal';

/**
 * 👑 Master Executive Dashboard Component (With Instant Creation Modals & Pomodoro Timer)
 * 
 * Features:
 * 1. 🌿 Quick Add Habit Modal
 * 2. 💰 Quick Log Money Modal
 * 3. 🎯 Quick Add Goal Modal
 * 4. 📖 Quick Write Private Note Modal
 * 5. ⏱️ 25-Min Executive Pomodoro Focus Session Timer
 * 
 * @author Barkat Bashir
 * @version 4.0.0
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
  const [activeWidgetTab, setActiveWidgetTab] = useState('ALL');

  // Modal State Controls
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isMoneyModalOpen, setIsMoneyModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle 1-Tap Habit Completion Direct from Dashboard
  const handleToggleHabit = async (habitId, isCompleted) => {
    try {
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

  // Instant Creation Handlers
  const handleCreateHabit = async (habitData) => {
    try {
      await client.post('/routine/habits', habitData);
    } catch (err) {
      console.warn('[ExecutiveDashboard] Habit create fallback to local state');
    }
    setRoutineHabits(prev => [{ id: Date.now(), ...habitData }, ...prev]);
  };

  const handleLogMoney = async (txData) => {
    try {
      await financeApi.createTransaction(txData);
    } catch (err) {
      console.warn('[ExecutiveDashboard] Money log fallback to local state');
    }
    setTransactions(prev => [{ id: Date.now(), ...txData }, ...prev]);
  };

  const handleCreateGoal = async (goalData) => {
    try {
      await productivityApi.createGoal(goalData);
    } catch (err) {
      console.warn('[ExecutiveDashboard] Goal create fallback to local state');
    }
    setGoals(prev => [{ id: Date.now(), ...goalData }, ...prev]);
  };

  const handleCreateNote = async (noteData) => {
    try {
      await client.post('/journal/notes', noteData);
    } catch (err) {
      console.warn('[ExecutiveDashboard] Note create fallback to local state');
    }
    setNotes(prev => [{ id: Date.now(), ...noteData }, ...prev]);
  };

  const completedHabitsCount = routineHabits.filter(h => h.status === 'COMPLETED').length;
  const totalHabitsCount = routineHabits.length;
  const routinePct = totalHabitsCount > 0 ? Math.round((completedHabitsCount / totalHabitsCount) * 100) : 0;
  const totalNetBalance = wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);

  const displayName = user?.username || user?.email?.split('@')[0] || 'Executive';

  return (
    <div className="executive-dashboard-container">
      
      {/* 1. PERSONALIZED EXECUTIVE LAUNCHPAD HEADER */}
      <ExecutiveHeader
        userName={displayName}
        onOpenQuickHabit={() => setIsHabitModalOpen(true)}
        onOpenQuickMoney={() => setIsMoneyModalOpen(true)}
        onOpenQuickGoal={() => setIsGoalModalOpen(true)}
        onOpenQuickDiary={() => setIsDiaryModalOpen(true)}
        onOpenFocusTimer={() => setIsFocusTimerOpen(true)}
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

      {/* 3. NAQASH AI PERSONAL CHIEF OF STAFF NUDGE */}
      <AiAdvisorNudge
        userName={displayName}
        routinePct={routinePct}
        netBalance={totalNetBalance}
        topBlocker={todayMuhasabah?.topBlocker}
        onNavigateMode={onNavigateMode}
      />

      {/* Mobile Quick-Tab Widget Switcher */}
      <div className="mobile-widget-switcher">
        <button
          className={`mobile-switcher-btn ${activeWidgetTab === 'ALL' ? 'active-all' : ''}`}
          onClick={() => setActiveWidgetTab('ALL')}
        >
          📱 All
        </button>
        <button
          className={`mobile-switcher-btn ${activeWidgetTab === 'HABITS' ? 'active-habits' : ''}`}
          onClick={() => setActiveWidgetTab('HABITS')}
        >
          🌿 Habits
        </button>
        <button
          className={`mobile-switcher-btn ${activeWidgetTab === 'FINANCE' ? 'active-finance' : ''}`}
          onClick={() => setActiveWidgetTab('FINANCE')}
        >
          💰 Finance
        </button>
        <button
          className={`mobile-switcher-btn ${activeWidgetTab === 'GOALS' ? 'active-goals' : ''}`}
          onClick={() => setActiveWidgetTab('GOALS')}
        >
          🎯 Goals
        </button>
        <button
          className={`mobile-switcher-btn ${activeWidgetTab === 'DIARY' ? 'active-diary' : ''}`}
          onClick={() => setActiveWidgetTab('DIARY')}
        >
          📝 Notes
        </button>
      </div>

      {/* 4. MODULAR 4-PILLAR ACTION WIDGETS GRID (2x2) */}
      <div className="dashboard-widgets-grid">
        
        {/* WIDGET 1: 🌿 TODAY'S HABIT FOCUS (1-TAP CHECKLIST) */}
        {(activeWidgetTab === 'ALL' || activeWidgetTab === 'HABITS') && (
          <HabitFocusWidget
            habits={routineHabits}
            loading={loading}
            onToggleHabit={handleToggleHabit}
            onNavigateMode={onNavigateMode}
          />
        )}

        {/* WIDGET 2: 🏦 DEBT & MONEY LEDGER */}
        {(activeWidgetTab === 'ALL' || activeWidgetTab === 'FINANCE') && (
          <FinanceLedgerWidget
            wallets={wallets}
            transactions={transactions}
            loading={loading}
            onNavigateMode={onNavigateMode}
          />
        )}

        {/* WIDGET 3: 🎯 FOCUS GOALS & MILESTONE SLIDERS */}
        {(activeWidgetTab === 'ALL' || activeWidgetTab === 'GOALS') && (
          <GoalsProgressWidget
            goals={goals}
            loading={loading}
            onNavigateMode={onNavigateMode}
          />
        )}

        {/* WIDGET 4: 📖 PRIVATE DIARY REFLECTIONS */}
        {(activeWidgetTab === 'ALL' || activeWidgetTab === 'DIARY') && (
          <PrivateDiaryWidget
            notes={notes}
            loading={loading}
            onNavigateMode={onNavigateMode}
          />
        )}

      </div>

      {/* 5. INSTANT CREATION MODALS */}
      <QuickHabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSave={handleCreateHabit}
      />

      <QuickMoneyModal
        isOpen={isMoneyModalOpen}
        onClose={() => setIsMoneyModalOpen(false)}
        onSave={handleLogMoney}
      />

      <QuickGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleCreateGoal}
      />

      <QuickDiaryModal
        isOpen={isDiaryModalOpen}
        onClose={() => setIsDiaryModalOpen(false)}
        onSave={handleCreateNote}
      />

      <QuickFocusTimerModal
        isOpen={isFocusTimerOpen}
        onClose={() => setIsFocusTimerOpen(false)}
      />

      {/* 🔮 ASK NAQASH FLOATING COMPANION CHAT WIDGET */}
      <ChatWidget />

    </div>
  );
};
