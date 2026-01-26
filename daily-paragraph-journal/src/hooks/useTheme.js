import { useState, useEffect } from 'react';

// Theme definitions
export const THEMES = [
  { id: 'vintage-sepia', name: 'Vintage', category: 'theme' },
  { id: 'autumn-leaves', name: 'Autumn Leaves', category: 'theme' },
  { id: 'midnight-scholar', name: 'Midnight Scholar', category: 'theme' },
];

const STORAGE_KEY = 'journal-theme';
const DEFAULT_THEME = 'vintage-sepia';

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Load theme from localStorage on mount
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      if (savedTheme && THEMES.some(t => t.id === savedTheme)) {
        return savedTheme;
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Save theme to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, currentTheme);
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, [currentTheme]);

  const changeTheme = (themeId) => {
    if (THEMES.some(t => t.id === themeId)) {
      setCurrentTheme(themeId);
    } else {
      console.warn(`Invalid theme ID: ${themeId}`);
    }
  };

  return {
    currentTheme,
    changeTheme,
    THEMES,
  };
}
