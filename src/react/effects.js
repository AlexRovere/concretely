/**
 * `useEffect` : quand l'effet se (re)joue, quand le cleanup s'exécute, et le
 * double-invoke de StrictMode en dev.
 *
 * Le tableau de dépendances décide du rejeu :
 *   deps = null (absent) → l'effet se rejoue après CHAQUE rendu.
 *   deps = []            → une seule fois au montage ; cleanup au démontage.
 *   deps = ['x']         → au montage, puis à chaque rendu où x a changé
 *                          (cleanup de l'effet précédent AVANT de le rejouer).
 * Au démontage, le dernier cleanup s'exécute toujours.
 *
 * StrictMode (dev uniquement) monte le composant DEUX fois pour révéler les
 * effets non nettoyés : setup → cleanup → setup. En production, une seule fois.
 *
 * Forme d'un scénario :
 *   { id, code, label, deps:null|[]|['x'], strict:boolean,
 *     timeline:[{ action:'mount' } | { action:'update', changed } | { action:'unmount' }] }
 *
 * Steps :
 *   { type:'render', label:'mount'|'update'|'unmount' }
 *   { type:'effect', label }     le setup s'exécute
 *   { type:'cleanup', label }    le cleanup s'exécute
 * Le générateur RETOURNE { runs, cleanups }.
 */

export function* simulate(scenario) {
  const { label = 'effect', deps = [], strict = false, timeline = [] } = scenario;
  let runs = 0;
  let cleanups = 0;
  let active = false; // un effet est-il actuellement « monté » (cleanup en attente) ?

  const runSetup = function* () { runs += 1; active = true; yield { type: 'effect', label }; };
  const runCleanup = function* () { cleanups += 1; active = false; yield { type: 'cleanup', label }; };

  for (const ev of timeline) {
    if (ev.action === 'mount') {
      yield { type: 'render', label: 'mount' };
      yield* runSetup();
      if (strict) { yield* runCleanup(); yield* runSetup(); } // dev double-invoke
    } else if (ev.action === 'update') {
      yield { type: 'render', label: 'update' };
      const reruns = deps === null || (Array.isArray(deps) && deps.length > 0 && ev.changed);
      if (reruns) { yield* runCleanup(); yield* runSetup(); }
    } else if (ev.action === 'unmount') {
      yield { type: 'render', label: 'unmount' };
      if (active) yield* runCleanup();
    }
  }

  return { runs, cleanups };
}

/** Run to completion, return { runs, cleanups }. */
export function summaryOf(scenario) {
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const EFFECTS_SCENARIOS = [
  {
    id: 'deps-empty',
    label: 'subscribe',
    deps: [],
    strict: false,
    timeline: [{ action: 'mount' }, { action: 'update', changed: true }, { action: 'unmount' }],
    code: `useEffect(() => {
  const sub = source.subscribe(...)
  return () => sub.unsubscribe()   // cleanup
}, [])
// deps [] : setup au montage seulement, cleanup au démontage.
// Un re-rendu intermédiaire ne rejoue rien.`,
  },
  {
    id: 'deps-value',
    label: 'fetch',
    deps: ['userId'],
    strict: false,
    timeline: [
      { action: 'mount' },
      { action: 'update', changed: true },
      { action: 'update', changed: false },
      { action: 'unmount' },
    ],
    code: `useEffect(() => {
  const ctrl = new AbortController()
  fetch(\`/u/\${userId}\`, { signal: ctrl.signal })
  return () => ctrl.abort()        // cleanup avant chaque rejeu
}, [userId])
// userId change → cleanup + re-fetch. Inchangé → rien.`,
  },
  {
    id: 'no-deps',
    label: 'log',
    deps: null,
    strict: false,
    timeline: [{ action: 'mount' }, { action: 'update', changed: true }, { action: 'unmount' }],
    code: `useEffect(() => {
  console.log('rendu')
})               // ✗ pas de tableau de deps
// Se rejoue après CHAQUE rendu (cleanup puis setup) — piège de perf.`,
  },
  {
    id: 'strict-mode',
    label: 'connect',
    deps: [],
    strict: true,
    timeline: [{ action: 'mount' }],
    code: `useEffect(() => {
  const conn = createConnection()
  conn.connect()
  return () => conn.disconnect()
}, [])
// StrictMode (dev) : setup → cleanup → setup.
// Si le cleanup est correct, connect/disconnect s'équilibrent.`,
  },
];

export const effectsScenarioById = (id) => EFFECTS_SCENARIOS.find((s) => s.id === id);
