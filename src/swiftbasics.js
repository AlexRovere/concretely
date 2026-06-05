/**
 * Swift basics & quirks, as an evaluation trace (shared evaltrace engine):
 *  - Optionals: the compiler FORCES you to handle nil (`?.`, `??`, `if let`);
 *    `!` force-unwraps and crashes on nil;
 *  - no truthiness at all: `if 0` does not even compile — `if` wants a Bool;
 *  - `defer` blocks run at scope exit, in REVERSE declaration order (LIFO);
 *  - `let` vs `var`, and value types (struct) by default — see the
 *    Structs vs classes tab for the full story.
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const SWIFTBASICS_SCENARIOS = [
  {
    id: 'optionals',
    code: `var name: String? = nil

name.count        // ❌ ne compile pas : Optional non déballé
name?.count       // nil — navigation sûre
name ?? "inconnu" // "inconnu" — valeur par défaut (nil coalescing)
name!             // 💥 crash : force unwrap d'un nil

if let n = name { print(n) }
else { print("pas de nom") }   // ← exécuté`,
    ops: [
      { eval: 'var name: String? = nil', value: 'nil' },
      { error: 'name.count', message: 'value of optional type String? must be unwrapped — le compilateur REFUSE l\'accès direct' },
      { eval: 'name?.count', value: 'nil', note: 'navigation sûre : court-circuite sur nil' },
      { eval: 'name ?? "inconnu"', value: '"inconnu"', note: 'nil coalescing : valeur par défaut' },
      { crash: 'name!', message: 'Fatal error: Unexpectedly found nil — le force unwrap est un pari' },
      { branch: 'if let n = name', taken: false, else: 'pas de nom — le binding échoue sur nil' },
    ],
  },
  {
    id: 'pas-de-truthiness',
    code: `if 0 { }          // ❌ ne compile pas
if "" { }         // ❌ ne compile pas
// En Swift, AUCUNE truthiness : if exige un Bool.
if !items.isEmpty { }   // ✓ explicite, lisible
if user != nil { }      // ✓ (ou mieux : if let)`,
    ops: [
      { error: 'if 0 { }', message: 'type Int cannot be used as a boolean — pas de truthiness en Swift' },
      { error: 'if "" { }', message: 'type String cannot be used as a boolean' },
      { eval: 'if !items.isEmpty { }', value: '✓', note: 'la condition doit être un vrai Bool — zéro ambiguïté' },
      { eval: 'if user != nil { }', value: '✓', note: 'ou mieux : if let pour déballer en même temps' },
    ],
  },
  {
    id: 'defer',
    code: `func demo() {
    print("ouverture")
    defer { print("defer A") }   // partira en DERNIER…
    defer { print("defer B") }   // …car les defer sont LIFO
    print("travail")
}
// Sortie : ouverture, travail, defer B, defer A`,
    ops: [
      { log: 'ouverture' },
      { eval: 'defer { print("defer A") }', value: 'enregistré', note: 'exécuté à la SORTIE du scope' },
      { eval: 'defer { print("defer B") }', value: 'enregistré', note: 'les defer s\'empilent (LIFO)' },
      { log: 'travail' },
      { log: 'defer B' },
      { log: 'defer A' },
    ],
  },
  {
    id: 'let-var',
    code: `let pi = 3.14
pi = 3.15            // ❌ ne compile pas : let = constante

var scores = [1, 2]
scores.append(3)     // ✓ var struct : mutable

let names = ["Ana"]
names.append("Bob")  // ❌ ne compile pas : let struct = TOUT est figé
// (≠ classes : let c = MaClasse() permet de muter c.prop !)`,
    ops: [
      { eval: 'let pi = 3.14', value: '3.14' },
      { error: 'pi = 3.15', message: 'cannot assign to value: pi is a let constant' },
      { eval: 'scores.append(3)', value: '[1, 2, 3]', note: 'var + struct : mutation OK' },
      { error: 'names.append("Bob")', message: 'cannot use mutating member on immutable value — let fige toute la struct' },
      { eval: 'let c = Compteur(); c.n += 1', value: '✓', note: 'mais une CLASSE référencée par let reste mutable — sémantique de référence' },
    ],
  },
];

export const swiftBasicsScenarioById = (id) => SWIFTBASICS_SCENARIOS.find((s) => s.id === id);
