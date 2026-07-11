import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COMPARISONS, comparisonFor } from '../src/swiftcompare.js';

const bilingual = (v, ctx) => {
  assert.ok(v && typeof v.fr === 'string' && typeof v.en === 'string', `${ctx}: non bilingue`);
  assert.ok(v.fr.trim().length > 2 && v.en.trim().length > 2, `${ctx}: trop court`);
};

test('les deux comparaisons existent', () => {
  assert.deepEqual(Object.keys(COMPARISONS).sort(), ['bindings', 'types']);
});

test('chaque comparaison est bien formée et la matrice est complète', () => {
  for (const key of Object.keys(COMPARISONS)) {
    const c = COMPARISONS[key];
    assert.equal(c.id, key, `${key}: id`);
    bilingual(c.intro, `${key}.intro`);

    assert.ok(Array.isArray(c.candidates) && c.candidates.length >= 2, `${key}: candidates`);
    const candIds = new Set();
    for (const cand of c.candidates) {
      assert.ok(!candIds.has(cand.id), `${key}: candidat dupliqué ${cand.id}`);
      candIds.add(cand.id);
      assert.ok(typeof cand.label === 'string' && cand.label.trim().length > 0, `${key}/${cand.id}: label`);
      assert.ok(typeof cand.code === 'string' && cand.code.trim().length > 10, `${key}/${cand.id}: code trop court`);
      bilingual(cand.when, `${key}/${cand.id}.when`);
    }

    assert.ok(Array.isArray(c.dimensions) && c.dimensions.length >= 3, `${key}: dimensions`);
    const dimIds = new Set();
    for (const d of c.dimensions) {
      assert.ok(!dimIds.has(d.id), `${key}: dimension dupliquée ${d.id}`);
      dimIds.add(d.id);
      bilingual(d.label, `${key}/${d.id}.label`);
      // Couverture complète : une cellule bilingue pour CHAQUE candidat.
      for (const cand of c.candidates) {
        bilingual(d.cells?.[cand.id], `${key}/${d.id}/cell[${cand.id}]`);
      }
    }

    assert.ok(Array.isArray(c.notes) && c.notes.length >= 1, `${key}: notes`);
    for (const n of c.notes) bilingual(n, `${key}.note`);
  }
});

test('comparisonFor', () => {
  assert.equal(comparisonFor('types')?.id, 'types');
  assert.equal(comparisonFor('bindings')?.id, 'bindings');
  assert.equal(comparisonFor('inconnu'), null);
});
