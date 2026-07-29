/**
 * Productivity Suite Centralized Configuration & Catalog.
 * Contains Goal Categories, Timeline Levels, Eisenhower Priority Matrix definitions, and Pomodoro Presets.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */

export const GOAL_CATEGORIES = [
  { value: 'CAREER', label: '💼 Career & Business', icon: '💼', color: 'var(--accent-indigo)' },
  { value: 'FINANCES', label: '💰 Money & Wealth', icon: '💰', color: 'var(--accent-emerald)' },
  { value: 'HEALTH', label: '🏋️ Health & Fitness', icon: '🏋️', color: 'var(--accent-danger)' },
  { value: 'PERSONAL', label: '🌱 Personal Development', icon: '🌱', color: 'var(--accent-amber)' },
  { value: 'SPIRITUAL', label: '🧠 Mind & Reflection', icon: '🧠', color: 'var(--accent-cyan)' }
];

export const TIMELINE_LEVELS = [
  { value: 'DAILY', label: '📅 Daily Goal', badge: 'DAILY' },
  { value: 'WEEKLY', label: '🗓️ Weekly Goal', badge: 'WEEKLY' },
  { value: 'MONTHLY', label: '📊 Monthly Goal', badge: 'MONTHLY' },
  { value: 'YEARLY', label: '🚀 Yearly Goal', badge: 'YEARLY' },
  { value: 'LIFETIME', label: '🌟 Lifetime Target', badge: 'LIFETIME' }
];

export const TASK_PRIORITIES = [
  { value: 'HIGH', label: '🔥 Urgent', badgeVariant: 'danger', color: '#EF4444' },
  { value: 'MEDIUM', label: '🎯 Important (Schedule)', badgeVariant: 'indigo', color: '#6366F1' },
  { value: 'LOW', label: '⚡ Quick Win / Low Priority', badgeVariant: 'amber', color: '#F59E0B' }
];

export const TASK_STATUSES = [
  { value: 'TODO', label: '⏳ Pending', badgeVariant: 'secondary' },
  { value: 'IN_PROGRESS', label: '🔄 In Progress', badgeVariant: 'amber' },
  { value: 'COMPLETED', label: '✅ Completed', badgeVariant: 'emerald' },
  { value: 'CANCELLED', label: '🚫 Cancelled', badgeVariant: 'danger' }
];

export const POMODORO_PRESETS = [
  { mode: 'FOCUS', label: '🎯 Deep Work Focus', minutes: 25, color: 'var(--accent-emerald)' },
  { mode: 'SHORT_BREAK', label: '☕ Short Break', minutes: 5, color: 'var(--accent-indigo)' },
  { mode: 'LONG_BREAK', label: '🌴 Long Break', minutes: 15, color: 'var(--accent-amber)' }
];

export const AMBIENT_SOUNDS = [
  { id: 'NONE', label: '🔇 Silent Mode', icon: '🔇' },
  { id: 'RAIN', label: '🌧️ Heavy Rain', icon: '🌧️' },
  { id: 'CAFE', label: '☕ Coffee Shop', icon: '☕' },
  { id: 'FOREST', label: '🌲 Pine Forest', icon: '🌲' },
  { id: 'WHITE_NOISE', label: '⚪ White Noise', icon: '⚪' }
];
