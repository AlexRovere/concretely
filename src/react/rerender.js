/**
 * Propagation des re-renders dans un arbre de composants, et rôle de
 * `React.memo` — « pourquoi tout mon arbre se re-render ? ».
 *
 * Règle React : quand un composant re-render (ex. après un `setState`), il
 * recrée les éléments de ses enfants, donc CHAQUE enfant re-render aussi — en
 * cascade dans tout le sous-arbre. Deux exceptions :
 *   - `React.memo(Composant)` : l'enfant NE re-render PAS si ses props sont
 *     identiques (comparaison superficielle) → tout son sous-arbre est sauté.
 *   - mais si le parent lui passe une NOUVELLE référence à chaque rendu (objet
 *     ou callback recréé inline), la comparaison échoue et `memo` est inutile
 *     → d'où `useMemo` / `useCallback` pour stabiliser les props.
 *
 * Le re-render part du nœud `updateAt` : ses ANCÊTRES ne re-render pas (l'état
 * est local), seul son sous-arbre est concerné.
 *
 * Forme d'un scénario :
 *   { id, code, updateAt:'App',
 *     root:{ id, children:[{ id, memo?, propChanged?, children:[...] }] } }
 *   memo=true + propChanged=false → le nœud (et son sous-arbre) est sauté.
 *
 * Steps :
 *   { type:'update', node }             setState déclenché ici
 *   { type:'render', node }             le composant re-render
 *   { type:'skip', node, reason }       'memo' (frontière) | 'parent-skipped'
 * Le générateur RETOURNE { rendered:[ids], skipped:[ids] }.
 */

function find(node, id) {
  if (node.id === id) return node;
  for (const c of node.children ?? []) {
    const hit = find(c, id);
    if (hit) return hit;
  }
  return null;
}

export function* simulate(scenario) {
  const rendered = [];
  const skipped = [];

  function* skipSubtree(node, reason) {
    skipped.push(node.id);
    yield { type: 'skip', node: node.id, reason };
    for (const c of node.children ?? []) yield* skipSubtree(c, 'parent-skipped');
  }

  function* renderNode(node) {
    rendered.push(node.id);
    yield { type: 'render', node: node.id };
    for (const c of node.children ?? []) {
      if (c.memo && !c.propChanged) yield* skipSubtree(c, 'memo');
      else yield* renderNode(c);
    }
  }

  yield { type: 'update', node: scenario.updateAt };
  const start = find(scenario.root, scenario.updateAt);
  if (start) yield* renderNode(start);

  return { rendered, skipped };
}

/** Run to completion, return { rendered, skipped }. */
export function summaryOf(scenario) {
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

// Arbre commun : App → Toolbar, Content → (Sidebar, Article), StatusBar.
const tree = (contentMemo, contentPropChanged) => ({
  id: 'App',
  children: [
    { id: 'Toolbar' },
    {
      id: 'Content',
      memo: contentMemo,
      propChanged: contentPropChanged,
      children: [{ id: 'Sidebar' }, { id: 'Article' }],
    },
    { id: 'StatusBar' },
  ],
});

export const RERENDER_SCENARIOS = [
  {
    id: 'no-memo',
    updateAt: 'App',
    root: tree(false, false),
    code: `function App() {
  const [n, setN] = useState(0)
  return <><Toolbar/><Content/><StatusBar/></>
}
// setN() re-render App → Toolbar, Content, Sidebar, Article,
// StatusBar re-render tous, même si leurs props n'ont pas bougé.`,
  },
  {
    id: 'memo-blocks',
    updateAt: 'App',
    root: tree(true, false),
    code: `const Content = React.memo(function Content() { /* ... */ })
// App re-render, mais Content reçoit les MÊMES props :
// Content (et Sidebar + Article) sont SAUTÉS. Seuls App,
// Toolbar et StatusBar re-render.`,
  },
  {
    id: 'memo-broken',
    updateAt: 'App',
    root: tree(true, true),
    code: `const Content = React.memo(Content)
function App() {
  const [n, setN] = useState(0)
  // ✗ nouvelle référence à CHAQUE rendu → memo cassé
  return <Content onSave={() => save()} style={{ pad: 8 }} />
}
// Content re-render quand même. Fix : useCallback(onSave) + useMemo(style).`,
  },
];

export const rerenderScenarioById = (id) => RERENDER_SCENARIOS.find((s) => s.id === id);
