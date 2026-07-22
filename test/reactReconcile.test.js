import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  REACT_RECONCILE_SCENARIOS,
  reactReconcileScenarioById,
  summaryOf,
} from '../src/react/reconcile.js';

test('map-index-key (unkeyed prepend): 2 rewrites + 1 insert', () => {
  const { ops, result } = summaryOf(reactReconcileScenarioById('map-index-key'));
  assert.equal(ops.patch, 2, 'two nodes rewritten in place');
  assert.equal(ops.insert, 1, 'one node inserted');
  assert.deepEqual(result, ['A', 'B', 'C']);
});

test('map-stable-key (keyed prepend): 1 insert, nothing rewritten', () => {
  const { ops } = summaryOf(reactReconcileScenarioById('map-stable-key'));
  assert.equal(ops.insert, 1);
  assert.equal(ops.patch, 0, 'keyed reconciliation never rewrites content');
});

test('reorder-index (unkeyed shuffle): every position rewritten', () => {
  const { ops } = summaryOf(reactReconcileScenarioById('reorder-index'));
  assert.equal(ops.patch, 4);
  assert.equal(ops.move, 0);
});

test('reorder-key (keyed shuffle): nodes moved, never rewritten', () => {
  const { ops } = summaryOf(reactReconcileScenarioById('reorder-key'));
  assert.equal(ops.patch, 0);
  assert.ok(ops.move >= 1, 'at least one node relocated');
});

test('scenarios are well-formed with unique ids', () => {
  const ids = new Set();
  for (const s of REACT_RECONCILE_SCENARIOS) {
    assert.ok(!ids.has(s.id), `duplicate ${s.id}`);
    ids.add(s.id);
    assert.ok(['keyed', 'unkeyed'].includes(s.mode), s.id);
    assert.ok(Array.isArray(s.old) && Array.isArray(s.next), s.id);
    assert.ok(s.code.length > 10, s.id);
  }
});
