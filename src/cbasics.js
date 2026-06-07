/**
 * C basics & quirks, as an evaluation trace (shared evaltrace engine):
 *  - pointers: `&` takes an address, `*` dereferences — NULL deref segfaults,
 *    an UNinitialized pointer is even worse (it points anywhere);
 *  - arrays decay into pointers when passed to a function (sizeof changes!),
 *    `arr[i]` is just `*(arr + i)`, and out-of-bounds is never checked;
 *  - undefined behavior: signed overflow, uninitialized reads — the compiler
 *    optimizes assuming UB never happens (sanitizers are your safety net);
 *  - there is no string type: a char array ending in '\0', strlen counts to
 *    it, strcpy checks nothing, and == compares addresses (use strcmp).
 *
 * Semantics follow C17 on a typical 64-bit platform (int = 4 bytes,
 * pointers = 8 bytes).
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const CBASICS_SCENARIOS = [
  {
    id: 'pointeurs',
    code: `int x = 42;
int *p = &x;     // & prend l'adresse de x, p la stocke
*p               // 42 — * déréférence : "va voir à cette adresse"
*p = 7;          // écrire via le pointeur…
x                // …7 ! c'est la MÊME case mémoire

int *q = NULL;
*q               // 💥 segfault — déréférencer NULL

int *r;          // ⚠️ non initialisé : PIRE que NULL
                 // r pointe n'importe où — ça peut même "marcher"`,
    ops: [
      { eval: 'int x = 42; int *p = &x;', value: 'ok', note: '* déréférence, & prend l\'adresse' },
      { eval: '*p', value: '42', note: 'on lit x à travers son adresse' },
      { eval: '*p = 7; x', value: '7', note: 'modifier via le pointeur modifie x — même case mémoire' },
      { crash: '*q', message: 'segfault — déréférencer NULL est un comportement indéfini, en pratique SIGSEGV' },
      { eval: 'int *r;  // non initialisé', value: 'adresse poubelle', note: 'PIRE que NULL : r pointe n\'importe où — le déréférencer peut même "marcher" en silence' },
    ],
  },
  {
    id: 'array-decay',
    code: `int arr[8];                // 8 int × 4 octets = 32 octets
sizeof(arr)                // 32 — dans main, arr est un VRAI tableau

void f(int arr[]) {        // ⚠️ en réalité le compilateur lit : int *arr
    sizeof(arr)            // 8 ?! — le tableau a DÉCAYÉ en pointeur
}

arr[i]                     // ≡ *(arr + i) — juste de l'arithmétique
arr[8]                     // 💥 hors limites — AUCUNE vérification`,
    ops: [
      { eval: 'sizeof(arr)  // dans main', value: '32', note: '8 × 4 octets — ici arr est encore un VRAI tableau' },
      { eval: 'sizeof(arr)  // dans f()', value: '8', note: 'en paramètre, le tableau DÉCAYE en pointeur — sizeof donne la taille du pointeur, 8 octets en 64 bits' },
      { eval: 'arr[i]', value: '*(arr + i)', note: 'l\'indexation N\'EST QUE de l\'arithmétique de pointeur' },
      { crash: 'arr[8]', message: 'hors limites — AUCUNE vérification, comportement indéfini (peut marcher, peut tout casser)' },
    ],
  },
  {
    id: 'ub',
    code: `#include <limits.h>

INT_MAX + 1            // 💥 overflow SIGNÉ = comportement indéfini
                       // (l'unsigned, lui, wrappe proprement à 0)

int n;                 // jamais initialisée → valeur poubelle
n + 1                  // 💥 lire n est déjà indéfini

// le compilateur optimise en SUPPOSANT qu'il n'y a jamais d'UB :
if (x + 1 < x) { … }   // "impossible" en signé → test SUPPRIMÉ !

// → -fsanitize=address,undefined en debug`,
    ops: [
      { crash: 'INT_MAX + 1', message: 'overflow SIGNÉ = comportement indéfini — le compilateur a le droit de tout supposer ; l\'unsigned, lui, wrappe' },
      { eval: 'int n;', value: '???', note: 'variable non initialisée = valeur poubelle (ce qui traînait dans la mémoire)' },
      { crash: 'n + 1', message: 'lire une variable non initialisée est un comportement indéfini — la valeur poubelle peut changer à chaque exécution' },
      { branch: 'le compilateur optimise en supposant qu\'il n\'y a JAMAIS d\'UB ?', taken: true, then: 'oui — un test if (x + 1 < x) peut être supprimé entièrement' },
      { log: '-fsanitize=address,undefined : tes filets de sécurité en debug' },
    ],
  },
  {
    id: 'strings',
    code: `char s[] = "salut";    // 6 octets : 's' 'a' 'l' 'u' 't' '\\0'
                       // le '\\0' terminal : LA convention des chaînes C
strlen(s)              // 5 — compte les caractères jusqu'au '\\0'

char petit[4];
strcpy(petit, grand)   // 💥 déborde petit — strcpy ne vérifie RIEN

s1 == s2               // ⚠️ compare les ADRESSES, pas le contenu !
strcmp(s1, s2) == 0    // ✓ la vraie comparaison de contenu`,
    ops: [
      { eval: 'char s[] = "salut";', value: '6 octets', note: '5 lettres + le \\0 terminal — LA convention des chaînes C' },
      { crash: 'strcpy(petit, grand)', message: 'déborde le buffer de destination — strcpy ne vérifie RIEN (utiliser strncpy/snprintf)' },
      { eval: 'strlen(s)', value: '5', note: 'compte jusqu\'au \\0 — sans \\0, strlen lit la mémoire jusqu\'à en trouver un…' },
      { eval: 's1 == s2', value: 'compare les ADRESSES, pas le contenu', note: 'pour comparer le contenu : strcmp(s1, s2) == 0' },
    ],
  },
];

export const cBasicsScenarioById = (id) => CBASICS_SCENARIOS.find((s) => s.id === id);
