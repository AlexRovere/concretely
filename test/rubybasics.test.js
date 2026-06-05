import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  RUBYBASICS_SCENARIOS, rubyBasicsScenarioById, simulate, summaryOf, truthy,
} from '../src/rubybasics.js';

function steps(ops) {
  const out = [];
  const gen = simulate(ops);
  let res = gen.next();
  while (!res.done) { out.push(res.value); res = gen.next(); }
  return out;
}

/* ---------------------------------------------------------- truthiness */

test('only nil and false are falsy — 0 and "" are truthy', () => {
  assert.equal(truthy(0), true);
  assert.equal(truthy(''), true);
  assert.equal(truthy(null), false);
  assert.equal(truthy(false), false);
});

test('the truthiness scenario logs the surprising branches', () => {
  const { logs } = summaryOf(rubyBasicsScenarioById('truthiness').ops);
  assert.deepEqual(logs, [
    '0 est VRAI en Ruby !',
    '"" est VRAI aussi',
    'nil → falsy',
    'false → falsy',
  ]);
});

/* ------------------------------------------------------ object identity */

test('every string literal allocates a fresh object_id', () => {
  const { stringIds } = summaryOf(rubyBasicsScenarioById('symbols').ops);
  assert.equal(stringIds.length, 2);
  assert.notEqual(stringIds[0], stringIds[1]);
});

test('a symbol is interned: same object_id, flagged as reused', () => {
  const all = steps(rubyBasicsScenarioById('symbols').ops);
  const syms = all.filter((s) => s.type === 'alloc' && s.kind === 'symbol');
  assert.equal(syms.length, 2);
  assert.equal(syms[0].objectId, syms[1].objectId);
  assert.equal(syms[0].reused, false);
  assert.equal(syms[1].reused, true);
});

/* ------------------------------------------------------------- structure */

test('eval steps carry code, value and optional note', () => {
  const all = steps(rubyBasicsScenarioById('nil-safe').ops);
  const evals = all.filter((s) => s.type === 'eval');
  assert.equal(evals.length, 4);
  assert.ok(evals.every((s) => s.code && s.value !== undefined));
  assert.ok(evals.some((s) => s.note));
});

test('every scenario has ruby code and ops, and simulate terminates', () => {
  for (const s of RUBYBASICS_SCENARIOS) {
    assert.ok(s.code.length > 10, s.id);
    assert.ok(s.ops.length > 0, s.id);
    assert.ok(steps(s.ops).length >= s.ops.length, s.id);
  }
});
