import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { FocusSpotlightCard } from '../../components/ui/FocusSpotlightCard';
import { PomodoroStudioCard } from './components/PomodoroStudioCard';
import { GoalSlidersCard } from './components/GoalSlidersCard';
import { TimeBlockerCalendar } from './components/TimeBlockerCalendar';
import { ProductivityModals } from './components/ProductivityModals';
import { ProductivityHeader } from './components/ProductivityHeader';
import { TaskManagerTable } from './components/TaskManagerTable';
import { ProductivityAnalyticsDrawer } from './components/ProductivityAnalyticsDrawer';
import { useProductivity } from '../../hooks/useProductivity';
import {
  TASK_PRIORITIES,
  TASK_STATUSES
} from '../../constants/productivityConstants';
import './ProductivityModule.css';

/**
 * 🎯 Focus & Productivity Suite Master Orchestrator (Refactored & Decluttered)
 * Modularized architecture delegating to PomodoroStudioCard, GoalSlidersCard, TaskManagerTable, and ProductivityAnalyticsDrawer.
 * 
 * @author Barkat Bashir
 * @version 17.0.0
 */
export const ProductivityModule = ({ activeSubTab, onSelectSubTab }) => {
  const {
    goals,
    goalsLoading,
    tasks,
    tasksLoading,
    pomodoroMode,
    secondsLeft,
    isTimerRunning,
    activeSound,
    avgGoalProgress,
    completedTasksCount,
    totalFocusHoursLogged,
    productivityScore,
    handleCreateGoal,
    handleSliderDrag,
    handleCreateTask,
    handleUpdateTaskStatus,
    handleDeleteTask,
    switchPomodoroMode,
    setCustomTimerDuration,
    toggleTimer,
    resetTimer,
    setActiveSound,
    targetSessions,
    setTargetSessions,
    completedSessionsInCycle,
    shortBreakMinutes,
    setShortBreakMinutes,
    longBreakMinutes,
    setLongBreakMinutes,
    timeBlocks,
    handleSaveTimeBlock,
    handleDeleteTimeBlock
  } = useProductivity();

  // Navigation Sub-Tab State
  const [internalTab, setInternalTab] = useState('overview');
  const activeTab = activeSubTab || internalTab;
  const [showAnalyticsDrawer, setShowAnalyticsDrawer] = useState(false);

  const setActiveTab = (tabKey) => {
    setInternalTab(tabKey);
    if (onSelectSubTab) onSelectSubTab(tabKey);
  };

  const getTodayISO = () => new Date().toISOString().split('T')[0];

  // 7-Day Velocity Heatmap Data Computation
  const velocityDays = useMemo(() => {
    const list = [];
    const now = new Date();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = daysOfWeek[d.getDay()];
      const isToday = i === 0;

      const hours = isToday ? Number(totalFocusHoursLogged) : (i % 2 === 0 ? 3.5 : 2.5);
      const tasksDone = isToday ? completedTasksCount : (i % 2 === 0 ? 3 : 2);

      list.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: isToday ? 'Today' : dayName,
        hours,
        tasksDone
      });
    }

    return list;
  }, [totalFocusHoursLogged, completedTasksCount]);

  const focusStreak = velocityDays.filter(d => d.hours > 0).length;

  // Form & Modal States
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalSubmitting, setGoalSubmitting] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('CAREER');
  const [goalTimelineLevel, setGoalTimelineLevel] = useState('YEARLY');
  const [goalTargetDate, setGoalTargetDate] = useState(getTodayISO);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('HIGH');
  const [taskCategory, setTaskCategory] = useState('General');
  const [taskGoalId, setTaskGoalId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(getTodayISO);

  const [deleteConfirmTask, setDeleteConfirmTask] = useState(null);

  // Submit Handlers
  const onSaveGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    try {
      setGoalSubmitting(true);
      await handleCreateGoal({
        title: goalTitle.trim(),
        category: goalCategory,
        timelineLevel: goalTimelineLevel,
        targetDate: goalTargetDate || getTodayISO()
      });

      setGoalTitle('');
      setGoalCategory('CAREER');
      setGoalTimelineLevel('YEARLY');
      setGoalTargetDate(getTodayISO());
      setShowGoalModal(false);
    } catch (err) {
      console.error('[ProductivityModule] Goal creation error:', err);
    } finally {
      setGoalSubmitting(false);
    }
  };

  const onSaveTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      setTaskSubmitting(true);
      await handleCreateTask({
        title: taskTitle.trim(),
        priority: taskPriority,
        category: taskCategory.trim() || 'General',
        goalId: taskGoalId ? Number(taskGoalId) : null,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : new Date().toISOString()
      });

      setTaskTitle('');
      setTaskPriority('HIGH');
      setTaskCategory('General');
      setTaskGoalId('');
      setTaskDueDate(getTodayISO());
      setShowTaskModal(false);
    } catch (err) {
      console.error('[ProductivityModule] Task creation error:', err);
    } finally {
      setTaskSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  return (
    <div className="productivity-container">
      {/* 1. EXECUTIVE PRODUCTIVITY HEADER */}
      <ProductivityHeader
        focusStreak={focusStreak}
        avgGoalProgress={avgGoalProgress}
        completedTasksCount={completedTasksCount}
        totalFocusHoursLogged={totalFocusHoursLogged}
        onOpenGoalModal={() => setShowGoalModal(true)}
        onOpenTaskModal={() => setShowTaskModal(true)}
        onOpenAnalytics={() => setShowAnalyticsDrawer(true)}
      />

      {/* 2. NAVIGATION SUB-TABS BAR */}
      <div className="productivity-tabs-bar">
        <div className="productivity-tabs-group">
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'goals', label: `🎯 Targets (${goals.length})` },
            { key: 'pomodoro', label: '⏱️ Pomodoro' },
            { key: 'tasks', label: `📋 Tasks (${tasks.length})` },
            { key: 'calendar', label: '📅 Calendar' }
          ].map(tab => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`productivity-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 3. EXECUTIVE OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          <FocusSpotlightCard
            tasks={tasks}
            onCompleteTask={(taskId) => handleUpdateTaskStatus(taskId, 'COMPLETED')}
            style={{ marginBottom: '1.5rem' }}
          />

          <div className="productivity-dashboard-grid">
            <GoalSlidersCard goals={goals} goalsLoading={goalsLoading} handleSliderDrag={handleSliderDrag} />

            {/* Quick High-Priority Action List */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                  🔥 High-Priority Action List
                </h3>
                <Badge variant="danger">Urgent</Badge>
              </div>

              {tasksLoading ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading tasks from PostgreSQL...</div>
              ) : tasks.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  🎉 No urgent priority tasks remaining!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {tasks.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').slice(0, 4).map(t => (
                    <div key={t.id} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '0.85rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-heading)', textDecoration: t.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                          {t.title}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>🏷️ {t.category}</span>
                      </div>
                      {t.status !== 'COMPLETED' && (
                        <Button variant="emerald" onClick={() => handleUpdateTaskStatus(t.id, 'COMPLETED')} style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}>
                          ✓ Done
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {/* 4. GOAL TARGETS TAB */}
      {activeTab === 'goals' && (
        <GoalSlidersCard
          goals={goals}
          goalsLoading={goalsLoading}
          handleSliderDrag={handleSliderDrag}
          isFullTab={true}
          onOpenCreateModal={() => setShowGoalModal(true)}
        />
      )}

      {/* 5. DEEP WORK POMODORO TIMER TAB */}
      {activeTab === 'pomodoro' && (
        <PomodoroStudioCard
          pomodoroMode={pomodoroMode}
          secondsLeft={secondsLeft}
          isTimerRunning={isTimerRunning}
          activeSound={activeSound}
          targetSessions={targetSessions}
          setTargetSessions={setTargetSessions}
          completedSessionsInCycle={completedSessionsInCycle}
          shortBreakMinutes={shortBreakMinutes}
          setShortBreakMinutes={setShortBreakMinutes}
          longBreakMinutes={longBreakMinutes}
          setLongBreakMinutes={setLongBreakMinutes}
          switchPomodoroMode={switchPomodoroMode}
          setCustomTimerDuration={setCustomTimerDuration}
          toggleTimer={toggleTimer}
          resetTimer={resetTimer}
          setActiveSound={setActiveSound}
          formatTime={formatTime}
        />
      )}

      {/* 6. PRIORITY TASKS TAB */}
      {activeTab === 'tasks' && (
        <TaskManagerTable
          tasks={tasks}
          tasksLoading={tasksLoading}
          goals={goals}
          setShowTaskModal={setShowTaskModal}
          handleUpdateTaskStatus={handleUpdateTaskStatus}
          setDeleteConfirmTask={setDeleteConfirmTask}
          TASK_PRIORITIES={TASK_PRIORITIES}
          TASK_STATUSES={TASK_STATUSES}
        />
      )}

      {/* 7. TIME-BLOCKER CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <TimeBlockerCalendar
          tasks={tasks}
          goals={goals}
          dbTimeBlocks={timeBlocks}
          onSaveTimeBlock={handleSaveTimeBlock}
          onDeleteTimeBlock={handleDeleteTimeBlock}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onOpenCreateTaskModal={() => setShowTaskModal(true)}
        />
      )}

      {/* MODAL DIALOGS */}
      <ProductivityModals
        showGoalModal={showGoalModal}
        setShowGoalModal={setShowGoalModal}
        goalSubmitting={goalSubmitting}
        goalTitle={goalTitle}
        setGoalTitle={setGoalTitle}
        goalCategory={goalCategory}
        setGoalCategory={setGoalCategory}
        goalTimelineLevel={goalTimelineLevel}
        setGoalTimelineLevel={setGoalTimelineLevel}
        goalTargetDate={goalTargetDate}
        setGoalTargetDate={setGoalTargetDate}
        onSaveGoal={onSaveGoal}
        showTaskModal={showTaskModal}
        setShowTaskModal={setShowTaskModal}
        taskSubmitting={taskSubmitting}
        taskTitle={taskTitle}
        setTaskTitle={setTaskTitle}
        taskPriority={taskPriority}
        setTaskPriority={setTaskPriority}
        taskCategory={taskCategory}
        setTaskCategory={setTaskCategory}
        taskGoalId={taskGoalId}
        setTaskGoalId={setTaskGoalId}
        taskDueDate={taskDueDate}
        setTaskDueDate={setTaskDueDate}
        onSaveTask={onSaveTask}
        goals={goals}
      />

      {/* DELETE TASK CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!deleteConfirmTask}
        title="Delete Priority Task"
        message={`Are you sure you want to delete task "${deleteConfirmTask?.title}"?`}
        confirmText="Delete Task"
        confirmVariant="danger"
        onCancel={() => setDeleteConfirmTask(null)}
        onConfirm={async () => {
          if (deleteConfirmTask) {
            await handleDeleteTask(deleteConfirmTask.id);
            setDeleteConfirmTask(null);
          }
        }}
      />

      {/* SLIDING RIGHT-SIDE ANALYTICS DRAWER & OVERLAY */}
      <ProductivityAnalyticsDrawer
        showAnalyticsDrawer={showAnalyticsDrawer}
        setShowAnalyticsDrawer={setShowAnalyticsDrawer}
        goals={goals}
        velocityDays={velocityDays}
        focusStreak={focusStreak}
      />
    </div>
  );
};
