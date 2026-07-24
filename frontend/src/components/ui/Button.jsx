import React from 'react';

/**
 * Action Button Primitive.
 * Supports explicit type attribute (button | submit | reset) to prevent unintentional form submissions.
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
export const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  className = '',
  style = {},
  disabled = false
}) => {
  let background = 'linear-gradient(135deg, var(--accent-indigo) 0%, #4F46E5 100%)';
  let color = '#FFF';
  let border = 'none';

  if (variant === 'secondary') {
    background = 'rgba(255, 255, 255, 0.06)';
    border = '1px solid var(--border-subtle)';
    color = 'var(--text-heading)';
  } else if (variant === 'emerald') {
    background = 'linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%)';
  } else if (variant === 'danger') {
    background = 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
  } else if (variant === 'outline') {
    background = 'transparent';
    border = '1px solid var(--border-subtle)';
    color = 'var(--text-body)';
  }

  const btnStyle = {
    background,
    color,
    border,
    padding: '0.6rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s ease',
    ...style
  };

  return (
    <button type={type} className={`ui-button ${className}`} style={btnStyle} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};
