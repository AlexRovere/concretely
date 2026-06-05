import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  KTFLOW_SCENARIOS,
  simulate,
  summaryOf,
  ktFlowScenarioById,
} from '../src/ktflow.js';

function run(gen) {
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, value: res.value };
}

/* ------------------------------------------------------------------- cold */

test('cold flow re-runs the producer once per collector', () => {
  const cold = ktFlowScenarioById('cold-flow');
  const { value } = run(simulate(cold));
  assert.equal(value.producerRuns, 2);
  assert.deepEqual(value.received.A, [1, 2, 3]);
  assert.deepEqual(value.received.B, [1, 2, 3]);
});

test('cold flow produces every value once per run (6 produce steps)', () => {
  const cold = ktFlowScenarioById('cold-flow');
  const { steps } = run(simulate(cold));
  const produces = steps.filter((s) => s.type === 'produce');
  assert.equal(produces.length, 6);
});

test('cold flow finishes A entirely before B starts collecting', () => {
  const cold = ktFlowScenarioById('cold-flow');
  const { steps } = run(simulate(cold));
  const bCollect = steps.findIndex((s) => s.type === 'collect' && s.collector.id === 'B');
  const lastAReceive = steps.map((s, i) => ({ s, i }))
    .filter(({ s }) => s.type === 'receive' && s.collector.id === 'A')
    .map(({ i }) => i)
    .at(-1);
  assert.ok(lastAReceive < bCollect, 'all of A’s receives come before B’s collect');
});

/* -------------------------------------------------------------- stateflow */

test('stateflow has a single shared producer', () => {
  const sf = ktFlowScenarioById('stateflow');
  const { value } = run(simulate(sf));
  assert.equal(value.producerRuns, 1);
});

test('stateflow: A receives initial via replay then every emission', () => {
  const sf = ktFlowScenarioById('stateflow');
  const { steps, value } = run(simulate(sf));
  assert.deepEqual(value.received.A, [0, 1, 2, 3]);
  const aFirst = steps.find(
    (s) => (s.type === 'replay' || s.type === 'receive') && s.collector.id === 'A'
  );
  assert.equal(aFirst.type, 'replay');
  assert.equal(aFirst.value, 0);
});

test('stateflow: late collector B replays latest value (2) then receives 3', () => {
  const sf = ktFlowScenarioById('stateflow');
  const { steps, value } = run(simulate(sf));
  assert.deepEqual(value.received.B, [2, 3]);
  const bFirst = steps.find(
    (s) => (s.type === 'replay' || s.type === 'receive') && s.collector.id === 'B'
  );
  assert.equal(bFirst.type, 'replay');
  assert.equal(bFirst.value, 2);
});

test('stateflow produces each emission exactly once (3 produce steps)', () => {
  const sf = ktFlowScenarioById('stateflow');
  const { steps } = run(simulate(sf));
  const produces = steps.filter((s) => s.type === 'produce');
  assert.equal(produces.length, 3);
});

/* ---------------------------------------------------------------- generic */

test('every scenario ships code and matches its expected summary', () => {
  for (const s of KTFLOW_SCENARIOS) {
    assert.ok(typeof s.code === 'string' && s.code.length > 0, `${s.id} has code`);
    const got = summaryOf(s);
    assert.deepEqual(got, s.expected, s.id);
  }
});
