import React from 'react';
import { motion } from 'framer-motion';

/**
 * 🤖 AI Personal Accountability Companion Nudge Card
 * 
 * Provides intelligent, real-time executive feedback based on routine execution,
 * financial standings, and reflection logs.
 */
export const AiAdvisorNudge = ({ routinePct = 0, netBalance = 0, topBlocker }) => {
  const getNudgeMessage = () => {
    if (topBlocker) {
      return `💡 AI Executive Nudge: Today's top blocker was "${topBlocker}". Start a 15-minute Focus Session on your anchor habit to rebuild momentum!`;
    }
    if (routinePct === 100) {
      return `🏆 AI Executive Nudge: Outstanding work! All daily habits completed for today. Time for evening reflection in your Private Diary.`;
    }
    if (routinePct > 50) {
      return `🌿 AI Executive Nudge: Strong execution today (${routinePct}% complete)! You are 1 habit away from leveling up your daily consistency score.`;
    }
    return `⚡ AI Executive Nudge: Routine completion is currently at ${routinePct}%. Pick 1 quick habit to check off now!`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '1rem 1.4rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.9rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ fontSize: '1.6rem' }}>🤖</div>
      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-heading)', lineHeight: '1.4' }}>
        {getNudgeMessage()}
      </div>
    </motion.div>
  );
};
