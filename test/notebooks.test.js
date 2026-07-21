import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NOTEBOOKS, isValidNotebook, notebookById } from '../src/notebooks/index.js';

test('every shipped notebook is well-formed', () => {
  assert.ok(NOTEBOOKS.length >= 2);
  for (const nb of NOTEBOOKS) {
    assert.ok(isValidNotebook(nb), `invalid notebook: ${nb.id}`);
    assert.ok(nb.title.fr && nb.title.en, `${nb.id}: bilingual title`);
  }
});

test('notebook ids are unique', () => {
  const ids = NOTEBOOKS.map((nb) => nb.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('notebookById resolves and returns null for unknown', () => {
  assert.equal(notebookById('scratch')?.id, 'scratch');
  assert.equal(notebookById('nope'), null);
});

test('isValidNotebook rejects malformed inputs', () => {
  assert.equal(isValidNotebook(null), false);
  assert.equal(isValidNotebook({ id: '', title: { fr: 'a', en: 'b' }, cells: [] }), false);
  assert.equal(isValidNotebook({ id: 'x', title: { fr: 'a' }, cells: [{ type: 'code', source: 'x' }] }), false); // missing en
  assert.equal(isValidNotebook({ id: 'x', title: { fr: 'a', en: 'b' }, cells: [] }), false); // no cells
  assert.equal(isValidNotebook({ id: 'x', title: { fr: 'a', en: 'b' }, cells: [{ type: 'code', source: '   ' }] }), false); // empty code
  assert.equal(isValidNotebook({ id: 'x', title: { fr: 'a', en: 'b' }, cells: [{ type: 'plot', source: 'x' }] }), false); // bad type
  assert.equal(isValidNotebook({ id: 'x', title: { fr: 'a', en: 'b' }, cells: [{ type: 'markdown', source: '' }] }), true); // empty markdown OK
});
