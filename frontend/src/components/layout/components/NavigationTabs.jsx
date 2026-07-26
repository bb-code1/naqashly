import React from 'react';
import { motion } from 'framer-motion';

/**
 * 🧭 Domain Navigation Tabs Component
 * 
 * Renders 5 workspace domain tab pills with sliding spring active indicator:
 * 1. ⚡ Dashboard (ALL)
 * 2. 🌿 Routines (ROUTINE)
 * 3. 🏦 Ledger (FINANCE)
 * 4. 🎯 Goals (PRODUCTIVITY)
 * 5. 📖 Private Diary (JOURNAL)
 */
export const NavigationTabs = ({ activeMode, onSelectMode }) => {
  const NAV_TABS = [
    { key: 'ALL', label: 'Dashboard', icon: '⚡' },
    { key: 'ROUTINE', label: 'Routines', icon: '🌿' },
    { key: 'FINANCE', label: 'Ledger', icon: '🏦' },
    { key: 'PRODUCTIVITY', label: 'Goals', icon: '🎯' },
    { key: 'JOURNAL', label: 'Private Diary', icon: '📖' }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '0.45rem',
      background: 'var(--bg-surface)',
      padding: '0.3rem',
      borderRadius: '14px',
      border: '1px solid var(--border-subtle)',
      flexWrap: 'wrap'
    }}>
      {NAV_TABS.map(tab => {
        const isActive = activeMode === tab.key;
        return (
          <motion.button
            key={tab.key}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectMode?.(tab.key)}
            style={{
              position: 'relative',
              background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
              color: isActive ? 'var(--accent-emerald)' : 'var(--text-muted)',
              border: `1px solid ${isActive ? 'var(--accent-emerald)' : 'transparent'}`,
              borderRadius: '10px',
              padding: '0.48rem 0.9rem',
              fontSize: '0.82rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease',
              boxShadow: isActive ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {isActive && (
              <motion.span
                layoutId="topBarActiveTab"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '9px',
                  border: '2px solid #10B981',
                  pointerEvents: 'none'
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
