import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

/**
 * Reusable Enterprise Confirmation Modal Component.
 * Replaces native browser alert/confirm popups with theme-aware glassmorphism.
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
export const ConfirmModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" style={{ zIndex: 10000 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="modal-dialog"
          style={{ maxWidth: '440px' }}
        >
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button type="button" onClick={onClose} className="modal-close-btn">✕</button>
          </div>

          <div style={{ color: 'var(--text-body)', fontSize: '0.9rem', lineHeight: '1.5', margin: '1rem 0 1.5rem' }}>
            {message}
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="secondary" onClick={onClose}>{cancelText}</Button>
            <Button type="button" variant={variant} onClick={() => { onConfirm(); onClose(); }}>
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
