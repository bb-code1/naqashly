import React from 'react';

/**
 * Range Input Progress Slider Primitive.
 */
export const Slider = ({ value, onChange, min = 0, max = 100 }) => {
  const isComplete = value === 100;
  const accentColor = isComplete ? 'var(--accent-emerald)' : 'var(--accent-indigo)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        style={{
          flex: 1,
          height: '6px',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.1)',
          accentColor,
          cursor: 'pointer'
        }}
      />
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem',
        fontWeight: '700',
        color: accentColor,
        width: '42px'
      }}>
        {value}%
      </span>
    </div>
  );
};
