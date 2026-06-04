import js from './js.js';
import java from './java.js';
import swift from './swift.js';
import go from './go.js';
import php from './php.js';
import ruby from './ruby.js';
import csharp from './csharp.js';

/** Languages offered in the code selector, in display order. */
export const LANGUAGES = [
  { id: 'js', name: 'JavaScript' },
  { id: 'java', name: 'Java' },
  { id: 'swift', name: 'Swift' },
  { id: 'go', name: 'Go' },
  { id: 'php', name: 'PHP' },
  { id: 'ruby', name: 'Ruby' },
  { id: 'csharp', name: 'C#' },
];

const BY_LANG = { js, java, swift, go, php, ruby, csharp };

/**
 * Code snippet for an algorithm in a language.
 * @param {string} algoId  e.g. 'bubble', 'astar'
 * @param {string} lang    e.g. 'js', 'go'
 * @returns {string}
 */
export function snippet(algoId, lang) {
  return BY_LANG[lang]?.[algoId] ?? `// no ${lang} example for "${algoId}" yet`;
}

export const SNIPPETS = BY_LANG;
