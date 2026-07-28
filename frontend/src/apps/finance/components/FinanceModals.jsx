import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/Button';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { TRANSACTION_TYPES } from '../../../constants/financeConstants';

export const FinanceModals = ({
  editingTx,
  setEditingTx,
  editTxAmount,
  setEditTxAmount,
  editTxType,
  setEditTxType,
  editTxCategory,
  setEditTxCategory,
  editTxDescription,
  setEditTxDescription,
  categories,
  requestTxDelete,
  handleEditTxSubmit,

  isCategoryModalOpen,
  setIsCategoryModalOpen,
  newCatName,
  setNewCatName,
  newCatIcon,
  setNewCatIcon,
  newCatBudget,
  setNewCatBudget,
  newCatType,
  setNewCatType,
  newCatColor,
  setNewCatColor,
  handleCreateCategorySubmit,

  confirmConfig,
  setConfirmConfig,

  isTxModalOpen,
  setIsTxModalOpen,
  txType,
  setTxType,
  txAmount,
  setTxAmount,
  category,
  setCategory,
  noteContent,
  setNoteContent,
  handleTxSubmit,
  liveFormOverBudgetWarning,

  editingRecord,
  setEditingRecord,
  editAmount,
  setEditAmount,
  editType,
  setEditType,
  editNotes,
  setEditNotes,
  requestSingleDelete,
  handleEditSubmit
}) => {
  return (
    <>
      {/* 1. TRANSACTION INSPECTION & EDIT/DELETE MODAL */}
      <AnimatePresence>
        {editingTx && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog tx-modal">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">🏦 Transaction Inspection & Edit</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Record #{editingTx.id} • Wallet Reference: #{editingTx.walletId}
                  </p>
                </div>
                <button type="button" onClick={() => setEditingTx(null)} className="modal-close-btn">✕</button>
              </div>

              <form onSubmit={handleEditTxSubmit} className="modal-form">
                
                <div className="form-grid-2">
                  <div>
                    <label className="form-label">Transaction Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editTxAmount}
                      onChange={e => setEditTxAmount(e.target.value)}
                      className="form-input"
                      style={{ fontFamily: 'var(--font-mono)' }}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Type</label>
                    <select value={editTxType} onChange={e => setEditTxType(e.target.value)} className="form-select">
                      <option value="EXPENSE">🔴 Expense (Debit Outflow)</option>
                      <option value="INCOME">🟢 Income (Credit Inflow)</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="form-label">Category</label>
                    <select value={editTxCategory} onChange={e => setEditTxCategory(e.target.value)} className="form-select">
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Note & Context</label>
                    <input
                      type="text"
                      value={editTxDescription}
                      onChange={e => setEditTxDescription(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-actions" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
                  <Button type="button" variant="danger" onClick={() => requestTxDelete(editingTx.id)}>
                    🗑️ Delete Record
                  </Button>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button type="button" variant="secondary" onClick={() => setEditingTx(null)}>Close</Button>
                    <Button type="submit" variant="emerald">✏️ Save & Update Entry →</Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. CREATE CUSTOM CATEGORY MODAL */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog category-modal">
              <div className="modal-header">
                <div>
                   <h3 className="modal-title">➕ Create Custom Category</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Persists custom category & monthly target budget in database.</p>
                </div>
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              <form onSubmit={handleCreateCategorySubmit} className="modal-form">
                <div>
                  <label className="form-label">Category Name</label>
                  <input type="text" placeholder="e.g. Gym & Fitness, Cloud Servers" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="form-input" required />
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="form-label">Icon Emoji</label>
                    <input type="text" placeholder="🏋️" value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} className="form-input" />
                  </div>

                  <div>
                    <label className="form-label">Monthly Target Budget (₹)</label>
                    <input type="number" placeholder="10000" value={newCatBudget} onChange={e => setNewCatBudget(e.target.value)} className="form-input" style={{ fontFamily: 'var(--font-mono)' }} required />
                  </div>
                </div>

                <div className="form-actions">
                  <Button variant="secondary" type="button" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="emerald">Create Category in DB →</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. REUSABLE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText="Delete Record"
        variant="danger"
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* 4. CREATE TRANSACTION MODAL */}
      <AnimatePresence>
        {isTxModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog tx-modal">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">💸 Record Financial Transaction</h3>
                   <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Saves directly to your active ledger in INR (₹)</p>
                </div>
                <button type="button" onClick={() => setIsTxModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              <form onSubmit={handleTxSubmit} className="modal-form">
                <div>
                  <label className="form-label">Type</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {TRANSACTION_TYPES.map(type => {
                      const isSelected = txType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setTxType(type.value)}
                          style={{
                            flex: 1,
                            padding: '0.65rem',
                            borderRadius: '8px',
                            border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                            background: isSelected ? (type.value === 'EXPENSE' ? 'var(--accent-danger)' : 'var(--accent-emerald)') : 'var(--bg-surface-elevated)',
                            color: isSelected ? '#FFFFFF' : 'var(--text-heading)',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="form-label">Amount (₹)</label>
                    <input type="number" step="0.01" placeholder="0.00" value={txAmount} onChange={e => setTxAmount(e.target.value)} className="form-input" style={{ fontFamily: 'var(--font-mono)' }} required />
                  </div>

                  <div>
                     <label className="form-label">Category (Active Ledger)</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="form-select">
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">📝 Note & Context (Why, What, With Whom)</label>
                  <input type="text" placeholder="e.g., Client lunch at Cafe with Tariq & Bilal" value={noteContent} onChange={e => setNoteContent(e.target.value)} className="form-input" />
                </div>

                {liveFormOverBudgetWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      color: 'var(--accent-amber)',
                      fontSize: '0.82rem',
                      fontWeight: '600'
                    }}
                  >
                    ⚠️ Note: Logging this expense of ₹{parseFloat(txAmount).toFixed(2)} will exceed your monthly {liveFormOverBudgetWarning.category} budget limit by ₹{liveFormOverBudgetWarning.overBy.toFixed(2)}!
                  </motion.div>
                )}

                <div className="form-actions">
                  <Button variant="secondary" type="button" onClick={() => setIsTxModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Confirm & Save Entry →</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. LEDGER RECORD EDIT/DELETE MODAL */}
      <AnimatePresence>
        {editingRecord && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog debt-modal">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">🏦 Ledger Transaction Inspection & Edit</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Record #{editingRecord.id} • Contact: {editingRecord.personName}
                  </p>
                </div>
                <button type="button" onClick={() => setEditingRecord(null)} className="modal-close-btn">✕</button>
              </div>

              <form onSubmit={handleEditSubmit} className="modal-form">
                
                <div className="form-grid-2" style={{ marginBottom: '0.5rem' }}>
                  <div style={{ background: 'var(--bg-surface)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Recorded Timestamp</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-heading)', marginTop: '0.15rem' }}>{editingRecord.givenDate}</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Resulting Net Running Balance</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: '800', color: editingRecord.runningBalance >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)', marginTop: '0.15rem' }}>
                      {editingRecord.runningBalance >= 0 ? '+' : '-'}₹{Math.abs(editingRecord.runningBalance || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div>
                    <label className="form-label">Transaction Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editAmount}
                      onChange={e => setEditAmount(e.target.value)}
                      className="form-input"
                      style={{ fontFamily: 'var(--font-mono)' }}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Direction</label>
                    <select value={editType} onChange={e => setEditType(e.target.value)} className="form-select">
                      <option value="GIVE_LOAN">🟢 Lent Out (Owed to You)</option>
                      <option value="TAKE_LOAN">📥 Borrowed (You Owe)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">📝 Notes & Reference (Payment Method, Reason)</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-actions" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
                  <Button type="button" variant="danger" onClick={() => requestSingleDelete(editingRecord.id)}>
                    🗑️ Delete Record
                  </Button>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button type="button" variant="secondary" onClick={() => setEditingRecord(null)}>Close</Button>
                    <Button type="submit" variant="emerald">✏️ Save & Update Entry →</Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
