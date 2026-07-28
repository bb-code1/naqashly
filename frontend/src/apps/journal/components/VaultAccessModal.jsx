import React from 'react';
import { Button } from '../../../components/ui/Button';

export const VaultAccessModal = ({
  showUnlockModal,
  setShowUnlockModal,
  recoveryMode,
  setRecoveryMode,
  masterVaultPassphrase,
  setMasterVaultPassphrase,
  recoveryWordsInput,
  setRecoveryWordsInput,
  handleUnlockMasterVault,
  showMnemonicSheet,
  setShowMnemonicSheet,
  generatedMnemonic,
  handleCopyMnemonic,
  handleDownloadMnemonicSheet,
  setActiveSubTab
}) => {
  return (
    <>
      {/* 🔒 PASSPHRASE POPUP CHALLENGE MODAL */}
      {showUnlockModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handleUnlockMasterVault} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '22px', padding: '2rem', width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '1.15rem', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '3rem' }}>{recoveryMode ? '📜 🔑' : '🔒 🔑'}</div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#EF4444', margin: '0 0 0.35rem 0' }}>
                {recoveryMode ? 'BIP-39 24-Word Recovery' : 'Private Vault Locked'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {recoveryMode
                  ? 'Enter your 24-word emergency recovery phrase to derive your key and unlock your vault.'
                  : 'Enter your Master Passphrase to unlock your zero-knowledge private entries.'}
              </p>
            </div>

            {!recoveryMode ? (
              <input
                type="password"
                placeholder="Enter Master Vault Passphrase..."
                value={masterVaultPassphrase}
                onChange={e => setMasterVaultPassphrase(e.target.value)}
                style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '10px', fontSize: '0.92rem', outline: 'none', textAlign: 'center', fontWeight: '800' }}
                autoFocus
                required
              />
            ) : (
              <textarea
                placeholder="Enter 24 recovery words (e.g. apple horizon river quantum shadow forest...)..."
                value={recoveryWordsInput}
                onChange={e => setRecoveryWordsInput(e.target.value)}
                rows={4}
                style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: '#10B981', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', fontWeight: '700', fontFamily: 'monospace' }}
                autoFocus
                required
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.25rem 0' }}>
              <button
                type="button"
                onClick={() => setRecoveryMode(!recoveryMode)}
                style={{ background: 'transparent', border: 'none', color: '#38BDF8', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {recoveryMode ? '🔑 Use Passphrase Instead' : '🆘 Forgot Passphrase? Use 24-Word Recovery Phrase'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button type="button" variant="subtle" onClick={() => { setShowUnlockModal(false); setActiveSubTab('NOTES'); }} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button type="submit" variant="emerald" style={{ flex: 1 }}>
                {recoveryMode ? '📜 Recover Vault' : '🔑 Unlock Vault'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 📄 24-WORD RECOVERY SHEET MODAL */}
      {showMnemonicSheet && generatedMnemonic && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '22px', padding: '2rem', width: '100%', maxWidth: '540px', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>📜 🛡️</div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#10B981', margin: '0 0 0.35rem 0' }}>
                BIP-39 24-Word Emergency Recovery Sheet
              </h3>
              <p style={{ fontSize: '0.8.rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                Keep these 24 words in a safe offline location. Entering these 24 words will restore access to your private vault anytime.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'left' }}>
              {generatedMnemonic.map((w, idx) => (
                <div key={idx} style={{ fontSize: '0.78rem', color: '#38BDF8', fontFamily: 'monospace', fontWeight: '800' }}>
                  <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>{(idx + 1).toString().padStart(2, '0')}.</span>
                  {w}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <Button type="button" variant="emerald" onClick={handleCopyMnemonic} style={{ flex: 1 }}>
                📋 Copy Words
              </Button>
              <Button type="button" variant="pink" onClick={handleDownloadMnemonicSheet} style={{ flex: 1 }}>
                📥 Download Sheet (.txt)
              </Button>
              <Button type="button" variant="subtle" onClick={() => setShowMnemonicSheet(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
