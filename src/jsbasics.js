/**
 * JavaScript basics & quirks, as an evaluation trace (shared evaltrace engine):
 *  - `==` coerces types (0 == '' is true, but '' == '0' is false…) — use `===`;
 *  - NaN equals nothing, not even itself (Number.isNaN);
 *  - `var` hoists (undefined before the line), `let` has the temporal dead zone;
 *  - IEEE 754 floats (0.1 + 0.2), typeof null === 'object', 2^53 limit;
 *  - truthiness: 0, '' and NaN are falsy — but [] is truthy AND [] == false!
 *
 * The displayed values are CROSS-CHECKED by real JavaScript in the tests —
 * this tab can never lie about JS semantics.
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const JSBASICS_SCENARIOS = [
  {
    id: 'egalite',
    code: `0 == ''             // true 😱 — coercion vers Number
0 == '0'            // true
'' == '0'           // false ?! (donc == n'est PAS transitif)
null == undefined   // true (cas spécial)
NaN === NaN         // false — NaN n'est égal à RIEN
[] == false         // true 😱
// → utilise TOUJOURS === (et Number.isNaN pour NaN)`,
    ops: [
      { eval: "0 == ''", value: 'true', note: 'coercion : Number(\'\') vaut 0' },
      { eval: "0 == '0'", value: 'true' },
      { eval: "'' == '0'", value: 'false', note: '== n\'est pas transitif !' },
      { eval: 'null == undefined', value: 'true', note: 'cas spécial de ==' },
      { eval: 'NaN === NaN', value: 'false', note: 'NaN n\'est égal à rien — Number.isNaN()' },
      { eval: '[] == false', value: 'true', note: '[] → \'\' → 0…' },
    ],
  },
  {
    id: 'hoisting',
    code: `console.log(a)   // undefined — var est "hissée" (hoisted)
var a = 1

console.log(b)   // 💥 ReferenceError — TDZ (temporal dead zone)
let b = 2`,
    ops: [
      { eval: 'console.log(a)', value: 'undefined', note: 'var est hissée, initialisée à undefined' },
      { eval: 'var a = 1', value: '1' },
      { crash: 'console.log(b)', message: 'ReferenceError : b est dans la TDZ — let n\'est pas hissée-initialisée' },
      { eval: 'let b = 2', value: '2' },
    ],
  },
  {
    id: 'nombres',
    code: `0.1 + 0.2            // 0.30000000000000004 (IEEE 754)
0.1 + 0.2 === 0.3    // false
typeof null           // "object" — bug historique, jamais corrigé
typeof NaN            // "number" 😅
2 ** 53 + 1           // 9007199254740992 — même nombre ! (limite des entiers sûrs)`,
    ops: [
      { eval: '0.1 + 0.2', value: '0.30000000000000004', note: 'flottants binaires IEEE 754' },
      { eval: '0.1 + 0.2 === 0.3', value: 'false', note: 'compare avec un epsilon, ou travaille en centimes' },
      { eval: 'typeof null', value: '"object"', note: 'bug historique de 1995, gardé pour compatibilité' },
      { eval: 'typeof NaN', value: '"number"', note: 'Not-a-Number est… un nombre' },
      { eval: '2 ** 53 + 1 === 2 ** 53', value: 'true', note: 'au-delà de 2⁵³, les entiers perdent la précision — BigInt' },
    ],
  },
  {
    id: 'truthiness-js',
    code: `if (0)  { … }      // sauté — 0 est falsy (≠ Ruby !)
if ('') { … }      // sauté — '' est falsy
if ([]) { … }      // ✓ exécuté — [] est TRUTHY…
[] == false        // …et pourtant true 🤯
// falsy : false, 0, -0, '', null, undefined, NaN (et c'est tout)`,
    ops: [
      { branch: 'if (0)', taken: false, else: '0 est falsy — le bloc est sauté' },
      { branch: "if ('')", taken: false, else: "'' est falsy aussi" },
      { branch: 'if ([])', taken: true, then: '[] est TRUTHY (objet) — le bloc s\'exécute' },
      { eval: '[] == false', value: 'true', note: 'truthy en if, égal à false en == — deux mécanismes différents !' },
    ],
  },
];

export const jsBasicsScenarioById = (id) => JSBASICS_SCENARIOS.find((s) => s.id === id);
