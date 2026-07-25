/**
 * 🌿 Routine & Habit Engine Centralized Constants
 * 
 * Defines Contextual Time Windows, Habit Statuses, Starter Catalog Presets,
 * and Design Tokens for Naqashly Life OS.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */

export const CONTEXTUAL_WINDOWS = [
  { id: 'MORNING', label: '🌅 Morning Window', subtitle: '06:00 AM - 12:00 PM', color: '#10B981', border: 'rgba(16, 185, 129, 0.3)' },
  { id: 'AFTERNOON', label: '☀️ Afternoon Window', subtitle: '12:00 PM - 06:00 PM', color: '#6366F1', border: 'rgba(99, 102, 241, 0.3)' },
  { id: 'EVENING', label: '🌙 Evening Window', subtitle: '06:00 PM - 12:00 AM', color: '#8B5CF6', border: 'rgba(139, 92, 246, 0.3)' }
];

export const HABIT_STATUS = {
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  COMPLETED: 'COMPLETED'
};

export const DEFAULT_HABITS = [
  {
    id: 1,
    title: 'Morning Meditation & Breathwork',
    category: 'MINDFULNESS',
    window: 'MORNING',
    targetMinutes: 15,
    status: 'COMPLETED',
    completionPercentage: 100,
    streakCount: 7,
    isFreezeProtected: false
  },
  {
    id: 2,
    title: 'Hydration & High-Protein Breakfast',
    category: 'HEALTH',
    window: 'MORNING',
    targetMinutes: 20,
    status: 'PARTIAL',
    completionPercentage: 50,
    streakCount: 14,
    isFreezeProtected: false
  },
  {
    id: 3,
    title: 'Deep Work: System Architecture Sprint',
    category: 'PRODUCTIVITY',
    window: 'AFTERNOON',
    targetMinutes: 90,
    status: 'COMPLETED',
    completionPercentage: 100,
    streakCount: 5,
    isFreezeProtected: false
  },
  {
    id: 4,
    title: 'Code Review & Team Inbox Zero',
    category: 'PRODUCTIVITY',
    window: 'AFTERNOON',
    targetMinutes: 30,
    status: 'PENDING',
    completionPercentage: 0,
    streakCount: 3,
    isFreezeProtected: false
  },
  {
    id: 5,
    title: 'Technical Book Reading (20 Pages)',
    category: 'LEARNING',
    window: 'EVENING',
    targetMinutes: 30,
    status: 'PENDING',
    completionPercentage: 0,
    streakCount: 12,
    isFreezeProtected: false
  },
  {
    id: 6,
    title: 'Evening Gratitude Journal & Wind-Down',
    category: 'MINDFULNESS',
    window: 'EVENING',
    targetMinutes: 15,
    status: 'PENDING',
    completionPercentage: 0,
    streakCount: 9,
    isFreezeProtected: false
  }
];

export const HABIT_CATEGORIES = [
  { id: 'PRODUCTIVITY', label: '🚀 Productivity', color: '#6366F1' },
  { id: 'MINDFULNESS', label: '🧘 Mindfulness', color: '#10B981' },
  { id: 'HEALTH', label: '💪 Health & Fitness', color: '#F59E0B' },
  { id: 'LEARNING', label: '📚 Learning & Growth', color: '#EC4899' },
  { id: 'SPIRITUAL', label: '✨ Spiritual & Reflection', color: '#8B5CF6' }
];
