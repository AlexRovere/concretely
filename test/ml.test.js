import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, blobs } from '../src/ml/datasets.js';
import { kmeansSteps } from '../src/ml/kmeans.js';

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

test('kmeansSteps produces frames with full snapshots', () => {
  const pts = blobs({ k: 3, n: 90, seed: 2 });
  const frames = kmeansSteps(pts, { k: 3, seed: 7 });
  assert.ok(frames.length >= 2);
  for (const f of frames) {
    assert.equal(f.centroids.length, 3);
    assert.equal(f.assignments.length, pts.length);
    assert.ok(Number.isFinite(f.inertia));
  }
});

test('kmeans inertia is non-increasing across frames (Lloyd converges)', () => {
  const pts = blobs({ k: 3, n: 120, seed: 3 });
  const frames = kmeansSteps(pts, { k: 3, seed: 7 });
  for (let i = 1; i < frames.length; i++) {
    assert.ok(frames[i].inertia <= frames[i - 1].inertia + 1e-9, `frame ${i}: ${frames[i].inertia} > ${frames[i - 1].inertia}`);
  }
});

test('kmeans is deterministic for the same points and seed', () => {
  const pts = blobs({ k: 3, n: 60, seed: 4 });
  assert.deepEqual(kmeansSteps(pts, { k: 3, seed: 7 }), kmeansSteps(pts, { k: 3, seed: 7 }));
});
