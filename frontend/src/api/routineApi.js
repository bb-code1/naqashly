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
