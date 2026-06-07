import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHEATSHEETS, cheatsheetFor, allCheatItems } from '../src/cheatsheets/index.js';
import { buildSearchEntries, buildSearchIndex } from '../src/search.js';

const CATS = ['general', 'js', 'ts', 'vue', 'swift', 'ruby', 'kotlin', 'go', 'rust', 'git', 'linux', 'sql', 'web', 'docker', 'python', 'c', 'os', 'k8s'];
const LANGS = new Set(['js', 'ts', 'swift', 'ruby', 'kotlin', 'go', 'rust', 'git', 'bash', 'sql', 'python']);

test('every filter category has its cheatsheet', () => {
  for (const c of CATS) {
    const sheet = cheatsheetFor(c);
    assert.ok(sheet, c);
    assert.equal(sheet.id, c);
    assert.ok(LANGS.has(sheet.lang), `${c}: lang ${sheet.lang}`);
    assert.ok(sheet.sections.length >= 4, `${c}: only ${sheet.sections.length} sections`);
  }
  assert.equal(Object.keys(CHEATSHEETS).length, CATS.length);
});

test('every item is well-formed, bilingual, with real code', () => {
  const ids = new Set();
  for (const [cat, sheet] of Object.entries(CHEATSHEETS)) {
    for (const s of sheet.sections) {
      assert.ok(s.id && s.title.fr && s.title.en, `${cat}/${s.id}: section title`);
      assert.ok(s.items.length >= 3, `${cat}/${s.id}: only ${s.items.length} items`);
      for (const it of s.items) {
        assert.ok(!ids.has(it.id), `duplicate id ${it.id}`);
        ids.add(it.id);
        assert.ok(it.title.fr.length > 2 && it.title.en.length > 2, it.id);
        assert.ok(it.code.length > 10, `${it.id}: code too short`);
        assert.ok(it.note.fr.length > 10 && it.note.en.length > 10, `${it.id}: note`);
        if (it.lang) assert.ok(LANGS.has(it.lang), `${it.id}: lang ${it.lang}`);
      }
    }
  }
  assert.ok(ids.size >= 620, `only ${ids.size} items total`);
});

test('allCheatItems flattens everything with its sheet/section context', () => {
  const flat = allCheatItems();
  const expected = Object.values(CHEATSHEETS)
    .reduce((n, sh) => n + sh.sections.reduce((m, s) => m + s.items.length, 0), 0);
  assert.equal(flat.length, expected);
  for (const e of flat) {
    assert.ok(CATS.includes(e.cat));
    assert.ok(e.section.title.fr && e.item.title.fr);
  }
});

test('search corpus = topic tabs + every snippet, in both locales', () => {
  const tabs = [
    { mode: 'gitdag', key: 'tabs.gitdag', cat: 'git' },
    { mode: 'quiz', key: 'tabs.quiz', cat: '*' }, // cat '*' is excluded
  ];
  const entries = buildSearchEntries(tabs);
  assert.equal(entries.length, 1 + allCheatItems().length);
  for (const e of entries) {
    assert.ok(e.titleFr && e.titleEn, `${e.kind}/${e.mode}: missing locale title`);
    assert.ok(e.sectionFr && e.sectionEn);
  }
});

test('fuzzy search finds snippets from either locale and from code', () => {
  const fuse = buildSearchIndex([]);
  const top = (q) => fuse.search(q)[0]?.item;
  assert.equal(top('rebase').cat, 'git');
  assert.ok(top('tableaux'), 'FR section term'); // « Tableaux » (JS)
  assert.equal(top('force-with-lease').cat, 'git'); // straight from code
  const sf = top('StateFlow');
  assert.equal(sf.cat, 'kotlin');
});
