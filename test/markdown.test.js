import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown } from '../src/notebooks/markdown.js';

test('headings', () => {
  assert.equal(renderMarkdown('# Titre'), '<h1>Titre</h1>');
  assert.equal(renderMarkdown('## Sous-titre'), '<h2>Sous-titre</h2>');
  assert.equal(renderMarkdown('### h3'), '<h3>h3</h3>');
});

test('inline: bold, italic, code, link', () => {
  assert.equal(renderMarkdown('**gras**'), '<p><strong>gras</strong></p>');
  assert.equal(renderMarkdown('*ital*'), '<p><em>ital</em></p>');
  assert.equal(renderMarkdown('`code`'), '<p><code>code</code></p>');
  assert.match(renderMarkdown('[lien](https://x.io)'), /<a href="https:\/\/x\.io" target="_blank" rel="noopener noreferrer">lien<\/a>/);
});

test('unordered and ordered lists', () => {
  assert.equal(renderMarkdown('- a\n- b'), '<ul>\n<li>a</li>\n<li>b</li>\n</ul>');
  assert.equal(renderMarkdown('1. x\n2. y'), '<ol>\n<li>x</li>\n<li>y</li>\n</ol>');
});

test('fenced code block keeps content verbatim (escaped)', () => {
  const out = renderMarkdown('```\na < b\n```');
  assert.equal(out, '<pre><code>a &lt; b</code></pre>');
});

test('HTML is escaped — no injection', () => {
  const out = renderMarkdown('<script>alert(1)</script>');
  assert.ok(!out.includes('<script>'), 'raw <script> must not survive');
  assert.ok(out.includes('&lt;script&gt;'), 'must be escaped');
});

test('javascript: links are neutralised', () => {
  const out = renderMarkdown('[x](javascript:alert(1))');
  assert.ok(!/href="javascript:/i.test(out), 'unsafe scheme dropped');
  assert.match(out, /href="#"/);
});

test('paragraph merges consecutive lines', () => {
  assert.equal(renderMarkdown('une ligne\net une autre'), '<p>une ligne et une autre</p>');
});
