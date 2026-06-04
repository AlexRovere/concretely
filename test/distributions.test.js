import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DISTRIBUTIONS, generateArray } from '../src/distributions.js';

// deterministic RNG so the suite is reproducible
function lcg(seed = 12345) {
  let s = seed >>> 0;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

const ids = DISTRIBUTIONS.map((d) => d.id);

test('every distribution produces an array of the requested length within range', () => {
  for (const id of ids) {
    const a = generateArray(50, id, lcg());
    assert.equal(a.length, 50, id);
    assert.ok(a.every((v) => v >= 5 && v <= 100), `${id} out of range`);
  }
});

test('sorted is ascending and reversed is descending', () => {
  const sorted = generateArray(40, 'sorted');
  assert.deepEqual(sorted, [...sorted].sort((a, b) => a - b));

  const rev = generateArray(40, 'reversed');
  for (let i = 1; i < rev.length; i++) assert.ok(rev[i - 1] >= rev[i], 'not descending');
});

test('few-unique uses at most 4 distinct values', () => {
  const a = generateArray(100, 'few', lcg(7));
  assert.ok(new Set(a).size <= 4);
});

test('nearly-sorted is mostly ordered (few adjacent inversions)', () => {
  const a = generateArray(100, 'nearly', lcg(99));
  let inversions = 0;
  for (let i = 1; i < a.length; i++) if (a[i - 1] > a[i]) inversions++;
  assert.ok(inversions <= 30, `too many inversions: ${inversions}`);
});

test('unknown distribution falls back to random length', () => {
  assert.equal(generateArray(10, 'nope', lcg()).length, 10);
});
