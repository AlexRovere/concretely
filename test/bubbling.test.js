import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUBBLING_SCENARIOS, simulate, summaryOf, bubblingScenarioById } from '../src/bubbling.js';

function run(gen) {
  const steps = [];
  let res = gen.next();
  while (!res.done) { steps.push(res.value); res = gen.next(); }
  return { steps, value: res.value };
}

const visitsOf = (steps, phase) =>
  steps.filter((s) => s.type === 'visit' && s.phase === phase).map((s) => s.node);

test('trois-phases: calls fire in capture → target → bubble order', () => {
  const { calls } = summaryOf(bubblingScenarioById('trois-phases'));
  assert.deepEqual(calls, ['f', 'g', 'h']);
});

test('trois-phases: phase steps appear in order capture, target, bubble', () => {
  const { steps } = run(simulate(bubblingScenarioById('trois-phases')));
  const phases = steps.filter((s) => s.type === 'phase').map((s) => s.phase);
  assert.deepEqual(phases, ['capture', 'target', 'bubble']);
});

test('trois-phases: capture goes html→body, bubble goes body→html', () => {
  const { steps } = run(simulate(bubblingScenarioById('trois-phases')));
  const cap = visitsOf(steps, 'capture');
  const bub = visitsOf(steps, 'bubble');
  assert.ok(cap.indexOf('html') < cap.indexOf('body'), 'capture html before body');
  assert.ok(bub.indexOf('body') < bub.indexOf('html'), 'bubble body before html');
});

test('stop-propagation: only the stopping handler fires, with a stopped step', () => {
  const { steps, value } = run(simulate(bubblingScenarioById('stop-propagation')));
  assert.deepEqual(value.calls, ['handler (stop)']);
  assert.ok(steps.some((s) => s.type === 'stopped'), 'a stopped step exists');
});

test('stop-propagation: body is never visited in the bubble phase after stop', () => {
  const { steps } = run(simulate(bubblingScenarioById('stop-propagation')));
  const bubbledBody = steps.some(
    (s) => s.type === 'visit' && s.phase === 'bubble' && s.node === 'body',
  );
  assert.equal(bubbledBody, false);
});

test('delegation: the single listener fires at #list during the bubble phase', () => {
  const { steps, value } = run(simulate(bubblingScenarioById('delegation')));
  assert.deepEqual(value.calls, ['délégué → li-3']);
  const fired = steps.find((s) => s.type === 'listener');
  assert.equal(fired.node, '#list');
  assert.equal(fired.phase, 'bubble');
});

test('delegation: intermediate nodes are visited without firing listeners', () => {
  const { steps } = run(simulate(bubblingScenarioById('delegation')));
  // html and body are visited (capture and bubble) but carry no listeners.
  const listenerNodes = steps.filter((s) => s.type === 'listener').map((s) => s.node);
  assert.ok(!listenerNodes.includes('html'));
  assert.ok(!listenerNodes.includes('body'));
  const visited = steps.filter((s) => s.type === 'visit').map((s) => s.node);
  assert.ok(visited.includes('html') && visited.includes('body'));
});

test('target phase fires the target listener even when registered without capture', () => {
  const { steps } = run(simulate(bubblingScenarioById('trois-phases')));
  // 'g' is a bubble listener on the target; it must fire during the target phase.
  const gStep = steps.find((s) => s.type === 'listener' && s.label === 'g');
  assert.equal(gStep.phase, 'bubble');
  assert.equal(gStep.node, '#button');
  // And it fires after the target phase begins, before the bubble phase.
  const idx = steps.indexOf(gStep);
  const targetPhaseIdx = steps.findIndex((s) => s.type === 'phase' && s.phase === 'target');
  const bubblePhaseIdx = steps.findIndex((s) => s.type === 'phase' && s.phase === 'bubble');
  assert.ok(targetPhaseIdx < idx && idx < bubblePhaseIdx);
});

test('every scenario has code + path, and target equals the last path element', () => {
  for (const s of BUBBLING_SCENARIOS) {
    assert.equal(typeof s.code, 'string', `${s.id} code`);
    assert.ok(Array.isArray(s.path) && s.path.length > 0, `${s.id} path`);
    assert.equal(s.target, s.path[s.path.length - 1], `${s.id} target`);
  }
});
