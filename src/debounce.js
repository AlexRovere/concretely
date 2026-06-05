/**
 * A tick-based model contrasting three reactions to the SAME stream of input
 * events: the raw handler (runs on every event), DEBOUNCE and THROTTLE.
 *
 * DEBOUNCE (trailing): every event (re)arms a timer for `t + wait`. While a
 * timer is pending the handler is "waiting"; when the timer tick is reached
 * with no new event since the last arming, that tick "fires". A burst of
 * events therefore collapses into a single trailing call once the stream
 * falls silent for `wait` ticks.
 *
 * THROTTLE (leading edge): an event with no cooldown fires immediately and
 * opens a cooldown window of `wait` ticks; events arriving during that window
 * are "blocked". This yields at most one call per `wait`-tick window, the
 * first of each window firing right away.
 *
 * A scenario:
 *   { id, code, wait, events: [tick, ...], duration }
 *
 * Step shape (one snapshot per tick t in [0, duration)):
 *   { type:'tick', t,
 *     event: boolean,                       an input event fired this tick
 *     raw: boolean,                         raw handler runs (=== event)
 *     debounce: 'fired'|'waiting'|null,     'waiting' while a timer is pending
 *     throttle: 'fired'|'blocked'|null }    'blocked' = event ignored (cooldown)
 *
 * The generator returns:
 *   { rawCalls, debounceFires: [tick, ...], throttleFires: [tick, ...] }
 */

export function* simulate(scenario) {
  const { wait, events = [], duration } = scenario;
  const eventSet = new Set(events);

  let rawCalls = 0;
  const debounceFires = [];
  const throttleFires = [];

  // Debounce: the tick the pending timer is scheduled to fire (null = none).
  let timerAt = null;
  // Throttle: events at ticks < cooldownUntil are blocked (exclusive bound).
  let cooldownUntil = 0;

  for (let t = 0; t < duration; t++) {
    const event = eventSet.has(t);

    // --- raw ---
    const raw = event;
    if (raw) rawCalls += 1;

    // --- debounce ---
    // An event re-arms the timer; this happens before we test for a fire so an
    // event lands as 'waiting', never as a fire on the same tick.
    if (event) timerAt = t + wait;
    let debounce = null;
    if (timerAt !== null) {
      if (t === timerAt) {
        debounce = 'fired';
        debounceFires.push(t);
        timerAt = null;
      } else {
        debounce = 'waiting';
      }
    }

    // --- throttle ---
    let throttle = null;
    if (event) {
      if (t >= cooldownUntil) {
        throttle = 'fired';
        throttleFires.push(t);
        cooldownUntil = t + wait;
      } else {
        throttle = 'blocked';
      }
    }

    yield { type: 'tick', t, event, raw, debounce, throttle };
  }

  return { rawCalls, debounceFires, throttleFires };
}

/** Run a scenario to completion and return its summary. */
export function summaryOf(scenario) {
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const DEBOUNCE_SCENARIOS = [
  {
    id: 'recherche',
    code: `// L'utilisateur tape "con", pause, "cr", pause, "e" :
input.addEventListener('input', debounce(search, 300))
// debounce : search() ne part qu'après 300 ms de SILENCE
// → 3 appels au lieu de 6 (un par rafale)
input.addEventListener('input', throttle(search, 300))
// throttle : au plus un appel par fenêtre de 300 ms (le premier part tout de suite)`,
    wait: 3,
    events: [0, 1, 2, 6, 7, 12],
    duration: 16,
  },
  {
    id: 'scroll',
    code: `// Scroll continu : un événement à CHAQUE tick
window.addEventListener('scroll', debounce(onScroll, 300))
// debounce : ne part JAMAIS pendant le scroll… seulement à la fin !
window.addEventListener('scroll', throttle(onScroll, 300))
// throttle : un appel régulier pendant le scroll → le bon choix ici`,
    wait: 3,
    events: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    duration: 13,
  },
];

export const debounceScenarioById = (id) => DEBOUNCE_SCENARIOS.find((s) => s.id === id);
