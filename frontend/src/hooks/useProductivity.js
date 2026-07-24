import { useState, useEffect, useRef, useCallback } from 'react';
import * as productivityApi from '../api/productivityApi';
import { ENV } from '../config/env';
import { useToast } from '../context/ToastContext';
import { POMODORO_PRESETS } from '../constants/productivityConstants';

/**
 * Productivity Suite Custom React Hook.
 * Manages 60 FPS debounced goal progress sliders, Eisenhower tasks, Pomodoro timer state,
 * and Formatted Excel (.xls) & CSV exporting utilities.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const useProductivity = () => {
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

  const { showSuccess, showError } = useToast();
  const timerDebounceRefs = useRef({});
  const intervalRef = useRef(null);

  // 1. Fetch Goals
  const loadGoals = useCallback(async (timelineLevel = '') => {
    try {
      setGoalsLoading(true);
      const data = await productivityApi.getGoals(timelineLevel);
      setGoals(data || []);
    } catch (err) {
      console.error('[useProductivity] Failed to load goals:', err);
      showError('Failed to load goal targets');
    } finally {
      setGoalsLoading(false);
    }
  }, [showError]);

  // 2. Fetch Tasks
  const loadTasks = useCallback(async (status = '') => {
    try {
      setTasksLoading(true);
      const data = await productivityApi.getTasks(status);
      setTasks(data || []);
    } catch (err) {
      console.error('[useProductivity] Failed to load tasks:', err);
      showError('Failed to load priority tasks');
    } finally {
      setTasksLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadGoals();
    loadTasks();
  }, [loadGoals, loadTasks]);

  // 3. Goal Creation
  const handleCreateGoal = async (goalPayload) => {
    try {
      const created = await productivityApi.createGoal(goalPayload);
      showSuccess(`Goal target "${created.title}" created successfully!`);
      await loadGoals();
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
          showSuccess(`🎉 Milestone Achieved! Goal 100% completed.`);
        }
      } catch (err) {
        console.error('[useProductivity] Failed to sync progress:', err);
        showError('Failed to save goal progress slider');
      }
    }, ENV.DEBOUNCE_SLIDER_MS);
  };

  // 5. Task Actions
  const handleCreateTask = async (taskPayload) => {
    try {
      const created = await productivityApi.createTask(taskPayload);
      showSuccess(`Task "${created.title}" added to board!`);
      await loadTasks();
      return created;
    } catch (err) {
      console.error('[useProductivity] Error creating task:', err);
      showError(err.response?.data?.message || 'Failed to create task');
      throw err;
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      // Instant UI update
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t)));
      await productivityApi.updateTaskStatus(taskId, newStatus);
      showSuccess(`Task status updated to ${newStatus}`);
    } catch (err) {
      console.error('[useProductivity] Failed to update task status:', err);
      showError('Failed to update task status');
      await loadTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await productivityApi.deleteTask(taskId);
      showSuccess('Task removed from board');
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('[useProductivity] Error deleting task:', err);
      showError('Failed to delete task');
    }
  };

  // 6. Pomodoro Timer Controls
  const switchPomodoroMode = (mode) => {
    setIsTimerRunning(false);
    setPomodoroMode(mode);
    const preset = POMODORO_PRESETS.find(p => p.mode === mode);
    setSecondsLeft(preset ? preset.minutes * 60 : 25 * 60);
  };

  const toggleTimer = () => {
    setIsTimerRunning(prev => !prev);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    const preset = POMODORO_PRESETS.find(p => p.mode === pomodoroMode);
    setSecondsLeft(preset ? preset.minutes * 60 : 25 * 60);
  };

  // Pomodoro Interval Effect
  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsTimerRunning(false);
            if (pomodoroMode === 'FOCUS') {
              setPomodoroCount(c => c + 1);
              showSuccess('🎯 Pomodoro Focus Session Complete! Time for a short break.');
            } else {
              showSuccess('☕ Break Finished! Ready to start another focus session?');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerRunning, pomodoroMode, showSuccess]);

  // 7. Executive Metrics & Productivity Index Computations
  const completedGoalsCount = goals.filter(g => g.progressPercentage === 100 || g.isCompleted).length;
  const avgGoalProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + (g.progressPercentage || 0), 0) / goals.length) 
    : 0;

  const completedTasksCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalFocusHoursLogged = Math.round((pomodoroCount * 25 / 60) * 10) / 10;

  // Algorithmic Productivity Index Score (0 - 100)
  const productivityScore = Math.min(
    100,
    Math.round((avgGoalProgress * 0.4) + (completedTasksCount * 8) + (pomodoroCount * 12))
  );

  // 8. Formatted Excel (.xls) and CSV Exporters
  const exportToCsv = () => {
    if (goals.length === 0 && tasks.length === 0) {
      showError('No productivity data to export');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'TYPE,TITLE,CATEGORY/PRIORITY,PROGRESS/STATUS,TARGET_DATE\n';

    goals.forEach(g => {
      csvContent += `GOAL,"${g.title.replace(/"/g, '""')}","${g.category}","${g.progressPercentage}%","${g.targetDate || 'N/A'}"\n`;
    });

    tasks.forEach(t => {
      csvContent += `TASK,"${t.title.replace(/"/g, '""')}","${t.priority}","${t.status}","${t.dueDate ? t.dueDate.split('T')[0] : 'N/A'}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Naqashly_Productivity_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Productivity CSV report downloaded successfully!');
  };

  const exportToExcel = () => {
    if (goals.length === 0 && tasks.length === 0) {
      showError('No productivity data to export');
      return;
    }

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; font-size: 13px; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th { background-color: #4F46E5; color: #FFFFFF; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #CBD5E1; }
          td { padding: 8px; border: 1px solid #CBD5E1; }
          .highlight { background-color: #ECFDF5; font-weight: bold; color: #059669; }
          .header-row { background-color: #1E1B4B; color: #FFFFFF; font-size: 16px; font-weight: bold; text-align: center; }
        </style>
      </head>
      <body>
        <table>
          <tr class="header-row"><td colspan="5">Naqashly Executive Productivity Report</td></tr>
          <tr><td colspan="5">Generated on: ${new Date().toLocaleString()}</td></tr>
          <tr>
            <th>Type</th>
            <th>Title</th>
            <th>Category / Priority</th>
            <th>Progress / Status</th>
            <th>Target / Due Date</th>
          </tr>
    `;

    goals.forEach(g => {
      html += `
        <tr>
          <td style="color:#6366F1; font-weight:bold;">GOAL</td>
          <td>${g.title}</td>
          <td>${g.category}</td>
          <td class="highlight">${g.progressPercentage}%</td>
          <td>${g.targetDate || 'N/A'}</td>
        </tr>
      `;
    });

    tasks.forEach(t => {
      html += `
        <tr>
          <td style="color:#059669; font-weight:bold;">TASK</td>
          <td>${t.title}</td>
          <td>${t.priority}</td>
          <td>${t.status}</td>
          <td>${t.dueDate ? t.dueDate.split('T')[0] : 'N/A'}</td>
        </tr>
      `;
    });

    html += `
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;choice=2.0' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Naqashly_Productivity_Report_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Formatted Excel (.xls) report downloaded!');
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
    completedGoalsCount,
    avgGoalProgress,
    completedTasksCount,
    totalFocusHoursLogged,
    productivityScore,
    loadGoals,
    loadTasks,
    handleCreateGoal,
    handleSliderDrag,
    handleCreateTask,
    handleUpdateTaskStatus,
    handleDeleteTask,
    switchPomodoroMode,
    toggleTimer,
    resetTimer,
    setActiveSound,
    exportToCsv,
    exportToExcel
  };
};
