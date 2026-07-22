# Section React — Plan d'implémentation

> Exécution inline (TDD sur les modules purs, validation navigateur sur les panneaux).

**Goal :** catégorie `react` = 4 visualizers + cheatsheet + quiz + câblage.

## Global Constraints

- Zéro dépendance runtime nouvelle.
- Modules purs : API `{ SCENARIOS, scenarioById(id), summaryOf(scenario) }` comme `bubbling.js`.
- Immutabilité dans les modèles.
- Cheatsheet : lang `js`, ids `react-*`, ≥4 sections, ≥3 items/section, bilingue, `code>10`.
- i18n : chaque clé en FR **et** EN.
- Quiz : réponses re-dérivées de `summaryOf`.

---

### Task 1 — Reconciliation (réutilise l'engine vdom)

- Create `src/react/reconcile.js` : `REACT_RECONCILE_SCENARIOS` (JSX code, mode keyed/unkeyed,
  old/next), `reactReconcileScenarioById(id)`, ré-export `summaryOf` depuis `../vdom.js`.
  Scénarios : `map-index-key` (unkeyed, prepend → patchs + bug d'état), `map-stable-key`
  (keyed, prepend → 1 insert), `reorder-index` (unkeyed shuffle), `reorder-key` (keyed shuffle).
- Test `test/reactReconcile.test.js` : ops re-dérivés (`map-index-key` → 2 patch + 1 insert ;
  `map-stable-key` → 1 insert), unicité des ids, `target === path` n/a (liste).
- Panel `src/components/panels/ReactReconcilePanel.vue` (calque `VdomPanel`, code-head « React »).

### Task 2 — Hooks & render cycle

- Create `src/react/hooks.js`. Modèle : une passe de rendu appelle les hooks dans l'ordre ;
  `setState` empile dans une file appliquée au commit. Scénarios :
  `batching-value` (`setCount(count+1)×3` en un handler → +1), `batching-updater`
  (`setCount(c=>c+1)×3` → +3), `hooks-order` (ordre useState/useState/useEffect).
  Steps : `{type:'render'|'hook'|'queue'|'commit'|'effect', ...}`. `summaryOf` → `{ finalCount, log }`.
- Test `test/reactHooks.test.js` : `batching-value` → finalCount 1 ; `batching-updater` → 3.
- Panel `ReactHooksPanel.vue`.

### Task 3 — Re-render & memo

- Create `src/react/rerender.js`. Arbre de composants `{ id, children, memo? }`, un update part
  d'un nœud ; un enfant re-render sauf si `memo` et props inchangées (héritent du skip).
  Scénarios : `no-memo` (tout re-render), `memo-blocks` (React.memo stoppe un sous-arbre),
  `memo-broken` (nouvelle prop objet/callback à chaque render casse le memo).
  Steps : `{type:'update'|'render'|'skip', node}`. `summaryOf` → `{ rendered:[ids], skipped:[ids] }`.
- Test `test/reactRerender.test.js` : `no-memo` re-render tout ; `memo-blocks` skippe le sous-arbre.
- Panel `ReactRerenderPanel.vue` (rendu arbre en boîtes, comme les visualizers d'arbre existants).

### Task 4 — useEffect & cleanup

- Create `src/react/effects.js`. Timeline d'actions (mount, setState/props change, unmount) ;
  un effect avec deps `[]` ne se rejoue jamais, `[x]` se rejoue si x change (cleanup avant),
  `strict` double le mount en dev (mount→cleanup→mount). Scénarios : `deps-empty`, `deps-value`,
  `strict-mode`, `no-deps` (à chaque render). Steps : `{type:'effect'|'cleanup'|'render', label}`.
  `summaryOf` → `{ runs, cleanups }`.
- Test `test/reactEffects.test.js` : `deps-empty` → runs 1 cleanups 1(unmount) ;
  `strict-mode` → runs 2 cleanups 1 (mount dev).
- Panel `ReactEffectsPanel.vue`.

### Task 5 — Cheatsheet

- Create `src/cheatsheets/react.js` (6 sections, ids `react-*`).
- Register dans `src/cheatsheets/index.js`.
- `test/cheatsheets.test.js:6` : ajouter `'react'` au tableau `CATS`.

### Task 6 — Quiz

- `src/quiz.js` : 4 questions `cat:'react'` (`rc-keys`, `rc-batching`, `rc-memo`, `rc-strict`),
  `goto:{mode, scenario}`, réponses re-dérivées.
- `test/quiz.test.js:399` : ajouter `'react'` au tableau `cats`. Ajouter les tests de re-dérivation.

### Task 7 — Câblage nav/UI/i18n

- `src/nav.js` : `'react'` après `'vue'`.
- `src/categoryMeta.js` : `react: { icon:'⚛️', group:'languages', tagline }`.
- `src/App.vue` : imports + 4 TABS (`reactreconcile`, `reacthooks`, `reactrerender`, `reacteffects`,
  `cat:'react'`) + panels + `'react'` dans `not` du playground.
- `src/i18n.js` : `tabs.react*` + namespaces par panneau (FR + EN).
- `node --test` vert (≈ 394 + nouveaux). Validation navigateur des 4 panneaux.
