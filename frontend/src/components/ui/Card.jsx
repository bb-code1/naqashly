import React from 'react';

/**
 * Translucent Glassmorphic Card Primitive.
 */
export const Card = ({ children, className = '', style = {} }) => {
  const cardStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.75rem',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.2s ease',
    ...style
  };

  return (
    <div className={`ui-card ${className}`} style={cardStyle}>
      {children}
    </div>
  );
};
