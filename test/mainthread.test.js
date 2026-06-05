import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAINTHREAD_SCENARIOS,
  mainthreadScenarioById,
  simulate,
  summaryOf,
} from '../src/mainthread.js';

function run(scenario) {
  const gen = simulate(scenario);
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, summary: res.value };
}

test('block-main: heavy work on main drops frames and queues taps', () => {
  const { summary } = run(mainthreadScenarioById('block-main'));
  assert.ok(summary.droppedFrames >= 5, `droppedFrames=${summary.droppedFrames}`);
  // Taps are only handled after the 6-tick work (started at t=1) has ended.
  assert.ok(summary.tapLatency[3] > 6, `tap@3 handled at ${summary.tapLatency[3]}`);
});

test('block-main: taps are handled in FIFO order', () => {
  const { summary } = run(mainthreadScenarioById('block-main'));
  assert.ok(summary.tapLatency[5] > summary.tapLatency[3] - 1);
});

test('block-main: some dropped frame coincides with taps waiting', () => {
  const { steps } = run(mainthreadScenarioById('block-main'));
  assert.ok(steps.some((s) => s.frame === 'dropped' && s.pendingTaps >= 1));
});

test('dispatch-bg: UI stays fluid and taps are handled promptly', () => {
  const { summary } = run(mainthreadScenarioById('dispatch-bg'));
  assert.equal(summary.droppedFrames, 0);
  assert.ok(summary.tapLatency[3] <= 4, `tap@3 handled at ${summary.tapLatency[3]}`);
  assert.ok(summary.tapLatency[5] <= 6, `tap@5 handled at ${summary.tapLatency[5]}`);
});

test('dispatch-bg: the final UI update hops back to the main thread', () => {
  const summary = summaryOf(mainthreadScenarioById('dispatch-bg'));
  assert.equal(summary.uiUpdatedOnMain, true);
});

test('dispatch-bg: bg runs the heavy work while main is free, frames ok', () => {
  const { steps } = run(mainthreadScenarioById('dispatch-bg'));
  const work = mainthreadScenarioById('dispatch-bg').work;
  assert.ok(steps.some((s) =>
    s.bg && s.bg.label === work.label
    && (s.main === null || s.handledTap !== undefined)
    && s.frame === 'ok'));
});

test('both scenarios: under the tick cap, one snapshot per tick', () => {
  for (const s of MAINTHREAD_SCENARIOS) {
    const { steps, summary } = run(s);
    assert.ok(summary.totalTicks < 60, `${s.id} totalTicks=${summary.totalTicks}`);
    assert.equal(steps.length, summary.totalTicks, `${s.id} snapshot count`);
    for (let i = 0; i < steps.length; i++) {
      assert.equal(steps[i].type, 'tick', s.id);
      assert.equal(steps[i].t, i, `${s.id} tick numbering`);
    }
  }
});

test('the comparison is fair: both works last the same 6 ticks', () => {
  for (const s of MAINTHREAD_SCENARIOS) assert.equal(s.work.ticks, 6, s.id);
});
