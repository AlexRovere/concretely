/**
 * Theme-aware canvas colors: resolved from CSS custom properties at draw
 * time so the canvases follow the app theme (dark/light). `spec` maps a
 * color name to [cssVarName, fallback]. Falls back to the literals outside
 * a browser (the renderer unit tests replay steps under Node).
 */
export function themeColors(spec) {
  const css =
    typeof document !== 'undefined' && typeof getComputedStyle === 'function'
      ? getComputedStyle(document.documentElement)
      : null;
  const out = {};
  for (const [k, [name, fallback]] of Object.entries(spec)) {
    out[k] = (css ? css.getPropertyValue(name).trim() : '') || fallback;
  }
  return out;
}

/** Repaint hook — useTheme dispatches this event after switching themes. */
export function onThemeChange(fn) {
  if (typeof window !== 'undefined') window.addEventListener('concretely:theme', fn);
}
