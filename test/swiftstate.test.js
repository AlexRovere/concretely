import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SWIFTSTATE_SCENARIOS, swiftStateScenarioById, simulate, finalStateOf,
} from '../src/swiftstate.js';

function steps(scenario) {
  const out = [];
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) { out.push(res.value); res = gen.next(); }
  return out;
}

/* ------------------------------------------------------ @State / @Binding */

test('@Binding writes land in the owner’s @State storage', () => {
  const { state, renders } = finalStateOf(swiftStateScenarioById('state-binding'));
  assert.equal(state.count, 2);
  // owner + binding child re-render on each tap: 1 initial + 2 taps
  assert.equal(renders.CounterView, 3);
  assert.equal(renders.IncrementButton, 3);
});

test('views that don’t read the state are skipped by the diff', () => {
  const all = steps(swiftStateScenarioById('state-binding'));
  const { renders } = finalStateOf(swiftStateScenarioById('state-binding'));
  assert.equal(renders.TitleView, 1, 'TitleView only renders once (initial)');
  assert.ok(all.some((s) => s.type === 'skip' && s.view === 'TitleView'));
});

test('set steps name the owner view, not the tapped view', () => {
  const all = steps(swiftStateScenarioById('state-binding'));
  const sets = all.filter((s) => s.type === 'set');
  assert.equal(sets.length, 2);
  for (const s of sets) assert.equal(s.view, 'CounterView');
});

/* ----------------------------------------- @ObservedObject vs @StateObject */

test('@ObservedObject created inline resets when the parent re-renders', () => {
  const { objects } = finalStateOf(swiftStateScenarioById('observed-reset'));
  const vm = objects.CounterChild;
  assert.equal(vm.values.count, 0, 'the two increments are LOST');
  assert.equal(vm.instance, 2, 'a second VM instance was created');
});

test('@StateObject keeps its instance across parent re-renders', () => {
  const { objects } = finalStateOf(swiftStateScenarioById('stateobject-fix'));
  const vm = objects.CounterChild;
  assert.equal(vm.values.count, 2, 'the increments survive');
  assert.equal(vm.instance, 1, 'still the first instance');
});

test('the difference shows as recreate vs keep steps', () => {
  const observed = steps(swiftStateScenarioById('observed-reset'));
  const stateobj = steps(swiftStateScenarioById('stateobject-fix'));
  assert.ok(observed.some((s) => s.type === 'recreate'));
  assert.ok(!observed.some((s) => s.type === 'keep'));
  assert.ok(stateobj.some((s) => s.type === 'keep'));
  assert.ok(!stateobj.some((s) => s.type === 'recreate'));
});

test('object mutations re-render only the subscribed view', () => {
  const all = steps(swiftStateScenarioById('observed-reset'));
  // bodies between the first objectSet and the next tap
  const i = all.findIndex((s) => s.type === 'objectSet');
  const j = all.findIndex((s, k) => k > i && s.type === 'tap');
  const bodies = all.slice(i, j).filter((s) => s.type === 'body');
  assert.deepEqual(bodies.map((b) => b.view), ['CounterChild']);
});

test('every scenario has swift code and at least one action', () => {
  for (const s of SWIFTSTATE_SCENARIOS) {
    assert.ok(s.code.includes('View'), s.id);
    assert.ok(s.actions.length > 0, s.id);
  }
});
