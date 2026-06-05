import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LIFECYCLE_SCENARIOS,
  simulate,
  summaryOf,
  lifecycleScenarioById,
} from '../src/lifecycle.js';

function run(gen) {
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, value: res.value };
}

test('rotation: exact callback sequence, instance n===2, finalState resumed', () => {
  const s = lifecycleScenarioById('rotation');
  const { steps, value } = run(simulate(s.actions));
  assert.deepEqual(value.events, [
    'onCreate', 'onStart', 'onResume',
    'onPause', 'onStop', 'onDestroy',
    'onCreate', 'onStart', 'onResume',
  ]);
  const inst = steps.find((x) => x.type === 'instance');
  assert.ok(inst && inst.n === 2, 'emits an instance step with n === 2');
  assert.equal(value.instances, 2);
  assert.equal(value.finalState, 'resumed');
});

test('home-return: exact sequence, no onDestroy, instances stays 1', () => {
  const s = lifecycleScenarioById('home-return');
  const { value } = run(simulate(s.actions));
  assert.deepEqual(value.events, [
    'onCreate', 'onStart', 'onResume',
    'onPause', 'onStop',
    'onRestart', 'onStart', 'onResume',
  ]);
  assert.ok(!value.events.includes('onDestroy'), 'no onDestroy on home/return');
  assert.equal(value.instances, 1);
  assert.equal(value.finalState, 'resumed');
});

test('back-finish: ends destroyed, no recreation after onDestroy', () => {
  const s = lifecycleScenarioById('back-finish');
  const { steps, value } = run(simulate(s.actions));
  assert.deepEqual(value.events, [
    'onCreate', 'onStart', 'onResume',
    'onPause', 'onStop', 'onDestroy',
  ]);
  assert.equal(value.finalState, 'destroyed');
  assert.equal(value.instances, 1);
  assert.ok(!steps.some((x) => x.type === 'instance'), 'no recreation');
  // onDestroy is the last callback — nothing fires after it.
  const cbs = steps.filter((x) => x.type === 'callback');
  assert.equal(cbs[cbs.length - 1].name, 'onDestroy');
});

test('the state machine rejects illegal transitions', () => {
  // onRestart from 'initialized' (no launch first) is illegal.
  assert.throws(() => summaryOf([{ action: 'return' }]), /Illegal transition/);
});

test('every callback step carries its post-callback state', () => {
  for (const s of LIFECYCLE_SCENARIOS) {
    const { steps } = run(simulate(s.actions));
    const cbs = steps.filter((x) => x.type === 'callback');
    for (const cb of cbs) {
      assert.equal(typeof cb.state, 'string', `${s.id}: ${cb.name} has a state`);
      assert.ok(cb.state.length > 0, `${s.id}: ${cb.name} state non-empty`);
    }
    // First callback of every scenario is onCreate → 'created'.
    assert.equal(cbs[0].name, 'onCreate', `${s.id} first callback`);
    assert.equal(cbs[0].state, 'created', `${s.id} first state`);
  }
});

test('scenarios expose code + actions', () => {
  assert.equal(LIFECYCLE_SCENARIOS.length, 3);
  for (const s of LIFECYCLE_SCENARIOS) {
    assert.equal(typeof s.id, 'string');
    assert.equal(typeof s.code, 'string');
    assert.ok(s.code.length > 0, `${s.id} has code`);
    assert.ok(Array.isArray(s.actions) && s.actions.length > 0, `${s.id} has actions`);
  }
});

test('summaryOf matches a manual drain of the generator', () => {
  for (const s of LIFECYCLE_SCENARIOS) {
    const { value } = run(simulate(s.actions));
    assert.deepEqual(summaryOf(s.actions), value, s.id);
  }
});
