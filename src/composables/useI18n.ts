import { ref } from 'vue'
// Raw i18n lives in a framework-agnostic JS module. We bridge its mutable
// module-level locale to a Vue ref so templates re-render on locale change,
// while imperative panel code keeps importing the raw `t` / `onLocaleChange`.
import {
  LOCALES,
  getLocale,
  setLocale as setLocaleRaw,
  onLocaleChange,
  t as tRaw,
  algoMeta
} from '@/i18n.js'

// Single source of truth for the reactive locale; registered once at module load.
const locale = ref<string>(getLocale())
onLocaleChange(() => {
  locale.value = getLocale()
})

export function useI18n() {
  /**
   * Reactive translate for templates. Only plain (non-parameterized) keys are
   * used in templates; parameterized entries (functions) are handled in
   * imperative panel code via the raw `t`. Returns '' for function entries so a
   * template never renders "[object Function]".
   */
  const t = (key: string): string => {
    void locale.value // establish reactive dependency
    const v = tRaw(key) as unknown
    return typeof v === 'function' ? '' : (v as string)
  }

  /**
   * Reactive translate for PARAMETERIZED keys (function entries), for the rare
   * declarative templates (QuizPanel): tf('quiz.progress', 1, 17).
   */
  const tf = (key: string, ...args: unknown[]): string => {
    void locale.value // establish reactive dependency
    const v = tRaw(key) as unknown
    return typeof v === 'function' ? String(v(...args)) : (v as string)
  }

  const setLocale = (l: string): void => {
    setLocaleRaw(l)
  }

  return { t, tf, locale, setLocale, LOCALES, algoMeta, onLocaleChange }
}
