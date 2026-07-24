import React from 'react';

/**
 * Backdrop Blur Modal Popup Window Primitive.
 * Uses CSS Variables for Theme-Aware Obsidian, Luxe Light, Cyberpunk, and Forest rendering!
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const backdropStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(16px)',
    zIndex: 10000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem'
  };

  const boxStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-highlight)',
    borderRadius: 'var(--radius-lg, 16px)',
    width: '420px',
    maxWidth: '100%',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: 'var(--card-shadow)',
    color: 'var(--text-body)'
  };

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
        {title && (
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
};
