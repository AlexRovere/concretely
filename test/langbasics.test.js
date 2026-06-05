import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulateTrace, traceSummaryOf } from '../src/evaltrace.js';
import { JSBASICS_SCENARIOS, jsBasicsScenarioById } from '../src/jsbasics.js';
import { SWIFTBASICS_SCENARIOS, swiftBasicsScenarioById } from '../src/swiftbasics.js';
import { KOTLINBASICS_SCENARIOS, kotlinBasicsScenarioById } from '../src/kotlinbasics.js';

function steps(ops) {
  const out = [];
  const gen = simulateTrace(ops);
  let res = gen.next();
  while (!res.done) { out.push(res.value); res = gen.next(); }
  return out;
}

/* ------------------------------------------------- JS: checked by REAL JS */

test('the JS equality quirks are real JavaScript behavior', () => {
  /* eslint-disable eqeqeq */
  assert.equal(0 == '', true);
  assert.equal(0 == '0', true);
  assert.equal('' == '0', false);
  assert.equal(null == undefined, true);
  assert.equal(NaN === NaN, false);
  assert.equal([] == false, true);
  // and they match what the scenario displays
  const shown = jsBasicsScenarioById('egalite').ops.map((o) => o.value);
  assert.deepEqual(shown, ['true', 'true', 'false', 'true', 'false', 'true']);
});

test('the JS number quirks are real JavaScript behavior', () => {
  assert.equal(String(0.1 + 0.2), '0.30000000000000004');
  assert.equal(0.1 + 0.2 === 0.3, false);
  assert.equal(typeof null, 'object');
  assert.equal(typeof NaN, 'number');
  assert.equal(2 ** 53 + 1 === 2 ** 53, true);
});

test('the JS truthiness branches match real JavaScript', () => {
  const ops = jsBasicsScenarioById('truthiness-js').ops;
  assert.equal(ops[0].taken, Boolean(0));
  assert.equal(ops[1].taken, Boolean(''));
  assert.equal(ops[2].taken, Boolean([]));
});

test('hoisting scenario: var evals to undefined, let crashes (TDZ)', () => {
  const all = steps(jsBasicsScenarioById('hoisting').ops);
  assert.equal(all[0].value, 'undefined');
  assert.ok(all.some((s) => s.type === 'crash' && s.message.includes('TDZ')));
});

/* --------------------------------------------------------- Swift / Kotlin */

test('swift optionals: compile error, safe nav, crash on force unwrap', () => {
  const { errors, crashes } = traceSummaryOf(swiftBasicsScenarioById('optionals').ops);
  assert.deepEqual(errors, ['name.count']);
  assert.deepEqual(crashes, ['name!']);
});

test('swift has NO truthiness: if 0 and if "" are compile errors', () => {
  const { errors } = traceSummaryOf(swiftBasicsScenarioById('pas-de-truthiness').ops);
  assert.equal(errors.length, 2);
});

test('swift defer runs LIFO at scope exit', () => {
  const { logs } = traceSummaryOf(swiftBasicsScenarioById('defer').ops);
  assert.deepEqual(logs, ['ouverture', 'travail', 'defer B', 'defer A']);
});

test('kotlin null safety: direct access refused, !! crashes', () => {
  const { errors, crashes } = traceSummaryOf(kotlinBasicsScenarioById('null-safety').ops);
  assert.deepEqual(errors, ['name.length']);
  assert.deepEqual(crashes, ['name!!.length']);
});

test('kotlin equality: == structural true, === referential false', () => {
  const ops = kotlinBasicsScenarioById('equality').ops;
  assert.equal(ops.find((o) => o.eval === 'a == b').value, 'true');
  assert.equal(ops.find((o) => o.eval === 'a === b').value, 'false');
});

test('every basics scenario is well-formed and terminates', () => {
  for (const s of [...JSBASICS_SCENARIOS, ...SWIFTBASICS_SCENARIOS, ...KOTLINBASICS_SCENARIOS]) {
    assert.ok(s.code.length > 10, s.id);
    assert.ok(s.ops.length > 0, s.id);
    const all = steps(s.ops);
    assert.ok(all.length >= s.ops.length, s.id);
  }
});
