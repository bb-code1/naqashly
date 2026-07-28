import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/Button';

export const LandingPrivacyTermsModals = ({
  isPrivacyModalOpen,
  setIsPrivacyModalOpen,
  isTermsModalOpen,
  setIsTermsModalOpen
}) => {
  return (
    <>
      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {isPrivacyModalOpen && (
          <div className="modal-overlay" style={{ zIndex: 1000 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog wallet-modal" style={{ maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <div>
                  <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🔒 Privacy Policy & Data Collection
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Last updated: July 2026</p>
                </div>
                <button type="button" onClick={() => setIsPrivacyModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                
                {/* HIGHLIGHTED BOX: WHAT WE COLLECT */}
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '1.25rem' }}>
                  <div style={{ color: '#10B981', fontWeight: '800', fontSize: '0.98rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    ✅ WHAT WE COLLECT
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>
                      <strong style={{ color: 'var(--text-heading)' }}>Account Basics:</strong> Your email address and hashed password to securely authenticate your workspace.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-heading)' }}>Workspace Items:</strong> Habits, routines, contact balance ledgers, target category budgets, and goal progress sliders created inside your workspace.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-heading)' }}>Encrypted Diary Entries:</strong> Private diary notes and reflections, which are hardware-encrypted in your browser using AES-256-GCM before saving to your isolated database schema.
                    </li>
                  </ul>
                </div>

                {/* HIGHLIGHTED BOX: WHAT WE NEVER COLLECT */}
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '14px', padding: '1.25rem' }}>
                  <div style={{ color: '#EF4444', fontWeight: '800', fontSize: '0.98rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    ❌ WHAT WE NEVER COLLECT OR DO
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>
                      <strong style={{ color: 'var(--text-heading)' }}>NO Third-Party Cookies or Ad Trackers:</strong> We do not use Google Analytics, Facebook Pixels, or any ad tracking scripts.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-heading)' }}>NO Selling of Personal Data:</strong> Your routines, financial ledgers, and notes are NEVER sold, rented, or monetized.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-heading)' }}>NO Plaintext Diary Reading:</strong> We cannot read your client-side encrypted diary notes. Only you hold the decryption key.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-heading)', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    🛡️ Security & Encryption Architecture
                  </h4>
                  <p>
                    All API communication passes through secure HTTPS TLS 1.3 encryption with RS256 token authentication. Each user's data is isolated in dedicated PostgreSQL schemas.
                  </p>
                </div>

                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                  <Button variant="emerald" onClick={() => setIsPrivacyModalOpen(false)}>
                    I Understand →
                  </Button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Terms & Conditions Modal */}
      <AnimatePresence>
        {isTermsModalOpen && (
          <div className="modal-overlay" style={{ zIndex: 1000 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog wallet-modal" style={{ maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <div>
                  <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📜 Terms & Conditions of Service
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Last updated: July 2026</p>
                </div>
                <button type="button" onClick={() => setIsTermsModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                
                <div>
                  <h4 style={{ color: 'var(--text-heading)', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    1. 100% User Data Ownership
                  </h4>
                  <p>
                    You retain complete, exclusive ownership of all habits, routines, ledger transactions, goals, and diary notes created in Naqashly.
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-heading)', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    2. Zero Lock-In & Export Rights
                  </h4>
                  <p>
                    You have the right to export all your financial statements and routine reports anytime into formatted Excel (.xls) or JSON files with 1 click.
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-heading)', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    3. Account Security Responsibility
                  </h4>
                  <p>
                    You are responsible for keeping your login credentials and BIP-39 24-word recovery sheet secure. Because your diary is encrypted client-side, lost master keys cannot be recovered by server administrators.
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-heading)', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    4. Service Availability & Free Tier
                  </h4>
                  <p>
                    Naqashly is provided free for personal productivity and financial tracking with zero hidden fees or automatic recurring credit card charges.
                  </p>
                </div>

                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                  <Button variant="indigo" onClick={() => setIsTermsModalOpen(false)}>
                    Accept & Close →
                  </Button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
