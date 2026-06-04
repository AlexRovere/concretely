import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyMetrics, accumulate, totalMetrics } from '../src/metrics.js';
import { SORTS } from '../src/sorting/algorithms.js';
import { PATHFINDERS } from '../src/pathfinding/algorithms.js';
import { createGrid } from '../src/pathfinding/grid.js';

test('emptyMetrics starts at zero', () => {
  assert.deepEqual(emptyMetrics(), {
    compares: 0, swaps: 0, writes: 0, visits: 0, frontier: 0, pathLength: 0,
  });
});

test('accumulate counts each step type', () => {
  const m = emptyMetrics();
  accumulate(m, { type: 'compare', a: 0, b: 1 });
  accumulate(m, { type: 'swap', a: 0, b: 1 });
  accumulate(m, { type: 'set', index: 0, value: 9 });
  accumulate(m, { type: 'visit', r: 0, c: 0 });
  accumulate(m, { type: 'frontier', r: 0, c: 1 });
  accumulate(m, { type: 'path', cells: [[0, 0], [0, 1], [0, 2]] });
  assert.equal(m.compares, 1);
  assert.equal(m.swaps, 1);
  assert.equal(m.writes, 1);
  assert.equal(m.visits, 1);
  assert.equal(m.frontier, 1);
  assert.equal(m.pathLength, 3);
});

test('totalMetrics matches raw step counts for a sort run', () => {
  const input = [5, 2, 9, 1, 7, 3];
  const steps = [...SORTS.bubble.gen(input)];
  const m = totalMetrics(steps);
  assert.equal(m.compares, steps.filter((s) => s.type === 'compare').length);
  assert.equal(m.swaps, steps.filter((s) => s.type === 'swap').length);
});

test('pathfinding metrics record visits and final path length', () => {
  const grid = createGrid(6, 6);
  const steps = [...PATHFINDERS.bfs.gen(grid, [0, 0], [5, 5])];
  const m = totalMetrics(steps);
  assert.ok(m.visits > 0);
  assert.equal(m.pathLength, steps.find((s) => s.type === 'path').cells.length);
});
