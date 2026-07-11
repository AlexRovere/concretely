# Swift Comparison Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter deux onglets comparatifs statiques à la catégorie Swift de Concretely : `swifttypes` (struct vs class vs actor vs class @MainActor) et `swiftbindings` (bindings de ViewModel SwiftUI), au format tableau + code de référence.

**Architecture:** Un modèle JS pur `src/swiftcompare.js` (deux comparaisons, matrice dimensions x candidats, bilingue inline) alimente un panneau générique `CompareTablePanel.vue` paramétré par `id`, exposé via 2 wrappers courts. Câblage standard dans `App.vue`, i18n FR/EN, et 2 sections dérivées ajoutées à la cheatsheet Swift existante pour la recherche Ctrl+K.

**Tech Stack:** Vue 3 + TypeScript + Vite, `highlight.js` maison (langage `swift`), `useI18n`, tests `node --test`.

## Global Constraints

- Style d'écriture (tout contenu FR/EN et commentaires ajoutés) : jamais de tiret cadratin « — » ni de double tiret « -- » ; deux points, parenthèses ou nouvelle phrase. Ne pas introduire de nouveaux « — » même si `src/cheatsheets/swift.js` en contient déjà (ne pas toucher au contenu existant). Accents français corrects, aucun mojibake.
- Fichiers source UTF-8 : éditer avec Write/Edit uniquement, jamais via les cmdlets texte PowerShell 5.1 (corruption des accents).
- i18n : toute clé ajoutée doit exister dans `STRINGS.fr` ET `STRINGS.en` (test de parité).
- Import de `swiftcompare.js` depuis un fichier chargé par `node --test` (la cheatsheet) : relatif `'../swiftcompare.js'`, jamais l'alias `@/`.
- Le tableau comparatif doit scroller horizontalement dans son propre conteneur (`overflow-x: auto`), jamais faire déborder la page (responsive mobile).
- Langage de coloration des exemples : `swift`. Snippets courts (6 à 12 lignes), un concept.
- Catégorie inchangée : `swift` existe déjà, Swift est déjà dans le `not:` du playground. Ne PAS créer de catégorie ni toucher au playground.
- Tests : `npm test` (= `node --test`). Build : `npm run build` (= `vue-tsc --noEmit && vite build`).

---

## File Structure

- Create `src/swiftcompare.js` : données + `comparisonFor(id)`.
- Create `src/components/panels/CompareTablePanel.vue` : renderer générique (prop `id`).
- Create `src/components/panels/SwiftTypesPanel.vue`, `SwiftBindingsPanel.vue` : wrappers.
- Create `test/swiftcompare.test.js` : validation du modèle (couverture complète de la matrice).
- Modify `src/assets/styles/visualizers.css` : classes `cmp-*`.
- Modify `src/App.vue` : imports, `TABS`, `panels`.
- Modify `src/i18n.js` : `tabs.swifttypes`, `tabs.swiftbindings`, `cmp.when`, `cmp.code`, `cmp.notes`.
- Modify `src/cheatsheets/swift.js` : import relatif + 2 sections dérivées.

---

## Task 1: Modèle `swiftcompare.js` + validation + comparaison `types`

**Files:**
- Create: `src/swiftcompare.js`
- Test: `test/swiftcompare.test.js`

**Interfaces:**
- Produces:
  - `COMPARISONS: { types: Comparison, bindings: Comparison }`
  - `Comparison = { id, intro{fr,en}, candidates: Candidate[], dimensions: Dimension[], notes: {fr,en}[] }`
  - `Candidate = { id, label, code: string, when: {fr,en} }`
  - `Dimension = { id, label{fr,en}, cells: { [candidateId]: {fr,en} } }`
  - `comparisonFor(id): Comparison | null`

- [ ] **Step 1: Écrire le test de validation** (`test/swiftcompare.test.js`)

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COMPARISONS, comparisonFor } from '../src/swiftcompare.js';

const bilingual = (v, ctx) => {
  assert.ok(v && typeof v.fr === 'string' && typeof v.en === 'string', `${ctx}: non bilingue`);
  assert.ok(v.fr.trim().length > 2 && v.en.trim().length > 2, `${ctx}: trop court`);
};

test('les deux comparaisons existent', () => {
  assert.deepEqual(Object.keys(COMPARISONS).sort(), ['bindings', 'types']);
});

test('chaque comparaison est bien formée et la matrice est complète', () => {
  for (const key of Object.keys(COMPARISONS)) {
    const c = COMPARISONS[key];
    assert.equal(c.id, key, `${key}: id`);
    bilingual(c.intro, `${key}.intro`);

    assert.ok(Array.isArray(c.candidates) && c.candidates.length >= 2, `${key}: candidates`);
    const candIds = new Set();
    for (const cand of c.candidates) {
      assert.ok(!candIds.has(cand.id), `${key}: candidat dupliqué ${cand.id}`);
      candIds.add(cand.id);
      assert.ok(typeof cand.label === 'string' && cand.label.trim().length > 0, `${key}/${cand.id}: label`);
      assert.ok(typeof cand.code === 'string' && cand.code.trim().length > 10, `${key}/${cand.id}: code trop court`);
      bilingual(cand.when, `${key}/${cand.id}.when`);
    }

    assert.ok(Array.isArray(c.dimensions) && c.dimensions.length >= 3, `${key}: dimensions`);
    const dimIds = new Set();
    for (const d of c.dimensions) {
      assert.ok(!dimIds.has(d.id), `${key}: dimension dupliquée ${d.id}`);
      dimIds.add(d.id);
      bilingual(d.label, `${key}/${d.id}.label`);
      // Couverture complète : une cellule bilingue pour CHAQUE candidat.
      for (const cand of c.candidates) {
        bilingual(d.cells?.[cand.id], `${key}/${d.id}/cell[${cand.id}]`);
      }
    }

    assert.ok(Array.isArray(c.notes) && c.notes.length >= 1, `${key}: notes`);
    for (const n of c.notes) bilingual(n, `${key}.note`);
  }
});

test('comparisonFor', () => {
  assert.equal(comparisonFor('types')?.id, 'types');
  assert.equal(comparisonFor('bindings')?.id, 'bindings');
  assert.equal(comparisonFor('inconnu'), null);
});
```

- [ ] **Step 2: Lancer le test, vérifier l'échec**

Run: `npm test -- test/swiftcompare.test.js`
Expected: FAIL (module `src/swiftcompare.js` introuvable).

- [ ] **Step 3: Créer `src/swiftcompare.js` avec le squelette + la comparaison `types` complète**

La comparaison `types` ci-dessous est l'EXEMPLAIRE de format (complète). `bindings` est laissée en objet minimal à ce stade (remplie en Task 2), donc le test de la matrice ne passera pour `types` qu'après cette task et pour `bindings` qu'après la Task 2. Pour un rouge/vert propre : écrire `types` en entier maintenant, et mettre `bindings` en `{ id:'bindings', intro, candidates:[], dimensions:[], notes:[{...}] }` provisoire NE suffit pas (candidates >= 2 requis). À la place, envelopper les 2 sous-tests spécifiques à `bindings` : NON. Plus simple : écrire `types` complet ET un `bindings` complet minimal (2 candidats, 3 dimensions) suffisant pour passer le test dès la Task 1, puis Task 2 étoffe `bindings` à 6 candidats / 6 dimensions. C'est l'approche retenue : voir Step 3b.

```js
// Deux comparaisons Swift au format tableau (dimensions x candidats). Modèle
// pur (aucun import Vue), bilingue {fr, en} inline, testable sous node --test.

export const COMPARISONS = {
  types: {
    id: 'types',
    intro: {
      fr: 'Swift a trois familles de types nommés (struct, class, actor) plus l\'isolation @MainActor. Le choix décide de la sémantique de copie, de l\'identité et de la sécurité en concurrence.',
      en: 'Swift has three named type families (struct, class, actor) plus @MainActor isolation. The choice drives copy semantics, identity, and concurrency safety.',
    },
    candidates: [
      {
        id: 'struct',
        label: 'struct',
        code: `struct Point { var x = 0 }
var a = Point()
var b = a        // copie indépendante
b.x = 9
print(a.x, b.x)  // 0 9`,
        when: {
          fr: 'Modèles de données par valeur, immuables ou locaux : pas de partage, donc pas de course de données.',
          en: 'Value-type data models, immutable or local: no sharing, hence no data races.',
        },
      },
      {
        id: 'class',
        label: 'class',
        code: `class Box { var x = 0 }
let a = Box()
let b = a         // même instance (référence)
b.x = 9
print(a.x, b.x)   // 9 9`,
        when: {
          fr: 'Identité partagée, cycle de vie ou héritage nécessaires. Attention aux courses de données si mutée depuis plusieurs tâches.',
          en: 'Shared identity, lifecycle, or inheritance needed. Watch for data races if mutated from several tasks.',
        },
      },
      {
        id: 'actor',
        label: 'actor',
        code: `actor Counter { var n = 0
  func inc() { n += 1 } }
let c = Counter()
await c.inc()      // accès sérialisé
let v = await c.n  // hop d'acteur`,
        when: {
          fr: 'État mutable partagé entre tâches concurrentes : l\'acteur sérialise les accès et supprime les courses.',
          en: 'Mutable state shared across concurrent tasks: the actor serializes access and removes races.',
        },
      },
      {
        id: 'mainactor',
        label: '@MainActor class',
        code: `@MainActor
class VM: ObservableObject {
  @Published var title = ""
}
// tout accès est garanti sur le main thread`,
        when: {
          fr: 'État d\'interface qui doit vivre sur le main thread (ViewModels SwiftUI, UIKit).',
          en: 'UI state that must live on the main thread (SwiftUI ViewModels, UIKit).',
        },
      },
    ],
    dimensions: [
      { id: 'semantics', label: { fr: 'Sémantique', en: 'Semantics' }, cells: {
        struct: { fr: 'Valeur : chaque affectation copie.', en: 'Value: each assignment copies.' },
        class: { fr: 'Référence : affectation = même instance.', en: 'Reference: assignment = same instance.' },
        actor: { fr: 'Référence, mais état isolé.', en: 'Reference, but isolated state.' },
        mainactor: { fr: 'Référence (c\'est une class).', en: 'Reference (it is a class).' },
      } },
      { id: 'mutation', label: { fr: 'Mutation', en: 'Mutation' }, cells: {
        struct: { fr: '`mutating` sur une var ; la copie protège l\'original.', en: '`mutating` on a var; the copy protects the original.' },
        class: { fr: 'Directe ; visible par tous les détenteurs.', en: 'Direct; visible to every holder.' },
        actor: { fr: 'Directe en interne ; externe via `await`.', en: 'Direct inside; external via `await`.' },
        mainactor: { fr: 'Directe, mais uniquement sur le main.', en: 'Direct, but only on the main thread.' },
      } },
      { id: 'identity', label: { fr: 'Identité (===)', en: 'Identity (===)' }, cells: {
        struct: { fr: 'Non : pas de `===`.', en: 'No: no `===`.' },
        class: { fr: 'Oui : `===` compare les instances.', en: 'Yes: `===` compares instances.' },
        actor: { fr: 'Oui (type référence).', en: 'Yes (reference type).' },
        mainactor: { fr: 'Oui (type référence).', en: 'Yes (reference type).' },
      } },
      { id: 'threadsafe', label: { fr: 'Thread-safety', en: 'Thread safety' }, cells: {
        struct: { fr: 'Sûr : copies indépendantes.', en: 'Safe: independent copies.' },
        class: { fr: 'Non garanti : synchronisation manuelle.', en: 'Not guaranteed: manual synchronization.' },
        actor: { fr: 'Sûr : accès sérialisés par l\'acteur.', en: 'Safe: access serialized by the actor.' },
        mainactor: { fr: 'Sûr si on reste sur le main.', en: 'Safe as long as you stay on the main thread.' },
      } },
      { id: 'concurrency', label: { fr: 'Accès concurrent', en: 'Concurrent access' }, cells: {
        struct: { fr: 'Pas de partage, donc rien à protéger.', en: 'No sharing, nothing to protect.' },
        class: { fr: 'Course de données possible.', en: 'Data race possible.' },
        actor: { fr: '`await` requis depuis l\'extérieur.', en: '`await` required from outside.' },
        mainactor: { fr: '`await MainActor.run` hors du main.', en: '`await MainActor.run` off the main thread.' },
      } },
      { id: 'inheritance', label: { fr: 'Héritage', en: 'Inheritance' }, cells: {
        struct: { fr: 'Non (protocoles seulement).', en: 'No (protocols only).' },
        class: { fr: 'Oui.', en: 'Yes.' },
        actor: { fr: 'Non (protocoles seulement).', en: 'No (protocols only).' },
        mainactor: { fr: 'Oui (c\'est une class).', en: 'Yes (it is a class).' },
      } },
      { id: 'storage', label: { fr: 'Stockage', en: 'Storage' }, cells: {
        struct: { fr: 'Souvent en ligne / pile.', en: 'Often inline / stack.' },
        class: { fr: 'Tas + ARC.', en: 'Heap + ARC.' },
        actor: { fr: 'Tas + ARC.', en: 'Heap + ARC.' },
        mainactor: { fr: 'Tas + ARC.', en: 'Heap + ARC.' },
      } },
      { id: 'cost', label: { fr: 'Coût', en: 'Cost' }, cells: {
        struct: { fr: 'Copie (mais copy-on-write pour les collections).', en: 'Copy (but copy-on-write for collections).' },
        class: { fr: 'ARC retain/release.', en: 'ARC retain/release.' },
        actor: { fr: 'ARC + hops d\'acteur (suspensions).', en: 'ARC + actor hops (suspensions).' },
        mainactor: { fr: 'ARC + saut vers le main thread.', en: 'ARC + hop to the main thread.' },
      } },
    ],
    notes: [
      { fr: 'Règle par défaut : commencer par `struct`, passer à `class` quand l\'identité ou l\'héritage est nécessaire.', en: 'Default rule: start with `struct`, move to `class` when you need identity or inheritance.' },
      { fr: 'Un `actor` protège l\'état partagé sans verrou explicite ; le prix est l\'asynchronisme (`await`).', en: 'An `actor` protects shared state without an explicit lock; the price is asynchrony (`await`).' },
    ],
  },

  bindings: PLACEHOLDER_BINDINGS, // rempli au Step 3b puis étoffé en Task 2
};

export function comparisonFor(id) {
  return COMPARISONS[id] ?? null;
}
```

- [ ] **Step 3b: Écrire un `bindings` minimal valide** pour que le test passe dès la Task 1.

Remplacer `PLACEHOLDER_BINDINGS` par un objet `bindings` COMPLET mais réduit (2 candidats, 3 dimensions) qui passe le test. Task 2 l\'étoffera à 6 candidats / 6 dimensions. Écrire directement, par exemple :

```js
  bindings: {
    id: 'bindings',
    intro: {
      fr: 'SwiftUI expose plusieurs property wrappers pour relier une vue à son état. Ils diffèrent par ce qu\'ils possèdent et par le moment où la vue redessine.',
      en: 'SwiftUI exposes several property wrappers to bind a view to its state. They differ in what they own and when the view redraws.',
    },
    candidates: [
      {
        id: 'state',
        label: '@State',
        code: `struct V: View {
  @State private var count = 0
  var body: some View { Button("\\(count)") { count += 1 } }
}`,
        when: {
          fr: 'Petit état de valeur possédé par la vue elle-même.',
          en: 'Small value state owned by the view itself.',
        },
      },
      {
        id: 'binding',
        label: '@Binding',
        code: `struct Child: View {
  @Binding var on: Bool
  var body: some View { Toggle("", isOn: $on) }
}`,
        when: {
          fr: 'Lire et écrire un état possédé par un parent (pas une copie).',
          en: 'Read and write state owned by a parent (not a copy).',
        },
      },
    ],
    dimensions: [
      { id: 'role', label: { fr: 'Rôle', en: 'Role' }, cells: {
        state: { fr: 'Possède un état de valeur simple.', en: 'Owns a simple value state.' },
        binding: { fr: 'Référence en lecture/écriture vers l\'état d\'un parent.', en: 'Read/write reference to a parent state.' },
      } },
      { id: 'observes', label: { fr: 'Type observé', en: 'Observed type' }, cells: {
        state: { fr: 'Une valeur.', en: 'A value.' },
        binding: { fr: 'Une valeur, via la source du parent.', en: 'A value, via the parent source.' },
      } },
      { id: 'since', label: { fr: 'Disponible depuis', en: 'Available since' }, cells: {
        state: { fr: 'iOS 13.', en: 'iOS 13.' },
        binding: { fr: 'iOS 13.', en: 'iOS 13.' },
      } },
    ],
    notes: [
      { fr: 'Source de vérité unique : un seul wrapper possède l\'état, les autres le référencent.', en: 'Single source of truth: one wrapper owns the state, the others reference it.' },
    ],
  },
```

- [ ] **Step 4: Lancer le test**

Run: `npm test -- test/swiftcompare.test.js`
Expected: PASS (types complet, bindings minimal valide, matrices complètes).

- [ ] **Step 5: Lancer la suite complète** avant commit.

Run: `npm test`
Expected: tout vert.

- [ ] **Step 6: Commit**

```bash
git add src/swiftcompare.js test/swiftcompare.test.js
git commit -m "feat(swift): modèle swiftcompare.js + validation + comparaison types"
```

---

## Task 2: Étoffer la comparaison `bindings` (6 candidats / 6 dimensions)

**Files:**
- Modify: `src/swiftcompare.js` (remplacer le `bindings` minimal par la version complète)

**Interfaces:**
- Consumes: le schéma `Comparison` de la Task 1.
- Produces: `COMPARISONS.bindings` avec 6 candidats et 6 dimensions, matrice complète.

- [ ] **Step 1: Remplacer l\'objet `bindings`** par la version complète. Candidats (ids/labels imposés) :
  `state`=@State, `binding`=@Binding, `stateobject`=@StateObject, `observed`=@ObservedObject, `environment`=@EnvironmentObject, `observable`=@Observable + @State.

  Chaque candidat : `code` Swift court + `when{fr,en}`. Briefs de code :
  - `state` : `@State private var count = 0` dans une vue, bouton qui incrémente.
  - `binding` : enfant `@Binding var on: Bool`, `Toggle(isOn: $on)`.
  - `stateobject` : `@StateObject private var vm = VM()` (instancié une fois, survit aux re-render).
  - `observed` : `@ObservedObject var vm: VM` (reçu du parent ; NE le crée PAS inline sinon reset).
  - `environment` : `@EnvironmentObject var session: Session` (injecté par un ancêtre via `.environmentObject(...)`).
  - `observable` : `@Observable final class VM { var count = 0 }` consommé par `@State private var vm = VM()` (Observation, iOS 17).

  Dimensions (ids imposés) et intention de chaque cellule (écrire fr ET en, une par candidat) :
  - `role` : @State possède un état valeur ; @Binding pipe vers un parent ; @StateObject possède un ObservableObject ; @ObservedObject observe un objet possédé ailleurs ; @EnvironmentObject lit un objet injecté ; @Observable+@State possède un type @Observable.
  - `observes` : valeur / valeur via binding / `ObservableObject` (class) / `ObservableObject` / `ObservableObject` / classe `@Observable`.
  - `ownership` : créé et gardé par la vue ; aucune propriété (référence) ; instancié une fois, survit aux re-render ; ne possède pas (peut être recréé) ; fourni par un ancêtre ; l\'instance @Observable est gardée par @State.
  - `updates` : à chaque changement de la valeur ; via la source du parent ; sur `objectWillChange`/`@Published` ; idem ; idem ; sur accès aux seules propriétés lues (granularité fine).
  - `pitfall` : (aucun notable) ; (aucun) ; (aucun) ; reset si l\'objet est créé inline dans le parent ; crash à l\'exécution si l\'objet d\'environnement est absent ; oublier `@State` recrée l\'instance à chaque render.
  - `since` : iOS 13 / 13 / 14 / 13 / 13 / 17.

  Note(s) `notes` : par ex. « Depuis iOS 17, `@Observable` + `@State` remplace le couple `@StateObject`/`@ObservedObject` et n\'observe que les propriétés réellement lues. » (bilingue).

  Respecter le style (pas de « — » ni « -- », accents corrects). Cellules courtes.

- [ ] **Step 2: Lancer le test**

Run: `npm test -- test/swiftcompare.test.js`
Expected: PASS (bindings : 6 candidats, 6 dimensions, matrice complète).

- [ ] **Step 3: Commit**

```bash
git add src/swiftcompare.js
git commit -m "feat(swift): comparaison bindings complète (@State..@Observable)"
```

---

## Task 3: `CompareTablePanel.vue` + 2 wrappers + CSS `cmp-*`

**Files:**
- Create: `src/components/panels/CompareTablePanel.vue`
- Create: `src/components/panels/SwiftTypesPanel.vue`
- Create: `src/components/panels/SwiftBindingsPanel.vue`
- Modify: `src/assets/styles/visualizers.css` (bloc `cmp-*`)

**Interfaces:**
- Consumes: `comparisonFor` de `src/swiftcompare.js`, `highlight` de `src/highlight.js`, `useI18n`.
- Produces: composants `SwiftTypesPanel` / `SwiftBindingsPanel` (props `cat`, `query`).

- [ ] **Step 1: Créer `CompareTablePanel.vue`** (déclaratif, modèle CheatsheetPanel)

```vue
<script setup>
import { computed } from 'vue';
import { comparisonFor } from '@/swiftcompare.js';
import { highlight } from '@/highlight.js';
import { useI18n } from '@/composables/useI18n';

// Tableau comparatif générique (dimensions x candidats) + code de référence.
// `id` vient d'un wrapper court (un par comparaison).
const props = defineProps({
  id: { type: String, required: true },
  cat: { type: String, default: 'swift' },
  query: { type: String, default: '' },
});

const { t, locale } = useI18n();
const L = (v) => v?.[locale.value] ?? v?.fr ?? '';

const cmp = computed(() => comparisonFor(props.id));
</script>

<template>
  <section v-if="cmp" class="panel cmp-panel">
    <p class="cmp-intro">{{ L(cmp.intro) }}</p>

    <div class="cmp-scroll">
      <table class="cmp-table">
        <thead>
          <tr>
            <th></th>
            <th v-for="c in cmp.candidates" :key="c.id" class="cmp-cand">{{ c.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in cmp.dimensions" :key="d.id">
            <th scope="row" class="cmp-dim">{{ L(d.label) }}</th>
            <td v-for="c in cmp.candidates" :key="c.id">{{ L(d.cells[c.id]) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="cmp-h">{{ t('cmp.code') }}</h3>
    <div class="cmp-cards">
      <article v-for="c in cmp.candidates" :key="c.id" class="cmp-card">
        <header class="cmp-card-head"><code>{{ c.label }}</code></header>
        <pre class="cmp-code"><code v-html="highlight(c.code, 'swift')"></code></pre>
        <p class="cmp-when"><b>{{ t('cmp.when') }} :</b> {{ L(c.when) }}</p>
      </article>
    </div>

    <h3 class="cmp-h">{{ t('cmp.notes') }}</h3>
    <ul class="cmp-notes">
      <li v-for="(n, i) in cmp.notes" :key="i">{{ L(n) }}</li>
    </ul>
  </section>
</template>
```

- [ ] **Step 2: Créer les 2 wrappers** (précédent CorsPanel)

`SwiftTypesPanel.vue` :
```vue
<script setup>
import CompareTablePanel from './CompareTablePanel.vue';
defineProps({ cat: { type: String, default: 'swift' }, query: { type: String, default: '' } });
</script>
<template>
  <CompareTablePanel id="types" :cat="cat" :query="query" />
</template>
```

`SwiftBindingsPanel.vue` : identique mais `id="bindings"`.

- [ ] **Step 3: Ajouter le bloc CSS `cmp-*`** dans `src/assets/styles/visualizers.css`, juste après le bloc `pat-*` (design patterns). Réutiliser les variables sémantiques existantes (`--border`, `--inset`, `--muted`, `--ink`, `--ink-2`, `--accent`, `--chip`) ; ne pas coder de couleur en dur (hors `color: white` déjà utilisé par les en-têtes actifs du fichier, à éviter ici). Doit fonctionner en clair et sombre.

```css
/* ------------------------------------------------------- comparison tables */
.cmp-intro { color: var(--ink-2); margin-bottom: 1rem; }
.cmp-scroll { overflow-x: auto; margin-bottom: 1.2rem; }
.cmp-table { border-collapse: collapse; width: 100%; font-size: 0.9rem; }
.cmp-table th,
.cmp-table td {
  border: 1px solid var(--border);
  padding: 0.5rem 0.7rem;
  text-align: left;
  vertical-align: top;
}
.cmp-table thead th { background: var(--inset); }
.cmp-cand { font-family: var(--mono); white-space: nowrap; }
.cmp-dim { background: var(--inset); font-weight: 600; white-space: nowrap; }
.cmp-h { margin: 1.2rem 0 0.6rem; }
.cmp-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.9rem;
}
.cmp-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.7rem;
  background: var(--inset);
}
.cmp-card-head { margin-bottom: 0.4rem; }
.cmp-card-head code { font-family: var(--mono); color: var(--accent); }
.cmp-code { margin: 0 0 0.5rem; overflow-x: auto; }
.cmp-when { font-size: 0.85rem; color: var(--ink-2); }
.cmp-notes { margin: 0.4rem 0 0 1.1rem; color: var(--ink-2); }
.cmp-notes li { margin-bottom: 0.3rem; }
```

Note : vérifier les noms de variables réellement présents dans `visualizers.css` (`--ink-2`, `--chip`, `--inset`, etc.). Si l\'une n\'existe pas, la remplacer par la variable équivalente utilisée par les blocs `cs-*` / `pat-*` voisins. Ne pas inventer de nouvelle variable de couleur.

- [ ] **Step 4: Vérifier le build**

Run: `npm run build`
Expected: build OK (vue-tsc sans erreur). Corriger toute erreur de type avant de committer.

- [ ] **Step 5: Commit**

```bash
git add src/components/panels/CompareTablePanel.vue src/components/panels/SwiftTypesPanel.vue src/components/panels/SwiftBindingsPanel.vue src/assets/styles/visualizers.css
git commit -m "feat(swift): CompareTablePanel générique + wrappers + styles cmp-*"
```

---

## Task 4: Câblage `App.vue`

**Files:**
- Modify: `src/App.vue` (imports, `TABS`, `panels`)

**Interfaces:**
- Consumes: les 2 wrappers de la Task 3, les clés i18n de la Task 5 (ajoutées ensuite ; à l\'exécution les libellés d\'onglet manquants s\'afficheraient vides jusqu\'à la Task 5, mais le build n\'en dépend pas).

- [ ] **Step 1: Importer les 2 wrappers** (bloc d\'imports des panels)

```ts
import SwiftTypesPanel from '@/components/panels/SwiftTypesPanel.vue'
import SwiftBindingsPanel from '@/components/panels/SwiftBindingsPanel.vue'
```

- [ ] **Step 2: Ajouter les 2 entrées `TABS`** juste après l\'entrée `swiftstate` (cohérence thématique état/bindings)

```ts
{ mode: 'swifttypes', key: 'tabs.swifttypes', cat: 'swift' },
{ mode: 'swiftbindings', key: 'tabs.swiftbindings', cat: 'swift' },
```

- [ ] **Step 3: Enregistrer les 2 modes dans `panels`**

```ts
swifttypes: SwiftTypesPanel,
swiftbindings: SwiftBindingsPanel,
```

- [ ] **Step 4: Vérifier le build**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 5: Commit**

```bash
git add src/App.vue
git commit -m "feat(swift): câblage des 2 onglets comparatifs dans App.vue"
```

---

## Task 5: i18n FR/EN (`src/i18n.js`)

**Files:**
- Modify: `src/i18n.js` (STRINGS.fr et STRINGS.en)

**Interfaces:**
- Produces les clés consommées par les panneaux (`cmp.*`) et les onglets (`tabs.swifttypes`, `tabs.swiftbindings`).

- [ ] **Step 1: Ajouter les clés dans `STRINGS.en`** (près des `tabs.*` et d\'un petit groupe `cmp.*`)

```js
'tabs.swifttypes': 'Types (struct/class/actor)',
'tabs.swiftbindings': 'SwiftUI bindings',
'cmp.when': 'When to use',
'cmp.code': 'Example',
'cmp.notes': 'Takeaways',
```

- [ ] **Step 2: Ajouter les MÊMES clés dans `STRINGS.fr`**

```js
'tabs.swifttypes': 'Types (struct/class/actor)',
'tabs.swiftbindings': 'Bindings SwiftUI',
'cmp.when': 'Quand l\'utiliser',
'cmp.code': 'Exemple',
'cmp.notes': 'À retenir',
```

- [ ] **Step 3: Lancer le test de parité i18n**

Run: `npm test -- test/i18n.test.js`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/i18n.js
git commit -m "feat(swift): clés i18n FR/EN (onglets comparatifs + libellés)"
```

---

## Task 6: Extension dérivée de la cheatsheet Swift

**Files:**
- Modify: `src/cheatsheets/swift.js` (import relatif + 2 sections dérivées)

**Interfaces:**
- Consumes: `comparisonFor` de `src/swiftcompare.js`.
- Produces: 2 nouvelles sections dans la feuille `swift`.

- [ ] **Step 1: Ajouter l\'import relatif en tête de `src/cheatsheets/swift.js`**

```js
import { comparisonFor } from '../swiftcompare.js';
```

- [ ] **Step 2: Ajouter le helper et les 2 sections à la FIN du tableau `sections`** (avant la parenthèse fermante `]` de `sections`). Définir le helper juste avant l\'`export default` :

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

Puis, dans `sections: [ ... ]`, ajouter en dernier :

```js
    compareSection('types', 'swift-types-compare', 'Types : struct / class / actor', 'Types: struct / class / actor'),
    compareSection('bindings', 'swift-bindings-compare', 'Bindings SwiftUI', 'SwiftUI bindings'),
```

Détails : la section `types` produit 4 items (struct, class, actor, @MainActor class), la section `bindings` 6 items (@State ... @Observable). Tous respectent les seuils du test (items >= 3 par section, `note`/`code` assez longs, ids uniques via le préfixe `cs-swift-`). Ne pas modifier les sections existantes.

- [ ] **Step 3: Lancer les tests cheatsheets**

Run: `npm test -- test/cheatsheets.test.js`
Expected: PASS (feuille swift bien formée, items dérivés valides, total d\'items augmenté).

- [ ] **Step 4: Lancer la suite complète + build**

Run: `npm test && npm run build`
Expected: tout vert ; build OK.

- [ ] **Step 5: Commit**

```bash
git add src/cheatsheets/swift.js
git commit -m "feat(swift): sections cheatsheet dérivées (types + bindings) pour Ctrl+K"
```

---

## Task 7: Vérification finale (suite + app réelle)

**Files:** aucun (vérification).

- [ ] **Step 1: Suite complète**

Run: `npm test`
Expected: tous les tests verts (dont `swiftcompare.test.js`, `i18n.test.js`, `cheatsheets.test.js`).

- [ ] **Step 2: Build de production**

Run: `npm run build`
Expected: `vue-tsc --noEmit` sans erreur puis build Vite OK (seul le warning de taille de chunk préexistant est toléré).

- [ ] **Step 3: Vérification runtime légère** (Node, pipeline du panneau)

Créer un script temporaire dans la racine du repo qui importe `comparisonFor` et `highlight`, et pour chaque comparaison ('types','bindings') et chaque locale (fr,en) vérifie : intro non vide, chaque cellule `dimensions[].cells[cand]` non vide, `highlight(candidate.code,'swift')` renvoie du HTML non vide sans `undefined`. Lancer avec `node`, afficher PASS/FAIL, puis supprimer le script. (Exercice du chemin exact rendu par CompareTablePanel, sans navigateur.)

- [ ] **Step 4: Vérification visuelle** (`npm run dev`, http://localhost:5173)
  - Catégorie Swift : les onglets « Types (struct/class/actor) » et « Bindings SwiftUI » apparaissent après « swiftstate ».
  - Le tableau s\'affiche, scrolle horizontalement si trop large, les blocs code sont colorés (swift), les notes s\'affichent.
  - Bascule FR/EN : intro, cellules, libellés (`cmp.*`) et « quand l\'utiliser » suivent la langue.
  - Ctrl+K « @Observable » ou « actor » : trouve les items dérivés dans la cheatsheet Swift.

- [ ] **Step 5: Commit éventuel** (si un ajustement a été nécessaire)

```bash
git add -A
git commit -m "test(swift): vérification suite + app pour les onglets comparatifs"
```

---

## Self-Review (rempli par l'auteur du plan)

- Couverture spec : modèle types (T1) + bindings (T2) ; panneau + wrappers + CSS cmp-* (T3, la leçon « ne pas oublier le CSS » des design patterns est intégrée dès cette task) ; câblage App (T4) ; i18n (T5) ; cheatsheet dérivée (T6) ; vérif finale (T7). Tous les points de la spec ont une tâche.
- Placeholders : `types` est écrit intégralement (exemplaire) ; `bindings` a un objet minimal valide en T1 puis un brief précis (ids, intention de chaque cellule, briefs de code, dispo iOS) en T2, complétude verrouillée par `swiftcompare.test.js` (matrice complète : une cellule bilingue par candidat pour chaque dimension). Le seul « PLACEHOLDER_BINDINGS » du Step 3 est explicitement remplacé au Step 3b.
- Cohérence des types : `Comparison`/`Candidate`/`Dimension` cohérents entre `swiftcompare.js`, le test, `CompareTablePanel` (lit `cmp.candidates`, `cmp.dimensions`, `d.cells[c.id]`, `c.code`, `c.when`, `cmp.notes`) et la cheatsheet (`comparisonFor(id).candidates`). Modes `swifttypes`/`swiftbindings` identiques entre `TABS`, `panels`, imports et clés i18n `tabs.*`.
