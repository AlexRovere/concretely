import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EVENTLOOP_SCENARIOS, simulate, outputOf } from '../src/eventloop.js';

function run(gen) {
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, output: res.value };
}

test('each scenario produces its documented console order', () => {
  for (const s of EVENTLOOP_SCENARIOS) {
    assert.deepEqual(outputOf(s.program), s.expected, s.id);
  }
});

test('microtasks always drain before the next macrotask', () => {
  // sync, micro, then macro
  const { output } = run(simulate(EVENTLOOP_SCENARIOS[2].program));
  assert.deepEqual(output, ['sync', 'micro', 'timer', 'micro in timer']);
});

test('every push is matched by a pop (balanced frames)', () => {
  for (const s of EVENTLOOP_SCENARIOS) {
    const { steps } = run(simulate(s.program));
    let depth = 0;
    for (const st of steps) {
      if (st.type === 'push') depth++;
      else if (st.type === 'pop') { depth--; assert.ok(depth >= 0, `${s.id} underflow`); }
    }
    assert.equal(depth, 0, `${s.id} unbalanced`);
  }
});

test('enqueue and dequeue counts match per queue', () => {
  for (const s of EVENTLOOP_SCENARIOS) {
    const { steps } = run(simulate(s.program));
    for (const q of ['micro', 'macro']) {
      const enq = steps.filter((x) => x.type === 'enqueue' && x.queue === q).length;
      const deq = steps.filter((x) => x.type === 'dequeue' && x.queue === q).length;
      assert.equal(enq, deq, `${s.id}/${q}`);
    }
  }
});
