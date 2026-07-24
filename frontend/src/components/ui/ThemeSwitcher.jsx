import React, { useState } from 'react';
import { useTheme, THEME_OPTIONS } from '../../context/ThemeContext';

/**
 * Enterprise Multi-Theme Selector Dropdown Component.
 * Supports 1-click theme switching between Obsidian Dark, Luxe Light, Cyberpunk, and Forest!
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const ThemeSwitcher = () => {
  const { theme, setTheme, THEME_OPTIONS } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = THEME_OPTIONS.find(t => t.key === theme) || THEME_OPTIONS[0];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-heading)',
          padding: '0.4rem 0.85rem',
          borderRadius: '9999px',
          fontSize: '0.8rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <span>{currentOption.label}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.4rem)',
            right: 0,
            background: 'var(--bg-base)',
            border: '1px solid var(--border-highlight)',
            borderRadius: '12px',
            padding: '0.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 1000,
            minWidth: '180px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}
        >
          {THEME_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => { setTheme(opt.key); setIsOpen(false); }}
              style={{
                background: theme === opt.key ? 'var(--accent-amber-glow)' : 'transparent',
                border: 'none',
                color: theme === opt.key ? 'var(--accent-amber)' : 'var(--text-body)',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: '600',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between'
              }}
            >
              <span>{opt.label}</span>
              {theme === opt.key && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
