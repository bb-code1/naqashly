import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/Button';

/**
 * 📖 Quick Write Private Diary Note Modal
 * 
 * Clean, honest reflection note logger.
 */
export const QuickDiaryModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('REFLECTION');
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
      setCategory('REFLECTION');
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
                📖 Quick Write Private Diary Note
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                📝 Saved Directly to Your Private Diary
              </p>
            </div>
            <button type="button" onClick={onClose} className="modal-close-btn">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div>
              <label className="form-label">Note Title</label>
              <input
                type="text"
                placeholder="e.g. Weekly Gratitude & Product Breakthrough"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="form-input"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="form-label">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="form-input"
                style={{ background: 'var(--bg-surface)' }}
              >
                <option value="REFLECTION">🧘 Reflection & Gratitude</option>
                <option value="IDEA">💡 Breakthrough Idea</option>
                <option value="WORK">💼 Executive Strategy</option>
                <option value="PERSONAL">🏠 Personal Memory</option>
              </select>
            </div>

            <div>
              <label className="form-label">Private Thoughts & Reflection</label>
              <textarea
                rows={4}
                placeholder="Write your daily thoughts here..."
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
                {loading ? 'Saving Note...' : '💾 Save Note →'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
