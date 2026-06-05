import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  KTCOROUTINES_SCENARIOS,
  ktCoroutinesScenarioById,
  simulate,
  summaryOf,
} from '../src/ktcoroutines.js';

function run(scenario) {
  const gen = simulate(scenario);
  const ticks = [];
  let res = gen.next();
  while (!res.done) { ticks.push(res.value); res = gen.next(); }
  return { ticks, summary: res.value };
}

test('suspend-frees-main: B runs on main while A is suspended', () => {
  const { ticks } = run(ktCoroutinesScenarioById('suspend-frees-main'));
  const overlap = ticks.some(
    (s) =>
      s.suspended.some((x) => x.task === 'A') &&
      s.running.some((x) => x.task === 'B' && x.lane === 'main'),
  );
  assert.ok(overlap, 'expected B running on main while A suspended');
});

test('suspend-frees-main: totalTicks <= 6', () => {
  const { totalTicks } = summaryOf(ktCoroutinesScenarioById('suspend-frees-main'));
  assert.ok(totalTicks <= 6, `expected <= 6, got ${totalTicks}`);
});

test('withcontext-io: file.readText() never runs on the main lane', () => {
  const { ticks } = run(ktCoroutinesScenarioById('withcontext-io'));
  for (const s of ticks) {
    const onMain = s.running.some(
      (x) => x.label === 'file.readText()' && x.lane === 'main',
    );
    assert.ok(!onMain, `tick ${s.t}: heavy IO leaked onto main`);
  }
});

test('withcontext-io: coroutine resumes on main after IO is done', () => {
  const { ticks } = run(ktCoroutinesScenarioById('withcontext-io'));
  // A's final cpu segment 'uiState.value = …' must run on 'main'
  // and only after IO has completed (IO is in done by then).
  const resume = ticks.some(
    (s) =>
      s.running.some(
        (x) => x.task === 'A' && x.label === 'uiState.value = …' && x.lane === 'main',
      ) && s.done.includes('IO'),
  );
  assert.ok(resume, 'expected A to resume on main after IO finished');
});

test('async-awaitall: U and S overlap on two different lanes', () => {
  const { ticks } = run(ktCoroutinesScenarioById('async-awaitall'));
  const overlap = ticks.some((s) => {
    const u = s.running.find((x) => x.task === 'U');
    const sPost = s.running.find((x) => x.task === 'S');
    return u && sPost && u.lane !== sPost.lane;
  });
  assert.ok(overlap, 'expected U and S running on two different lanes');
});

test('async-awaitall: total well under the serial sum (1+3+2+1=7)', () => {
  const { totalTicks } = summaryOf(ktCoroutinesScenarioById('async-awaitall'));
  assert.ok(totalTicks < 7, `expected < 7, got ${totalTicks}`);
});

test('all scenarios terminate; one snapshot per tick', () => {
  for (const s of KTCOROUTINES_SCENARIOS) {
    const { ticks, summary } = run(s);
    assert.ok(summary.totalTicks < 200, `${s.id} hit the tick cap`);
    assert.equal(ticks.length, summary.totalTicks, `${s.id} snapshot count`);
    ticks.forEach((snap, i) => assert.equal(snap.t, i, `${s.id} tick numbering`));
  }
});

test('scenarios have code + tasks; wrappers delegate to the engine', () => {
  for (const s of KTCOROUTINES_SCENARIOS) {
    assert.ok(typeof s.code === 'string' && s.code.length > 0, `${s.id} code`);
    assert.ok(Array.isArray(s.tasks) && s.tasks.length > 0, `${s.id} tasks`);
    assert.equal(ktCoroutinesScenarioById(s.id), s);
    const summary = summaryOf(s);
    assert.ok(Number.isInteger(summary.totalTicks) && summary.totalTicks > 0, `${s.id} totalTicks`);
    assert.ok(summary.values && typeof summary.values === 'object', `${s.id} values`);
  }
});
