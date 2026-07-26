import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/Button';

/**
 * 🌿 Quick Add Habit Modal (Instant Executive Creation)
 */
export const QuickHabitModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [targetMinutes, setTargetMinutes] = useState(15);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSave({ title, targetMinutes: Number(targetMinutes), status: 'PENDING' });
      setTitle('');
      setTargetMinutes(15);
      onClose();
    } catch (err) {
      console.error('[QuickHabitModal] Error creating habit:', err);
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
                🌿 Quick Add Habit
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Instant Routine Creation • 2-Hour Grace Window Protected
              </p>
            </div>
            <button type="button" onClick={onClose} className="modal-close-btn">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div>
              <label className="form-label">Habit Name / Intention</label>
              <input
                type="text"
                placeholder="e.g. 15-Min Executive Reflection"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="form-input"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="form-label">Target Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                max="180"
                value={targetMinutes}
                onChange={e => setTargetMinutes(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="emerald" disabled={loading}>
                {loading ? 'Saving...' : '✨ Create Habit →'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
