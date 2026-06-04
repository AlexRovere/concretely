import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SORTS } from '../src/sorting/algorithms.js';
import { PATHFINDERS } from '../src/pathfinding/algorithms.js';
import { createGrid } from '../src/pathfinding/grid.js';
import { SortRenderer } from '../src/render/sortRenderer.js';
import { GridRenderer } from '../src/render/gridRenderer.js';

/** Minimal headless canvas: the renderers only use these context members. */
function stubCanvas(width, height) {
  const ctx = { fillStyle: '', clearRect() {}, fillRect() {} };
  return { width, height, getContext: () => ctx };
}

test('SortRenderer replays steps without throwing and ends sorted', () => {
  const array = [9, 3, 7, 1, 8, 2, 6, 4, 5];
  const expected = [...array].sort((a, b) => a - b);
  const r = new SortRenderer(stubCanvas(400, 200), array);
  for (const step of SORTS.quick.gen(array)) r.step(step);
  r.markAllSorted();
  assert.deepEqual(r.array, expected);
});

test('GridRenderer replays pathfinding steps and records the path', () => {
  const grid = createGrid(8, 8);
  const start = [0, 0], end = [7, 7];
  const r = new GridRenderer(stubCanvas(320, 320), grid, start, end);
  for (const step of PATHFINDERS.astar.gen(grid, start, end)) r.step(step);
  assert.ok(r.path.length > 0);
  assert.deepEqual(r.path[0], start);
  assert.deepEqual(r.path.at(-1), end);
});
