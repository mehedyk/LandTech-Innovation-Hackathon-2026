import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
const THEME_KEY = 'ardh.theme';
/** Light is the default; the choice is remembered in this browser. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* storage unavailable: keep in memory */ }
  }, [theme]);
  return [theme, setTheme] as const;
}
