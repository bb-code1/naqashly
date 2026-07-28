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
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998
            }}
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100%',
              maxWidth: '520px',
              height: '100vh',
              background: 'rgba(15, 15, 20, 0.95)',
              backdropFilter: 'blur(24px)',
              borderLeft: '1px solid var(--border-subtle)',
              boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.6)',
              zIndex: 9999,
              padding: '1.5rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              boxSizing: 'border-box'
            }}
          >
            {/* Drawer Header Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>
                  🔑 Vault Tools & Telemetry
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Zero-Knowledge backup and encryption utilities.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInsightsDrawer(false)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-heading)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                ✕
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* 1. Mnemonic Recovery Management */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '1.25rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  📜 Emergency Recovery Phrase
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
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
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '1.25rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  ☁️ Google Drive Cloud Vault
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
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
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '1.25rem', borderRadius: '14px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-heading)', margin: '0 0 1rem 0' }}>
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
