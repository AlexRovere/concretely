// Comparatif GitLab CI vs GitHub Actions au format tableau (dimensions x
// candidats). Modèle pur (aucun import Vue), bilingue {fr, en} inline,
// consommé par CompareTablePanel (via la prop `data`), testable sous node --test.

export const CICD_COMPARISON = {
  id: 'cicd',
  intro: {
    fr: 'GitLab CI et GitHub Actions résolvent le même problème — automatiser build/test/deploy — avec des concepts qui se correspondent presque un pour un, mais des noms et des défauts différents.',
    en: 'GitLab CI and GitHub Actions solve the same problem — automating build/test/deploy — with concepts that map almost one-to-one, but different names and defaults.',
  },
  candidates: [
    { id: 'gitlab', label: 'GitLab CI' },
    { id: 'github', label: 'GitHub Actions' },
  ],
  dimensions: [
    {
      id: 'file',
      label: { fr: 'Fichier', en: 'File' },
      cells: {
        gitlab: { fr: 'Un seul .gitlab-ci.yml à la racine', en: 'A single .gitlab-ci.yml at the root' },
        github: { fr: 'Tous les .yml dans .github/workflows/', en: 'Every .yml in .github/workflows/' },
      },
    },
    {
      id: 'unit',
      label: { fr: 'Unité de travail', en: 'Unit of work' },
      cells: {
        gitlab: { fr: 'Job, groupé en stages ordonnés', en: 'Job, grouped into ordered stages' },
        github: { fr: 'Job → steps ; pas de stages (ordre via needs)', en: 'Job → steps; no stages (order via needs)' },
      },
    },
    {
      id: 'step',
      label: { fr: 'Étape', en: 'Step' },
      cells: {
        gitlab: { fr: 'script: commandes shell uniquement', en: 'script: shell commands only' },
        github: { fr: 'run: (shell) ou uses: (action réutilisable)', en: 'run: (shell) or uses: (reusable action)' },
      },
    },
    {
      id: 'checkout',
      label: { fr: 'Clone du repo', en: 'Repo checkout' },
      cells: {
        gitlab: { fr: 'Automatique', en: 'Automatic' },
        github: { fr: 'Explicite : actions/checkout', en: 'Explicit: actions/checkout' },
      },
    },
    {
      id: 'runner',
      label: { fr: 'Machine', en: 'Machine' },
      cells: {
        gitlab: { fr: 'tags: (choisit un runner) ; image: pour Docker', en: 'tags: (pick a runner); image: for Docker' },
        github: { fr: 'runs-on: (ex. ubuntu-latest)', en: 'runs-on: (e.g. ubuntu-latest)' },
      },
    },
    {
      id: 'trigger',
      label: { fr: 'Déclencheurs', en: 'Triggers' },
      cells: {
        gitlab: { fr: 'rules: / when: par job', en: 'rules: / when: per job' },
        github: { fr: 'on: au niveau du workflow', en: 'on: at the workflow level' },
      },
    },
    {
      id: 'deps',
      label: { fr: 'Dépendances', en: 'Dependencies' },
      cells: {
        gitlab: { fr: 'needs: (DAG) ; artefacts hérités auto', en: 'needs: (DAG); artifacts inherited automatically' },
        github: { fr: 'needs: ; artefacts via upload/download', en: 'needs:; artifacts via upload/download' },
      },
    },
    {
      id: 'cache',
      label: { fr: 'Cache', en: 'Cache' },
      cells: {
        gitlab: { fr: 'cache: key/paths/policy (manuel)', en: 'cache: key/paths/policy (manual)' },
        github: { fr: 'actions/cache ou cache: des setup-*', en: 'actions/cache or setup-* cache:' },
      },
    },
    {
      id: 'secrets',
      label: { fr: 'Secrets', en: 'Secrets' },
      cells: {
        gitlab: { fr: 'Variables (UI), injectées en env auto', en: 'Variables (UI), auto-injected as env' },
        github: { fr: 'secrets.* mappés via env:', en: 'secrets.* mapped via env:' },
      },
    },
    {
      id: 'matrix',
      label: { fr: 'Matrice', en: 'Matrix' },
      cells: {
        gitlab: { fr: 'parallel.matrix', en: 'parallel.matrix' },
        github: { fr: 'strategy.matrix (fail-fast par défaut)', en: 'strategy.matrix (fail-fast by default)' },
      },
    },
    {
      id: 'reuse',
      label: { fr: 'Réutilisation', en: 'Reuse' },
      cells: {
        gitlab: { fr: 'extends: + include:', en: 'extends: + include:' },
        github: { fr: 'workflows réutilisables + actions composites', en: 'reusable workflows + composite actions' },
      },
    },
    {
      id: 'marketplace',
      label: { fr: 'Écosystème', en: 'Ecosystem' },
      cells: {
        gitlab: { fr: 'Templates & composants CI/CD', en: 'CI/CD templates & components' },
        github: { fr: 'Marketplace d\'actions (immense)', en: 'Actions Marketplace (huge)' },
      },
    },
  ],
};
