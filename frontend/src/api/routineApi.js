import { client } from './client';

/**
 * 🌿 Routine Service Centralized REST API Abstraction Layer
 * 
 * Encapsulates backend REST API endpoints for Routine Profiles, Contextual Blocks,
 * Habit Logs, 2-Hour Grace Window Math, and 30-Day Rolling Consistency Scores.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */

export const getRoutines = async () => {
  try {
    const response = await client.get('/routine/routines');
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Backend endpoint unavailable, falling back to client state');
    return null;
  }
};

export const getHabits = async () => {
  try {
    const response = await client.get('/routine/habits');
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Backend habits endpoint unavailable');
    return null;
  }
};

export const logHabitStatus = async (habitId, status, completionPercentage, qualityGrade) => {
  try {
    const response = await client.post('/routine/habits/log', { habitId, status, completionPercentage, qualityGrade });
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Failed to persist habit log to backend');
    return null;
  }
};

export const getHabitHistory = async (days = 365) => {
  try {
    const response = await client.get(`/routine/habits/history?days=${days}`);
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Failed to fetch habit history from backend');
    return [];
  }
};

export const saveMuhasabah = async (data) => {
  try {
    const response = await client.post('/routine/muhasabah', data);
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Failed to save Muhasabah log');
    return null;
  }
};

export const getTodayMuhasabah = async () => {
  try {
    const response = await client.get('/routine/muhasabah/today');
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Failed to fetch today Muhasabah log');
    return null;
  }
};

export const getMuhasabahHistory = async () => {
  try {
    const response = await client.get('/routine/muhasabah/history');
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Failed to fetch Muhasabah history');
    return [];
  }
};

export const createHabit = async (habitData) => {
  try {
    const response = await client.post('/routine/habits', habitData);
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Failed to create habit on backend');
    return null;
  }
};

export const updateHabit = async (id, habitData) => {
  try {
    const response = await client.put(`/routine/habits/${id}`, habitData);
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Failed to update habit on backend');
    return null;
  }
};

export const deleteHabit = async (id) => {
  try {
    const response = await client.delete(`/routine/habits/${id}`);
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Failed to delete habit on backend');
    return null;
  }
};

export const seedPresetPack = async (packName) => {
  try {
    const response = await client.post(`/routine/habits/preset?pack=${packName}`);
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Failed to seed preset pack on backend');
    return null;
  }
};

export const getRoutineSettings = async () => {
  try {
    const response = await client.get('/routine/habits/settings');
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Failed to fetch routine settings');
    return null;
  }
};

export const updateRoutineSettings = async (settingsData) => {
  try {
    const response = await client.put('/routine/habits/settings', settingsData);
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Failed to update routine settings');
    return null;
  }
};

export const getTimeBlocks = async () => {
  try {
    const response = await client.get('/routine/habits/blocks');
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Failed to fetch time blocks');
    return null;
  }
};

export const createTimeBlock = async (blockData) => {
  try {
    const response = await client.post('/routine/habits/blocks', blockData);
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Failed to create time block');
    return null;
  }
};

export const updateTimeBlock = async (id, blockData) => {
  try {
    const response = await client.put(`/routine/habits/blocks/${id}`, blockData);
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Failed to update time block');
    return null;
  }
};

export const deleteTimeBlock = async (id) => {
  try {
    const response = await client.delete(`/routine/habits/blocks/${id}`);
    return response.data;
  } catch (err) {
    console.warn('[routineApi] Failed to delete time block');
    return null;
  }
};
