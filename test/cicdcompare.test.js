import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CICD_COMPARISON as C } from '../src/cicdcompare.js';

test('comparison is well-formed', () => {
  assert.equal(C.id, 'cicd');
  assert.ok(C.intro.fr && C.intro.en, 'bilingual intro');
  assert.deepEqual(C.candidates.map((c) => c.id), ['gitlab', 'github']);
  assert.ok(C.dimensions.length >= 6, `only ${C.dimensions.length} dimensions`);
});

test('every dimension has a bilingual label and a cell for BOTH candidates', () => {
  const ids = new Set();
  for (const d of C.dimensions) {
    assert.ok(!ids.has(d.id), `duplicate dimension ${d.id}`);
    ids.add(d.id);
    assert.ok(d.label.fr && d.label.en, `${d.id}: label`);
    for (const cand of ['gitlab', 'github']) {
      const cell = d.cells[cand];
      assert.ok(cell && cell.fr && cell.en, `${d.id}: missing bilingual cell for ${cand}`);
    }
  }
});
