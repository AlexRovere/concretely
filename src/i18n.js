import { SORTS } from './sorting/algorithms.js';
import { PATHFINDERS } from './pathfinding/algorithms.js';

/**
 * Minimal i18n. UI strings live in `UI` (per locale); algorithm display text
 * (name/desc/tips) keeps its English original in the algorithm registries and
 * is overridden per locale in `ALGO`. Code snippets are never translated.
 */

export const LOCALES = [
  { id: 'fr', name: 'Français' },
  { id: 'en', name: 'English' },
];

let locale = 'fr';
const listeners = [];

export const getLocale = () => locale;
export function onLocaleChange(fn) { listeners.push(fn); }
export function setLocale(l) { locale = l; for (const fn of listeners) fn(); }

const UI = {
  en: {
    'tabs.sorting': 'Sorting',
    'tabs.pathfinding': 'Pathfinding',
    'ctrl.algorithm': 'Algorithm',
    'ctrl.input': 'Input',
    'ctrl.size': 'Size',
    'ctrl.speed': 'Speed',
    'btn.shuffle': 'Shuffle',
    'btn.play': 'Play',
    'btn.pause': 'Pause',
    'btn.step': 'Step',
    'btn.reset': 'Reset',
    'btn.maze': 'Random maze',
    'btn.clear': 'Clear',
    'legend.value': 'value',
    'legend.compare': 'compare',
    'legend.swap': 'swap',
    'legend.sorted': 'sorted',
    'legend.start': 'start',
    'legend.end': 'end',
    'legend.wall': 'wall',
    'legend.frontier': 'frontier',
    'legend.visited': 'visited',
    'legend.path': 'path',
    'hint.walls': 'Click & drag on the grid to draw or erase walls.',
    'dist.random': 'Random',
    'dist.nearly': 'Nearly sorted',
    'dist.reversed': 'Reversed',
    'dist.few': 'Few unique',
    'dist.sorted': 'Sorted',
    'cx.label.best': 'Best', 'cx.label.avg': 'Avg', 'cx.label.worst': 'Worst', 'cx.label.time': 'Time', 'cx.label.space': 'Space',
    'cx.title.best': 'Best case (fastest input)',
    'cx.title.avg': 'Average / typical case',
    'cx.title.worst': 'Worst case (upper bound)',
    'cx.title.time': 'Time complexity',
    'cx.title.space': 'Extra memory used',
    'cx.legend': 'Ω lower bound (best) · Θ tight bound (typical) · O upper bound (worst) · n = input size',
    'cx.whenToUse': '💡 When to use:',
    'cx.capped': (n) => `⚠ Capped to ${n} elements in this visualizer so it can't hang.`,
    'status.steps': 'steps',
    'status.done': 'done',
    'path.none': 'no path',
    'path.cells': (n) => `path: ${n} cells`,
    'size.capped': (n, cap) => `${n} (capped: ${cap})`,
    'metrics.sort': (m) => `comparisons ${m.compares.toLocaleString()} · swaps ${m.swaps.toLocaleString()} · writes ${m.writes.toLocaleString()}`,
    'metrics.path': (m) => `visited ${m.visits.toLocaleString()} · frontier pushes ${m.frontier.toLocaleString()}` + (m.pathLength ? ` · path ${m.pathLength} cells` : ''),
    'tabs.bigo': 'Big-O',
    'tabs.recursion': 'Recursion',
    'bigo.curves': 'Curves',
    'bigo.note': 'Same input size, wildly different work — that is why the complexity class matters.',
    'bigo.opsHeader': (n) => `Operations at n = ${n}`,
    'rec.variant': 'Variant',
    'rec.naive': 'Naive (no cache)',
    'rec.memo': 'Memoized',
    'rec.calls': 'calls',
    'rec.callstack': 'Call stack',
    'rec.note.naive': 'Naive fib recomputes the same values over and over — calls grow like 2ⁿ.',
    'rec.note.memo': 'Memoization caches each fib(k) once — calls grow linearly with n.',
    'tabs.eventloop': 'Event loop',
    'el.scenario': 'Scenario',
    'el.callstack': 'Call stack',
    'el.microtasks': 'Microtask queue',
    'el.macrotasks': 'Macrotask queue',
    'el.console': 'Console',
    'el.note': 'Sync runs first, then all microtasks (Promises), then one macrotask (setTimeout) — repeat.',
    'el.phase.script': 'running script',
    'el.phase.microtasks': 'draining microtasks',
    'el.phase.macrotask': 'next macrotask',
    'tabs.datastructures': 'Data structures',
    'ds.structure': 'Structure',
    'ds.stack': 'Stack', 'ds.queue': 'Queue', 'ds.hashmap': 'Hash map',
    'ds.value': 'Value', 'ds.key': 'Key',
    'ds.push': 'Push', 'ds.pop': 'Pop', 'ds.enqueue': 'Enqueue', 'ds.dequeue': 'Dequeue', 'ds.set': 'Set', 'ds.clear': 'Clear',
    'ds.empty': '(empty)',
    'ds.bucket': 'bucket',
    'ds.collision': 'collision (chained)',
    'ds.resized': (n) => `resized → ${n} buckets`,
    'ds.load': (lf) => `load factor ${lf}`,
    'ds.note': 'A hash map turns a key into a bucket index; collisions chain in the same bucket, and it grows when too full — that is the O(1) average.',
    'tabs.valueref': 'Value vs reference',
    'vr.scenario': 'Scenario',
    'vr.variables': 'Variables',
    'vr.heap': 'Heap (objects)',
    'vr.note': 'Primitives copy the value; objects copy the reference — so mutating through one variable changes every variable pointing to the same object.',
    'tabs.swift': 'Swift / Combine',
    'sw.scenario': 'Scenario',
    'sw.received': 'Received',
    'sw.note': 'Combine sends one value at a time down the operator chain; filtered values never reach the sink.',
    'tabs.bst': 'Binary tree',
    'tabs.dp': 'Dynamic programming',
    'tabs.regex': 'Regex / automaton',
    'bst.operation': 'Operation',
    'bst.in': 'In-order',
    'bst.pre': 'Pre-order',
    'bst.post': 'Post-order',
    'bst.search-hit': 'Search 65 (hit)',
    'bst.search-miss': 'Search 55 (miss)',
    'bst.output': 'Output',
    'bst.found': (v) => `${v} found`,
    'bst.notfound': (v) => `${v} not found`,
    'bst.note': 'A BST keeps left < node < right, so an in-order walk yields sorted values and search follows a single path down — O(log n) when balanced.',
    'dp.scenario': 'Words',
    'dp.distance': (n) => `Edit distance: ${n}`,
    'dp.legend': '↖ substitute / match · ↑ delete · ← insert',
    'dp.note': 'Each cell is the cheapest number of edits to turn one prefix into the other, reusing the diagonal (match/substitute), up (delete) and left (insert) — that reuse of sub-results is dynamic programming.',
    'regex.pattern': 'Pattern',
    'regex.input': 'Input',
    'regex.accepted': 'accepted ✓',
    'regex.rejected': 'rejected ✗',
    'regex.note': 'A regex compiles to a finite automaton: each input character moves it between states; the string matches if it ends on an accepting state.',
    'guide.sort.summary': 'How do I choose a sorting algorithm?',
    'guide.path.summary': 'How do I choose a pathfinding algorithm?',
    'guide.sort.html': `<ul>
      <li><b>Just use your language's built-in sort</b> — it's a tuned hybrid (Timsort / introsort). Hand-roll only to learn or under special constraints.</li>
      <li><b>Need stability</b> (keep equal items' order) or guaranteed n log n? → Merge sort / Timsort.</li>
      <li><b>General in-memory array, speed first?</b> → Quick sort with a randomized/median pivot.</li>
      <li><b>Tiny or nearly-sorted input?</b> → Insertion sort (often the fastest there).</li>
      <li><b>Writes are expensive</b> (e.g. flash)? → Selection sort minimises swaps.</li>
      <li><b>Data bigger than RAM?</b> → External merge sort.</li>
      <li>Rule of thumb: pick by <i>worst case</i> and <i>stability/memory</i> needs, not by average case alone.</li>
    </ul>`,
    'guide.path.html': `<ul>
      <li><b>All moves cost the same?</b> → BFS. Simplest correct shortest path on an unweighted grid.</li>
      <li><b>Different non-negative costs</b> (terrain, tolls)? → Dijkstra.</li>
      <li><b>Can you estimate distance to the goal?</b> → A* with an admissible heuristic — same result as Dijkstra but far fewer cells explored.</li>
      <li><b>Negative edge costs?</b> → neither; use Bellman-Ford.</li>
      <li>A* with a zero heuristic <i>is</i> Dijkstra; Dijkstra on equal weights behaves like BFS — they're a family.</li>
    </ul>`,
  },
  fr: {
    'tabs.sorting': 'Tri',
    'tabs.pathfinding': 'Chemins',
    'ctrl.algorithm': 'Algorithme',
    'ctrl.input': 'Entrée',
    'ctrl.size': 'Taille',
    'ctrl.speed': 'Vitesse',
    'btn.shuffle': 'Mélanger',
    'btn.play': 'Lecture',
    'btn.pause': 'Pause',
    'btn.step': 'Pas à pas',
    'btn.reset': 'Réinitialiser',
    'btn.maze': 'Labyrinthe',
    'btn.clear': 'Effacer',
    'legend.value': 'valeur',
    'legend.compare': 'comparaison',
    'legend.swap': 'échange',
    'legend.sorted': 'trié',
    'legend.start': 'départ',
    'legend.end': 'arrivée',
    'legend.wall': 'mur',
    'legend.frontier': 'frontière',
    'legend.visited': 'visité',
    'legend.path': 'chemin',
    'hint.walls': 'Clique-glisse sur la grille pour dessiner ou effacer des murs.',
    'dist.random': 'Aléatoire',
    'dist.nearly': 'Presque trié',
    'dist.reversed': 'Inversé',
    'dist.few': 'Peu de valeurs',
    'dist.sorted': 'Trié',
    'cx.label.best': 'Meilleur', 'cx.label.avg': 'Moyen', 'cx.label.worst': 'Pire', 'cx.label.time': 'Temps', 'cx.label.space': 'Mémoire',
    'cx.title.best': 'Meilleur cas (entrée la plus favorable)',
    'cx.title.avg': 'Cas moyen / typique',
    'cx.title.worst': 'Pire cas (borne supérieure)',
    'cx.title.time': 'Complexité en temps',
    'cx.title.space': 'Mémoire supplémentaire utilisée',
    'cx.legend': 'Ω borne inférieure (meilleur) · Θ borne serrée (typique) · O borne supérieure (pire) · n = taille de l\'entrée',
    'cx.whenToUse': '💡 Quand l\'utiliser :',
    'cx.capped': (n) => `⚠ Limité à ${n} éléments dans ce visualiseur pour éviter tout blocage.`,
    'status.steps': 'étapes',
    'status.done': 'terminé',
    'path.none': 'aucun chemin',
    'path.cells': (n) => `chemin : ${n} cases`,
    'size.capped': (n, cap) => `${n} (limité : ${cap})`,
    'metrics.sort': (m) => `comparaisons ${m.compares.toLocaleString('fr-FR')} · échanges ${m.swaps.toLocaleString('fr-FR')} · écritures ${m.writes.toLocaleString('fr-FR')}`,
    'metrics.path': (m) => `visités ${m.visits.toLocaleString('fr-FR')} · ajouts frontière ${m.frontier.toLocaleString('fr-FR')}` + (m.pathLength ? ` · chemin ${m.pathLength} cases` : ''),
    'tabs.bigo': 'Big-O',
    'tabs.recursion': 'Récursion',
    'bigo.curves': 'Courbes',
    'bigo.note': 'Même taille d\'entrée, charge de travail radicalement différente — voilà pourquoi la classe de complexité compte.',
    'bigo.opsHeader': (n) => `Opérations à n = ${n}`,
    'rec.variant': 'Variante',
    'rec.naive': 'Naïf (sans cache)',
    'rec.memo': 'Mémoïsé',
    'rec.calls': 'appels',
    'rec.callstack': 'Pile d\'appels',
    'rec.note.naive': 'Le fib naïf recalcule sans cesse les mêmes valeurs — les appels croissent en 2ⁿ.',
    'rec.note.memo': 'La mémoïsation met chaque fib(k) en cache une fois — les appels croissent linéairement avec n.',
    'tabs.eventloop': 'Event loop',
    'el.scenario': 'Scénario',
    'el.callstack': 'Pile d\'appels',
    'el.microtasks': 'File microtâches',
    'el.macrotasks': 'File macrotâches',
    'el.console': 'Console',
    'el.note': 'Le synchrone d\'abord, puis toutes les microtâches (Promesses), puis une macrotâche (setTimeout) — on répète.',
    'el.phase.script': 'exécution du script',
    'el.phase.microtasks': 'vidage des microtâches',
    'el.phase.macrotask': 'macrotâche suivante',
    'tabs.datastructures': 'Structures',
    'ds.structure': 'Structure',
    'ds.stack': 'Pile', 'ds.queue': 'File', 'ds.hashmap': 'Table de hachage',
    'ds.value': 'Valeur', 'ds.key': 'Clé',
    'ds.push': 'Empiler', 'ds.pop': 'Dépiler', 'ds.enqueue': 'Enfiler', 'ds.dequeue': 'Défiler', 'ds.set': 'Ajouter', 'ds.clear': 'Vider',
    'ds.empty': '(vide)',
    'ds.bucket': 'bucket',
    'ds.collision': 'collision (chaînée)',
    'ds.resized': (n) => `redimensionné → ${n} buckets`,
    'ds.load': (lf) => `facteur de charge ${lf}`,
    'ds.note': 'Une table de hachage transforme une clé en index de bucket ; les collisions se chaînent dans le même bucket, et elle grandit quand elle est trop pleine — d\'où le O(1) amorti.',
    'tabs.valueref': 'Valeur vs référence',
    'vr.scenario': 'Scénario',
    'vr.variables': 'Variables',
    'vr.heap': 'Tas (objets)',
    'vr.note': 'Les primitives copient la valeur ; les objets copient la référence — muter via une variable change toutes les variables qui pointent vers le même objet.',
    'tabs.swift': 'Swift / Combine',
    'sw.scenario': 'Scénario',
    'sw.received': 'Reçu',
    'sw.note': 'Combine envoie une valeur à la fois dans la chaîne d\'opérateurs ; les valeurs filtrées n\'atteignent jamais le sink.',
    'tabs.bst': 'Arbre binaire',
    'tabs.dp': 'Prog. dynamique',
    'tabs.regex': 'Regex / automate',
    'bst.operation': 'Opération',
    'bst.in': 'Infixe (in-order)',
    'bst.pre': 'Préfixe (pre-order)',
    'bst.post': 'Suffixe (post-order)',
    'bst.search-hit': 'Rechercher 65 (présent)',
    'bst.search-miss': 'Rechercher 55 (absent)',
    'bst.output': 'Sortie',
    'bst.found': (v) => `${v} trouvé`,
    'bst.notfound': (v) => `${v} introuvable`,
    'bst.note': `Un ABR garde gauche < nœud < droite : un parcours infixe donne les valeurs triées, et la recherche suit un seul chemin vers le bas — O(log n) s'il est équilibré.`,
    'dp.scenario': 'Mots',
    'dp.distance': (n) => `Distance d'édition : ${n}`,
    'dp.legend': '↖ substitution / match · ↑ suppression · ← insertion',
    'dp.note': `Chaque case est le nombre minimal d'éditions pour transformer un préfixe en l'autre, en réutilisant la diagonale (match/substitution), le haut (suppression) et la gauche (insertion) — cette réutilisation des sous-résultats, c'est la programmation dynamique.`,
    'regex.pattern': 'Motif',
    'regex.input': 'Entrée',
    'regex.accepted': 'accepté ✓',
    'regex.rejected': 'rejeté ✗',
    'regex.note': `Une regex se compile en automate fini : chaque caractère fait passer d'un état à un autre ; la chaîne correspond si l'on termine sur un état acceptant.`,
    'guide.sort.summary': 'Comment choisir un algorithme de tri ?',
    'guide.path.summary': 'Comment choisir un algorithme de recherche de chemin ?',
    'guide.sort.html': `<ul>
      <li><b>Utilise le tri intégré de ton langage</b> — c'est un hybride optimisé (Timsort / introsort). Ne le réécris que pour apprendre ou sous contrainte particulière.</li>
      <li><b>Besoin de stabilité</b> (garder l'ordre des éléments égaux) ou d'un n log n garanti ? → Tri fusion / Timsort.</li>
      <li><b>Tableau en mémoire, priorité à la vitesse ?</b> → Tri rapide avec pivot aléatoire/médian.</li>
      <li><b>Entrée petite ou presque triée ?</b> → Tri par insertion (souvent le plus rapide là).</li>
      <li><b>Les écritures coûtent cher</b> (ex. flash) ? → Tri par sélection (minimise les échanges).</li>
      <li><b>Données plus grandes que la RAM ?</b> → Tri fusion externe.</li>
      <li>Règle générale : choisis selon le <i>pire cas</i> et les besoins de <i>stabilité/mémoire</i>, pas seulement le cas moyen.</li>
    </ul>`,
    'guide.path.html': `<ul>
      <li><b>Tous les déplacements coûtent pareil ?</b> → BFS. Le plus court chemin correct le plus simple sur une grille non pondérée.</li>
      <li><b>Coûts positifs différents</b> (terrain, péages) ? → Dijkstra.</li>
      <li><b>Tu peux estimer la distance au but ?</b> → A* avec une heuristique admissible — même résultat que Dijkstra mais bien moins de cases explorées.</li>
      <li><b>Coûts d'arête négatifs ?</b> → ni l'un ni l'autre ; utilise Bellman-Ford.</li>
      <li>A* avec une heuristique nulle <i>est</i> Dijkstra ; Dijkstra à poids égaux se comporte comme BFS — c'est une famille.</li>
    </ul>`,
  },
};

/** Exposed for tests: the raw string tables. */
export const STRINGS = UI;

/** Translate a UI key. If the value is a function, returns it (call with args). */
export function t(key) {
  const v = UI[locale]?.[key];
  return v !== undefined ? v : (UI.en[key] !== undefined ? UI.en[key] : key);
}

/** French overrides for algorithm display text. English comes from the registries. */
const ALGO = {
  fr: {
    bubble: { name: 'Tri à bulles', desc: 'Échange répétitivement les paires adjacentes mal ordonnées, faisant « remonter » le plus grand à la fin à chaque passe. Ω(n) si déjà trié (une passe), mais Θ(n²) en général.', tips: 'À éviter en production. Utile seulement pour apprendre, ou une toute petite liste presque triée (avec sortie anticipée).' },
    insertion: { name: 'Tri par insertion', desc: 'Construit un préfixe trié en insérant chaque élément à sa place. Excellent (quasi linéaire) sur des données presque triées, quadratique sur de l\'aléatoire.', tips: 'Idéal pour les petites entrées (n < ~20) ou presque triées ; stable et en place. Les moteurs réels (Timsort, introsort) l\'utilisent pour les petits sous-tableaux.' },
    selection: { name: 'Tri par sélection', desc: 'Cherche le minimum de la partie non triée et le place ensuite. Fait toujours ~n²/2 comparaisons, même déjà trié — d\'où Ω(n²).', tips: 'Rarement le bon choix. Son seul atout : au plus n échanges, à considérer si écrire coûte bien plus cher que lire (ex. mémoire flash).' },
    quick: { name: 'Tri rapide', desc: 'Partitionne autour d\'un pivot puis récurse sur chaque côté. Habituellement le tri par comparaison le plus rapide (n log n), mais dégénère en O(n²) sur de mauvais pivots.', tips: 'Le défaut pour les tableaux en mémoire. Pivot aléatoire / médiane-de-trois pour éviter le O(n²) ; non stable. Base de qsort / introsort.' },
    merge: { name: 'Tri fusion', desc: 'Divise en deux, trie chaque moitié, puis fusionne. n log n garanti dans tous les cas et stable — mais nécessite O(n) de mémoire en plus.', tips: 'À choisir pour la stabilité ou un n log n garanti, pour les listes chaînées, ou le tri externe (sur disque). Base de Timsort (Python/Java).' },
    gnome: { name: 'Tri du gnome 🐌', desc: 'Inefficace : comme le tri par insertion mais recule d\'un échange à la fois au lieu de décaler. Quadratique, présenté comme « mauvais » exemple.', tips: 'Pédagogique seulement — le tri par insertion fait la même chose en strictement mieux.' },
    pancake: { name: 'Tri crêpe 🥞', desc: 'Inefficace : trie uniquement par « retournements » de préfixe, en ramenant le max à la fin. Contrainte amusante, mais quadratique.', tips: 'Un casse-tête, pas un outil — pertinent seulement quand la seule opération permise est le retournement de préfixe.' },
    stooge: { name: 'Tri stooge 🤪', desc: 'Tristement célèbre : trie récursivement les 2/3 du début, les 2/3 de la fin, puis encore les 2/3 du début. ~O(n^2.71) — pire que n\'importe quel tri quadratique.', tips: 'Ne jamais l\'utiliser. Il montre que « correct » ne veut pas dire « efficace ».' },
    bogo: { name: 'Bogosort 🎲', desc: 'Algorithme blague : mélange tout le tableau au hasard et vérifie s\'il est trié ; recommence. Temps factoriel en moyenne et pire cas qui ne termine jamais — plafonné ici.', tips: 'À ne jamais utiliser, évidemment. La leçon : une idée correcte peut être inutilisablement lente.' },
    bfs: { name: 'BFS (non pondéré)', desc: 'Explore la grille niveau par niveau depuis le départ. Trouve le plus court chemin quand chaque pas coûte pareil (non pondéré). V = cases, E = connexions.', tips: 'Ton défaut quand tous les déplacements coûtent pareil — le plus court chemin correct le plus simple. Ni poids ni heuristique.' },
    dijkstra: { name: 'Dijkstra', desc: 'Étend toujours la case non visitée la plus proche (via un tas min). Trouve le plus court chemin avec des poids positifs ; le facteur log V vient de la file de priorité.', tips: 'À utiliser quand les pas ont des coûts différents (terrain, péages) sans bonne estimation. Pour des poids négatifs, utilise Bellman-Ford.' },
    astar: { name: 'A* (Manhattan)', desc: 'Dijkstra guidé par une heuristique (distance estimée au but), donc explore bien moins de cases tout en trouvant le plus court chemin si l\'heuristique est admissible.', tips: 'Le choix de référence pour cartes et jeux : si tu peux estimer la distance au but, A* bat Dijkstra. Garde l\'heuristique admissible (jamais surestimer) pour l\'optimalité.' },
  },
};

/** Algorithm metadata (gen/complexity/maxN from registry) with localized name/desc/tips. */
export function algoMeta(id) {
  const base = SORTS[id] ?? PATHFINDERS[id];
  const tr = ALGO[locale]?.[id];
  return tr ? { ...base, ...tr } : base;
}
