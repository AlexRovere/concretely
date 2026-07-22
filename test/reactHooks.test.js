import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOOKS_SCENARIOS, hooksScenarioById, summaryOf } from '../src/react/hooks.js';

test('batching-value: three setCount(count+1) net to +1 (stale capture)', () => {
  const { finalCount } = summaryOf(hooksScenarioById('batching-value'));
  assert.equal(finalCount, 1);
});

test('batching-updater: three setCount(c=>c+1) net to +3', () => {
  const { finalCount } = summaryOf(hooksScenarioById('batching-updater'));
  assert.equal(finalCount, 3);
});

test('hooks-order: one updater from 5 lands on 6, effect re-runs', () => {
  const { finalCount, log } = summaryOf(hooksScenarioById('hooks-order'));
  assert.equal(finalCount, 6);
  assert.ok(log.some((l) => /rejoué/.test(l)), 'count changed → effect re-runs');
});

test('no effect re-run when state is unchanged', () => {
  const { log } = summaryOf({
    initial: 0,
    hooks: [{ type: 'state', name: 'count' }, { type: 'effect', label: 'x', deps: ['count'] }],
    handler: [{ mode: 'value', delta: 0 }],
  });
  assert.ok(!log.some((l) => /rejoué/.test(l)));
});

test('scenarios are well-formed with unique ids', () => {
  const ids = new Set();
  for (const s of HOOKS_SCENARIOS) {
    assert.ok(!ids.has(s.id), `duplicate ${s.id}`);
    ids.add(s.id);
    assert.ok(typeof s.initial === 'number', s.id);
    assert.ok(s.code.length > 10, s.id);
  }
});
