/**
 * A tiny, faithful model of the JavaScript event loop, for the classic
 * "what order does this log in?" question.
 *
 * A program is a tree of actions executed synchronously in a frame:
 *   { log: 'A' }                              console.log('A')
 *   { setTimeout: [...actions], label }       schedules a MACRO task
 *   { promise:   [...actions], label }         schedules a MICRO task (.then)
 *
 * The loop: run the main script frame → drain ALL microtasks → take ONE
 * macrotask → drain microtasks → … until both queues are empty. Microtasks
 * always run before the next macrotask.
 *
 * Step shapes (for the visualizer):
 *   { type:'phase', phase:'script'|'microtasks'|'macrotask' }
 *   { type:'push', label } / { type:'pop' }
 *   { type:'log', value }
 *   { type:'enqueue', queue:'micro'|'macro', label }
 *   { type:'dequeue', queue:'micro'|'macro', label }
 * The generator returns the console output array.
 */

export function* simulate(program) {
  const micro = [];
  const macro = [];
  const output = [];

  function* runFrame(actions, label) {
    yield { type: 'push', label };
    for (const a of actions) {
      if ('log' in a) {
        output.push(a.log);
        yield { type: 'log', value: a.log };
      } else if ('setTimeout' in a) {
        macro.push({ actions: a.setTimeout, label: a.label || 'setTimeout cb' });
        yield { type: 'enqueue', queue: 'macro', label: a.label || 'setTimeout cb' };
      } else if ('promise' in a) {
        micro.push({ actions: a.promise, label: a.label || '.then cb' });
        yield { type: 'enqueue', queue: 'micro', label: a.label || '.then cb' };
      }
    }
    yield { type: 'pop' };
  }

  function* drainMicro() {
    yield { type: 'phase', phase: 'microtasks' };
    while (micro.length) {
      const m = micro.shift();
      yield { type: 'dequeue', queue: 'micro', label: m.label };
      yield* runFrame(m.actions, m.label);
    }
  }

  yield { type: 'phase', phase: 'script' };
  yield* runFrame(program, 'main()');
  yield* drainMicro();

  while (macro.length) {
    yield { type: 'phase', phase: 'macrotask' };
    const task = macro.shift();
    yield { type: 'dequeue', queue: 'macro', label: task.label };
    yield* runFrame(task.actions, task.label);
    yield* drainMicro();
  }

  return output;
}

export const EVENTLOOP_SCENARIOS = [
  {
    id: 'basics',
    code: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
    program: [
      { log: 'A' },
      { setTimeout: [{ log: 'B' }], label: 'setTimeout(B)' },
      { promise: [{ log: 'C' }], label: '.then(C)' },
      { log: 'D' },
    ],
    expected: ['A', 'D', 'C', 'B'],
  },
  {
    id: 'chained',
    code: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve()
  .then(() => console.log('3'))
  .then(() => console.log('4'));
console.log('5');`,
    program: [
      { log: '1' },
      { setTimeout: [{ log: '2' }], label: 'setTimeout(2)' },
      { promise: [{ log: '3' }, { promise: [{ log: '4' }], label: '.then(4)' }], label: '.then(3)' },
      { log: '5' },
    ],
    expected: ['1', '5', '3', '4', '2'],
  },
  {
    id: 'nested',
    code: `setTimeout(() => {
  console.log('timer');
  Promise.resolve().then(() => console.log('micro in timer'));
}, 0);
Promise.resolve().then(() => console.log('micro'));
console.log('sync');`,
    program: [
      { setTimeout: [{ log: 'timer' }, { promise: [{ log: 'micro in timer' }], label: '.then' }], label: 'setTimeout' },
      { promise: [{ log: 'micro' }], label: '.then' },
      { log: 'sync' },
    ],
    expected: ['sync', 'micro', 'timer', 'micro in timer'],
  },
];

export const scenarioById = (id) => EVENTLOOP_SCENARIOS.find((s) => s.id === id);

/** Run a program to completion and return its console output. */
export function outputOf(program) {
  const gen = simulate(program);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}
