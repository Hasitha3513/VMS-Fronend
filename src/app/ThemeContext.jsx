import { createContext, useContext, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'vms_theme';
const THEME_PREFS_KEY = 'vms_theme_prefs';

const DEFAULT_THEME_PREFS = {
  mode: 'light',
  colorPreset: 'ocean',
  density: 'comfortable',
  cornerStyle: 'rounded',
  reducedMotion: false,
  compactSidebar: false,
};

export function ThemeContextProvider({ children }) {
  const [themePrefs, setThemePrefs] = useState(() => {
    const legacyMode = localStorage.getItem(THEME_KEY);
    const raw = localStorage.getItem(THEME_PREFS_KEY);
    if (!raw) {
      return { ...DEFAULT_THEME_PREFS, mode: legacyMode || DEFAULT_THEME_PREFS.mode };
    }
    try {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_THEME_PREFS, ...parsed, mode: parsed?.mode || legacyMode || DEFAULT_THEME_PREFS.mode };
    } catch {
      return { ...DEFAULT_THEME_PREFS, mode: legacyMode || DEFAULT_THEME_PREFS.mode };
    }
  });

  const savePrefs = (next) => {
    localStorage.setItem(THEME_PREFS_KEY, JSON.stringify(next));
    localStorage.setItem(THEME_KEY, next.mode);
  };

  const toggleTheme = () => {
    setThemePrefs((prev) => {
      const next = { ...prev, mode: prev.mode === 'light' ? 'dark' : 'light' };
      savePrefs(next);
      return next;
    });
  };

  const setMode = (mode) => {
    setThemePrefs((prev) => {
      const next = { ...prev, mode: mode === 'dark' ? 'dark' : 'light' };
      savePrefs(next);
      return next;
    });
  };

  const updateThemePrefs = (partial) => {
    setThemePrefs((prev) => {
      const next = { ...prev, ...partial };
      savePrefs(next);
      return next;
    });
  };

  const resetThemePrefs = () => {
    setThemePrefs(DEFAULT_THEME_PREFS);
    savePrefs(DEFAULT_THEME_PREFS);
  };

  const value = useMemo(() => ({
    mode: themePrefs.mode,
    themePrefs,
    toggleTheme,
    setMode,
    updateThemePrefs,
    resetThemePrefs,
  }), [themePrefs]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used inside ThemeContextProvider');
  return ctx;
}
