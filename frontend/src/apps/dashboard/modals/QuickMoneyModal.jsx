import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/Button';

/**
 * 💰 Quick Log Money Modal (Instant Ledger Entry)
 */
export const QuickMoneyModal = ({ isOpen, onClose, onSave }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState('EXPENSE'); // 'EXPENSE' | 'INCOME' | 'LOAN_GIVEN' | 'LOAN_TAKEN'
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    try {
      await onSave({
        amount: Number(amount),
        note: note || 'Quick Dashboard Log',
        type
      });
      setAmount('');
      setNote('');
      setType('EXPENSE');
      onClose();
    } catch (err) {
      console.error('[QuickMoneyModal] Error logging transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" style={{ zIndex: 10000 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="modal-dialog wallet-modal"
          style={{ maxWidth: '480px' }}
        >
          <div className="modal-header">
            <div>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                💰 Log Money / Debt Entry
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Instant Financial Ledger Entry (INR ₹)
              </p>
            </div>
            <button type="button" onClick={onClose} className="modal-close-btn">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div>
              <label className="form-label">Transaction Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="form-input"
                style={{ background: 'var(--bg-surface)' }}
              >
                <option value="EXPENSE">💸 Personal Expense (-₹)</option>
                <option value="INCOME">📥 Income / Deposit (+₹)</option>
                <option value="LOAN_GIVEN">🤝 Debt: Lent Money to Someone (-₹)</option>
                <option value="LOAN_TAKEN">📑 Debt: Borrowed Money (+₹)</option>
              </select>
            </div>

            <div>
              <label className="form-label">Amount (INR ₹)</label>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="e.g. 1500"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="form-input"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="form-label">Note / Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Lent to Rahul for project advance"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="indigo" disabled={loading}>
                {loading ? 'Logging...' : '💾 Log Money →'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
