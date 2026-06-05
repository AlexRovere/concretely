import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  RUBYLAZY_SCENARIOS,
  simulate,
  summaryOf,
  rubyLazyScenarioById,
} from '../src/rubylazy.js';

function run(gen) {
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, value: res.value };
}

test('eager and lazy produce the same result [4, 16]', () => {
  assert.deepEqual(summaryOf(rubyLazyScenarioById('eager')).result, [4, 16]);
  assert.deepEqual(summaryOf(rubyLazyScenarioById('lazy')).result, [4, 16]);
});

test('eager applies 20 blocks, lazy only 8', () => {
  const eager = summaryOf(rubyLazyScenarioById('eager'));
  const lazy = summaryOf(rubyLazyScenarioById('lazy'));
  assert.equal(eager.applied, 20);
  assert.equal(lazy.applied, 8);
  assert.ok(eager.applied > lazy.applied);
});

test('eager builds full intermediate arrays at each stage-end; lazy builds none', () => {
  const eagerEnds = run(simulate(rubyLazyScenarioById('eager'))).steps
    .filter((s) => s.type === 'stage-end');
  assert.equal(eagerEnds.length, 2);
  assert.deepEqual(eagerEnds[0].output, [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]);
  assert.deepEqual(eagerEnds[1].output, [4, 16, 36, 64, 100]);
  assert.equal(summaryOf(rubyLazyScenarioById('eager')).intermediates, 2);

  const lazySteps = run(simulate(rubyLazyScenarioById('lazy'))).steps;
  assert.equal(lazySteps.filter((s) => s.type === 'stage-end').length, 0);
  assert.equal(summaryOf(rubyLazyScenarioById('lazy')).intermediates, 0);
});

test('lazy stops after 4 emitted elements and never emits element 5', () => {
  const { steps } = run(simulate(rubyLazyScenarioById('lazy')));
  const stop = steps.find((s) => s.type === 'stop');
  assert.ok(stop, 'a stop step must be emitted');
  assert.equal(stop.after, 4);
  const emitted = steps.filter((s) => s.type === 'emit').map((s) => s.value);
  assert.deepEqual(emitted, [1, 2, 3, 4]);
  assert.ok(!emitted.includes(5));
});

test('infinite range + lazy terminates with [4, 16]', () => {
  const { steps, value } = run(simulate(rubyLazyScenarioById('infinite')));
  assert.deepEqual(value.result, [4, 16]);
  assert.equal(value.hung, false);
  assert.equal(steps.find((s) => s.type === 'stop').after, 4);
});

test('infinite range + eager hangs (we bail out with a hang step)', () => {
  const inf = rubyLazyScenarioById('infinite');
  const eagerInfinite = { ...inf, id: 'infinite-eager', lazy: false };
  const { steps, value } = run(simulate(eagerInfinite));
  assert.deepEqual(steps, [{ type: 'hang' }]);
  assert.equal(value.hung, true);
  assert.equal(value.result, null);
  assert.equal(value.applied, 0);
});

test('every scenario has code, ops, and a take count', () => {
  assert.equal(RUBYLAZY_SCENARIOS.length, 3);
  for (const s of RUBYLAZY_SCENARIOS) {
    assert.equal(typeof s.code, 'string', s.id);
    assert.ok(s.code.length > 0, s.id);
    assert.ok(Array.isArray(s.ops) && s.ops.length === 2, s.id);
    assert.ok(s.ops.every((o) => o.op && o.expr && typeof o.fn === 'function'), s.id);
    assert.equal(s.take, 2, s.id);
  }
});

test('summaryOf works for all scenarios (none hang)', () => {
  for (const s of RUBYLAZY_SCENARIOS) {
    const summary = summaryOf(s);
    assert.deepEqual(summary.result, [4, 16], s.id);
    assert.equal(summary.hung, false, s.id);
    assert.ok(summary.applied > 0, s.id);
  }
});
