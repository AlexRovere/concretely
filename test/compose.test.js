import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COMPOSE_SCENARIOS, composeScenarioById, simulate, summaryOf } from '../src/compose.js';

function steps(scenario) {
  const out = [];
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) { out.push(res.value); res = gen.next(); }
  return out;
}

test('without remember the counter never moves: writes are undone by reinit', () => {
  const { value, runs } = summaryOf(composeScenarioById('no-remember'));
  assert.equal(value, 0, 'two taps, still 0');
  assert.equal(runs.Counter, 3); // 1 composition + 2 recompositions
  const all = steps(composeScenarioById('no-remember'));
  assert.equal(all.filter((s) => s.type === 'reinit').length, 2);
  // each set(1) is followed by a reinit back to 0
  const sets = all.filter((s) => s.type === 'set');
  assert.ok(sets.every((s) => s.value === 1));
});

test('with remember the state survives recomposition', () => {
  const { value } = summaryOf(composeScenarioById('remember-fix'));
  assert.equal(value, 2);
  const all = steps(composeScenarioById('remember-fix'));
  assert.equal(all.filter((s) => s.type === 'keep').length, 2);
  assert.ok(!all.some((s) => s.type === 'reinit'));
});

test('smart recomposition: only readers re-execute, others are skipped', () => {
  const { runs } = summaryOf(composeScenarioById('smart-skip'));
  assert.equal(runs.CountText, 3, 'reader: 1 + 2 recompositions');
  assert.equal(runs.Header, 1, 'non-reader: initial composition only');
  assert.equal(runs.IncButton, 1, 'stable lambda: initial only');
  const all = steps(composeScenarioById('smart-skip'));
  const skips = all.filter((s) => s.type === 'skip').map((s) => s.fn);
  assert.deepEqual([...new Set(skips)].sort(), ['Header', 'IncButton']);
});

test('the same taps produce different end values purely from remember', () => {
  const bug = summaryOf(composeScenarioById('no-remember'));
  const fix = summaryOf(composeScenarioById('remember-fix'));
  assert.notEqual(bug.value, fix.value);
});

test('every scenario has kotlin code and terminates', () => {
  for (const s of COMPOSE_SCENARIOS) {
    assert.ok(s.code.includes('@Composable'), s.id);
    assert.ok(steps(s).length > 0, s.id);
  }
});
