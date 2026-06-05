/**
 * Tiny dependency-free syntax highlighter.
 *
 * It is intentionally generic rather than a per-language grammar: the seven
 * languages we show (JS, Java, Swift, Go, PHP, Ruby, C#) share a C-like surface,
 * so one tokenizer covering comments, strings, numbers, keywords, types and
 * function calls produces good-enough highlighting for short educational
 * snippets. Output is HTML with `<span class="tok-…">`; all text is escaped.
 */

const KEYWORDS = new Set([
  // declarations / structure
  'function', 'func', 'fn', 'def', 'fun', 'lambda', 'var', 'let', 'const', 'val',
  'class', 'struct', 'interface', 'enum', 'protocol', 'extension', 'module',
  'namespace', 'package', 'import', 'include', 'require', 'require_once', 'using',
  'from', 'new', 'delete', 'public', 'private', 'protected', 'internal', 'static',
  'final', 'abstract', 'virtual', 'override', 'async', 'await', 'defer', 'inout',
  'mut', 'out', 'ref', 'where', 'guard', 'extends', 'implements', 'typedef', 'type',
  // kotlin
  'suspend', 'when', 'data', 'sealed', 'companion', 'by', 'lateinit', 'init',
  'is', 'as', 'object', 'inner', 'open', 'inline', 'reified',
  // control flow
  'if', 'else', 'elif', 'elsif', 'unless', 'for', 'foreach', 'while', 'do', 'loop',
  'switch', 'case', 'default', 'break', 'continue', 'return', 'goto', 'yield',
  'try', 'catch', 'except', 'finally', 'throw', 'throws', 'raise', 'rescue',
  'ensure', 'begin', 'end', 'then', 'in', 'of', 'go', 'select', 'chan', 'range',
  // common primitive types
  'int', 'long', 'short', 'byte', 'float', 'double', 'bool', 'boolean', 'char',
  'string', 'void', 'object', 'array', 'list', 'map', 'dict', 'set', 'func',
  // misc statements
  'echo', 'print', 'println', 'printf', 'puts', 'this', 'self', 'super', 'base',
]);

const LITERALS = new Set([
  'true', 'false', 'null', 'nil', 'None', 'undefined', 'NULL', 'True', 'False',
]);

function escapeHtml(s) {
  return s.replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
}

/**
 * @param {string} code
 * @param {string} [lang]  'js' | 'java' | 'swift' | 'go' | 'php' | 'ruby' | 'csharp'
 * @returns {string} HTML
 */
export function highlight(code, lang = 'js') {
  const hashComment = lang === 'ruby' || lang === 'php';
  const n = code.length;
  let i = 0;
  let out = '';
  const emit = (cls, text) => {
    out += cls ? `<span class="tok-${cls}">${escapeHtml(text)}</span>` : escapeHtml(text);
  };

  while (i < n) {
    const c = code[i];

    // block comment
    if (c === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const j = end === -1 ? n : end + 2;
      emit('comment', code.slice(i, j));
      i = j;
      continue;
    }
    // line comment ( // , and # for ruby/php )
    if ((c === '/' && code[i + 1] === '/') || (hashComment && c === '#')) {
      let j = code.indexOf('\n', i);
      if (j === -1) j = n;
      emit('comment', code.slice(i, j));
      i = j;
      continue;
    }
    // string literal
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code[j] === c) { j++; break; }
        j++;
      }
      emit('string', code.slice(i, j));
      i = j;
      continue;
    }
    // number
    if (c >= '0' && c <= '9') {
      const m = code.slice(i).match(/^\d[\d_]*(\.\d+)?/)[0];
      emit('number', m);
      i += m.length;
      continue;
    }
    // identifier / keyword
    if (/[A-Za-z_$]/.test(c)) {
      const word = code.slice(i).match(/^[A-Za-z_$][\w$]*/)[0];
      i += word.length;
      let k = i;
      while (k < n && code[k] === ' ') k++;
      let cls = '';
      if (KEYWORDS.has(word)) cls = 'keyword';
      else if (LITERALS.has(word)) cls = 'literal';
      else if (code[k] === '(') cls = 'func';
      else if (/^[A-Z]/.test(word)) cls = 'type';
      emit(cls, word);
      continue;
    }
    // anything else
    emit('', c);
    i++;
  }
  return out;
}
