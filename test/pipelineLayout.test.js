import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layout } from '../src/pipeline/layout.js';

test('gitlab: column = stage index', () => {
  const model = {
    format: 'gitlab',
    stages: ['build', 'test', 'deploy'],
    jobs: [
      { id: 'compile', stage: 'build', needs: [] },
      { id: 'unit', stage: 'test', needs: ['compile'] },
      { id: 'ship', stage: 'deploy', needs: ['unit'] },
    ],
    errors: [],
  };
  const out = layout(model);
  const col = (id) => out.nodes.find((n) => n.id === id).col;
  assert.equal(col('compile'), 0);
  assert.equal(col('unit'), 1);
  assert.equal(col('ship'), 2);
  assert.equal(out.cols, 3);
  assert.deepEqual(out.edges.map((e) => `${e.from}->${e.to}`).sort(), ['compile->unit', 'unit->ship']);
});

test('github: column = topological depth (longest path from a root)', () => {
  const model = {
    format: 'github',
    stages: [],
    jobs: [
      { id: 'a', needs: [] },
      { id: 'b', needs: ['a'] },
      { id: 'c', needs: ['a'] },
      { id: 'd', needs: ['b', 'c'] },
    ],
    errors: [],
  };
  const out = layout(model);
  const col = (id) => out.nodes.find((n) => n.id === id).col;
  assert.equal(col('a'), 0);
  assert.equal(col('b'), 1);
  assert.equal(col('c'), 1);
  assert.equal(col('d'), 2);
});

test('rows within a column are distinct (no overlap)', () => {
  const model = {
    format: 'github',
    stages: [],
    jobs: [
      { id: 'a', needs: [] },
      { id: 'b', needs: [] },
      { id: 'c', needs: [] },
    ],
    errors: [],
  };
  const out = layout(model);
  const rows = out.nodes.map((n) => n.row);
  assert.equal(new Set(rows).size, rows.length, 'each root gets its own row');
});

test('layout is deterministic for the same model', () => {
  const model = {
    format: 'gitlab',
    stages: ['a', 'b'],
    jobs: [{ id: 'x', stage: 'a', needs: [] }, { id: 'y', stage: 'b', needs: ['x'] }],
    errors: [],
  };
  assert.deepEqual(layout(model), layout(model));
});

test('empty model yields no nodes', () => {
  const out = layout({ format: 'github', stages: [], jobs: [], errors: [] });
  assert.deepEqual(out.nodes, []);
  assert.deepEqual(out.edges, []);
});
