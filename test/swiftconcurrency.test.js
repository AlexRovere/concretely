import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONCURRENCY_SCENARIOS,
  concurrencyScenarioById,
  simulate,
  summaryOf,
} from '../src/swiftconcurrency.js';

function run(scenario) {
  const gen = simulate(scenario);
  const ticks = [];
  let res = gen.next();
  while (!res.done) { ticks.push(res.value); res = gen.next(); }
  return { ticks, summary: res.value };
}

test('await-frees-thread: B runs ON MAIN while A is suspended on io', () => {
  const { ticks } = run(concurrencyScenarioById('await-frees-thread'));
  const overlap = ticks.some(
    (s) =>
      s.suspended.some((x) => x.task === 'A') &&
      s.running.some((x) => x.task === 'B' && x.lane === 'main'),
  );
  assert.ok(overlap, 'B should run on main while A awaits');
});

test('await-frees-thread: overlap beats the serial sum (totalTicks <= 6)', () => {
  const { totalTicks } = summaryOf(concurrencyScenarioById('await-frees-thread'));
  assert.ok(totalTicks <= 6, `expected <= 6, got ${totalTicks}`);
});

test('async-let-parallel: U and S run simultaneously on two different lanes', () => {
  const { ticks } = run(concurrencyScenarioById('async-let-parallel'));
  const parallel = ticks.some((s) => {
    const u = s.running.find((x) => x.task === 'U');
    const v = s.running.find((x) => x.task === 'S');
    return u && v && u.lane !== v.lane;
  });
  assert.ok(parallel, 'U and S should run in parallel on distinct lanes');
});

test('async-let-parallel: totalTicks beats the serial sum (1+3+2+1 = 7)', () => {
  const { totalTicks } = summaryOf(concurrencyScenarioById('async-let-parallel'));
  assert.ok(totalTicks < 7, `expected < 7, got ${totalTicks}`);
});

test('actor-serializes: the two actor segments never overlap', () => {
  const { ticks } = run(concurrencyScenarioById('actor-serializes'));
  for (const s of ticks) {
    const inActor = s.running.filter((x) => x.label === 'increment()');
    assert.ok(inActor.length <= 1, `tick ${s.t}: two tasks inside the actor`);
  }
});

test('actor-serializes: some tick has a task waiting with reason "actor"', () => {
  const { ticks } = run(concurrencyScenarioById('actor-serializes'));
  const waited = ticks.some((s) => s.waiting.some((w) => w.reason === 'actor'));
  assert.ok(waited, 'B should wait on the actor lock at some tick');
});

test('actor-serializes: final count is exactly 2 (no lost update)', () => {
  const { values } = summaryOf(concurrencyScenarioById('actor-serializes'));
  assert.equal(values.counter.count, 2);
});

test('every scenario has code and tasks, and is found by id', () => {
  for (const s of CONCURRENCY_SCENARIOS) {
    assert.ok(typeof s.code === 'string' && s.code.length > 0, `${s.id} code`);
    assert.ok(Array.isArray(s.tasks) && s.tasks.length > 0, `${s.id} tasks`);
    assert.equal(concurrencyScenarioById(s.id), s);
  }
});

test('engine terminates under the cap and yields one snapshot per tick', () => {
  for (const s of CONCURRENCY_SCENARIOS) {
    const { ticks, summary } = run(s);
    assert.ok(summary.totalTicks < 200, `${s.id} hit the tick cap`);
    assert.equal(ticks.length, summary.totalTicks, `${s.id} snapshot count`);
    ticks.forEach((snap, i) => assert.equal(snap.t, i, `${s.id} tick numbering`));
  }
});
