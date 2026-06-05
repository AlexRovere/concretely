/**
 * Kotlin basics & quirks, as an evaluation trace (shared evaltrace engine):
 *  - null safety in the type system: `String?` vs `String`, `?.`, `?:` (elvis),
 *    and `!!` that trades the compile-time guarantee for an NPE;
 *  - `==` is STRUCTURAL (equals) and `===` referential — the exact opposite
 *    trap of Java; data classes generate equals/hashCode;
 *  - `val` is an immutable REFERENCE (the object may still mutate);
 *  - `when` is an expression (returns a value) and must be exhaustive.
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const KOTLINBASICS_SCENARIOS = [
  {
    id: 'null-safety',
    code: `var name: String? = null

name.length       // ❌ ne compile pas : type nullable
name?.length      // null — navigation sûre
name ?: "inconnu" // "inconnu" — opérateur elvis
name!!.length     // 💥 NullPointerException assumée

val l = name?.length ?: 0   // le combo idiomatique → 0`,
    ops: [
      { eval: 'var name: String? = null', value: 'null' },
      { error: 'name.length', message: 'only safe (?.) or non-null asserted (!!.) calls are allowed — le null est dans le TYPE' },
      { eval: 'name?.length', value: 'null', note: 'navigation sûre' },
      { eval: 'name ?: "inconnu"', value: '"inconnu"', note: 'elvis : valeur de repli' },
      { crash: 'name!!.length', message: 'NullPointerException — !! troque la garantie compile-time contre un crash' },
      { eval: 'name?.length ?: 0', value: '0', note: 'le combo idiomatique ?. + ?:' },
    ],
  },
  {
    id: 'equality',
    code: `data class User(val id: Int)

val a = User(1)
val b = User(1)

a == b    // true  — STRUCTURELLE (equals généré par data class)
a === b   // false — référentielle (deux objets distincts)
// Piège pour les dev Java : c'est l'INVERSE de == sur objets !`,
    ops: [
      { eval: 'val a = User(1); val b = User(1)', value: '2 instances' },
      { eval: 'a == b', value: 'true', note: 'structurelle — equals() généré par la data class' },
      { eval: 'a === b', value: 'false', note: 'référentielle — deux objets distincts en mémoire' },
      { eval: 'a.copy(id = 2) == a', value: 'false', note: 'copy() : nouvel objet modifié, equals structurel' },
    ],
  },
  {
    id: 'val-when',
    code: `val list = mutableListOf(1, 2)
list = autre        // ❌ ne compile pas : val = référence figée
list.add(3)         // ✓ …mais l'OBJET reste mutable !

val label = when (code) {     // when est une EXPRESSION
    200  -> "OK"
    404  -> "introuvable"
    else -> "?"               // exhaustif obligatoire
}`,
    ops: [
      { eval: 'val list = mutableListOf(1, 2)', value: '[1, 2]' },
      { error: 'list = autre', message: 'val cannot be reassigned — la RÉFÉRENCE est figée' },
      { eval: 'list.add(3)', value: '[1, 2, 3]', note: 'l\'objet, lui, reste mutable — val ≠ immuable profond' },
      { branch: 'when (code = 404)', taken: true, then: 'label = "introuvable"' },
      { eval: 'val label = when (code) { … }', value: '"introuvable"', note: 'when RENVOIE une valeur, et doit être exhaustif' },
    ],
  },
];

export const kotlinBasicsScenarioById = (id) => KOTLINBASICS_SCENARIOS.find((s) => s.id === id);
