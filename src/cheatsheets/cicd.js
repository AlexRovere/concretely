/**
 * Cheatsheet CI/CD — GitLab CI et GitHub Actions côte à côte. Chaque item met
 * le même besoin en regard sur les deux plateformes (bloc unique, séparé par un
 * en-tête commenté), avec une note « correspondance + piège ».
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'cicd',
  lang: 'yaml',
  sections: [
    {
      id: 'structure',
      title: { fr: 'Structure & jobs', en: 'Structure & jobs' },
      items: [
        {
          id: 'cc-hello',
          title: { fr: 'Le pipeline minimal', en: 'The minimal pipeline' },
          code: `# --- GitLab CI (.gitlab-ci.yml) ---
build:
  script:
    - echo "hello"

# --- GitHub Actions (.github/workflows/ci.yml) ---
name: ci
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "hello"`,
          note: {
            fr: `GitLab lit UN fichier .gitlab-ci.yml à la racine ; GitHub lit TOUS les .yml de .github/workflows/. Piège : sur GitHub il faut déclarer on: (le déclencheur) et runs-on: (la machine), sinon le job ne tourne jamais — GitLab a des défauts implicites.`,
            en: `GitLab reads ONE .gitlab-ci.yml at the root; GitHub reads EVERY .yml in .github/workflows/. Gotcha: on GitHub you must declare on: (the trigger) and runs-on: (the machine), or the job never runs — GitLab has implicit defaults.`,
          },
        },
        {
          id: 'cc-stages',
          title: { fr: 'Étapes & ordre', en: 'Stages & order' },
          code: `# --- GitLab : stages ordonnés, jobs parallèles dans un stage ---
stages: [build, test]
compile:  { stage: build, script: [make] }
unit:     { stage: test,  script: [pytest] }

# --- GitHub : pas de stages, on ordonne via needs: ---
jobs:
  compile: { runs-on: ubuntu-latest, steps: [{ run: make }] }
  unit:
    needs: compile          # attend compile
    runs-on: ubuntu-latest
    steps: [{ run: pytest }]`,
          note: {
            fr: `GitLab groupe les jobs en stages séquentiels (tout un stage en parallèle, puis le suivant). GitHub n'a pas de stages : chaque job est indépendant et l'ordre se déclare avec needs:. Piège : sans needs sur GitHub, tous les jobs démarrent EN MÊME TEMPS.`,
            en: `GitLab groups jobs into sequential stages (a whole stage in parallel, then the next). GitHub has no stages: each job is independent and order is declared with needs:. Gotcha: without needs on GitHub, all jobs start AT ONCE.`,
          },
        },
        {
          id: 'cc-steps-script',
          title: { fr: 'Étapes vs script', en: 'Steps vs script' },
          code: `# --- GitLab : script = liste de commandes shell ---
job:
  before_script: [npm ci]
  script:
    - npm run build
    - npm test

# --- GitHub : steps = liste d'actions OU de commandes ---
steps:
  - uses: actions/checkout@v4   # une action réutilisable
  - run: npm ci                 # une commande shell
  - run: npm run build`,
          note: {
            fr: `Un « step » GitHub peut être une commande (run:) OU une action réutilisable (uses:) — les actions du Marketplace sont la grande différence. GitLab n'a que du shell (script/before_script/after_script). Piège : GitLab clone le repo tout seul ; GitHub exige un step actions/checkout explicite.`,
            en: `A GitHub "step" can be a command (run:) OR a reusable action (uses:) — Marketplace actions are the big difference. GitLab is shell-only (script/before_script/after_script). Gotcha: GitLab clones the repo for you; GitHub requires an explicit actions/checkout step.`,
          },
        },
      ],
    },
    {
      id: 'triggers',
      title: { fr: 'Déclencheurs', en: 'Triggers' },
      items: [
        {
          id: 'cc-on-push',
          title: { fr: 'Push & branches', en: 'Push & branches' },
          code: `# --- GitLab : rules / only ---
deploy:
  script: [./deploy.sh]
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'

# --- GitHub : on.push.branches ---
on:
  push:
    branches: [main]`,
          note: {
            fr: `GitLab filtre par job avec rules: (if: sur des variables) ; GitHub filtre au niveau du workflow avec on.push.branches. Piège : rules: remplace l'ancien only/except — évite de mélanger les deux dans un même job.`,
            en: `GitLab filters per job with rules: (if: on variables); GitHub filters at the workflow level with on.push.branches. Gotcha: rules: replaces the old only/except — don't mix both in the same job.`,
          },
        },
        {
          id: 'cc-mr-pr',
          title: { fr: 'Merge/Pull requests', en: 'Merge/Pull requests' },
          code: `# --- GitLab : événement merge request ---
test:
  script: [pytest]
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

# --- GitHub : événement pull_request ---
on:
  pull_request:
    branches: [main]`,
          note: {
            fr: `Même concept, noms différents : « merge request » (GitLab) = « pull request » (GitHub). Piège : sur GitHub, pull_request s'exécute sur une fusion simulée (merge commit), pas sur le commit de la branche — utile à savoir pour les tests.`,
            en: `Same concept, different names: "merge request" (GitLab) = "pull request" (GitHub). Gotcha: on GitHub, pull_request runs on a simulated merge (merge commit), not the branch commit — worth knowing for tests.`,
          },
        },
        {
          id: 'cc-schedule',
          title: { fr: 'Planifié & manuel', en: 'Scheduled & manual' },
          code: `# --- GitLab : schedules (UI) + when: manual ---
nightly:
  script: [./nightly.sh]
  rules:
    - if: '$CI_PIPELINE_SOURCE == "schedule"'
release:
  script: [./release.sh]
  when: manual            # bouton « play » dans l'UI

# --- GitHub : cron + workflow_dispatch ---
on:
  schedule:
    - cron: '0 3 * * *'   # 3h du matin
  workflow_dispatch: {}   # bouton « Run workflow »`,
          note: {
            fr: `Tâche planifiée : cron déclaré dans l'UI GitLab (ou détecté via $CI_PIPELINE_SOURCE) vs cron: inline sur GitHub. Déclenchement manuel : when: manual (GitLab) vs workflow_dispatch (GitHub). Piège : le cron GitHub est en UTC et peut se décaler de quelques minutes sous charge.`,
            en: `Scheduled run: cron declared in the GitLab UI (or detected via $CI_PIPELINE_SOURCE) vs inline cron: on GitHub. Manual trigger: when: manual (GitLab) vs workflow_dispatch (GitHub). Gotcha: GitHub cron is in UTC and can drift a few minutes under load.`,
          },
        },
      ],
    },
    {
      id: 'artifacts',
      title: { fr: 'Dépendances & artefacts', en: 'Dependencies & artifacts' },
      items: [
        {
          id: 'cc-needs',
          title: { fr: 'Dépendances entre jobs', en: 'Job dependencies' },
          code: `# --- GitLab : needs = DAG (démarre dès que possible) ---
deploy:
  stage: deploy
  needs: [build]     # sans attendre tout le stage build

# --- GitHub : needs = attend le(s) job(s) ---
jobs:
  deploy:
    needs: [build]
    runs-on: ubuntu-latest
    steps: [{ run: ./deploy.sh }]`,
          note: {
            fr: `needs: existe des deux côtés et crée un graphe de dépendances (DAG). Sur GitLab il permet même de « sauter » l'attente d'un stage entier. Piège : un job qui needs un autre récupère ses artefacts automatiquement sur GitLab, mais PAS sur GitHub (voir upload/download-artifact).`,
            en: `needs: exists on both sides and builds a dependency graph (DAG). On GitLab it even lets a job skip waiting for a whole stage. Gotcha: a job that needs another auto-receives its artifacts on GitLab, but NOT on GitHub (see upload/download-artifact).`,
          },
        },
        {
          id: 'cc-artifacts',
          title: { fr: 'Artefacts', en: 'Artifacts' },
          code: `# --- GitLab : artifacts.paths (passés en aval auto) ---
build:
  script: [make]
  artifacts:
    paths: [dist/]
    expire_in: 1 week

# --- GitHub : upload puis download explicites ---
- uses: actions/upload-artifact@v4
  with: { name: dist, path: dist/ }
# … dans un autre job :
- uses: actions/download-artifact@v4
  with: { name: dist }`,
          note: {
            fr: `GitLab passe les artefacts aux jobs suivants automatiquement (via les stages/needs). GitHub exige upload-artifact dans un job et download-artifact dans l'autre — rien n'est partagé implicitement. Piège : les artefacts ne sont PAS du cache, ils servent à transporter des résultats de build, pas à accélérer.`,
            en: `GitLab passes artifacts to downstream jobs automatically (via stages/needs). GitHub requires upload-artifact in one job and download-artifact in the other — nothing is shared implicitly. Gotcha: artifacts are NOT cache; they carry build outputs, they don't speed things up.`,
          },
        },
        {
          id: 'cc-services',
          title: { fr: 'Services (DB, etc.)', en: 'Services (DB, etc.)' },
          code: `# --- GitLab : services ---
test:
  services: [postgres:16]
  variables: { POSTGRES_PASSWORD: secret }
  script: [pytest]

# --- GitHub : services (sous le job) ---
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: secret }
    steps: [{ run: pytest }]`,
          note: {
            fr: `Les deux lancent des conteneurs annexes (base de données, Redis…) le temps du job. Piège : le nom d'hôte du service diffère — sur GitLab c'est le nom de l'image (postgres), sur GitHub c'est la clé sous services: (ici postgres aussi, mais tu la choisis).`,
            en: `Both spin up side containers (database, Redis…) for the job's lifetime. Gotcha: the service hostname differs — on GitLab it's the image name (postgres), on GitHub it's the key under services: (here also postgres, but you pick it).`,
          },
        },
      ],
    },
    {
      id: 'cache',
      title: { fr: 'Cache', en: 'Cache' },
      items: [
        {
          id: 'cc-cache-deps',
          title: { fr: 'Cacher les dépendances', en: 'Caching dependencies' },
          code: `# --- GitLab : cache.key + paths ---
job:
  cache:
    key:
      files: [package-lock.json]
    paths: [node_modules/]
  script: [npm ci]

# --- GitHub : actions/cache ---
- uses: actions/cache@v4
  with:
    path: node_modules
    key: npm-\${{ hashFiles('package-lock.json') }}`,
          note: {
            fr: `Même idée : une clé dérivée du lockfile invalide le cache quand les dépendances changent. Piège : le cache accélère mais n'est PAS garanti (il peut être évincé) — le build doit rester correct cache vide. Ne jamais y mettre de secret.`,
            en: `Same idea: a key derived from the lockfile invalidates the cache when deps change. Gotcha: cache speeds things up but is NOT guaranteed (it can be evicted) — the build must still work with an empty cache. Never store a secret in it.`,
          },
        },
        {
          id: 'cc-cache-setup',
          title: { fr: 'Cache intégré (setup-*)', en: 'Built-in cache (setup-*)' },
          code: `# --- GitLab : à faire à la main (cache: ci-dessus) ---

# --- GitHub : cache géré par les actions setup-* ---
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm          # gère le cache tout seul
- run: npm ci`,
          note: {
            fr: `Sur GitHub, les actions setup-node/setup-python/… savent cacher les dépendances via un simple cache: npm — plus besoin d'actions/cache pour les cas courants. GitLab n'a pas d'équivalent « clé en main » : on configure cache: soi-même. Piège : ne cumule pas cache: dans setup-node ET un actions/cache sur le même dossier.`,
            en: `On GitHub, setup-node/setup-python/… can cache dependencies via a simple cache: npm — no actions/cache needed for common cases. GitLab has no turnkey equivalent: you configure cache: yourself. Gotcha: don't stack cache: in setup-node AND an actions/cache on the same folder.`,
          },
        },
        {
          id: 'cc-cache-policy',
          title: { fr: 'Politique de cache', en: 'Cache policy' },
          code: `# --- GitLab : policy pull / push / pull-push ---
install:
  cache:
    paths: [node_modules/]
    policy: pull-push    # lit puis réécrit (défaut)
test:
  cache:
    paths: [node_modules/]
    policy: pull         # lecture seule, plus rapide

# --- GitHub : restore-keys pour un repli ---
- uses: actions/cache@v4
  with:
    path: node_modules
    key: npm-\${{ hashFiles('package-lock.json') }}
    restore-keys: |
      npm-`,
          note: {
            fr: `GitLab règle finement qui écrit le cache (policy: pull en lecture seule pour les jobs qui ne l'actualisent pas). GitHub propose restore-keys : une clé de repli partielle si la clé exacte manque. Piège : sans restore-keys, un lockfile modifié = cache totalement raté (repart de zéro).`,
            en: `GitLab tunes who writes the cache (policy: pull, read-only, for jobs that don't refresh it). GitHub offers restore-keys: a partial fallback when the exact key is missing. Gotcha: without restore-keys, a changed lockfile = a full cache miss (starts from scratch).`,
          },
        },
      ],
    },
    {
      id: 'secrets',
      title: { fr: 'Variables & secrets', en: 'Variables & secrets' },
      items: [
        {
          id: 'cc-vars',
          title: { fr: 'Variables', en: 'Variables' },
          code: `# --- GitLab : variables (globales ou par job) ---
variables:
  NODE_ENV: production
job:
  script: [echo $NODE_ENV]

# --- GitHub : env (workflow, job ou step) ---
env:
  NODE_ENV: production
jobs:
  build:
    steps: [{ run: echo $NODE_ENV }]`,
          note: {
            fr: `Variables non secrètes : variables: (GitLab) vs env: (GitHub), toutes deux déclarables à plusieurs niveaux (global/job/step). Piège : la portée la plus fine gagne — une variable de job écrase la globale du même nom.`,
            en: `Non-secret variables: variables: (GitLab) vs env: (GitHub), both settable at several levels (global/job/step). Gotcha: the narrowest scope wins — a job-level variable overrides a global one of the same name.`,
          },
        },
        {
          id: 'cc-secrets',
          title: { fr: 'Secrets', en: 'Secrets' },
          code: `# --- GitLab : variables masquées/protégées (UI) ---
deploy:
  script:
    - curl -H "Token: $API_TOKEN" ...   # défini en CI/CD Settings

# --- GitHub : secrets.* injectés explicitement ---
steps:
  - run: curl -H "Token: $API_TOKEN" ...
    env:
      API_TOKEN: \${{ secrets.API_TOKEN }}`,
          note: {
            fr: `Les secrets se définissent dans l'UI des deux côtés, JAMAIS dans le YAML. GitLab les injecte comme variables d'env directement ; GitHub exige de mapper secrets.X vers une variable via env:. Piège : un secret non « masked » (GitLab) peut fuiter dans les logs — vérifie le masquage.`,
            en: `Secrets are defined in the UI on both sides, NEVER in YAML. GitLab injects them as env vars directly; GitHub requires mapping secrets.X to a variable via env:. Gotcha: an unmasked secret (GitLab) can leak into logs — check masking.`,
          },
        },
        {
          id: 'cc-predefined-vars',
          title: { fr: 'Contexte & prédéfinies', en: 'Context & predefined' },
          code: `# --- GitLab : variables CI_* prédéfinies ---
job:
  script:
    - echo $CI_COMMIT_SHA        # commit
    - echo $CI_PROJECT_DIR       # racine du repo
    - echo $CI_PIPELINE_SOURCE   # push / schedule / merge_request_event

# --- GitHub : contextes github.*, runner.*, env.* ---
steps:
  - run: echo \${{ github.sha }}
  - run: echo \${{ github.ref }}
  - run: echo \${{ github.event_name }}`,
          note: {
            fr: `Chaque plateforme expose des variables prédéfinies : $CI_* (GitLab, variables d'env) vs contextes \${{ github.* }} (GitHub, interpolés à l'expansion). Piège : les contextes GitHub \${{ }} sont évalués AVANT le shell — ne les utilise pas pour des données non fiables sans guillemets (risque d'injection).`,
            en: `Each platform exposes predefined variables: $CI_* (GitLab, env vars) vs \${{ github.* }} contexts (GitHub, expanded before the shell). Gotcha: GitHub \${{ }} contexts are evaluated BEFORE the shell — don't use them for untrusted data without quoting (injection risk).`,
          },
        },
      ],
    },
    {
      id: 'matrix',
      title: { fr: 'Matrix & déploiement', en: 'Matrix & deployment' },
      items: [
        {
          id: 'cc-matrix',
          title: { fr: 'Matrice de builds', en: 'Build matrix' },
          code: `# --- GitLab : parallel.matrix ---
test:
  parallel:
    matrix:
      - VERSION: ["18", "20", "22"]
  script: [nvm use $VERSION, npm test]

# --- GitHub : strategy.matrix ---
jobs:
  test:
    strategy:
      matrix:
        version: [18, 20, 22]
    steps:
      - uses: actions/setup-node@v4
        with: { node-version: \${{ matrix.version }} }`,
          note: {
            fr: `Une matrice décline un job sur plusieurs valeurs (versions, OS…) en parallèle. Piège : par défaut GitHub arrête toute la matrice au premier échec (fail-fast) — mets strategy.fail-fast: false pour voir tous les résultats.`,
            en: `A matrix fans a job out across several values (versions, OS…) in parallel. Gotcha: by default GitHub cancels the whole matrix on the first failure (fail-fast) — set strategy.fail-fast: false to see every result.`,
          },
        },
        {
          id: 'cc-environments',
          title: { fr: 'Environnements', en: 'Environments' },
          code: `# --- GitLab : environment ---
deploy_prod:
  script: [./deploy.sh]
  environment:
    name: production
    url: https://app.example.com
  when: manual

# --- GitHub : environment (avec règles de protection) ---
jobs:
  deploy:
    environment:
      name: production
      url: https://app.example.com
    runs-on: ubuntu-latest
    steps: [{ run: ./deploy.sh }]`,
          note: {
            fr: `Un « environnement » nommé (staging, production) suit les déploiements et peut imposer une approbation. Piège : GitHub attache les règles de protection (reviewers requis, délai) à l'environnement dans l'UI — le YAML ne fait que le référencer.`,
            en: `A named "environment" (staging, production) tracks deployments and can require approval. Gotcha: GitHub attaches protection rules (required reviewers, wait timer) to the environment in the UI — the YAML only references it.`,
          },
        },
        {
          id: 'cc-reuse',
          title: { fr: 'Réutilisation', en: 'Reuse' },
          code: `# --- GitLab : extends + include ---
include: [{ local: '.ci/templates.yml' }]
.base: { image: node:20, before_script: [npm ci] }
test:
  extends: .base
  script: [npm test]

# --- GitHub : workflow réutilisable (workflow_call) ---
# .github/workflows/reusable.yml
on: { workflow_call: {} }
# appelant :
jobs:
  ci:
    uses: ./.github/workflows/reusable.yml`,
          note: {
            fr: `Éviter le copier-coller : extends: (héritage de job) + include: (fichiers importés) sur GitLab ; workflows réutilisables (on: workflow_call + uses:) et actions composites sur GitHub. Piège : un job « caché » GitLab commence par un point (.base) et ne s'exécute jamais seul — il sert uniquement de modèle.`,
            en: `Avoid copy-paste: extends: (job inheritance) + include: (imported files) on GitLab; reusable workflows (on: workflow_call + uses:) and composite actions on GitHub. Gotcha: a "hidden" GitLab job starts with a dot (.base) and never runs on its own — it's only a template.`,
          },
        },
      ],
    },
    {
      id: 'cicd-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'cicd-bp-least-privilege-tokens',
          title: { fr: 'Permissions minimales du token CI par défaut', en: 'Least-privilege default CI token permissions' },
          code: `# --- GitHub : restreindre GITHUB_TOKEN au strict nécessaire ---
permissions:
  contents: read
jobs:
  deploy:
    permissions:
      contents: read
      id-token: write   # seulement le job qui en a besoin

# --- GitLab : restreindre la portée du CI_JOB_TOKEN ---
# Settings > CI/CD > Token Access > Limit access via allowlist`,
          note: {
            fr: `Par défaut, GITHUB_TOKEN a souvent des droits d'écriture larges même pour un job qui ne fait que lancer des tests. Un pipeline compromis (dépendance malveillante, action piégée) hérite de ces droits — limitez au niveau workflow ET par job.`,
            en: `By default GITHUB_TOKEN often has broad write access even for a job that only runs tests. A compromised pipeline (malicious dependency, trojaned action) inherits those rights — restrict at both workflow and job level.`,
          },
        },
        {
          id: 'cicd-bp-pin-actions-by-sha',
          title: { fr: 'Épingler les actions/images tierces par SHA, pas par tag flottant', en: 'Pin third-party actions/images by SHA, not a floating tag' },
          code: `# --- GitHub : le tag @v4 peut être réécrit, le SHA jamais ---
- uses: actions/checkout@8e5e7e5ab8b370d6c329ec480221332ada57f0a  # v4.1.7

# --- GitLab : même logique pour une image de base ---
image: node:22-alpine@sha256:9d7f1b6c2e5a4f0b8c3d2e1a9f8b7c6d`,
          note: {
            fr: `Un tag comme @v4 peut être déplacé vers un nouveau commit (par l'auteur ou après compromission du repo de l'action) sans que vous le sachiez — plusieurs incidents de supply chain récents sont passés par là. Le SHA de commit est immuable, l'ancrage réel de confiance.`,
            en: `A tag like @v4 can be moved to a new commit (by the author, or after the action repo is compromised) without your knowledge — several recent supply-chain incidents went through exactly this. The commit SHA is immutable, the real anchor of trust.`,
          },
        },
        {
          id: 'cicd-bp-oidc-short-lived-creds',
          title: { fr: 'OIDC pour le cloud : credentials éphémères, pas de secret statique', en: 'OIDC for cloud: ephemeral credentials, no static secret' },
          code: `# --- GitHub : fédération OIDC vers un rôle IAM ---
permissions: { id-token: write, contents: read }
steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with: { role-to-assume: arn:aws:iam::123456789012:role/ci, aws-region: eu-west-1 }

# --- GitLab : id_tokens + fédération équivalente ---
id_tokens:
  AWS_ID_TOKEN: { aud: sts.amazonaws.com }`,
          note: {
            fr: `Une clé cloud statique stockée en secret CI ne périme jamais toute seule et fuite facilement (log mal masqué, fork de repo). L'OIDC échange un jeton signé de courte durée vérifié par le cloud : rien à stocker, rien à faire tourner, rien à révoquer en urgence.`,
            en: `A static cloud key stored as a CI secret never expires on its own and leaks easily (unmasked log, forked repo). OIDC exchanges a short-lived signed token verified by the cloud provider: nothing to store, rotate, or urgently revoke.`,
          },
        },
        {
          id: 'cicd-bp-concurrency-guard-deploy',
          title: { fr: 'Verrou de concurrence sur les jobs de déploiement', en: 'Concurrency guard on deployment jobs' },
          code: `# --- GitHub : une seule exécution à la fois pour cet environnement ---
concurrency:
  group: deploy-production
  cancel-in-progress: false

# --- GitLab : équivalent avec resource_group ---
deploy_prod:
  resource_group: production`,
          note: {
            fr: `Deux pipelines déclenchés à quelques secondes d'intervalle peuvent déployer en parallèle sur le même environnement et se marcher dessus (migration DB concurrente, rollback écrasé). Le verrou sérialise : un déploiement à la fois, dans l'ordre.`,
            en: `Two pipelines triggered seconds apart can deploy to the same environment in parallel and step on each other (concurrent DB migration, an overwritten rollback). The guard serializes: one deployment at a time, in order.`,
          },
        },
        {
          id: 'cicd-bp-cold-cache-and-timeouts',
          title: { fr: 'Pipeline valide à froid + timeout explicite sur chaque job', en: 'Pipeline valid on a cold cache + explicit timeout per job' },
          code: `# --- GitHub : timeout par job ---
jobs:
  test:
    timeout-minutes: 15

# --- GitLab : timeout par job ---
test:
  timeout: 15 minutes`,
          note: {
            fr: `Un cache peut être évincé à tout moment (quota, changement d'infra) : si le build ne réussit qu'AVEC le cache, une éviction cassera la prod sans prévenir. Un timeout par job évite qu'un test bloqué consomme des minutes CI ou bloque un déploiement pendant des heures.`,
            en: `A cache can be evicted at any time (quota, infra change): if the build only succeeds WITH the cache, an eviction silently breaks things. A per-job timeout stops a stuck test from burning CI minutes or blocking a deploy for hours.`,
          },
        },
      ],
    },
  ],
};
