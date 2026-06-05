import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  RUBYGVL_SCENARIOS,
  rubyGvlScenarioById,
  simulate,
  summaryOf,
} from '../src/rubygvl.js';

function run(scenario) {
  const gen = simulate(scenario);
  const ticks = [];
  let res = gen.next();
  while (!res.done) { ticks.push(res.value); res = gen.next(); }
  return { ticks, summary: res.value };
}

test('cpu-bound: no speedup despite 2 cores — totalTicks >= sum (6)', () => {
  const { totalTicks } = summaryOf(rubyGvlScenarioById('cpu-bound'));
  assert.ok(totalTicks >= 6, `expected >= 6, got ${totalTicks}`);
});

test('cpu-bound: one thread runs Ruby code while the other waits on the GVL', () => {
  const { ticks } = run(rubyGvlScenarioById('cpu-bound'));
  const serialized = ticks.some(
    (s) =>
      s.running.length === 1 &&
      s.running[0].label === 'fib(35)' &&
      s.waiting.some((w) => w.reason === 'actor'),
  );
  assert.ok(serialized, 'expected exactly one GVL holder with the other thread waiting');
});

test('cpu-bound: never two GVL segments running the same tick', () => {
  const { ticks } = run(rubyGvlScenarioById('cpu-bound'));
  for (const s of ticks) {
    const inGvl = s.running.filter((x) => x.label === 'fib(35)');
    assert.ok(inGvl.length <= 1, `tick ${s.t}: two threads hold the GVL`);
  }
});

test('io-bound: real overlap — totalTicks well under the serial sum of 10', () => {
  const { totalTicks } = summaryOf(rubyGvlScenarioById('io-bound'));
  assert.ok(totalTicks <= 7, `expected <= 7, got ${totalTicks}`);
});

test('io-bound: both threads are suspended on I/O at the same tick', () => {
  const { ticks } = run(rubyGvlScenarioById('io-bound'));
  const overlap = ticks.some(
    (s) =>
      s.suspended.some((x) => x.task === 'T1') &&
      s.suspended.some((x) => x.task === 'T2'),
  );
  assert.ok(overlap, 'the two network waits should overlap');
});

test('both scenarios terminate under the cap with one snapshot per tick', () => {
  for (const s of RUBYGVL_SCENARIOS) {
    const { ticks, summary } = run(s);
    assert.ok(summary.totalTicks < 200, `${s.id} hit the tick cap`);
    assert.equal(ticks.length, summary.totalTicks, `${s.id} snapshot count`);
    ticks.forEach((snap, i) => assert.equal(snap.t, i, `${s.id} tick numbering`));
  }
});

test('scenarios have code + tasks; wrappers delegate to the engine', () => {
  for (const s of RUBYGVL_SCENARIOS) {
    assert.ok(typeof s.code === 'string' && s.code.length > 0, `${s.id} code`);
    assert.ok(Array.isArray(s.tasks) && s.tasks.length > 0, `${s.id} tasks`);
    assert.equal(rubyGvlScenarioById(s.id), s);
    const summary = summaryOf(s);
    assert.ok(Number.isInteger(summary.totalTicks) && summary.totalTicks > 0, `${s.id} totalTicks`);
    assert.ok(summary.values && typeof summary.values === 'object', `${s.id} values`);
  }
});
