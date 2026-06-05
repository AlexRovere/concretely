import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ARC_SCENARIOS, simulate, summaryOf, arcScenarioById } from '../src/arc.js';

function run(gen) {
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, value: res.value };
}

/* ------------------------------------------------------- retain / release */

test('retain-release: object is deallocated, nothing leaks', () => {
  const { objects, leaked } = summaryOf(arcScenarioById('retain-release').ops);
  assert.deepEqual(leaked, []);
  for (const o of Object.values(objects)) {
    assert.equal(o.alive, false);
    assert.equal(o.rc, 0);
  }
});

test('retain-release: rc goes 1 → 2 → 1 → 0, then dealloc', () => {
  const { steps } = run(simulate(arcScenarioById('retain-release').ops));
  const retain = steps.find((s) => s.type === 'retain');
  assert.equal(retain.rc, 2);
  assert.equal(retain.by, 'b');
  assert.deepEqual(steps.filter((s) => s.type === 'release').map((s) => s.rc), [1, 0]);
  assert.ok(steps.some((s) => s.type === 'dealloc' && s.objId === 1));
});

/* ----------------------------------------------------------- retain cycle */

test('cycle-leak: a leak step reports both unreachable objects', () => {
  const { steps } = run(simulate(arcScenarioById('cycle-leak').ops));
  const leak = steps.find((s) => s.type === 'leak');
  assert.ok(leak, 'a leak step must be emitted');
  assert.deepEqual([...leak.objIds].sort(), [1, 2]);
  assert.ok(!steps.some((s) => s.type === 'dealloc'), 'nothing is ever deallocated');
});

test('cycle-leak: both objects end alive with rc 1', () => {
  const { objects, leaked } = summaryOf(arcScenarioById('cycle-leak').ops);
  assert.deepEqual(leaked, [1, 2]);
  assert.deepEqual(objects[1], { cls: 'Person', rc: 1, alive: true });
  assert.deepEqual(objects[2], { cls: 'Apartment', rc: 1, alive: true });
});

/* -------------------------------------------------------------- weak refs */

test('weak-fix: weak assignment does not retain (Person stays at rc 1)', () => {
  const { steps } = run(simulate(arcScenarioById('weak-fix').ops));
  const weak = steps.find((s) => s.type === 'weakAssign');
  assert.deepEqual(weak, { type: 'weakAssign', objId: 1, by: 'a.tenant' });
  // The only retain is the strong p.apartment → Apartment; Person never goes past rc 1.
  assert.ok(!steps.some((s) => s.type === 'retain' && s.objId === 1));
});

test('weak-fix: dealloc cascades Person → Apartment and zeroes the weak ref', () => {
  const { steps, value } = run(simulate(arcScenarioById('weak-fix').ops));
  const deallocs = steps.filter((s) => s.type === 'dealloc').map((s) => s.objId);
  assert.deepEqual(deallocs, [1, 2], 'Person deinits first, then Apartment');
  assert.ok(steps.some((s) => s.type === 'weakZero' && s.objId === 1 && s.by === 'a.tenant'));
  assert.deepEqual(value.leaked, []);
});

/* ---------------------------------------------------------------- generic */

test('every scenario has code, ops, and matches its expected outcome', () => {
  for (const s of ARC_SCENARIOS) {
    assert.ok(s.code.length > 0, `${s.id} has code`);
    assert.ok(s.ops.length > 0, `${s.id} has ops`);
    const { objects, leaked } = summaryOf(s.ops);
    const alive = Object.keys(objects).filter((id) => objects[id].alive).map(Number);
    assert.deepEqual(alive, s.expected.alive, `${s.id} alive`);
    assert.deepEqual(leaked, s.expected.leaked, `${s.id} leaked`);
  }
});
