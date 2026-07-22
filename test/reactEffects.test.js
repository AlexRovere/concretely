import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EFFECTS_SCENARIOS, effectsScenarioById, summaryOf } from '../src/react/effects.js';

test('deps-empty: setup once, cleanup once (on unmount), update is a no-op', () => {
  const { runs, cleanups } = summaryOf(effectsScenarioById('deps-empty'));
  assert.equal(runs, 1);
  assert.equal(cleanups, 1);
});

test('deps-value: re-runs only when the dep changes', () => {
  const { runs, cleanups } = summaryOf(effectsScenarioById('deps-value'));
  assert.equal(runs, 2, 'mount + one changed update');
  assert.equal(cleanups, 2, 'one before re-run + one on unmount');
});

test('no-deps: re-runs after every render', () => {
  const { runs, cleanups } = summaryOf(effectsScenarioById('no-deps'));
  assert.equal(runs, 2);
  assert.equal(cleanups, 2);
});

test('strict-mode: dev double-invoke runs setup twice on mount', () => {
  const { runs, cleanups } = summaryOf(effectsScenarioById('strict-mode'));
  assert.equal(runs, 2);
  assert.equal(cleanups, 1);
});

test('scenarios are well-formed with unique ids', () => {
  const ids = new Set();
  for (const s of EFFECTS_SCENARIOS) {
    assert.ok(!ids.has(s.id), `duplicate ${s.id}`);
    ids.add(s.id);
    assert.ok(Array.isArray(s.timeline) && s.timeline.length > 0, s.id);
    assert.ok(s.code.length > 10, s.id);
  }
});
