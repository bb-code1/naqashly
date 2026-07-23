import React from 'react';

/**
 * Backdrop Blur Modal Popup Window Primitive.
 */
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const backdropStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(12px)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const boxStyle = {
    background: '#0E131F',
    border: '1px solid var(--border-highlight)',
    borderRadius: 'var(--radius-lg)',
    width: '420px',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
  };

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
        {title && <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
};
