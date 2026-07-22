/**
 * Cheatsheet Général (algo & structures) — sections triées par pertinence.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'general',
  lang: 'js',
  sections: [
    {
      id: 'bigo',
      title: { fr: 'Big-O', en: 'Big-O' },
      items: [
        {
          id: 'gen-bigo-classes',
          title: { fr: 'Les classes courantes', en: 'Common complexity classes' },
          code: `// Classe      | Exemple typique               | n = 1 000 000
// O(1)        | accès tableau, hashmap        | 1
// O(log n)    | recherche binaire             | ~20
// O(n)        | parcours simple               | 1 000 000
// O(n log n)  | merge sort, quick sort (moy.) | ~20 000 000
// O(n²)       | double boucle, bubble sort    | 10^12 (trop lent)
// O(2^n)      | sous-ensembles, fib naïf      | impraticable dès n≈30
// O(n!)       | permutations brute force      | impraticable dès n≈12`,
          note: {
            fr: `Chaque classe décrit comment le coût grandit avec n, pas le temps absolu. Au-delà de O(n log n), les grandes entrées deviennent vite impraticables.`,
            en: `Each class describes how cost grows with n, not absolute time. Beyond O(n log n), large inputs quickly become impractical.`,
          },
        },
        {
          id: 'gen-bigo-simplify',
          title: { fr: 'Règles de simplification', en: 'Simplification rules' },
          code: `// On garde le terme dominant, on jette les constantes :
// O(3n + 5)        -> O(n)
// O(n² + n log n)  -> O(n²)
// O(2^n + n^100)   -> O(2^n)
// Boucles imbriquées : coûts MULTIPLIÉS
for (let i = 0; i < n; i++)      // O(n)
  for (let j = 0; j < m; j++) {} //   × O(m) = O(n·m)
// Boucles successives : coûts ADDITIONNÉS -> O(n + m)`,
          note: {
            fr: `Big-O décrit le comportement asymptotique : seules la croissance dominante compte, les constantes disparaissent.`,
            en: `Big-O describes asymptotic behavior: only the dominant growth term matters, constants vanish.`,
          },
        },
        {
          id: 'gen-bigo-amortized',
          title: { fr: 'Complexité amortie (push de tableau dynamique)', en: 'Amortized complexity (dynamic array push)' },
          code: `// Un tableau dynamique double sa capacité quand il est plein.
// push : O(1) la plupart du temps, O(n) lors d'un redimensionnement.
// Coût total pour n pushs : n + (1 + 2 + 4 + ... + n) < 3n
// => O(1) AMORTI par push, même si un push isolé peut coûter O(n).
const arr = [];
for (let i = 0; i < 1000; i++) arr.push(i); // O(n) au total`,
          note: {
            fr: `Le coût amorti moyenne les opérations chères et rares sur l'ensemble de la séquence : n pushs coûtent O(n) au total.`,
            en: `Amortized cost averages rare expensive operations over the whole sequence: n pushes cost O(n) in total.`,
          },
        },
        {
          id: 'gen-bigo-time-space',
          title: { fr: 'Temps vs espace', en: 'Time vs space' },
          code: `// Compromis classique : payer de la mémoire pour gagner du temps.
// Doublons dans un tableau :
// v1 — double boucle : O(n²) temps, O(1) espace
// v2 — avec un Set  : O(n) temps, O(n) espace
function aDoublon(arr) {
  const vus = new Set();
  for (const x of arr) {
    if (vus.has(x)) return true; // déjà vu -> doublon
    vus.add(x);
  }
  return false;
}`,
          note: {
            fr: `La complexité spatiale compte la mémoire supplémentaire utilisée. On échange souvent de l'espace (cache, Set, table) contre du temps.`,
            en: `Space complexity counts extra memory used. We often trade space (cache, Set, table) for time.`,
          },
        },
        {
          id: 'gen-bigo-cases',
          title: { fr: 'Meilleur / moyen / pire cas', en: 'Best / average / worst case' },
          code: `// Recherche linéaire de x dans un tableau de taille n :
// Meilleur cas : x en première position        -> O(1)
// Cas moyen    : x au milieu en moyenne        -> O(n)  (n/2 -> O(n))
// Pire cas     : x absent ou en dernier        -> O(n)
// Par convention, "O(...)" sans précision = le PIRE cas.
// Ex : quicksort O(n log n) en moyenne mais O(n²) au pire.`,
          note: {
            fr: `Un même algorithme a plusieurs profils selon l'entrée ; sauf mention contraire, on annonce la garantie du pire cas.`,
            en: `The same algorithm has several profiles depending on the input; unless stated otherwise, the worst-case guarantee is quoted.`,
          },
        },
        {
          id: 'gen-bigo-spot-log',
          title: { fr: 'Reconnaître le O(log n)', en: 'Spotting O(log n)' },
          code: `// log n apparaît dès qu'on DIVISE le problème à chaque étape :
let i = n;
while (i > 1) i = Math.floor(i / 2); // O(log n) itérations
// Exemples : recherche binaire, hauteur d'un arbre équilibré,
// insert/extract dans un heap, exponentiation rapide.
// log2(1 000 000) ≈ 20 — quasi constant en pratique.`,
          note: {
            fr: `Si chaque tour divise la taille restante par un facteur constant, le nombre de tours est logarithmique.`,
            en: `If each step divides the remaining size by a constant factor, the number of steps is logarithmic.`,
          },
        },
      ],
    },
    {
      id: 'structures',
      title: { fr: 'Structures de données', en: 'Data structures' },
      items: [
        {
          id: 'gen-ds-array-vs-list',
          title: { fr: 'Tableau vs liste chaînée', en: 'Array vs linked list' },
          code: `// Opération            | Tableau | Liste chaînée
// Accès par index       | O(1)    | O(n)
// Recherche (non trié)  | O(n)    | O(n)
// Insertion en tête     | O(n)    | O(1)
// Insertion en fin      | O(1)*   | O(1) (avec pointeur queue)
// Insertion au milieu   | O(n)    | O(1) si nœud connu, O(n) sinon
// * amorti (redimensionnement éventuel)`,
          note: {
            fr: `Le tableau gagne sur l'accès direct et la localité mémoire (cache) ; la liste chaînée gagne sur les insertions/suppressions sans décalage.`,
            en: `Arrays win on direct access and cache locality; linked lists win on insertions/deletions without shifting elements.`,
          },
        },
        {
          id: 'gen-ds-stack-queue',
          title: { fr: 'Stack & queue (usages typiques)', en: 'Stack & queue (typical uses)' },
          code: `// Stack (LIFO) : dernier entré, premier sorti
const stack = [];
stack.push(1); stack.pop(); // O(1) chacun
// Usages : pile d'appels, annuler (undo), DFS, parenthèses équilibrées
// Queue (FIFO) : premier entré, premier sorti
// Usages : BFS, files d'attente de tâches, buffers
// Attention : arr.shift() est O(n) — préférer un index de tête
const queue = [1, 2, 3];
let tete = 0;
const suivant = queue[tete++]; // défile en O(1)`,
          note: {
            fr: `La pile sert dès qu'on revient en arrière (appels, DFS, undo) ; la file dès qu'on traite dans l'ordre d'arrivée (BFS, tâches).`,
            en: `Use a stack whenever you backtrack (calls, DFS, undo); a queue whenever you process in arrival order (BFS, tasks).`,
          },
        },
        {
          id: 'gen-ds-hashmap',
          title: { fr: 'Hashmap : O(1) moyen, collisions', en: 'Hashmap: O(1) average, collisions' },
          code: `// hash(clé) -> index de case ("bucket")
// get / set / delete : O(1) en MOYENNE
// Collision : deux clés tombent dans la même case
// -> chaînage (liste par case) ou adressage ouvert (case suivante)
// Pire cas : toutes les clés en collision -> O(n)
const m = new Map();
m.set('a', 1);      // O(1) moyen
m.get('a');         // O(1) moyen
m.has('z');         // O(1) moyen`,
          note: {
            fr: `Une bonne fonction de hachage répartit les clés et garde les opérations en O(1) moyen ; le pire cas théorique reste O(n).`,
            en: `A good hash function spreads keys evenly and keeps operations at O(1) average; the theoretical worst case is still O(n).`,
          },
        },
        {
          id: 'gen-ds-bst',
          title: { fr: 'Arbre binaire de recherche : équilibré vs dégénéré', en: 'Binary search tree: balanced vs degenerate' },
          code: `// Invariant BST : gauche < nœud < droite
// Opération | Équilibré (AVL...) | Dégénéré (insertions triées)
// recherche | O(log n)           | O(n)
// insertion | O(log n)           | O(n)
// suppression| O(log n)          | O(n)
// Dégénéré = l'arbre devient une "liste chaînée" penchée :
// insert(1), insert(2), insert(3)... -> chaque nœud n'a qu'un fils droit
// Parcours infixe (gauche, nœud, droite) -> éléments TRIÉS en O(n)`,
          note: {
            fr: `Les garanties O(log n) supposent un arbre équilibré : des insertions triées dégénèrent un BST naïf en liste, d'où les arbres auto-équilibrés (AVL, rouge-noir).`,
            en: `O(log n) guarantees assume a balanced tree: sorted insertions degenerate a naive BST into a list, hence self-balancing trees (AVL, red-black).`,
          },
        },
        {
          id: 'gen-ds-heap',
          title: { fr: 'Heap / file de priorité', en: 'Heap / priority queue' },
          code: `// Min-heap : chaque parent <= ses enfants (arbre complet, stocké en tableau)
// parent(i) = (i-1) >> 1 ; enfants = 2i+1, 2i+2
// peek (min)        : O(1)
// insert            : O(log n)  (remonte l'élément)
// extractMin        : O(log n)  (descend la racine)
// construction (heapify) : O(n)
// Usages : file de priorité, Dijkstra, top-k, heap sort O(n log n)`,
          note: {
            fr: `Le heap donne l'accès au min (ou max) en O(1) et les mises à jour en O(log n) : idéal quand on extrait toujours l'élément le plus prioritaire.`,
            en: `A heap gives O(1) access to the min (or max) and O(log n) updates: ideal when you always extract the highest-priority element.`,
          },
        },
        {
          id: 'gen-ds-set',
          title: { fr: 'Set : appartenance en O(1)', en: 'Set: O(1) membership' },
          code: `// arr.includes(x) : O(n) — set.has(x) : O(1) moyen
// Dédupliquer un tableau :
const uniques = [...new Set([1, 2, 2, 3])]; // [1, 2, 3] en O(n)
// Intersection de deux tableaux : O(n + m) au lieu de O(n·m)
const dansB = new Set(b);
const commun = a.filter(x => dansB.has(x));`,
          note: {
            fr: `Dès qu'une boucle contient un includes/indexOf, un Set transforme souvent O(n²) en O(n).`,
            en: `Whenever a loop contains includes/indexOf, a Set often turns O(n²) into O(n).`,
          },
        },
        {
          id: 'gen-ds-graph-repr',
          title: { fr: 'Représenter un graphe', en: 'Representing a graph' },
          code: `// Liste d'adjacence (le standard) : O(V + E) espace
const g = new Map([
  ['A', ['B', 'C']], // A -> B, A -> C
  ['B', ['C']],
  ['C', []],
]);
// Matrice d'adjacence : O(V²) espace, arête testée en O(1)
// Liste : itérer les voisins en O(deg) — idéale pour graphes creux
// Matrice : rentable seulement si le graphe est dense ou V petit`,
          note: {
            fr: `La liste d'adjacence est le choix par défaut : la plupart des graphes réels sont creux (E bien plus petit que V²).`,
            en: `The adjacency list is the default choice: most real-world graphs are sparse (E far smaller than V²).`,
          },
        },
        {
          id: 'gen-ds-union-find',
          title: { fr: 'Union-Find (Disjoint Set Union)', en: 'Union-Find (Disjoint Set Union)' },
          code: `class UnionFind {
  #parent;
  constructor(n) { this.#parent = Array.from({ length: n }, (_, i) => i); }
  find(x) { return this.#parent[x] === x ? x : (this.#parent[x] = this.find(this.#parent[x])); }
  union(a, b) {
    const ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;        // déjà connectés -> ajouter cette arête créerait un cycle
    this.#parent[ra] = rb;
    return true;
  }
}
// find/union : O(α(n)) amorti avec compression de chemin — quasi constant`,
          note: {
            fr: `Union-Find teste en quasi-O(1) si deux éléments sont dans la même composante et fusionne des groupes : la structure clé de Kruskal (arbre couvrant minimal), de la détection de cycle et de la connectivité dynamique.`,
            en: `Union-Find tests in near-O(1) whether two elements are in the same component and merges groups: the key structure behind Kruskal's MST, cycle detection, and dynamic connectivity.`,
          },
        },
        {
          id: 'gen-ds-trie',
          title: { fr: 'Trie (arbre préfixe)', en: 'Trie (prefix tree)' },
          code: `class TrieNode {
  enfants = new Map();
  finMot = false;
}
class Trie {
  #racine = new TrieNode();
  insert(mot) {
    let n = this.#racine;
    for (const c of mot) {
      if (!n.enfants.has(c)) n.enfants.set(c, new TrieNode());
      n = n.enfants.get(c);
    }
    n.finMot = true; // O(longueur du mot)
  }
  aPrefixe(prefixe) {
    let n = this.#racine;
    for (const c of prefixe) {
      if (!n.enfants.has(c)) return false;
      n = n.enfants.get(c);
    }
    return true; // O(longueur du préfixe)
  }
}`,
          note: {
            fr: `Un trie partage les préfixes communs entre mots dans un arbre : insertion et recherche de préfixe en O(longueur du mot), indépendamment du nombre de mots stockés — la structure de référence pour l'autocomplétion et les correcteurs orthographiques.`,
            en: `A trie shares common prefixes between words in a tree: insertion and prefix search run in O(word length), independent of how many words are stored — the go-to structure for autocomplete and spell-checkers.`,
          },
        },
      ],
    },
    {
      id: 'sorting',
      title: { fr: 'Tris', en: 'Sorting' },
      items: [
        {
          id: 'gen-sort-table',
          title: { fr: 'Table récap des tris', en: 'Sorting algorithms summary' },
          code: `// Tri       | Meilleur   | Moyen      | Pire       | Stable | En place
// Bubble    | O(n)       | O(n²)      | O(n²)      | oui    | oui
// Insertion | O(n)       | O(n²)      | O(n²)      | oui    | oui
// Merge     | O(n log n) | O(n log n) | O(n log n) | oui    | non (O(n) espace)
// Quick     | O(n log n) | O(n log n) | O(n²)      | non    | oui (pile O(log n) en moyenne, O(n) au pire)
// Stable = conserve l'ordre relatif des éléments égaux`,
          note: {
            fr: `Merge sort garantit n log n et la stabilité au prix de O(n) mémoire ; quicksort est souvent plus rapide en pratique mais instable et O(n²) au pire.`,
            en: `Merge sort guarantees n log n and stability at the cost of O(n) memory; quicksort is often faster in practice but unstable and O(n²) worst case.`,
          },
        },
        {
          id: 'gen-sort-insertion-wins',
          title: { fr: 'Quand insertion sort gagne', en: 'When insertion sort wins' },
          code: `// Insertion sort : O(n²) au pire... mais O(n + inversions) en vrai.
// Gagne quand : n petit (< ~32) ou tableau PRESQUE trié.
function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const x = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > x) a[j + 1] = a[j--]; // décale
    a[j + 1] = x;
  }
  return a; // les libs réelles l'utilisent comme cas de base des tris hybrides
}`,
          note: {
            fr: `Sur un tableau presque trié, peu d'inversions à corriger : insertion sort approche O(n), d'où son usage comme cas de base dans Timsort et les quicksorts hybrides.`,
            en: `On a nearly sorted array there are few inversions to fix: insertion sort approaches O(n), which is why Timsort and hybrid quicksorts use it as a base case.`,
          },
        },
        {
          id: 'gen-sort-quick-worst',
          title: { fr: 'Pourquoi quicksort O(n²) au pire (pivot)', en: 'Why quicksort hits O(n²) (pivot)' },
          code: `// Quicksort : choisir un pivot, partitionner < pivot | > pivot, récurser.
// Bon pivot (médiane) : deux moitiés -> profondeur log n -> O(n log n)
// Mauvais pivot (min ou max) : partitions n-1 / 0
// -> profondeur n -> n + (n-1) + ... + 1 = O(n²)
// Cas piège classique : pivot = premier élément + tableau DÉJÀ trié.
// Parades : pivot aléatoire, médiane de trois, introsort (bascule heap sort)`,
          note: {
            fr: `Le pire cas survient quand le pivot ne coupe presque rien à chaque niveau ; un pivot aléatoire rend ce scénario improbable.`,
            en: `The worst case happens when the pivot barely splits anything at each level; a random pivot makes this scenario unlikely.`,
          },
        },
        {
          id: 'gen-sort-comparison-bound',
          title: { fr: 'Tri par comparaison borné à n log n', en: 'Comparison sort lower bound: n log n' },
          code: `// Un tri par comparaison = arbre de décision binaire.
// n éléments -> n! ordres possibles -> il faut n! feuilles.
// Arbre binaire de hauteur h : au plus 2^h feuilles.
// 2^h >= n!  =>  h >= log2(n!) ≈ n·log2(n)  (Stirling)
// => Ω(n log n) comparaisons au PIRE, pour TOUT tri par comparaison.
// Contourner la borne : ne pas comparer !
// counting sort O(n + k), radix sort O(d·(n + k)) — exploitent la structure des clés`,
          note: {
            fr: `Aucun tri basé uniquement sur des comparaisons ne peut battre n log n au pire ; les tris linéaires (counting, radix) contournent la borne en exploitant la nature des clés.`,
            en: `No comparison-only sort can beat n log n in the worst case; linear sorts (counting, radix) sidestep the bound by exploiting key structure.`,
          },
        },
        {
          id: 'gen-sort-stability',
          title: { fr: 'Stabilité : pourquoi ça compte', en: 'Stability: why it matters' },
          code: `// Stable = deux éléments ÉGAUX gardent leur ordre relatif d'origine.
const gens = [
  { nom: 'Ana', age: 30 }, { nom: 'Bob', age: 25 }, { nom: 'Eva', age: 30 },
];
gens.sort((a, b) => a.age - b.age);
// Stable : Bob, Ana, Eva (Ana reste avant Eva à âge égal)
// Permet le tri MULTI-CRITÈRES : trier par nom PUIS par âge
// -> à âge égal, l'ordre alphabétique du 1er tri est conservé.
// Array.prototype.sort est stable (garanti depuis ES2019).`,
          note: {
            fr: `La stabilité permet d'enchaîner des tris par critères successifs : le critère secondaire survit au tri principal.`,
            en: `Stability lets you chain sorts by successive criteria: the secondary key order survives the primary sort.`,
          },
        },
      ],
    },
    {
      id: 'patterns',
      title: { fr: "Patterns d'algorithmes", en: 'Algorithm patterns' },
      items: [
        {
          id: 'gen-pat-two-pointers',
          title: { fr: 'Two pointers', en: 'Two pointers' },
          code: `// Deux indices qui avancent l'un vers l'autre (tableau trié).
// Ex : existe-t-il une paire de somme = cible ?
function paireSomme(arr, cible) { // arr trié
  let g = 0, d = arr.length - 1;
  while (g < d) {
    const s = arr[g] + arr[d];
    if (s === cible) return [g, d];
    s < cible ? g++ : d--; // somme trop petite -> avancer la gauche
  }
  return null; // O(n) au lieu de O(n²)
}`,
          note: {
            fr: `Sur des données triées, deux pointeurs éliminent la double boucle : chaque pas écarte définitivement une extrémité, d'où O(n).`,
            en: `On sorted data, two pointers replace the nested loop: each step permanently discards one end, giving O(n).`,
          },
        },
        {
          id: 'gen-pat-sliding-window',
          title: { fr: 'Sliding window', en: 'Sliding window' },
          code: `// Fenêtre [g..d] qui glisse : on ajoute à droite, on retire à gauche.
// Ex : somme max d'une sous-suite de k éléments contigus.
function sommeMaxFenetre(arr, k) {
  let somme = 0;
  for (let i = 0; i < k; i++) somme += arr[i]; // fenêtre initiale
  let max = somme;
  for (let d = k; d < arr.length; d++) {
    somme += arr[d] - arr[d - k]; // entre à droite, sort à gauche
    if (somme > max) max = somme;
  }
  return max; // O(n) au lieu de O(n·k)
}`,
          note: {
            fr: `Au lieu de recalculer chaque fenêtre, on met à jour le résultat en ajoutant l'entrant et retirant le sortant : O(n) total.`,
            en: `Instead of recomputing each window, update the result by adding the incoming element and removing the outgoing one: O(n) total.`,
          },
        },
        {
          id: 'gen-binary-search',
          title: { fr: 'Recherche binaire (template)', en: 'Binary search (template)' },
          code: `let lo = 0, hi = arr.length - 1;
while (lo <= hi) {
  const mid = (lo + hi) >> 1;
  if (arr[mid] === cible) return mid;
  arr[mid] < cible ? lo = mid + 1 : hi = mid - 1;
}
return -1; // O(log n) — tableau TRIÉ obligatoire`,
          note: {
            fr: `Divise l'espace de recherche par 2 à chaque tour — exige un tableau trié.`,
            en: `Halves the search space each turn — requires a sorted array.`,
          },
        },
        {
          id: 'gen-pat-bfs-dfs',
          title: { fr: 'BFS (file) vs DFS (pile/récursion)', en: 'BFS (queue) vs DFS (stack/recursion)' },
          code: `// BFS : FILE -> explore par niveaux -> plus court chemin (non pondéré)
function bfs(depart, voisins) {
  const file = [depart], vus = new Set([depart]);
  let t = 0;
  while (t < file.length) {
    const n = file[t++]; // défile
    for (const v of voisins(n))
      if (!vus.has(v)) { vus.add(v); file.push(v); }
  }
}
// DFS : PILE (ou récursion) -> explore en profondeur d'abord
// remplacer la file par stack.pop() -> DFS itératif
// Les deux : O(V + E) temps, O(V) espace — marquer les visités !`,
          note: {
            fr: `BFS trouve le plus court chemin en nombre d'arêtes (exploration par niveaux) ; DFS plonge d'abord, utile pour cycles, composantes et backtracking. Sans ensemble de visités, les deux bouclent.`,
            en: `BFS finds the shortest path in edge count (level-by-level); DFS dives deep first, useful for cycles, components and backtracking. Without a visited set, both loop forever.`,
          },
        },
        {
          id: 'gen-pat-memo',
          title: { fr: 'Memoïsation (fib)', en: 'Memoization (fib)' },
          code: `// fib naïf : O(2^n) — recalcule fib(k) un nombre exponentiel de fois.
// Memoïsation : cacher les résultats déjà calculés.
const memo = new Map();
function fib(n) {
  if (n <= 1) return n;            // cas de base
  if (memo.has(n)) return memo.get(n); // déjà calculé -> O(1)
  const r = fib(n - 1) + fib(n - 2);
  memo.set(n, r);
  return r; // O(n) temps, O(n) espace — au lieu de O(2^n)
}`,
          note: {
            fr: `Chaque sous-problème n'est calculé qu'une fois puis lu dans le cache : l'exponentiel devient linéaire. C'est la programmation dynamique "top-down".`,
            en: `Each subproblem is computed once then read from the cache: exponential becomes linear. This is top-down dynamic programming.`,
          },
        },
        {
          id: 'gen-pat-prefix-sums',
          title: { fr: 'Sommes préfixées', en: 'Prefix sums' },
          code: `// Pré-calculer les sommes cumulées pour répondre en O(1)
// à "somme de arr[i..j]" — au lieu de re-sommer en O(n).
const arr = [3, 1, 4, 1, 5];
const pre = [0];
for (const x of arr) pre.push(pre[pre.length - 1] + x);
// pre = [0, 3, 4, 8, 9, 14]
const sommeIJ = (i, j) => pre[j + 1] - pre[i]; // O(1) par requête
// Construction O(n) une fois, puis chaque requête d'intervalle est O(1).`,
          note: {
            fr: `Un pré-calcul O(n) rend toutes les sommes d'intervalles instantanées : indispensable dès qu'il y a beaucoup de requêtes.`,
            en: `A single O(n) precomputation makes every range sum instant: essential when there are many queries.`,
          },
        },
        {
          id: 'gen-pat-dijkstra',
          title: { fr: 'Dijkstra (plus court chemin pondéré)', en: 'Dijkstra (weighted shortest path)' },
          code: `// Plus court chemin depuis 'depart' dans un graphe à poids POSITIFS
function dijkstra(depart, graphe) { // graphe: Map<noeud, [[voisin, poids], ...]>
  const dist = new Map([[depart, 0]]);
  const aVisiter = [[0, depart]]; // idéalement un vrai tas min, ici simplifié
  const vus = new Set();
  while (aVisiter.length) {
    aVisiter.sort((a, b) => a[0] - b[0]);
    const [d, u] = aVisiter.shift();
    if (vus.has(u)) continue;
    vus.add(u);
    for (const [v, poids] of graphe.get(u) ?? []) {
      const alt = d + poids;
      if (alt < (dist.get(v) ?? Infinity)) { dist.set(v, alt); aVisiter.push([alt, v]); }
    }
  }
  return dist; // O((V + E) log V) avec un vrai heap binaire
}`,
          note: {
            fr: `Comme BFS mais pondéré : à chaque étape, on traite le nœud non visité de plus petite distance connue (d'où le tas min) et on relâche ses arêtes. Ne fonctionne QUE si tous les poids sont positifs (sinon : Bellman-Ford).`,
            en: `Like BFS but weighted: at each step, process the unvisited node with the smallest known distance (hence the min-heap) and relax its edges. Only works if ALL weights are positive (otherwise: Bellman-Ford).`,
          },
        },
        {
          id: 'gen-pat-topo-sort',
          title: { fr: 'Tri topologique (DAG)', en: 'Topological sort (DAG)' },
          code: `// Ordonner un DAG (graphe orienté acyclique) tel que u -> v => u avant v
function triTopologique(noeuds, graphe) { // graphe: Map<noeud, [voisins...]>
  const visites = new Set(), pile = [];
  function dfs(u) {
    visites.add(u);
    for (const v of graphe.get(u) ?? []) if (!visites.has(v)) dfs(v);
    pile.push(u); // empiler APRES avoir visité tous les successeurs
  }
  for (const n of noeuds) if (!visites.has(n)) dfs(n);
  return pile.reverse(); // O(V + E)
}`,
          note: {
            fr: `Un tri topologique n'existe que sur un graphe SANS cycle (DAG) : on empile chaque nœud une fois tous ses successeurs traités, puis on inverse la pile. Base de la résolution de dépendances (build, imports, planification de tâches).`,
            en: `A topological sort only exists on a graph WITHOUT cycles (DAG): push each node once all its successors are processed, then reverse the stack. The basis of dependency resolution (builds, imports, task scheduling).`,
          },
        },
        {
          id: 'gen-pat-dp-tabulation',
          title: { fr: 'Programmation dynamique bottom-up (tabulation)', en: 'Bottom-up dynamic programming (tabulation)' },
          code: `// Programmation dynamique BOTTOM-UP : on remplit une table du plus petit
// sous-problème vers le plus grand, sans récursion ni pile d'appels.
function fibTabulation(n) {
  if (n <= 1) return n;
  const dp = new Array(n + 1);
  dp[0] = 0; dp[1] = 1;
  for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2]; // remplit la table dans l'ordre
  return dp[n]; // O(n) temps, O(n) espace — aucun risque de stack overflow
}`,
          note: {
            fr: `Contrairement à la mémoïsation (top-down, récursive), la tabulation remplit itérativement une table depuis les cas de base : même complexité mais sans risque de dépassement de pile sur n grand, et souvent plus facile à optimiser en espace (ici, garder les 2 dernières valeurs suffirait).`,
            en: `Unlike memoization (top-down, recursive), tabulation iteratively fills a table starting from the base cases: same complexity but no stack-overflow risk on large n, and often easier to optimize for space (here, keeping just the last 2 values would suffice).`,
          },
        },
      ],
    },
    {
      id: 'recursion',
      title: { fr: 'Récursion', en: 'Recursion' },
      items: [
        {
          id: 'gen-rec-anatomy',
          title: { fr: 'Anatomie (cas de base + progression)', en: 'Anatomy (base case + progress)' },
          code: `function factorielle(n) {
  if (n <= 1) return 1;            // 1. CAS DE BASE : arrête la récursion
  return n * factorielle(n - 1);   // 2. PROGRESSION : se rapproche du cas de base
}
// Les deux règles d'or :
// - toujours un cas de base atteignable
// - chaque appel doit RÉDUIRE le problème (sinon récursion infinie)`,
          note: {
            fr: `Une récursion correcte = un cas de base qui termine + des appels qui s'en rapprochent strictement à chaque étape.`,
            en: `A correct recursion = a terminating base case + calls that strictly move toward it at every step.`,
          },
        },
        {
          id: 'gen-rec-callstack',
          title: { fr: "Pile d'appels & stack overflow", en: 'Call stack & stack overflow' },
          code: `// Chaque appel empile un cadre (variables locales, adresse de retour).
// factorielle(4) -> empile f(4), f(3), f(2), f(1) puis dépile en remontant.
// Profondeur = O(n) cadres en mémoire.
function boum(n) { return boum(n + 1); } // s'éloigne du cas de base...
// boum(0) -> RangeError: Maximum call stack size exceeded
// Limite typique JS : ~10 000 à 100 000 cadres selon le moteur.
// Récursion profonde (n grand) -> préférer une version itérative.`,
          note: {
            fr: `La pile d'appels a une taille limitée : une récursion trop profonde (ou sans cas de base) la fait déborder, même si la logique est correcte.`,
            en: `The call stack has a limited size: too-deep recursion (or a missing base case) overflows it, even when the logic is correct.`,
          },
        },
        {
          id: 'gen-rec-to-iter',
          title: { fr: 'Récursion → itération (pile explicite)', en: 'Recursion → iteration (explicit stack)' },
          code: `// Toute récursion peut devenir une boucle + pile explicite.
// Ex : DFS récursif -> DFS itératif
function dfsIteratif(racine) {
  const pile = [racine], vus = new Set();
  while (pile.length) {
    const n = pile.pop();          // remplace le cadre d'appel
    if (vus.has(n)) continue;
    vus.add(n);
    for (const v of n.voisins) pile.push(v);
  }
  return vus; // même ordre "profondeur d'abord", sans risque de stack overflow
}`,
          note: {
            fr: `La pile explicite reproduit la pile d'appels sur le tas : même algorithme, mais la profondeur n'est plus limitée par la pile du moteur.`,
            en: `The explicit stack mirrors the call stack on the heap: same algorithm, but depth is no longer limited by the engine's call stack.`,
          },
        },
        {
          id: 'gen-rec-divide-conquer',
          title: { fr: 'Diviser pour régner (merge sort sketch)', en: 'Divide and conquer (merge sort sketch)' },
          code: `// 1. DIVISER : couper en deux moitiés
// 2. RÉGNER : trier chaque moitié récursivement
// 3. COMBINER : fusionner deux moitiés triées en O(n)
function mergeSort(a) {
  if (a.length <= 1) return a;              // cas de base
  const mid = a.length >> 1;
  return fusion(mergeSort(a.slice(0, mid)), // gauche triée
                mergeSort(a.slice(mid)));   // droite triée
}
// fusion(g, d) : avance deux index, prend le plus petit — O(n)
// log n niveaux × O(n) par niveau = O(n log n)`,
          note: {
            fr: `Diviser pour régner découpe le problème en sous-problèmes indépendants puis combine leurs solutions : profondeur log n × travail linéaire par niveau = O(n log n).`,
            en: `Divide and conquer splits the problem into independent subproblems then combines their solutions: log n depth × linear work per level = O(n log n).`,
          },
        },
        {
          id: 'gen-rec-backtracking',
          title: { fr: 'Backtracking (explorer / annuler)', en: 'Backtracking (explore / undo)' },
          code: `// Essayer un choix, récurser, ANNULER le choix, essayer le suivant.
function permutations(reste, courant = [], res = []) {
  if (reste.length === 0) { res.push([...courant]); return res; } // cas de base
  for (let i = 0; i < reste.length; i++) {
    courant.push(reste[i]);                       // 1. choisir
    const sans = reste.slice(0, i).concat(reste.slice(i + 1));
    permutations(sans, courant, res);             // 2. explorer
    courant.pop();                                // 3. ANNULER (backtrack)
  }
  return res; // O(n · n!) — exponentiel par nature
}`,
          note: {
            fr: `Le backtracking explore l'arbre des choix en profondeur et défait chaque choix en remontant ; on élague les branches invalides au plus tôt pour limiter l'explosion.`,
            en: `Backtracking explores the choice tree depth-first and undoes each choice on the way back; prune invalid branches early to limit the blowup.`,
          },
        },
      ],
    },
    {
      id: 'gen-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'gen-bp-complexity-first',
          title: { fr: 'Estimer la complexité avant de coder', en: 'Estimate complexity before coding' },
          code: `// Avant d'écrire une ligne : quelle est la taille de n en prod ?
// n ~ 100 -> O(n²) ok. n ~ 10^6 -> il faut O(n log n) ou mieux.`,
          note: {
            fr: `Coder d'abord et mesurer ensuite mène souvent à réécrire une solution O(n²) qui explose en prod ; estimer sur papier évite ce coût de réécriture.`,
            en: `Coding first and measuring later often means rewriting an O(n²) solution that blows up in prod; a paper estimate avoids that rewrite cost.`,
          },
        },
        {
          id: 'gen-bp-edge-cases',
          title: { fr: 'Toujours tester les cas limites', en: 'Always test edge cases' },
          code: `// tableau vide, un seul élément, doublons, valeurs négatives, n=0`,
          note: {
            fr: `Les bugs d'algo se cachent presque toujours aux bornes (vide, unique, dupliqué) plutôt que dans le cas général — les tester en premier révèle l'essentiel des erreurs.`,
            en: `Algorithm bugs almost always hide at the boundaries (empty, single, duplicate) rather than in the general case — testing them first catches most errors.`,
          },
        },
        {
          id: 'gen-bp-choose-structure',
          title: { fr: "Choisir la structure selon l'opération dominante", en: 'Pick the structure by dominant operation' },
          code: `// Beaucoup de recherches -> Set/Map. Beaucoup d'insertions triées -> heap.
// Accès aléatoire fréquent -> tableau, pas liste chaînée.`,
          note: {
            fr: `Il n'existe pas de structure universellement optimale : le bon choix dépend de l'opération répétée le plus souvent, pas de l'habitude ou de la familiarité.`,
            en: `No structure is universally optimal: the right choice depends on the operation repeated most often, not habit or familiarity.`,
          },
        },
        {
          id: 'gen-bp-profile-dont-guess',
          title: { fr: "Profiler avant d'optimiser", en: 'Profile before optimizing' },
          code: `console.time('etape'); run(); console.timeEnd('etape');
// ou un vrai profiler (Chrome DevTools, --prof Node)`,
          note: {
            fr: `L'intuition sur le goulot d'étranglement est souvent fausse ; mesurer avant d'optimiser évite de complexifier une partie du code qui n'était pas le problème.`,
            en: `Intuition about the bottleneck is often wrong; measuring before optimizing avoids complicating code that was never the actual problem.`,
          },
        },
        {
          id: 'gen-bp-readable-first',
          title: { fr: "Correct et lisible d'abord, rapide ensuite", en: 'Correct and readable first, fast second' },
          code: `// v1: boucle simple, claire, testée -> v2: optimisée SEULEMENT si mesurée trop lente`,
          note: {
            fr: `"Premature optimization is the root of all evil" (Knuth) : une version lisible qui marche vaut mieux qu'une version rapide et illisible qui cache des bugs.`,
            en: `"Premature optimization is the root of all evil" (Knuth): a readable working version beats a fast, unreadable one that hides bugs.`,
          },
        },
      ],
    },
    {
      id: 'tests',
      title: { fr: 'Tests', en: 'Testing' },
      items: [
        {
          id: 'gen-test-pyramid',
          title: { fr: 'La pyramide des tests', en: 'The testing pyramid' },
          code: `// unitaire   : 1 fonction isolée, aucune I/O   -> ms   (des centaines)
// intégration: modules + DB/API réels          -> 100ms (des dizaines)
// E2E        : navigateur -> vrai backend       -> s    (une poignée)
test('additionne', () => {
  expect(somme(2, 3)).toBe(5)   // unitaire : rapide, déterministe
})`,
          note: {
            fr: `Large base d'unitaires (rapides, isolés), une couche fine d'intégration, très peu d'E2E : les tests hauts coûtent cher et cassent souvent. Réservez l'E2E aux parcours critiques (login, paiement).`,
            en: `A broad base of unit tests (fast, isolated), a thin integration layer, very few E2E: high-level tests are costly and flaky. Reserve E2E for critical journeys (login, checkout).`,
          },
        },
        {
          id: 'gen-test-tdd',
          title: { fr: 'TDD : red / green / refactor', en: 'TDD: red / green / refactor' },
          code: `// 1. RED : écrire un test qui échoue
test('panier vide coûte 0', () => expect(total([])).toBe(0))
// 2. GREEN : le minimum pour passer
function total(items) { return 0 }
// 3. REFACTOR : généraliser sans casser le test
function total(items) { return items.reduce((s, i) => s + i.prix, 0) }`,
          note: {
            fr: `Écrire le test d'abord force à définir le comportement attendu avant l'implémentation, et garantit que chaque ligne de code existe pour une raison testée.`,
            en: `Writing the test first forces you to define expected behavior before implementation, and guarantees every line of code exists for a tested reason.`,
          },
        },
        {
          id: 'gen-test-doubles',
          title: { fr: 'Doubles de test : stub / mock / fake / spy', en: 'Test doubles: stub / mock / fake / spy' },
          code: `// stub : renvoie une valeur figée (contrôle une entrée)
const horloge = { now: () => 1700000000 }
// mock : vérifie une interaction sortante attendue
const mailer = { envoyer: jest.fn() }
service.inscrire(user)
expect(mailer.envoyer).toHaveBeenCalledWith(user.email)
// fake : implémentation légère réelle (ex. DB en mémoire)
// spy  : enveloppe le vrai objet et enregistre les appels`,
          note: {
            fr: `Stub pour contrôler une entrée (temps, réseau), mock pour vérifier une sortie (un mail est-il parti ?), fake pour remplacer une dépendance lourde, spy pour observer sans remplacer.`,
            en: `Stub to control an input (time, network), mock to verify an outgoing interaction (was a mail sent?), fake to replace a heavy dependency, spy to observe without replacing.`,
          },
        },
        {
          id: 'gen-test-aaa-first',
          title: { fr: "Anatomie d'un bon test (AAA + FIRST)", en: 'Anatomy of a good test (AAA + FIRST)' },
          code: `test('retire le montant du solde', () => {
  const c = new Compte(100)      // Arrange
  c.retirer(30)                  // Act
  expect(c.solde).toBe(70)       // Assert
})
// FIRST : Fast, Isolated, Repeatable, Self-validating, Timely`,
          note: {
            fr: `Arrange-Act-Assert rend un test lisible d'un coup d'œil. Un bon test est rapide, isolé (aucun ordre imposé), reproductible (pas de hasard ni d'horloge réelle) et auto-vérifiant.`,
            en: `Arrange-Act-Assert makes a test readable at a glance. A good test is fast, isolated (no required order), repeatable (no randomness or real clock) and self-validating.`,
          },
        },
        {
          id: 'gen-test-behavior',
          title: { fr: "Tester le comportement, pas l'implémentation", en: 'Test behavior, not implementation' },
          code: `// ✗ teste un détail interne : casse au moindre refactor
expect(service._cache.size).toBe(1)
// ✓ teste le comportement observable via l'API publique
const u = await service.getUser(1)
expect(u.nom).toBe('Ada')
expect(await service.getUser(1)).toBe(u)  // mis en cache : même instance`,
          note: {
            fr: `Tester l'API publique (entrées -> sorties) plutôt que les détails internes permet de refactorer librement sans réécrire les tests. Un test qui casse à chaque refacto teste la mauvaise chose.`,
            en: `Testing the public API (inputs -> outputs) rather than internal details lets you refactor freely without rewriting tests. A test that breaks on every refactor is testing the wrong thing.`,
          },
        },
        {
          id: 'gen-test-coverage',
          title: { fr: 'La couverture est un outil, pas un but', en: 'Coverage is a tool, not a goal' },
          code: `// 100% de couverture ne prouve PAS l'absence de bug :
function abs(x) { return x > 0 ? x : x }   // bug ! (devrait être -x)
test('abs', () => expect(abs(5)).toBe(5))  // passe, ligne couverte à 100%
// la ligne s'exécute, mais aucune assertion ne teste le cas négatif`,
          note: {
            fr: `La couverture mesure quelles lignes s'exécutent, pas si elles sont correctement vérifiées. Utile pour repérer le code non testé, trompeuse comme objectif chiffré.`,
            en: `Coverage measures which lines run, not whether they are correctly asserted. Useful to spot untested code, misleading as a numeric target.`,
          },
        },
        {
          id: 'gen-test-parametrized',
          title: { fr: 'Tests paramétrés & property-based', en: 'Parametrized & property-based tests' },
          code: `// paramétré : un cas = une ligne, au lieu de copier-coller
test.each([
  [2, 3, 5], [-1, 1, 0], [0, 0, 0],
])('somme(%i, %i) = %i', (a, b, r) => expect(somme(a, b)).toBe(r))
// property-based : l'outil génère des centaines d'entrées aléatoires
// et cherche un contre-exemple (ex. commutativité : a+b === b+a)`,
          note: {
            fr: `Les tests paramétrés couvrent d'un coup les cas limites (0, négatif, vide). Le property-based va plus loin : il cherche activement un contre-exemple à une propriété censée toujours tenir.`,
            en: `Parametrized tests cover edge cases (0, negative, empty) in one place. Property-based goes further: it actively searches for a counter-example to a property that should always hold.`,
          },
        },
      ],
    },
  ],
};
