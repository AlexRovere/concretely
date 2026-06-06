import { ref, watch } from 'vue'
import {
  CODE_THEMES,
  CODE_FONTS,
  APP_THEMES,
  codeThemeById,
  codeFontById
} from '@/themes.js'

// Singleton module state — every component shares the same three refs.
const LS = {
  theme: 'concretely:theme',
  code: 'concretely:code-theme',
  font: 'concretely:code-font'
}

const stored = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const prefersLight =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: light)').matches

// `?theme=light|dark` overrides everything (shareable/debug), then the
// stored choice, then the OS preference — same order as the index.html
// anti-FOUC script.
const fromQuery =
  typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('theme')
    : null

const theme = ref<string>(
  APP_THEMES.includes(fromQuery ?? '')
    ? (fromQuery as string)
    : APP_THEMES.includes(stored(LS.theme) ?? '')
      ? (stored(LS.theme) as string)
      : prefersLight
        ? 'light'
        : 'dark'
)
const codeTheme = ref<string>(codeThemeById(stored(LS.code) ?? '') ? (stored(LS.code) as string) : 'tokyo')
const codeFont = ref<string>(codeFontById(stored(LS.font) ?? '') ? (stored(LS.font) as string) : 'cascadia')

function apply(): void {
  const root = document.documentElement
  root.dataset.theme = theme.value
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme.value === 'dark' ? '#0f172a' : '#eef2f7')

  const ct = codeThemeById(codeTheme.value) ?? CODE_THEMES[0]
  root.style.setProperty('--code-bg', ct.bg)
  root.style.setProperty('--code-head', ct.head)
  root.style.setProperty('--code-ink', ct.ink)
  root.style.setProperty('--code-border', ct.border)
  for (const [k, v] of Object.entries(ct.tok)) {
    root.style.setProperty('--tok-' + k, v as string)
  }

  const f = codeFontById(codeFont.value) ?? CODE_FONTS[0]
  root.style.setProperty('--code-font', f.stack)

  // Canvases repaint on their next step; nudge the always-static ones.
  window.dispatchEvent(new CustomEvent('concretely:theme'))
}

watch(theme, (v) => {
  try {
    localStorage.setItem(LS.theme, v)
  } catch {
    /* private mode */
  }
  apply()
})
watch([codeTheme, codeFont], () => {
  try {
    localStorage.setItem(LS.code, codeTheme.value)
    localStorage.setItem(LS.font, codeFont.value)
  } catch {
    /* private mode */
  }
  apply()
})

let applied = false

export function useTheme() {
  if (!applied) {
    applied = true
    apply()
  }
  const toggleTheme = (): void => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }
  return { theme, codeTheme, codeFont, toggleTheme, CODE_THEMES, CODE_FONTS }
}
