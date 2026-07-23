import React from 'react';

/**
 * Status Tag Badge Primitive.
 */
export const Badge = ({ children, variant = 'emerald', style = {} }) => {
  let bg = 'var(--accent-emerald-glow)';
  let color = 'var(--accent-emerald)';
  let border = '1px solid rgba(16, 185, 129, 0.3)';

  if (variant === 'indigo') {
    bg = 'var(--accent-indigo-glow)';
    color = 'var(--accent-indigo)';
    border = '1px solid rgba(99, 102, 241, 0.3)';
  } else if (variant === 'amber') {
    bg = 'var(--accent-amber-glow)';
    color = 'var(--accent-amber)';
    border = '1px solid rgba(245, 158, 11, 0.3)';
  } else if (variant === 'cyan') {
    bg = 'var(--accent-cyan-glow)';
    color = 'var(--accent-cyan)';
    border = '1px solid rgba(6, 182, 212, 0.3)';
  }

  const badgeStyle = {
    background: bg,
    color,
    border,
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '0.25rem 0.65rem',
    borderRadius: '9999px',
    fontFamily: 'var(--font-mono)',
    display: 'inline-block',
    ...style
  };

  return <span style={badgeStyle}>{children}</span>;
};
