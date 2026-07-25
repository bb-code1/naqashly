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

/**
 * 📦 1-Click Starter Catalog Preset Blueprints
 */
export const CATALOG_PRESETS = [
  {
    id: 'ISLAMIC',
    title: '🕌 Islamic Daily Prayer & Spiritual Pack',
    description: 'Seeds 5 Individual Daily Prayers (Fajr, Dhuhr, Asr, Maghrib, Isha), Tahajjud, Morning/Evening Adhkar, and Quran Hifz.',
    badge: 'Spiritual Pack',
    habits: [
      { title: '🌅 Fajr Prayer', category: 'SPIRITUAL', window: 'MORNING', targetMinutes: 15, isPrayer: true },
      { title: '📖 Morning Adhkar & Quran Recitation', category: 'SPIRITUAL', window: 'MORNING', targetMinutes: 20, isPrayer: false },
      { title: '🌤️ Dhuhr Prayer', category: 'SPIRITUAL', window: 'AFTERNOON', targetMinutes: 15, isPrayer: true },
      { title: '⛅ Asr Prayer & Evening Adhkar', category: 'SPIRITUAL', window: 'AFTERNOON', targetMinutes: 15, isPrayer: true },
      { title: '🌇 Maghrib Prayer', category: 'SPIRITUAL', window: 'EVENING', targetMinutes: 15, isPrayer: true },
      { title: '🌌 Isha Prayer & Witr', category: 'SPIRITUAL', window: 'EVENING', targetMinutes: 15, isPrayer: true },
      { title: '🌙 Tahajjud & Pre-Fajr Night Prayer', category: 'SPIRITUAL', window: 'EVENING', targetMinutes: 15, isPrayer: true },
      { title: '📚 Quran Hifz & Tafsir Study', category: 'SPIRITUAL', window: 'EVENING', targetMinutes: 20, isPrayer: false }
    ]
  },
  {
    id: 'MINDFULNESS',
    title: '☀️ Secular Mindfulness & Health Pack',
    description: 'Seeds Morning Meditation, High-Protein Breakfast, Reading, and Evening Gratitude.',
    badge: 'Mindfulness Pack',
    habits: [
      { title: 'Morning Meditation & Breathwork', category: 'MINDFULNESS', window: 'MORNING', targetMinutes: 15 },
      { title: 'Hydration & High-Protein Breakfast', category: 'HEALTH', window: 'MORNING', targetMinutes: 20 },
      { title: 'Technical Book Reading (20 Pages)', category: 'LEARNING', window: 'EVENING', targetMinutes: 30 },
      { title: 'Evening Gratitude Journal & Wind-Down', category: 'MINDFULNESS', window: 'EVENING', targetMinutes: 15 }
    ]
  },
  {
    id: 'DEEP_WORK',
    title: '🚀 Deep Work & Software Engineering Pack',
    description: 'Seeds System Architecture Sprint, Code Review, Inbox Zero, and Evening Retrospective.',
    badge: 'Productivity Pack',
    habits: [
      { title: 'Deep Work: System Architecture Sprint', category: 'PRODUCTIVITY', window: 'MORNING', targetMinutes: 90 },
      { title: 'Code Review & PR Approvals', category: 'PRODUCTIVITY', window: 'AFTERNOON', targetMinutes: 30 },
      { title: 'Team Standup & Inbox Zero', category: 'PRODUCTIVITY', window: 'AFTERNOON', targetMinutes: 20 },
      { title: 'Daily Engineering Journal Retrospective', category: 'LEARNING', window: 'EVENING', targetMinutes: 20 }
    ]
  },
  {
    id: 'CHRISTIAN',
    title: '✝️ Christian Daily Devotion & Fellowship Pack',
    description: 'Seeds Morning Devotion, Bible Scripture Study, Fellowship, and Evening Reflection.',
    badge: 'Spiritual Pack',
    habits: [
      { title: 'Morning Devotion & Prayer', category: 'SPIRITUAL', window: 'MORNING', targetMinutes: 20 },
      { title: 'Bible Scripture Study & Journaling', category: 'SPIRITUAL', window: 'AFTERNOON', targetMinutes: 25 },
      { title: 'Evening Reflection & Family Prayer', category: 'SPIRITUAL', window: 'EVENING', targetMinutes: 20 }
    ]
  },
  {
    id: 'HINDU',
    title: '🕉️ Hindu Daily Puja & Meditation Pack',
    description: 'Seeds Morning Puja, Mantra Chanting, Bhagavad Gita Study, and Evening Aarti.',
    badge: 'Spiritual Pack',
    habits: [
      { title: 'Morning Puja & Mantra Chanting', category: 'SPIRITUAL', window: 'MORNING', targetMinutes: 20 },
      { title: 'Bhagavad Gita Reading & Meditation', category: 'SPIRITUAL', window: 'AFTERNOON', targetMinutes: 25 },
      { title: 'Evening Aarti & Reflection', category: 'SPIRITUAL', window: 'EVENING', targetMinutes: 20 }
    ]
  },
  {
    id: 'CUSTOM',
    title: '⚙️ Custom Empty Canvas',
    description: 'Clears all habits and starts with an empty workspace to build from scratch.',
    badge: 'Custom',
    habits: []
  }
];
