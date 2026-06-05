/**
 * A small, faithful model of the Android Activity lifecycle as a state machine,
 * for the classic "which callbacks fire on rotate / home / back?" question.
 *
 * States (ordered): 'initialized' → 'created' → 'started' → 'resumed', and
 * back down. Callbacks move the Activity between ADJACENT states:
 *   onCreate:  initialized → created
 *   onStart:   created     → started
 *   onResume:  started     → resumed
 *   onPause:   resumed     → started
 *   onStop:    started     → created
 *   onRestart: created     → created   (warm-up before onStart; state unchanged)
 *   onDestroy: created     → destroyed
 * Any other source state for a callback is an illegal transition and throws.
 *
 * A scenario is a list of user/system actions; `simulate(actions)` expands each
 * into the EXACT callback sequence enforced by the machine:
 *   { action:'launch' } → onCreate, onStart, onResume
 *   { action:'rotate' } → onPause, onStop, onDestroy, then a NEW instance:
 *                          onCreate, onStart, onResume
 *   { action:'home'   } → onPause, onStop                  (instance kept)
 *   { action:'return' } → onRestart, onStart, onResume
 *   { action:'back'   } → onPause, onStop, onDestroy       (finishing)
 *
 * Step shapes (for the visualizer):
 *   { type:'action',   label }            e.g. 'rotate'
 *   { type:'callback', name, state }      state AFTER the callback runs
 *   { type:'instance', n }                n = 2 for the recreated instance
 * The generator RETURNS { events, finalState, instances } where `events` is the
 * list of callback names in order.
 */

/** Callback → { from: required source state, to: resulting state }. */
const TRANSITIONS = {
  onCreate: { from: 'initialized', to: 'created' },
  onStart: { from: 'created', to: 'started' },
  onResume: { from: 'started', to: 'resumed' },
  onPause: { from: 'resumed', to: 'started' },
  onStop: { from: 'started', to: 'created' },
  onRestart: { from: 'created', to: 'created' },
  onDestroy: { from: 'created', to: 'destroyed' },
};

/** Each action expanded to the callbacks it triggers; 'instance' starts a new one. */
const ACTIONS = {
  launch: ['onCreate', 'onStart', 'onResume'],
  rotate: ['onPause', 'onStop', 'onDestroy', 'instance', 'onCreate', 'onStart', 'onResume'],
  home: ['onPause', 'onStop'],
  return: ['onRestart', 'onStart', 'onResume'],
  back: ['onPause', 'onStop', 'onDestroy'],
};

export function* simulate(actions) {
  const events = [];
  let state = 'initialized';
  let instances = 1;

  for (const a of actions) {
    const steps = ACTIONS[a.action];
    if (!steps) throw new Error(`Unknown action: ${a.action}`);
    yield { type: 'action', label: a.action };

    for (const name of steps) {
      if (name === 'instance') {
        instances += 1;
        state = 'initialized';
        yield { type: 'instance', n: instances };
        continue;
      }
      const t = TRANSITIONS[name];
      if (state !== t.from) {
        throw new Error(`Illegal transition: ${name} from '${state}' (expected '${t.from}')`);
      }
      state = t.to;
      events.push(name);
      yield { type: 'callback', name, state };
    }
  }

  return { events, finalState: state, instances };
}

/** Run a scenario to completion and return { events, finalState, instances }. */
export function summaryOf(actions) {
  const gen = simulate(actions);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const LIFECYCLE_SCENARIOS = [
  {
    id: 'rotation',
    code: `override fun onCreate(savedInstanceState: Bundle?) { … }
// Rotation de l'écran :
// onPause → onStop → onDestroy   (l'instance MEURT)
// puis une NOUVELLE instance :
// onCreate → onStart → onResume
// → d'où les ViewModel / SavedStateHandle !`,
    actions: [{ action: 'launch' }, { action: 'rotate' }],
  },
  {
    id: 'home-return',
    code: `// Bouton Home : l'app passe en arrière-plan
// onPause → onStop   (PAS de onDestroy : l'instance reste)
// Retour sur l'app :
// onRestart → onStart → onResume`,
    actions: [{ action: 'launch' }, { action: 'home' }, { action: 'return' }],
  },
  {
    id: 'back-finish',
    code: `// Bouton Back : l'Activity se TERMINE
// onPause → onStop → onDestroy
// (pas de recréation : isFinishing == true)`,
    actions: [{ action: 'launch' }, { action: 'back' }],
  },
];

export const lifecycleScenarioById = (id) => LIFECYCLE_SCENARIOS.find((s) => s.id === id);
