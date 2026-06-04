import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildTree, traverse, search, layout, BST_DEMO } from '../src/bst.js';
import { editDistance, editDistanceValue, DP_SCENARIOS } from '../src/dp.js';
import { run, accepts, AUTOMATA, automatonById } from '../src/automaton.js';

/* ----------------------------------------------------------------------- BST */

test('BST in-order traversal yields sorted values', () => {
  const tree = buildTree(BST_DEMO);
  const values = [...traverse(tree, 'in')].map((s) => s.value);
  assert.deepEqual(values, [...BST_DEMO].sort((a, b) => a - b));
});

test('BST pre-order starts at the root, post-order ends at the root', () => {
  const tree = buildTree(BST_DEMO);
  const pre = [...traverse(tree, 'pre')].map((s) => s.value);
  const post = [...traverse(tree, 'post')].map((s) => s.value);
  assert.equal(pre[0], BST_DEMO[0]); // first inserted value is the root
  assert.equal(post[post.length - 1], BST_DEMO[0]);
});

test('BST search hits an existing value and misses an absent one', () => {
  const tree = buildTree(BST_DEMO);
  const hit = [...search(tree, 65)];
  const miss = [...search(tree, 55)];
  assert.equal(hit[hit.length - 1].type, 'found');
  assert.equal(miss[miss.length - 1].type, 'notfound');
  // every step on the path is a comparison
  assert.ok(hit.slice(0, -1).every((s) => s.type === 'compare'));
});

test('BST layout positions every node with a unique x', () => {
  const tree = buildTree(BST_DEMO);
  const { pos, width } = layout(tree);
  assert.equal(Object.keys(pos).length, BST_DEMO.length);
  assert.equal(width, BST_DEMO.length);
  const xs = Object.values(pos).map((p) => p.x);
  assert.equal(new Set(xs).size, xs.length); // all x distinct (in-order index)
});

/* ------------------------------------------------------------------------ DP */

test('edit distance matches known values', () => {
  assert.equal(editDistanceValue('kitten', 'sitting'), 3);
  assert.equal(editDistanceValue('sunday', 'saturday'), 3);
  assert.equal(editDistanceValue('flaw', 'lawn'), 2);
  assert.equal(editDistanceValue('', ''), 0);
  assert.equal(editDistanceValue('abc', 'abc'), 0);
  assert.equal(editDistanceValue('abc', ''), 3);
});

test('editDistance fills the whole table and the last cell is the distance', () => {
  for (const { a, b } of DP_SCENARIOS) {
    const steps = [...editDistance(a, b)];
    assert.equal(steps.length, (a.length + 1) * (b.length + 1));
    const last = steps[steps.length - 1];
    assert.equal(last.i, a.length);
    assert.equal(last.j, b.length);
    assert.equal(last.value, editDistanceValue(a, b));
  }
});

/* ----------------------------------------------------------------- Automaton */

test('DFAs accept / reject the expected strings', () => {
  const aStarB = automatonById('a*b').dfa;
  assert.equal(accepts(aStarB, 'aaab'), true);
  assert.equal(accepts(aStarB, 'b'), true);
  assert.equal(accepts(aStarB, 'aa'), false);
  assert.equal(accepts(aStarB, 'abb'), false);

  const abPlus = automatonById('(ab)+').dfa;
  assert.equal(accepts(abPlus, 'abab'), true);
  assert.equal(accepts(abPlus, 'aba'), false);

  const div3 = automatonById('binary ÷ 3').dfa;
  assert.equal(accepts(div3, '110'), true); // 6
  assert.equal(accepts(div3, '1001'), true); // 9
  assert.equal(accepts(div3, '101'), false); // 5
  assert.equal(accepts(div3, '111'), false); // 7
});

test('run() final step agrees with accepts()', () => {
  for (const a of AUTOMATA) {
    for (const input of a.inputs) {
      const steps = [...run(a.dfa, input)];
      const last = steps[steps.length - 1];
      assert.equal(last.type === 'accept', accepts(a.dfa, input));
    }
  }
});
