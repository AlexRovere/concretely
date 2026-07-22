# Catégorie CI/CD (GitLab & GitHub) — Design

*Date : 2026-07-22 · Statut : approuvé (design) · Projet : Concretely (Vue 3 + Vite, SPA statique)*

## Objectif

Ajouter une catégorie **CI/CD** (groupe « Outils & infra ») couvrant **GitLab CI** et **GitHub Actions**, avec deux onglets :
1. **Cheatsheet** — snippets réels des deux plateformes côte à côte, par thème.
2. **GitLab vs GitHub** — tableau comparatif concept par concept (réutilise `CompareTablePanel`).

## Décisions cadrées (brainstorming)

1. **Forme** : cheatsheet **+** tableau comparatif (les deux patterns existants).
2. **Placement** : nouvelle catégorie `cicd`, groupe `tools`, icône 🔁.
3. **YAML** : ajout de la coloration `yaml` à `highlight.js` (+ set `LANGS` du test).
4. **Périmètre** : un seul lot ; pas de visualizer de pipeline animé (YAGNI).

## Cheatsheet `src/cheatsheets/cicd.js`

- Shape standard `{ id:'cicd', lang:'yaml', sections:[{ id, title:{fr,en}, items:[{ id, title, code, note }] }] }`.
- Chaque item montre **les deux plateformes dans un seul bloc `code`**, séparées par un en-tête commenté :
  ```
  # --- GitLab CI (.gitlab-ci.yml) ---
  …
  # --- GitHub Actions (.github/workflows/ci.yml) ---
  …
  ```
- `note` bilingue : correspondance + piège (ton concret des autres cheatsheets).
- **~6 sections, ≥3 items chacune** : *Structure & jobs*, *Déclencheurs*, *Dépendances & artefacts*, *Cache*, *Variables & secrets*, *Matrix & déploiement*.
- Contrainte tests (`test/cheatsheets.test.js`) : ≥4 sections, ≥3 items, ids **uniques across toutes les sheets** (préfixe `cc-`), bilingue, `code`>10, `lang` ∈ `LANGS`.

## Coloration YAML — `src/highlight.js`

- Ajouter `yaml` à la condition `hashComment` (commentaires `#`). Strings et nombres déjà gérés génériquement → rendu propre.
- Ajouter `'yaml'` au set `LANGS` de `test/cheatsheets.test.js`.

## Onglet comparatif

- **Données** `src/cicdcompare.js` : `{ id:'cicd', intro:{fr,en}, candidates:[{id:'gitlab',label:'GitLab CI'},{id:'github',label:'GitHub Actions'}], dimensions:[{ id, label:{fr,en}, cells:{ gitlab:{fr,en}, github:{fr,en} } }] }`. Dimensions : fichier, unité (job/stage vs job/step), runner, déclencheurs, cache, artefacts, secrets, matrix, dépendances (`needs`/`depends_on`), environnements/déploiement.
- **Refactor non invasif** de `CompareTablePanel.vue` : prop optionnelle `data` → `const cmp = computed(() => props.data ?? comparisonFor(props.id))`. Aucun impact sur les comparatifs Swift (qui passent `id`).
- **Wrapper** `src/components/panels/CicdComparePanel.vue` : passe `:data="CICD_COMPARISON"` à `CompareTablePanel`.

## Câblage

- `src/nav.js` : ajouter `'cicd'` à `CATEGORIES` (après `k8s`).
- `src/categoryMeta.js` : entrée `cicd` (icône 🔁, group `tools`, tagline FR/EN).
- `src/i18n.js` : `cat.cicd`, `tabs.cicdcompare` (FR + EN).
- `src/App.vue` : onglet `{ mode:'cicdcompare', key:'tabs.cicdcompare', cat:'cicd' }` + import + entrée `panels`.
- `src/cheatsheets/index.js` : import + registry.
- Ajouter `'cicd'` au `not` des onglets **Playground** (pas de moteur) et **Quiz** (pas de questions) pour éviter des onglets vides.
- `test/cheatsheets.test.js` : `'cicd'` dans `CATS`.

## Tests

- Structure cheatsheet : couverte automatiquement (le test itère toutes les sheets).
- `test/cicdcompare.test.js` : comparaison bien formée — chaque dimension a une cellule pour **les deux** candidats (`gitlab` et `github`), bilingue.
- `test/categoryMeta.test.js` : couvre `cicd` automatiquement (parité CATEGORIES ↔ meta).

## Hors périmètre (YAGNI)

- Pas de visualizer de pipeline animé.
- Pas de moteur d'exécution CI (pas de Playground pour cette catégorie).
- Pas de questions de quiz CI/CD (l'onglet Quiz est masqué pour `cicd`).
- Autres plateformes (CircleCI, Jenkins…) hors scope.
