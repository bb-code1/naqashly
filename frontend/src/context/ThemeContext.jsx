import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEME_OPTIONS = [
  { key: 'obsidian', label: '🌌 Obsidian Dark', icon: '🌙' },
  { key: 'light', label: '☀️ Luxe Light', icon: '☀️' },
  { key: 'cyberpunk', label: '⚡ Cyberpunk Dark', icon: '⚡' },
  { key: 'forest', label: '🌿 Forest Emerald', icon: '🌿' }
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('naqashly_theme') || 'obsidian';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('naqashly_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'obsidian' ? 'light' : theme === 'light' ? 'cyberpunk' : theme === 'cyberpunk' ? 'forest' : 'obsidian';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, THEME_OPTIONS }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
