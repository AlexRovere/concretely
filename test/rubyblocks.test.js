import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  RUBYBLOCKS_SCENARIOS,
  simulate,
  summaryOf,
  rubyBlocksScenarioById,
} from '../src/rubyblocks.js';

function run(gen) {
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, ...res.value };
}

function assertBalancedFrames(steps, id) {
  let depth = 0;
  for (const st of steps) {
    if (st.type === 'push') depth++;
    else if (st.type === 'pop') { depth--; assert.ok(depth >= 0, `${id} underflow`); }
  }
  assert.equal(depth, 0, `${id} unbalanced`);
}

test('yield: exact output order and balanced frames', () => {
  const s = rubyBlocksScenarioById('yield');
  const { steps, output, methodCompleted } = run(simulate(s.program));
  assert.deepEqual(output, ['avant le bloc', '1 + 2 = 3', 'après le bloc']);
  assert.equal(methodCompleted, true);
  assertBalancedFrames(steps, s.id);
});

test('lambda-return: return hands control back, method continues', () => {
  const s = rubyBlocksScenarioById('lambda-return');
  const { steps, output, methodCompleted } = run(simulate(s.program));
  assert.ok(output.includes('après le call ✓'));
  assert.equal(methodCompleted, true);
  const ret = steps.find((st) => st.type === 'blockReturn');
  assert.equal(ret.kind, 'lambda');
  assert.equal(ret.value, 42);
  assert.ok(!steps.some((st) => st.type === 'unwind'), 'no unwind for lambda');
});

test('proc-return: return unwinds the enclosing method', () => {
  const s = rubyBlocksScenarioById('proc-return');
  const { steps, output, methodCompleted } = run(simulate(s.program));
  assert.deepEqual(output, ['dans le proc']);
  assert.equal(methodCompleted, false);
  assert.ok(steps.some((st) => st.type === 'unwind'), 'unwind step present');
  // The unwind pops the method frame too — frames end balanced anyway.
  assertBalancedFrames(steps, s.id);
  const lastPop = steps.filter((st) => st.type === 'pop').at(-1);
  assert.equal(lastPop.frame, 'demo_proc', 'method frame popped by the unwind');
});

test('same return action, different control flow purely from kind', () => {
  const lambda = run(simulate(rubyBlocksScenarioById('lambda-return').program));
  const proc = run(simulate(rubyBlocksScenarioById('proc-return').program));
  // Both execute a blockReturn of 42…
  assert.equal(lambda.steps.find((s) => s.type === 'blockReturn').value, 42);
  assert.equal(proc.steps.find((s) => s.type === 'blockReturn').value, 42);
  // …but the step sequences diverge right after it.
  const types = ({ steps }) => steps.map((s) => s.type);
  const after = (ts) => ts.slice(ts.indexOf('blockReturn') + 1);
  assert.deepEqual(after(types(lambda)), ['pop', 'log', 'pop']);
  assert.deepEqual(after(types(proc)), ['unwind', 'pop', 'pop']);
  assert.equal(lambda.methodCompleted, true);
  assert.equal(proc.methodCompleted, false);
});

test('each scenario produces its documented output via summaryOf', () => {
  for (const s of RUBYBLOCKS_SCENARIOS) {
    assert.deepEqual(summaryOf(s.program).output, s.expected, s.id);
  }
});

test('every scenario has non-empty Ruby code and a program', () => {
  assert.equal(RUBYBLOCKS_SCENARIOS.length, 3);
  for (const s of RUBYBLOCKS_SCENARIOS) {
    assert.ok(typeof s.id === 'string' && s.id.length > 0);
    assert.ok(typeof s.code === 'string' && s.code.trim().length > 0, `${s.id} code`);
    assert.ok(s.program && Array.isArray(s.program.body), `${s.id} program`);
    assert.ok(s.program.block && ['block', 'proc', 'lambda'].includes(s.program.block.kind), `${s.id} block kind`);
    assert.equal(rubyBlocksScenarioById(s.id), s);
  }
});
