import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COW_SCENARIOS, simulate, finalStateOf, cowScenarioById } from '../src/cow.js';

function run(gen) {
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, value: res.value };
}

const structVsClass = cowScenarioById('struct-vs-class');
const cowArray = cowScenarioById('cow-array');

/* ----------------------------------------------------- struct vs class */

test('struct copy is independent: mutating s2 leaves s1 untouched', () => {
  const { vars } = finalStateOf(structVsClass.ops);
  assert.equal(vars.s1.values.x, 1);
  assert.equal(vars.s2.values.x, 99);
});

test('class instances are shared: c1 and c2 see the same mutation', () => {
  const { vars, heap } = finalStateOf(structVsClass.ops);
  assert.equal(vars.c1.objId, vars.c2.objId, 'c1 and c2 must share one instance');
  assert.equal(heap[vars.c1.objId].x, 99);
});

test('copy emits copyStruct for structs and copyRef for classes', () => {
  const { steps } = run(simulate(structVsClass.ops));
  assert.ok(steps.some((s) => s.type === 'copyStruct' && s.dst === 's2'));
  assert.ok(steps.some((s) => s.type === 'copyRef' && s.dst === 'c2'));
});

/* ------------------------------------------------------- copy-on-write */

test('array assignment shares the buffer; first append copies it', () => {
  const { steps, value } = run(simulate(cowArray.ops));

  // After `var b = a`: same bufId, a shareBuf step, no data copy yet.
  const share = steps.find((s) => s.type === 'shareBuf');
  assert.ok(share, 'expected a shareBuf step');
  assert.equal(share.bufId, 1);
  assert.equal(steps.filter((s) => s.type === 'cowCopy').indexOf(share), -1);

  // After append: b rebinds to a NEW buffer, a keeps the old one.
  const { vars, buffers } = value;
  assert.equal(vars.a.bufId, 1);
  assert.equal(vars.b.bufId, 2);
  assert.deepEqual(buffers[1], [1, 2, 3]);
  assert.deepEqual(buffers[2], [1, 2, 3, 4]);
});

test('cowCopy is emitted exactly once and before the append', () => {
  const { steps } = run(simulate(cowArray.ops));
  const copies = steps.filter((s) => s.type === 'cowCopy');
  assert.equal(copies.length, 1);
  const iCopy = steps.findIndex((s) => s.type === 'cowCopy');
  const iAppend = steps.findIndex((s) => s.type === 'append');
  assert.ok(iCopy < iAppend, 'cowCopy must come before append');
  assert.deepEqual(copies[0], { type: 'cowCopy', name: 'b', from: 1, to: 2, values: [1, 2, 3] });
});

test('appending to an unshared array emits no cowCopy', () => {
  const ops = [{ declArray: 'a', values: [1, 2] }, { append: 'a', value: 3 }];
  const { steps, value } = run(simulate(ops));
  assert.ok(!steps.some((s) => s.type === 'cowCopy'));
  assert.equal(value.vars.a.bufId, 1);
  assert.deepEqual(value.buffers[1], [1, 2, 3]);
});

/* ------------------------------------------------------------- generic */

test('every scenario has non-empty code and ops', () => {
  for (const s of COW_SCENARIOS) {
    assert.ok(s.id);
    assert.ok(s.code.length > 0, s.id);
    assert.ok(s.ops.length > 0, s.id);
  }
});
