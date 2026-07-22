/**
 * Le cycle de rendu React et le batching de `setState` — pourquoi
 * `setCount(count + 1)` trois fois ne fait que +1, alors que
 * `setCount(c => c + 1)` trois fois fait +3.
 *
 * Une passe de RENDU appelle les hooks DANS L'ORDRE (c'est pourquoi on ne les
 * appelle jamais conditionnellement) ; `useState` renvoie la valeur figée de
 * CETTE passe. Un gestionnaire d'événement n'applique pas `setState`
 * immédiatement : il empile des mises à jour dans une FILE, que React traite en
 * une fois (batch) puis COMMIT — un seul re-rendu. Deux formes d'update :
 *
 *   value   : setCount(count + 1) — `count` est la valeur CAPTURÉE au rendu.
 *             Trois appels planifient tous « mettre à 0 + 1 » → 1. (stale)
 *   updater : setCount(c => c + 1) — `c` est l'accumulateur de la file.
 *             Trois appels s'enchaînent 0→1→2→3 → 3.
 *
 * Après le commit, si les deps d'un `useEffect` ont changé, l'effet (passif) se
 * rejoue.
 *
 * Forme d'un scénario :
 *   { id, code, initial:number,
 *     hooks:[{ type:'state', name } | { type:'effect', label, deps:[names] }],
 *     handler:[{ mode:'value'|'updater', delta:number }] }
 *
 * Steps :
 *   { type:'render', count }              début de passe, valeur capturée
 *   { type:'hook', name, value }          un hook appelé pendant le rendu
 *   { type:'event' }                       le gestionnaire démarre
 *   { type:'queue', mode, delta, note }    une mise à jour est empilée
 *   { type:'commit', from, to }            React traite la file, state from→to
 *   { type:'effect', label }               un effet passif se rejoue
 * Le générateur RETOURNE { finalCount, log:[lignes lisibles] }.
 */

export function* simulate(scenario) {
  const { initial, hooks = [], handler = [] } = scenario;
  const captured = initial;
  const log = [];

  yield { type: 'render', count: captured };
  log.push(`render #1 — count = ${captured}`);
  for (const h of hooks) {
    if (h.type === 'state') {
      yield { type: 'hook', name: h.name, value: h.name === 'count' ? captured : h.init };
      log.push(`useState(${h.name}) → ${h.name === 'count' ? captured : JSON.stringify(h.init)}`);
    } else if (h.type === 'effect') {
      yield { type: 'hook', name: `effect(${h.label})`, value: `deps [${(h.deps ?? []).join(', ')}]` };
    }
  }

  yield { type: 'event' };
  log.push('clic → gestionnaire');

  // Empile chaque mise à jour, puis calcule l'état final en un seul commit.
  let acc = captured;
  for (const u of handler) {
    if (u.mode === 'value') {
      // setCount(count + delta) : basé sur la valeur CAPTURÉE, écrase la file.
      acc = captured + u.delta;
      yield { type: 'queue', mode: 'value', delta: u.delta, note: `setCount(${captured} + ${u.delta})` };
      log.push(`file ← setCount(count + ${u.delta})  // count figé = ${captured}`);
    } else {
      // setCount(c => c + delta) : basé sur l'accumulateur.
      acc = acc + u.delta;
      yield { type: 'queue', mode: 'updater', delta: u.delta, note: `setCount(c => c + ${u.delta})` };
      log.push(`file ← setCount(c => c + ${u.delta})`);
    }
  }

  const finalCount = acc;
  yield { type: 'commit', from: captured, to: finalCount };
  log.push(`commit — count : ${captured} → ${finalCount}`);

  if (finalCount !== captured) {
    for (const h of hooks) {
      if (h.type === 'effect' && (h.deps ?? []).includes('count')) {
        yield { type: 'effect', label: h.label };
        log.push(`useEffect(${h.label}) rejoué — deps ont changé`);
      }
    }
  }

  return { finalCount, log };
}

/** Run to completion, return { finalCount, log }. */
export function summaryOf(scenario) {
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const HOOKS_SCENARIOS = [
  {
    id: 'batching-value',
    initial: 0,
    hooks: [
      { type: 'state', name: 'count' },
      { type: 'effect', label: 'document.title', deps: ['count'] },
    ],
    handler: [
      { mode: 'value', delta: 1 },
      { mode: 'value', delta: 1 },
      { mode: 'value', delta: 1 },
    ],
    code: `const [count, setCount] = useState(0)

function onClick() {
  setCount(count + 1)   // count figé à 0 → planifie « 1 »
  setCount(count + 1)   // même count = 0 → planifie « 1 »
  setCount(count + 1)   // idem → planifie « 1 »
}
// React batch les 3 → un seul re-rendu, count devient 1 (pas 3 !)`,
  },
  {
    id: 'batching-updater',
    initial: 0,
    hooks: [
      { type: 'state', name: 'count' },
      { type: 'effect', label: 'document.title', deps: ['count'] },
    ],
    handler: [
      { mode: 'updater', delta: 1 },
      { mode: 'updater', delta: 1 },
      { mode: 'updater', delta: 1 },
    ],
    code: `const [count, setCount] = useState(0)

function onClick() {
  setCount(c => c + 1)  // 0 → 1
  setCount(c => c + 1)  // 1 → 2
  setCount(c => c + 1)  // 2 → 3
}
// La forme « updater » s'enchaîne sur l'accumulateur → count devient 3.`,
  },
  {
    id: 'hooks-order',
    initial: 5,
    hooks: [
      { type: 'state', name: 'count' },
      { type: 'state', name: 'name', init: 'Ada' },
      { type: 'effect', label: 'log', deps: ['count'] },
    ],
    handler: [{ mode: 'updater', delta: 1 }],
    code: `const [count, setCount] = useState(5)   // hook #1
const [name] = useState('Ada')          // hook #2
useEffect(log, [count])                 // hook #3
// React identifie chaque hook par son ORDRE d'appel, pas par son nom :
// jamais de hook dans un if/for, sinon l'ordre change entre deux rendus.`,
  },
];

export const hooksScenarioById = (id) => HOOKS_SCENARIOS.find((s) => s.id === id);
