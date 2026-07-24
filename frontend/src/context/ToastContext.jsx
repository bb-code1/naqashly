import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext({
  addToast: () => {},
  showSuccess: () => {},
  showError: () => {},
  toast: () => {}
});

/**
 * Universal Floating Toast Context & Provider.
 * Exposes addToast, showSuccess, showError, and toast helpers.
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const showSuccess = (message) => addToast(message, 'success');
  const showError = (message) => addToast(message, 'error');

  return (
    <ToastContext.Provider value={{ addToast, showSuccess, showError, toast: addToast }}>
      {children}

      {/* Floating Toast Portal */}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999,
        display: 'flex', flexDirection: 'column', gap: '0.75rem', pointerEvents: 'none'
      }}>
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{
                pointerEvents: 'auto',
                background: 'var(--bg-surface, rgba(15, 21, 33, 0.95))',
                border: toast.type === 'success' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                boxShadow: toast.type === 'success' ? '0 10px 30px rgba(16, 185, 129, 0.2)' : '0 10px 30px rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                padding: '0.85rem 1.35rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'var(--text-heading, #FFF)',
                fontSize: '0.88rem',
                fontWeight: '600',
                backdropFilter: 'blur(20px)'
              }}
            >
              <span>{toast.type === 'success' ? '✨' : '⚠️'}</span>
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext) || {
  addToast: () => {},
  showSuccess: () => {},
  showError: () => {},
  toast: () => {}
};
