/**
 * A model of Kotlin Flow "temperature" — the difference between COLD flows and
 * HOT StateFlow, which trips up everyone learning coroutines.
 *
 * COLD flow: the `flow { … }` block is a RECIPE, not a live stream. Nothing runs
 * until someone collects; and it runs again, FROM SCRATCH, for EVERY collector
 * (two collectors → the producer executes twice, fully).
 *
 * HOT StateFlow: there is ONE producer. It holds a current value, emits to all
 * current collectors at once, and REPLAYS its latest value to anyone who joins
 * late. That replay is exactly why UI state lives in a StateFlow — a screen that
 * subscribes late still gets the current state immediately.
 *
 * Scenario shape:
 *   { id, code,
 *     kind: 'cold' | 'stateflow',
 *     initial?: 0,                 // stateflow only — the current value at start
 *     values: [1, 2, 3],           // what the producer emits
 *     collectors: [ { id:'A', at:0 }, { id:'B', at:2 } ] }
 *                                  // `at` = emission index at which the collector joins
 *
 * Step shapes (for the visualizer):
 *   { type:'collect', collector }                 a collector starts collecting
 *   { type:'produce', value, run }                the producer emits a value (run = 1-based)
 *   { type:'receive', collector, value }          a collector receives a produced value
 *   { type:'replay',  collector, value }          a late/initial collector gets the latest value
 *
 * The generator RETURNS:
 *   { producerRuns, received: { [collectorId]: [values…] } }
 * where replayed values count as received.
 */

export function* simulate(scenario) {
  const received = {};
  for (const c of scenario.collectors) received[c.id] = [];

  if (scenario.kind === 'cold') {
    // The recipe is re-run from scratch for each collector, in `at` order.
    const collectors = [...scenario.collectors].sort((a, b) => a.at - b.at);
    let run = 0;
    for (const collector of collectors) {
      run += 1;
      yield { type: 'collect', collector };
      for (const value of scenario.values) {
        yield { type: 'produce', value, run };
        received[collector.id].push(value);
        yield { type: 'receive', collector, value };
      }
    }
    return { producerRuns: run, received };
  }

  // STATEFLOW — one shared producer.
  const initial = scenario.initial ?? 0;
  let latest = initial;
  const active = [];

  // Collectors present from the very start receive the current value (replay).
  for (const collector of scenario.collectors) {
    if (collector.at === 0) {
      active.push(collector);
      yield { type: 'collect', collector };
      received[collector.id].push(initial);
      yield { type: 'replay', collector, value: initial };
    }
  }

  for (let i = 0; i < scenario.values.length; i++) {
    // Late collectors join BEFORE emission i and replay the latest value so far.
    for (const collector of scenario.collectors) {
      if (collector.at === i && i !== 0) {
        active.push(collector);
        yield { type: 'collect', collector };
        received[collector.id].push(latest);
        yield { type: 'replay', collector, value: latest };
      }
    }
    const value = scenario.values[i];
    yield { type: 'produce', value, run: 1 };
    latest = value;
    for (const collector of active) {
      received[collector.id].push(value);
      yield { type: 'receive', collector, value };
    }
  }

  return { producerRuns: 1, received };
}

/** Drain the generator and return its result { producerRuns, received }. */
export function summaryOf(scenario) {
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const KTFLOW_SCENARIOS = [
  {
    id: 'cold-flow',
    kind: 'cold',
    values: [1, 2, 3],
    collectors: [
      { id: 'A', at: 0 },
      { id: 'B', at: 0 },
    ],
    code: `val nombres = flow {        // COLD : une recette, pas une émission
    emit(1); emit(2); emit(3)
}
nombres.collect { a -> … }  // collecteur A → le bloc s'exécute (1, 2, 3)
nombres.collect { b -> … }  // collecteur B → le bloc se RE-exécute (1, 2, 3)
// 2 collecteurs = 2 exécutions complètes du producteur.`,
    expected: { producerRuns: 2, received: { A: [1, 2, 3], B: [1, 2, 3] } },
  },
  {
    id: 'stateflow',
    kind: 'stateflow',
    initial: 0,
    values: [1, 2, 3],
    collectors: [
      { id: 'A', at: 0 },
      { id: 'B', at: 2 },
    ],
    code: `val uiState = MutableStateFlow(0)   // HOT : émet même sans collecteur
// A collecte dès le début :
uiState.collect { a -> … }          // reçoit 0 (valeur courante), puis 1, 2, 3
// B arrive APRÈS l'émission de 2 :
uiState.collect { b -> … }          // reçoit 2 immédiatement (replay), puis 3
// UN seul producteur, partagé — parfait pour l'état d'UI.`,
    expected: { producerRuns: 1, received: { A: [0, 1, 2, 3], B: [2, 3] } },
  },
];

export const ktFlowScenarioById = (id) => KTFLOW_SCENARIOS.find((s) => s.id === id);
