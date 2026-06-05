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
  const cats = ['js', 'vue', 'swift', 'ruby', 'kotlin', 'git'];
  let sum = 0;
  for (const c of cats) {
    const qs = quizQuestions(c);
    assert.ok(qs.length >= 1, c);
    assert.ok(qs.every((q) => q.cat === c), c);
    sum += qs.length;
  }
  assert.equal(sum, QUIZ_QUESTIONS.length);
});
