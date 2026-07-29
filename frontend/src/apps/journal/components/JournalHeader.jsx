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
    <div className="journal-header">
      {/* Top Banner Row: Title + Stats Pills + Action Suite */}
      <div className="journal-header-top">
        
        <div>
          <div className="journal-header-title-pre">
            📖 EXECUTIVE MIND OS & PRIVATE DIARY
          </div>
          <h2 className="journal-header-title-h2">
            Zen Workspace & Vault
          </h2>
        </div>

        {/* Stats Snapshot Pills */}
        <div className="journal-header-stats">
          <div className="journal-stat-pill">
            🌐 Notes: <span style={{ color: '#10B981' }}>{notesCount}</span>
          </div>

          <div className="journal-stat-pill">
            🔒 Private Vault: <span style={{ color: '#EF4444' }}>{vaultCount}</span>
          </div>

          <div className="journal-stat-pill">
            📌 Pinned: <span style={{ color: '#38BDF8' }}>{pinnedCount}</span>
          </div>
        </div>

        {/* Action Controls Suite */}
        <div className="journal-header-actions">
          {isVaultUnlocked && (
            <Button
              variant="outline"
              onClick={onLockVault}
              style={{ borderColor: '#EF4444', color: '#EF4444' }}
            >
              🔒 Lock Vault
            </Button>
          )}

          <Button variant="emerald" onClick={onOpenNewEntry}>
            📝 + New Entry
          </Button>

          <Button
            variant="outline"
            onClick={onOpenInsights}
            style={{ borderColor: '#EC4899', color: '#EC4899' }}
          >
            ⚙️ Vault Tools
          </Button>
        </div>

      </div>
    </div>
  );
};
