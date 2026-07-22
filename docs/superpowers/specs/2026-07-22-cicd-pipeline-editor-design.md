# Éditeur de pipeline CI/CD — Design

*Date : 2026-07-22 · Statut : approuvé (design) · Projet : Concretely (Vue 3 + Vite, SPA statique, zéro dépendance runtime)*

## Objectif

Nouvel onglet **« Éditeur de pipeline »** dans la catégorie CI/CD : à gauche un éditeur YAML (CodeMirror), à droite le **pipeline dessiné en direct** (SVG). Bascule **GitLab / GitHub Actions**. « Rendre concret » le YAML CI en montrant le graphe stages → jobs → dépendances (`needs`).

## Décisions cadrées (brainstorming)

1. **Formats** : GitLab CI **et** GitHub Actions, via une bascule.
2. **Parseur** : mini-parseur YAML **fait maison** (sous-ensemble CI), zéro dépendance ; le YAML tordu (ancres, multi-docs) n'est pas géré → erreur claire.
3. **Rendu** : SVG fait main (précédent : `renderDagSvg` de Git).
4. **Live** : le graphe se redessine en tapant (léger debounce).

## Architecture (cœur pur → rendu → panneau)

1. **`src/pipeline/yaml.js`** — `parseYaml(text) → { value } | { error:{ line, message } }`. Sous-ensemble : maps indentées, listes `- `, flow inline `{}` / `[]`, scalaires (nombres, bool, null, chaînes quotées ou nues), commentaires `#`. Pas d'ancres/multi-docs (→ erreur).
2. **`src/pipeline/model.js`** — adaptateurs `gitlabModel(obj)` et `githubModel(obj)` → modèle commun :
   `PipelineModel = { format:'gitlab'|'github', stages: string[], jobs: [{ id, stage?, needs: string[] }], errors: string[] }`.
   - GitLab : `stages:` ordonnés ; chaque job a `stage:` (défaut `test`) et `needs:`.
   - GitHub : `jobs:` sous la racine ; `needs:` (string ou liste) ; pas de stages.
   - Détecte : `needs` vers un job inexistant, **cycle** (→ `errors`).
3. **`src/pipeline/layout.js`** — `layout(model) → { nodes:[{ id, col, row, label }], edges:[{ from, to }], cols, rows }`. Pur, déterministe.
   - GitLab : `col` = index du stage du job.
   - GitHub : `col` = **profondeur topologique** (plus long chemin depuis une racine via `needs`).
   - `row` = empilement stable dans la colonne.
4. **`src/render/pipelineSvg.js`** — `renderPipelineSvg(laidOut, { stages }) → string` : nœuds = rectangles arrondis étiquetés, arêtes fléchées (`needs`), en-têtes de colonne (stage GitLab / niveau GitHub). Thémé via variables CSS.
5. **`src/components/panels/CicdPipelinePanel.vue`** — éditeur CodeMirror (mode `yaml` ajouté à `editor.js`) + SVG live (debounce ~150 ms) + bascule GitLab/GitHub + exemples préchargés par format + bannière d'erreur (le dernier graphe valide reste affiché en cas d'erreur).

## Éditeur
Ajouter `yaml` à `src/playground/editor.js` (`LANGS.yaml = () => StreamLanguage.define(yaml)` depuis `@codemirror/legacy-modes/mode/yaml`, déjà présent dans les dépendances legacy-modes).

## Câblage
- `src/App.vue` : onglet `{ mode:'cicdpipeline', key:'tabs.cicdpipeline', cat:'cicd' }` + import + entrée `panels`.
- `src/i18n.js` : `tabs.cicdpipeline`, libellés (bascule, erreurs, exemples) FR + EN.
- CSS : layout deux colonnes (éditeur | graphe), bannière d'erreur, styles SVG.

## Tests (purs, `node --test`)
- `test/pipelineYaml.test.js` : maps/listes/inline/scalaires/commentaires ; indentation ; malformé → `error` avec ligne.
- `test/pipelineModel.test.js` : extraction GitLab (stages+jobs+needs) et GitHub (jobs+needs) ; `needs` inconnu → erreur ; **cycle → erreur** ; défaut de stage.
- `test/pipelineLayout.test.js` : positions déterministes ; colonnes GitLab = ordre des stages ; colonnes GitHub = profondeur DAG ; pas de chevauchement de lignes.
- SVG + éditeur : validés dans le navigateur (E2).

## Découpage (2 phases, une PR chacune)
- **E1 — Cœur pur** : `yaml.js` + `model.js` + `layout.js` + les 3 fichiers de tests. Aucune UI.
- **E2 — Panneau + SVG + câblage** : `pipelineSvg.js` + `CicdPipelinePanel.vue` + mode yaml éditeur + onglet + i18n + CSS. Validation navigateur.

## Hors périmètre (YAGNI)
- Pas d'exécution réelle du pipeline.
- Pas de validation de schéma exhaustive (structure + `needs` seulement).
- `include`/`extends`/`matrix`/`parallel` non dépliés dans le graphe (au mieux affichés comme attribut, sinon ignorés).
- Pas d'ancres YAML ni multi-documents.
