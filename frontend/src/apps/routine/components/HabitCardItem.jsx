import React from 'react';
import { motion } from 'framer-motion';

/**
 * 🌿 Habit Card Component with 3-State Tap Toggling & Prayer Quality Ratings
 */
export const HabitCardItem = ({
  habit,
  onCycleStatus,
  onRateQuality,
  onOpenFocus,
  onEdit,
  onDelete,
  layout = 'list'
}) => {
  const isCompleted = habit.status === 'COMPLETED';
  const isPartial = habit.status === 'PARTIAL';

  const isPrayerHabit = Boolean(
    habit.isPrayer ||
    habit.title?.toLowerCase().includes('prayer') ||
    habit.title?.toLowerCase().includes('tahajjud') ||
    habit.title?.toLowerCase().includes('fajr') ||
    habit.title?.toLowerCase().includes('dhuhr') ||
    habit.title?.toLowerCase().includes('asr') ||
    habit.title?.toLowerCase().includes('maghrib') ||
    habit.title?.toLowerCase().includes('isha')
  );

  const isSpiritualHabit = Boolean(
    habit.category === 'SPIRITUAL' ||
    isPrayerHabit ||
    habit.title?.toLowerCase().includes('adhkar') ||
    habit.title?.toLowerCase().includes('quran') ||
    habit.title?.toLowerCase().includes('sadhana') ||
    habit.title?.toLowerCase().includes('puja') ||
    habit.title?.toLowerCase().includes('devotion') ||
    habit.title?.toLowerCase().includes('bible')
  );

  const getStatusBadge = () => {
    if (isCompleted) {
      if (isPrayerHabit) {
        if (!habit.qualityGrade) {
          return { text: '⚠️ 90% (Pending Rating)', key: 'pending' };
        }
        if (habit.qualityGrade === 'JAMAAT') {
          return { text: '🕌 In Jama\'at (100%)', key: 'jamaat' };
        }
        if (habit.qualityGrade === 'ON_TIME') {
          return { text: '⏰ On Time (90%)', key: 'on-time' };
        }
        if (habit.qualityGrade === 'LATE') {
          return { text: '⏳ Late / Qada (50%)', key: 'late' };
        }
      }
      return { text: '✅ Completed (100%)', key: 'completed' };
    }
    if (isPartial) {
      return { text: '⏳ Partial (50%)', key: 'partial' };
    }
    return { text: '⭕ Pending (0%)', key: 'pending' };
  };

  const badge = getStatusBadge();
  const isPendingPrayerGrade = isCompleted && isPrayerHabit && !habit.qualityGrade;

  if (layout === 'grid') {
    const win = (habit.window || 'MORNING').toUpperCase();
    const icon = win === 'MORNING' ? '🌅' : win === 'AFTERNOON' ? '☀️' : '🌙';

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2 }}
        className={`habit-card-grid ${isPendingPrayerGrade ? 'pending-prayer' : isCompleted ? 'completed' : isPartial ? 'partial' : 'pending'}`}
      >
        {/* Top Header Row: Block Icon + Title & Tiny Actions */}
        <div className="habit-card-grid-header">
          <div className="habit-card-grid-details">
            <span className="habit-card-grid-window">
              {icon} {win}
            </span>
            <h4 className="habit-card-grid-title">
              {habit.title}
            </h4>
          </div>

          {/* Compact Actions */}
          <div className="habit-card-grid-actions">
            <button
              type="button"
              onClick={() => onEdit(habit)}
              className="habit-icon-btn"
              title="Edit"
            >
              ✏️
            </button>
            <button
              type="button"
              onClick={() => onDelete(habit)}
              className="habit-icon-btn delete"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Middle Streak Counter */}
        <div className="habit-card-grid-streak-row">
          <span>⏱️ {habit.targetMinutes}m</span>
          <span>🔥 {habit.streakCount}d streak</span>
        </div>

        {/* Bottom Selection Option row */}
        <div className="habit-card-grid-ratings-bar">
          {isPrayerHabit ? (
            <div className="habit-ratings-inner">
              <button
                type="button"
                onClick={() => onRateQuality(habit.id, 'JAMAAT')}
                className={`rating-btn jamaat ${habit.qualityGrade === 'JAMAAT' ? 'active' : ''}`}
                title="Jama'at"
              >
                🕌
              </button>

              <button
                type="button"
                onClick={() => onRateQuality(habit.id, 'ON_TIME')}
                className={`rating-btn on-time ${habit.qualityGrade === 'ON_TIME' ? 'active' : ''}`}
                title="On Time"
              >
                ⏰
              </button>

              <button
                type="button"
                onClick={() => onRateQuality(habit.id, 'LATE')}
                className={`rating-btn late ${habit.qualityGrade === 'LATE' ? 'active' : ''}`}
                title="Late"
              >
                ⏳
              </button>
            </div>
          ) : (
            <>
              {isCompleted ? (
                <div className="habit-ratings-inner">
                  <button
                    type="button"
                    onClick={() => onRateQuality(habit.id, 'EXCELLENT')}
                    className={`rating-btn excellent ${habit.qualityGrade === 'EXCELLENT' ? 'active' : ''}`}
                    title="Focus"
                  >
                    🌟
                  </button>
                  <button
                    type="button"
                    onClick={() => onRateQuality(habit.id, 'GOOD')}
                    className={`rating-btn good ${habit.qualityGrade === 'GOOD' ? 'active' : ''}`}
                    title="Good"
                  >
                    👍
                  </button>
                  <button
                    type="button"
                    onClick={() => onRateQuality(habit.id, 'POOR')}
                    className={`rating-btn poor ${habit.qualityGrade === 'POOR' ? 'active' : ''}`}
                    title="Rushed"
                  >
                    ⚠️
                  </button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onCycleStatus(habit.id)}
                  className={`status-cycle-btn ${badge.key}`}
                >
                  {badge.text}
                </motion.button>
              )}
            </>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`habit-card-list ${isPendingPrayerGrade ? 'pending-prayer' : isCompleted ? 'completed' : isPartial ? 'partial' : 'pending'}`}
    >
      {/* Habit Details Column */}
      <div className="habit-card-list-details">
        
        <div>
          <div className="habit-card-list-title-row">
            <h4 className="habit-card-list-title">
              {habit.title}
            </h4>

            {/* Category Tag */}
            <span className="habit-card-list-category">
              {habit.category || 'PRODUCTIVITY'}
            </span>
          </div>

          <div className="habit-card-list-meta">
            <span>⏱️ {habit.targetMinutes} Mins</span>
            <span>🔥 {habit.streakCount} Day Streak</span>
            {habit.isFreezeProtected && <span className="freeze-protected-label">🧊 Freeze Protected</span>}
          </div>
        </div>

      </div>

      {/* Right Controls & Status Pill */}
      <div className="habit-card-list-controls">
        
        {/* Status Badge Toggle */}
        {isPrayerHabit ? (
          /* Persistent 3-Button selection for Prayers */
          <div className="habit-card-list-ratings-bar">
            <button
              type="button"
              onClick={() => onRateQuality(habit.id, 'JAMAAT')}
              className={`rating-btn-wide jamaat ${habit.qualityGrade === 'JAMAAT' ? 'active' : ''}`}
              title="In Jama'at (100% Quality)"
            >
              🕌 <span className="rating-btn-text">Jama'at</span>
            </button>

            <button
              type="button"
              onClick={() => onRateQuality(habit.id, 'ON_TIME')}
              className={`rating-btn-wide on-time ${habit.qualityGrade === 'ON_TIME' ? 'active' : ''}`}
              title="On Time (90% Quality)"
            >
              ⏰ <span className="rating-btn-text">On Time</span>
            </button>

            <button
              type="button"
              onClick={() => onRateQuality(habit.id, 'LATE')}
              className={`rating-btn-wide late ${habit.qualityGrade === 'LATE' ? 'active' : ''}`}
              title="Late / Qada (50% Quality)"
            >
              ⏳ <span className="rating-btn-text">Late</span>
            </button>
          </div>
        ) : (
          /* Standard status badge & rating workflow for Lifestyle/Growth */
          <>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onCycleStatus(habit.id)}
              className={`status-cycle-btn-wide ${badge.key}`}
              title="Click to Cycle Status: Pending (0%) -> Partial (50%) -> Completed (100%)"
            >
              {badge.text}
            </motion.button>

            {isCompleted && (
              <div className="habit-card-list-ratings-bar">
                <button
                  type="button"
                  onClick={() => onRateQuality(habit.id, 'EXCELLENT')}
                  className={`rating-btn-wide excellent ${habit.qualityGrade === 'EXCELLENT' ? 'active' : ''}`}
                  title="High Focus & Excellence (100% Quality)"
                >
                  🌟 <span className="rating-btn-text">Focus</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRateQuality(habit.id, 'GOOD')}
                  className={`rating-btn-wide good ${habit.qualityGrade === 'GOOD' ? 'active' : ''}`}
                  title="Standard Quality (80% Quality)"
                >
                  👍 <span className="rating-btn-text">Good</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRateQuality(habit.id, 'POOR')}
                  className={`rating-btn-wide poor ${habit.qualityGrade === 'POOR' ? 'active' : ''}`}
                  title="Distracted / Rushed (50% Quality)"
                >
                  ⚠️ <span className="rating-btn-text">Rushed</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Focus Mode Trigger */}
        {!isSpiritualHabit && (
          <button
            type="button"
            onClick={() => onOpenFocus(habit)}
            className="habit-focus-btn"
            title="Start Focus Timer"
          >
            🎯 Focus
          </button>
        )}

        {/* Edit Trigger */}
        <button
          type="button"
          onClick={() => onEdit(habit)}
          className="habit-edit-btn"
          title="Edit Habit"
        >
          ✏️
        </button>

        {/* Delete Trigger */}
        <button
          type="button"
          onClick={() => onDelete(habit)}
          className="habit-delete-btn"
          title="Delete Habit"
        >
          🗑️
        </button>

      </div>
    </motion.div>
  );
};
