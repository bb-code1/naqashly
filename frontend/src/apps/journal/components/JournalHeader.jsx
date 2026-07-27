import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/Button';

/**
 * 📝 Journal Header Component
 * Part of the Executive Mind OS & Private Diary.
 */
export const JournalHeader = ({
  notesCount = 0,
  vaultCount = 0,
  pinnedCount = 0,
  isVaultUnlocked = false,
  onOpenNewEntry,
  onOpenInsights,
  onLockVault
}) => {
  return (
    <div style={{
      background: 'var(--bg-surface-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '20px',
      padding: '1.25rem 1.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      marginBottom: '1.5rem'
    }}>
      {/* Top Banner Row: Title + Stats Pills + Action Suite */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#EC4899', letterSpacing: '1px', textTransform: 'uppercase' }}>
            📖 EXECUTIVE MIND OS & PRIVATE DIARY
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-heading)', margin: '0.15rem 0 0 0', letterSpacing: '-0.02em' }}>
            Zen Workspace & Vault
          </h2>
        </div>

        {/* Stats Snapshot Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}>
            🌐 Notes: <span style={{ color: '#10B981' }}>{notesCount}</span>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}>
            🔒 Private Vault: <span style={{ color: '#EF4444' }}>{vaultCount}</span>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}>
            📌 Pinned: <span style={{ color: '#38BDF8' }}>{pinnedCount}</span>
          </div>
        </div>

        {/* Action Controls Suite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {isVaultUnlocked && (
            <Button variant="outline" onClick={onLockVault} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderColor: '#EF4444', color: '#EF4444' }}>
              🔒 Lock Vault
            </Button>
          )}

          <Button variant="emerald" onClick={onOpenNewEntry} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
            📝 + New Entry
          </Button>

          <Button variant="outline" onClick={onOpenInsights} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderColor: '#EC4899', color: '#EC4899' }}>
            ⚙️ Vault Tools
          </Button>
        </div>

      </div>
    </div>
  );
};
