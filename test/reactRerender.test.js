import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RERENDER_SCENARIOS, rerenderScenarioById, summaryOf, simulate } from '../src/react/rerender.js';

test('no-memo: the whole subtree re-renders', () => {
  const { rendered, skipped } = summaryOf(rerenderScenarioById('no-memo'));
  assert.deepEqual(rendered, ['App', 'Toolbar', 'Content', 'Sidebar', 'Article', 'StatusBar']);
  assert.deepEqual(skipped, []);
});

test('memo-blocks: memo with unchanged props skips the subtree', () => {
  const { rendered, skipped } = summaryOf(rerenderScenarioById('memo-blocks'));
  assert.deepEqual(rendered, ['App', 'Toolbar', 'StatusBar']);
  assert.deepEqual(skipped, ['Content', 'Sidebar', 'Article']);
});

test('memo-broken: unstable props defeat memo, everything re-renders', () => {
  const { rendered, skipped } = summaryOf(rerenderScenarioById('memo-broken'));
  assert.equal(rendered.length, 6);
  assert.deepEqual(skipped, []);
});

test('the skip reason marks the memo boundary', () => {
  const steps = [...simulate(rerenderScenarioById('memo-blocks'))];
  const contentSkip = steps.find((s) => s.type === 'skip' && s.node === 'Content');
  assert.equal(contentSkip.reason, 'memo');
  const childSkip = steps.find((s) => s.type === 'skip' && s.node === 'Sidebar');
  assert.equal(childSkip.reason, 'parent-skipped');
});

test('scenarios are well-formed with unique ids', () => {
  const ids = new Set();
  for (const s of RERENDER_SCENARIOS) {
    assert.ok(!ids.has(s.id), `duplicate ${s.id}`);
    ids.add(s.id);
    assert.ok(s.root && s.updateAt, s.id);
    assert.ok(s.code.length > 10, s.id);
  }
});
