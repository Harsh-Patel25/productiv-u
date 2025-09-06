import React, { useEffect, useState } from 'react';
import { storageManager } from '../utils/storage';
import { ThemeContext, type Theme, type ThemeContextType } from './theme-context';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from storage
  useEffect(() => {
    const preferences = storageManager.loadPreferences();
    setThemeState(preferences.theme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        setResolvedTheme(e.matches ? 'dark' : 'light');
        updateDocumentClass(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    // Initial check
    if (theme === 'system') {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      setResolvedTheme(systemTheme);
      updateDocumentClass(systemTheme);
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply theme when it changes
  useEffect(() => {
    let newResolvedTheme: 'light' | 'dark';
    
    if (theme === 'system') {
      newResolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      newResolvedTheme = theme;
    }
    
    setResolvedTheme(newResolvedTheme);
    updateDocumentClass(newResolvedTheme);
  }, [theme]);

  const updateDocumentClass = (resolvedTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#1f2937' : '#ffffff');
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Save to storage
    const preferences = storageManager.loadPreferences();
    storageManager.savePreferences({
      ...preferences,
      theme: newTheme
    });
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}


