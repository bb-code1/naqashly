import { client } from './client';

/**
 * Productivity Suite Centralized API Abstraction.
 * Encapsulates REST API calls for Goal Milestone Sliders, Priority Tasks, and Pomodoro Sessions.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */

// ==========================================
// 🎯 GOAL MILESTONE SLIDERS API
// ==========================================

export const getGoals = async (timelineLevel = '') => {
  const params = timelineLevel ? { timelineLevel } : {};
  const response = await client.get('/productivity/goals', { params });
  return response.data;
};

export const createGoal = async (goalData) => {
  const response = await client.post('/productivity/goals', goalData);
  return response.data;
};

export const updateGoalProgress = async (goalId, progressPercentage) => {
  const response = await client.put(`/productivity/goals/${goalId}/progress`, { progressPercentage });
  return response.data;
};

// ==========================================
// 📋 PRIORITY TASKS API (Eisenhower Matrix)
// ==========================================

export const getTasks = async (status = '') => {
  const params = status ? { status } : {};
  const response = await client.get('/productivity/tasks', { params });
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await client.post('/productivity/tasks', taskData);
  return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await client.put(`/productivity/tasks/${taskId}/status`, { status });
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await client.delete(`/productivity/tasks/${taskId}`);
  return response.data;
};

// ==========================================
// 📅 TIME-BLOCKING CALENDAR API
// ==========================================

export const getTimeBlocks = async () => {
  const response = await client.get('/productivity/time-blocks');
  return response.data;
};

export const saveTimeBlock = async (blockData) => {
  const response = await client.post('/productivity/time-blocks', blockData);
  return response.data;
};

export const deleteTimeBlock = async (blockId) => {
  const response = await client.delete(`/productivity/time-blocks/${blockId}`);
  return response.data;
};

// ==========================================
// ⏱️ FOCUS SESSIONS & SETTINGS API
// ==========================================

export const getFocusSessions = async () => {
  const response = await client.get('/productivity/focus-sessions');
  return response.data;
};

export const logFocusSession = async (sessionData) => {
  const response = await client.post('/productivity/focus-sessions', sessionData);
  return response.data;
};

export const getProductivitySettings = async () => {
  const response = await client.get('/productivity/settings');
  return response.data;
};

export const updateProductivitySettings = async (settingsData) => {
  const response = await client.put('/productivity/settings', settingsData);
  return response.data;
};
