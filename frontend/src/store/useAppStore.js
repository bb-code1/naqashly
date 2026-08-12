import { create } from 'zustand';

export const THEME_OPTIONS = [
  { key: 'obsidian', label: '🌌 Obsidian Dark', icon: '🌙' },
  { key: 'light', label: '☀️ Luxe Light', icon: '☀️' },
  { key: 'cyberpunk', label: '⚡ Cyberpunk Dark', icon: '⚡' },
  { key: 'forest', label: '🌿 Forest Emerald', icon: '🌿' }
];

export const useAppStore = create((set) => ({
  theme: localStorage.getItem('naqashly_theme') || 'obsidian',
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('naqashly_theme', theme);
    set({ theme });
  },
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'obsidian' 
      ? 'light' 
      : state.theme === 'light' 
        ? 'cyberpunk' 
        : state.theme === 'cyberpunk' 
          ? 'forest' 
          : 'obsidian';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('naqashly_theme', nextTheme);
    return { theme: nextTheme };
  })
}));

// Apply theme class to document element on module load
const initialTheme = localStorage.getItem('naqashly_theme') || 'obsidian';
document.documentElement.setAttribute('data-theme', initialTheme);
