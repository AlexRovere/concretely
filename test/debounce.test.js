import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEBOUNCE_SCENARIOS,
  debounceScenarioById,
  simulate,
  summaryOf,
} from '../src/debounce.js';

function run(scenario) {
  const gen = simulate(scenario);
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, summary: res.value };
}

test('recherche: bursts collapse to one trailing debounce per pause', () => {
  const { summary } = run(debounceScenarioById('recherche'));
  assert.deepEqual(summary.debounceFires, [5, 10, 15]);
  assert.deepEqual(summary.throttleFires, [0, 6, 12]);
  assert.equal(summary.rawCalls, 6);
});

test('scroll: debounce never fires during the stream, throttle paces it', () => {
  const { summary } = run(debounceScenarioById('scroll'));
  assert.deepEqual(summary.debounceFires, [12]);
  assert.deepEqual(summary.throttleFires, [0, 3, 6, 9]);
  assert.equal(summary.rawCalls, 10);
});

test('debounce never fires within `wait` ticks of an event', () => {
  for (const s of DEBOUNCE_SCENARIOS) {
    const { steps } = run(s);
    const eventTicks = steps.filter((x) => x.event).map((x) => x.t);
    for (const step of steps) {
      if (step.debounce !== 'fired') continue;
      for (const e of eventTicks) {
        assert.ok(
          step.t - e >= s.wait || step.t < e,
          `${s.id}: debounce fired at ${step.t} only ${step.t - e} ticks after event ${e}`,
        );
      }
    }
  }
});

test('throttle fires are at least `wait` ticks apart', () => {
  for (const s of DEBOUNCE_SCENARIOS) {
    const { summary } = run(s);
    const fires = summary.throttleFires;
    for (let i = 1; i < fires.length; i++) {
      assert.ok(
        fires[i] - fires[i - 1] >= s.wait,
        `${s.id}: throttle fires ${fires[i - 1]} and ${fires[i]} too close`,
      );
    }
  }
});

test('one snapshot per tick, and every event tick has raw true', () => {
  for (const s of DEBOUNCE_SCENARIOS) {
    const { steps } = run(s);
    assert.equal(steps.length, s.duration, `${s.id} snapshot count`);
    for (let i = 0; i < steps.length; i++) {
      assert.equal(steps[i].type, 'tick', s.id);
      assert.equal(steps[i].t, i, `${s.id} tick numbering`);
      if (steps[i].event) assert.equal(steps[i].raw, true, `${s.id} raw on event tick ${i}`);
    }
  }
});

test('summaryOf agrees with draining the generator', () => {
  for (const s of DEBOUNCE_SCENARIOS) {
    const { summary } = run(s);
    assert.deepEqual(summaryOf(s), summary, s.id);
  }
});

test('generic: scenarios expose code and events', () => {
  for (const s of DEBOUNCE_SCENARIOS) {
    assert.equal(typeof s.code, 'string', s.id);
    assert.ok(s.code.length > 0, s.id);
    assert.ok(Array.isArray(s.events) && s.events.length > 0, s.id);
    assert.equal(typeof s.wait, 'number', s.id);
  }
});
