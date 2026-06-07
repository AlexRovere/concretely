/**
 * Rust basics & quirks, as an evaluation trace (shared evaltrace engine):
 *  - ownership: assigning a String MOVES it — the old binding is dead
 *    (E0382 "value borrowed here after move"); Copy types (i32…) are copied;
 *  - the borrow checker: ONE mutable borrow XOR any number of immutable ones —
 *    v.push(4) while &v[0] is alive is E0502 (push may reallocate);
 *  - no null: Option<T> instead — .unwrap() on None panics, prefer unwrap_or/match;
 *  - immutable by default (E0384 "cannot assign twice"), idiomatic shadowing
 *    with `let x = x + 1`, and u8 overflow panics in debug (wraps in release).
 *
 * Every error/crash message mirrors the real rustc / panic output
 * (stable Rust, edition 2021/2024).
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const RUSTBASICS_SCENARIOS = [
  {
    id: 'ownership',
    code: `let s = String::from("salut");
let t = s;            // la String est DÉPLACÉE (move) — pas copiée !
println!("{}", s)     // ❌ erreur de compilation : s n'est plus valide
println!("{}", t)     // ✓ t est le nouveau propriétaire

// Les types Copy (i32, bool, char…) sont copiés, eux :
let a = 5;
let b = a;            // copie — a reste valide
a + b                 // 10 ✓`,
    ops: [
      { eval: 'let s = String::from("salut")', value: '"salut"', note: 's est propriétaire de la String (allouée sur le tas)' },
      { eval: 'let t = s', value: '"salut"', note: 'la String est DÉPLACÉE (move) — s n\'est plus valide, t est le nouveau propriétaire' },
      { error: 'println!("{}", s)', message: 'error[E0382]: borrow of moved value: `s` — value borrowed here after move. s a été déplacée vers t : un seul propriétaire à la fois, pas de double libération possible' },
      { eval: 'println!("{}", t)', value: '"salut"', note: 't fonctionne parfaitement — c\'est lui le propriétaire maintenant' },
      { eval: 'let a = 5; let b = a', value: '5', note: 'i32 implémente Copy : a est copié, pas déplacé — a reste utilisable' },
      { eval: 'a + b', value: '10', note: 'les types Copy comme i32 sont copiés, pas déplacés — pas de move pour les petites valeurs sur la pile' },
    ],
  },
  {
    id: 'borrow',
    code: `let mut v = vec![1, 2, 3];
let premier = &v[0];        // emprunt IMMUABLE de v
v.push(4)                   // ❌ refusé : l'emprunt est encore vivant !
println!("{}", premier);    // (c'est cet usage qui garde l'emprunt en vie)

// ✓ La correction : utiliser l'emprunt AVANT de muter
let premier = v[0];         // ou copier la valeur, ou limiter la portée { … }
v.push(4)                   // ✓ plus aucun emprunt vivant
// Règle d'or : 1 écrivain (&mut) OU N lecteurs (&) — jamais les deux`,
    ops: [
      { eval: 'let mut v = vec![1, 2, 3]', value: '[1, 2, 3]', note: 'mut : on prévoit de modifier v' },
      { eval: 'let premier = &v[0]', value: '&1', note: 'emprunt immuable : premier pointe DANS le buffer de v' },
      { error: 'v.push(4)', message: 'error[E0502]: cannot borrow `v` as mutable because it is also borrowed as immutable. Un emprunt immuable (premier) est encore vivant — push pourrait réallouer le buffer et invalider la référence !' },
      { log: '— la correction : utiliser premier AVANT de muter, ou limiter sa portée avec { … } —' },
      { eval: 'let premier = v[0]', value: '1', note: 'on copie la valeur (i32 est Copy) — plus d\'emprunt vivant sur v' },
      { eval: 'v.push(4)', value: '[1, 2, 3, 4]', note: 'accepté : aucune référence ne peut plus être invalidée' },
      { log: 'Même règle pour 2 &mut à la fois : refusé aussi (E0499). Exactement 1 écrivain OU N lecteurs — jamais les deux en même temps.' },
    ],
  },
  {
    id: 'no-null',
    code: `let n: i32 = null         // ❌ null N'EXISTE PAS en Rust
let rien: Option<i32> = None;   // l'absence est un TYPE : Option<T>
rien.unwrap()             // 💥 panique ! unwrap sur None
rien.unwrap_or(0)         // ✓ 0 — valeur par défaut, pas de panique
// (ou un match : Some(x) => …, None => …)`,
    ops: [
      { error: 'let n: i32 = null', message: 'error[E0425]: cannot find value `null` in this scope — null n\'existe pas en Rust. L\'absence de valeur se dit Option<T>, et le compilateur force à la traiter' },
      { eval: 'let rien: Option<i32> = None', value: 'None', note: 'Option<i32> = Some(valeur) ou None — l\'absence est explicite dans le type' },
      { crash: 'rien.unwrap()', message: "panicked: called `Option::unwrap()` on a `None` value — unwrap parie qu'il y a une valeur ; sur None, c'est la panique (l'équivalent assumé du NullPointerException)" },
      { eval: 'rien.unwrap_or(0)', value: '0', note: 'la voie sûre : valeur par défaut (ou un match Some(x)/None, ou if let) — impossible d\'oublier le cas None' },
    ],
  },
  {
    id: 'mutability',
    code: `let x = 5;
x = 6                 // ❌ immuable PAR DÉFAUT en Rust
let x = x + 1;        // ✓ 6 — SHADOWING : on re-déclare, on ne mute pas
let mut y = 5;
y = 6;                // ✓ mut rend la mutation explicite

let compteur: u8 = 255;     // u8 : max 255
compteur + 1          // 💥 panique en debug : overflow !`,
    ops: [
      { eval: 'let x = 5', value: '5', note: 'sans mut, x est immuable — c\'est le défaut en Rust' },
      { error: 'x = 6', message: 'error[E0384]: cannot assign twice to immutable variable `x` — l\'immuabilité est le défaut ; pour muter, il faut l\'écrire : let mut' },
      { eval: 'let x = x + 1', value: '6', note: 'le SHADOWING est idiomatique — on re-déclare une nouvelle x (le type peut même changer), on ne mute pas' },
      { eval: 'let mut y = 5; y = 6', value: '6', note: 'avec mut, la réassignation est permise — l\'intention de muter est visible dans le code' },
      { eval: 'let compteur: u8 = 255', value: '255', note: 'u8 : entier non signé sur 8 bits — 255 est son maximum' },
      { crash: 'compteur + 1', message: 'panicked: attempt to add with overflow — panique en debug ; en release ça wrappe silencieusement (255 + 1 = 0) — d\'où checked_add / wrapping_add pour choisir explicitement' },
    ],
  },
];

export const rustBasicsScenarioById = (id) => RUSTBASICS_SCENARIOS.find((s) => s.id === id);
