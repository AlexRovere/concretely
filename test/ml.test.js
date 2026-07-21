import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, blobs, linear, moons } from '../src/ml/datasets.js';
import { kmeansSteps } from '../src/ml/kmeans.js';
import { gradientSteps } from '../src/ml/gradient.js';
import { knnClassify, knnRegionGrid } from '../src/ml/knn.js';
import { decisionTreeSteps, buildTree, gini } from '../src/ml/tree.js';

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

test('linear returns n points in the unit square, no labels', () => {
  const pts = linear({ n: 40, seed: 3 });
  assert.equal(pts.length, 40);
  assert.ok(pts.every((p) => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1));
  assert.ok(pts.every((p) => p.label === undefined));
  assert.deepEqual(linear({ n: 10, seed: 3 }), linear({ n: 10, seed: 3 }));
});

test('moons returns two interleaved classes in the unit square', () => {
  const pts = moons({ n: 120, seed: 2 });
  assert.equal(pts.length, 120);
  assert.ok(pts.every((p) => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1));
  assert.deepEqual(new Set(pts.map((p) => p.label)), new Set([0, 1]));
});

test('gradientSteps loss is non-increasing and fits the trend', () => {
  const pts = linear({ n: 60, slope: 0.6, intercept: 0.2, noise: 0.03, seed: 8 });
  const frames = gradientSteps(pts, { lr: 0.3, epochs: 50 });
  assert.equal(frames.length, 51); // epoch 0 + 50 updates
  for (let i = 1; i < frames.length; i++) {
    assert.ok(frames[i].loss <= frames[i - 1].loss + 1e-9, `epoch ${i}: ${frames[i].loss} > ${frames[i - 1].loss}`);
  }
  const last = frames[frames.length - 1];
  assert.ok(last.loss < frames[0].loss); // learned something
  assert.ok(last.a > 0.3 && last.a < 0.9); // slope near the true 0.6
  assert.ok(last.line && last.line.a === last.a);
});

test('gradientSteps is deterministic', () => {
  const pts = linear({ n: 30, seed: 4 });
  assert.deepEqual(gradientSteps(pts, { lr: 0.3, epochs: 20 }), gradientSteps(pts, { lr: 0.3, epochs: 20 }));
});

test('knnClassify votes the majority class of the k nearest', () => {
  const pts = [
    { x: 0.1, y: 0.1, label: 0 },
    { x: 0.12, y: 0.12, label: 0 },
    { x: 0.9, y: 0.9, label: 1 },
  ];
  assert.equal(knnClassify(pts, 3, 0.1, 0.1), 0); // near the two class-0 points
  assert.equal(knnClassify(pts, 1, 0.88, 0.88), 1); // nearest is class 1
  assert.equal(knnClassify([], 3, 0.5, 0.5), -1); // empty -> no class
});

test('knnRegionGrid is deterministic and shaped res*res', () => {
  const pts = blobs({ k: 3, n: 90, seed: 6 });
  const g1 = knnRegionGrid(pts, 5, 24);
  const g2 = knnRegionGrid(pts, 5, 24);
  assert.equal(g1.res, 24);
  assert.equal(g1.cells.length, 24 * 24);
  assert.deepEqual([...g1.cells], [...g2.cells]);
  assert.ok([...g1.cells].every((c) => c >= 0 && c < 3)); // every cell classified
});

test('gini is 0 for a pure set and >0 for a mixed set', () => {
  assert.equal(gini([{ label: 0 }, { label: 0 }]), 0);
  assert.ok(gini([{ label: 0 }, { label: 1 }]) > 0);
});

test('buildTree first split reduces weighted impurity', () => {
  const pts = blobs({ k: 2, n: 80, seed: 9 });
  const tree = buildTree(pts, { maxDepth: 4 });
  assert.ok(tree.split, 'root should split a mixed set');
  const wl = tree.left.n / tree.n;
  const wr = tree.right.n / tree.n;
  const weighted = wl * tree.left.gini + wr * tree.right.gini;
  assert.ok(weighted < tree.gini + 1e-9, `weighted ${weighted} !< parent ${tree.gini}`);
});

test('decisionTreeSteps: splits grow, deterministic, tree fits training data', () => {
  const pts = blobs({ k: 3, n: 120, seed: 11 });
  const { frames } = decisionTreeSteps(pts, { maxDepth: 5, res: 30 });
  assert.ok(frames.length >= 2);
  frames.forEach((f, i) => {
    assert.equal(f.splits.length, i); // frame i reveals i splits
    assert.equal(f.regions, i + 1);
    assert.equal(f.regionGrid.cells.length, 30 * 30);
  });
  // determinism
  const again = decisionTreeSteps(pts, { maxDepth: 5, res: 30 });
  assert.deepEqual([...frames[frames.length - 1].regionGrid.cells], [...again.frames[again.frames.length - 1].regionGrid.cells]);
});
