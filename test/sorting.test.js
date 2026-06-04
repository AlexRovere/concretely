import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SORTS, applyStep } from '../src/sorting/algorithms.js';

const allIds = Object.keys(SORTS);
// chaotic (randomized) algorithms have no finite-step guarantee on big inputs
const finiteIds = allIds.filter((id) => !SORTS[id].chaotic);

function pseudoRandomArray(n, max = 100) {
  // deterministic sequence (no Math.random) so the suite is reproducible
  const a = [];
  let x = 7;
  for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) & 0x7fffffff; a.push(x % max); }
  return a;
}

for (const id of finiteIds) {
  test(`${id}: replaying steps yields a sorted array`, () => {
    const input = pseudoRandomArray(40);
    const expected = [...input].sort((a, b) => a - b);
    const work = [...input];
    let steps = 0;
    for (const step of SORTS[id].gen(input)) {
      if (step.type === 'swap') {
        assert.ok(step.a >= 0 && step.b >= 0 && step.a < work.length && step.b < work.length);
      }
      if (step.type === 'set') {
        assert.ok(step.index >= 0 && step.index < work.length);
      }
      applyStep(work, step);
      steps++;
    }
    assert.deepEqual(work, expected, `${id} did not sort correctly`);
    assert.ok(steps > 0, `${id} produced no steps`);
  });
}

for (const id of allIds) {
  test(`${id}: does not mutate the input array`, () => {
    const input = [5, 3, 8, 1, 9, 2];
    const snapshot = [...input];
    for (const _ of SORTS[id].gen(input)) { /* drain */ }
    assert.deepEqual(input, snapshot);
  });

  test(`${id}: handles trivial inputs`, () => {
    for (const input of [[], [1], [2, 1]]) {
      const work = [...input];
      for (const step of SORTS[id].gen(input)) applyStep(work, step);
      assert.deepEqual(work, [...input].sort((a, b) => a - b));
    }
  });
}

test('already-sorted input stays sorted (all algorithms)', () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  for (const id of allIds) {
    const work = [...input];
    for (const step of SORTS[id].gen(input)) applyStep(work, step);
    assert.deepEqual(work, input, id);
  }
});

test('bogosort eventually sorts a tiny array', () => {
  const input = [3, 1, 4, 2];
  const work = [...input];
  for (const step of SORTS.bogo.gen(input, 5_000_000)) applyStep(work, step);
  assert.deepEqual(work, [1, 2, 3, 4]);
});

test('every sort exposes complexity metadata', () => {
  for (const id of allIds) {
    assert.ok(SORTS[id].complexity, `${id} missing complexity`);
    assert.ok(SORTS[id].complexity.space, `${id} missing space complexity`);
  }
});
