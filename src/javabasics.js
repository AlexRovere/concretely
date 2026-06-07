/**
 * Java basics & quirks, as an evaluation trace (shared evaltrace engine):
 *  - the Integer cache: autoboxing reuses objects for -128..127, so
 *    `Integer a = 127 == b` is true but the same code with 128 is false;
 *  - the String pool: literals are interned (== true), `new String` is not;
 *  - autoboxing NPEs: unboxing a null Integer throws, invisibly — and the
 *    ternary operator unifies int/Integer by unboxing (the classic trap);
 *  - the equals/hashCode contract: override equals without hashCode and
 *    HashSet/HashMap silently lose your objects (records fix this for free).
 *
 * Values reflect real Java (JDK 17+) semantics — Integer.valueOf caching,
 * compile-time constant folding of string literals, JLS 15.25 conditionals.
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const JAVABASICS_SCENARIOS = [
  {
    id: 'integer-cache',
    code: `Integer a = 127, b = 127;   // autoboxing → Integer.valueOf(127)
Integer c = 128, d = 128;
a == b          // true  — le cache -128..127 rend le MÊME objet
c == d          // false 😱 — 128 est hors cache : deux objets
c.equals(d)     // true — equals() compare les VALEURS
int x = 128, y = 128;
x == y          // true — les primitifs comparent les valeurs`,
    ops: [
      { eval: 'a == b  // 127', value: 'true', note: 'l\'autoboxing passe par Integer.valueOf — les valeurs -128..127 sont mises en CACHE : même objet' },
      { eval: 'c == d  // 128', value: 'false', note: 'hors du cache, deux objets distincts — == compare les RÉFÉRENCES des objets' },
      { eval: 'c.equals(d)', value: 'true', note: 'LA règle : equals() pour les valeurs, == pour les primitifs et l\'identité' },
      { eval: 'int x = 128, y = 128; x == y', value: 'true', note: 'les primitifs, eux, comparent les valeurs' },
    ],
  },
  {
    id: 'strings',
    code: `String s1 = "java";
String s2 = "java";              // même littéral → String pool
String s3 = new String("java");  // new force un NOUVEL objet
s1 == s2        // true — les littéraux sont INTERNÉS
s1 == s3        // false 😱 — hors pool
s1.equals(s3)   // true — toujours equals() pour le contenu
s1 == "ja" + "va"  // true ! — fusionné à la COMPILATION
// String est IMMUABLE : concaténer en boucle → StringBuilder`,
    ops: [
      { eval: 's1 == s2  // deux littéraux', value: 'true', note: 'les LITTÉRAUX sont internés dans le String pool — même objet' },
      { eval: 's1 == s3  // new String("java")', value: 'false', note: 'new force un NOUVEL objet, hors pool' },
      { eval: 's1.equals(s3)', value: 'true', note: 'compare le contenu — la seule comparaison fiable entre String' },
      { eval: 's1 == "ja" + "va"', value: 'true', note: 'les constantes sont fusionnées à la COMPILATION (constant folding) → même littéral interné' },
      { eval: 's1 + "!"  // dans une boucle de n tours', value: '"java!"', note: 'les String sont IMMUABLES — chaque + crée un objet, soit n objets en boucle → StringBuilder' },
    ],
  },
  {
    id: 'autoboxing-npe',
    code: `Integer total = null;   // ok — un OBJET peut être null
int t = total;          // 💥 NullPointerException à l'exécution !
// l'unboxing appelle total.intValue() — sur null…

Integer maybeNull = null;
Integer r = test ? 42 : maybeNull;  // 💥 peut aussi NPE !
// le ternaire unifie int/Integer → il DÉBALLE maybeNull

for (Integer i = 0; i < 1_000_000; i++) { … }  // alloue !`,
    ops: [
      { eval: 'Integer total = null;', value: 'null', note: 'un OBJET peut être null — ça compile et s\'exécute sans problème' },
      { crash: 'int t = total;', message: 'NullPointerException — l\'UNBOXING déballe null (total.intValue()) : invisible à la lecture' },
      { crash: 'Integer r = test ? 42 : maybeNull;', message: 'NullPointerException — le ternaire unifie int et Integer en DÉBALLANT : si la branche null est choisie, NPE' },
      { eval: 'for (Integer i = 0; i < 1_000_000; i++)', value: '~1 000 000 d\'allocations', note: 'dans une boucle chaude, l\'autoboxing alloue des objets — préférer les primitifs int/long' },
    ],
  },
  {
    id: 'equals-hashcode',
    code: `class Point {
  final int x, y;
  @Override public boolean equals(Object o) { … }
  // ⚠️ equals() redéfini… mais PAS hashCode !
}
var set = new HashSet<Point>();
set.add(p1);             // p1 = new Point(1, 2)
p1.equals(p2)            // true — p2 = new Point(1, 2)
set.contains(p2)         // false 💥 — le contrat est cassé
// fix : hashCode = Objects.hash(x, y) — ou un record !`,
    ops: [
      { eval: 'p1.equals(p2)', value: 'true', note: 'equals redéfini : mêmes coordonnées' },
      { eval: 'set.contains(p2)', value: 'false', note: '💥 le HashSet cherche dans le SEAU de hashCode(p2) — qui diffère de celui de p1 (hashCode hérité d\'Object) : introuvable' },
      { eval: 'set.contains(p2)  // avec hashCode = Objects.hash(x, y)', value: 'true', note: 'LE contrat : equals égaux ⇒ hashCode égaux ; record le génère tout seul' },
      { eval: 'record Point(int x, int y) {}', value: 'equals + hashCode + toString gratuits', note: 'depuis Java 16' },
    ],
  },
];

export const javaBasicsScenarioById = (id) => JAVABASICS_SCENARIOS.find((s) => s.id === id);
