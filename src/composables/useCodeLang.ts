import { ref } from 'vue'
import { LANGUAGES } from '@/snippets/index.js'

// Shared across panels so the code-language choice (JS, Java, Swift, …) stays in
// sync between Sorting and Pathfinding: a single module-level ref.
const currentLang = ref<string>('js')

export function useCodeLang() {
  return { currentLang, LANGUAGES }
}
