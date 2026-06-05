/**
 * A model of Vue 3 reactivity: a `reactive` proxy TRACKS which effect reads
 * which property (Proxy get) and TRIGGERS the subscribed effects when a
 * property is written (Proxy set). A `computed` is lazy: it caches its value
 * and only marks itself DIRTY when a dependency changes — the recomputation
 * happens at the next read, not at write time.
 *
 * Ops:
 *   { effect: 'render', reads: ['count'] }            register + first run
 *   { set: 'count', value: 1 }                        write → trigger readers
 *   { computed: 'double', deps: ['count'], expr, fn }  register (lazy, dirty)
 *   { read: 'double' }                                cache hit or evaluate
 *
 * Step shapes:
 *   { type:'run',      effect, n }            effect executes (n-th run)
 *   { type:'track',    effect, prop }         dependency recorded
 *   { type:'set',      prop, value }
 *   { type:'trigger',  prop, effects }        who re-runs (may be empty!)
 *   { type:'dirty',    computed }             invalidated, NOT recomputed yet
 *   { type:'evaluate', computed, value }      lazy recomputation at read time
 *   { type:'cachehit', computed, value }
 * The generator returns { state, runs, evaluations }.
 */

export function* simulate(scenario) {
  const state = { ...scenario.state };
  const effects = {};   // id -> { reads, runs }
  const computeds = {}; // id -> { deps, fn, expr, dirty, value, evaluations }
  const runs = {};
  const evaluations = {};

  function* runEffect(id) {
    const e = effects[id];
    e.runs += 1;
    runs[id] = e.runs;
    yield { type: 'run', effect: id, n: e.runs };
    for (const prop of e.reads) yield { type: 'track', effect: id, prop };
  }

  for (const op of scenario.ops) {
    if ('effect' in op) {
      effects[op.effect] = { reads: op.reads, runs: 0 };
      yield* runEffect(op.effect);
    } else if ('set' in op) {
      state[op.set] = op.value;
      yield { type: 'set', prop: op.set, value: op.value };
      const subs = Object.keys(effects).filter((id) => effects[id].reads.includes(op.set));
      yield { type: 'trigger', prop: op.set, effects: subs };
      for (const id of subs) yield* runEffect(id);
      for (const [cid, c] of Object.entries(computeds)) {
        if (c.deps.includes(op.set) && !c.dirty) {
          c.dirty = true;
          yield { type: 'dirty', computed: cid };
        }
      }
    } else if ('computed' in op) {
      computeds[op.computed] = { deps: op.deps, fn: op.fn, expr: op.expr, dirty: true, value: undefined, evaluations: 0 };
      evaluations[op.computed] = 0;
    } else if ('read' in op) {
      const c = computeds[op.read];
      if (c.dirty) {
        c.value = c.fn(state);
        c.dirty = false;
        c.evaluations += 1;
        evaluations[op.read] = c.evaluations;
        yield { type: 'evaluate', computed: op.read, value: c.value };
      } else {
        yield { type: 'cachehit', computed: op.read, value: c.value };
      }
    }
  }

  return { state, runs, evaluations };
}

/** Run a scenario to completion and return { state, runs, evaluations }. */
export function summaryOf(scenario) {
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const VUEREACTIVITY_SCENARIOS = [
  {
    id: 'track-trigger',
    code: `const state = reactive({ count: 0, autre: 'x' })

watchEffect(() => {
  affiche(state.count)   // LIT count → Vue note la dépendance (track)
})

state.count++            // ÉCRIT → trigger → l'effet re-tourne ✓
state.autre = 'y'        // personne ne lit autre → RIEN ne tourne`,
    state: { count: 0, autre: 'x' },
    ops: [
      { effect: 'watchEffect', reads: ['count'] },
      { set: 'count', value: 1 },
      { set: 'autre', value: 'y' },
    ],
  },
  {
    id: 'computed-cache',
    code: `const double = computed(() => state.count * 2)

double.value    // 1ʳᵉ lecture → CALCUL (0 × 2 = 0)
double.value    // 2ᵉ lecture → CACHE, rien à recalculer ✓

state.count = 5 // double devient juste "dirty"
                // (PAS recalculé tout de suite : lazy !)
double.value    // lecture → recalcul (5 × 2 = 10)`,
    state: { count: 0 },
    ops: [
      { computed: 'double', deps: ['count'], expr: 'count * 2', fn: (s) => s.count * 2 },
      { read: 'double' },
      { read: 'double' },
      { set: 'count', value: 5 },
      { read: 'double' },
    ],
  },
];

export const vueReactivityScenarioById = (id) =>
  VUEREACTIVITY_SCENARIOS.find((s) => s.id === id);
