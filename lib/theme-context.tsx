'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ColorPalette = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal';

interface ThemeContextType {
  mode: ThemeMode;
  palette: ColorPalette;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ColorPalette) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [palette, setPaletteState] = useState<ColorPalette>('blue');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    // Prevent flash of unstyled content by reading localStorage immediately
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode | null;
    const savedPalette = localStorage.getItem('theme-palette') as ColorPalette | null;

    // If no saved preference, check system preference
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

    const initialMode = savedMode || systemPreference;
    const initialPalette = savedPalette || 'blue';

    setModeState(initialMode);
    setPaletteState(initialPalette);

    // Apply theme immediately to prevent FOUC
    document.documentElement.setAttribute('data-theme', initialMode);
    document.documentElement.setAttribute('data-palette', initialPalette);

    setMounted(true);
  }, []);

  // Listen to system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('theme-mode')) {
        const newMode = e.matches ? 'dark' : 'light';
        setModeState(newMode);
        document.documentElement.setAttribute('data-theme', newMode);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('theme-mode', newMode);
    document.cookie = `theme-mode=${newMode}; path=/; max-age=31536000`;
    document.documentElement.setAttribute('data-theme', newMode);
  };

  const setPalette = (newPalette: ColorPalette) => {
    setPaletteState(newPalette);
    localStorage.setItem('theme-palette', newPalette);
    document.cookie = `theme-palette=${newPalette}; path=/; max-age=31536000`;
    document.documentElement.setAttribute('data-palette', newPalette);
  };

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  };

  // Render with current state even before mounted to prevent blank screen
  // The data-theme and data-palette attributes are set in useEffect
  return (
    <ThemeContext.Provider value={{ mode, palette, setMode, setPalette, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
