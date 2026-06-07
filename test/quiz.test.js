import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUIZ_QUESTIONS, quizQuestionById, quizQuestions, localize } from '../src/quiz.js';
import { outputOf, scenarioById as elScenario } from '../src/eventloop.js';
import { summaryOf as rbkSummary, rubyBlocksScenarioById } from '../src/rubyblocks.js';
import { finalStateOf as ssFinal, swiftStateScenarioById } from '../src/swiftstate.js';
import { summaryOf as cpSummary, composeScenarioById } from '../src/compose.js';
import { finalStateOf as cwFinal, cowScenarioById } from '../src/cow.js';
import { truthy } from '../src/rubybasics.js';
import { summaryOf as rzSummary, rubyLazyScenarioById } from '../src/rubylazy.js';
import { summaryOf as gdSummary, gitDagScenarioById } from '../src/gitdag.js';
import { summaryOf as vdSummary, vdomScenarioById } from '../src/vdom.js';
import { summaryOf as dbSummary, debounceScenarioById } from '../src/debounce.js';
import { summaryOf as kfSummary, ktFlowScenarioById } from '../src/ktflow.js';
import { summaryOf as vmSummary, viewModelScenarioById } from '../src/viewmodel.js';
import { summaryOf as lcSummary, lifecycleScenarioById } from '../src/lifecycle.js';
import { summaryOf as arcSummary, arcScenarioById } from '../src/arc.js';
import { summaryOf as rgSummary, rubyGvlScenarioById } from '../src/rubygvl.js';
import { summaryOf as vySummary, vueReactivityScenarioById } from '../src/vuereactivity.js';
import { summaryOf as bbSummary, bubblingScenarioById } from '../src/bubbling.js';
import { summaryOf as sbSummary, swiftBasicsScenarioById } from '../src/swiftbasics.js';
import { summaryOf as kbSummary, kotlinBasicsScenarioById } from '../src/kotlinbasics.js';
import { summaryOf as rbSummary, rubyBasicsScenarioById } from '../src/rubybasics.js';
import { summaryOf as tbSummary, tsBasicsScenarioById } from '../src/tsbasics.js';
import { summaryOf as gbSummary, goBasicsScenarioById } from '../src/gobasics.js';
import { summaryOf as rsSummary, rustBasicsScenarioById } from '../src/rustbasics.js';
import { summaryOf as lxSummary, linuxBasicsScenarioById } from '../src/linuxbasics.js';
import { summaryOf as grSummary, gitResetScenarioById } from '../src/gitreset.js';
import { summaryOf as sqSummary, sqlBasicsScenarioById } from '../src/sqlbasics.js';
import { summaryOf as sjSummary } from '../src/sqljoins.js';
import { corsScenarioById } from '../src/cors.js';
import { httpCacheScenarioById } from '../src/httpcache.js';
import { summaryOf as dkSummary, dockerBasicsScenarioById } from '../src/dockerbasics.js';
import { buildTree, traverse, BST_DEMO } from '../src/bst.js';
import { SORTS } from '../src/sorting/algorithms.js';

/* Every quiz answer is re-derived from the MODEL it quizzes about. */

test('el-basics / el-chained: orders match the event-loop simulation', () => {
  assert.equal(quizQuestionById('el-basics').choices[1],
    outputOf(elScenario('basics').program).join(', '));
  assert.equal(quizQuestionById('el-chained').choices[0],
    outputOf(elScenario('chained').program).join(', '));
});

test('vy-computed: 2 evaluations exactly', () => {
  const { evaluations } = vySummary(vueReactivityScenarioById('computed-cache'));
  assert.equal(quizQuestionById('vy-computed').choices[quizQuestionById('vy-computed').answer],
    String(evaluations.double));
});

test('vd-unkeyed: 2 patches + 1 insert per the diff model', () => {
  const { ops } = vdSummary(vdomScenarioById('prepend-unkeyed'));
  assert.equal(ops.patch, 2);
  assert.equal(ops.insert, 1);
  assert.equal(quizQuestionById('vd-unkeyed').answer, 1);
});

test('bb-order: f, g, h per the propagation model', () => {
  const { calls } = bbSummary(bubblingScenarioById('trois-phases'));
  assert.equal(quizQuestionById('bb-order').choices[quizQuestionById('bb-order').answer],
    calls.join(', '));
});

test('db-count: 3 debounce calls', () => {
  const { debounceFires } = dbSummary(debounceScenarioById('recherche'));
  assert.equal(quizQuestionById('db-count').choices[quizQuestionById('db-count').answer],
    String(debounceFires.length));
});

test('ss-observed: the counter really resets to 0', () => {
  const { objects } = ssFinal(swiftStateScenarioById('observed-reset'));
  assert.equal(quizQuestionById('ss-observed').choices[quizQuestionById('ss-observed').answer],
    String(objects.CounterChild.values.count));
});

test('cw-struct: s1.x stays 1', () => {
  const { vars } = cwFinal(cowScenarioById('struct-vs-class').ops);
  assert.equal(quizQuestionById('cw-struct').choices[quizQuestionById('cw-struct').answer],
    String(vars.s1.values.x));
});

test('arc-cycle: both objects leak (alive, rc 1)', () => {
  const { leaked, objects } = arcSummary(arcScenarioById('cycle-leak').ops);
  assert.deepEqual(leaked, [1, 2]);
  assert.ok(Object.values(objects).every((o) => o.alive && o.rc === 1));
  assert.equal(quizQuestionById('arc-cycle').answer, 1);
});

test('rbk-proc: only the proc line prints, the method never completes', () => {
  const { output, methodCompleted } = rbkSummary(rubyBlocksScenarioById('proc-return').program);
  assert.deepEqual(output, ['dans le proc']);
  assert.equal(methodCompleted, false);
  assert.equal(quizQuestionById('rbk-proc').answer, 1);
});

test('rb-truthy: 0 is truthy in Ruby', () => {
  assert.equal(truthy(0), true);
  assert.equal(quizQuestionById('rb-truthy').answer, 0);
});

test('rz-lazy: 8 block calls', () => {
  const { applied } = rzSummary(rubyLazyScenarioById('lazy'));
  assert.equal(quizQuestionById('rz-lazy').choices[quizQuestionById('rz-lazy').answer],
    String(applied));
});

test('rg-gvl: 6 ticks, fully serialized', () => {
  const { totalTicks } = rgSummary(rubyGvlScenarioById('cpu-bound'));
  assert.equal(totalTicks, 6);
  assert.equal(quizQuestionById('rg-gvl').answer, 1);
});

test('cp-noremember: the displayed value really is 0', () => {
  const { value } = cpSummary(composeScenarioById('no-remember'));
  assert.equal(quizQuestionById('cp-noremember').choices[quizQuestionById('cp-noremember').answer],
    String(value));
});

test('kf-late: B receives [2, 3]', () => {
  const { received } = kfSummary(ktFlowScenarioById('stateflow'));
  assert.equal(quizQuestionById('kf-late').choices[quizQuestionById('kf-late').answer],
    `[${received.B.join(', ')}]`);
});

test('vm-rotation: the activity field is gone after rotation', () => {
  const { activity } = vmSummary(viewModelScenarioById('rotation-bug').ops);
  assert.deepEqual(activity, {});
  assert.equal(quizQuestionById('vm-rotation').answer, 1);
});

test('lc-home: no onDestroy on the home journey', () => {
  const { events } = lcSummary(lifecycleScenarioById('home-return').actions);
  assert.ok(!events.includes('onDestroy'));
  assert.equal(quizQuestionById('lc-home').answer, 1);
});

test("gd-rebase: feature points to C3'", () => {
  const { branches } = gdSummary(gitDagScenarioById('rebase').ops);
  assert.equal(branches.feature, "C3'");
  assert.equal(quizQuestionById('gd-rebase').answer, 1);
});

/* --------------------------------------------- basics-tab questions */

test('jb-*: the JS quiz answers are real JavaScript behavior', () => {
  /* eslint-disable eqeqeq */
  assert.equal('' == '0', false, 'jb-nontransitif');
  assert.equal(typeof null, 'object', 'jb-typeof');
  assert.equal(Boolean([]), true, 'jb-truthy-array (if)');
  assert.equal([] == false, true, 'jb-truthy-array (==)');
  assert.equal((function () { return a; var a = 1; })(), undefined, 'jb-hoisting');
  assert.equal(quizQuestionById('jb-nontransitif').answer, 1);
  assert.equal(quizQuestionById('jb-typeof').choices[quizQuestionById('jb-typeof').answer], '"object"');
  assert.equal(quizQuestionById('jb-truthy-array').answer, 1);
  assert.equal(quizQuestionById('jb-hoisting').choices[quizQuestionById('jb-hoisting').answer], 'undefined');
});

test('sb-*: the Swift quiz answers match the swiftbasics model', () => {
  assert.ok(sbSummary(swiftBasicsScenarioById('pas-de-truthiness').ops).errors.includes('if 0 { }'));
  assert.equal(quizQuestionById('sb-if0').answer, 2);
  const { logs } = sbSummary(swiftBasicsScenarioById('defer').ops);
  assert.equal(quizQuestionById('sb-defer').choices[quizQuestionById('sb-defer').answer], logs.join(', '));
  assert.ok(sbSummary(swiftBasicsScenarioById('optionals').ops).crashes.includes('name!'));
  assert.equal(quizQuestionById('sb-force').answer, 2);
});

test('kb-*: the Kotlin quiz answers match the kotlinbasics model', () => {
  const eq = kotlinBasicsScenarioById('equality').ops;
  assert.equal(eq.find((o) => o.eval === 'a == b').value, 'true');
  assert.equal(quizQuestionById('kb-equality').answer, 0);
  assert.ok(kbSummary(kotlinBasicsScenarioById('null-safety').ops).crashes.includes('name!!.length'));
  assert.equal(quizQuestionById('kb-bangbang').answer, 1);
});

test('ts-*: the TypeScript quiz answers match the tsbasics model', () => {
  assert.ok(tbSummary(tsBasicsScenarioById('erasure').ops).errors.includes('u instanceof User'));
  assert.equal(quizQuestionById('ts-erasure').answer, 2);
  const st = tsBasicsScenarioById('structural').ops;
  assert.ok(tbSummary(st).errors.includes('salue({ x: 1, y: 2, z: 3 })'));
  assert.ok(st.some((o) => o.eval === 'salue(p)'), 'the variable workaround compiles');
  assert.equal(quizQuestionById('ts-excess').answer, 2);
  const au = tbSummary(tsBasicsScenarioById('any-unknown').ops);
  assert.ok(au.errors.includes('inconnu.toUpperCase()'), 'unknown refuses to compile');
  assert.ok(au.crashes.includes('nimporte.toUpperCase()'), 'any crashes at runtime');
  assert.equal(quizQuestionById('ts-any').answer, 1);
});

test('go-*: the Go quiz answers match the gobasics model', () => {
  const zv = gbSummary(goBasicsScenarioById('zero-values').ops);
  assert.ok(zv.crashes.includes('m["go"] = 1'), 'writing a nil map panics');
  assert.equal(quizQuestionById('go-nilmap').answer, 0);
  const sl = goBasicsScenarioById('slices').ops;
  assert.equal(sl.find((o) => o.eval === 'a[0]').value, '99', 'shared backing array');
  assert.equal(quizQuestionById('go-slice').answer, 1);
  const { logs } = gbSummary(goBasicsScenarioById('defer').ops);
  assert.equal(quizQuestionById('go-defer').choices[quizQuestionById('go-defer').answer], logs.join(', '));
});

test('rust-*: the Rust quiz answers match the rustbasics model', () => {
  assert.ok(rsSummary(rustBasicsScenarioById('ownership').ops).errors.includes('println!("{}", s)'));
  assert.equal(quizQuestionById('rust-move').answer, 1);
  assert.ok(rsSummary(rustBasicsScenarioById('no-null').ops).crashes.includes('rien.unwrap()'));
  assert.equal(quizQuestionById('rust-unwrap').answer, 3);
  const mu = rustBasicsScenarioById('mutability').ops;
  assert.ok(rsSummary(mu).errors.includes('x = 6'), 'immutable by default');
  assert.equal(mu.find((o) => o.eval === 'let x = x + 1').value, '6', 'shadowing works');
  assert.equal(quizQuestionById('rust-mut').answer, 1);
});

test('lx-*: the Linux quiz answers match the linuxbasics model', () => {
  const qt = linuxBasicsScenarioById('quoting').ops;
  assert.equal(qt.find((o) => o.eval === "echo '$nom'").value, '$nom', 'single quotes are literal');
  assert.ok(lxSummary(qt).crashes.includes('touch $nom'), 'word splitting strikes');
  assert.equal(quizQuestionById('lx-quotes').answer, 1);
  const ec = linuxBasicsScenarioById('exit-codes').ops;
  assert.equal(ec.find((o) => o.eval === 'echo $?').value, '1');
  assert.equal(ec.find((o) => o.branch === 'false || echo "plan B"')?.taken, true, '|| runs on failure');
  assert.equal(quizQuestionById('lx-exit').answer, 1);
  const rd = linuxBasicsScenarioById('redirections').ops;
  assert.ok(rd.some((o) => o.eval === 'cmd > f 2>&1'), 'the working order');
  assert.ok(lxSummary(rd).crashes.includes('cmd 2>&1 > f'), 'the trap order');
  assert.equal(quizQuestionById('lx-redirect').answer, 0);
});

test('gr-soft: HEAD back on C1, index AND working tree keep v2', () => {
  const { head, index, workingTree } = grSummary(gitResetScenarioById('reset-soft').ops);
  assert.equal(head.id, 'C1');
  assert.equal(index['app.js'], 'v2');
  assert.equal(workingTree['app.js'], 'v2');
  assert.equal(quizQuestionById('gr-soft').answer, 2);
  // and --hard really loses everything, as the explain claims
  const hard = grSummary(gitResetScenarioById('reset-hard').ops);
  assert.equal(hard.workingTree['app.js'], 'v1');
});

test('gd-ff: the merge fast-forwards, no merge commit created', () => {
  const { branches, commits } = gdSummary(gitDagScenarioById('fast-forward').ops);
  assert.equal(branches.main, branches.feature, 'pointers end on the same commit');
  assert.equal(Object.keys(commits).length, 3, 'no new commit');
  assert.ok(Object.values(commits).every((c) => c.parents.length < 2), 'no 2-parent merge commit');
  assert.equal(quizQuestionById('gd-ff').answer, 1);
});

test('sql-*: the SQL quiz answers match the sqlbasics + sqljoins models', () => {
  const nl = sqlBasicsScenarioById('null-logic').ops;
  assert.equal(nl.find((o) => o.eval === 'NULL = NULL').value, 'NULL');
  assert.equal(nl.find((o) => o.eval === '1 NOT IN (2, NULL)').value, 'NULL');
  assert.equal(quizQuestionById('sql-null').answer, 1);
  assert.equal(quizQuestionById('sql-notin').answer, 1);
  // the LEFT JOIN count is re-derived from the join model itself
  const left = sjSummary('left');
  assert.equal(quizQuestionById('sql-left').choices[quizQuestionById('sql-left').answer],
    String(left.rows.length));
  assert.ok(left.rows.some((r) => r.nom === 'Grace' && r.produit === null));
  // and the WHERE-on-right-column trap really is modeled
  assert.ok(sqSummary(sqlBasicsScenarioById('left-join-trap').ops).crashes.includes('WHERE o.montant > 0'));
});

test('sqljoins: the four join types produce 3 / 4 / 4 / 5 rows', () => {
  assert.equal(sjSummary('inner').rows.length, 3);
  assert.equal(sjSummary('left').rows.length, 4);
  assert.equal(sjSummary('right').rows.length, 4);
  assert.equal(sjSummary('full').rows.length, 5);
  assert.ok(sjSummary('right').rows.some((r) => r.nom === null && r.produit === 'webcam'));
});

test('web-*: the HTTP quiz answers match the cors + httpcache models', () => {
  const sr = corsScenarioById('simple-request').ops;
  const blocked = sr.find((o) => o.branch === 'Access-Control-Allow-Origin présent ?');
  assert.equal(blocked.taken, false);
  assert.match(blocked.else, /EU LIEU/i, 'the request did reach the server');
  assert.equal(quizQuestionById('web-block').answer, 1);
  assert.ok(corsScenarioById('preflight').ops.some((o) => o.eval === 'OPTIONS /api/users'));
  assert.equal(quizQuestionById('web-preflight').answer, 1);
  const etag = httpCacheScenarioById('etag').ops;
  assert.match(etag.find((o) => o.eval === '304 Not Modified').value, /vide/i, '304 carries no body');
  assert.equal(quizQuestionById('web-304').answer, 2);
});

test('dk-*: the Docker quiz answers match the dockerbasics model', () => {
  assert.ok(dkSummary(dockerBasicsScenarioById('layers-cache').ops).crashes.includes('COPY . .'));
  assert.equal(quizQuestionById('dk-layers').answer, 1);
  const ce = dockerBasicsScenarioById('cmd-entrypoint').ops;
  assert.equal(ce.find((o) => o.eval === 'docker run img --help').value, 'node --help');
  assert.equal(quizQuestionById('dk-cmd').answer, 1);
  assert.ok(dkSummary(dockerBasicsScenarioById('volumes').ops).crashes.includes('docker rm db'));
  assert.equal(quizQuestionById('dk-volume').answer, 1);
});

test('rb-symbols: strings differ, symbols are interned, per the model', () => {
  const { stringIds, symbolIds } = rbSummary(rubyBasicsScenarioById('symbols').ops);
  assert.notEqual(stringIds[0], stringIds[1]);
  assert.equal(Object.keys(symbolIds).length, 1);
  assert.equal(quizQuestionById('rb-symbols').answer, 1);
});

test('gen-bst: the in-order traversal really is sorted', () => {
  const tree = buildTree(BST_DEMO);
  const visited = [];
  for (const s of traverse(tree, 'in')) visited.push(s.value);
  assert.deepEqual(visited, [...BST_DEMO].sort((a, b) => a - b));
  assert.equal(quizQuestionById('gen-bst').answer, 0);
});

test('gen-bogo: the registry confirms the factorial complexity', () => {
  assert.match(SORTS.bogo.complexity.avg, /!/);
  assert.match(quizQuestionById('gen-bogo').choices[quizQuestionById('gen-bogo').answer], /!/);
});

/* ------------------------------------------------------------- structure */

test('every question is well-formed (choices, answer, code, goto)', () => {
  const ids = new Set();
  for (const q of QUIZ_QUESTIONS) {
    assert.ok(!ids.has(q.id), `duplicate id ${q.id}`);
    ids.add(q.id);
    assert.ok(q.choices.length >= 2, q.id);
    assert.ok(q.answer >= 0 && q.answer < q.choices.length, q.id);
    assert.ok(q.code.length > 10, q.id);
    assert.ok(q.goto.mode && q.goto.scenario, q.id);
    assert.ok(localize(q.question, 'fr').length > 5 && localize(q.question, 'en').length > 5, q.id);
    assert.ok(localize(q.explain, 'fr').length > 10, q.id);
  }
});

test('category filter returns the right subsets', () => {
  assert.equal(quizQuestions('all').length, QUIZ_QUESTIONS.length);
  const cats = ['general', 'js', 'ts', 'vue', 'swift', 'ruby', 'kotlin', 'go', 'rust', 'git', 'linux', 'sql', 'web', 'docker'];
  let sum = 0;
  for (const c of cats) {
    const qs = quizQuestions(c);
    assert.ok(qs.length >= 1, c);
    assert.ok(qs.every((q) => q.cat === c), c);
    sum += qs.length;
  }
  assert.equal(sum, QUIZ_QUESTIONS.length);
});
