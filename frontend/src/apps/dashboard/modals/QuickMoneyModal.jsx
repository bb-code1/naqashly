import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/Button';

/**
 * 💸 Quick Log Expense Modal
 * 
 * Streamlined 5-second personal expense logging directly from the dashboard.
 */
export const QuickMoneyModal = ({ isOpen, onClose, onSave }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    try {
      await onSave({
        amount: Number(amount),
        note: note || 'Quick Dashboard Expense',
        type: 'EXPENSE'
      });
      setAmount('');
      setNote('');
      onClose();
    } catch (err) {
      console.error('[QuickMoneyModal] Error logging expense:', err);
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
          style={{ maxWidth: '440px' }}
        >
          <div className="modal-header">
            <div>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                💸 Quick Log Expense
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Instant Personal Outflow Entry (INR ₹)
              </p>
            </div>
            <button type="button" onClick={onClose} className="modal-close-btn">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div>
              <label className="form-label">Expense Amount (INR ₹)</label>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="e.g. 450"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="form-input"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="form-label">Note / Description</label>
              <input
                type="text"
                placeholder="e.g. Team coffee & lunch meeting"
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
                {loading ? 'Logging...' : '💸 Save Expense →'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
