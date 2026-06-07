/**
 * Python basics & quirks, as an evaluation trace (shared evaltrace engine):
 *  - mutable default arguments are evaluated ONCE, at `def` time — the
 *    classic `acc=[]` trap (fix: `acc=None` + rebuild inside the body);
 *  - `is` compares IDENTITY, `==` compares values — CPython interns small
 *    ints (-5..256), so `is` "works" by accident below 257 and breaks above;
 *  - assignment never copies: `b = a` aliases the same list (fix: slice /
 *    list() / copy.deepcopy), and `[[0] * 3] * 2` shares the inner row;
 *  - closures capture the VARIABLE, not the value — lambdas in a loop all
 *    see the final `i` (fix: the `lambda i=i: i` default-argument trick).
 *
 * Behavior matches real CPython 3.12 — the values shown are what the
 * interpreter actually produces.
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const PYBASICS_SCENARIOS = [
  {
    id: 'mutable-default',
    code: `def ajoute(x, acc=[]):   # 😱 [] est évalué UNE fois, au def
    acc.append(x)
    return acc

ajoute(1)   # [1] — ok…
ajoute(2)   # [1, 2] ?! — la même liste survit entre les appels

# ✓ l'idiome correct : défaut None, liste recréée dans le corps
def ajoute_ok(x, acc=None):
    acc = acc if acc is not None else []
    acc.append(x)
    return acc`,
    ops: [
      { eval: 'ajoute(1)', value: '[1]' },
      {
        eval: 'ajoute(2)',
        value: '[1, 2]',
        note: "l'argument par défaut est évalué UNE SEULE fois, à la définition — la liste SURVIT entre les appels",
      },
      { eval: 'ajoute(3)', value: '[1, 2, 3]', note: 'la liste partagée continue de grossir…' },
      {
        eval: 'ajoute_ok(1)',
        value: '[1]',
        note: 'acc=None + « acc = acc if acc is not None else [] » : chaque appel repart de zéro',
      },
      { eval: 'ajoute_ok(2)', value: '[2]', note: 'plus de mémoire entre les appels — c\'est l\'idiome Python' },
    ],
  },
  {
    id: 'is-vs-eq',
    code: `a = b = 256
a == b        # True — mêmes valeurs
a is b        # True… mais pour une mauvaise raison !

a = b = 257   # (a = 257 ; b = 257 sur des lignes séparées)
a == b        # True — toujours mêmes valeurs
a is b        # False ?! — deux objets int distincts

x = None
x is None     # ✓ LE bon usage de is`,
    ops: [
      { eval: 'a == b', value: 'True', note: 'valeurs égales — == compare les VALEURS' },
      {
        eval: 'a is b  # a = b = 256',
        value: 'True',
        note: 'CPython interne les petits entiers (-5 à 256) — même objet',
      },
      {
        eval: 'a is b  # a = b = 257',
        value: 'False',
        note: "au-delà du cache, deux objets distincts — is compare l'IDENTITÉ, jamais les valeurs",
      },
      { eval: 'x is None', value: 'OK', note: 'LE bon usage de is : les singletons None/True/False' },
    ],
  },
  {
    id: 'aliasing',
    code: `a = [1, 2, 3]
b = a            # ⚠️ pas une copie — un ALIAS
b.append(99)
a                # [1, 2, 3, 99] — a a "changé" aussi !

# ✓ les vraies copies
b = a[:]                         # slice = copie superficielle
b = list(a)                      # idem
import copy; copy.deepcopy(a)    # copie profonde (imbriqué)

# le piège des listes imbriquées
grille = [[0] * 3] * 2   # 2 fois la MÊME ligne !
grille[0][0] = 9          # modifie… les deux lignes 😱`,
    ops: [
      { eval: 'b = a', value: '[1, 2, 3]', note: 'aucune copie — b et a pointent sur le même objet' },
      { eval: 'b.append(99)', value: '[1, 2, 3, 99]' },
      { eval: 'a', value: '[1, 2, 3, 99]', note: 'b = a ne copie RIEN — deux noms pour le même objet' },
      {
        eval: 'b = a[:]',
        value: '[1, 2, 3, 99]',
        note: 'slice = copie superficielle ; deepcopy pour les structures imbriquées',
      },
      { eval: 'b.append(7); a', value: '[1, 2, 3, 99]', note: 'la copie est indépendante — a ne bouge plus' },
      { eval: 'b = list(a)', value: '[1, 2, 3, 99]', note: 'équivalent à a[:] — copie superficielle aussi' },
      { eval: 'copy.deepcopy(a)', value: '[1, 2, 3, 99]', note: 'copie récursive : sûre même avec des listes imbriquées' },
      { eval: '[[0] * 3] * 2', value: '[[0, 0, 0], [0, 0, 0]]', note: '⚠️ le * 2 duplique la RÉFÉRENCE à la même ligne' },
      {
        eval: 'grille[0][0] = 9',
        value: '[[9, 0, 0], [9, 0, 0]]',
        note: 'modifier une « ligne » modifie les deux — utilise [[0] * 3 for _ in range(2)]',
      },
    ],
  },
  {
    id: 'late-binding',
    code: `fonctions = [lambda: i for i in range(3)]
[f() for f in fonctions]   # [2, 2, 2] ?! — pas [0, 1, 2]

# ✓ le correctif : figer i via un argument par défaut
fonctions = [lambda i=i: i for i in range(3)]
[f() for f in fonctions]   # [0, 1, 2]
# même mécanisme que acc=[] : évaluation à la définition`,
    ops: [
      {
        eval: '[f() for f in fonctions]',
        value: '[2, 2, 2]',
        note: 'la closure capture la VARIABLE i, pas sa valeur — toutes voient le i final',
      },
      {
        eval: '[f() for f in [lambda i=i: i for i in range(3)]]',
        value: '[0, 1, 2]',
        note: "l'argument par défaut fige la valeur au moment de la définition",
      },
      {
        log: "même mécanisme que le piège acc=[] (mutable-default) : ce qui est dans la signature est évalué à la DÉFINITION, pas à l'appel",
      },
    ],
  },
];

export const pyBasicsScenarioById = (id) => PYBASICS_SCENARIOS.find((s) => s.id === id);
