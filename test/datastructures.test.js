import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashCode, bucketIndex, HashMap, Stack, Queue } from '../src/datastructures.js';

test('hashCode is deterministic; bucketIndex stays in range', () => {
  assert.equal(hashCode('abc'), hashCode('abc'));
  for (const k of ['a', 'hello', 'x', '42', 'collision']) {
    const i = bucketIndex(k, 8);
    assert.ok(i >= 0 && i < 8, `${k} → ${i}`);
  }
});

test('HashMap stores and retrieves values', () => {
  const m = new HashMap(8);
  m.set('one', 1);
  m.set('two', 2);
  assert.equal(m.get('one'), 1);
  assert.equal(m.get('two'), 2);
  assert.equal(m.get('missing'), undefined);
  m.set('one', 11);
  assert.equal(m.get('one'), 11, 'update should not duplicate');
  assert.equal(m.size, 2);
});

test('colliding keys chain in the same bucket', () => {
  const m = new HashMap(4);
  const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const byBucket = new Map();
  for (const k of keys) {
    const i = m.index(k);
    byBucket.set(i, (byBucket.get(i) || 0) + 1);
  }
  // with 7 keys in <=4 buckets there must be at least one collision
  assert.ok([...byBucket.values()].some((c) => c > 1));
});

test('HashMap resizes on load factor and preserves all entries', () => {
  const m = new HashMap(4, 0.75);
  const keys = Array.from({ length: 20 }, (_, i) => `k${i}`);
  for (const k of keys) m.set(k, k.toUpperCase());
  assert.ok(m.nBuckets > 4, 'should have grown');
  assert.ok(m.loadFactor() <= 0.75 + 1e-9);
  for (const k of keys) assert.equal(m.get(k), k.toUpperCase(), `${k} lost after resize`);
  assert.equal(m.size, 20);
});

test('Stack is LIFO', () => {
  const s = new Stack();
  s.push(1); s.push(2); s.push(3);
  assert.equal(s.top, 3);
  assert.equal(s.pop(), 3);
  assert.equal(s.pop(), 2);
  assert.equal(s.size, 1);
});

test('Queue is FIFO', () => {
  const q = new Queue();
  q.enqueue('a'); q.enqueue('b'); q.enqueue('c');
  assert.equal(q.front, 'a');
  assert.equal(q.dequeue(), 'a');
  assert.equal(q.dequeue(), 'b');
  assert.equal(q.size, 1);
});
