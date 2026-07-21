# Catégorie ML — P0 (scaffold + cheatsheet + K-means) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer la catégorie « ML » de bout en bout sur son premier visualizer (K-means), avec sa cheatsheet dédiée, en validant toute l'architecture réutilisable (générateur d'étapes pur → renderer canvas → panneau `StepPlayer`).

**Architecture:** 3 couches découplées par visualizer — un module JS pur `src/ml/<algo>.js` qui calcule des *frames* (snapshots), un renderer canvas partagé `src/render/mlPlaneRenderer.js`, un panneau Vue mince qui câble contrôles + `StepPlayer`. La cheatsheet ML (`src/cheatsheets/ml.js`) reçoit le contenu data/ML déplacé depuis `python.js`.

**Tech Stack:** Vue 3 (Composition API, `<script setup>`), Vite, `StepPlayer` (`src/player.js`), `highlight.js` maison, `node --test`, canvas 2D. Zéro dépendance externe.

## Global Constraints

- **Vue 3 Composition API** avec `<script setup>` ; suivre le pattern des panneaux existants (`SortingPanel.vue`, `TracePanel.vue`).
- **Tailwind Preflight DÉSACTIVÉ** — pas de reset ; styliser via `visualizers.css`.
- **i18n bilingue obligatoire** : toute clé ajoutée existe dans le bloc `en:` ET `fr:` de `src/i18n.js`.
- **Tests cheatsheet** (`test/cheatsheets.test.js`) : chaque sheet a **≥ 4 sections**, chaque section **≥ 3 items** ; chaque `id` d'item est **unique across toutes les sheets** ; `title.fr`/`title.en` > 2 car., `code` > 10 car., `note.fr`/`note.en` > 10 car. ; `lang` de la sheet ∈ `{js,ts,swift,ruby,kotlin,go,rust,git,bash,sql,python}`.
- **Générateurs testés = fonctions pures déterministes** : aucun `Math.random` non seedé ; utiliser le PRNG `mulberry32` seedé.
- **Commits** : conventional commits, sans ligne d'attribution.
- **Runner de test** : `node --test` (fichiers `test/*.test.js`, `import { test } from 'node:test'`, `assert` strict).

---

### Task 1 : Cheatsheet `ml.js` (déplacement + réorg + 4 nouveaux items)

**Files:**
- Create: `src/cheatsheets/ml.js`
- Modify: `src/cheatsheets/python.js` (supprimer les sections `data` et `ml`)
- Modify: `src/cheatsheets/index.js` (importer + enregistrer `ml`)
- Modify: `test/cheatsheets.test.js:6` (ajouter `'ml'` au tableau `CATS`)

**Interfaces:**
- Consumes: rien.
- Produces: `cheatsheetFor('ml')` retourne la sheet ML ; export default `{ id:'ml', lang:'python', sections:[…] }`.

- [ ] **Step 1 : Créer `src/cheatsheets/ml.js` avec 6 sections**

Structure du fichier (même forme que `python.js`). Les **items existants sont déplacés VERBATIM** depuis `python.js` (leurs objets `{ id, title, code, note }` sont copiés tels quels), répartis ainsi ; les **4 items marqués NOUVEAU** sont écrits avec le code fourni au Step 2 :

```
export default {
  id: 'ml',
  lang: 'python',
  sections: [
    { id: 'numpy',    title: { fr: 'NumPy',  en: 'NumPy' },  items: [ py-numpy-array, py-numpy-axis, py-numpy-mask ] },
    { id: 'pandas',   title: { fr: 'pandas', en: 'pandas' }, items: [ py-pandas-dataframe, py-pandas-select, py-pandas-groupby, py-pandas-missing, py-pandas-merge ] },
    { id: 'ml-eval',  title: { fr: 'Workflow & évaluation', en: 'Workflow & evaluation' }, items: [ py-ml-workflow, py-ml-metrics, py-ml-crossval(NOUVEAU), py-ml-overfitting ] },
    { id: 'ml-sup',   title: { fr: 'Modèles supervisés', en: 'Supervised models' },       items: [ py-ml-linear, py-ml-logistic, py-ml-knn, py-ml-svm(NOUVEAU) ] },
    { id: 'ml-ens',   title: { fr: 'Ensembles & non-supervisé', en: 'Ensembles & unsupervised' }, items: [ py-ml-tree-forest, py-ml-boosting, py-ml-kmeans ] },
    { id: 'ml-ops',   title: { fr: 'MLOps & préparation', en: 'MLOps & prep' },           items: [ py-ml-pipeline, py-ml-persist, py-ml-gridsearch(NOUVEAU), py-ml-encoding(NOUVEAU) ] },
  ],
};
```

Le fichier commence par un bloc de commentaire d'en-tête (2-3 lignes) décrivant la sheet, comme les autres cheatsheets.

- [ ] **Step 2 : Écrire les 4 nouveaux items** (à insérer aux emplacements ci-dessus)

```js
// section ml-eval :
{
  id: 'py-ml-crossval',
  title: { fr: 'Validation croisée', en: 'Cross-validation' },
  code: `from sklearn.model_selection import cross_val_score, StratifiedKFold
scores = cross_val_score(model, X, y, cv=5, scoring="f1")
print(scores.mean(), scores.std())   # score moyen ± écart-type
# StratifiedKFold garde la proportion des classes dans chaque pli`,
  note: {
    fr: `Un seul split train/test dépend de la chance du tirage. La validation croisée entraîne k fois sur k découpages différents et moyenne les scores — estimation bien plus fiable, surtout sur petit jeu. StratifiedKFold préserve l'équilibre des classes.`,
    en: `A single train/test split depends on the luck of the draw. Cross-validation trains k times on k different folds and averages the scores — a far more reliable estimate, especially on small data. StratifiedKFold preserves class balance.`,
  },
},
// section ml-sup :
{
  id: 'py-ml-svm',
  title: { fr: 'SVM (marges maximales)', en: 'SVM (max-margin)' },
  code: `from sklearn.svm import SVC
clf = SVC(kernel="rbf", C=1.0, gamma="scale").fit(X_tr, y_tr)
clf.support_vectors_          # points qui définissent la frontière
# kernel="linear" : frontière droite ; "rbf" : non-linéaire`,
  note: {
    fr: `Le SVM cherche la frontière qui maximise la marge entre classes ; seuls les points proches (vecteurs de support) comptent. Le kernel RBF gère le non-linéaire. Puissant en dimension moyenne, mais exige des features standardisées et coûte cher sur gros volumes.`,
    en: `An SVM finds the boundary that maximizes the margin between classes; only the nearby points (support vectors) matter. The RBF kernel handles non-linearity. Powerful on medium-sized data, but requires standardized features and scales poorly to large volumes.`,
  },
},
// section ml-ops :
{
  id: 'py-ml-gridsearch',
  title: { fr: 'GridSearchCV (hyperparamètres)', en: 'GridSearchCV (hyperparameters)' },
  code: `from sklearn.model_selection import GridSearchCV
grid = {"n_estimators": [100, 300], "max_depth": [4, 8, None]}
search = GridSearchCV(RandomForestClassifier(), grid, cv=5)
search.fit(X_tr, y_tr)
print(search.best_params_, search.best_score_)`,
  note: {
    fr: `Les hyperparamètres (profondeur, learning_rate…) ne s'apprennent pas : on les cherche. GridSearchCV teste toutes les combinaisons par validation croisée et retient la meilleure. La combinatoire explose vite — préférez RandomizedSearchCV au-delà de quelques axes.`,
    en: `Hyperparameters (depth, learning_rate…) aren't learned: you search for them. GridSearchCV tries every combination via cross-validation and keeps the best. The combinatorics explode fast — prefer RandomizedSearchCV beyond a few axes.`,
  },
},
{
  id: 'py-ml-encoding',
  title: { fr: 'Encodage catégoriel', en: 'Categorical encoding' },
  code: `from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
pre = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["ville"]),
], remainder="passthrough")
X_enc = pre.fit_transform(df)   # "ville" -> colonnes 0/1`,
  note: {
    fr: `Les modèles ne consomment que des nombres : une colonne texte (« ville ») doit être encodée. OneHotEncoder crée une colonne 0/1 par catégorie (aucun ordre imposé, contrairement à un entier). ColumnTransformer applique le bon encodage par colonne ; handle_unknown="ignore" évite le crash sur une catégorie inédite en prod.`,
    en: `Models consume only numbers: a text column ("city") must be encoded. OneHotEncoder creates one 0/1 column per category (no artificial order, unlike a plain integer). ColumnTransformer applies the right encoding per column; handle_unknown="ignore" avoids crashing on an unseen category in prod.`,
  },
},
```

- [ ] **Step 3 : Retirer les sections déplacées de `python.js`**

Supprimer intégralement les deux blocs de section `{ id: 'data', … }` et `{ id: 'ml', … }` de `src/cheatsheets/python.js` (les 19 items déplacés au Step 1). `python.js` retombe à ses sections langage (basics, collections, functions, errors, classes, stdlib, async, tooling).

- [ ] **Step 4 : Enregistrer la sheet dans le registry**

Dans `src/cheatsheets/index.js` : ajouter `import ml from './ml.js';` (près des autres imports) et ajouter `ml` dans l'objet `export const CHEATSHEETS = { …, patterns, ml };`.

- [ ] **Step 5 : Ajouter `'ml'` au tableau `CATS` du test**

Dans `test/cheatsheets.test.js:6`, ajouter `'ml'` à la fin du tableau `CATS` :
```js
const CATS = ['general', 'js', 'ts', 'vue', 'swift', 'ruby', 'kotlin', 'go', 'rust', 'git', 'linux', 'sql', 'web', 'docker', 'python', 'c', 'os', 'k8s', 'java', 'patterns', 'ml'];
```

- [ ] **Step 6 : Lancer les tests cheatsheet**

Run: `node --test test/cheatsheets.test.js`
Expected: PASS (5 tests). Vérifie : ml a 6 sections ≥3 items, ids uniques (les items déplacés ne sont plus dans python), bilingue.

- [ ] **Step 7 : Commit**

```bash
git add src/cheatsheets/ml.js src/cheatsheets/python.js src/cheatsheets/index.js test/cheatsheets.test.js
git commit -m "feat(ml): cheatsheet ML dédiée (NumPy/pandas + algos déplacés depuis Python)"
```

---

### Task 2 : Générateurs de données 2D (`datasets.js`)

**Files:**
- Create: `src/ml/datasets.js`
- Test: `test/ml.test.js`

**Interfaces:**
- Consumes: rien.
- Produces:
  - `mulberry32(seed:number) => () => number` — PRNG déterministe ∈ [0,1).
  - `blobs({ k?, n?, spread?, seed? }) => Array<{x:number, y:number, label:number}>` — `k` blobs gaussiens dans le carré unité, coordonnées ∈ [0,1].

- [ ] **Step 1 : Écrire le test qui échoue**

```js
// test/ml.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, blobs } from '../src/ml/datasets.js';

test('mulberry32 is deterministic for a given seed', () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  const seqA = [a(), a(), a()];
  const seqB = [b(), b(), b()];
  assert.deepEqual(seqA, seqB);
  assert.ok(seqA.every((v) => v >= 0 && v < 1));
});

test('blobs returns n points in the unit square with k labels', () => {
  const pts = blobs({ k: 3, n: 150, seed: 1 });
  assert.equal(pts.length, 150);
  assert.ok(pts.every((p) => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1));
  const labels = new Set(pts.map((p) => p.label));
  assert.equal(labels.size, 3);
});

test('blobs is reproducible for the same seed', () => {
  assert.deepEqual(blobs({ k: 3, n: 20, seed: 5 }), blobs({ k: 3, n: 20, seed: 5 }));
});
```

- [ ] **Step 2 : Lancer le test — il doit échouer**

Run: `node --test test/ml.test.js`
Expected: FAIL (`Cannot find module '../src/ml/datasets.js'`).

- [ ] **Step 3 : Implémenter `src/ml/datasets.js`**

```js
/**
 * Générateurs de données 2D seedés pour les visualizers ML.
 * Déterministes pour une seed donnée : visuels reproductibles + tests stables.
 */

/** mulberry32 — PRNG déterministe minimal. Renvoie une fonction → [0,1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Box-Muller : une normale centrée réduite à partir d'un rng [0,1). */
function gaussian(rng) {
  const u = 1 - rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * `k` blobs gaussiens dans le carré unité. `label` = cluster VRAI (sert
 * uniquement à placer les points, jamais lu par les algorithmes).
 */
export function blobs({ k = 3, n = 150, spread = 0.06, seed = 1 } = {}) {
  const rng = mulberry32(seed);
  const centers = Array.from({ length: k }, () => ({
    x: 0.15 + rng() * 0.7,
    y: 0.15 + rng() * 0.7,
  }));
  const pts = [];
  for (let i = 0; i < n; i++) {
    const c = i % k;
    pts.push({
      x: clamp01(centers[c].x + gaussian(rng) * spread),
      y: clamp01(centers[c].y + gaussian(rng) * spread),
      label: c,
    });
  }
  return pts;
}
```

- [ ] **Step 4 : Lancer le test — il doit passer**

Run: `node --test test/ml.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5 : Commit**

```bash
git add src/ml/datasets.js test/ml.test.js
git commit -m "feat(ml): générateurs de données 2D seedés (blobs)"
```

---

### Task 3 : Générateur d'étapes K-means (`kmeans.js`)

**Files:**
- Create: `src/ml/kmeans.js`
- Test: `test/ml.test.js` (ajouter des tests au fichier existant)

**Interfaces:**
- Consumes: `mulberry32` de `src/ml/datasets.js`.
- Produces: `kmeansSteps(points, { k?, maxIter?, seed? }) => Array<Frame>` où
  `Frame = { centroids: Array<{x,y}>, assignments: number[], inertia: number, iter: number, phase: 'assign'|'update' }`.

- [ ] **Step 1 : Écrire les tests qui échouent** (ajouter à `test/ml.test.js`)

```js
import { kmeansSteps } from '../src/ml/kmeans.js';

test('kmeansSteps produces frames with full snapshots', () => {
  const pts = blobs({ k: 3, n: 90, seed: 2 });
  const frames = kmeansSteps(pts, { k: 3, seed: 7 });
  assert.ok(frames.length >= 2);
  for (const f of frames) {
    assert.equal(f.centroids.length, 3);
    assert.equal(f.assignments.length, pts.length);
    assert.ok(Number.isFinite(f.inertia));
  }
});

test('kmeans inertia is non-increasing across frames (Lloyd converges)', () => {
  const pts = blobs({ k: 3, n: 120, seed: 3 });
  const frames = kmeansSteps(pts, { k: 3, seed: 7 });
  for (let i = 1; i < frames.length; i++) {
    assert.ok(frames[i].inertia <= frames[i - 1].inertia + 1e-9, `frame ${i}: ${frames[i].inertia} > ${frames[i - 1].inertia}`);
  }
});

test('kmeans is deterministic for the same points and seed', () => {
  const pts = blobs({ k: 3, n: 60, seed: 4 });
  assert.deepEqual(kmeansSteps(pts, { k: 3, seed: 7 }), kmeansSteps(pts, { k: 3, seed: 7 }));
});
```

- [ ] **Step 2 : Lancer — doit échouer**

Run: `node --test test/ml.test.js`
Expected: FAIL (`Cannot find module '../src/ml/kmeans.js'`).

- [ ] **Step 3 : Implémenter `src/ml/kmeans.js`**

```js
import { mulberry32 } from './datasets.js';

const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
const clone = (cs) => cs.map((c) => ({ ...c }));

function nearest(p, centroids) {
  let best = 0;
  let bd = Infinity;
  for (let c = 0; c < centroids.length; c++) {
    const d = dist2(p, centroids[c]);
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}

function meanOf(points, assignments, ci, fallback) {
  let sx = 0;
  let sy = 0;
  let count = 0;
  for (let i = 0; i < points.length; i++) {
    if (assignments[i] === ci) { sx += points[i].x; sy += points[i].y; count++; }
  }
  return count ? { x: sx / count, y: sy / count } : fallback;
}

function totalInertia(points, centroids, assignments) {
  let sum = 0;
  for (let i = 0; i < points.length; i++) sum += dist2(points[i], centroids[assignments[i]]);
  return sum;
}

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Algorithme de Lloyd comme liste de frames (snapshots complets).
 * Alterne 'assign' (points → centroïde le plus proche) et 'update'
 * (centroïdes → moyenne de leur cluster). S'arrête quand les affectations
 * se stabilisent ou à `maxIter`.
 */
export function kmeansSteps(points, { k = 3, maxIter = 20, seed = 7 } = {}) {
  const rng = mulberry32(seed);
  const idx = shuffle([...points.keys()], rng).slice(0, k);
  let centroids = idx.map((i) => ({ x: points[i].x, y: points[i].y }));
  let assignments = new Array(points.length).fill(-1);
  const frames = [];

  for (let iter = 0; iter < maxIter; iter++) {
    // phase assign
    const next = points.map((p) => nearest(p, centroids));
    frames.push({
      centroids: clone(centroids),
      assignments: [...next],
      inertia: totalInertia(points, centroids, next),
      iter,
      phase: 'assign',
    });
    const changed = next.some((c, i) => c !== assignments[i]);
    assignments = next;
    if (!changed && iter > 0) break;
    // phase update
    centroids = centroids.map((c, ci) => meanOf(points, assignments, ci, c));
    frames.push({
      centroids: clone(centroids),
      assignments: [...assignments],
      inertia: totalInertia(points, centroids, assignments),
      iter,
      phase: 'update',
    });
  }
  return frames;
}
```

- [ ] **Step 4 : Lancer — doit passer**

Run: `node --test test/ml.test.js`
Expected: PASS (6 tests au total dans le fichier).

- [ ] **Step 5 : Commit**

```bash
git add src/ml/kmeans.js test/ml.test.js
git commit -m "feat(ml): générateur d'étapes K-means (Lloyd, frames snapshot)"
```

---

### Task 4 : Renderer canvas partagé (`mlPlaneRenderer.js`)

**Files:**
- Create: `src/render/mlPlaneRenderer.js`
- Modify: `src/assets/styles/visualizers.css` (ajouter `.ml-canvas` + `.panel-title` en fin de fichier)

**Interfaces:**
- Consumes: un élément `<canvas>`.
- Produces: `class MlPlaneRenderer` avec `constructor(canvas)`, `setPoints(points)`, `draw(frame)` où `frame` a la forme `{ centroids, assignments }` (ou `null`).

- [ ] **Step 1 : Implémenter `src/render/mlPlaneRenderer.js`**

```js
/**
 * Renderer 2D partagé par les visualizers ML : nuage de points dans le carré
 * unité, coloré par cluster/classe, centroïdes dessinés en ✕. Redessine tout
 * le frame à chaque appel (pas d'état incrémental). Couleurs indépendantes du
 * thème (palette catégorielle fixe), donc pas d'abonnement au thème requis.
 */

// Palette catégorielle (cluster / classe). Assez distincte en clair comme sombre.
const CLUSTER_HEX = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#06b6d4', '#d946ef'];
const UNASSIGNED = '#94a3b8';

export class MlPlaneRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.points = [];
    this.frame = null;
    this.resize();
  }

  setPoints(points) {
    this.points = points;
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const size = Math.max(1, Math.round(rect.width || this.canvas.width || 480));
    this.side = size;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // unité [0,1] → px (avec marge de 8px, Y inversé pour un repère mathématique)
  _x(u) { return 8 + u * (this.side - 16); }
  _y(v) { return this.side - (8 + v * (this.side - 16)); }

  draw(frame) {
    this.frame = frame;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.side, this.side);

    // points
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const cluster = frame ? frame.assignments[i] : -1;
      ctx.fillStyle = cluster < 0 ? UNASSIGNED : CLUSTER_HEX[cluster % CLUSTER_HEX.length];
      ctx.beginPath();
      ctx.arc(this._x(p.x), this._y(p.y), 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    // centroïdes (✕)
    if (frame && frame.centroids) {
      ctx.lineWidth = 3;
      frame.centroids.forEach((c, ci) => {
        ctx.strokeStyle = CLUSTER_HEX[ci % CLUSTER_HEX.length];
        const x = this._x(c.x);
        const y = this._y(c.y);
        const r = 7;
        ctx.beginPath();
        ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r);
        ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r);
        ctx.stroke();
      });
    }
  }
}
```

- [ ] **Step 2 : Ajouter les styles en fin de `visualizers.css`**

```css
/* --- ML visualizers -------------------------------------------------- */
.panel-title {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  font-weight: 600;
}
.ml-canvas {
  display: block;
  width: 100%;
  max-width: 480px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--panel);
}
```

- [ ] **Step 3 : Vérifier que rien n'est cassé (aucun test unitaire canvas)**

Run: `node --test`
Expected: PASS (aucune régression ; le renderer est vérifié visuellement en Task 5).

- [ ] **Step 4 : Commit**

```bash
git add src/render/mlPlaneRenderer.js src/assets/styles/visualizers.css
git commit -m "feat(ml): renderer canvas 2D partagé (scatter + centroïdes)"
```

---

### Task 5 : Panneau K-means + i18n + câblage App.vue

**Files:**
- Create: `src/components/panels/MlKmeansPanel.vue`
- Modify: `src/i18n.js` (clés `cat.ml`, `tabs.mlkmeans`, `ml.*` en `en:` ET `fr:`)
- Modify: `src/App.vue` (import, `panels` map, `CATEGORIES`, une entrée `TABS`)

**Interfaces:**
- Consumes: `blobs` (Task 2), `kmeansSteps` (Task 3), `MlPlaneRenderer` (Task 4), `StepPlayer`, `wirePlayerButtons`, `setStatus`, `highlight`, `t`/`useI18n`.
- Produces: composant `MlKmeansPanel`, mode `'mlkmeans'`, catégorie `'ml'`.

- [ ] **Step 1 : Ajouter les clés i18n dans le bloc `en:` de `src/i18n.js`**

Après `'cat.docker'` ajouter dans le bloc `en:` :
```js
    'cat.ml': 'ML',
```
Près de `'tabs.pybasics'` (bloc `en:`) ajouter :
```js
    'tabs.mlkmeans': 'K-means',
    'ml.regenerate': 'New data',
    'ml.kmeans.hint': 'Lloyd’s algorithm alternates two steps: assign each point to the nearest centroid, then move each centroid to its cluster mean. Inertia (total squared distance) only ever decreases, until it converges.',
    'ml.kmeans.aria': 'Scatter plot of 2D points coloured by cluster, with centroids marked as crosses.',
    'ml.metrics.kmeans': ({ iter, inertia }) => `iteration ${iter} — inertia ${inertia.toFixed(3)}`,
```

- [ ] **Step 2 : Ajouter les mêmes clés dans le bloc `fr:` de `src/i18n.js`**

Après `'cat.docker'` (bloc `fr:`) :
```js
    'cat.ml': 'ML',
```
Près de `'tabs.pybasics'` (bloc `fr:`) :
```js
    'tabs.mlkmeans': 'K-means',
    'ml.regenerate': 'Nouveau jeu',
    'ml.kmeans.hint': 'L’algorithme de Lloyd alterne deux étapes : affecter chaque point au centroïde le plus proche, puis déplacer chaque centroïde vers la moyenne de son cluster. L’inertie (somme des distances au carré) ne fait que décroître, jusqu’à convergence.',
    'ml.kmeans.aria': 'Nuage de points 2D colorés par cluster, avec les centroïdes marqués par des croix.',
    'ml.metrics.kmeans': ({ iter, inertia }) => `itération ${iter} — inertie ${inertia.toFixed(3)}`,
```

- [ ] **Step 3 : Créer `src/components/panels/MlKmeansPanel.vue`**

```vue
<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { StepPlayer } from '@/player.js';
import { MlPlaneRenderer } from '@/render/mlPlaneRenderer.js';
import { blobs } from '@/ml/datasets.js';
import { kmeansSteps } from '@/ml/kmeans.js';
import { highlight } from '@/highlight.js';
import { t, onLocaleChange } from '@/i18n.js';
import { useI18n } from '@/composables/useI18n';
import { setStatus, wirePlayerButtons } from '@/utils/viz.js';

const SNIPPET = `from sklearn.cluster import KMeans
km = KMeans(n_clusters=3, random_state=42).fit(X)
km.labels_            # cluster de chaque point
km.cluster_centers_   # position des centroïdes`;

const { t: tt } = useI18n();
const root = ref(null);
let player = null;
let seed = 1;

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id);
  const canvas = $('ml-canvas');
  const kEl = $('ml-k');
  const speedEl = $('ml-speed');
  const status = $('ml-status');
  const metrics = $('ml-metrics');
  $('ml-code').innerHTML = highlight(SNIPPET, 'python');

  const renderer = new MlPlaneRenderer(canvas);
  let frames = [];

  const renderFrame = (f) => {
    renderer.draw(f);
    metrics.textContent = t('ml.metrics.kmeans')({ iter: f.iter + 1, inertia: f.inertia });
  };

  player = new StepPlayer({
    slow: 3,
    onStep: (f) => { renderFrame(f); setStatus(status, player); },
    onReset: () => { if (frames[0]) renderFrame(frames[0]); setStatus(status, player); },
    onDone: () => setStatus(status, player, t('status.done')),
  });
  player.setSpeed(+speedEl.value);

  const setLabel = wirePlayerButtons({
    playBtn: $('ml-play'), stepBtn: $('ml-step'), resetBtn: $('ml-reset'), player,
  });

  const regenerate = () => {
    const k = +kEl.value;
    const points = blobs({ k, n: 150, seed });
    renderer.setPoints(points);
    frames = kmeansSteps(points, { k, seed });
    player.load(frames);
    setLabel(false);
  };
  kEl.onchange = regenerate;
  $('ml-new').onclick = () => { seed += 1; regenerate(); };
  speedEl.oninput = () => player.setSpeed(+speedEl.value);
  onLocaleChange(() => setStatus(status, player));
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <h2 class="panel-title">{{ tt('tabs.mlkmeans') }}</h2>
    <div class="controls">
      <label><span>k</span>
        <select id="ml-k">
          <option value="2">2</option>
          <option value="3" selected>3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </label>
      <label><span>{{ tt('ctrl.speed') }}</span>
        <input id="ml-speed" type="range" min="1" max="100" value="30" />
      </label>
      <button id="ml-play" class="primary">▶ Play</button>
      <button id="ml-step">{{ tt('btn.step') }}</button>
      <button id="ml-reset">{{ tt('btn.reset') }}</button>
      <button id="ml-new">{{ tt('ml.regenerate') }}</button>
    </div>
    <canvas id="ml-canvas" class="ml-canvas" width="480" height="480" role="img" :aria-label="tt('ml.kmeans.aria')"></canvas>
    <div id="ml-metrics" class="cx-row"></div>
    <div class="code-box">
      <div class="code-head"><span>scikit-learn</span></div>
      <pre><code id="ml-code"></code></pre>
    </div>
    <p class="hint">{{ tt('ml.kmeans.hint') }}</p>
    <div class="status-row"><span id="ml-status" class="status"></span></div>
  </section>
</template>
```

- [ ] **Step 4 : Câbler dans `src/App.vue`**

(a) Ajouter l'import près des autres imports de panels :
```js
import MlKmeansPanel from '@/components/panels/MlKmeansPanel.vue'
```
(b) Dans `CATEGORIES` (App.vue:73-76), ajouter `'ml'` après `'c'` :
```js
const CATEGORIES = [
  'general', 'patterns', 'js', 'ts', 'python', 'vue', 'swift', 'ruby', 'kotlin', 'java', 'go', 'rust', 'c', 'ml',
  'sql', 'git', 'linux', 'os', 'web', 'docker', 'k8s'
]
```
(c) Dans le tableau `TABS`, ajouter (près des autres entrées de langage, avant l'entrée `cheatsheet`) :
```js
  { mode: 'mlkmeans', key: 'tabs.mlkmeans', cat: 'ml' },
```
(d) Dans l'objet `panels`, ajouter :
```js
  mlkmeans: MlKmeansPanel,
```

⚠️ Ne PAS ajouter les 4 autres onglets ML (mlgradient/mlknn/mltree/mlneural) ici : sans composant enregistré, ils rendraient `undefined` et casseraient. Ils arrivent avec leur panneau dans les phases P1-P4.

- [ ] **Step 5 : Vérifier le build (type-check inclus) et lancer le dev**

Run: `npm run build`
Expected: build OK (vue-tsc sans erreur, bundle généré).
Puis vérification visuelle : `npm run dev`, sélectionner la catégorie **ML**, onglet **K-means** apparaît → Play anime les centroïdes qui se recentrent, l'inertie décroît, « Nouveau jeu » régénère, k modifie le nombre de clusters, l'onglet **Cheatsheet** de la catégorie ML montre NumPy/pandas + algos.

- [ ] **Step 6 : Commit**

```bash
git add src/components/panels/MlKmeansPanel.vue src/i18n.js src/App.vue
git commit -m "feat(ml): onglet K-means animé + catégorie ML câblée"
```

---

### Task 6 : Intégration finale & clôture P0

**Files:**
- Modify: `docs/superpowers/specs/2026-07-21-ml-category-design.md` (marquer P0 fait)

- [ ] **Step 1 : Suite complète verte**

Run: `node --test`
Expected: PASS (tous les tests, y compris `test/ml.test.js` et `test/cheatsheets.test.js`).

- [ ] **Step 2 : Lint**

Run: `npx eslint src/ml src/render/mlPlaneRenderer.js src/components/panels/MlKmeansPanel.vue src/cheatsheets/ml.js`
Expected: `No issues found`. Corriger si besoin.

- [ ] **Step 3 : Marquer P0 comme livré dans la spec**

Dans `docs/superpowers/specs/2026-07-21-ml-category-design.md`, section « Phasage », préfixer la ligne **P0** par `✅` et noter la date.

- [ ] **Step 4 : Commit**

```bash
git add docs/superpowers/specs/2026-07-21-ml-category-design.md
git commit -m "docs(ml): P0 livré (K-means + cheatsheet + scaffold)"
```

---

## Self-Review

**Spec coverage :**
- Catégorie ML + sélecteur → Task 5 (CATEGORIES + i18n `cat.ml`). ✓
- Cheatsheet `ml.js` (NumPy/pandas + algos, réorg 6 sections, 4 nouveaux, retrait de python.js) → Task 1. ✓
- Approche A (canvas + StepPlayer, frames snapshot) → Tasks 3-5. ✓
- Renderer partagé → Task 4. ✓
- Datasets seedés déterministes → Task 2. ✓
- Snippet sklearn dans le panneau → Task 5 (`SNIPPET` + highlight). ✓
- Tests (CATS + générateurs purs) → Tasks 1-3. ✓
- Phasage : ce plan = P0 uniquement ; P1-P4 explicitement hors périmètre et non câblés (garde-fou Task 5 Step 4). ✓
- Heading `<h2>` par panneau (finding audit #5) : appliqué au nouveau panneau via `.panel-title`. ✓ (les panneaux existants restent hors périmètre — lot audit ultérieur.)

**Placeholder scan :** aucun TBD/TODO ; tout le code des nouveaux fichiers est fourni intégralement. Les items cheatsheet déplacés sont une opération de déplacement verbatim d'objets existants (pas un placeholder).

**Type consistency :** `Frame` = `{ centroids, assignments, inertia, iter, phase }` produit par `kmeansSteps` (Task 3) et consommé par `MlPlaneRenderer.draw` (Task 4, lit `centroids`+`assignments`) et le panneau (Task 5, lit `iter`+`inertia`). `blobs` renvoie `{x,y,label}` ; le renderer lit `x`/`y`, les algos ignorent `label`. `mulberry32(seed) → () => number` cohérent entre datasets.js et kmeans.js. Cohérent. ✓
