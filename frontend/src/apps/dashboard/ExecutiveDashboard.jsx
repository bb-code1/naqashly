import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  useHabits, 
  useConsistencyScore, 
  useTodayMuhasabah, 
  useRoutineSettings, 
  useLogHabitStatus, 
  useCreateHabit 
} from '../../hooks/queries/useRoutineQueries';
import { 
  useWallets, 
  useTransactions, 
  useCreateTransaction 
} from '../../hooks/queries/useFinanceQueries';
import { 
  useGoals, 
  useTasks, 
  useProductivityTimeBlocks, 
  useCreateGoal, 
  useSaveTimeBlock 
} from '../../hooks/queries/useProductivityQueries';
import { 
  useNotes, 
  useCreateNote 
} from '../../hooks/queries/useJournalQueries';

import { ExecutiveHeader } from './components/ExecutiveHeader';
import { ExecutiveMetricsBar } from './components/ExecutiveMetricsBar';
import { AiAdvisorNudge } from './components/AiAdvisorNudge';
import { HabitFocusWidget } from './components/HabitFocusWidget';
import { FinanceLedgerWidget } from './components/FinanceLedgerWidget';
import { TodayScheduleWidget } from './components/TodayScheduleWidget';
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
 * @version 5.0.0
 */
export const ExecutiveDashboard = ({ onNavigateMode: propOnNavigateMode }) => {
  const context = useOutletContext();
  const onNavigateMode = propOnNavigateMode || (context && context.onNavigateMode);
  const { user } = useAuth();

  // Modal State Controls
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isMoneyModalOpen, setIsMoneyModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [activeWidgetTab, setActiveWidgetTab] = useState('ALL');

  // TanStack Queries (Server State)
  const habitsQuery = useHabits();
  const scoreQuery = useConsistencyScore();
  const todayMuhasabahQuery = useTodayMuhasabah();
  const goalsQuery = useGoals();
  const tasksQuery = useTasks();
  const timeBlocksQuery = useProductivityTimeBlocks();
  const settingsQuery = useRoutineSettings();
  const walletsQuery = useWallets();
  const transactionsQuery = useTransactions();
  const notesQuery = useNotes();

  const habits = habitsQuery.data || [];
  const consistencyScore = scoreQuery.data?.consistencyPercentage ?? 0;
  const todayMuhasabah = todayMuhasabahQuery.data || null;
  const goals = goalsQuery.data || [];
  const tasks = tasksQuery.data || [];
  const timeBlocks = timeBlocksQuery.data || [];
  const wallets = walletsQuery.data || [];
  const transactions = transactionsQuery.data || [];
  const notes = notesQuery.data || [];

  const loading = habitsQuery.isLoading || 
                  scoreQuery.isLoading || 
                  todayMuhasabahQuery.isLoading || 
                  goalsQuery.isLoading || 
                  tasksQuery.isLoading || 
                  timeBlocksQuery.isLoading || 
                  settingsQuery.isLoading || 
                  walletsQuery.isLoading || 
                  transactionsQuery.isLoading || 
                  notesQuery.isLoading;

  const routineMode = settingsQuery.data?.routineMode || 'SOLAR';
  let selectedCity = null;
  if (settingsQuery.data?.selectedCity) {
    try {
      const parsed = JSON.parse(settingsQuery.data.selectedCity);
      if (parsed && parsed.name) selectedCity = parsed;
    } catch (e) {}
  }

  // TanStack Mutations (Server State Updates)
  const logHabitStatusMutation = useLogHabitStatus();
  const createHabitMutation = useCreateHabit();
  const createTransactionMutation = useCreateTransaction();
  const createGoalMutation = useCreateGoal();
  const createNoteMutation = useCreateNote();
  const saveTimeBlockMutation = useSaveTimeBlock();

  // Handlers
  const handleToggleHabit = async (habitId, isCompleted) => {
    logHabitStatusMutation.mutate({
      habitId,
      status: isCompleted ? 'COMPLETED' : 'PENDING'
    });
  };

  const handleCreateHabit = async (habitData) => {
    createHabitMutation.mutate(habitData);
  };

  const handleLogMoney = async (txData) => {
    const targetWalletId = wallets.length > 0 ? wallets[0].id : null;
    if (targetWalletId) {
      createTransactionMutation.mutate({
        walletId: targetWalletId,
        txData: {
          amount: txData.amount,
          transactionType: txData.type,
          category: 'General',
          description: txData.note
        }
      });
    }
  };

  const handleCreateGoal = async (goalData) => {
    createGoalMutation.mutate(goalData);
  };

  const handleCreateNote = async (noteData) => {
    createNoteMutation.mutate(noteData);
  };

  const handleUpdateBlockStatus = async (blockData) => {
    saveTimeBlockMutation.mutate(blockData);
  };

  const completedHabitsCount = habits.filter(h => h.status === 'COMPLETED').length;
  const totalHabitsCount = habits.length;
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
            habits={habits}
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
          <TodayScheduleWidget
            timeBlocks={timeBlocks}
            tasks={tasks}
            habits={habits}
            selectedCity={selectedCity}
            routineMode={routineMode}
            onNavigateMode={onNavigateMode}
            onUpdateBlockStatus={handleUpdateBlockStatus}
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
      <ChatWidget userName={displayName} />

    </div>
  );
};
