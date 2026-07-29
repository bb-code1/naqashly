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
        <div className="vault-modal-overlay">
          <form onSubmit={handleUnlockMasterVault} className={`vault-modal-content ${recoveryMode ? 'success-border' : 'error-border'}`}>
            <div style={{ fontSize: '3rem' }}>{recoveryMode ? '📜 🔑' : '🔒 🔑'}</div>
            <div>
              <h3 className="vault-modal-title" style={{ color: '#EF4444' }}>
                {recoveryMode ? 'BIP-39 24-Word Recovery' : 'Private Vault Locked'}
              </h3>
              <p className="vault-modal-desc">
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
                className="vault-modal-input"
                autoFocus
                required
              />
            ) : (
              <textarea
                placeholder="Enter 24 recovery words (e.g. apple horizon river quantum shadow forest...)..."
                value={recoveryWordsInput}
                onChange={e => setRecoveryWordsInput(e.target.value)}
                rows={4}
                className="vault-modal-textarea"
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
        <div className="vault-modal-overlay">
          <div className="vault-modal-content success-border">
            <div style={{ fontSize: '2.5rem' }}>📜 🛡️</div>
            <div>
              <h3 className="vault-modal-title" style={{ color: '#10B981' }}>
                BIP-39 24-Word Emergency Recovery Sheet
              </h3>
              <p className="vault-modal-desc">
                Keep these 24 words in a safe offline location. Entering these 24 words will restore access to your private vault anytime.
              </p>
            </div>

            <div className="vault-mnemonic-grid">
              {generatedMnemonic.map((w, idx) => (
                <div key={idx} className="vault-mnemonic-word">
                  <span className="vault-mnemonic-index">{(idx + 1).toString().padStart(2, '0')}.</span>
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
