import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  VUEREACTIVITY_SCENARIOS, vueReactivityScenarioById, simulate, summaryOf,
} from '../src/vuereactivity.js';

function steps(scenario) {
  const out = [];
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) { out.push(res.value); res = gen.next(); }
  return out;
}

test('reads are tracked, writes trigger exactly the subscribed effects', () => {
  const sc = vueReactivityScenarioById('track-trigger');
  const all = steps(sc);
  assert.ok(all.some((s) => s.type === 'track' && s.prop === 'count' && s.effect === 'watchEffect'));
  const triggers = all.filter((s) => s.type === 'trigger');
  assert.deepEqual(triggers.find((s) => s.prop === 'count').effects, ['watchEffect']);
  assert.deepEqual(triggers.find((s) => s.prop === 'autre').effects, [], 'nobody reads autre');
});

test('the effect re-runs on a tracked write, not on an untracked one', () => {
  const { runs } = summaryOf(vueReactivityScenarioById('track-trigger'));
  assert.equal(runs.watchEffect, 2, '1 initial + 1 for count, 0 for autre');
});

test('computed evaluates lazily and caches until dirty', () => {
  const sc = vueReactivityScenarioById('computed-cache');
  const all = steps(sc);
  const kinds = all.filter((s) => ['evaluate', 'cachehit', 'dirty'].includes(s.type)).map((s) => s.type);
  assert.deepEqual(kinds, ['evaluate', 'cachehit', 'dirty', 'evaluate']);
  const { evaluations } = summaryOf(sc);
  assert.equal(evaluations.double, 2, '3 reads but only 2 computations');
});

test('a write marks the computed dirty without recomputing it', () => {
  const all = steps(vueReactivityScenarioById('computed-cache'));
  const iSet = all.findIndex((s) => s.type === 'set' && s.prop === 'count');
  const after = all.slice(iSet + 1);
  assert.equal(after[0].type, 'trigger');
  assert.equal(after[1].type, 'dirty');
  const iEval = after.findIndex((s) => s.type === 'evaluate');
  const iRead = after.findIndex((s) => s.type === 'evaluate' && s.value === 10);
  assert.equal(iEval, iRead, 'the recomputation happens at read time with the new value');
});

test('computed values are correct (0 cached, then 10)', () => {
  const all = steps(vueReactivityScenarioById('computed-cache'));
  const values = all.filter((s) => s.type === 'evaluate' || s.type === 'cachehit').map((s) => s.value);
  assert.deepEqual(values, [0, 0, 10]);
});

test('every scenario has code and terminates', () => {
  for (const s of VUEREACTIVITY_SCENARIOS) {
    assert.ok(s.code.length > 10, s.id);
    assert.ok(steps(s).length > 0, s.id);
  }
});
