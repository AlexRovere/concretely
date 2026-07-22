# Audit des cheatsheets — 23 catégories (2026-07-22)

Audit mené par 6 agents parallèles. 3 axes : exactitude, clarté, manques + une section
« Bonnes pratiques » proposée par catégorie.

## A. Corrections factuelles (à appliquer)

| # | Catégorie | Item | Problème | Correction |
|---|---|---|---|---|
| 1 | vue | `vue-scoped-slots` | **Bug réel** : `v-for="item in items"` puis `:index="i"` — `i` non déclaré | `v-for="(item, i) in items"` |
| 2 | js | `js-structuredclone` | Faux : dit que `structuredClone` « ignore les fonctions » | Il **lève `DataCloneError`** (contrairement à `JSON.stringify`) |
| 3 | js | `js-truthy-falsy` | « 7 valeurs falsy » mais 8 listées (`-0`) | Retirer `-0` (garder 7) ou assumer 8 |
| 4 | ml | `py-ml-linear` | `r2_score` calculé sur les données d'entraînement (contredit `py-ml-workflow`) | split train/test avant `r2_score(y_te, …)` |
| 5 | kotlin | `kotlin-launch-async` | « async non-await avale l'exception » trompeur | Vrai surtout pour `GlobalScope`/`SupervisorJob` ; sous scope structuré l'exception se propage |
| 6 | kotlin | `kotlin-sealed` | `object Loading` daté | `data object Loading` (Kotlin 1.9+) |
| 7 | java | `java-requirenonnull` | Helpful NPE « depuis Java 14 » | Par défaut depuis **Java 15** (option dès 14) |
| 8 | c | `c-malloc-pattern` | Omet l'overflow de `n * sizeof *t` | Mentionner `calloc` (vérifie l'overflow) |
| 9 | sql | `sql-group-by` | « MySQL laxiste » obsolète | `ONLY_FULL_GROUP_BY` par défaut depuis MySQL 5.7 |
| 10 | git | `git-reflog`/`git-detached`/`git-gc-prune` | « reflog 90 jours » | Orphelins (reset --hard) nettoyés à **30 j** (`reflogExpireUnreachable`) |
| 11 | ruby | `ruby-pattern-matching` | `NoMatchingPatternKeyError` | `NoMatchingPatternError` (le Key… est un cas hash spécifique) |
| 12 | rust | `rust-result-combinators` | 2ᵉ exemple confus (erreur factice, nom `chaine` trompeur) | Réécrire avec un `and_then` simple |
| 13 | web | `web-curl-headers` | Note FR utilise `NUL` (Windows) sur un fichier `lang:'bash'` | `-o /dev/null` en FR aussi |
| 14 | cicd | `cc-oidc` | id trompeur : contenu = variables prédéfinies, pas OIDC | Renommer `cc-predefined-vars` (+ vrai item OIDC en BP) |
| 15 | k8s | `k8s-service-types` | `kubectl expose` → type par défaut non dit | Préciser ClusterIP |
| 16 | docker | `dk-run-basics` | `-e SECRET` sans réserve | Note : visible via `docker inspect`, préférer `--env-file`/secret manager |

## B. Manques récurrents (transverses)

- **Tests/tooling** : absents en **ruby** (RSpec/Bundler — le plus criant), sous-représentés en swift/kotlin.
- **Génériques/variance** : absents en swift, kotlin, java.
- **Contrôle d'accès / visibilité** : swift.
- **Concurrence** : rust (aucune section, contrairement à go).
- **Sécurité** : preflight CORS (web), RBAC (k8s), OIDC (cicd), secrets de build (docker).
- Détails par catégorie : voir rapports d'agents (dans l'historique de session).

## C. Sections « Bonnes pratiques » proposées

Une section par catégorie, ~5 items, ids `<cat>-bp-*` (uniques vs l'existant), bilingues.
Contenu rédigé par les agents, prêt à intégrer (section id normalisée à `<cat>-bp`).
Catégories couvertes : general, patterns, ml, js, ts, vue, react, swift, kotlin, java, c,
python, ruby, go, rust, sql, git, linux, os, web, docker, k8s, cicd.
