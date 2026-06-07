/**
 * Go basics & quirks, as an evaluation trace (shared evaltrace engine):
 *  - zero values: no undefined/null limbo — "" for string, 0 for int… but the
 *    zero value of a map is nil: readable (returns zero values), WRITING panics;
 *  - slices are views over a backing array: re-slicing does NOT copy, and
 *    append within capacity writes into the shared array (aliasing gotcha),
 *    while append beyond capacity reallocates and decouples the slices;
 *  - the compiler is strict: an unused variable or import is a COMPILE error
 *    (not a warning), and there is zero truthiness — `if` wants a real bool;
 *  - `:=` in an inner block silently shadows an outer variable (legal, classic
 *    bug source);
 *  - defer pushes calls on a stack run LIFO at function exit — and the
 *    deferred call's ARGUMENTS are evaluated immediately, not at exit.
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const GOBASICS_SCENARIOS = [
  {
    id: 'zero-values',
    code: `var s string            // "" — pas de undefined : chaque type a sa zero value
var n int               // 0
var m map[string]int    // nil 😱 — la zero value d'une map est nil

m["go"]                 // 0 — LIRE une map nil est permis (zero value)
m["go"] = 1             // 💥 panic — ÉCRIRE dans une map nil plante
// → il faut l'initialiser : m := make(map[string]int)`,
    ops: [
      { eval: 'var s string', value: '""', note: 'pas de undefined/null — chaque type a sa zero value' },
      { eval: 'var n int', value: '0' },
      { eval: 'var m map[string]int', value: 'nil', note: 'la zero value d\'une map est nil — lisible mais pas écrivable' },
      { eval: 'm["go"]', value: '0', note: 'lire une map nil renvoie la zero value !' },
      { crash: 'm["go"] = 1', message: 'panic: assignment to entry in nil map — il faut make(map[string]int)' },
    ],
  },
  {
    id: 'slices',
    code: `a := []int{1, 2, 3}   // len 3, cap 3
b := a[:2]            // [1 2] — VUE sur le même tableau, PAS une copie
b[0] = 99             // …donc a[0] devient 99 aussi 😱

b = append(b, 100)    // len(b) 2 < cap(b) 3 → écrit DANS le tableau partagé
// a vaut maintenant [99 2 100] — le 3 a été écrasé !

b = append(b, 7)      // cap dépassée → RÉALLOCATION : b devient indépendant
b[0] = -1             // a[0] reste 99 — le lien est rompu`,
    ops: [
      { eval: 'a := []int{1, 2, 3}', value: '[1 2 3]' },
      { eval: 'b := a[:2]', value: '[1 2]', note: 'même backing array — b n\'est PAS une copie' },
      { eval: 'len(b), cap(b)', value: '2, 3', note: 'la capacité va jusqu\'au bout du tableau de a' },
      { eval: 'b[0] = 99', value: '[99 2]' },
      { eval: 'a[0]', value: '99', note: 'a et b partagent la mémoire — modifier l\'un modifie l\'autre' },
      { eval: 'b = append(b, 100)', value: '[99 2 100]', note: 'len 2 < cap 3 → append écrit dans le tableau PARTAGÉ' },
      { eval: 'a', value: '[99 2 100]', note: 'le 3 de a a été écrasé par l\'append sur b 😱' },
      { eval: 'b = append(b, 7)', value: '[99 2 100 7]', note: 'cap 3 dépassée → Go réalloue un nouveau tableau' },
      { eval: 'b[0] = -1', value: '[-1 2 100 7]' },
      { eval: 'a[0]', value: '99', note: 'après la réallocation, a et b sont indépendants' },
    ],
  },
  {
    id: 'strict',
    code: `import "os"     // ❌ importé mais jamais utilisé → erreur de COMPILATION

x := 42         // ❌ déclaré mais jamais lu → erreur aussi (pas un warning !)

if 1 { }        // ❌ aucune truthiness — la condition DOIT être un bool

n := 1
if true {
    n := 2      // := crée une NOUVELLE variable — masque l'externe (légal !)
    _ = n       // ici n == 2
}
n               // 1 — l'externe n'a jamais bougé (bug classique)`,
    ops: [
      { error: 'import "os"', message: '"os" imported and not used — un import inutilisé est une erreur de COMPILATION' },
      { error: 'x := 42', message: 'declared and not used: x — variable inutilisée = erreur de COMPILATION, pas un warning' },
      { error: 'if 1 { }', message: 'non-boolean condition in if statement — aucune truthiness en Go : la condition doit être un bool' },
      { eval: 'n := 1', value: '1' },
      { eval: 'n := 2  // dans le bloc if', value: '2', note: ':= dans un bloc interne crée une NOUVELLE variable qui masque l\'externe — légal, et source classique de bugs' },
      { eval: 'n  // après le bloc', value: '1', note: 'l\'externe n\'a jamais été modifié — le n interne a disparu avec son bloc' },
    ],
  },
  {
    id: 'defer',
    code: `func main() {
    fmt.Println("ouverture")
    defer fmt.Println("defer A")   // empilé en 1er
    defer fmt.Println("defer B")   // empilé en 2e
    fmt.Println("travail")
}   // ← sortie de fonction : la pile se vide en LIFO → defer B puis defer A`,
    ops: [
      { log: 'ouverture' },
      { eval: 'defer fmt.Println("defer A")', value: 'empilé (1er)', note: 'l\'argument "defer A" est évalué TOUT DE SUITE — seul l\'appel est différé' },
      { eval: 'defer fmt.Println("defer B")', value: 'empilé (2e)', note: 'chaque defer s\'empile au-dessus du précédent' },
      { log: 'travail' },
      { eval: '}  // fin de main', value: 'la pile de defer se vide — LIFO', note: 'dernier empilé, premier exécuté' },
      { log: 'defer B' },
      { log: 'defer A' },
    ],
  },
];

export const goBasicsScenarioById = (id) => GOBASICS_SCENARIOS.find((s) => s.id === id);
