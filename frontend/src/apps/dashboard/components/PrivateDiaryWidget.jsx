import React from 'react';
import { motion } from 'framer-motion';

/**
 * 📝 Workspace Notes & Thoughts Widget
 * 
 * Displays recent pinned workspace notes and strategy entries.
 */
export const PrivateDiaryWidget = ({ notes = [], loading = false, onNavigateMode }) => {
  return (
    <div className="dashboard-card widget-diary">
      {/* Header Row */}
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">
          <span>📝</span> Workspace Notes & Thoughts
        </h3>
        <button
          type="button"
          onClick={() => onNavigateMode?.('JOURNAL')}
          className="dashboard-card-link"
          style={{ color: '#F59E0B' }}
        >
          View All Notes ➔
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading notes...</div>
      ) : notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No workspace notes yet. Click "+ Quick Note" to log an idea or task!
        </div>
      ) : (
        <div className="dashboard-card-body">
          {notes.filter(n => n.title !== '__VAULT_VERIFIER__').slice(0, 3).map(n => (
            <motion.div
              key={n.id}
              whileHover={{ scale: 1.01 }}
              className="dashboard-card-item"
            >
              <div className="dashboard-card-item-left">
                <span style={{ fontSize: '1rem' }}>{n.pinned ? '📌' : '📝'}</span>
                <span className="dashboard-card-item-title">
                  {n.title || 'Untitled Note'}
                </span>
              </div>

              <div className="dashboard-card-item-right">
                <span className="dashboard-card-item-tag" style={{ color: '#F59E0B', background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                  {n.category || 'WORK'}
                </span>
                <span className="dashboard-card-item-badge">
                  Workspace Note
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
