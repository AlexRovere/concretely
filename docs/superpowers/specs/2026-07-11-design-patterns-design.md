# Design : catégorie « Design Patterns »

Date : 2026-07-11
Statut : validé (design), en attente de revue de la spec

## Objectif

Ajouter à Concretely une catégorie **Design Patterns** présentant les patterns
GoF les plus importants sous forme de **fiches de référence** : intention,
problème, solution, quand l'utiliser, pièges, **pseudo-code** neutre, et un
**exemple simple par langage** (le jeu de langages existant du projet).
Inspiration : refactoring.guru, mais adapté à la philosophie « rendre concret
l'abstrait » et aux conventions du dépôt.

## Décisions (issues du brainstorming)

- Périmètre : **16 patterns** (essentiels étendus), répartis 4 / 5 / 7.
- Format : **fiche de référence statique** (pas de visualisation animée).
- Langages des exemples : jeu existant du projet (**JS, Java, Swift, Go, PHP,
  Ruby, C#**), plus un **pseudo-code** neutre commun.
- Navigation : **1 catégorie `patterns`, 3 onglets** (une famille par onglet).

## Contenu : les 16 patterns

- **Creational (4)** : Singleton, Factory Method, Builder, Abstract Factory
- **Structural (5)** : Adapter, Decorator, Facade, Proxy, Composite
- **Behavioral (7)** : Strategy, Observer, Command, State, Iterator,
  Template Method, Chain of Responsibility

## Architecture

### 1. Modèle de données (JS pur, testable en Node)

`src/patterns.js` : source de vérité unique, aucun texte codé en dur dans la vue.

```js
// Familles dans l'ordre d'affichage.
export const FAMILIES = ['creational', 'structural', 'behavioral']

// Une entrée par pattern. Tout le texte humain est bilingue {fr, en},
// comme les cheatsheets et le quiz.
export const PATTERNS = [
  {
    id: 'singleton',
    family: 'creational',            // doit appartenir à FAMILIES
    name:     { fr: 'Singleton', en: 'Singleton' },
    tagline:  { fr: '...', en: '...' },   // intention en une ligne
    problem:  { fr: '...', en: '...' },
    solution: { fr: '...', en: '...' },
    when:     { fr: '...', en: '...' },   // quand l'utiliser
    pitfalls: { fr: '...', en: '...' },   // pièges / anti-usage
    pseudo:   `...`,                       // pseudo-code neutre, multi-lignes
    code: {                                // exemple simple par langage
      js: `...`, java: `...`, swift: `...`,
      go: `...`, php: `...`, ruby: `...`, csharp: `...`,
    },
  },
  // ... 15 autres
]

export function patternsByFamily(fam) {
  return PATTERNS.filter((p) => p.family === fam)
}
```

Chaque exemple de code reste **court et lisible** : le but est de faire voir la
structure du pattern, pas de fournir une implémentation de production.

### 2. Vue (suit le précédent des wrappers TracePanel)

- `src/components/panels/PatternsPanel.vue` : renderer générique. Props :
  `family` (creational | structural | behavioral) plus les props standard
  `cat` et `query`. Comportement :
  - sélecteur de patterns de la famille (rangée de pills) ; le premier est
    sélectionné par défaut ;
  - fiche détaillée du pattern choisi : intention, problème, solution, quand
    l'utiliser, pièges ;
  - bloc **pseudo-code** coloré via `highlight.js` (rendu avec la coloration
    JS, la plus proche d'un pseudo-code lisible) ;
  - bloc **exemple de code** avec **sélecteur de langue réutilisant le
    composable partagé `useCodeLang`** (donc synchronisé avec les onglets Tri /
    Pathfinding), rendu via `highlight.js` ;
  - libellés d'UI localisés via `useI18n` ; textes de contenu lus depuis
    `patterns.js` avec le repli `v?.[locale] ?? v?.fr`.
  - `query` (Ctrl+K) : si fourni, présélectionne le pattern correspondant.
- 3 wrappers courts (~8 lignes chacun), sur le modèle des wrappers TracePanel :
  - `PatternsCreationalPanel.vue` → `<PatternsPanel family="creational" />`
  - `PatternsStructuralPanel.vue` → `<PatternsPanel family="structural" />`
  - `PatternsBehavioralPanel.vue` → `<PatternsPanel family="behavioral" />`

### 3. Câblage `App.vue`

- `CATEGORIES` : insérer `'patterns'` juste après `'general'` (catégorie
  conceptuelle transverse).
- `TABS` : 3 entrées `cat: 'patterns'` :
  - `{ mode: 'patternscreational',  key: 'tabs.patternscreational',  cat: 'patterns' }`
  - `{ mode: 'patternsstructural',  key: 'tabs.patternsstructural',  cat: 'patterns' }`
  - `{ mode: 'patternsbehavioral',  key: 'tabs.patternsbehavioral',  cat: 'patterns' }`
- Playground : ajouter `'patterns'` au tableau `not:` de l'entrée playground
  (aucun moteur d'exécution pour cette catégorie).
- `panels` map + imports : enregistrer les 3 nouveaux modes vers leurs wrappers.

### 4. i18n (`src/i18n.js`, parité FR/EN testée)

Ajouter dans `STRINGS.fr` et `STRINGS.en` (mêmes clés des deux côtés) :

- `cat.patterns` : « Design Patterns »
- `tabs.patternscreational`, `tabs.patternsstructural`, `tabs.patternsbehavioral`
- libellés d'UI de la fiche : `pat.intent`, `pat.problem`, `pat.solution`,
  `pat.when`, `pat.pitfalls`, `pat.pseudo`, `pat.code`
- libellés de familles si besoin d'un titre : `pat.family.creational`, etc.

Le contenu des patterns n'est pas dans i18n.js : il est bilingue directement
dans `patterns.js` (même convention que cheatsheets/quiz).

### 5. Cheatsheet (cohérence + recherche Ctrl+K)

`src/cheatsheets/patterns.js` : **dérivée de `PATTERNS`** (DRY) pour éviter toute
duplication de contenu.

- 3 sections « familles » construites par mapping de `patternsByFamily(fam)` :
  chaque item = `{ id: 'cs-pat-<id>', title: name, code: pseudo (ou snippet js
  court), note: tagline }`.
- 1 section « Principes » écrite à la main (3 items) : composition plutôt
  qu'héritage, programmer vers une interface, encapsuler ce qui varie.
- `lang` de la feuille : `'js'` (langage valide pour le highlighter et le test).
- Enregistrement dans `src/cheatsheets/index.js` (`CHEATSHEETS.patterns`).

Effet : chaque pattern devient trouvable via Ctrl+K, et l'invariant « chaque
catégorie a sa cheatsheet » reste vrai.

## Tests (`node --test`, sans navigateur)

- `test/patterns.test.js` (nouveau) :
  - `PATTERNS.length === 16` ; répartition familles 4 / 5 / 7 ;
  - ids uniques ; `family` ∈ `FAMILIES` ;
  - `name/tagline/problem/solution/when/pitfalls` bilingues et non vides (fr+en) ;
  - `pseudo` non vide ;
  - `code` contient les 7 langages, chacun non trivial (> ~10 caractères) ;
  - `patternsByFamily` renvoie le bon sous-ensemble.
- `test/cheatsheets.test.js` (mise à jour) : ajouter `'patterns'` au tableau
  `CATS` et ajuster le compteur d'items minimal si nécessaire.
- `test/i18n.test.js` : la parité FR/EN couvre automatiquement les nouvelles
  clés (aucune modification, mais elle échouera si une clé manque d'un côté).

## Hors périmètre v1

- Pas de visualisation animée pas-à-pas.
- Pas de questions de quiz dédiées : l'onglet Quiz reste visible sous `patterns`
  avec le pool `all` par repli (comportement existant).
- Pas de playground (catégorie exclue via `not:`).

## Points de vigilance (tirés de l'historique du dépôt)

- Ne jamais éditer les fichiers source UTF-8 via les cmdlets texte de
  PowerShell 5.1 (mojibake des accents) : utiliser l'outil Edit / Write.
- `useI18n().t` renvoie '' pour les clés à valeur fonction ; utiliser `tf` pour
  les libellés paramétrés (ici aucun a priori, mais à garder en tête).
- Respecter le style d'écriture : pas de tiret cadratin ni de double tiret dans
  le contenu FR/EN ni les commentaires ; accents corrects partout.
