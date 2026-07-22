/**
 * Cheatsheet React (18+, hooks) — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'react',
  lang: 'js',
  sections: [
    {
      id: 'hooks',
      title: { fr: 'Hooks fondamentaux', en: 'Core hooks' },
      items: [
        {
          id: 'react-usestate',
          title: { fr: 'useState (+ updater)', en: 'useState (+ updater)' },
          code: `const [count, setCount] = useState(0)
setCount(count + 1)          // basé sur la valeur du rendu (peut être obsolète)
setCount(c => c + 1)         // forme updater : basée sur l'état à jour
const [user, setUser] = useState(() => lourdInit())  // init paresseuse`,
          note: {
            fr: `Utilisez la forme updater (c => …) dès que la nouvelle valeur dépend de l'ancienne, surtout dans un handler qui appelle setState plusieurs fois.`,
            en: `Use the updater form (c => …) whenever the new value depends on the old one, especially in a handler calling setState several times.`,
          },
        },
        {
          id: 'react-useeffect',
          title: { fr: 'useEffect + cleanup', en: 'useEffect + cleanup' },
          code: `useEffect(() => {
  const sub = source.subscribe(handler)
  return () => sub.unsubscribe()   // cleanup : avant rejeu ET au démontage
}, [source])                       // se rejoue quand source change`,
          note: {
            fr: `Le tableau de deps contrôle le rejeu : [] = une fois, [x] = quand x change, absent = à chaque rendu. Toujours nettoyer abonnements/timers.`,
            en: `The deps array controls re-runs: [] = once, [x] = when x changes, absent = every render. Always clean up subscriptions/timers.`,
          },
        },
        {
          id: 'react-useref',
          title: { fr: 'useRef (valeur mutable / DOM)', en: 'useRef (mutable value / DOM)' },
          code: `const inputRef = useRef(null)     // <input ref={inputRef} />
inputRef.current.focus()          // accès à l'élément DOM
const renders = useRef(0)         // valeur persistante SANS re-render
renders.current++                 // muter .current ne re-render pas`,
          note: {
            fr: `useRef garde une valeur entre les rendus sans en déclencher : idéal pour un nœud DOM, un id de timer, ou la valeur précédente d'une prop.`,
            en: `useRef keeps a value across renders without triggering one: ideal for a DOM node, a timer id, or a prop's previous value.`,
          },
        },
        {
          id: 'react-usereducer',
          title: { fr: 'useReducer (état complexe)', en: 'useReducer (complex state)' },
          code: `const [state, dispatch] = useReducer(reducer, { count: 0 })
function reducer(s, action) {
  switch (action.type) {
    case 'inc': return { count: s.count + 1 }
    default: return s
  }
}
dispatch({ type: 'inc' })`,
          note: {
            fr: `Préférez useReducer à plusieurs useState quand les transitions d'état sont liées ou nombreuses : la logique est centralisée et testable.`,
            en: `Prefer useReducer over many useState when state transitions are related or numerous: the logic is centralized and testable.`,
          },
        },
        {
          id: 'react-usecontext',
          title: { fr: 'useContext', en: 'useContext' },
          code: `const ThemeCtx = createContext('clair')
// Fournisseur
<ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>
// Consommateur (à n'importe quelle profondeur)
const theme = useContext(ThemeCtx)`,
          note: {
            fr: `Évite le prop drilling. Attention : tous les consommateurs re-render quand la value change — découpez les contextes ou mémoïsez la value.`,
            en: `Avoids prop drilling. Caveat: every consumer re-renders when value changes — split contexts or memoize the value.`,
          },
        },
      ],
    },
    {
      id: 'jsx',
      title: { fr: 'JSX & rendu', en: 'JSX & rendering' },
      items: [
        {
          id: 'react-jsx-rules',
          title: { fr: 'Règles JSX', en: 'JSX rules' },
          code: `return (
  <div className="card" onClick={handle}>   {/* class → className */}
    <label htmlFor="n">Nom</label>          {/* for → htmlFor */}
    {estConnecte && <Badge />}              {/* rendu conditionnel */}
    {titre || 'Sans titre'}
  </div>
)`,
          note: {
            fr: `JSX est du sucre pour React.createElement : un seul élément racine (ou <>…</>), attributs en camelCase, expressions JS entre { }.`,
            en: `JSX is sugar for React.createElement: a single root element (or <>…</>), camelCase attributes, JS expressions inside { }.`,
          },
        },
        {
          id: 'react-lists-keys',
          title: { fr: 'Listes & keys', en: 'Lists & keys' },
          code: `{items.map(item => (
  <Row key={item.id} label={item.label} />   // ✓ key stable et unique
))}
// ✗ key={index} : casse l'état local dès qu'on insère/réordonne`,
          note: {
            fr: `La key doit être stable, unique entre frères, tirée des données (pas l'index). Elle permet à React de réutiliser les nœuds au lieu de les réécrire.`,
            en: `The key must be stable, unique among siblings, derived from data (not the index). It lets React reuse nodes instead of rewriting them.`,
          },
        },
        {
          id: 'react-conditional',
          title: { fr: 'Rendu conditionnel', en: 'Conditional rendering' },
          code: `{loading ? <Spinner /> : <List data={data} />}   // ternaire
{error && <Alert msg={error} />}                 // && (attention à 0 !)
{count > 0 && <Badge n={count} />}               // ✓
{count && <Badge />}                             // ✗ affiche "0" si count=0`,
          note: {
            fr: `Avec &&, une valeur 0 (falsy mais rendable) s'affiche littéralement : convertissez en booléen (count > 0) ou utilisez un ternaire.`,
            en: `With &&, a 0 value (falsy but renderable) shows up literally: coerce to boolean (count > 0) or use a ternary.`,
          },
        },
        {
          id: 'react-fragments',
          title: { fr: 'Fragments', en: 'Fragments' },
          code: `return (
  <>                         {/* pas de div superflu dans le DOM */}
    <Th>Nom</Th>
    <Th>Âge</Th>
  </>
)
// Avec une key (dans une liste) : <Fragment key={id}>…</Fragment>`,
          note: {
            fr: `<>…</> groupe plusieurs éléments sans ajouter de nœud DOM : indispensable pour renvoyer des <td>/<li> adjacents.`,
            en: `<>…</> groups several elements without adding a DOM node: essential to return adjacent <td>/<li>.`,
          },
        },
      ],
    },
    {
      id: 'state',
      title: { fr: 'State & effets', en: 'State & effects' },
      items: [
        {
          id: 'react-batching',
          title: { fr: 'Batching des setState', en: 'setState batching' },
          code: `function onClick() {
  setCount(count + 1)   // count figé au rendu → tous planifient la même valeur
  setCount(count + 1)
  setCount(count + 1)
}                       // → +1 (un seul re-rendu). Pour +3 : setCount(c => c + 1)`,
          note: {
            fr: `React groupe les mises à jour d'un même événement en un seul re-rendu. La valeur d'état est figée pour tout le rendu : utilisez l'updater pour cumuler.`,
            en: `React batches updates from one event into a single re-render. State is frozen for the whole render: use the updater to accumulate.`,
          },
        },
        {
          id: 'react-derived',
          title: { fr: 'État dérivé : calculer, pas stocker', en: 'Derived state: compute, do not store' },
          code: `// ✗ dupliquer dans un state + useEffect pour resynchroniser
// ✓ calculer pendant le rendu
const total = items.reduce((s, i) => s + i.prix, 0)
const filtres = useMemo(() => items.filter(pred), [items, pred])`,
          note: {
            fr: `Ne mettez pas dans un state ce qui se déduit des props/state existants : calculez-le au rendu (mémoïsé si coûteux). Moins de bugs de désync.`,
            en: `Do not store in state what can be derived from existing props/state: compute it during render (memoized if costly). Fewer desync bugs.`,
          },
        },
        {
          id: 'react-lifting',
          title: { fr: 'Remonter l\'état (lifting)', en: 'Lifting state up' },
          code: `// Le parent détient l'état, les enfants le reçoivent + un callback
function Parent() {
  const [q, setQ] = useState('')
  return <><Search value={q} onChange={setQ} /><Results query={q} /></>
}`,
          note: {
            fr: `Quand deux composants doivent partager un état, placez-le dans leur plus proche ancêtre commun et passez valeur + setter en props.`,
            en: `When two components must share state, put it in their closest common ancestor and pass value + setter as props.`,
          },
        },
        {
          id: 'react-effect-deps',
          title: { fr: 'Piège des deps d\'effet', en: 'Effect deps pitfall' },
          code: `// ✗ objet/fonction recréé à chaque rendu → effet en boucle
useEffect(() => { load(opts) }, [opts])        // opts = { ... } inline
// ✓ stabiliser, ou dépendre de primitives
useEffect(() => { load({ id }) }, [id])`,
          note: {
            fr: `Une dépendance recréée à chaque rendu relance l'effet en continu. Dépendez de primitives, ou stabilisez avec useMemo/useCallback.`,
            en: `A dependency recreated every render re-runs the effect endlessly. Depend on primitives, or stabilize with useMemo/useCallback.`,
          },
        },
      ],
    },
    {
      id: 'perf',
      title: { fr: 'Contexte & performance', en: 'Context & performance' },
      items: [
        {
          id: 'react-memo',
          title: { fr: 'React.memo', en: 'React.memo' },
          code: `const Row = React.memo(function Row({ label }) {
  return <li>{label}</li>
})
// Row ne re-render que si ses props changent (comparaison superficielle).`,
          note: {
            fr: `memo saute le re-rendu quand les props sont identiques. Inutile si le parent passe des props recréées (objets/callbacks inline) à chaque rendu.`,
            en: `memo skips the re-render when props are equal. Useless if the parent passes freshly-created props (inline objects/callbacks) every render.`,
          },
        },
        {
          id: 'react-usememo',
          title: { fr: 'useMemo', en: 'useMemo' },
          code: `const tri = useMemo(
  () => grosTableau.slice().sort(compare),
  [grosTableau]                     // recalculé seulement si grosTableau change
)`,
          note: {
            fr: `Mémoïse le résultat d'un calcul coûteux entre les rendus. Ne pas en abuser : pour un calcul trivial, le coût de la mémoïsation dépasse le gain.`,
            en: `Memoizes an expensive computation across renders. Do not overuse: for a trivial computation, the memo overhead outweighs the gain.`,
          },
        },
        {
          id: 'react-usecallback',
          title: { fr: 'useCallback', en: 'useCallback' },
          code: `const onSave = useCallback((v) => save(id, v), [id])
// même référence tant que id ne change pas
<Child onSave={onSave} />          // le memo de Child tient enfin`,
          note: {
            fr: `Stabilise la référence d'une fonction passée à un enfant mémoïsé ou à un tableau de deps. Sans consommateur mémoïsé, c'est souvent inutile.`,
            en: `Stabilizes a function's reference passed to a memoized child or a deps array. Without a memoized consumer, it is usually pointless.`,
          },
        },
        {
          id: 'react-context-split',
          title: { fr: 'Découper les contextes', en: 'Split contexts' },
          code: `// ✗ un seul contexte { user, theme, cart } → tout re-render
// ✓ un contexte par préoccupation
<UserCtx.Provider value={user}>
  <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>
</UserCtx.Provider>`,
          note: {
            fr: `Chaque changement de value re-render TOUS les consommateurs du contexte. Séparez les données qui changent souvent de celles qui sont stables.`,
            en: `Every value change re-renders ALL consumers of that context. Separate frequently-changing data from stable data.`,
          },
        },
      ],
    },
    {
      id: 'components',
      title: { fr: 'Composants & patterns', en: 'Components & patterns' },
      items: [
        {
          id: 'react-props-children',
          title: { fr: 'Props & children', en: 'Props & children' },
          code: `function Card({ title, children }) {
  return <section><h2>{title}</h2>{children}</section>
}
<Card title="Profil"><Avatar /></Card>    // children = <Avatar />`,
          note: {
            fr: `children permet la composition : le parent passe du contenu arbitraire. Préférez la composition à des props de configuration pour la flexibilité.`,
            en: `children enables composition: the parent passes arbitrary content. Prefer composition over configuration props for flexibility.`,
          },
        },
        {
          id: 'react-custom-hook',
          title: { fr: 'Hook personnalisé (useX)', en: 'Custom hook (useX)' },
          code: `function useToggle(init = false) {
  const [on, setOn] = useState(init)
  const toggle = useCallback(() => setOn(o => !o), [])
  return [on, toggle]
}
const [ouvert, basculer] = useToggle()`,
          note: {
            fr: `Un hook custom extrait de la logique à état réutilisable. Convention useX, appelé au top level ; il compose d'autres hooks et renvoie ce qu'il veut.`,
            en: `A custom hook extracts reusable stateful logic. useX convention, called at top level; it composes other hooks and returns whatever it wants.`,
          },
        },
        {
          id: 'react-controlled',
          title: { fr: 'Input contrôlé', en: 'Controlled input' },
          code: `const [val, setVal] = useState('')
<input value={val} onChange={e => setVal(e.target.value)} />
// Non contrôlé (state dans le DOM) : <input defaultValue="…" ref={r} />`,
          note: {
            fr: `Contrôlé = React est la source de vérité (value + onChange). Non contrôlé = le DOM garde la valeur, lue via une ref à la soumission.`,
            en: `Controlled = React is the source of truth (value + onChange). Uncontrolled = the DOM holds the value, read via a ref on submit.`,
          },
        },
        {
          id: 'react-forwardref',
          title: { fr: 'forwardRef', en: 'forwardRef' },
          code: `const Input = forwardRef(function Input(props, ref) {
  return <input ref={ref} {...props} />
})
// Le parent peut viser le <input> interne : <Input ref={monRef} />`,
          note: {
            fr: `forwardRef laisse un composant transmettre une ref à un nœud interne. Combinez avec useImperativeHandle pour exposer une API (focus, reset).`,
            en: `forwardRef lets a component forward a ref to an inner node. Combine with useImperativeHandle to expose an API (focus, reset).`,
          },
        },
      ],
    },
    {
      id: 'ecosystem',
      title: { fr: 'Écosystème (routing & data)', en: 'Ecosystem (routing & data)' },
      items: [
        {
          id: 'react-router',
          title: { fr: 'React Router (essentiel)', en: 'React Router (essentials)' },
          code: `<Routes>
  <Route path="/users/:id" element={<User />} />
</Routes>
const { id } = useParams()          // segment dynamique
const navigate = useNavigate()
navigate('/login', { replace: true })`,
          note: {
            fr: `useParams lit les segments d'URL, useNavigate navigue par code, useSearchParams gère la query. Naviguez par chemin déclaré, pas en dur partout.`,
            en: `useParams reads URL segments, useNavigate navigates in code, useSearchParams handles the query. Navigate via declared paths, not hardcoded everywhere.`,
          },
        },
        {
          id: 'react-query',
          title: { fr: 'Data fetching (TanStack Query)', en: 'Data fetching (TanStack Query)' },
          code: `const { data, isLoading, error } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
})
// cache, refetch, statuts de chargement gérés pour vous`,
          note: {
            fr: `Pour les données serveur, préférez une lib de cache (React Query/SWR) à useEffect + useState : elle gère cache, dédoublonnage, refetch et erreurs.`,
            en: `For server data, prefer a caching lib (React Query/SWR) over useEffect + useState: it handles cache, dedup, refetch and errors.`,
          },
        },
        {
          id: 'react-forms',
          title: { fr: 'Formulaires (action + FormData)', en: 'Forms (action + FormData)' },
          code: `function Form() {
  function action(formData) {         // React 19 : <form action={fn}>
    const email = formData.get('email')
  }
  return <form action={action}><input name="email" /></form>
}`,
          note: {
            fr: `Pour un formulaire simple, laissez le DOM porter les valeurs et lisez FormData à la soumission — moins d'état que de tout contrôler à la main.`,
            en: `For a simple form, let the DOM hold the values and read FormData on submit — less state than controlling everything by hand.`,
          },
        },
      ],
    },
  ],
};
