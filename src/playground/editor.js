/**
 * CodeMirror 6 editor wired to the app's code theming: every color/font is a
 * CSS var (--code-* / --tok-*), so the editor follows the Settings palette
 * and font live, with zero re-configuration.
 */
import { EditorView, basicSetup } from 'codemirror';
import { keymap } from '@codemirror/view';
import { Compartment } from '@codemirror/state';
import { indentWithTab } from '@codemirror/commands';
import { StreamLanguage, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import { kotlin } from '@codemirror/legacy-modes/mode/clike';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { go } from '@codemirror/legacy-modes/mode/go';
import { rust } from '@codemirror/legacy-modes/mode/rust';
import { tags } from '@lezer/highlight';

const LANGS = {
  js: () => javascript(),
  ts: () => javascript({ typescript: true }),
  ruby: () => StreamLanguage.define(ruby),
  kotlin: () => StreamLanguage.define(kotlin),
  shell: () => StreamLanguage.define(shell),
  go: () => StreamLanguage.define(go),
  rust: () => StreamLanguage.define(rust),
};

const theme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--code-bg)',
    color: 'var(--code-ink)',
    border: '1px solid var(--code-border)',
    borderRadius: '8px',
    fontSize: '0.85rem',
  },
  '&.cm-focused': { outline: '2px solid var(--accent)', outlineOffset: '1px' },
  '.cm-scroller': { fontFamily: 'var(--code-font)', lineHeight: '1.55' },
  '.cm-content': { caretColor: 'var(--code-ink)', padding: '0.6rem 0' },
  '.cm-cursor': { borderLeftColor: 'var(--code-ink)' },
  '.cm-gutters': {
    backgroundColor: 'var(--code-head)',
    color: 'var(--tok-comment)',
    border: 'none',
    borderRight: '1px solid var(--code-border)',
    borderRadius: '8px 0 0 8px',
  },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--code-ink) 6%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'color-mix(in srgb, var(--code-ink) 8%, transparent)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'color-mix(in srgb, var(--accent) 28%, transparent)',
  },
  '.cm-selectionMatch': { backgroundColor: 'color-mix(in srgb, var(--accent) 16%, transparent)' },
});

// Same 7 token families as src/highlight.js, fed by the same CSS vars.
const highlightStyle = HighlightStyle.define([
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: 'var(--tok-comment)', fontStyle: 'italic' },
  { tag: [tags.string, tags.special(tags.string), tags.regexp], color: 'var(--tok-string)' },
  { tag: [tags.number, tags.integer, tags.float], color: 'var(--tok-number)' },
  { tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword, tags.moduleKeyword, tags.operatorKeyword], color: 'var(--tok-keyword)' },
  { tag: [tags.bool, tags.null, tags.atom, tags.self], color: 'var(--tok-literal)' },
  { tag: [tags.typeName, tags.className, tags.namespace], color: 'var(--tok-type)' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: 'var(--tok-func)' },
  { tag: [tags.propertyName, tags.attributeName], color: 'var(--tok-func)' },
]);

export function createEditor({ parent, doc, lang, onRun }) {
  const langConf = new Compartment();
  const view = new EditorView({
    parent,
    doc,
    extensions: [
      keymap.of([
        { key: 'Mod-Enter', run: () => { onRun?.(); return true; } },
        indentWithTab,
      ]),
      basicSetup,
      theme,
      syntaxHighlighting(highlightStyle),
      langConf.of((LANGS[lang] ?? LANGS.js)()),
    ],
  });
  return {
    view,
    getCode: () => view.state.doc.toString(),
    setCode: (code) =>
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } }),
    setLang: (l) =>
      view.dispatch({ effects: langConf.reconfigure((LANGS[l] ?? LANGS.js)()) }),
    destroy: () => view.destroy(),
  };
}
