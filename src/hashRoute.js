/**
 * Router hash maison — helpers PURS (aucune dépendance Vue ni donnée d'app).
 * Le format d'URL est `#/<cat>/<mode>/<item>` :
 *   #/                        → accueil
 *   #/swift                   → catégorie (résolue vers son 1er onglet)
 *   #/swift/arc               → vue précise
 *   #/python/cheatsheet/py-ml-kmeans → vue + item ciblé (deep-link cheatsheet)
 * L'intégration réactive (listeners hashchange, écriture du hash) vit dans le
 * composant ; ici on ne fait que parser, formater et résoudre contre un modèle
 * de navigation fourni par l'appelant.
 */

/** Parse une chaîne de hash en route brute. */
export function parseHash(hash) {
  const clean = String(hash || '').replace(/^#/, '').replace(/^\/+/, '');
  const parts = clean.split('/').filter(Boolean);
  if (!parts.length) return { view: 'home' };
  const [cat, mode, item] = parts;
  if (!mode) return { view: 'panel', cat };
  return item ? { view: 'panel', cat, mode, item } : { view: 'panel', cat, mode };
}

/** Formate une route en hash (`#/…`). */
export function formatRoute(route) {
  if (!route || route.view === 'home') return '#/';
  if (!route.mode) return `#/${route.cat}`;
  return route.item ? `#/${route.cat}/${route.mode}/${route.item}` : `#/${route.cat}/${route.mode}`;
}

/**
 * Résout une route brute contre le modèle de navigation en une route concrète.
 * nav = {
 *   categories : string[],
 *   firstMode(cat) : string | null,          // 1er onglet visible de la catégorie
 *   isValidMode(cat, mode) : boolean,         // onglet visible de la catégorie ?
 * }
 * Toute route invalide retombe sur l'accueil ; une catégorie seule résout vers
 * son premier onglet. Un `item` (deep-link) est conservé tel quel — le panneau
 * ciblé décide quoi en faire (l'item inconnu est simplement ignoré à l'arrivée).
 */
export function resolveRoute(parsed, nav) {
  if (!parsed || parsed.view === 'home') return { view: 'home' };
  const { cat, mode, item } = parsed;
  if (!nav.categories.includes(cat)) return { view: 'home' };
  if (mode && nav.isValidMode(cat, mode)) {
    return item ? { view: 'panel', cat, mode, item } : { view: 'panel', cat, mode };
  }
  const first = nav.firstMode(cat);
  return first ? { view: 'panel', cat, mode: first } : { view: 'home' };
}
