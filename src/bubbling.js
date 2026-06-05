/**
 * A tiny, faithful model of DOM event propagation (capture / target / bubble),
 * for the classic "in what order do these listeners fire?" question.
 *
 * A scenario describes a dispatch on a fixed DOM path:
 *   { id, code,
 *     path: ['html','body','#list','#item'],   // root → target
 *     listeners: [{ node, phase:'capture'|'bubble', label, stop?, log? }],
 *     target: '#item' }                          // === path's last element
 *
 * Dispatch walks three phases:
 *   CAPTURE — root DOWN to (but excluding) the target; capture listeners fire.
 *   TARGET  — the target itself; BOTH its capture and bubble listeners fire
 *             (capture first), regardless of how they were registered.
 *   BUBBLE  — target UP to the root (excluding the target); bubble listeners
 *             fire.
 * A listener with `stop: true` calls stopPropagation(), which halts the whole
 * walk immediately after that listener fires.
 *
 * Step shapes (for the visualizer):
 *   { type:'phase', phase:'capture'|'target'|'bubble' }
 *   { type:'visit', node, phase }                  one per node entered
 *   { type:'listener', node, phase, label }        a listener fires
 *   { type:'log', value }                          its console output
 *   { type:'stopped', node }                        stopPropagation() halted it
 * The generator returns { calls: [labels in firing order], output: [logs] }.
 */

export function* simulate(scenario) {
  const path = scenario.path;
  const target = scenario.target;
  const calls = [];
  const output = [];

  // Listeners attached to `node` for `phase`, in declaration order.
  const listenersAt = (node, phase) =>
    (scenario.listeners ?? []).filter((l) => l.node === node && l.phase === phase);

  // Fire every listener for (node, phase). Returns true if propagation was
  // stopped (so the caller must end the dispatch).
  function* fire(node, phase) {
    for (const l of listenersAt(node, phase)) {
      calls.push(l.label);
      yield { type: 'listener', node, phase, label: l.label };
      if ('log' in l) {
        output.push(l.log);
        yield { type: 'log', value: l.log };
      }
      if (l.stop) {
        yield { type: 'stopped', node };
        return true;
      }
    }
    return false;
  }

  // CAPTURE: root → target, excluding the target.
  yield { type: 'phase', phase: 'capture' };
  for (const node of path) {
    if (node === target) break;
    yield { type: 'visit', node, phase: 'capture' };
    if (yield* fire(node, 'capture')) return { calls, output };
  }

  // TARGET: both capture (first) and bubble listeners on the target fire.
  yield { type: 'phase', phase: 'target' };
  yield { type: 'visit', node: target, phase: 'target' };
  if (yield* fire(target, 'capture')) return { calls, output };
  if (yield* fire(target, 'bubble')) return { calls, output };

  // BUBBLE: target → root, excluding the target.
  yield { type: 'phase', phase: 'bubble' };
  for (let i = path.length - 1; i >= 0; i -= 1) {
    const node = path[i];
    if (node === target) continue;
    yield { type: 'visit', node, phase: 'bubble' };
    if (yield* fire(node, 'bubble')) return { calls, output };
  }

  return { calls, output };
}

/** Run a dispatch to completion and return { calls, output }. */
export function summaryOf(scenario) {
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const BUBBLING_SCENARIOS = [
  {
    id: 'trois-phases',
    code: `// Un clic sur le <button> traverse 3 phases :
html.addEventListener('click', f, { capture: true }) // 1. CAPTURE ↓
button.addEventListener('click', g)                  // 2. TARGET
html.addEventListener('click', h)                    // 3. BUBBLE ↑
// Ordre d'appel : f (capture), g (target), h (bubble)`,
    path: ['html', 'body', '#button'],
    target: '#button',
    listeners: [
      { node: 'html', phase: 'capture', label: 'f' },
      { node: '#button', phase: 'bubble', label: 'g' },
      { node: 'html', phase: 'bubble', label: 'h' },
    ],
  },
  {
    id: 'stop-propagation',
    code: `// stopPropagation() coupe la remontée :
button.addEventListener('click', (e) => {
  e.stopPropagation()        // ⛔ le bubble s'arrête ici
})
body.addEventListener('click', jamaisAppele)`,
    path: ['html', 'body', '#button'],
    target: '#button',
    listeners: [
      { node: '#button', phase: 'bubble', label: 'handler (stop)', stop: true },
      { node: 'body', phase: 'bubble', label: 'jamaisAppele' },
    ],
  },
  {
    id: 'delegation',
    code: `// Délégation : UN listener sur <ul> gère tous les <li>
list.addEventListener('click', (e) => {
  const li = e.target.closest('li')  // remonte au <li> cliqué
  console.log('clic sur', li.id)
})
// Pas besoin d'un listener par <li> — le bubble fait le travail.`,
    path: ['html', 'body', '#list', '#li-3'],
    target: '#li-3',
    listeners: [
      { node: '#list', phase: 'bubble', label: 'délégué → li-3', log: 'clic sur li-3' },
    ],
  },
];

export const bubblingScenarioById = (id) =>
  BUBBLING_SCENARIOS.find((s) => s.id === id);
