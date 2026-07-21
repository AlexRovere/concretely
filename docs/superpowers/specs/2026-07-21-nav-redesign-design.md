# Refonte navigation — Design

*Date : 2026-07-21 · Statut : approuvé (design) · Projet : Concretely (Vue 3 + Vite, SPA statique, Tailwind Preflight off)*

## Objectif

Refondre la navigation pour améliorer la découvrabilité des ~65 vues (reco #3 de l'audit UX) et permettre le partage d'URLs :

1. **Sidebar gauche collapsible** portant le sélecteur de catégorie + les paramètres (thème, langue). Le strip d'onglets horizontal est conservé en haut du contenu.
2. **Page d'accueil** présentant une grille de cards par catégorie, groupées.
3. **Router hash maison** (zéro dépendance) pour des URLs partageables.

## Décisions cadrées (brainstorming)

1. **Onglets** : conservés dans le strip horizontal en haut du contenu (sidebar = catégories + params seulement).
2. **Accueil** : une card par catégorie, en 3 groupes (Langages / Concepts / Outils & infra).
3. **Router** : maison, basé sur le hash (`#/…`), zéro dépendance — robuste sur hébergement statique (rechargement OK, pas de fallback 404).
4. **Ordre** : router d'abord (fondation), puis accueil, puis sidebar.

## Architecture

### Router hash (`src/composables/useHashRoute.ts`)

- Format d'URL : `#/` = accueil · `#/<cat>` = catégorie (redirige vers son 1er onglet) · `#/<cat>/<mode>` = vue précise (ex. `#/swift/arc`).
- Source de vérité pilotée par l'URL : le composable expose `cat`/`mode` réactifs (ou `view: 'home'`), les met à jour au `hashchange` (back/forward), et réécrit le hash quand l'app change de vue.
- **Validation** : `cat` doit ∈ `CATEGORIES`, `mode` doit être un onglet visible de cette catégorie ; sinon → accueil. Une catégorie seule (`#/swift`) résout vers son premier onglet visible.
- Logique pure et testable : `parseHash(hash) → route`, `formatRoute(route) → hash` (fonctions pures, tests unitaires round-trip + validation). Le composable ajoute seulement le pont réactif + les listeners.

### Layout desktop (>920px)

- **`SideNav` (nouveau)** : panneau gauche persistant, collapsible via ☰. Contient la liste des catégories (groupées), `SettingsFields` (apparence/thème, composant existant) et le sélecteur de langue. État ouvert/fermé persistant (localStorage, clé dédiée).
- **Header allégé** : ☰ (toggle sidebar) + logo (→ accueil) + strip d'onglets de la catégorie active + bouton 🔍 Ctrl-K. Le `<select>` catégorie, le sélecteur de langue et `SettingsMenu` quittent le header (ils vivent dans la sidebar) — règle l'encombrement pointé par l'audit.

### Mobile (≤920px)

- Le `NavDrawer` overlay existant est conservé (déjà : catégories + onglets + params + langue). La sidebar desktop et le drawer partagent la même liste de catégories/params ; pas de régression mobile.

### Page d'accueil (`HomePanel`, route `#/`)

- Grille de **cards par catégorie** en 3 groupes :
  - **Langages** : js, ts, python, vue, swift, ruby, kotlin, java, go, rust, c
  - **Concepts** : general, patterns, ml
  - **Outils & infra** : sql, git, linux, os, web, docker, k8s
- Chaque card : emoji + nom + accroche courte (bilingue) → navigue vers `#/<cat>` (1er onglet).
- Nouveau `src/categoryMeta.js` : `{ [cat]: { icon, group, tagline:{fr,en} } }` pour toutes les catégories.
- L'accueil devient la **route par défaut** au premier chargement (au lieu de `mode='sorting'`). Le logo header y ramène.

## Impact sur l'existant

- `src/App.vue` : `mode`/`cat` deviennent pilotés par le router ; ajout d'une vue `home` ; extraction du chrome de nav vers `SideNav` (desktop) ; header allégé. `HomePanel` et `SideNav` s'ajoutent au rendu.
- `src/components/panels/HomePanel.vue`, `src/components/SideNav.vue`, `src/composables/useHashRoute.ts`, `src/categoryMeta.js` : nouveaux.
- `NavDrawer.vue` : inchangé fonctionnellement (peut réutiliser `categoryMeta` pour les icônes, optionnel).
- i18n : clés accueil (titres de groupes, accroches via `categoryMeta`).

## Découpage (multi-sessions, une PR par phase)

- ✅ **R1** (livré le 2026-07-21) — Router hash : `hashRoute.js` (`parseHash`/`formatRoute`/`resolveRoute`, tests purs) + branchement `App.vue` (cat/mode ↔ URL, back/forward, validation, deep-link). Aucun changement visuel ; URLs partageables opérationnelles.
- ✅ **R2** (livré le 2026-07-21) — Page d'accueil : `HomePanel` + `categoryMeta` (test de complétude) + cards groupées + logo→accueil + route `#/` par défaut. `CATEGORIES` extrait dans `nav.js`.
- ✅ **R3** (livré le 2026-07-21) — Sidebar desktop : `SideNav` collapsible (catégories + params + langue) + header allégé + toggle persistant (localStorage) ; mobile inchangé (NavDrawer).

## Tests

- `test/hashRoute.test.js` : `parseHash`/`formatRoute` (round-trip, catégorie seule → 1er onglet, hash invalide → accueil, `#/` → home).
- `test/categoryMeta.test.js` : chaque catégorie de `CATEGORIES` a une entrée complète (icon, group ∈ {languages, concepts, tools}, tagline fr+en) ; pas d'entrée orpheline.
- R3/R2 UI : build + `vue-tsc` type-check ; pas de régression sur la suite existante.

## Hors périmètre (YAGNI)

- Pas d'URL profonde vers un snippet précis de cheatsheet (seulement cat/mode).
- Pas de migration vers vue-router / history mode (hash suffit pour le statique).
- Pas de recherche/filtre sur la page d'accueil (la palette Ctrl-K couvre déjà la recherche fine).
- Pas de refonte du strip d'onglets ni des panneaux existants.
