import React from 'react';
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
  googleDriveEmail = null,
  onOpenNewEntry,
  onOpenInsights,
  onLockVault,
  onConnectDrive
}) => {
  return (
    <div className="journal-header" style={{ padding: '1rem 1.25rem', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#EC4899', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Mind OS</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0, letterSpacing: '-0.02em' }}>Zen Workspace</h2>
        </div>

        {/* Compact Right Actions */}
        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
          {isVaultUnlocked && (
            <button
              onClick={onLockVault}
              style={{ background: 'rgba(239, 68, 68, 0.12)', border: 'none', color: '#EF4444', padding: '0.4rem 0.65rem', borderRadius: '8px', fontSize: '0.74rem', fontWeight: '800', cursor: 'pointer' }}
              title="Lock Session"
            >
              🔒 Lock
            </button>
          )}
          
          <button
            onClick={onOpenInsights}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Vault Tools & Telemetry"
          >
            ⚙️
          </button>

          <Button
            variant="emerald"
            onClick={onOpenNewEntry}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: '800' }}
          >
            ➕ Note
          </Button>
        </div>
      </div>

      {/* Decluttered Sub-bar line for Stats */}
      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '800', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.55rem', marginTop: '0.2rem', alignItems: 'center' }}>
        <span>🌐 {notesCount} Notes</span>
        <span>•</span>
        <span style={{ color: vaultCount > 0 ? '#EF4444' : 'inherit' }}>🔒 {vaultCount} Encrypted</span>
        <span>•</span>
        <span style={{ color: pinnedCount > 0 ? '#38BDF8' : 'inherit' }}>📌 {pinnedCount} Pinned</span>
        <span>•</span>
        {googleDriveEmail ? (
          <span style={{ color: '#10B981', cursor: 'pointer' }} onClick={onConnectDrive}>🟢 Sync Active</span>
        ) : (
          <span style={{ color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }} onClick={onConnectDrive}>⚫ Sync Drive</span>
        )}
      </div>
    </div>
  );
};
