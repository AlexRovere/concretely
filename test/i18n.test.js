import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS, LOCALES, getLocale, setLocale, t, algoMeta } from '../src/i18n.js';
import { SORTS } from '../src/sorting/algorithms.js';
import { PATHFINDERS } from '../src/pathfinding/algorithms.js';

test('default locale is French and the toggle works', () => {
  assert.equal(getLocale(), 'fr');
  assert.equal(t('btn.play'), 'Lecture');
  setLocale('en');
  assert.equal(t('btn.play'), 'Play');
  setLocale('fr');
});

test('English and French define exactly the same UI keys', () => {
  const en = Object.keys(STRINGS.en).sort();
  const fr = Object.keys(STRINGS.fr).sort();
  assert.deepEqual(fr, en, 'locale key sets differ');
});

test('function-valued strings work in both locales', () => {
  setLocale('fr');
  assert.match(t('cx.capped')(7), /7/);
  assert.match(t('path.cells')(12), /12/);
  assert.equal(typeof t('metrics.sort')({ compares: 1, swaps: 2, writes: 0 }), 'string');
  setLocale('en');
  assert.match(t('cx.capped')(7), /7/);
  setLocale('fr');
});

test('algoMeta localizes name/desc/tips but keeps gen + complexity', () => {
  setLocale('fr');
  const fr = algoMeta('bubble');
  assert.equal(fr.name, 'Tri à bulles');
  assert.equal(typeof fr.gen, 'function');
  assert.equal(fr.gen, SORTS.bubble.gen);
  assert.ok(fr.complexity && fr.complexity.worst);
  assert.ok(fr.desc.length > 10 && fr.tips.length > 10);

  setLocale('en');
  assert.equal(algoMeta('bubble').name, 'Bubble Sort');
  setLocale('fr');
});

test('every algorithm has a French name/desc/tips', () => {
  setLocale('fr');
  for (const id of [...Object.keys(SORTS), ...Object.keys(PATHFINDERS)]) {
    const m = algoMeta(id);
    assert.ok(m.name && m.desc && m.tips, `${id} missing FR text`);
    // ensure it is actually translated, not the English fallback
    assert.notEqual(m.desc, (SORTS[id] ?? PATHFINDERS[id]).desc, `${id} desc not translated`);
  }
});
