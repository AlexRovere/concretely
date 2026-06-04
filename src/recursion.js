/**
 * Recursion as a step stream, on the Fibonacci example. The naive version
 * re-computes the same calls exponentially; the memoized one caches them. The
 * dramatic difference in call count is the whole lesson.
 *
 * Step shapes:
 *   { type: 'call',   id, k, depth, parent, memoHit? }  a frame is pushed
 *   { type: 'return', id, value }                       the top frame returns
 */

export function fib(n) {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}

export function* fibNaive(n) {
  let id = 0;
  return yield* go(n, 0, null);
  function* go(k, depth, parent) {
    const myId = id++;
    yield { type: 'call', id: myId, k, depth, parent };
    let value;
    if (k < 2) {
      value = k;
    } else {
      const a = yield* go(k - 1, depth + 1, myId);
      const b = yield* go(k - 2, depth + 1, myId);
      value = a + b;
    }
    yield { type: 'return', id: myId, value };
    return value;
  }
}

export function* fibMemo(n) {
  let id = 0;
  const memo = new Map();
  return yield* go(n, 0, null);
  function* go(k, depth, parent) {
    const myId = id++;
    if (memo.has(k)) {
      yield { type: 'call', id: myId, k, depth, parent, memoHit: true };
      const v = memo.get(k);
      yield { type: 'return', id: myId, value: v };
      return v;
    }
    yield { type: 'call', id: myId, k, depth, parent };
    let value;
    if (k < 2) {
      value = k;
    } else {
      const a = yield* go(k - 1, depth + 1, myId);
      const b = yield* go(k - 2, depth + 1, myId);
      value = a + b;
    }
    memo.set(k, value);
    yield { type: 'return', id: myId, value };
    return value;
  }
}

/** Registry. `maxN` caps n so the naive (exponential) variant stays bounded. */
export const RECURSION = {
  naive: { id: 'naive', gen: fibNaive, maxN: 12 },
  memo: { id: 'memo', gen: fibMemo, maxN: 30 },
};

/** Count total calls in a recursion run (cheap analytics for the UI/tests). */
export function callCount(steps) {
  return steps.filter((s) => s.type === 'call').length;
}
