import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  VDOM_SCENARIOS,
  simulate,
  summaryOf,
  vdomScenarioById,
} from '../src/vdom.js';

function run(gen) {
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, value: res.value };
}

test('both strategies converge: result deep-equals next for every scenario', () => {
  for (const s of VDOM_SCENARIOS) {
    assert.deepEqual(summaryOf(s).result, s.next, s.id);
  }
});

test('prepend-unkeyed: 2 patches + 1 insert (positions shift)', () => {
  const ops = summaryOf(vdomScenarioById('prepend-unkeyed')).ops;
  assert.equal(ops.patch, 2);
  assert.equal(ops.insert, 1);
});

test('prepend-keyed: 1 insert, 0 patch (B and C reused)', () => {
  const ops = summaryOf(vdomScenarioById('prepend-keyed')).ops;
  assert.equal(ops.insert, 1);
  assert.equal(ops.patch, 0);
  assert.ok(ops.keep + ops.move === 2, 'B and C are kept or moved');
});

test('shuffle-unkeyed: every position is patched (4 patches)', () => {
  const ops = summaryOf(vdomScenarioById('shuffle-unkeyed')).ops;
  assert.equal(ops.patch, 4);
});

test('shuffle-keyed: 0 patch, at least one move (nodes relocated, not rewritten)', () => {
  const ops = summaryOf(vdomScenarioById('shuffle-keyed')).ops;
  assert.equal(ops.patch, 0);
  assert.ok(ops.move >= 1);
});

test('keyed is never more destructive than unkeyed for the same lists', () => {
  const destructive = (ops) => ops.patch + ops.insert + ops.remove;
  const prependUnkeyed = destructive(summaryOf(vdomScenarioById('prepend-unkeyed')).ops);
  const prependKeyed = destructive(summaryOf(vdomScenarioById('prepend-keyed')).ops);
  assert.ok(prependKeyed <= prependUnkeyed);

  const shuffleUnkeyed = destructive(summaryOf(vdomScenarioById('shuffle-unkeyed')).ops);
  const shuffleKeyed = destructive(summaryOf(vdomScenarioById('shuffle-keyed')).ops);
  assert.ok(shuffleKeyed <= shuffleUnkeyed);
});

test('removal works in both modes: old [A,B] → next [A] removes 1', () => {
  for (const mode of ['unkeyed', 'keyed']) {
    const ops = summaryOf({ id: `rm-${mode}`, mode, old: ['A', 'B'], next: ['A'] }).ops;
    assert.equal(ops.remove, 1, mode);
    assert.deepEqual(summaryOf({ id: `rm-${mode}`, mode, old: ['A', 'B'], next: ['A'] }).result, ['A'], mode);
  }
});

test('every scenario has code, and ops counts match the emitted steps', () => {
  assert.equal(VDOM_SCENARIOS.length, 4);
  for (const s of VDOM_SCENARIOS) {
    assert.equal(typeof s.code, 'string', s.id);
    assert.ok(s.code.length > 0, s.id);

    const { steps, value } = run(simulate(s));
    const counted = { keep: 0, patch: 0, move: 0, insert: 0, remove: 0 };
    for (const step of steps) {
      if (step.type in counted) counted[step.type]++;
    }
    assert.deepEqual(counted, value.ops, s.id);
  }
});
