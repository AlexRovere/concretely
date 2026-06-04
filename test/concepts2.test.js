import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VALUEREF_SCENARIOS, simulate as vrSim, finalState } from '../src/valueref.js';
import { COMBINE_SCENARIOS, simulate as cbSim, receivedOf, stagesOf } from '../src/combine.js';

function run(gen) {
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, value: res.value };
}

/* ----------------------------------------------------- value vs reference */

test('primitives are copied by value', () => {
  const { vars } = finalState(VALUEREF_SCENARIOS[0].ops);
  assert.equal(vars.a.value, 1);
  assert.equal(vars.b.value, 2);
});

test('objects are shared by reference (mutation is visible everywhere)', () => {
  const { vars, heap } = finalState(VALUEREF_SCENARIOS[1].ops);
  assert.equal(vars.o.objId, vars.p.objId, 'o and p must point to the same cell');
  assert.equal(heap[vars.o.objId].n, 2);
});

test('passing an object to a function mutates the caller’s object', () => {
  const { vars, heap } = finalState(VALUEREF_SCENARIOS[2].ops);
  assert.equal(heap[vars.x.objId].n, 15);
});

test('copy emits copyVal for primitives and copyRef for objects', () => {
  const prim = run(vrSim(VALUEREF_SCENARIOS[0].ops)).steps;
  const obj = run(vrSim(VALUEREF_SCENARIOS[1].ops)).steps;
  assert.ok(prim.some((s) => s.type === 'copyVal'));
  assert.ok(obj.some((s) => s.type === 'copyRef'));
});

/* ------------------------------------------------------------- Combine */

test('each Combine pipeline yields its documented received values', () => {
  for (const s of COMBINE_SCENARIOS) {
    assert.deepEqual(receivedOf(s.source, s.operators), s.expected, s.id);
  }
});

test('filtered-out values stop before the sink', () => {
  const s = COMBINE_SCENARIOS[0]; // map *2, filter > 5
  const { steps } = run(cbSim(s.source, s.operators));
  const drops = steps.filter((x) => x.type === 'drop').length;
  const sinks = steps.filter((x) => x.type === 'sink').length;
  assert.equal(sinks, s.expected.length);
  assert.equal(drops, s.source.length - s.expected.length);
});

test('stagesOf wraps operators with publisher and sink', () => {
  const stages = stagesOf(COMBINE_SCENARIOS[0].operators);
  assert.equal(stages[0].kind, 'source');
  assert.equal(stages.at(-1).kind, 'sink');
  assert.equal(stages.length, COMBINE_SCENARIOS[0].operators.length + 2);
});
