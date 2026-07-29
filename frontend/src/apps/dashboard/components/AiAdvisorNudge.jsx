import React from 'react';
import { motion } from 'framer-motion';

/**
 * 🤖 Naqash - Personal Life OS Companion & Chief of Staff
 * 
 * Provides intelligent, time-aware, personalized executive guidance across
 * habits, ledgers, goals, and reflections.
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
export const AiAdvisorNudge = ({ userName = 'Executive', routinePct = 0, netBalance = 0, topBlocker, onNavigateMode }) => {
  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 18) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };

  const getNudgeDetails = () => {
    if (topBlocker) {
      return {
        message: `Today's top blocker was "${topBlocker}". Start a 15-minute Focus Session on your anchor habit to rebuild momentum!`,
        actionText: '🎯 Start Focus Session',
        targetMode: 'PRODUCTIVITY'
      };
    }
    if (routinePct === 100) {
      return {
        message: `Outstanding work today! All daily habits completed (${routinePct}%). Time to log your evening reflection in your Private Diary.`,
        actionText: '📖 Write Reflection',
        targetMode: 'JOURNAL'
      };
    }
    if (routinePct > 50) {
      return {
        message: `Strong execution today (${routinePct}% complete)! You are 1 habit away from leveling up your daily consistency score.`,
        actionText: '🌿 Complete Next Habit',
        targetMode: 'ROUTINE'
      };
    }
    return {
      message: `Routine completion is currently at ${routinePct}%. Pick 1 quick habit to check off now and build momentum!`,
      actionText: '🌿 View Habits',
      targetMode: 'ROUTINE'
    };
  };

  const greeting = getTimeOfDayGreeting();
  const nudge = getNudgeDetails();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="ai-advisor-nudge"
    >
      <div className="nudge-avatar-container">
        
        {/* Naqash Avatar Badge */}
        <div className="nudge-avatar-badge">
          🤖
        </div>

        <div>
          <div className="nudge-name-row">
            <span className="nudge-name-label">
              Naqash
            </span>
            <span className="nudge-title-badge">
              Chief of Staff
            </span>
          </div>

          <div className="nudge-message-body">
            <strong style={{ color: 'var(--accent-emerald)' }}>{greeting}, {userName}!</strong> {nudge.message}
          </div>
        </div>

      </div>

      {/* 1-Click Interactive CTA Button */}
      {nudge.actionText && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onNavigateMode?.(nudge.targetMode)}
          className="nudge-cta-button"
        >
          {nudge.actionText} →
        </motion.button>
      )}

    </motion.div>
  );
};
