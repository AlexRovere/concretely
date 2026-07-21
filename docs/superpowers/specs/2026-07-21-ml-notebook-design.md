# Notebook Pyodide (catégorie ML) — Design

*Date : 2026-07-21 · Statut : approuvé (design) · Projet : Concretely (Vue 3 + Vite, SPA statique)*

## Objectif

Ajouter un onglet **Notebook** à la catégorie ML : un notebook pédagogique tournant sur Pyodide (CPython/WASM, déjà utilisé par le Playground), avec cellules **code + markdown**, **état de kernel persistant** entre cellules, et **sorties riches** (graphes matplotlib en PNG, DataFrames pandas en tables HTML). numpy/pandas/matplotlib/**scikit-learn** chargés à la demande.

## Décisions cadrées (brainstorming)

1. **Ambition** : notebook ML pédagogique complet, sorties riches.
2. **Packages** : numpy + pandas + matplotlib + **scikit-learn**, chargés à la demande (`loadPackagesFromImports`).
3. **Cellules** : **code + markdown** (rendu markdown minimal fait maison, zéro dépendance).
4. **Contenu** : 4 notebooks curatés (NumPy & pandas, Régression linéaire, K-means, Classification & métriques) + un scratch vierge.
5. **Entrée** : onglet `mlnotebook` dans la catégorie ML.

## Architecture

### Moteur — `src/playground/runNotebook.js`
Étend le pattern de `runpython.js` (loader Pyodide mémoïsé, CDN jsDelivr, sink stdout/stderr).
- **`createKernel()`** → `{ run(code, {onLoading}), reset() }`. Chaque notebook a son **propre dict de globals** Pyodide → l'état persiste entre cellules ; `reset()` = nouveau dict (« Restart kernel »). Isolé du Playground.
- **Packages auto** : `pyodide.loadPackagesFromImports(code)` avant exécution → charge numpy/pandas/matplotlib/sklearn en détectant les `import`.
- **Capture des sorties**, dans l'ordre : `stdout`/`stderr` (stream) → **figures matplotlib** (helper Python `savefig`→PNG base64, seulement si matplotlib chargé) → **dernière expression** (`_repr_html_` → table HTML pour les DataFrame, sinon texte) → **erreurs** (queue du traceback).
- Modèle de sortie : `outputs: [{ type:'stream'|'html'|'image'|'error', … }]`.
- Non testable en `node --test` (wasm/réseau) → **vérifié manuellement** (dev server) en N2.

### Rendu markdown — `src/notebooks/markdown.js`
`renderMarkdown(src) → htmlSafe`. Mini-renderer maison : titres (#/##/###), gras/italique, code inline + blocs, listes (- et 1.), liens, paragraphes. **HTML échappé d'abord**, puis whitelist de transformations → pas d'injection. Pur, **testable unitairement**.

### Modèle & contenu — `src/notebooks/index.js`
- Schéma : `{ id, title:{fr,en}, cells:[{ type:'code'|'markdown', source }] }`.
- `isValidNotebook(nb)` (pur, testable) ; `NOTEBOOKS` = tableau des notebooks + scratch.
- Édits utilisateur persistés en **localStorage** (clé par notebook) ; « Reset » restaure l'original.

### Panneau — `src/components/panels/MlNotebookPanel.vue`
- Sélecteur de notebook · barre d'outils : **Run all** · **Restart** · **Reset** · add cell (code/markdown).
- Cellule code : éditeur CodeMirror (réutilise `src/playground/editor.js`), ▶, zone de sortie (stream/html/image/error), supprimer.
- Cellule markdown : rendue par défaut, clic → édition (textarea), re-rendu au blur.
- Indicateur de chargement (Pyodide + packages au 1er run).

## Découpage (une PR par phase)

- **N1 — Moteur & pièces pures** : `runNotebook.js` (moteur, écrit) + `markdown.js` (+ tests) + modèle `notebooks/index.js` (validation + tests de complétude) + notebooks « Régression linéaire » et scratch. Pas d'UI ; parties pures vertes, moteur à valider en N2.
- **N2 — Panneau (1 notebook)** : `MlNotebookPanel` bout-en-bout sur « Régression linéaire » (cellules code+md, run cellule/all, restart, rendu des sorties riches) + câblage onglet ML. **Validation navigateur.**
- **N3 — Multi-notebooks + persistance** : sélecteur, les 3 notebooks restants (NumPy & pandas, K-means, Classification & métriques), localStorage, reset, add/delete cell.

## Tests
- `test/markdown.test.js` : rendu (titres, gras, code, listes, liens) + **échappement HTML** (`<script>` neutralisé).
- `test/notebooks.test.js` : chaque notebook de `NOTEBOOKS` est bien formé (`isValidNotebook`), types de cellules valides, sources non vides pour le code.
- Runtime Pyodide : non testable en CI → vérifié manuellement à chaque phase (signalé).

## Hors périmètre (YAGNI)
- Pas d'export `.ipynb`, pas de réordonnancement drag-drop, pas d'autocomplétion Python, pas de partage d'URL du notebook (state en localStorage).
- Pas de dépendance externe (markdown maison, packages via Pyodide).
