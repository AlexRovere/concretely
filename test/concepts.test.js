import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GROWTH, growthById, series, opsAt, formatOps } from '../src/bigo.js';
import { fib, fibNaive, fibMemo, callCount } from '../src/recursion.js';

/* -------------------------------------------------------------- Big-O ----- */

test('growth functions return expected operation counts', () => {
  assert.equal(growthById('o1').fn(123), 1);
  assert.equal(growthById('on').fn(50), 50);
  assert.equal(growthById('on2').fn(8), 64);
  assert.equal(growthById('o2n').fn(10), 1024);
  assert.equal(growthById('ologn').fn(8), 3);
});

test('every growth class is non-decreasing in n', () => {
  for (const g of GROWTH) {
    let prev = -Infinity;
    for (let n = 1; n <= 20; n++) {
      const v = g.fn(n);
      assert.ok(v >= prev, `${g.id} decreased at n=${n}`);
      prev = v;
    }
  }
});

test('series samples include the endpoints', () => {
  const pts = series((n) => n, 100);
  assert.deepEqual(pts[0], [1, 1]);
  assert.deepEqual(pts.at(-1), [100, 100]);
});

test('opsAt returns one row per class and formatOps is readable', () => {
  assert.equal(opsAt(10).length, GROWTH.length);
  assert.equal(formatOps(999), '999');
  assert.equal(formatOps(1500), '1.5K');
  assert.equal(formatOps(2_000_000), '2.0M');
  assert.equal(formatOps(Infinity), '∞');
});

/* ---------------------------------------------------------- recursion ----- */

function run(gen) {
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, result: res.value };
}

test('naive and memo both compute the correct Fibonacci number', () => {
  for (const n of [0, 1, 5, 10, 15]) {
    assert.equal(run(fibNaive(n)).result, fib(n), `naive fib(${n})`);
    assert.equal(run(fibMemo(n)).result, fib(n), `memo fib(${n})`);
  }
});

test('naive call count is exponential, memo is linear', () => {
  const n = 15;
  const naive = callCount(run(fibNaive(n)).steps);
  const memo = callCount(run(fibMemo(n)).steps);
  // naive node count for fib is 2*fib(n+1) - 1
  assert.equal(naive, 2 * fib(n + 1) - 1);
  assert.ok(memo <= 2 * n + 1, `memo calls ${memo} should be ~linear`);
  assert.ok(naive > memo * 10, 'naive should dwarf memo');
});

test('call/return steps form a balanced stack', () => {
  const { steps } = run(fibNaive(8));
  let depth = 0;
  for (const s of steps) {
    if (s.type === 'call') depth++;
    else if (s.type === 'return') { depth--; assert.ok(depth >= 0, 'stack underflow'); }
  }
  assert.equal(depth, 0, 'stack not empty at end');
});
