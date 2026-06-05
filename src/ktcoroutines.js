/**
 * A tick-based model of Kotlin coroutines on Android: a `suspend` function
 * FREES the thread it runs on (suspending ≠ blocking) so the main thread keeps
 * handling UI while a coroutine awaits, `withContext(Dispatchers.IO)` moves
 * heavy work off the main thread and resumes the coroutine back on it, and
 * `async`/`awaitAll` runs requests in PARALLEL on the dispatcher pool.
 *
 * This module REUSES the lane/actor engine from swiftconcurrency.js — it does
 * NOT reimplement it. Model mapping:
 *   - lanes           = dispatcher threads. 'main' = Dispatchers.Main; every
 *                       other lane is a thread of the IO/Default pool.
 *   - io segment      = suspension: the coroutine is awaiting and the thread it
 *                       was on is FREED (occupies no lane).
 *   - join segment    = awaiting child coroutines (withContext / awaitAll):
 *                       suspended, no lane, until the listed tasks finish.
 *   - cpu segment     = code actually executing on a dispatcher thread (needs a
 *                       lane: a 'main' task only runs on 'main', a 'pool' task
 *                       on any non-main / IO-pool lane).
 *
 * `simulate(scenario)` / `summaryOf(scenario)` are thin wrappers that delegate
 * to the engine; the scenarios below are valid engine scenarios.
 */

import {
  simulate as engineSimulate,
  summaryOf as engineSummaryOf,
} from './swiftconcurrency.js';

export function simulate(scenario) {
  return engineSimulate(scenario);
}

export function summaryOf(scenario) {
  return engineSummaryOf(scenario);
}

export const KTCOROUTINES_SCENARIOS = [
  {
    id: 'suspend-frees-main',
    code: `// Dans le ViewModel :
viewModelScope.launch {            // démarre sur Dispatchers.Main
    val data = repo.fetchUser()    // suspend fun → SUSPEND, ne bloque pas
    // pendant l'attente, le main thread gère l'UI normalement
    uiState.value = data           // reprise sur Main
}`,
    lanes: ['main'],
    tasks: [
      {
        id: 'A',
        label: 'launch fetchUser',
        lane: 'main',
        segments: [
          { kind: 'cpu', ticks: 1, label: 'préparation' },
          { kind: 'io', ticks: 3, label: 'suspend (réseau)' },
          { kind: 'cpu', ticks: 1, label: 'uiState.value = data' },
        ],
      },
      {
        id: 'B',
        label: 'click handler',
        lane: 'main',
        startAt: 1,
        segments: [
          { kind: 'cpu', ticks: 2, label: 'gérer le clic' },
        ],
      },
    ],
  },
  {
    id: 'withcontext-io',
    code: `viewModelScope.launch {                    // sur Main
    val json = withContext(Dispatchers.IO) {
        file.readText()                    // travail bloquant → thread IO
    }                                      // ← la coroutine REVIENT sur Main
    uiState.value = parse(json)
}`,
    lanes: ['main', 'io1'],
    tasks: [
      {
        id: 'A',
        label: 'coroutine (Main)',
        lane: 'main',
        segments: [
          { kind: 'cpu', ticks: 1, label: 'launch' },
          { kind: 'join', tasks: ['IO'], label: 'withContext(IO)…' },
          { kind: 'cpu', ticks: 1, label: 'uiState.value = …' },
        ],
      },
      {
        id: 'IO',
        label: 'bloc IO',
        lane: 'pool',
        startAt: 1,
        segments: [
          { kind: 'cpu', ticks: 3, label: 'file.readText()' },
        ],
      },
    ],
  },
  {
    id: 'async-awaitall',
    code: `viewModelScope.launch {
    val user  = async { api.user() }    // démarrent…
    val posts = async { api.posts() }   // …en PARALLÈLE
    render(user.await(), posts.await()) // attend les deux
}`,
    lanes: ['main', 'io1', 'io2'],
    tasks: [
      {
        id: 'P',
        label: 'launch',
        lane: 'main',
        segments: [
          { kind: 'cpu', ticks: 1, label: 'async ×2' },
          { kind: 'join', tasks: ['U', 'S'], label: 'awaitAll' },
          { kind: 'cpu', ticks: 1, label: 'render' },
        ],
      },
      {
        id: 'U',
        label: 'api.user()',
        lane: 'pool',
        startAt: 1,
        segments: [
          { kind: 'cpu', ticks: 3, label: 'api.user()' },
        ],
      },
      {
        id: 'S',
        label: 'api.posts()',
        lane: 'pool',
        startAt: 1,
        segments: [
          { kind: 'cpu', ticks: 2, label: 'api.posts()' },
        ],
      },
    ],
  },
];

export const ktCoroutinesScenarioById = (id) =>
  KTCOROUTINES_SCENARIOS.find((s) => s.id === id);
