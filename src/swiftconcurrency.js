/**
 * A tick-based model of Swift structured concurrency: `await` suspends the
 * function (freeing the thread), `async let` runs children in parallel on the
 * cooperative pool, and actors serialize access to their state.
 *
 * A scenario is { id, code, lanes: ['main','bg1',…], tasks: [...] } where a
 * task is { id, label?, lane:'main'|'pool', startAt?, segments: [...] }:
 *   { kind:'cpu',   ticks, label }            needs a lane ('main' tasks only
 *                                             run on the 'main' lane, 'pool'
 *                                             tasks on any non-main lane)
 *   { kind:'io',    ticks, label }            suspended — occupies NO lane
 *                                             (this is `await` on I/O: the
 *                                             thread is freed)
 *   { kind:'actor', actor, ticks, label, inc? } needs a lane AND the actor's
 *                                             lock; held by another task →
 *                                             wait. `inc` bumps
 *                                             values[actor][inc] on completion
 *   { kind:'join',  tasks: [...ids], label }  suspended (no lane) until every
 *                                             listed task is done
 *
 * The engine is deterministic: tasks are processed in array order, lanes are
 * assigned in array order, and a task keeps its lane while a cpu/actor
 * segment is in progress. One snapshot step per tick:
 *   { type:'tick', t,
 *     running:   [{ task, lane, label }],
 *     suspended: [{ task, label }],            io + join
 *     waiting:   [{ task, reason:'lane'|'actor' }],
 *     pending:   [taskIds],                    startAt > t
 *     done:      [taskIds] }
 * The generator returns { totalTicks, values } (values = actor counters,
 * e.g. { counter: { count: 2 } }).
 */

const MAX_TICKS = 200;

export function* simulate(scenario) {
  const { lanes, tasks } = scenario;

  // Actor counters, pre-initialised to 0 so they always appear in the result.
  const values = {};
  for (const task of tasks) {
    for (const seg of task.segments) {
      if (seg.kind === 'actor' && seg.inc) {
        values[seg.actor] = values[seg.actor] || {};
        if (!(seg.inc in values[seg.actor])) values[seg.actor][seg.inc] = 0;
      }
    }
  }

  const state = new Map();
  for (const task of tasks) {
    const first = task.segments[0];
    state.set(task.id, {
      segIndex: 0,
      remaining: first && first.kind !== 'join' ? first.ticks : null,
      lane: null,
      done: false,
    });
  }

  const locks = new Map(); // actor name → task id holding it
  const doneIds = [];
  let t = 0;

  while (doneIds.length < tasks.length && t < MAX_TICKS) {
    const running = [];
    const suspended = [];
    const waiting = [];
    const pending = [];

    // Lanes kept from previous ticks (segment still in progress).
    const occupied = new Set();
    for (const task of tasks) {
      const st = state.get(task.id);
      if (!st.done && st.lane) occupied.add(st.lane);
    }

    for (const task of tasks) {
      const st = state.get(task.id);
      if (st.done) continue;
      if ((task.startAt || 0) > t) { pending.push(task.id); continue; }
      const seg = task.segments[st.segIndex];

      if (seg.kind === 'io' || seg.kind === 'join') {
        suspended.push({ task: task.id, label: seg.label });
        continue;
      }

      // cpu / actor: an actor segment also needs the actor's lock.
      if (seg.kind === 'actor') {
        const holder = locks.get(seg.actor);
        if (holder !== undefined && holder !== task.id) {
          waiting.push({ task: task.id, reason: 'actor' });
          continue;
        }
      }
      if (st.lane === null) {
        const candidates = task.lane === 'main'
          ? lanes.filter((l) => l === 'main')
          : lanes.filter((l) => l !== 'main');
        const free = candidates.find((l) => !occupied.has(l));
        if (!free) { waiting.push({ task: task.id, reason: 'lane' }); continue; }
        st.lane = free;
        occupied.add(free);
        if (seg.kind === 'actor') locks.set(seg.actor, task.id);
      }
      running.push({ task: task.id, lane: st.lane, label: seg.label });
    }

    yield { type: 'tick', t, running, suspended, waiting, pending, done: [...doneIds] };

    // Progress phase: running and io segments advance by one tick; a join
    // completes once all the tasks it awaits are done.
    for (const task of tasks) {
      const st = state.get(task.id);
      if (st.done || (task.startAt || 0) > t) continue;
      const seg = task.segments[st.segIndex];

      let completed = false;
      if (seg.kind === 'join') {
        completed = seg.tasks.every((id) => state.get(id).done);
      } else if (seg.kind === 'io' || st.lane !== null) {
        st.remaining -= 1;
        completed = st.remaining <= 0;
      }

      if (completed) {
        if (seg.kind === 'actor') {
          locks.delete(seg.actor);
          if (seg.inc) values[seg.actor][seg.inc] += 1;
        }
        st.lane = null;
        st.segIndex += 1;
        if (st.segIndex >= task.segments.length) {
          st.done = true;
          doneIds.push(task.id);
        } else {
          const next = task.segments[st.segIndex];
          st.remaining = next.kind !== 'join' ? next.ticks : null;
        }
      }
    }

    t += 1;
  }

  return { totalTicks: t, values };
}

/** Run a scenario to completion and return { totalTicks, values }. */
export function summaryOf(scenario) {
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const CONCURRENCY_SCENARIOS = [
  {
    id: 'await-frees-thread',
    code: `// Sur le main thread :
let data = await URLSession.shared.data(from: url)
// \`await\` SUSPEND la fonction — le thread est LIBÉRÉ,
// il peut traiter d'autres événements UI pendant l'attente.
updateUI(data)`,
    lanes: ['main'],
    tasks: [
      {
        id: 'A',
        label: 'chargement',
        lane: 'main',
        segments: [
          { kind: 'cpu', ticks: 1, label: 'préparation' },
          { kind: 'io', ticks: 3, label: 'await réseau' },
          { kind: 'cpu', ticks: 1, label: 'updateUI' },
        ],
      },
      {
        id: 'B',
        label: 'tap handler',
        lane: 'main',
        startAt: 1,
        segments: [
          { kind: 'cpu', ticks: 2, label: 'gérer le tap' },
        ],
      },
    ],
  },
  {
    id: 'async-let-parallel',
    code: `async let user  = fetchUser()    // démarre tout de suite…
async let posts = fetchPosts()   // …en PARALLÈLE
let page = await Page(user, posts) // on attend les deux
render(page)`,
    lanes: ['main', 'bg1', 'bg2'],
    tasks: [
      {
        id: 'P',
        label: 'parent',
        lane: 'main',
        segments: [
          { kind: 'cpu', ticks: 1, label: 'setup' },
          { kind: 'join', tasks: ['U', 'S'], label: 'await les deux' },
          { kind: 'cpu', ticks: 1, label: 'render' },
        ],
      },
      {
        id: 'U',
        label: 'fetchUser',
        lane: 'pool',
        startAt: 1,
        segments: [
          { kind: 'cpu', ticks: 3, label: 'fetchUser' },
        ],
      },
      {
        id: 'S',
        label: 'fetchPosts',
        lane: 'pool',
        startAt: 1,
        segments: [
          { kind: 'cpu', ticks: 2, label: 'fetchPosts' },
        ],
      },
    ],
  },
  {
    id: 'actor-serializes',
    code: `actor Counter {
    var count = 0
    func increment() { count += 1 }   // une seule tâche à la fois
}
// Deux tâches concurrentes :
async let _ = counter.increment()  // Tâche A
async let _ = counter.increment()  // Tâche B
// L'actor SÉRIALISE les accès : pas de data race, total exact.`,
    lanes: ['bg1', 'bg2'],
    tasks: [
      {
        id: 'A',
        label: 'Tâche A',
        lane: 'pool',
        segments: [
          { kind: 'actor', actor: 'counter', ticks: 2, label: 'increment()', inc: 'count' },
          { kind: 'cpu', ticks: 1, label: 'suite' },
        ],
      },
      {
        id: 'B',
        label: 'Tâche B',
        lane: 'pool',
        segments: [
          { kind: 'actor', actor: 'counter', ticks: 2, label: 'increment()', inc: 'count' },
          { kind: 'cpu', ticks: 1, label: 'suite' },
        ],
      },
    ],
  },
];

export const concurrencyScenarioById = (id) =>
  CONCURRENCY_SCENARIOS.find((s) => s.id === id);
