import React from 'react';
import { motion } from 'framer-motion';

/**
 * 📊 Executive Metrics Bar Component
 * 
 * Displays 4 glassmorphic high-level metric cards:
 * 1. 🌿 Habit Progress
 * 2. 🏦 Net Financial Balance
 * 3. 🎯 Active Focus Goals
 * 4. 📖 Private Diary Notes
 */
export const ExecutiveMetricsBar = ({
  routinePct = 0,
  completedHabitsCount = 0,
  totalHabitsCount = 0,
  netBalance = 0,
  goalsCount = 0,
  notesCount = 0,
  onNavigateMode
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="executive-metrics-bar"
    >
      {/* METRIC 1: 🌿 HABIT PROGRESS */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onNavigateMode?.('ROUTINE')}
        className="metric-card"
      >
        <div>
          <div className="metric-card-category">
            🌿 Habit Progress
          </div>
          <div className="metric-card-value" style={{ color: '#10B981' }}>
            {routinePct}%
          </div>
          <div className="metric-card-subtext" style={{ color: 'var(--text-muted)' }}>
            {completedHabitsCount} of {totalHabitsCount} Completed Today
          </div>
        </div>
        <div className="metric-card-icon">🌿</div>
      </motion.div>

      {/* METRIC 2: 🏦 NET FINANCIAL STANDING */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onNavigateMode?.('FINANCE')}
        className="metric-card"
      >
        <div>
          <div className="metric-card-category">
            🏦 Net Balance
          </div>
          <div className="metric-card-value" style={{ color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
            ₹{netBalance.toLocaleString()}
          </div>
          <div className="metric-card-subtext" style={{ color: '#10B981', fontWeight: '700' }}>
            ✓ Running Net Balance
          </div>
        </div>
        <div className="metric-card-icon">🏦</div>
      </motion.div>

      {/* METRIC 3: 🎯 FOCUS GOALS */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onNavigateMode?.('PRODUCTIVITY')}
        className="metric-card"
      >
        <div>
          <div className="metric-card-category">
            🎯 Focus Goals
          </div>
          <div className="metric-card-value" style={{ color: '#EC4899' }}>
            {goalsCount} Active
          </div>
          <div className="metric-card-subtext" style={{ color: 'var(--text-muted)' }}>
            Milestones in Progress
          </div>
        </div>
        <div className="metric-card-icon">🎯</div>
      </motion.div>

      {/* METRIC 4: 📖 PRIVATE DIARY */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onNavigateMode?.('JOURNAL')}
        className="metric-card"
      >
        <div>
          <div className="metric-card-category">
            📖 Private Diary
          </div>
          <div className="metric-card-value" style={{ color: '#F59E0B' }}>
            {notesCount} Notes
          </div>
          <div className="metric-card-subtext" style={{ color: '#EC4899', fontWeight: '700' }}>
            🔒 100% Encrypted
          </div>
        </div>
        <div className="metric-card-icon">📖</div>
      </motion.div>
    </motion.div>
  );
};
