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
      style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(56, 189, 248, 0.1) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '22px',
        padding: '1.75rem 2rem',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
      }}
    >
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.25rem' }}>
          🌿 PERSONAL EXECUTIVE LAUNCHPAD
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{getGreetingTime()}, {userName}</span>
          <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ display: 'inline-block' }}>
            👋
          </motion.span>
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0 0 0' }}>
          📅 {todayStr} • Instant Action Shortcuts for Routines, Ledger, Goals & Private Diary.
        </p>
      </div>

      {/* 5 INSTANT ACTION SHORTCUT TRIPPERS */}
      <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button
            variant="emerald"
            onClick={onOpenQuickHabit}
            style={{ padding: '0.6rem 0.95rem', fontSize: '0.82rem', fontWeight: '800' }}
          >
            🌿 + Habit
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button
            variant="secondary"
            onClick={onOpenQuickMoney}
            style={{ padding: '0.6rem 0.95rem', fontSize: '0.82rem', fontWeight: '800', borderColor: '#38BDF8', color: '#38BDF8' }}
          >
            💸 + Log Expense
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button
            variant="secondary"
            onClick={onOpenQuickGoal}
            style={{ padding: '0.6rem 0.95rem', fontSize: '0.82rem', fontWeight: '800', borderColor: '#EC4899', color: '#EC4899' }}
          >
            🎯 + Add Goal
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button
            variant="secondary"
            onClick={onOpenQuickDiary}
            style={{ padding: '0.6rem 0.95rem', fontSize: '0.82rem', fontWeight: '800', borderColor: '#F59E0B', color: '#F59E0B' }}
          >
            📝 + Quick Note
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button
            variant="secondary"
            onClick={onOpenFocusTimer}
            style={{ padding: '0.6rem 0.95rem', fontSize: '0.82rem', fontWeight: '800', borderColor: '#10B981', color: '#10B981' }}
          >
            ⏱️ Focus Session
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
