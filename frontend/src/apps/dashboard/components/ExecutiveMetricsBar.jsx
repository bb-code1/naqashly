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
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem'
      }}
    >
      {/* METRIC 1: 🌿 HABIT PROGRESS */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.02 }}
        onClick={() => onNavigateMode?.('ROUTINE')}
        style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.25rem',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🌿 Habit Progress
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#10B981', marginTop: '0.2rem' }}>
            {routinePct}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {completedHabitsCount} of {totalHabitsCount} Completed Today
          </div>
        </div>
        <div style={{ fontSize: '2.2rem' }}>🌿</div>
      </motion.div>

      {/* METRIC 2: 🏦 NET FINANCIAL STANDING */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.02 }}
        onClick={() => onNavigateMode?.('FINANCE')}
        style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.25rem',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🏦 Net Ledger Balance
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#38BDF8', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
            ₹{netBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '700', marginTop: '0.15rem' }}>
            ✓ Running Net Balance
          </div>
        </div>
        <div style={{ fontSize: '2.2rem' }}>🏦</div>
      </motion.div>

      {/* METRIC 3: 🎯 FOCUS GOALS */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.02 }}
        onClick={() => onNavigateMode?.('PRODUCTIVITY')}
        style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.25rem',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🎯 Focus Goals
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#EC4899', marginTop: '0.2rem' }}>
            {goalsCount} Active
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Milestones in Progress
          </div>
        </div>
        <div style={{ fontSize: '2.2rem' }}>🎯</div>
      </motion.div>

      {/* METRIC 4: 📖 PRIVATE DIARY */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.02 }}
        onClick={() => onNavigateMode?.('JOURNAL')}
        style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.25rem',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            📖 Private Diary
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#F59E0B', marginTop: '0.2rem' }}>
            {notesCount} Notes
          </div>
          <div style={{ fontSize: '0.72rem', color: '#EC4899', fontWeight: '700', marginTop: '0.15rem' }}>
            🔒 100% Encrypted
          </div>
        </div>
        <div style={{ fontSize: '2.2rem' }}>📖</div>
      </motion.div>
    </motion.div>
  );
};
