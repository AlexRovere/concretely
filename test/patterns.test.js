import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PATTERNS, FAMILIES, patternsByFamily } from '../src/patterns.js';

const LANGS = ['js', 'java', 'swift', 'go', 'php', 'ruby', 'csharp'];
const bilingual = (v, id, field) => {
  assert.ok(v && typeof v.fr === 'string' && typeof v.en === 'string', `${id}: ${field} non bilingue`);
  assert.ok(v.fr.trim().length > 2 && v.en.trim().length > 2, `${id}: ${field} trop court`);
};

test('familles dans l\'ordre imposé', () => {
  assert.deepEqual(FAMILIES, ['creational', 'structural', 'behavioral']);
});

test('chaque pattern est bien formé', () => {
  const ids = new Set();
  for (const p of PATTERNS) {
    assert.ok(!ids.has(p.id), `id dupliqué: ${p.id}`);
    ids.add(p.id);
    assert.ok(FAMILIES.includes(p.family), `${p.id}: famille invalide`);
    for (const f of ['name', 'tagline', 'problem', 'solution', 'when', 'pitfalls']) bilingual(p[f], p.id, f);
    assert.ok(typeof p.pseudo === 'string' && p.pseudo.trim().length > 10, `${p.id}: pseudo trop court`);
    for (const l of LANGS) {
      assert.ok(typeof p.code?.[l] === 'string' && p.code[l].trim().length > 10, `${p.id}: code ${l} manquant/trop court`);
    }
  }
});

test('répartition 4 / 5 / 7, total 16', () => {
  assert.equal(patternsByFamily('creational').length, 4);
  assert.equal(patternsByFamily('structural').length, 5);
  assert.equal(patternsByFamily('behavioral').length, 7);
  assert.equal(PATTERNS.length, 16);
});
