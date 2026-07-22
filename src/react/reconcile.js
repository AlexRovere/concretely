/**
 * Reconciliation React sur une liste — pourquoi `key` compte dans `.map()`.
 *
 * React réconcilie les enfants d'un même parent en les comparant DANS L'ORDRE.
 * Sans key stable (ou avec `key={index}`), un élément inséré en tête décale
 * toutes les positions : React compare l'ancien élément i au nouvel élément i,
 * voit un contenu différent et RÉÉCRIT le nœud en place — l'état DOM local
 * (valeur d'un <input>, focus, animation) part avec. Avec une key stable, React
 * apparie les éléments par key : un nœud existant est RÉUTILISÉ (déplacé), jamais
 * reconstruit.
 *
 * Le diff par position (unkeyed) et par key est exactement celui de `vdom.js` :
 * on réutilise son moteur `simulate`/`summaryOf`, ici habillé de code JSX React.
 * `key={index}` se comporte comme l'absence de key sur un préfixe qui change :
 * c'est le piège que ces scénarios illustrent.
 *
 * Forme d'un scénario (compatible `vdom.simulate`) :
 *   { id, code, mode:'unkeyed'|'keyed', old:['B','C'], next:['A','B','C'] }
 * (les items sont des chaînes : la chaîne est À LA FOIS la key et le contenu rendu.)
 */
import { simulate, summaryOf } from '../vdom.js';

export { simulate, summaryOf };

export const REACT_RECONCILE_SCENARIOS = [
  {
    id: 'map-index-key',
    mode: 'unkeyed',
    old: ['B', 'C'],
    next: ['A', 'B', 'C'],
    code: `// key = index : équivaut à PAS de key stable
items.map((t, i) => <Row key={i} label={t} />)
// ['B','C'] devient ['A','B','C'] :
// comparé PAR POSITION → Row0 B→A réécrit, Row1 C→B réécrit,
// Row2 A inséré. 2 réécritures + l'état des <input> se mélange !`,
  },
  {
    id: 'map-stable-key',
    mode: 'keyed',
    old: ['B', 'C'],
    next: ['A', 'B', 'C'],
    code: `// key = id stable : React apparie par key
items.map((t) => <Row key={t.id} label={t.label} />)
// B et C sont RÉUTILISÉS (déplacés), seul A est créé.
// 1 insertion, aucun nœud réécrit, l'état local est préservé.`,
  },
  {
    id: 'reorder-index',
    mode: 'unkeyed',
    old: ['A', 'B', 'C', 'D'],
    next: ['D', 'A', 'B', 'C'],
    code: `// Rotation avec key={index} : chaque position change de contenu
// → 4 nœuds réécrits (tout l'état DOM local est perdu).`,
  },
  {
    id: 'reorder-key',
    mode: 'keyed',
    old: ['A', 'B', 'C', 'D'],
    next: ['D', 'A', 'B', 'C'],
    code: `// Rotation avec key stable : les nœuds sont déplacés, jamais réécrits.`,
  },
];

export const reactReconcileScenarioById = (id) =>
  REACT_RECONCILE_SCENARIOS.find((s) => s.id === id);
