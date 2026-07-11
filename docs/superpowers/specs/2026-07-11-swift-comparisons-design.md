# Design : 2 onglets comparatifs Swift

Date : 2026-07-11
Statut : validé (design), en attente de revue de la spec

## Objectif

Ajouter à la catégorie Swift de Concretely deux onglets de référence au format
tableau comparatif :

1. `swifttypes` : struct vs class vs actor vs class annotée `@MainActor`
   (sémantique valeur/référence, mutation, isolation, thread-safety).
2. `swiftbindings` : comparaison des bindings de ViewModel SwiftUI
   (`@State`, `@Binding`, `@StateObject`, `@ObservedObject`,
   `@EnvironmentObject`, macro `@Observable` + `@State`).

Ces onglets sont des vues comparatives statiques (tableau + code de référence)
qui complètent les onglets Swift animés existants (`cow`, `arc`,
`swiftconcurrency`, `mainthread`, `swiftstate`) sans les dupliquer : ils y
renvoient.

## Décisions (issues du brainstorming)

- 2 onglets distincts (types, bindings).
- Format : tableau comparatif + exemple de code par cas (statique, pas
  d'animation).
- Swift moderne inclus : macro `@Observable` (iOS 17, framework Observation) et
  `@Environment` / `@EnvironmentObject`.
- Extension de la cheatsheet Swift existante (2 sections dérivées) pour la
  recherche Ctrl+K.

## Architecture

### 1. Modèle de données (JS pur, testable en Node)

`src/swiftcompare.js` : source de vérité unique, bilingue `{fr, en}` inline.

```js
// Deux comparaisons Swift au format tableau. Modèle pur (aucun import Vue),
// testable sous node --test.

export const COMPARISONS = {
  types: {
    id: 'types',
    intro: { fr: '...', en: '...' },
    candidates: [
      { id: 'struct',    label: 'struct',           code: `...swift...`, when: { fr: '...', en: '...' } },
      { id: 'class',     label: 'class',            code: `...`,          when: { fr: '...', en: '...' } },
      { id: 'actor',     label: 'actor',            code: `...`,          when: { fr: '...', en: '...' } },
      { id: 'mainactor', label: '@MainActor class', code: `...`,          when: { fr: '...', en: '...' } },
    ],
    dimensions: [
      // Une cellule bilingue par candidat, clés = candidate.id.
      { id: 'semantics',   label: { fr: 'Sémantique',        en: 'Semantics' },        cells: { struct: {fr,en}, class: {fr,en}, actor: {fr,en}, mainactor: {fr,en} } },
      { id: 'mutation',    label: { fr: 'Mutation',          en: 'Mutation' },         cells: { ... } },
      { id: 'identity',    label: { fr: 'Identité (===)',    en: 'Identity (===)' },   cells: { ... } },
      { id: 'threadsafe',  label: { fr: 'Thread-safety',     en: 'Thread safety' },    cells: { ... } },
      { id: 'concurrency', label: { fr: 'Accès concurrent',  en: 'Concurrent access' },cells: { ... } },
      { id: 'inheritance', label: { fr: 'Héritage',          en: 'Inheritance' },      cells: { ... } },
      { id: 'storage',     label: { fr: 'Stockage',          en: 'Storage' },          cells: { ... } },
      { id: 'cost',        label: { fr: 'Coût',              en: 'Cost' },             cells: { ... } },
    ],
    notes: [ { fr: '...', en: '...' } ],   // pièges / points à retenir
  },
  bindings: {
    id: 'bindings',
    intro: { fr: '...', en: '...' },
    candidates: [
      { id: 'state',       label: '@State',            code: `...`, when: {fr,en} },
      { id: 'binding',     label: '@Binding',          code: `...`, when: {fr,en} },
      { id: 'stateobject', label: '@StateObject',      code: `...`, when: {fr,en} },
      { id: 'observed',    label: '@ObservedObject',   code: `...`, when: {fr,en} },
      { id: 'environment', label: '@EnvironmentObject',code: `...`, when: {fr,en} },
      { id: 'observable',  label: '@Observable + @State', code: `...`, when: {fr,en} },
    ],
    dimensions: [
      { id: 'role',       label: { fr: 'Rôle',                 en: 'Role' },               cells: { ... } },
      { id: 'observes',   label: { fr: 'Type observé',         en: 'Observed type' },      cells: { ... } },  // valeur / ObservableObject / @Observable
      { id: 'ownership',  label: { fr: 'Propriété / durée',    en: 'Ownership / lifetime' },cells: { ... } },
      { id: 'updates',    label: { fr: 'Quand la vue redessine',en: 'When the view redraws' },cells: { ... } },
      { id: 'pitfall',    label: { fr: 'Piège courant',        en: 'Common pitfall' },     cells: { ... } },  // reset @ObservedObject, crash @EnvironmentObject manquant, oubli @State
      { id: 'since',      label: { fr: 'Disponible depuis',    en: 'Available since' },    cells: { ... } },
    ],
    notes: [ { fr: '...', en: '...' } ],
  },
};

export function comparisonFor(id) {
  return COMPARISONS[id] ?? null;
}
```

Contraintes de contenu : chaque `dimensions[].cells` doit couvrir TOUS les
`candidates` de la comparaison (une cellule bilingue par candidat). Exemples de
code courts (6 à 12 lignes), un concept par snippet.

### 2. Vue (précédent des wrappers TracePanel / PatternsPanel)

- `src/components/panels/CompareTablePanel.vue` : renderer générique. Props :
  `id` ('types' | 'bindings') plus `cat` et `query`. Rend :
  - un paragraphe d'intro (`intro`) localisé ;
  - le **tableau comparatif** : première colonne = libellés de dimensions,
    colonnes suivantes = candidats (`candidate.label`), cellules =
    `dimension.cells[candidateId]` localisées. Le tableau est enveloppé dans un
    conteneur `overflow-x: auto` (contenu large scrollable sur mobile, jamais de
    scroll horizontal de la page) ;
  - pour chaque candidat : un bloc code `highlight(candidate.code, 'swift')` +
    une ligne "quand l'utiliser" (`candidate.when`) ;
  - la liste des `notes`.
  - libellés d'UI via `useI18n` ; contenu lu depuis `swiftcompare.js` avec le
    repli `v?.[locale] ?? v?.fr`.
- 2 wrappers courts (~8 lignes) :
  - `SwiftTypesPanel.vue` : `<CompareTablePanel id="types" .../>`
  - `SwiftBindingsPanel.vue` : `<CompareTablePanel id="bindings" .../>`
- Nouvelles classes `cmp-*` dans `src/assets/styles/visualizers.css`
  (conteneur scrollable, table, en-têtes, cellules, bloc "quand l'utiliser",
  notes), pilotées par les variables sémantiques existantes
  (`--border`, `--inset`, `--muted`, `--ink`, `--accent`, `color-mix` derivés),
  fonctionnant en thème clair ET sombre. Pas de `<style>` scoped dans les .vue.

### 3. Câblage `App.vue`

- Imports des 2 wrappers.
- `TABS` : 2 entrées `cat: 'swift'`, placées juste après `swiftstate` (cohérence
  thématique bindings/état), puis les onglets types/bindings :
  - `{ mode: 'swifttypes', key: 'tabs.swifttypes', cat: 'swift' }`
  - `{ mode: 'swiftbindings', key: 'tabs.swiftbindings', cat: 'swift' }`
- `panels` map : `swifttypes: SwiftTypesPanel`, `swiftbindings: SwiftBindingsPanel`.
- Rien à changer pour le playground : Swift est déjà dans la liste `not:`
  (aucun onglet playground pour cette catégorie).

### 4. i18n (`src/i18n.js`, parité FR/EN testée)

Ajouter dans `STRINGS.fr` et `STRINGS.en` (mêmes clés) :

- `tabs.swifttypes` : FR "Types (struct/class/actor)" / EN "Types (struct/class/actor)"
- `tabs.swiftbindings` : FR "Bindings SwiftUI" / EN "SwiftUI bindings"
- `cmp.when` : FR "Quand l'utiliser" / EN "When to use"
- `cmp.code` : FR "Exemple" / EN "Example"
- `cmp.notes` : FR "À retenir" / EN "Takeaways"

Le contenu des comparaisons reste bilingue dans `swiftcompare.js`.

### 5. Cheatsheet Swift (extension dérivée)

`src/cheatsheets/swift.js` : ajouter un import relatif
`import { comparisonFor } from '../swiftcompare.js';` (relatif, pas d'alias
`@/`, car ce fichier est chargé par `node --test`) et 2 sections construites par
mapping des candidats (DRY, aucun contenu dupliqué à la main) :

```js
const compareSection = (cmpId, secId, titleFr, titleEn) => ({
  id: secId,
  title: { fr: titleFr, en: titleEn },
  items: comparisonFor(cmpId).candidates.map((c) => ({
    id: `cs-swift-${cmpId}-${c.id}`,
    title: { fr: c.label, en: c.label },
    code: c.code,
    note: c.when,
  })),
});
```

- Section types : 4 items (struct, class, actor, @MainActor class).
- Section bindings : 6 items (@State ... @Observable).
Les deux respectent les seuils du test cheatsheets (>= 3 items/section, notes
bilingues > 10 caractères, code > 10 caractères, ids uniques via le préfixe
`cs-swift-`). Aucune nouvelle catégorie : `CATS` et le nombre de sheets ne
changent pas ; seul le total d'items augmente (ce qui ne peut qu'aider les
assertions de plancher).

### 6. Tests (`node --test`, sans navigateur)

- `test/swiftcompare.test.js` (nouveau) :
  - `COMPARISONS` a les clés `types` et `bindings` ;
  - pour chaque comparaison : `intro` bilingue ; `candidates` >= 2, ids uniques,
    chacun avec `label` non vide, `code` non trivial (> ~10 caractères) et
    `when` bilingue non vide ; `dimensions` >= 3, chacune avec `label` bilingue
    et un `cells[candidateId]` bilingue non vide pour CHAQUE candidat de la
    comparaison (couverture complète de la matrice) ; `notes` bilingues ;
  - `comparisonFor('types')` et `comparisonFor('bindings')` renvoient le bon
    objet, `comparisonFor('inconnu')` renvoie null.
- `test/cheatsheets.test.js` : inchangé dans sa structure ; il valide
  automatiquement les 2 nouvelles sections dérivées (bien formées, bilingues).
  Vérifier qu'il reste vert après l'ajout.
- `test/i18n.test.js` : la parité FR/EN couvre les nouvelles clés.

## Hors périmètre v1

- Pas d'animation pas-à-pas (format statique choisi).
- On ne modifie pas les onglets animés existants (`swiftstate`,
  `swiftconcurrency`, `cow`, `arc`, `mainthread`) : les nouveaux onglets y
  renvoient dans leurs notes.
- Pas de questions de quiz dédiées.

## Points de vigilance (historique du dépôt)

- Ne jamais éditer un fichier source UTF-8 via les cmdlets texte PowerShell 5.1
  (mojibake des accents) : utiliser Write / Edit.
- Style d'écriture : pas de tiret cadratin ni de double tiret dans le contenu
  FR/EN ni les commentaires ajoutés ; accents corrects. Ne pas introduire de
  nouveaux tirets cadratins même si le fichier `swift.js` existant en contient
  (ne pas toucher au contenu existant).
- Le tableau doit scroller horizontalement dans son propre conteneur sur mobile,
  jamais faire déborder la page (convention responsive du projet).
- Import de `swiftcompare.js` dans la cheatsheet : relatif (`../swiftcompare.js`),
  pas d'alias `@/` (le fichier tourne sous `node --test`).
