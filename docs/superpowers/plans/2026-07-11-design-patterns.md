# Design Patterns Category Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une catégorie « Design Patterns » à Concretely : 16 patterns GoF présentés en fiches de référence (intention, problème, solution, quand l'utiliser, pièges, pseudo-code coloré, un exemple par langage) sur 3 onglets par famille.

**Architecture:** Un modèle JS pur `src/patterns.js` (source de vérité, testable en Node) alimente un panneau Vue générique `PatternsPanel.vue` paramétré par `family`, exposé via 3 wrappers courts (précédent TracePanel). Câblage standard dans `App.vue` (CATEGORIES / TABS / `panels`), i18n FR/EN à parité, et une cheatsheet dérivée des données pour la recherche Ctrl+K.

**Tech Stack:** Vue 3 + TypeScript + Vite, `highlight.js` maison, composable partagé `useCodeLang`, tests `node --test`.

## Global Constraints

- Style d'écriture (tout contenu FR/EN et commentaires) : jamais de tiret cadratin « — » ni de double tiret « -- » ; deux points, parenthèses ou nouvelle phrase à la place. Accents français corrects partout.
- Ne jamais éditer un fichier source UTF-8 via les cmdlets texte PowerShell 5.1 (mojibake) : utiliser Write / Edit.
- i18n : toute clé ajoutée doit exister dans `STRINGS.fr` ET `STRINGS.en` (le test `i18n.test.js` échoue sinon).
- Langages des exemples, ordre imposé : `js, java, swift, go, php, ruby, csharp`.
- Familles, ordre imposé : `creational, structural, behavioral`. Répartition finale 4 / 5 / 7 (total 16).
- Tests lancés avec `npm test` (= `node --test`). Build : `npm run build` (= `vue-tsc --noEmit && vite build`).

---

## File Structure

- Create `src/patterns.js` : données + helpers (`FAMILIES`, `PATTERNS`, `patternsByFamily`).
- Create `src/components/panels/PatternsPanel.vue` : renderer déclaratif générique (prop `family`).
- Create `src/components/panels/PatternsCreationalPanel.vue`, `PatternsStructuralPanel.vue`, `PatternsBehavioralPanel.vue` : wrappers.
- Create `src/cheatsheets/patterns.js` : cheatsheet dérivée de `PATTERNS`.
- Create `test/patterns.test.js` : validation du modèle.
- Modify `src/App.vue` : imports, `CATEGORIES`, `TABS`, `panels`, `not:` playground.
- Modify `src/i18n.js` : `cat.patterns`, `tabs.patterns*`, `pat.*`.
- Modify `src/cheatsheets/index.js` : enregistrer `patterns`.
- Modify `test/cheatsheets.test.js` : ajouter `'patterns'` à `CATS`.

---

## Task 1: Modèle `patterns.js` + validation + famille Creational (4)

**Files:**
- Create: `src/patterns.js`
- Test: `test/patterns.test.js`

**Interfaces:**
- Produces:
  - `FAMILIES: string[]` = `['creational','structural','behavioral']`
  - `PATTERNS: Pattern[]` où `Pattern = { id, family, name{fr,en}, tagline{fr,en}, problem{fr,en}, solution{fr,en}, when{fr,en}, pitfalls{fr,en}, pseudo: string, code: { js, java, swift, go, php, ruby, csharp } }`
  - `patternsByFamily(fam: string): Pattern[]`

- [ ] **Step 1: Écrire le test de validation** (`test/patterns.test.js`)

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PATTERNS, FAMILIES, patternsByFamily } from '../src/patterns.js';

const LANGS = ['js', 'java', 'swift', 'go', 'php', 'ruby', 'csharp'];
const bilingual = (v, id, field) => {
  assert.ok(v && typeof v.fr === 'string' && typeof v.en === 'string', `${id}: ${field} non bilingue`);
  assert.ok(v.fr.trim().length > 2 && v.en.trim().length > 2, `${id}: ${field} trop court`);
};

test('familles dans l\'ordre imposé', () => {
  assert.deepEqual(FAMILIES, ['creational', 'structural', 'behavioral']);
});

test('chaque pattern est bien formé', () => {
  const ids = new Set();
  for (const p of PATTERNS) {
    assert.ok(!ids.has(p.id), `id dupliqué: ${p.id}`);
    ids.add(p.id);
    assert.ok(FAMILIES.includes(p.family), `${p.id}: famille invalide`);
    for (const f of ['name', 'tagline', 'problem', 'solution', 'when', 'pitfalls']) bilingual(p[f], p.id, f);
    assert.ok(typeof p.pseudo === 'string' && p.pseudo.trim().length > 10, `${p.id}: pseudo trop court`);
    for (const l of LANGS) {
      assert.ok(typeof p.code?.[l] === 'string' && p.code[l].trim().length > 10, `${p.id}: code ${l} manquant/trop court`);
    }
  }
});

test('répartition 4 / 5 / 7, total 16', () => {
  assert.equal(patternsByFamily('creational').length, 4);
  assert.equal(patternsByFamily('structural').length, 5);
  assert.equal(patternsByFamily('behavioral').length, 7);
  assert.equal(PATTERNS.length, 16);
});
```

- [ ] **Step 2: Lancer le test, vérifier l'échec**

Run: `npm test -- test/patterns.test.js` (ou `node --test test/patterns.test.js`)
Expected: FAIL (module `src/patterns.js` introuvable).

- [ ] **Step 3: Créer `src/patterns.js` avec le squelette + les 4 patterns Creational**

Écrire l'en-tête et les helpers, puis les 4 patterns creational. Le pattern **Singleton** ci-dessous est l'exemplaire complet montrant le format EXACT à suivre pour tous les autres (mêmes champs, code court et lisible, un seul concept par snippet). Les 3 autres creational suivent le même moule à partir des briefs fournis.

```js
// Design patterns GoF, présentés en fiches de référence. Modèle pur (aucun
// import Vue) : testable en Node. Tout le texte humain est bilingue {fr, en}.

export const FAMILIES = ['creational', 'structural', 'behavioral'];

export const PATTERNS = [
  {
    id: 'singleton',
    family: 'creational',
    name: { fr: 'Singleton', en: 'Singleton' },
    tagline: {
      fr: 'Garantir une seule instance et un point d\'accès global à celle-ci.',
      en: 'Ensure a class has one instance and a global access point to it.',
    },
    problem: {
      fr: 'Plusieurs parties du code créent chacune leur propre objet (connexion, config, cache) alors qu\'une seule instance partagée est voulue.',
      en: 'Several parts of the code each create their own object (connection, config, cache) when a single shared instance is intended.',
    },
    solution: {
      fr: 'Rendre le constructeur privé et exposer une méthode qui crée l\'instance au premier appel puis renvoie toujours la même.',
      en: 'Make the constructor private and expose a method that creates the instance on first call, then always returns the same one.',
    },
    when: {
      fr: 'Une ressource réellement unique (config appli, pool de connexions). À éviter comme variable globale déguisée : nuit aux tests.',
      en: 'A truly unique resource (app config, connection pool). Avoid it as a disguised global: it hurts testability.',
    },
    pitfalls: {
      fr: 'État global caché, couplage fort, problèmes de concurrence à l\'initialisation, tests difficiles à isoler.',
      en: 'Hidden global state, tight coupling, init-time concurrency issues, tests hard to isolate.',
    },
    pseudo: [
      'class Singleton',
      '    private static instance = null',
      '    private constructor() { }',
      '    static getInstance():',
      '        if instance is null:',
      '            instance = new Singleton()',
      '        return instance',
    ].join('\n'),
    code: {
      js: [
        'class Config {',
        '  static #instance;',
        '  static get() {',
        '    if (!Config.#instance) Config.#instance = new Config();',
        '    return Config.#instance;',
        '  }',
        '}',
        'Config.get() === Config.get(); // true',
      ].join('\n'),
      java: [
        'public final class Config {',
        '  private static Config instance;',
        '  private Config() {}',
        '  public static synchronized Config get() {',
        '    if (instance == null) instance = new Config();',
        '    return instance;',
        '  }',
        '}',
      ].join('\n'),
      swift: [
        'final class Config {',
        '  static let shared = Config()',
        '  private init() {}',
        '}',
        '// Config.shared est unique et thread-safe (let statique).',
      ].join('\n'),
      go: [
        'package config',
        'import "sync"',
        'var (instance *Config; once sync.Once)',
        'func Get() *Config {',
        '  once.Do(func() { instance = &Config{} })',
        '  return instance',
        '}',
      ].join('\n'),
      php: [
        'final class Config {',
        '  private static ?Config $instance = null;',
        '  private function __construct() {}',
        '  public static function get(): Config {',
        '    return self::$instance ??= new self();',
        '  }',
        '}',
      ].join('\n'),
      ruby: [
        'require "singleton"',
        'class Config',
        '  include Singleton',
        'end',
        'Config.instance.equal?(Config.instance) # => true',
      ].join('\n'),
      csharp: [
        'public sealed class Config {',
        '  private static readonly Config _instance = new Config();',
        '  private Config() {}',
        '  public static Config Instance => _instance;',
        '}',
      ].join('\n'),
    },
  },

  // --- Factory Method ---------------------------------------------------
  // Brief:
  //   tagline FR: « Déléguer la création d'objets à des sous-classes via une méthode dédiée. »
  //           EN: "Let subclasses decide which concrete object a creation method returns."
  //   problem: du code fait `new Concret()` en dur partout, impossible de varier le type produit sans le modifier.
  //   solution: une méthode `create()` surchargée par sous-classe renvoie le bon produit derrière une interface commune.
  //   when: quand le type exact à instancier dépend du contexte/sous-classe ; alternative aux gros `switch` de construction.
  //   pitfalls: prolifération de sous-classes pour de petites variations.
  //   code: interface `Button` + `create()` renvoyant `WinButton`/`WebButton` selon la fabrique. Court (~8 lignes/langue).
  //   pseudo: abstract Creator.create() -> Product ; ConcreteCreator override.
  { id: 'factory-method', family: 'creational', /* ...mêmes champs que singleton... */ },

  // --- Builder ----------------------------------------------------------
  // Brief:
  //   tagline FR: « Construire un objet complexe étape par étape via une API fluide. »
  //           EN: "Build a complex object step by step with a fluent API."
  //   problem: constructeur télescopique (10 paramètres, plein d'optionnels).
  //   solution: un builder avec des setters chaînés puis `build()`.
  //   when: objets à nombreux champs optionnels/immuables (requête HTTP, config).
  //   pitfalls: surcouche inutile pour des objets simples.
  //   code: `new BurgerBuilder().cheese().bacon().build()`.
  { id: 'builder', family: 'creational', /* ... */ },

  // --- Abstract Factory -------------------------------------------------
  // Brief:
  //   tagline FR: « Créer des familles d'objets liés sans coupler au code concret. »
  //           EN: "Create families of related objects without binding to concretes."
  //   problem: produire des composants cohérents (Bouton + Case) pour un thème donné (clair/sombre).
  //   solution: une interface fabrique par famille (`UIFactory`) avec `createButton()`/`createCheckbox()`.
  //   when: plusieurs familles de produits interchangeables (thèmes, OS, drivers).
  //   pitfalls: ajouter un nouveau type de produit oblige à toucher toutes les fabriques.
  //   code: `LightFactory`/`DarkFactory` implémentent `UIFactory`.
  { id: 'abstract-factory', family: 'creational', /* ... */ },
];

export function patternsByFamily(fam) {
  return PATTERNS.filter((p) => p.family === fam);
}
```

Remplir intégralement `factory-method`, `builder`, `abstract-factory` en suivant EXACTEMENT le moule de `singleton` (tous les champs bilingues, `pseudo`, et les 7 langages) à partir des briefs en commentaire. Chaque snippet de langage : court (6 à 12 lignes), un seul concept, compilable de tête. Pas de tiret cadratin dans les textes.

- [ ] **Step 4: Lancer le test**

Run: `npm test -- test/patterns.test.js`
Expected: le test de forme passe pour les 4 entrées ; le test « répartition 4 / 5 / 7 » ÉCHOUE encore (structural/behavioral vides). C'est attendu jusqu'à la Task 3.

Note : pour un rouge/vert propre, adapter temporairement l'assertion de total, ou accepter l'échec du seul test de comptage jusqu'à la Task 3. Ne PAS committer avec un test rouge : committer la Task 1 seulement une fois le test de forme vert (le test de comptage sera satisfait en fin de Task 3 ; jusque-là, marquer ce test `test.skip` avec un commentaire « réactivé en Task 3 » puis le réactiver).

- [ ] **Step 5: Commit**

```bash
git add src/patterns.js test/patterns.test.js
git commit -m "feat(patterns): modèle patterns.js + validation + famille Creational (4)"
```

---

## Task 2: Famille Structural (5)

**Files:**
- Modify: `src/patterns.js` (ajouter 5 entrées `family: 'structural'`)

**Interfaces:**
- Consumes: le schéma `Pattern` de la Task 1.
- Produces: 5 patterns structural dans `PATTERNS`.

- [ ] **Step 1: Ajouter les 5 patterns structural** en suivant le moule `singleton`. Briefs :

  - `adapter` : tagline FR « Faire collaborer deux interfaces incompatibles via un adaptateur. » / EN "Make two incompatible interfaces work together via an adapter." problem: une classe attend `Itarget` mais on a un service à l'API différente. solution: un wrapper qui traduit les appels. when: intégrer une lib tierce/legacy. pitfalls: empiler les adaptateurs masque la dette. code: `SocketAdapter` traduisant `oldRequest()` vers `request()`.
  - `decorator` : tagline FR « Ajouter des comportements dynamiquement en emballant l'objet. » / EN "Add behavior dynamically by wrapping the object." problem: sous-classes explosent pour combiner des options. solution: des wrappers qui implémentent la même interface et délèguent + ajoutent. when: combinaisons de fonctionnalités (flux compressé + chiffré). pitfalls: chaînes de wrappers difficiles à déboguer. code: `Milk(Coffee())` renvoie coût cumulé.
  - `facade` : tagline FR « Offrir une interface simple par-dessus un sous-système complexe. » / EN "Provide a simple interface over a complex subsystem." problem: le client doit orchestrer 5 classes bas niveau. solution: une classe façade avec une méthode simple. when: simplifier une API compliquée. pitfalls: la façade devient un objet-dieu. code: `MediaFacade.play(file)` cache codec/buffer/audio.
  - `proxy` : tagline FR « Contrôler l'accès à un objet (lazy, cache, sécurité). » / EN "Control access to an object (lazy loading, caching, protection)." problem: l'objet réel est coûteux ou sensible. solution: un proxy de même interface qui intercepte les appels. when: lazy-loading d'image, cache, contrôle d'accès. pitfalls: latence/indirection cachée. code: `ImageProxy` charge l'image au premier `display()`.
  - `composite` : tagline FR « Traiter uniformément objets simples et compositions en arbre. » / EN "Treat individual objects and compositions uniformly as a tree." problem: distinguer feuille et branche partout dans le code. solution: une interface commune `Component` avec `add()`/`operation()`. when: arborescences (fichiers/dossiers, UI). pitfalls: interface trop générale (feuilles avec `add()` vide). code: `Folder` contient `File`/`Folder`, `size()` récursif.

- [ ] **Step 2: Lancer le test**

Run: `npm test -- test/patterns.test.js`
Expected: test de forme vert pour les 9 entrées ; comptage structural == 5 vert.

- [ ] **Step 3: Commit**

```bash
git add src/patterns.js
git commit -m "feat(patterns): famille Structural (Adapter, Decorator, Facade, Proxy, Composite)"
```

---

## Task 3: Famille Behavioral (7) + réactiver le test de comptage

**Files:**
- Modify: `src/patterns.js` (ajouter 7 entrées `family: 'behavioral'`)
- Modify: `test/patterns.test.js` (retirer le `test.skip` du comptage total)

**Interfaces:**
- Consumes: schéma `Pattern`.
- Produces: `PATTERNS.length === 16`, familles 4 / 5 / 7.

- [ ] **Step 1: Ajouter les 7 patterns behavioral** (moule `singleton`). Briefs :

  - `strategy` : tagline FR « Interchanger des algorithmes derrière une interface commune. » / EN "Swap algorithms behind a common interface." problem: gros `if/switch` pour choisir un calcul. solution: chaque algo = une classe stratégie ; le contexte en tient une. when: variantes d'un même traitement (tri, prix, paiement). pitfalls: multiplication de petites classes. code: `Cart.setStrategy(Paypal()).pay()`.
  - `observer` : tagline FR « Notifier automatiquement des abonnés lors d'un changement. » / EN "Notify subscribers automatically when state changes." problem: coupler l'émetteur à chaque destinataire. solution: sujet gère une liste d'observers et les `notify()`. when: événements, UI réactive, pub/sub. pitfalls: fuites mémoire si on ne se désabonne pas. code: `subject.subscribe(fn); subject.emit(x)`.
  - `command` : tagline FR « Encapsuler une action en objet (annulable, mise en file). » / EN "Encapsulate an action as an object (undo, queue)." problem: coupler bouton et logique métier. solution: un objet commande avec `execute()`/`undo()`. when: undo/redo, files de tâches, macros. pitfalls: verbosité pour des actions triviales. code: `history.run(new AddText("hi"))`.
  - `state` : tagline FR « Changer le comportement d'un objet selon son état interne. » / EN "Change an object's behavior as its internal state changes." problem: `switch(state)` répété dans chaque méthode. solution: un objet état par état, délégation. when: machines à états (lecteur média, commande). pitfalls: dispersion de la logique entre classes d'état. code: `player.press()` diffère selon `Playing`/`Paused`.
  - `iterator` : tagline FR « Parcourir une collection sans exposer sa structure interne. » / EN "Traverse a collection without exposing its internals." problem: le client dépend de la représentation (tableau, arbre). solution: un itérateur avec `hasNext()`/`next()`. when: exposer un parcours stable sur une structure interne libre. pitfalls: réimplémenter ce que le langage offre déjà. code: itérateur `hasNext/next` sur une liste chaînée.
  - `template-method` : tagline FR « Fixer le squelette d'un algorithme, laisser des étapes redéfinissables. » / EN "Define an algorithm skeleton, let subclasses fill steps." problem: duplication d'un flux commun avec quelques variations. solution: méthode `run()` finale appelant des hooks abstraits. when: pipelines à structure fixe (parse -> valider -> sauver). pitfalls: héritage rigide (préférer parfois Strategy). code: `Report.generate()` appelle `header()/body()` redéfinis.
  - `chain-of-responsibility` : tagline FR « Passer une requête le long d'une chaîne de handlers. » / EN "Pass a request along a chain of handlers." problem: un seul objet ne peut pas décider qui traite quoi. solution: chaque handler traite ou délègue au suivant. when: middlewares, validation, escalade support. pitfalls: requête non traitée en bout de chaîne. code: `auth.setNext(rateLimit).setNext(handler)`.

- [ ] **Step 2: Réactiver le test de comptage** (retirer `test.skip` ajouté en Task 1).

- [ ] **Step 3: Lancer le test**

Run: `npm test -- test/patterns.test.js`
Expected: PASS (16 patterns, 4 / 5 / 7, toutes formes valides).

- [ ] **Step 4: Commit**

```bash
git add src/patterns.js test/patterns.test.js
git commit -m "feat(patterns): famille Behavioral (7) + modèle complet à 16 patterns"
```

---

## Task 4: `PatternsPanel.vue` + 3 wrappers

**Files:**
- Create: `src/components/panels/PatternsPanel.vue`
- Create: `src/components/panels/PatternsCreationalPanel.vue`
- Create: `src/components/panels/PatternsStructuralPanel.vue`
- Create: `src/components/panels/PatternsBehavioralPanel.vue`

**Interfaces:**
- Consumes: `patternsByFamily` de `src/patterns.js`, `highlight` de `src/highlight.js`, `useCodeLang`, `useI18n`.
- Produces: composants `PatternsCreationalPanel` / `PatternsStructuralPanel` / `PatternsBehavioralPanel` (props `cat`, `query`).

- [ ] **Step 1: Créer `PatternsPanel.vue`** (déclaratif, sur le modèle de CheatsheetPanel)

```vue
<script setup>
import { ref, computed, watch } from 'vue';
import { patternsByFamily } from '@/patterns.js';
import { highlight } from '@/highlight.js';
import { useI18n } from '@/composables/useI18n';
import { useCodeLang } from '@/composables/useCodeLang';

// Fiche de référence d'une famille de design patterns. `family` vient d'un
// wrapper court (un par famille), `query` est semé par la palette Ctrl+K.
const props = defineProps({
  family: { type: String, required: true },
  cat: { type: String, default: 'patterns' },
  query: { type: String, default: '' },
});

const { t, locale } = useI18n();
const { currentLang, LANGUAGES } = useCodeLang();
const L = (v) => v?.[locale.value] ?? v?.fr ?? '';

const list = computed(() => patternsByFamily(props.family));
const selectedId = ref(list.value[0]?.id ?? '');
const selected = computed(() => list.value.find((p) => p.id === selectedId.value) ?? list.value[0]);

// La palette peut viser un pattern précis (nom -> sélection).
watch(() => props.query, (q) => {
  if (!q) return;
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const hit = list.value.find((p) => norm(`${p.name.fr} ${p.name.en}`).includes(norm(q)));
  if (hit) selectedId.value = hit.id;
});
</script>

<template>
  <section class="panel patterns-panel">
    <div class="controls">
      <div class="pat-pills">
        <button
          v-for="p in list"
          :key="p.id"
          class="pat-pill"
          :class="{ active: p.id === selectedId }"
          @click="selectedId = p.id"
        >{{ L(p.name) }}</button>
      </div>
    </div>

    <article v-if="selected" class="pat-card">
      <h2 class="pat-name">{{ L(selected.name) }}</h2>
      <p class="pat-tagline">{{ L(selected.tagline) }}</p>

      <div class="pat-fields">
        <div><h3>{{ t('pat.problem') }}</h3><p>{{ L(selected.problem) }}</p></div>
        <div><h3>{{ t('pat.solution') }}</h3><p>{{ L(selected.solution) }}</p></div>
        <div><h3>{{ t('pat.when') }}</h3><p>{{ L(selected.when) }}</p></div>
        <div><h3>{{ t('pat.pitfalls') }}</h3><p>{{ L(selected.pitfalls) }}</p></div>
      </div>

      <div class="code-box">
        <div class="code-head">
          <span>{{ t('pat.pseudo') }}</span>
        </div>
        <pre class="cs-code"><code v-html="highlight(selected.pseudo, 'js')"></code></pre>
      </div>

      <div class="code-box">
        <div class="code-head">
          <span>{{ t('pat.code') }}</span>
          <select v-model="currentLang" class="lang-select" :aria-label="t('pat.code')">
            <option v-for="l in LANGUAGES" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>
        </div>
        <pre class="cs-code"><code v-html="highlight(selected.code[currentLang], currentLang)"></code></pre>
      </div>
    </article>
  </section>
</template>
```

- [ ] **Step 2: Créer les 3 wrappers** (précédent CorsPanel)

`PatternsCreationalPanel.vue` :
```vue
<script setup>
import PatternsPanel from './PatternsPanel.vue';
const props = defineProps({ cat: { type: String, default: 'patterns' }, query: { type: String, default: '' } });
</script>
<template>
  <PatternsPanel family="creational" :cat="cat" :query="query" />
</template>
```

`PatternsStructuralPanel.vue` : identique mais `family="structural"`.
`PatternsBehavioralPanel.vue` : identique mais `family="behavioral"`.

- [ ] **Step 3: Vérifier la compilation TS/Vue**

Run: `npm run build`
Expected: build OK (vue-tsc sans erreur). Corriger toute erreur de type avant de committer.

- [ ] **Step 4: Commit**

```bash
git add src/components/panels/PatternsPanel.vue src/components/panels/PatternsCreationalPanel.vue src/components/panels/PatternsStructuralPanel.vue src/components/panels/PatternsBehavioralPanel.vue
git commit -m "feat(patterns): PatternsPanel générique + 3 wrappers par famille"
```

---

## Task 5: i18n FR/EN (`src/i18n.js`)

**Files:**
- Modify: `src/i18n.js` (STRINGS.fr et STRINGS.en)

**Interfaces:**
- Produces les clés consommées par les panneaux (`pat.*`) et les onglets (`tabs.patterns*`, `cat.patterns`).

- [ ] **Step 1: Ajouter les clés dans `STRINGS.en`** (au voisinage des autres `cat.*` / `tabs.*`)

```js
'cat.patterns': 'Design Patterns',
'tabs.patternscreational': 'Creational',
'tabs.patternsstructural': 'Structural',
'tabs.patternsbehavioral': 'Behavioral',
'pat.problem': 'Problem',
'pat.solution': 'Solution',
'pat.when': 'When to use',
'pat.pitfalls': 'Pitfalls',
'pat.pseudo': 'Pseudo-code',
'pat.code': 'Example',
```

- [ ] **Step 2: Ajouter les MÊMES clés dans `STRINGS.fr`**

```js
'cat.patterns': 'Design Patterns',
'tabs.patternscreational': 'Création',
'tabs.patternsstructural': 'Structure',
'tabs.patternsbehavioral': 'Comportement',
'pat.problem': 'Problème',
'pat.solution': 'Solution',
'pat.when': 'Quand l\'utiliser',
'pat.pitfalls': 'Pièges',
'pat.pseudo': 'Pseudo-code',
'pat.code': 'Exemple',
```

- [ ] **Step 3: Lancer le test de parité i18n**

Run: `npm test -- test/i18n.test.js`
Expected: PASS (« English and French define exactly the same UI keys »).

- [ ] **Step 4: Commit**

```bash
git add src/i18n.js
git commit -m "feat(patterns): clés i18n FR/EN (catégorie, onglets, libellés de fiche)"
```

---

## Task 6: Câblage `App.vue`

**Files:**
- Modify: `src/App.vue` (imports, `CATEGORIES`, `TABS`, `panels`, `not:` playground)

**Interfaces:**
- Consumes: les 3 wrappers de la Task 4, les clés i18n de la Task 5.

- [ ] **Step 1: Importer les 3 wrappers** (bloc d'imports des panels)

```ts
import PatternsCreationalPanel from '@/components/panels/PatternsCreationalPanel.vue'
import PatternsStructuralPanel from '@/components/panels/PatternsStructuralPanel.vue'
import PatternsBehavioralPanel from '@/components/panels/PatternsBehavioralPanel.vue'
```

- [ ] **Step 2: Ajouter `'patterns'` à `CATEGORIES`** (juste après `'general'`)

```ts
const CATEGORIES = [
  'general', 'patterns', 'js', 'ts', 'python', 'vue', 'swift', 'ruby', 'kotlin', 'java', 'go', 'rust', 'c',
  'sql', 'git', 'linux', 'os', 'web', 'docker', 'k8s'
]
```

- [ ] **Step 3: Ajouter les 3 entrées `TABS`** (bloc des onglets de catégorie)

```ts
{ mode: 'patternscreational', key: 'tabs.patternscreational', cat: 'patterns' },
{ mode: 'patternsstructural', key: 'tabs.patternsstructural', cat: 'patterns' },
{ mode: 'patternsbehavioral', key: 'tabs.patternsbehavioral', cat: 'patterns' },
```

- [ ] **Step 4: Exclure le playground pour `patterns`** (ajouter à la liste `not:` existante)

```ts
{ mode: 'playground', key: 'tabs.playground', cat: '*', not: ['swift', 'web', 'docker', 'os', 'k8s', 'patterns'] },
```

- [ ] **Step 5: Enregistrer les 3 modes dans `panels`**

```ts
patternscreational: PatternsCreationalPanel,
patternsstructural: PatternsStructuralPanel,
patternsbehavioral: PatternsBehavioralPanel,
```

- [ ] **Step 6: Vérifier le build**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 7: Commit**

```bash
git add src/App.vue
git commit -m "feat(patterns): câblage catégorie + 3 onglets dans App.vue"
```

---

## Task 7: Cheatsheet dérivée + enregistrement + test

**Files:**
- Create: `src/cheatsheets/patterns.js`
- Modify: `src/cheatsheets/index.js`
- Modify: `test/cheatsheets.test.js`

**Interfaces:**
- Consumes: `PATTERNS`, `patternsByFamily` de `src/patterns.js`.
- Produces: `CHEATSHEETS.patterns` (schéma `{ id, lang, sections:[{id, title{fr,en}, items:[{id, title{fr,en}, code, note{fr,en}}] }] }`).

- [ ] **Step 1: Créer `src/cheatsheets/patterns.js`** (dérivée, DRY)

```js
import { patternsByFamily } from '@/patterns.js';

// Une section par famille, dérivée du modèle patterns.js (jamais de contenu
// dupliqué à la main) : chaque pattern devient un item recherchable (Ctrl+K).
const familySection = (id, titleFr, titleEn) => ({
  id: `pat-${id}`,
  title: { fr: titleFr, en: titleEn },
  items: patternsByFamily(id).map((p) => ({
    id: `cs-pat-${p.id}`,
    title: p.name,
    code: p.pseudo,
    note: p.tagline,
  })),
});

export default {
  id: 'patterns',
  lang: 'js',
  sections: [
    familySection('creational', 'Création', 'Creational'),
    familySection('structural', 'Structure', 'Structural'),
    familySection('behavioral', 'Comportement', 'Behavioral'),
    {
      id: 'pat-principles',
      title: { fr: 'Principes', en: 'Principles' },
      items: [
        {
          id: 'cs-pat-composition',
          title: { fr: 'Composition plutôt qu\'héritage', en: 'Composition over inheritance' },
          code: 'class Car { engine = new Engine() } // a-un, pas est-un',
          note: {
            fr: 'Assembler des objets (a-un) donne plus de souplesse que des hiérarchies figées (est-un).',
            en: 'Assembling objects (has-a) is more flexible than rigid inheritance trees (is-a).',
          },
        },
        {
          id: 'cs-pat-interface',
          title: { fr: 'Programmer vers une interface', en: 'Program to an interface' },
          code: 'function pay(p: Payment) { p.charge() } // pas un type concret',
          note: {
            fr: 'Dépendre d\'une abstraction, pas d\'une implémentation concrète : couplage faible.',
            en: 'Depend on an abstraction, not a concrete implementation: loose coupling.',
          },
        },
        {
          id: 'cs-pat-encapsulate',
          title: { fr: 'Encapsuler ce qui varie', en: 'Encapsulate what varies' },
          code: 'strategy = pickStrategy(ctx) // isoler la partie changeante',
          note: {
            fr: 'Isoler la partie qui change derrière une frontière stable limite l\'impact des évolutions.',
            en: 'Isolating the changing part behind a stable boundary limits the blast radius of change.',
          },
        },
      ],
    },
  ],
};
```

- [ ] **Step 2: Enregistrer dans `src/cheatsheets/index.js`**

Ajouter l'import et l'entrée du registre :
```js
import patterns from './patterns.js';
// ...
export const CHEATSHEETS = { general, js, ts, vue, swift, ruby, kotlin, go, rust, git, linux, sql, web, docker, python, c, os, k8s, java, patterns };
```

- [ ] **Step 3: Ajouter `'patterns'` à `CATS` dans `test/cheatsheets.test.js`**

```js
const CATS = ['general', 'js', 'ts', 'vue', 'swift', 'ruby', 'kotlin', 'go', 'rust', 'git', 'linux', 'sql', 'web', 'docker', 'python', 'c', 'os', 'k8s', 'java', 'patterns'];
```

- [ ] **Step 4: Lancer les tests cheatsheets** (le test exige >= 4 sections, >= 3 items/section, notes bilingues > 10 caractères : la section Principes et les familles satisfont ces seuils)

Run: `npm test -- test/cheatsheets.test.js`
Expected: PASS (« every filter category has its cheatsheet », comptage global mis à jour automatiquement).

- [ ] **Step 5: Commit**

```bash
git add src/cheatsheets/patterns.js src/cheatsheets/index.js test/cheatsheets.test.js
git commit -m "feat(patterns): cheatsheet dérivée + recherche Ctrl+K"
```

---

## Task 8: Vérification finale (suite complète + app réelle)

**Files:** aucun (vérification).

- [ ] **Step 1: Suite complète**

Run: `npm test`
Expected: tous les tests verts (dont `patterns.test.js`, `i18n.test.js`, `cheatsheets.test.js`).

- [ ] **Step 2: Build de production**

Run: `npm run build`
Expected: `vue-tsc --noEmit` sans erreur puis build Vite OK.

- [ ] **Step 3: Vérification visuelle** (`npm run dev`, http://localhost:5173)
  - Sélectionner la catégorie « Design Patterns » : 3 onglets (Création / Structure / Comportement) plus Cheatsheet et Quiz, PAS de Playground.
  - Onglet Création : pills des 4 patterns, la fiche affiche intention/problème/solution/quand/pièges, pseudo-code coloré, exemple coloré, sélecteur de langue qui change le code.
  - Basculer FR/EN : tous les libellés et le contenu suivent la langue.
  - Ctrl+K « Observer » : ouvre la cheatsheet Design Patterns filtrée sur Observer.

- [ ] **Step 4: Commit éventuel** (si un ajustement a été nécessaire)

```bash
git add -A
git commit -m "test(patterns): vérification suite complète + app"
```

---

## Self-Review (rempli par l'auteur du plan)

- Couverture spec : modèle (T1-3), vue + wrappers (T4), i18n (T5), App wiring + exclusion playground (T6), cheatsheet dérivée + test (T7), tests (T1-3, T7) et vérif finale (T8). Tous les points de la spec ont une tâche.
- Placeholders : les briefs de patterns ne sont pas des « TODO » vagues mais des cahiers des charges précis (taglines FR/EN données, structure du code imposée, exemplaire Singleton complet montrant le format) ; la complétude est verrouillée par `patterns.test.js` (7 langages, champs bilingues, pseudo, comptage 4/5/7).
- Cohérence des types : `family` valeurs `creational|structural|behavioral` cohérentes entre `patterns.js`, `patternsByFamily`, wrappers, cheatsheet et i18n (`tabs.patterns*`). Modes `patternscreational|patternsstructural|patternsbehavioral` identiques entre `TABS`, `panels` et imports.
