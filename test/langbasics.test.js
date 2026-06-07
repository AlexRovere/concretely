import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulateTrace, traceSummaryOf } from '../src/evaltrace.js';
import { JSBASICS_SCENARIOS, jsBasicsScenarioById } from '../src/jsbasics.js';
import { SWIFTBASICS_SCENARIOS, swiftBasicsScenarioById } from '../src/swiftbasics.js';
import { KOTLINBASICS_SCENARIOS, kotlinBasicsScenarioById } from '../src/kotlinbasics.js';
import { TSBASICS_SCENARIOS, tsBasicsScenarioById } from '../src/tsbasics.js';
import { GOBASICS_SCENARIOS, goBasicsScenarioById } from '../src/gobasics.js';
import { RUSTBASICS_SCENARIOS, rustBasicsScenarioById } from '../src/rustbasics.js';
import { LINUXBASICS_SCENARIOS, linuxBasicsScenarioById } from '../src/linuxbasics.js';
import { SQLBASICS_SCENARIOS } from '../src/sqlbasics.js';
import { HTTPFLOW_SCENARIOS } from '../src/httpflow.js';
import { CORS_SCENARIOS } from '../src/cors.js';
import { HTTPCACHE_SCENARIOS } from '../src/httpcache.js';
import { DOCKERBASICS_SCENARIOS } from '../src/dockerbasics.js';
import { PYBASICS_SCENARIOS } from '../src/pybasics.js';
import { CBASICS_SCENARIOS } from '../src/cbasics.js';
import { OSBASICS_SCENARIOS } from '../src/osbasics.js';
import { K8SBASICS_SCENARIOS } from '../src/k8sbasics.js';

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

/* ----------------------------------------------------- TS / Go / Rust */

test('typescript: erasure, structural typing, any vs unknown', () => {
  const er = traceSummaryOf(tsBasicsScenarioById('erasure').ops);
  assert.ok(er.errors.includes('u instanceof User'), 'instanceof on an interface is a compile error');
  const erOps = tsBasicsScenarioById('erasure').ops;
  assert.equal(erOps.find((o) => o.eval === 'typeof u').value, '"object"');
  const st = traceSummaryOf(tsBasicsScenarioById('structural').ops);
  assert.deepEqual(st.errors, ['salue({ x: 1, y: 2, z: 3 })'], 'only the direct literal is refused');
  const au = traceSummaryOf(tsBasicsScenarioById('any-unknown').ops);
  assert.ok(au.errors.includes('inconnu.toUpperCase()'));
  assert.ok(au.crashes.includes('nimporte.toUpperCase()'));
  const nw = tsBasicsScenarioById('narrowing').ops;
  assert.equal(nw.find((o) => o.branch === "typeof x === 'string'")?.taken, true);
});

test('go: zero values, nil map, slice aliasing, strictness, defer LIFO', () => {
  const zvOps = goBasicsScenarioById('zero-values').ops;
  assert.equal(zvOps.find((o) => o.eval === 'var s string').value, '""');
  assert.equal(zvOps.find((o) => o.eval === 'var n int').value, '0');
  assert.ok(traceSummaryOf(zvOps).crashes.includes('m["go"] = 1'));
  const slOps = goBasicsScenarioById('slices').ops;
  assert.equal(slOps.find((o) => o.eval === 'a[0]').value, '99');
  const strict = traceSummaryOf(goBasicsScenarioById('strict').ops);
  assert.ok(strict.errors.includes('x := 42'), 'unused variable is a compile error');
  assert.ok(strict.errors.includes('if 1 { }'), 'no truthiness');
  const { logs } = traceSummaryOf(goBasicsScenarioById('defer').ops);
  assert.deepEqual(logs, ['ouverture', 'travail', 'defer B', 'defer A']);
});

test('rust: move, borrow checker, Option, immutability + overflow', () => {
  const ow = traceSummaryOf(rustBasicsScenarioById('ownership').ops);
  assert.ok(ow.errors.includes('println!("{}", s)'), 'use after move is a compile error');
  const owOps = rustBasicsScenarioById('ownership').ops;
  assert.equal(owOps.find((o) => o.eval === 'a + b').value, '10', 'Copy types still work');
  const bw = traceSummaryOf(rustBasicsScenarioById('borrow').ops);
  assert.ok(bw.errors.includes('v.push(4)'), 'mutating while borrowed is refused');
  const nn = traceSummaryOf(rustBasicsScenarioById('no-null').ops);
  assert.ok(nn.errors.includes('let n: i32 = null'));
  assert.ok(nn.crashes.includes('rien.unwrap()'));
  const mu = traceSummaryOf(rustBasicsScenarioById('mutability').ops);
  assert.ok(mu.errors.includes('x = 6'));
  assert.ok(mu.crashes.includes('compteur + 1'), 'u8 overflow panics in debug');
});

test('shell: quoting, exit codes, the 2>&1 order trap, globbing', () => {
  const qt = traceSummaryOf(linuxBasicsScenarioById('quoting').ops);
  assert.ok(qt.crashes.includes('touch $nom'), 'unquoted var word-splits');
  const qtOps = linuxBasicsScenarioById('quoting').ops;
  assert.equal(qtOps.find((o) => o.eval === 'echo "$nom"').value, 'Ada Lovelace');
  assert.equal(qtOps.find((o) => o.eval === "echo '$nom'").value, '$nom');
  const ec = linuxBasicsScenarioById('exit-codes').ops;
  assert.equal(ec.find((o) => o.eval === 'echo $?').value, '1');
  const rd = traceSummaryOf(linuxBasicsScenarioById('redirections').ops);
  assert.ok(rd.crashes.includes('cmd 2>&1 > f'), 'wrong order leaves stderr on the tty');
  const gl = linuxBasicsScenarioById('globbing').ops;
  assert.equal(gl.find((o) => o.eval === 'echo *').value, '*', 'unmatched glob stays literal');
});

test('every basics scenario is well-formed and terminates', () => {
  for (const s of [
    ...JSBASICS_SCENARIOS, ...SWIFTBASICS_SCENARIOS, ...KOTLINBASICS_SCENARIOS,
    ...TSBASICS_SCENARIOS, ...GOBASICS_SCENARIOS, ...RUSTBASICS_SCENARIOS,
    ...LINUXBASICS_SCENARIOS, ...SQLBASICS_SCENARIOS, ...HTTPFLOW_SCENARIOS,
    ...CORS_SCENARIOS, ...HTTPCACHE_SCENARIOS, ...DOCKERBASICS_SCENARIOS,
    ...PYBASICS_SCENARIOS, ...CBASICS_SCENARIOS, ...OSBASICS_SCENARIOS,
    ...K8SBASICS_SCENARIOS,
  ]) {
    assert.ok(s.code.length > 10, s.id);
    assert.ok(s.ops.length > 0, s.id);
    const all = steps(s.ops);
    assert.ok(all.length >= s.ops.length, s.id);
  }
});
