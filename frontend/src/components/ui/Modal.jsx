import React, { useState } from 'react';

/**
 * Backdrop Blur Modal Popup Window Primitive.
 * Uses CSS Variables for Theme-Aware Obsidian, Luxe Light, Cyberpunk, and Forest rendering!
 * 
 * @author Barkat Bashir
 * @version 2.1.0
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  closeOnBackdropClick = true,
  showCloseButton = true
}) => {
  const [isCloseHovered, setIsCloseHovered] = useState(false);

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
    position: 'relative',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-highlight)',
    borderRadius: 'var(--radius-lg, 16px)',
    width: '420px',
    maxWidth: '100%',
    padding: '2.5rem 2rem 2rem 2rem',
    textAlign: 'center',
    boxShadow: 'var(--card-shadow)',
    color: 'var(--text-body)'
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: isCloseHovered ? 'rgba(128, 128, 128, 0.15)' : 'transparent',
    border: 'none',
    color: isCloseHovered ? 'var(--text-heading)' : 'var(--text-muted)',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    transition: 'all 0.2s ease',
    outline: 'none'
  };

  const handleBackdropClick = () => {
    if (closeOnBackdropClick && onClose) {
      onClose();
    }
  };

  return (
    <div style={backdropStyle} onClick={handleBackdropClick}>
      <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            style={closeButtonStyle}
            onMouseEnter={() => setIsCloseHovered(true)}
            onMouseLeave={() => setIsCloseHovered(false)}
            aria-label="Close modal"
          >
            ✕
          </button>
        )}
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
