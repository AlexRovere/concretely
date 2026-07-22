# Section React — Design

**Goal :** ajouter une catégorie `react` complète au site concretely, calquée sur la
catégorie `vue`/`ml` : 4 visualizers interactifs + cheatsheet + quiz + câblage complet
(nav, accueil, router, i18n, tests).

## Contexte

Le site expose des catégories (langages, concepts, outils). Chaque catégorie a des
onglets « sujet » (visualizers animés) plus les onglets universels Cheatsheet / Quiz /
Playground. Un visualizer = un module pur déterministe (`src/<topic>.js`) générant des
étapes, piloté par `StepPlayer`, rendu par un panneau Vue (`src/components/panels/*.vue`).

La catégorie `vue` (vuereactivity, vdom, bubbling, debounce) est le modèle direct.

## Périmètre

Catégorie `react` (groupe `languages`, icône ⚛️), 4 onglets visuels + Cheatsheet + Quiz.
**Playground exclu** : le JSX ne s'exécute pas dans le playground JS brut → `react` dans
la liste `not` de l'onglet playground.

### Visualizers (modules purs `src/react/`)

| Onglet | Module | Ce qu'il montre |
|---|---|---|
| Reconciliation / keys | réutilise `simulate`/`summaryOf` de `vdom.js` + `src/react/reconcile.js` (scénarios JSX) | diff par position vs par key ; le bug `key={index}` dans `.map()` |
| Hooks & render cycle | `src/react/hooks.js` | ordre des hooks, file de `setState`, batching : `setCount(count+1)×3` → +1 vs `setCount(c => c+1)×3` → +3 |
| Re-render & memo | `src/react/rerender.js` | propagation des re-renders dans un arbre Parent→A,B→C ; `React.memo` fait sauter le sous-arbre dont les props n'ont pas changé |
| useEffect & cleanup | `src/react/effects.js` | mount/update/unmount, ordre effect↔cleanup, deps `[]` vs `[x]`, double-invoke StrictMode |

Chaque module (sauf reconcile qui réutilise l'engine vdom) expose la même API que
`bubbling.js`/`vdom.js` : `SCENARIOS` (tableau), `scenarioById(id)`, `summaryOf(scenario)`
renvoyant un résumé sérialisable utilisé par le quiz et les tests.

### Panneaux Vue

`ReactReconcilePanel`, `ReactHooksPanel`, `ReactRerenderPanel`, `ReactEffectsPanel`.
Conventions identiques à `VdomPanel` : `ref` racine, `StepPlayer`, `wirePlayerButtons` +
`setStatus`, `onLocaleChange`, `highlight(code, 'js')`, nettoyage `onDeactivated`/`onUnmounted`.

### Cheatsheet — `src/cheatsheets/react.js`

`{ id:'react', lang:'js', sections:[...] }`, ids d'items préfixés `react-` (unicité globale).
~6 sections, ≥3 items chacune, bilingues :
Hooks fondamentaux · JSX & rendu · State & effects · Context & perf · Composants & patterns ·
Écosystème (Router / data-fetching).

### Quiz — `src/quiz.js`

4 questions `cat:'react'` (une par visualizer), réponses **re-dérivées** de `summaryOf`
comme `vy-*`/`vd-*`/`bb-*`. Chaque question a `goto:{ mode, scenario }`.

## Câblage

- `src/nav.js` : ajouter `'react'` à `CATEGORIES` (après `vue`).
- `src/categoryMeta.js` : entrée `react: { icon:'⚛️', group:'languages', tagline:{fr,en} }`.
- `src/cheatsheets/index.js` : import + registre.
- `src/App.vue` : 4 imports de panneaux, 4 entrées `TABS` (`cat:'react'`), 4 entrées `panels`,
  ajout de `'react'` à la liste `not` du tab playground.
- `src/i18n.js` : `tabs.reactreconcile`/`reacthooks`/`reactrerender`/`reacteffects` +
  namespaces de clés par panneau, blocs FR et EN.

## Tests (node:test)

- `test/reactReconcile.test.js`, `test/reactHooks.test.js`, `test/reactRerender.test.js`,
  `test/reactEffects.test.js` : re-dérivation via `summaryOf`, structure des scénarios.
- Compléter les 3 tableaux **codés en dur** avec `'react'` :
  `test/cheatsheets.test.js:6` (`CATS`), `test/quiz.test.js:399` (`cats`).
  `test/categoryMeta.test.js` vérifie la parité automatiquement (rien à modifier hormis les données).
- Quiz : ajouter les tests de re-dérivation des 4 nouvelles questions.

## Contraintes (invariants du repo)

- Zéro dépendance runtime nouvelle (tout fait main).
- Cheatsheet : ≥4 sections, ≥3 items/section, ids uniques sur TOUTES les sheets, bilingue,
  `code.length > 10`, `lang ∈ LANGS`.
- Immutabilité dans les modèles (nouvelles structures, pas de mutation en place).
- i18n : chaque clé existe en FR **et** EN.
- Quiz : toute réponse re-dérivée du modèle qu'elle interroge.
```
