/**
 * A tick-based model of CPU scheduling: FIFO runs each cpu burst to
 * completion (convoy effect), round-robin preempts every `quantum` ticks
 * (responsiveness), and io bursts never occupy the CPU (overlap).
 *
 * A scenario is { id, code, policy:'fifo'|'rr', quantum?, lanes:['cpu'],
 * procs: [...] } where a proc is { id, label, arrival, bursts: [...] }:
 *   { kind:'cpu', ticks, label? }  needs the single cpu lane
 *   { kind:'io',  ticks, label? }  suspended — occupies NO lane: the io
 *                                  ticks run down while another process
 *                                  computes (this is the whole point of
 *                                  multitasking)
 *
 * The engine is deterministic: arrivals join the ready queue in `procs`
 * array order (ties included), the queue is strictly first-in-first-out,
 * and the running process keeps the lane while its cpu burst is in
 * progress. Under `fifo` there is no preemption. Under `rr` a process
 * whose quantum expires while others are ready is preempted: it goes to
 * the BACK of the ready queue and the context switch costs ONE tick
 * during which the CPU is idle (if nobody else is ready, the process
 * simply keeps the CPU with a fresh quantum). One snapshot step per tick:
 *   { type:'tick', t,
 *     running:   [{ task, lane, label }],
 *     suspended: [{ task, label }],        blocked on io
 *     waiting:   [{ task, reason:'lane' }] ready but no CPU (the run queue)
 *     pending:   [taskIds],                arrival > t
 *     done:      [taskIds] }
 * The generator returns
 *   { totalTicks, finishedAt: { [procId]: tick }, waited: { [procId]: n } }
 * where `finishedAt` is the tick by which the process is done (last run
 * tick + 1) and `waited` counts ticks spent in the ready queue.
 */

const MAX_TICKS = 200;

export function* simulate(scenario) {
  const { policy, quantum, procs } = scenario;
  const lane = scenario.lanes[0];

  const state = new Map();
  for (const proc of procs) {
    state.set(proc.id, {
      burstIndex: 0,
      remaining: proc.bursts[0].ticks,
      admitted: false,
      blocked: false, // currently in an io burst
      done: false,
    });
  }

  const queue = []; // ready queue (proc ids), strictly FIFO
  const finishedAt = {};
  const waited = {};
  for (const proc of procs) waited[proc.id] = 0;

  const doneIds = [];
  let current = null; // proc id holding the cpu lane
  let used = 0; // ticks the current process has run in this quantum
  let switching = false; // this tick is a context switch (CPU idle)
  let t = 0;

  // Advance a process to its next burst at the end of a tick; returns to
  // the ready queue (cpu), blocks (io), or finishes.
  const advance = (proc, st) => {
    st.burstIndex += 1;
    if (st.burstIndex >= proc.bursts.length) {
      st.done = true;
      st.blocked = false;
      doneIds.push(proc.id);
      finishedAt[proc.id] = t + 1;
      return;
    }
    const next = proc.bursts[st.burstIndex];
    st.remaining = next.ticks;
    st.blocked = next.kind === 'io';
    if (!st.blocked) queue.push(proc.id);
  };

  while (doneIds.length < procs.length && t < MAX_TICKS) {
    // Admissions: arrivals join the ready queue in procs array order.
    for (const proc of procs) {
      const st = state.get(proc.id);
      if (st.admitted || proc.arrival > t) continue;
      st.admitted = true;
      if (proc.bursts[st.burstIndex].kind === 'io') st.blocked = true;
      else queue.push(proc.id);
    }

    // Round-robin preemption: quantum expired and someone else is ready →
    // back of the queue, and the context switch idles the CPU this tick.
    if (policy === 'rr' && current !== null && used >= quantum) {
      if (queue.length > 0) {
        queue.push(current);
        current = null;
        switching = true;
      } else {
        used = 0; // alone on the CPU: fresh quantum, keep running
      }
    }

    // Dispatch the head of the ready queue onto the free lane.
    if (current === null && !switching && queue.length > 0) {
      current = queue.shift();
      used = 0;
    }

    const running = [];
    const suspended = [];
    const waiting = [];
    const pending = [];
    for (const proc of procs) {
      const st = state.get(proc.id);
      if (st.done) continue;
      if (proc.arrival > t) { pending.push(proc.id); continue; }
      const burst = proc.bursts[st.burstIndex];
      if (st.blocked) {
        suspended.push({ task: proc.id, label: burst.label || 'I/O' });
      } else if (proc.id === current) {
        running.push({ task: proc.id, lane, label: burst.label || proc.label });
      } else {
        waiting.push({ task: proc.id, reason: 'lane' });
        waited[proc.id] += 1;
      }
    }

    yield { type: 'tick', t, running, suspended, waiting, pending, done: [...doneIds] };

    // Progress phase: the running cpu burst and every io burst advance
    // (one burst tick per process per tick).
    const ranThisTick = current;
    if (current !== null) {
      const proc = procs.find((p) => p.id === current);
      const st = state.get(current);
      st.remaining -= 1;
      used += 1;
      if (st.remaining <= 0) {
        advance(proc, st);
        current = null; // voluntary release: no context-switch cost
      }
    }
    for (const proc of procs) {
      const st = state.get(proc.id);
      if (proc.id === ranThisTick) continue; // already advanced this tick
      if (!st.blocked || st.done || proc.arrival > t) continue;
      st.remaining -= 1;
      if (st.remaining <= 0) advance(proc, st);
    }

    switching = false;
    t += 1;
  }

  return { totalTicks: t, finishedAt, waited };
}

/** Run a scenario to completion and return { totalTicks, finishedAt, waited }. */
export function summaryOf(scenario) {
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const SCHEDULER_SCENARIOS = [
  {
    id: 'convoy',
    code: `# Politique : FIFO — premier arrivé, premier servi, sans préemption.
# P1 « gros calcul »          arrive à t=0, burst CPU de 6 ticks
# P2 « commande interactive » arrive à t=1, burst CPU de 1 tick
#
# P1 garde le CPU jusqu'au bout de son burst : P2, pourtant
# minuscule, attend 5 ticks dans la file et ne finit qu'à t=7.
# → L'effet convoi : la petite tâche attend tout le gros calcul.`,
    policy: 'fifo',
    lanes: ['cpu'],
    procs: [
      {
        id: 'P1',
        label: 'gros calcul',
        arrival: 0,
        bursts: [{ kind: 'cpu', ticks: 6, label: 'gros calcul' }],
      },
      {
        id: 'P2',
        label: 'commande interactive',
        arrival: 1,
        bursts: [{ kind: 'cpu', ticks: 1, label: 'commande interactive' }],
      },
    ],
  },
  {
    id: 'round-robin',
    code: `# Politique : round-robin, quantum = 1 tick.
# P1 « gros calcul »          arrive à t=0, burst CPU de 6 ticks
# P2 « commande interactive » arrive à t=1, burst CPU de 1 tick
#
# Quantum écoulé + quelqu'un attend → préemption : le processus
# retourne en FIN de file (le changement de contexte coûte 1 tick).
# P2 obtient vite sa tranche et finit à t=3 au lieu de t=7 ;
# P1 finit à t=8 au lieu de t=6 — à peine plus tard.
# → La réactivité est quasi gratuite.`,
    policy: 'rr',
    quantum: 1,
    lanes: ['cpu'],
    procs: [
      {
        id: 'P1',
        label: 'gros calcul',
        arrival: 0,
        bursts: [{ kind: 'cpu', ticks: 6, label: 'gros calcul' }],
      },
      {
        id: 'P2',
        label: 'commande interactive',
        arrival: 1,
        bursts: [{ kind: 'cpu', ticks: 1, label: 'commande interactive' }],
      },
    ],
  },
  {
    id: 'io-overlap',
    code: `# Politique : FIFO — mais une attente I/O n'occupe PAS le CPU.
# P1 « téléchargement » arrive à t=0 : cpu 1, io 4 (réseau), cpu 1
# P2 « compilation »    arrive à t=0 : cpu 4
#
# Dès que P1 part en I/O, il LIBÈRE le CPU : P2 compile pendant
# que le réseau répond. Tout finit en 6 ticks au lieu de 10
# si l'on additionnait naïvement les durées.
# → L'I/O ne consomme pas de CPU : c'est tout le sens du multitâche.`,
    policy: 'fifo',
    lanes: ['cpu'],
    procs: [
      {
        id: 'P1',
        label: 'téléchargement',
        arrival: 0,
        bursts: [
          { kind: 'cpu', ticks: 1, label: 'préparer la requête' },
          { kind: 'io', ticks: 4, label: 'attente réseau' },
          { kind: 'cpu', ticks: 1, label: 'écrire le fichier' },
        ],
      },
      {
        id: 'P2',
        label: 'compilation',
        arrival: 0,
        bursts: [{ kind: 'cpu', ticks: 4, label: 'compilation' }],
      },
    ],
  },
];

export const schedulerScenarioById = (id) =>
  SCHEDULER_SCENARIOS.find((s) => s.id === id);
