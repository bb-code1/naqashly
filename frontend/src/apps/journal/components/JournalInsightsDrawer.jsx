import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/Button';

export const JournalInsightsDrawer = ({
  showInsightsDrawer,
  setShowInsightsDrawer,
  isVaultUnlocked,
  handleGenerateMnemonicSheet,
  googleDriveEmail,
  handleUploadBackupToGoogleDrive,
  handleConnectGoogleDrive,
  notes,
  moodOptions,
  setGoogleDriveEmail
}) => {
  return (
    <AnimatePresence>
      {showInsightsDrawer && (
        <>
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInsightsDrawer(false)}
            className="vault-modal-overlay"
            style={{ zIndex: 9998 }}
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="journal-insights-drawer"
          >
            {/* Drawer Header Controls */}
            <div className="journal-insights-header">
              <div>
                <h2 className="journal-insights-title">
                  🔑 Vault Tools & Telemetry
                </h2>
                <p className="journal-insights-desc">
                  Zero-Knowledge backup and encryption utilities.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInsightsDrawer(false)}
                className="journal-insights-close-btn"
              >
                ✕
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* 1. Mnemonic Recovery Management */}
              <div className="journal-insights-card">
                <h3 className="journal-insights-card-title">
                  📜 Emergency Recovery Phrase
                </h3>
                <p className="journal-insights-card-desc">
                  Generate or restore a BIP-39 mnemonic recovery key. Store this safely to recover your encrypted entries if you forget your passphrase.
                </p>
                
                {isVaultUnlocked ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <Button variant="emerald" onClick={handleGenerateMnemonicSheet} style={{ fontSize: '0.8rem' }}>
                      📄 Generate 24-Word Mnemonic
                    </Button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-danger)', fontWeight: '700', textAlign: 'center', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px' }}>
                    🔒 Unlock private vault to manage emergency recovery phrase keys.
                  </div>
                )}
              </div>

              {/* 2. Google Drive Cloud Vault Backups */}
              <div className="journal-insights-card">
                <h3 className="journal-insights-card-title">
                  ☁️ Google Drive Cloud Vault
                </h3>
                <p className="journal-insights-card-desc">
                  Securely backup your encrypted diary log directly to your own Google Drive.
                </p>
                
                {googleDriveEmail ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: '700', padding: '0.4rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.15)', textAlign: 'center' }}>
                      Connected: {googleDriveEmail}
                    </div>
                    <Button variant="emerald" onClick={handleUploadBackupToGoogleDrive} style={{ fontSize: '0.8rem' }}>
                      📤 Push Encrypted Backup
                    </Button>
                    <Button variant="subtle" onClick={() => {
                      localStorage.removeItem('google_drive_access_token');
                      localStorage.removeItem('google_drive_connected_email');
                      setGoogleDriveEmail(null);
                    }} style={{ fontSize: '0.75rem' }}>
                      Disconnect Storage Account
                    </Button>
                  </div>
                ) : (
                  <Button variant="emerald" onClick={handleConnectGoogleDrive} style={{ fontSize: '0.8rem' }}>
                    🔗 Connect Google Drive
                  </Button>
                )}
              </div>

              {/* 3. Decrypted Status & Mood Statistics */}
              <div className="journal-insights-card">
                <h3 className="journal-insights-card-title" style={{ margin: '0 0 1rem 0' }}>
                  📊 Mood Distribution
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {moodOptions.map(mood => {
                    const count = notes.filter(n => n.mood === mood.id).length;
                    const pct = notes.length > 0 ? (count / notes.length) * 100 : 0;
                    return (
                      <div key={mood.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '700' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{mood.emoji} {mood.label}</span>
                          <span style={{ color: 'var(--text-heading)' }}>{count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#EC4899' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
