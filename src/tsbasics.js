/**
 * TypeScript basics & quirks, as an evaluation trace (shared evaltrace engine):
 *  - type erasure: interfaces/types vanish at compilation — typeof u is "object",
 *    `u instanceof User` does not even compile (User is not a runtime value);
 *  - structural typing: shape compatibility, not names — but a direct object
 *    LITERAL triggers the excess property check (z rejected) while the same
 *    object behind a variable passes;
 *  - any vs unknown: any compiles anything and crashes at runtime, unknown
 *    forces a type check first (the "safe any");
 *  - narrowing: a union string | number is unusable until a typeof / in /
 *    discriminant guard narrows it branch by branch.
 *
 * All shown behaviors match real TypeScript in strict mode.
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const TSBASICS_SCENARIOS = [
  {
    id: 'erasure',
    code: `interface User { name: string }
const u: User = { name: 'Ada' }

typeof u             // "object" — pas "User" !
u instanceof User    // ❌ ne compile pas — User n'existe pas à l'exécution
// JS émis par tsc : const u = { name: 'Ada' };  ← l'interface a disparu`,
    ops: [
      { eval: "const u: User = { name: 'Ada' }", value: "{ name: 'Ada' }", note: 'le type ne vit qu\'à la compilation' },
      { eval: 'typeof u', value: '"object"', note: 'à l\'exécution il ne reste que du JavaScript — les types sont EFFACÉS' },
      { error: 'u instanceof User', message: '\'User\' only refers to a type — User est une interface, elle N\'EXISTE PAS à l\'exécution : instanceof est impossible' },
      { log: 'JS émis : const u = { name: \'Ada\' };  — plus aucune trace de l\'interface (type erasure)' },
    ],
  },
  {
    id: 'structural',
    code: `interface Point { x: number; y: number }
function salue(p: Point) { /* … */ }

salue({ x: 1, y: 2, z: 3 })   // ❌ littéral direct : excess property check
const p = { x: 1, y: 2, z: 3 }
salue(p)                      // ✓ via une variable : typage structurel
class Pixel { x = 1; y = 2 }
salue(new Pixel())            // ✓ même forme — structurel, pas nominal`,
    ops: [
      { error: 'salue({ x: 1, y: 2, z: 3 })', message: 'excess property check : un LITTÉRAL direct est vérifié strictement — \'z\' does not exist in type \'Point\'' },
      { eval: 'const p = { x: 1, y: 2, z: 3 }', value: '{ x: 1, y: 2, z: 3 }', note: 'type inféré : { x: number; y: number; z: number }' },
      { eval: 'salue(p)', value: 'OK', note: 'via une variable, le typage STRUCTUREL accepte : p a au moins x et y' },
      { eval: 'salue(new Pixel())', value: 'OK', note: 'même forme ⇒ compatible — structurel, pas nominal (≠ Java/C#)' },
    ],
  },
  {
    id: 'any-unknown',
    code: `const nimporte: any = 42       // any : le compilateur abdique
const inconnu: unknown = 42    // unknown : le « any sûr »

inconnu.toUpperCase()    // ❌ ne compile pas — il faut vérifier d'abord
nimporte.toUpperCase()   // ✓ compile… 💥 TypeError à l'exécution
typeof inconnu === 'string' && inconnu.toUpperCase()  // ✓ narrowing`,
    ops: [
      { eval: 'const nimporte: any = 42', value: '42', note: 'any désactive TOUTE vérification sur cette valeur' },
      { eval: 'const inconnu: unknown = 42', value: '42', note: 'unknown : on peut tout y mettre, rien en faire sans preuve' },
      { error: 'inconnu.toUpperCase()', message: '\'inconnu\' is of type \'unknown\' — unknown force à vérifier le type avant usage' },
      { crash: 'nimporte.toUpperCase()', message: 'any compile sans broncher… TypeError à l\'exécution : nimporte.toUpperCase is not a function (42 est un number)' },
      { eval: "typeof inconnu === 'string' && inconnu.toUpperCase()", value: 'false', note: 'compile : après le typeof, inconnu est rétréci en string — préfère unknown à any' },
    ],
  },
  {
    id: 'narrowing',
    code: `function affiche(x: string | number) {
  x.toUpperCase()               // ❌ pas sur string | number
  if (typeof x === 'string') {
    return x.toUpperCase()      // ici x: string
  }
  return x.toFixed(2)           // ici x: number — par élimination
}
affiche('ts')        // 'TS'
affiche(3.14159)     // '3.14'`,
    ops: [
      { error: 'x.toUpperCase()', message: 'Property \'toUpperCase\' does not exist on type \'string | number\' — seuls les membres COMMUNS à l\'union sont accessibles' },
      { branch: "typeof x === 'string'", taken: true, then: 'x est rétréci (narrowed) en string dans ce bloc' },
      { eval: 'x.toUpperCase()', value: "'TS'", note: 'le compilateur SAIT que x est string ici' },
      { eval: 'affiche(3.14159)', value: "'3.14'", note: 'dans l\'autre branche, x: number par élimination — toFixed autorisé' },
      { log: 'autres gardes : instanceof, \'prop\' in obj, et les unions discriminées (champ commun « kind »)' },
    ],
  },
];

export const tsBasicsScenarioById = (id) => TSBASICS_SCENARIOS.find((s) => s.id === id);
