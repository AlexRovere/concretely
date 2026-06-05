/**
 * A tick-based model of "main thread vs background" on iOS. The main thread
 * renders one UI frame per tick IF it is free; heavy synchronous work (I/O,
 * decoding) on the main thread freezes the UI and delays incoming taps. The
 * same work dispatched to a background queue keeps the UI fluid, with a final
 * hop back to main for the UI update.
 *
 * A scenario:
 *   { id, code,
 *     work: { ticks, label, on: 'main'|'bg', uiUpdateTicks: 1 },
 *     startAt: <tick where the heavy work starts>,
 *     taps: [tick, ...] }
 *
 * Per tick, the main lane runs (in priority order): the heavy work if
 * on='main'; the UI-update hop once the work has finished; the oldest pending
 * tap (1 tick each); otherwise idle. The bg lane runs the work if on='bg'.
 * The frame is 'dropped' only while the HEAVY work occupies main — 1-tick tap
 * handlers and the UI update are light and fit in a frame ('ok').
 *
 * Step shape (one snapshot per tick):
 *   { type:'tick', t, main: {label}|null, bg: {label}|null,
 *     frame: 'ok'|'dropped', pendingTaps, handledTap?, uiUpdated?: true }
 * The generator returns:
 *   { totalTicks, droppedFrames, tapLatency: { [tapTick]: handledTick },
 *     uiUpdatedOnMain }
 */

const TICK_CAP = 60;

export function* simulate(scenario) {
  const { work, startAt, taps = [] } = scenario;
  let workRemaining = work.ticks;
  let uiRemaining = work.uiUpdateTicks ?? 0;
  let workDone = false;
  let uiDone = uiRemaining === 0;
  const pending = []; // tap ticks, FIFO
  const tapLatency = {};
  let droppedFrames = 0;
  let uiUpdatedOnMain = false;
  let totalTicks = 0;

  for (let t = 0; t < TICK_CAP; t++) {
    totalTicks = t + 1;

    // Taps arriving at this tick join the pending queue first.
    for (const tapTick of taps) if (tapTick === t) pending.push(tapTick);
    const pendingBefore = pending.length;

    const workDoneAtStart = workDone;
    let main = null;
    let bg = null;
    let frame = 'ok';
    let handledTap;
    let uiUpdated = false;

    // Bg lane: runs the heavy work if dispatched there.
    if (work.on === 'bg' && t >= startAt && workRemaining > 0) {
      bg = { label: work.label };
      workRemaining -= 1;
      if (workRemaining === 0) workDone = true;
    }

    // Main lane, in priority order.
    if (work.on === 'main' && t >= startAt && workRemaining > 0) {
      main = { label: work.label };
      frame = 'dropped'; // heavy work hogs the main thread: no frame rendered
      workRemaining -= 1;
      if (workRemaining === 0) workDone = true;
    } else if (workDoneAtStart && !uiDone) {
      main = { label: 'UI update (main)' };
      uiRemaining -= 1;
      if (uiRemaining === 0) {
        uiDone = true;
        uiUpdated = true;
        uiUpdatedOnMain = true;
      }
    } else if (pending.length > 0) {
      const tapTick = pending.shift();
      main = { label: `tap @t${tapTick}` };
      handledTap = tapTick;
      tapLatency[tapTick] = t;
    }

    if (frame === 'dropped') droppedFrames += 1;

    const step = { type: 'tick', t, main, bg, frame, pendingTaps: pendingBefore };
    if (handledTap !== undefined) step.handledTap = handledTap;
    if (uiUpdated) step.uiUpdated = true;
    yield step;

    const allTapsHandled = taps.every((tapTick) => tapTick in tapLatency);
    const allDone = workDone && uiDone && pending.length === 0 && allTapsHandled;
    // Trailing free tick: everything done and nothing ran this tick.
    if (allDone && main === null && bg === null) break;
  }

  return { totalTicks, droppedFrames, tapLatency, uiUpdatedOnMain };
}

/** Run a scenario to completion and return its summary. */
export function summaryOf(scenario) {
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const MAINTHREAD_SCENARIOS = [
  {
    id: 'block-main',
    code: `Button("Charger") {
    // ⚠️ I/O synchrone SUR le main thread :
    let data = try! Data(contentsOf: bigFileURL)
    image = UIImage(data: data)
    // Pendant ces ~6 ticks : AUCUNE frame rendue,
    // les taps s'accumulent — l'app paraît gelée ❄️
}`,
    work: { ticks: 6, label: 'Data(contentsOf:) + decode', on: 'main', uiUpdateTicks: 1 },
    startAt: 1,
    taps: [3, 5],
  },
  {
    id: 'dispatch-bg',
    code: `Button("Charger") {
    Task.detached(priority: .userInitiated) {
        // Le travail lourd part en ARRIÈRE-PLAN :
        let data = try! Data(contentsOf: bigFileURL)
        let img = UIImage(data: data)
        await MainActor.run {
            image = img   // retour sur le MAIN pour toucher l'UI ✓
        }
    }
}`,
    work: { ticks: 6, label: 'Data(contentsOf:) + decode', on: 'bg', uiUpdateTicks: 1 },
    startAt: 1,
    taps: [3, 5],
  },
];

export const mainthreadScenarioById = (id) => MAINTHREAD_SCENARIOS.find((s) => s.id === id);
