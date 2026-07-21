import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, blobs } from '../src/ml/datasets.js';

test('mulberry32 is deterministic for a given seed', () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  const seqA = [a(), a(), a()];
  const seqB = [b(), b(), b()];
  assert.deepEqual(seqA, seqB);
  assert.ok(seqA.every((v) => v >= 0 && v < 1));
});

test('blobs returns n points in the unit square with k labels', () => {
  const pts = blobs({ k: 3, n: 150, seed: 1 });
  assert.equal(pts.length, 150);
  assert.ok(pts.every((p) => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1));
  const labels = new Set(pts.map((p) => p.label));
  assert.equal(labels.size, 3);
});

test('blobs is reproducible for the same seed', () => {
  assert.deepEqual(blobs({ k: 3, n: 20, seed: 5 }), blobs({ k: 3, n: 20, seed: 5 }));
});
