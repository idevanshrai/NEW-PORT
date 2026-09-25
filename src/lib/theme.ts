import { emit, findSecret } from './bus';

export type Theme = 'light' | 'dark';

export const getTheme = (): Theme =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

export function setTheme(t: Theme) {
  const root = document.documentElement;
  if (t === 'light') root.dataset.theme = 'light';
  else delete root.dataset.theme;
  try {
    localStorage.setItem('dr:theme', t);
  } catch {
    /* ignore */
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'light' ? '#f1efe8' : '#0d0d0b');
  emit('dr:theme', t);
  if (t === 'light') findSecret('light');
}

export const toggleTheme = () => setTheme(getTheme() === 'light' ? 'dark' : 'light');
