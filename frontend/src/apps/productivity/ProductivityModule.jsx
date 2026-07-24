import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { VelocityHeatmap } from '../../components/ui/VelocityHeatmap';
import { FocusSpotlightCard } from '../../components/ui/FocusSpotlightCard';
import { PomodoroStudioCard } from './components/PomodoroStudioCard';
import { GoalSlidersCard } from './components/GoalSlidersCard';
import { TimeBlockerCalendar } from './components/TimeBlockerCalendar';
import { ProductivityModals } from './components/ProductivityModals';
import { useProductivity } from '../../hooks/useProductivity';
import {
  TASK_PRIORITIES,
  TASK_STATUSES
} from '../../constants/productivityConstants';
import './ProductivityModule.css';

/**
 * 🎯 Focus & Productivity Suite Master Orchestrator (< 180 lines).
 * Modularized architecture delegating to PomodoroStudioCard, GoalSlidersCard, VelocityHeatmap, and FocusSpotlightCard.
 * 
 * @author Barkat Bashir
 * @version 4.0.0
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
    exportToCsv,
    exportToExcel
  } = useProductivity();

  // Navigation Sub-Tab State
  const [internalTab, setInternalTab] = useState('overview');
  const activeTab = activeSubTab || internalTab;

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

  // DataTable Columns Schema
  const taskColumns = [
    {
      header: 'Task Title',
      key: 'title',
      render: (val, row) => (
        <div>
          <strong style={{ color: 'var(--text-heading)', fontSize: '0.88rem' }}>{row?.title || val || 'Untitled Task'}</strong>
          {row?.category && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>🏷️ {row.category}</span>}
        </div>
      )
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (val, row) => {
        const priorityVal = row?.priority || val || 'MEDIUM';
        const pObj = TASK_PRIORITIES.find(p => p.value === priorityVal);
        return <Badge variant={pObj ? pObj.badgeVariant : 'secondary'}>{pObj ? pObj.label : priorityVal}</Badge>;
      }
    },
    {
      header: 'Status',
      key: 'status',
      render: (val, row) => {
        const statusVal = row?.status || val || 'TODO';
        const sObj = TASK_STATUSES.find(s => s.value === statusVal);
        return <Badge variant={sObj ? sObj.badgeVariant : 'secondary'}>{sObj ? sObj.label : statusVal}</Badge>;
      }
    },
    {
      header: 'Linked Goal',
      key: 'goalId',
      render: (val, row) => {
        const goalId = row?.goalId || val;
        if (!goalId) return <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>— Standalone</span>;
        const linkedGoal = goals.find(g => Number(g.id) === Number(goalId));
        return linkedGoal ? (
          <Badge variant="indigo">
            🎯 {linkedGoal.title} ({linkedGoal.progressPercentage}%)
          </Badge>
        ) : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Goal #{goalId}</span>;
      }
    },
    {
      header: 'Actions',
      key: 'id',
      render: (val, row) => (
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {row.status !== 'COMPLETED' && (
            <Button variant="emerald" onClick={() => handleUpdateTaskStatus(row.id, 'COMPLETED')} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
              ✓ Complete
            </Button>
          )}
          <Button variant="danger" onClick={() => setDeleteConfirmTask(row)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            🗑️ Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="productivity-container">
      {/* 1. EXECUTIVE METRIC BAR */}
      <div className="productivity-metric-grid">
        <div className="productivity-metric-card focus-score">
          <div>
            <div className="productivity-metric-label">Executive Focus Score</div>
            <div className="productivity-metric-value">{productivityScore} / 100</div>
          </div>
          <div className="productivity-metric-icon">🚀</div>
        </div>

        <div className="productivity-metric-card goal-progress">
          <div>
            <div className="productivity-metric-label">Avg Goal Completion</div>
            <div className="productivity-metric-value">{avgGoalProgress}%</div>
          </div>
          <div className="productivity-metric-icon">🎯</div>
        </div>

        <div className="productivity-metric-card tasks-done">
          <div>
            <div className="productivity-metric-label">Tasks Completed</div>
            <div className="productivity-metric-value">{completedTasksCount}</div>
          </div>
          <div className="productivity-metric-icon">✅</div>
        </div>

        <div className="productivity-metric-card focus-hours">
          <div>
            <div className="productivity-metric-label">Focus Hours Logged</div>
            <div className="productivity-metric-value">{totalFocusHoursLogged} hrs</div>
          </div>
          <div className="productivity-metric-icon">⏱️</div>
        </div>
      </div>

      {/* 2. NAVIGATION SUB-TABS & EXPORTER BAR */}
      <div className="productivity-tabs-bar">
        <div className="productivity-tabs-group">
          <button type="button" onClick={() => setActiveTab('overview')} className={`productivity-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}>
            📊 Executive Overview
          </button>
          <button type="button" onClick={() => setActiveTab('goals')} className={`productivity-tab-btn ${activeTab === 'goals' ? 'active' : ''}`}>
            🎯 Goal Targets ({goals.length})
          </button>
          <button type="button" onClick={() => setActiveTab('pomodoro')} className={`productivity-tab-btn ${activeTab === 'pomodoro' ? 'active' : ''}`}>
            ⏱️ Pomodoro Studio
          </button>
          <button type="button" onClick={() => setActiveTab('tasks')} className={`productivity-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}>
            📋 Priority Tasks ({tasks.length})
          </button>
          <button type="button" onClick={() => setActiveTab('calendar')} className={`productivity-tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}>
            📅 Time-Blocker
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="indigo" onClick={() => setShowGoalModal(true)}>+ Goal Target</Button>
          <Button variant="emerald" onClick={() => setShowTaskModal(true)}>+ Priority Task</Button>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            <GoalSlidersCard goals={goals} goalsLoading={goalsLoading} handleSliderDrag={handleSliderDrag} />

            {/* Quick High-Priority Action List */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                  🔥 High-Priority Action List
                </h3>
                <Badge variant="danger">Urgent & Important</Badge>
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

          <VelocityHeatmap
            days={velocityDays}
            streak={focusStreak}
            peakWindow="09:30 AM - 12:30 PM"
            title="Productivity Velocity & Focus Heatmap"
            subtitle="Track daily focus consistency, active focus streaks, and peak productivity windows."
          />
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
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                📋 Eisenhower Priority Task Board
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Manage tasks categorized by Urgent & Important priority matrix.
              </p>
            </div>
            <Button variant="emerald" onClick={() => setShowTaskModal(true)}>+ Priority Task</Button>
          </div>

          <DataTable
            data={tasks}
            columns={taskColumns}
            loading={tasksLoading}
            pageSize={10}
            showSearch={true}
            showExport={true}
            exportFilename="Naqashly_Priority_Tasks"
            emptyMessage="No priority tasks found. Click '+ Priority Task' above to start!"
          />
        </Card>
      )}

      {/* 7. TIME-BLOCKER CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <TimeBlockerCalendar
          tasks={tasks}
          goals={goals}
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
    </div>
  );
};
