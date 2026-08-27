import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/Button';

/**
 * 📝 Quick Note Modal
 * 
 * Instant 5-second workspace note logger.
 */
export const QuickDiaryModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('WORK');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSave({
        title,
        content: content || title,
        category,
        pinned: true
      });
      setTitle('');
      setContent('');
      setCategory('WORK');
      onClose();
    } catch (err) {
      console.error('[QuickDiaryModal] Error writing note:', err);
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
          style={{ maxWidth: '520px' }}
        >
          <div className="modal-header">
            <div>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📝 Quick Note
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Instant Workspace Note Entry
              </p>
            </div>
            <button type="button" onClick={onClose} className="modal-close-btn">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div>
              <label className="form-label">Note Title</label>
              <input
                type="text"
                placeholder="e.g. System Architecture Notes & Meeting Action Items"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="form-input"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="form-label">Category Tag</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="form-input"
                style={{ background: 'var(--bg-surface)' }}
              >
                <option value="WORK">💼 Work & Architecture</option>
                <option value="IDEA">💡 Breakthrough Idea</option>
                <option value="REFLECTION">🧘 Reflection</option>
                <option value="PERSONAL">🏠 Personal</option>
              </select>
            </div>

            <div>
              <label className="form-label">Note Details / Content</label>
              <textarea
                rows={4}
                placeholder="Write your note details here..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="emerald" disabled={loading}>
                {loading ? 'Saving Note...' : '💾 Save Quick Note →'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
