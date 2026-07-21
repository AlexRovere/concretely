# Catégorie ML — Design

*Date : 2026-07-21 · Statut : approuvé (design), à implémenter · Projet : Concretely (Vue 3 + Vite + Tailwind, Preflight désactivé)*

## Objectif

Ajouter une **catégorie « ML »** à part entière au site, avec des **visualizers animés pas-à-pas** (dans l'esprit des visualizers Sorting/Pathfinding existants) et une **cheatsheet dédiée**. La cheatsheet ML regroupe l'écosystème data/ML (NumPy, pandas, algorithmes scikit-learn), déplacé depuis la cheatsheet Python.

## Décisions cadrées (brainstorming)

1. **Forme** : catégorie ML complète (pas un seul onglet), implémentée de façon **incrémentale**.
2. **Visualizers retenus (5)** : K-means, Descente de gradient (régression linéaire), kNN (frontière de décision), Arbre de décision, Réseau de neurones.
3. **Cheatsheet** : nouveau `ml.js` contenant **NumPy/pandas + Algos ML**, **déplacés hors de `python.js`** (zéro duplication). `python.js` perd ses sections `data` et `ml`.
4. **Approche technique** : **A** — canvas + `StepPlayer` (cohérent avec les visualizers existants), **SVG** uniquement pour les schémas structurels (arbre, réseau). Pas de dépendance externe.

## Architecture

Chaque visualizer suit le pattern éprouvé (cf. `SortingPanel`), en **3 couches découplées** :

| Couche | Fichier | Rôle | Testabilité |
|---|---|---|---|
| Générateur d'étapes | `src/ml/<algo>.js` | Fonction **pure** `(données, params) → Frame[]` | ✅ unit tests |
| Renderer canvas | `src/render/mlPlaneRenderer.js` (partagé) | Dessine un `Frame` : scatter, centroïdes, droite, régions, coupes | canvas |
| Panneau Vue | `src/components/panels/Ml<Algo>Panel.vue` | Contrôles + `StepPlayer` + `wirePlayerButtons` + snippet sklearn | mount smoke |

**Contrat `Frame`** : chaque étape est un **snapshot complet** de l'état à une itération (ex. K-means : `{ assignments, centroids, inertia, iter }`). Le renderer redessine tout le frame → pas d'état incrémental fragile. `StepPlayer.load(frames)` pilote l'index et fournit Play/Step/Reset (réutilise `wirePlayerButtons` de `src/utils/viz.js`).

### Données & déterminisme

`src/ml/datasets.js` : générateurs 2D `blobs()`, `moons()`, `linear()` avec **PRNG seedé (mulberry32)** → datasets reproductibles, bouton « régénérer » (change la seed), et **tests déterministes**. Aucune dépendance à `Math.random` non seedé dans les générateurs testés.

## Les 5 visualizers

- **K-means** — dataset `blobs`, `k` réglable (2–6), centroïdes qui se recentrent, **inertie ↓** + n° d'itération, convergence automatique.
- **Descente de gradient** — `linear` + bruit : droite qui pivote pour épouser le nuage, `learning_rate` réglable, **mini-courbe de loss** (2ᵉ petit canvas) + epoch.
- **kNN** — plan coloré par **régions de décision**, `k` réglable, **clic pour ajouter un point** → recolore la frontière (interactif). Illustre l'effet de k (frontière déchiquetée ↔ lisse).
- **Arbre de décision** — **coupes axis-aligned** sur le plan (canvas) **synchronisées** avec le **diagramme d'arbre en SVG** qui se construit ; `max_depth` réglable ; profondeur / nb de feuilles.
- **Réseau de neurones** — dataset non-linéaire (`moons`), **surface de décision** qui se forme + loss, **schéma de couches en SVG**. Le plus complexe → construit en **dernier**.

Chaque panneau affiche aussi le **snippet sklearn correspondant** (via `highlight.js`) — le pont direct avec la cheatsheet.

## Cheatsheet `ml.js`

Contrainte du repo (tests) : **≥ 4 sections**, chacune **≥ 3 items**, **`id` d'item unique** across toutes les cheatsheets. Le contenu déplacé (19 items) est réorganisé + étoffé en **6 sections / ~23 items** :

1. **NumPy** (3) : ndarray & vectorisation, agrégations par axe & broadcasting, indexation booléenne & `np.where`.
2. **pandas** (5) : DataFrame créer/explorer, `loc`/`iloc` & filtres, `groupby`/`agg`, valeurs manquantes, `merge`/`concat`.
3. **Workflow & évaluation** (4) : workflow supervisé, métriques, **validation croisée\***, surapprentissage & régularisation.
4. **Modèles supervisés** (4) : régression linéaire, régression logistique, kNN, **SVM\***.
5. **Ensembles & non-supervisé** (3) : arbres & Random Forest, gradient boosting, k-means.
6. **MLOps & préparation** (4) : Pipeline & standardisation, persistance joblib, **GridSearchCV\***, **encodage catégoriel (OneHot)\***.

`*` = nouveaux items rédigés (bilingues FR/EN, même ton « concret + piège » que le reste). Les ids existants sont conservés (déjà uniques). `python.js` : suppression des sections `data` et `ml`.

## Câblage

- **`src/App.vue`** : `'ml'` ajouté à `CATEGORIES` (après le cluster langages) ; 5 entrées `TABS` (`cat: 'ml'`) : `mlkmeans`, `mlgradient`, `mlknn`, `mltree`, `mlneural` ; imports des 5 panneaux + entrées dans `componentMap`. L'onglet **Cheatsheet** (`cat: '*'`, déjà universel) rend automatiquement `cheatsheetFor('ml')`.
- **`src/cheatsheets/index.js`** : `import ml from './ml.js'` + entrée dans le registry `CHEATSHEETS`.
- **`src/i18n.js`** : `cat.ml` + `tabs.mlkmeans…tabs.mlneural` en **FR et EN**.

## Tests

- **`test/cheatsheets.test.js`** : ajouter `'ml'` au tableau `CATS` (et à toute assertion de comptage dépendante).
- **`test/ml.test.js`** (nouveau) : générateurs purs —
  - `datasets` : déterminisme (même seed → même sortie), formes/tailles correctes ;
  - K-means : inertie **non-croissante** entre itérations, **stable** après convergence, `k` clusters non vides sur `blobs` séparés ;
  - Gradient : **loss décroissante**, convergence vers une pente plausible sur données linéaires ;
  - kNN : frontière **déterministe**, cohérence du vote majoritaire ;
  - Arbre : impureté (Gini) **décroissante** avec la profondeur.

Objectif de couverture du projet : 80 % (les générateurs purs sont l'essentiel de la logique).

## Phasage (multi-sessions)

- ✅ **P0** (livré le 2026-07-21) — Scaffold catégorie + `ml.js` (cheatsheet complète) + `datasets.js` + `mlPlaneRenderer.js` + **K-means** bout-en-bout (générateur, renderer, panneau, i18n, câblage, tests). Valide toute l'architecture.
- **P1** — Descente de gradient (+ mini-courbe de loss).
- **P2** — kNN (+ interaction clic).
- **P3** — Arbre de décision (+ diagramme SVG).
- **P4** — Réseau de neurones (surface de décision + schéma SVG).

Chaque phase est une PR autonome, testée et verte, sans régression sur les cheatsheets existantes.

## Hors périmètre (YAGNI)

- Pas d'onglet Quiz ML dédié (l'onglet quiz universel reste, sans questions ML pour l'instant).
- Pas d'import de dataset utilisateur ni d'entraînement réel côté navigateur — uniquement des implémentations JS pédagogiques sur données 2D synthétiques.
- Pas de librairie ML/charting externe.
