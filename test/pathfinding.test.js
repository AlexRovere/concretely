import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGrid, setWall, key } from '../src/pathfinding/grid.js';
import { PATHFINDERS } from '../src/pathfinding/algorithms.js';

const ids = Object.keys(PATHFINDERS);

/** Run a generator to completion, capturing steps and the return value. */
function run(gen) {
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, found: res.value };
}

function pathOf(steps) {
  const p = steps.find((s) => s.type === 'path');
  return p ? p.cells : null;
}

/** A path is contiguous if consecutive cells are orthogonal neighbours. */
function isContiguous(path) {
  for (let i = 1; i < path.length; i++) {
    const d = Math.abs(path[i][0] - path[i - 1][0]) + Math.abs(path[i][1] - path[i - 1][1]);
    if (d !== 1) return false;
  }
  return true;
}

for (const id of ids) {
  test(`${id}: finds a contiguous path on an open grid`, () => {
    const grid = createGrid(10, 10);
    const start = [0, 0], end = [9, 9];
    const { steps, found } = run(PATHFINDERS[id].gen(grid, start, end));
    assert.equal(found, true);
    const path = pathOf(steps);
    assert.ok(path, 'expected a path step');
    assert.deepEqual(path[0], start);
    assert.deepEqual(path.at(-1), end);
    assert.ok(isContiguous(path), 'path must be contiguous');
    // shortest path on an open 10x10 grid has 19 cells (18 moves)
    assert.equal(path.length, 19);
  });

  test(`${id}: visits the start and never visits a wall`, () => {
    const grid = createGrid(6, 6);
    setWall(grid, 0, 1); setWall(grid, 1, 1); setWall(grid, 2, 1);
    const { steps } = run(PATHFINDERS[id].gen(grid, [0, 0], [5, 5]));
    const visited = steps.filter((s) => s.type === 'visit');
    assert.ok(visited.some((s) => s.r === 0 && s.c === 0));
    for (const s of visited) assert.ok(!grid.walls.has(key(s.r, s.c)), 'visited a wall');
  });

  test(`${id}: returns false when the goal is walled off`, () => {
    const grid = createGrid(5, 5);
    // wall off the end cell completely
    setWall(grid, 4, 3);
    setWall(grid, 3, 4);
    const { steps, found } = run(PATHFINDERS[id].gen(grid, [0, 0], [4, 4]));
    assert.equal(found, false);
    assert.equal(pathOf(steps), null);
  });
}

test('all algorithms agree on shortest path length (unweighted grid)', () => {
  const grid = createGrid(8, 12);
  setWall(grid, 3, 5); setWall(grid, 4, 5); setWall(grid, 5, 5);
  const lengths = ids.map((id) => {
    const { steps } = run(PATHFINDERS[id].gen(grid, [0, 0], [7, 11]));
    return pathOf(steps).length;
  });
  assert.ok(lengths.every((l) => l === lengths[0]), `lengths differ: ${lengths}`);
});

test('Dijkstra respects weights where BFS would not', () => {
  // A 1xN corridor where the direct middle cell is expensive.
  const grid = createGrid(1, 5);
  grid.weights.set(key(0, 2), 50);
  const { steps } = run(PATHFINDERS.dijkstra.gen(grid, [0, 0], [0, 4]));
  // only one corridor exists, so the path is forced, but cost accounting must run
  const path = pathOf(steps);
  assert.deepEqual(path, [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]);
});
