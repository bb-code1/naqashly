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

export const FREQUENCY_TYPES = {
  DAILY: 'DAILY',
  WEEKLY_DAYS: 'WEEKLY_DAYS',
  WEEKLY_TARGET: 'WEEKLY_TARGET'
};

export const DAYS_OF_WEEK = [
  { id: 'MON', label: 'M', full: 'Monday' },
  { id: 'TUE', label: 'T', full: 'Tuesday' },
  { id: 'WED', label: 'W', full: 'Wednesday' },
  { id: 'THU', label: 'T', full: 'Thursday' },
  { id: 'FRI', label: 'F', full: 'Friday' },
  { id: 'SAT', label: 'S', full: 'Saturday' },
  { id: 'SUN', label: 'S', full: 'Sunday' }
];

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

/**
 * 📦 1-Click Starter Catalog Preset Blueprints
 * Order: 1. Mindfulness, 2. Deep Work, 3. Religious/Spiritual (Islamic, Christian, Hindu), 4. Custom Empty Canvas
 */
export const CATALOG_PRESETS = [
  {
    id: 'MINDFULNESS',
    title: '🧘 Mindfulness & Health',
    description: 'Seeds Morning Meditation, High-Protein Breakfast, Reading, and Evening Gratitude.',
    badge: 'Mindfulness',
    habits: [
      { title: 'Morning Meditation & Breathwork', category: 'MINDFULNESS', window: 'MORNING', targetMinutes: 15 },
      { title: 'Hydration & High-Protein Breakfast', category: 'HEALTH', window: 'MORNING', targetMinutes: 20 },
      { title: 'Technical Book Reading (20 Pages)', category: 'LEARNING', window: 'EVENING', targetMinutes: 30 },
      { title: 'Evening Gratitude Journal & Wind-Down', category: 'MINDFULNESS', window: 'EVENING', targetMinutes: 15 }
    ]
  },
  {
    id: 'DEEP_WORK',
    title: '🚀 Deep Work',
    description: 'Seeds System Architecture Sprint, Code Review, Inbox Zero, and Evening Retrospective.',
    badge: 'Productivity',
    habits: [
      { title: 'Deep Work: System Architecture Sprint', category: 'PRODUCTIVITY', window: 'MORNING', targetMinutes: 90 },
      { title: 'Code Review & PR Approvals', category: 'PRODUCTIVITY', window: 'AFTERNOON', targetMinutes: 30 },
      { title: 'Team Standup & Inbox Zero', category: 'PRODUCTIVITY', window: 'AFTERNOON', targetMinutes: 20 },
      { title: 'Daily Engineering Journal Retrospective', category: 'LEARNING', window: 'EVENING', targetMinutes: 20 }
    ]
  },
  {
    id: 'ISLAMIC',
    title: '🕌 Islamic Solstices',
    description: 'Seeds 5 Individual Daily Prayers (Fajr, Dhuhr, Asr, Maghrib, Isha), Tahajjud, Morning/Evening Adhkar, and Quran Hifz.',
    badge: 'Religious',
    habits: [
      { title: 'Fajr', category: 'SPIRITUAL', window: 'MORNING', targetMinutes: 15, isPrayer: true },
      { title: 'Quran', category: 'SPIRITUAL', window: 'MORNING', targetMinutes: 15, isPrayer: false },
      { title: 'Zuhur', category: 'SPIRITUAL', window: 'AFTERNOON', targetMinutes: 15, isPrayer: true },
      { title: 'Jumu\'ah', category: 'SPIRITUAL', window: 'AFTERNOON', targetMinutes: 15, isPrayer: true },
      { title: 'Asr', category: 'SPIRITUAL', window: 'AFTERNOON', targetMinutes: 15, isPrayer: true },
      { title: 'Magrib', category: 'SPIRITUAL', window: 'EVENING', targetMinutes: 15, isPrayer: true },
      { title: 'Isha', category: 'SPIRITUAL', window: 'EVENING', targetMinutes: 15, isPrayer: true },
      { title: 'Tahajud', category: 'SPIRITUAL', window: 'EVENING', targetMinutes: 15, isPrayer: true },
      { title: 'Azkar', category: 'SPIRITUAL', window: 'EVENING', targetMinutes: 15, isPrayer: false }
    ]
  },
  {
    id: 'CHRISTIAN',
    title: '✝️ Christian Devotion',
    description: 'Seeds Morning Devotion, Bible Scripture Study, Fellowship, and Evening Reflection.',
    badge: 'Religious',
    habits: [
      { title: 'Morning Devotion & Prayer', category: 'SPIRITUAL', window: 'MORNING', targetMinutes: 20 },
      { title: 'Bible Scripture Study & Journaling', category: 'SPIRITUAL', window: 'AFTERNOON', targetMinutes: 25 },
      { title: 'Evening Reflection & Family Prayer', category: 'SPIRITUAL', window: 'EVENING', targetMinutes: 20 }
    ]
  },
  {
    id: 'HINDU',
    title: '🕉️ Hindu Sadhana',
    description: 'Seeds Morning Puja, Mantra Chanting, Bhagavad Gita Study, and Evening Aarti.',
    badge: 'Religious',
    habits: [
      { title: 'Morning Puja & Mantra Chanting', category: 'SPIRITUAL', window: 'MORNING', targetMinutes: 20 },
      { title: 'Bhagavad Gita Reading & Meditation', category: 'SPIRITUAL', window: 'AFTERNOON', targetMinutes: 25 },
      { title: 'Evening Aarti & Reflection', category: 'SPIRITUAL', window: 'EVENING', targetMinutes: 20 }
    ]
  },
  {
    id: 'CUSTOM',
    title: '🎨 Empty Canvas',
    description: 'Clears all presets and gives you a completely blank slate to create your own custom habits.',
    badge: 'Empty Slate',
    habits: []
  }
];
