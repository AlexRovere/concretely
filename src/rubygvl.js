/**
 * A tick-based model of Ruby's GVL (Global VM Lock): even with several OS
 * threads scheduled on several cores, only ONE thread executes Ruby CPU code
 * at a time — but blocking I/O RELEASES the GVL, so I/O-bound threads
 * genuinely overlap. That is why Ruby threads shine for I/O, not for CPU.
 *
 * This module REUSES the lane/actor engine from swiftconcurrency.js — the
 * actor lock mechanism models the GVL perfectly. Model mapping:
 *   - every Ruby CPU burst  = an 'actor' segment on actor 'GVL'
 *                             (needs a core lane AND the GVL lock → serialized)
 *   - every blocking I/O    = an 'io' segment
 *                             (no lane, no lock → overlaps freely)
 *   - lanes                 = OS cores (['core1', 'core2'])
 *   - tasks use lane 'pool' (schedulable on any core)
 *
 * `simulate(scenario)` / `summaryOf(scenario)` are thin wrappers that
 * delegate to the engine; the scenarios below are valid engine scenarios.
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

export const RUBYGVL_SCENARIOS = [
  {
    id: 'cpu-bound',
    code: `# 2 threads, 2 cœurs… et pourtant AUCUN parallélisme :
t1 = Thread.new { fib(35) }   # CPU pur
t2 = Thread.new { fib(35) }   # CPU pur
[t1, t2].each(&:join)
# Le GVL ne laisse qu'UN thread exécuter du Ruby à la fois :
# temps total ≈ la SOMME des deux calculs 🐌`,
    lanes: ['core1', 'core2'],
    tasks: [
      {
        id: 'T1',
        label: 'Thread 1 — fib(35)',
        lane: 'pool',
        segments: [
          { kind: 'actor', actor: 'GVL', ticks: 3, label: 'fib(35)' },
        ],
      },
      {
        id: 'T2',
        label: 'Thread 2 — fib(35)',
        lane: 'pool',
        segments: [
          { kind: 'actor', actor: 'GVL', ticks: 3, label: 'fib(35)' },
        ],
      },
    ],
  },
  {
    id: 'io-bound',
    code: `# Les MÊMES threads, mais sur de l'I/O :
t1 = Thread.new { Net::HTTP.get(uri) }   # l'I/O LIBÈRE le GVL
t2 = Thread.new { Net::HTTP.get(uri) }
[t1, t2].each(&:join)
# Les attentes réseau se recouvrent : temps ≈ UN seul appel ✓`,
    lanes: ['core1', 'core2'],
    tasks: [
      {
        id: 'T1',
        label: 'Thread 1 — HTTP.get',
        lane: 'pool',
        segments: [
          { kind: 'actor', actor: 'GVL', ticks: 1, label: 'préparer la requête' },
          { kind: 'io', ticks: 3, label: 'attente réseau' },
          { kind: 'actor', actor: 'GVL', ticks: 1, label: 'parser la réponse' },
        ],
      },
      {
        id: 'T2',
        label: 'Thread 2 — HTTP.get',
        lane: 'pool',
        segments: [
          { kind: 'actor', actor: 'GVL', ticks: 1, label: 'préparer la requête' },
          { kind: 'io', ticks: 3, label: 'attente réseau' },
          { kind: 'actor', actor: 'GVL', ticks: 1, label: 'parser la réponse' },
        ],
      },
    ],
  },
];

export const rubyGvlScenarioById = (id) =>
  RUBYGVL_SCENARIOS.find((s) => s.id === id);
