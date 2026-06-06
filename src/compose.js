/**
 * A model of Jetpack Compose recomposition:
 *  - writing to a MutableState invalidates the composables that READ it, and
 *    only those re-execute (smart recomposition — unchanged children are
 *    SKIPPED);
 *  - state created WITHOUT `remember` is rebuilt on every recomposition, so
 *    the classic bug: the counter writes 1, recomposition re-creates it at 0,
 *    and the UI never moves;
 *  - `remember { mutableStateOf(…) }` survives recomposition (and
 *    `rememberSaveable` survives rotation — see the ViewModel tab).
 *
 * Scenario shape:
 *   { id, code,
 *     root: 'Counter',
 *     state: { name: 'count', init: 0, remember: boolean },
 *     children: [{ id, reads?: ['count'] }],   // [] when the root shows it all
 *     taps: <number of button taps> }
 *
 * Step shapes:
 *   { type:'compose',   fn, n }            initial composition (n-th execution)
 *   { type:'tap' }
 *   { type:'set',       name, value }      the write that invalidates readers
 *   { type:'recompose', fn, n }
 *   { type:'reinit',    name, value }      no remember → state rebuilt at init
 *   { type:'keep',      name, value }      remember → state survives
 *   { type:'skip',      fn }               unchanged child → skipped
 * The generator returns { value, runs } (runs = executions per composable).
 */

export function* simulate(scenario) {
  const { root, state, children = [], taps } = scenario;
  const runs = {};
  let value = state.init;

  function* run(fn, initial) {
    runs[fn] = (runs[fn] || 0) + 1;
    yield { type: initial ? 'compose' : 'recompose', fn, n: runs[fn] };
  }

  // Initial composition: everything executes once, top-down.
  yield* run(root, true);
  for (const c of children) yield* run(c.id, true);

  for (let i = 0; i < taps; i++) {
    yield { type: 'tap' };
    value += 1;
    yield { type: 'set', name: state.name, value };

    // The write invalidates the readers → recomposition pass.
    yield* run(root, false);
    if (state.remember) {
      yield { type: 'keep', name: state.name, value };
    } else {
      // Without remember the state is REBUILT by the recomposition.
      value = state.init;
      yield { type: 'reinit', name: state.name, value };
    }
    for (const c of children) {
      if ((c.reads || []).includes(state.name)) yield* run(c.id, false);
      else yield { type: 'skip', fn: c.id };
    }
  }

  return { value, runs };
}

/** Run a scenario to completion and return { value, runs }. */
export function summaryOf(scenario) {
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const COMPOSE_SCENARIOS = [
  {
    id: 'no-remember',
    code: `@Composable
fun Counter() {
    // ⚠️ SANS remember : recréé à CHAQUE recomposition !
    val count = mutableStateOf(0)

    Button(onClick = { count.value++ }) {  // écrire → recomposition…
        Text("Clics : \${count.value}")     // …qui RÉINITIALISE count
    }
}
// L'UI affiche 0 pour toujours 💥`,
    root: 'Counter',
    state: { name: 'count', init: 0, remember: false },
    children: [],
    taps: 2,
  },
  {
    id: 'remember-fix',
    code: `@Composable
fun Counter() {
    // ✓ remember : l'état SURVIT aux recompositions
    var count by remember { mutableStateOf(0) }

    Button(onClick = { count++ }) {
        Text("Clics : $count")             // s'incrémente normalement
    }
}`,
    root: 'Counter',
    state: { name: 'count', init: 0, remember: true },
    children: [],
    taps: 2,
  },
  {
    id: 'smart-skip',
    code: `@Composable
fun Screen() {
    var count by remember { mutableStateOf(0) }
    Column {
        Header()              // params inchangés → SKIPPÉ
        CountText(count)      // lit count → recomposé
        IncButton { count++ } // lambda stable → skippé
    }
}
// Compose ne ré-exécute QUE ce qui lit l'état modifié.`,
    root: 'Screen',
    state: { name: 'count', init: 0, remember: true },
    children: [
      { id: 'Header' },
      { id: 'CountText', reads: ['count'] },
      { id: 'IncButton' },
    ],
    taps: 2,
  },
];

export const composeScenarioById = (id) => COMPOSE_SCENARIOS.find((s) => s.id === id);
