/**
 * Theme registry — pure data, no DOM.
 *
 * Two independent axes, both persisted in localStorage by useTheme:
 *  - the APP theme (dark/light) → `data-theme` attribute, drives the CSS vars
 *  - the CODE theme (editor palette + font) → `--code-*` / `--tok-*` vars,
 *    drives every code box, snippet and syntax-highlighted token
 *
 * Code theme shape: { id, name, dark, bg, head, ink, border, tok: { comment,
 * string, number, keyword, literal, type, func } } — all values CSS colors.
 */

export const CODE_THEMES = [
  {
    id: 'tokyo',
    name: 'Tokyo Night',
    dark: true,
    bg: '#0b1220', head: '#0e1626', ink: '#d6e2f0', border: '#1f2937',
    tok: {
      comment: '#6b7a8d', string: '#9ece6a', number: '#ff9e64',
      keyword: '#bb9af7', literal: '#ff9e64', type: '#2ac3de', func: '#7aa2f7',
    },
  },
  {
    id: 'onedark',
    name: 'One Dark',
    dark: true,
    bg: '#282c34', head: '#21252b', ink: '#abb2bf', border: '#3b4048',
    tok: {
      comment: '#5c6370', string: '#98c379', number: '#d19a66',
      keyword: '#c678dd', literal: '#d19a66', type: '#e5c07b', func: '#61afef',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    dark: true,
    bg: '#282a36', head: '#21222c', ink: '#f8f8f2', border: '#44475a',
    tok: {
      comment: '#6272a4', string: '#f1fa8c', number: '#bd93f9',
      keyword: '#ff79c6', literal: '#bd93f9', type: '#8be9fd', func: '#50fa7b',
    },
  },
  {
    id: 'monokai',
    name: 'Monokai',
    dark: true,
    bg: '#272822', head: '#1e1f1c', ink: '#f8f8f2', border: '#49483e',
    tok: {
      comment: '#75715e', string: '#e6db74', number: '#ae81ff',
      keyword: '#f92672', literal: '#ae81ff', type: '#66d9ef', func: '#a6e22e',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    dark: true,
    bg: '#2e3440', head: '#272c36', ink: '#d8dee9', border: '#434c5e',
    tok: {
      comment: '#616e88', string: '#a3be8c', number: '#b48ead',
      keyword: '#81a1c1', literal: '#b48ead', type: '#8fbcbb', func: '#88c0d0',
    },
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    dark: false,
    bg: '#ffffff', head: '#f6f8fa', ink: '#1f2328', border: '#d1d9e0',
    tok: {
      comment: '#6e7781', string: '#0a3069', number: '#0550ae',
      keyword: '#cf222e', literal: '#0550ae', type: '#953800', func: '#8250df',
    },
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    dark: false,
    bg: '#fdf6e3', head: '#eee8d5', ink: '#657b83', border: '#d9d2bc',
    tok: {
      comment: '#93a1a1', string: '#2aa198', number: '#d33682',
      keyword: '#859900', literal: '#d33682', type: '#b58900', func: '#268bd2',
    },
  },
];

/**
 * Code fonts. The first three are BUNDLED (fontsource, loaded lazily by the
 * browser only once selected); the rest are system stacks.
 */
export const CODE_FONTS = [
  { id: 'cascadia', name: 'Cascadia Code', stack: `'Cascadia Code', 'Cascadia Mono', Consolas, monospace` },
  { id: 'jetbrains', name: 'JetBrains Mono', stack: `'JetBrains Mono Variable', 'JetBrains Mono', Consolas, monospace` },
  { id: 'fira', name: 'Fira Code', stack: `'Fira Code Variable', 'Fira Code', Consolas, monospace` },
  { id: 'plex', name: 'IBM Plex Mono', stack: `'IBM Plex Mono', Consolas, monospace` },
  { id: 'system', name: 'Système (Consolas / Menlo)', stack: `ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace` },
  { id: 'courier', name: 'Courier', stack: `'Courier Prime', 'Courier New', monospace` },
];

export const APP_THEMES = ['dark', 'light'];

export const codeThemeById = (id) => CODE_THEMES.find((t) => t.id === id);
export const codeFontById = (id) => CODE_FONTS.find((f) => f.id === id);

/** One-line sample rendered in the settings preview (never translated). */
export const PREVIEW_CODE = `const ok = items.filter((x) => x > 1); // 2 éléments`;
