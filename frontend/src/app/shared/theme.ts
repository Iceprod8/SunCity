export type ThemeChoice = 'light' | 'dark';

const THEME_STORAGE_KEY = 'suncity-theme';

export function getSavedTheme(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeChoice | null;
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    console.log('Could not retrieve theme preference');
  }
  return 'light';
}

export function applyTheme(theme: ThemeChoice) {
  const root = document.documentElement;
  if (!root) return;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    console.log('Could not save theme preference');
  }
}
