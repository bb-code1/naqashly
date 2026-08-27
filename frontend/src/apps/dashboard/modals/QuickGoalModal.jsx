import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/Button';

/**
 * 🎯 Quick Add Goal Modal (Instant Focus Milestone Creation)
 */
export const QuickGoalModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSave({
        title,
        progressPercentage: Number(progressPercentage)
      });
      setTitle('');
      setProgressPercentage(0);
      onClose();
    } catch (err) {
      console.error('[QuickGoalModal] Error creating goal:', err);
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
                🎯 Quick Add Focus Goal
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Create Macro Target & Slider Indicator
              </p>
            </div>
            <button type="button" onClick={onClose} className="modal-close-btn">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div>
              <label className="form-label">Goal Title / Milestone</label>
              <input
                type="text"
                placeholder="e.g. Complete System Architecture Blueprint"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="form-input"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="form-label">Initial Progress: {progressPercentage}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={e => setProgressPercentage(e.target.value)}
                style={{ width: '100%', accentColor: '#EC4899', cursor: 'pointer' }}
              />
            </div>

            <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="emerald" disabled={loading}>
                {loading ? 'Saving...' : '🚀 Create Goal →'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
