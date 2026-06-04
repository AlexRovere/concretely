import { test } from 'node:test';
import assert from 'node:assert/strict';
import { highlight } from '../src/highlight.js';
import { SNIPPETS, LANGUAGES } from '../src/snippets/index.js';

const stripTags = (html) => html.replace(/<\/?span[^>]*>/g, '');
const esc = (s) => s.replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));

test('highlight escapes HTML and never emits raw markup from the source', () => {
  const evil = 'var x = a < b && c > d; // <script>alert(1)</script>';
  const html = highlight(evil, 'js');
  assert.ok(!/<script>/.test(html), 'must not emit a raw <script> tag');
  assert.ok(html.includes('&lt;') && html.includes('&amp;') && html.includes('&gt;'));
});

test('highlight tags keywords, function calls and strings', () => {
  const html = highlight('function foo() { return "hi"; }', 'js');
  assert.ok(html.includes('tok-keyword'), 'function/return should be keywords');
  assert.ok(html.includes('tok-func'), 'foo( should be a function call');
  assert.ok(html.includes('tok-string'), '"hi" should be a string');
});

test('stripping the spans restores the escaped source for every snippet', () => {
  for (const { id: lang } of LANGUAGES) {
    for (const [algo, code] of Object.entries(SNIPPETS[lang])) {
      const html = highlight(code, lang);
      assert.equal(stripTags(html), esc(code), `${lang}/${algo} round-trip mismatch`);
    }
  }
});
