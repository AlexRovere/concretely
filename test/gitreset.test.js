import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GITRESET_SCENARIOS,
  simulate,
  summaryOf,
  gitResetScenarioById,
} from '../src/gitreset.js';

function run(gen) {
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, value: res.value };
}

const zoneSteps = (steps) => steps.filter((s) => s.type === 'zone');

/* ----------------------------------------------------------- add-commit */

test('add-commit: HEAD ends on C2 with app.js v2', () => {
  const { head } = summaryOf(gitResetScenarioById('add-commit').ops);
  assert.equal(head.id, 'C2');
  assert.equal(head.files['app.js'], 'v2');
});

test('add-commit: the add step copies the working content into the index', () => {
  const { steps } = run(simulate(gitResetScenarioById('add-commit').ops));
  // The last add step stages the v2 content edited in the working tree.
  const adds = steps.filter((s) => s.type === 'add' && s.file === 'app.js');
  assert.equal(adds.at(-1).content, 'v2');
});

/* ----------------------------------------------------------- reset-soft */

test('reset-soft: HEAD back to C1 but index AND working tree keep v2', () => {
  const { head, index, workingTree } = summaryOf(
    gitResetScenarioById('reset-soft').ops,
  );
  assert.equal(head.id, 'C1');
  assert.equal(head.files['app.js'], 'v1');
  assert.equal(index['app.js'], 'v2');
  assert.equal(workingTree['app.js'], 'v2');
});

test('reset-soft: exactly ONE zone step (head)', () => {
  const { steps } = run(simulate(gitResetScenarioById('reset-soft').ops));
  const zones = zoneSteps(steps);
  assert.deepEqual(zones.map((z) => z.zone), ['head']);
});

/* ---------------------------------------------------------- reset-mixed */

test('reset-mixed: index back to v1, working still v2; TWO zone steps', () => {
  const { steps, value } = run(simulate(gitResetScenarioById('reset-mixed').ops));
  assert.equal(value.head.id, 'C1');
  assert.equal(value.index['app.js'], 'v1');
  assert.equal(value.workingTree['app.js'], 'v2');
  const zones = zoneSteps(steps);
  assert.deepEqual(zones.map((z) => z.zone), ['head', 'index']);
});

/* ----------------------------------------------------------- reset-hard */

test('reset-hard: everything v1; THREE zone steps', () => {
  const { steps, value } = run(simulate(gitResetScenarioById('reset-hard').ops));
  assert.equal(value.head.id, 'C1');
  assert.equal(value.index['app.js'], 'v1');
  assert.equal(value.workingTree['app.js'], 'v1');
  const zones = zoneSteps(steps);
  assert.deepEqual(zones.map((z) => z.zone), ['head', 'index', 'working']);
});

/* ----------------------------------------------- the three modes differ */

test('the three resets differ ONLY in the zones they reset', () => {
  const soft = summaryOf(gitResetScenarioById('reset-soft').ops);
  const mixed = summaryOf(gitResetScenarioById('reset-mixed').ops);
  const hard = summaryOf(gitResetScenarioById('reset-hard').ops);

  // All three rewind HEAD to C1.
  assert.equal(soft.head.id, 'C1');
  assert.equal(mixed.head.id, 'C1');
  assert.equal(hard.head.id, 'C1');

  // Working tree: soft & mixed keep v2, hard loses it.
  assert.equal(soft.workingTree['app.js'], 'v2');
  assert.equal(mixed.workingTree['app.js'], 'v2');
  assert.equal(hard.workingTree['app.js'], 'v1');

  // Index: soft keeps v2, mixed & hard reset to v1.
  assert.equal(soft.index['app.js'], 'v2');
  assert.equal(mixed.index['app.js'], 'v1');
  assert.equal(hard.index['app.js'], 'v1');
});

/* -------------------------------------------------------------- generic */

test('every scenario has shell code and ops', () => {
  for (const s of GITRESET_SCENARIOS) {
    assert.ok(s.code.length > 0, `${s.id} has code`);
    assert.ok(s.ops.length > 0, `${s.id} has ops`);
    assert.equal(gitResetScenarioById(s.id), s, `${s.id} is resolvable by id`);
  }
});
