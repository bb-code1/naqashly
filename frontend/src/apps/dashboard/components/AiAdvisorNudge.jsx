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
      style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(56, 189, 248, 0.08) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '18px',
        padding: '1.1rem 1.5rem',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
        
        {/* Naqash Avatar Badge */}
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #10B981 0%, #38BDF8 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          fontSize: '1.4rem',
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)',
          flexShrink: 0
        }}>
          🤖
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-heading)', letterSpacing: '-0.01em' }}>
              Naqash
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: '800', background: 'rgba(16, 185, 129, 0.15)', padding: '0.1rem 0.45rem', borderRadius: '6px' }}>
              Chief of Staff
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-heading)', fontWeight: '600', lineHeight: 1.45 }}>
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
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--accent-emerald)',
            color: 'var(--accent-emerald)',
            padding: '0.5rem 0.95rem',
            borderRadius: '10px',
            fontSize: '0.8rem',
            fontWeight: '800',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
            transition: 'all 0.2s ease'
          }}
        >
          {nudge.actionText} →
        </motion.button>
      )}

    </motion.div>
  );
};
