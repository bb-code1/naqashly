import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/Button';

/**
 * 👑 Executive Dashboard Header Component
 * 
 * Features:
 * - Dynamic personalized greeting ("Good Afternoon, Barkat 👋")
 * - Live current date string (e.g. "Sunday, July 26, 2026")
 * - 5 Instant Action Modal Shortcut Triggers (+ Habit, + Money, + Goal, + Diary, ⏱️ Focus Session)
 */
export const ExecutiveHeader = ({
  userName = 'Executive',
  onOpenQuickHabit,
  onOpenQuickMoney,
  onOpenQuickGoal,
  onOpenQuickDiary,
  onOpenFocusTimer
}) => {
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="executive-header-card"
    >
      <div>
        <div className="executive-header-title">
          🌿 PERSONAL EXECUTIVE LAUNCHPAD
        </div>
        <h1 className="executive-header-h1">
          <span>{getGreetingTime()}, {userName}</span>
          <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ display: 'inline-block' }}>
            👋
          </motion.span>
        </h1>
        <p className="executive-header-p">
          📅 {todayStr} • Instant Action Shortcuts for Routines, Ledger, Goals & Private Diary.
        </p>
      </div>

      {/* 5 INSTANT ACTION SHORTCUT TRIPPERS */}
      <div className="executive-header-shortcuts">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button
            variant="emerald"
            onClick={onOpenQuickHabit}
          >
            🌿 + Habit
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button
            variant="secondary"
            onClick={onOpenQuickMoney}
            style={{ borderColor: '#38BDF8', color: '#38BDF8' }}
          >
            💸 + Log Expense
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button
            variant="secondary"
            onClick={onOpenQuickGoal}
            style={{ borderColor: '#EC4899', color: '#EC4899' }}
          >
            🎯 + Add Goal
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button
            variant="secondary"
            onClick={onOpenQuickDiary}
            style={{ borderColor: '#F59E0B', color: '#F59E0B' }}
          >
            📝 + Quick Note
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button
            variant="secondary"
            onClick={onOpenFocusTimer}
            style={{ borderColor: '#10B981', color: '#10B981' }}
          >
            ⏱️ Focus Session
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
