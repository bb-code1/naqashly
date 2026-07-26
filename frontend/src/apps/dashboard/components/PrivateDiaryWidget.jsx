import React from 'react';
import { motion } from 'framer-motion';

/**
 * 📖 Private Diary Reflections Widget
 * 
 * Displays recent encrypted notes, pinned journal entries, and privacy badges.
 */
export const PrivateDiaryWidget = ({ notes = [], loading = false, onNavigateMode }) => {
  return (
    <div style={{
      background: 'var(--bg-surface-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '20px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.1rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📖</span> Private Diary Reflections
        </h3>
        <button
          type="button"
          onClick={() => onNavigateMode?.('JOURNAL')}
          style={{ background: 'transparent', border: 'none', color: '#F59E0B', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
        >
          Open Private Diary ➔
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading diary notes...</div>
      ) : notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No notes written yet. Click "+ New Diary Note" to capture your thoughts!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {notes.slice(0, 3).map(n => (
            <motion.div
              key={n.id}
              whileHover={{ scale: 1.01 }}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '0.8rem 1rem',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1rem' }}>{n.pinned ? '📌' : '📝'}</span>
                <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)' }}>
                  {n.title || 'Untitled Entry'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.7rem',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#F59E0B',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  fontWeight: '800'
                }}>
                  {n.category || 'REFLECTION'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  🔒 Encrypted
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
