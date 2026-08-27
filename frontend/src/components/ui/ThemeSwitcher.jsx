import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Enterprise Multi-Theme Switcher Toggle.
 * Cycles through Obsidian Dark, Luxe Light, Cyberpunk, and Forest themes on click.
 * Displays only the current theme's icon emoji, matching clean mobile aesthetic guidelines.
 * 
 * @author Barkat Bashir
 * @version 3.0.0
 */
export const ThemeSwitcher = () => {
  const { theme, setTheme, THEME_OPTIONS } = useTheme();

  const currentOption = THEME_OPTIONS.find(t => t.key === theme) || THEME_OPTIONS[0];

  const handleCycleTheme = () => {
    const currentIndex = THEME_OPTIONS.findIndex(t => t.key === theme);
    const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
    setTheme(THEME_OPTIONS[nextIndex].key);
  };

  return (
    <button
      onClick={handleCycleTheme}
      title={`Theme: ${currentOption.label}. Click to switch.`}
      style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-heading)',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        fontSize: '1rem',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: 0,
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
        userSelect: 'none'
      }}
      onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
      onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <span>{currentOption.icon}</span>
    </button>
  );
};
