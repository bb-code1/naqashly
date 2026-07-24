import { useState, useEffect, useRef, useCallback } from 'react';
import * as productivityApi from '../api/productivityApi';
import { ENV } from '../config/env';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { POMODORO_PRESETS } from '../constants/productivityConstants';

/**
 * Productivity Suite Custom React Hook.
 * Manages 60 FPS debounced goal progress sliders, Eisenhower tasks, Pomodoro timer state,
 * and Formatted Excel (.xls) & CSV exporting utilities.
 * 
 * Optimized for Zero-Redundancy Network Traffic: Uses Instant Optimistic State Mutations
 * so creating a task/goal sends ONLY 1 POST request without triggering re-fetch cascades!
 * 
 * @author Barkat Bashir
 * @version 3.0.0
 */
export const useProductivity = () => {
  const { isAuthenticated } = useAuth();

  // Goals State
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);

  // Tasks State
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Pomodoro Focus Timer State
  const [pomodoroMode, setPomodoroMode] = useState('FOCUS'); // 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [activeSound, setActiveSound] = useState('NONE');

  // Adaptive Session Goal & Dynamic Psychological Break State
  const [targetSessions, setTargetSessions] = useState(4);
  const [completedSessionsInCycle, setCompletedSessionsInCycle] = useState(0);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(25);

  const { showSuccess, showError } = useToast();
  const timerDebounceRefs = useRef({});
  const intervalRef = useRef(null);

  // 1. Fetch Goals (Gated behind active authentication)
  const loadGoals = useCallback(async (timelineLevel = '') => {
    if (!isAuthenticated) {
      setGoals([]);
      setGoalsLoading(false);
      return;
    }
    try {
      setGoalsLoading(true);
      const data = await productivityApi.getGoals(timelineLevel);
      setGoals(data || []);
    } catch (err) {
      console.error('[useProductivity] Failed to load goals:', err);
      if (err.response?.status !== 401) {
        showError('Failed to load goal targets');
      }
    } finally {
      setGoalsLoading(false);
    }
  }, [isAuthenticated, showError]);

  // 2. Fetch Tasks (Gated behind active authentication)
  const loadTasks = useCallback(async (status = '') => {
    if (!isAuthenticated) {
      setTasks([]);
      setTasksLoading(false);
      return;
    }
    try {
      setTasksLoading(true);
      const data = await productivityApi.getTasks(status);
      setTasks(data || []);
    } catch (err) {
      console.error('[useProductivity] Failed to load tasks:', err);
      if (err.response?.status !== 401) {
        showError('Failed to load priority tasks');
      }
    } finally {
      setTasksLoading(false);
    }
  }, [isAuthenticated, showError]);

  // Initial Load Gated behind Auth (Fires ONCE on mount)
  useEffect(() => {
    if (isAuthenticated) {
      loadGoals();
      loadTasks();
    } else {
      setGoals([]);
      setTasks([]);
      setGoalsLoading(false);
      setTasksLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // 3. Goal Creation (Optimistic State Injection — 1 POST Request, 0 Re-fetches!)
  const handleCreateGoal = async (goalPayload) => {
    try {
      const created = await productivityApi.createGoal(goalPayload);
      showSuccess(`Goal target "${created.title}" created successfully!`);
      // Optimistic Local State Update (No network re-fetch!)
      setGoals(prev => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('[useProductivity] Error creating goal:', err);
      showError(err.response?.data?.message || 'Failed to create goal target');
      throw err;
    }
  };

  // 4. Debounced 60 FPS Goal Slider Progress Update
  const handleSliderDrag = (id, newProgress) => {
    // 60 FPS Instant UI Update
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, progressPercentage: newProgress, isCompleted: newProgress === 100 } : g)));

    // Debounce HTTP API Dispatches by 300ms
    if (timerDebounceRefs.current[id]) clearTimeout(timerDebounceRefs.current[id]);

    timerDebounceRefs.current[id] = setTimeout(async () => {
      try {
        await productivityApi.updateGoalProgress(id, newProgress);
        if (newProgress === 100) {
          showSuccess('🎉 Milestone Achieved! Goal 100% completed.');
        }
      } catch (err) {
        console.error('[useProductivity] Failed to sync goal progress:', err);
        showError('Failed to sync goal progress');
      }
    }, 300);
  };

  // 5. Task Handlers (Optimistic State Injection — 1 POST Request, 0 Re-fetches!)
  const recalculateGoalProgress = (targetGoalId, updatedTasks = tasks) => {
    if (!targetGoalId) return;
    const linkedTasks = updatedTasks.filter(t => String(t.goalId) === String(targetGoalId));
    if (linkedTasks.length > 0) {
      const completed = linkedTasks.filter(t => t.status === 'COMPLETED').length;
      const progress = Math.round((completed / linkedTasks.length) * 100);
      handleSliderDrag(targetGoalId, progress);
    }
  };

  const handleCreateTask = async (taskPayload) => {
    try {
      const created = await productivityApi.createTask(taskPayload);
      showSuccess(`📋 Task "${created.title}" added to board!`);
      
      // Optimistic Local State Update & Auto Goal Progress Calculation
      setTasks(prev => {
        const updated = [created, ...prev];
        if (created.goalId) {
          setTimeout(() => recalculateGoalProgress(created.goalId, updated), 50);
        }
        return updated;
      });
      return created;
    } catch (err) {
      console.error('[useProductivity] Error creating task:', err);
      showError(err.response?.data?.message || 'Failed to add task');
      throw err;
    }
  };

  const handleUpdateTaskStatus = async (id, status) => {
    let targetGoalId = null;
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          targetGoalId = t.goalId;
          return { ...t, status };
        }
        return t;
      });
      if (targetGoalId) {
        setTimeout(() => recalculateGoalProgress(targetGoalId, updated), 50);
      }
      return updated;
    });

    try {
      await productivityApi.updateTaskStatus(id, status);
      showSuccess(`✓ Task status updated to ${status}`);
    } catch (err) {
      console.error('[useProductivity] Error updating task status:', err);
      showError('Failed to update task status');
      await loadTasks();
    }
  };

  const handleDeleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await productivityApi.deleteTask(id);
      showSuccess('🗑️ Task removed from board');
    } catch (err) {
      console.error('[useProductivity] Error deleting task:', err);
      showError('Failed to delete task');
      await loadTasks();
    }
  };

  // 6. Pomodoro Focus Countdown Timer Controls
  const switchPomodoroMode = (mode) => {
    setPomodoroMode(mode);
    setIsTimerRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const preset = POMODORO_PRESETS.find(p => p.id === mode);
    setSecondsLeft(preset ? preset.durationMinutes * 60 : 25 * 60);
  };

  const setCustomTimerDuration = (minutes) => {
    const validMins = Math.max(1, Math.min(300, Number(minutes) || 25));
    setIsTimerRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsLeft(validMins * 60);
    showSuccess(`⏱️ Timer set to ${validMins} minutes`);
  };

  const toggleTimer = () => {
    setIsTimerRunning(prev => !prev);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const preset = POMODORO_PRESETS.find(p => p.id === pomodoroMode);
    setSecondsLeft(preset ? preset.durationMinutes * 60 : 25 * 60);
  };

  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsTimerRunning(false);

            if (pomodoroMode === 'FOCUS') {
              setPomodoroCount(c => c + 1);
              setCompletedSessionsInCycle(curr => {
                const nextCount = curr + 1;
                if (nextCount >= targetSessions) {
                  setPomodoroMode('LONG_BREAK');
                  setSecondsLeft(longBreakMinutes * 60);
                  showSuccess(`🎉 Target ${targetSessions} sessions completed! Enjoy a ${longBreakMinutes}-minute restorative long break.`);
                  return 0;
                } else {
                  setPomodoroMode('SHORT_BREAK');
                  setSecondsLeft(shortBreakMinutes * 60);
                  showSuccess(`🎯 Session ${nextCount}/${targetSessions} finished! Take a ${shortBreakMinutes}-minute break.`);
                  return nextCount;
                }
              });
            } else {
              setPomodoroMode('FOCUS');
              setSecondsLeft(25 * 60);
              showSuccess('☕ Break time over! Ready for your next focus session?');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerRunning, pomodoroMode, targetSessions, shortBreakMinutes, longBreakMinutes, showSuccess]);

  // Derived Metric Calculations
  const avgGoalProgress = goals.length === 0 ? 0 : Math.round(goals.reduce((acc, g) => acc + (g.progressPercentage || 0), 0) / goals.length);
  const completedTasksCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalFocusHoursLogged = (pomodoroCount * 25 / 60).toFixed(1);
  const productivityScore = Math.min(100, Math.round((avgGoalProgress * 0.6) + ((completedTasksCount / Math.max(1, tasks.length)) * 40)));

  // Exporters
  const exportToCsv = () => {
    if (goals.length === 0 && tasks.length === 0) {
      showError('No data available to export');
      return;
    }

    const csvLines = [
      'Type,Title,Category,Progress/Status,Date',
      ...goals.map(g => `Goal,"${g.title.replace(/"/g, '""')}","${g.category}",${g.progressPercentage}%,${g.targetDate || 'N/A'}`),
      ...tasks.map(t => `Task,"${t.title.replace(/"/g, '""')}","${t.category}",${t.status},${t.dueDate || 'N/A'}`)
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Productivity_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('📥 CSV Report downloaded!');
  };

  const exportToExcel = () => {
    if (goals.length === 0 && tasks.length === 0) {
      showError('No data available to export');
      return;
    }

    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Productivity Summary">
    <Table>
      <Row><Cell><Data ss:Type="String">Naqashly Productivity Executive Summary (${formattedDate})</Data></Cell></Row>
      <Row>
        <Cell><Data ss:Type="String">Item Type</Data></Cell>
        <Cell><Data ss:Type="String">Title</Data></Cell>
        <Cell><Data ss:Type="String">Category</Data></Cell>
        <Cell><Data ss:Type="String">Progress / Status</Data></Cell>
      </Row>
      ${goals.map(g => `<Row><Cell><Data ss:Type="String">Goal Target</Data></Cell><Cell><Data ss:Type="String">${g.title}</Data></Cell><Cell><Data ss:Type="String">${g.category}</Data></Cell><Cell><Data ss:Type="String">${g.progressPercentage}%</Data></Cell></Row>`).join('')}
      ${tasks.map(t => `<Row><Cell><Data ss:Type="String">Priority Task</Data></Cell><Cell><Data ss:Type="String">${t.title}</Data></Cell><Cell><Data ss:Type="String">${t.category}</Data></Cell><Cell><Data ss:Type="String">${t.status}</Data></Cell></Row>`).join('')}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Productivity_Report_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('📊 Formatted Excel (.xls) report downloaded!');
  };

  return {
    goals,
    goalsLoading,
    tasks,
    tasksLoading,
    pomodoroMode,
    secondsLeft,
    isTimerRunning,
    pomodoroCount,
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
  };
};
