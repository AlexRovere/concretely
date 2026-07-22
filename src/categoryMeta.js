/**
 * Métadonnées d'affichage par catégorie pour la page d'accueil : icône, groupe
 * et accroche bilingue. Doit couvrir exactement `CATEGORIES` (test de parité).
 */
export const GROUPS = ['languages', 'concepts', 'tools'];

export const GROUP_LABEL = {
  languages: { fr: 'Langages', en: 'Languages' },
  concepts: { fr: 'Concepts', en: 'Concepts' },
  tools: { fr: 'Outils & infra', en: 'Tools & infra' },
};

export const CATEGORY_META = {
  general: { icon: '🧮', group: 'concepts', tagline: { fr: 'Algorithmes & structures de données', en: 'Algorithms & data structures' } },
  patterns: { icon: '🧩', group: 'concepts', tagline: { fr: 'Design patterns essentiels', en: 'Essential design patterns' } },
  ml: { icon: '🤖', group: 'concepts', tagline: { fr: 'Machine learning, visualisé', en: 'Machine learning, visualized' } },
  js: { icon: '🟨', group: 'languages', tagline: { fr: 'JavaScript & event loop', en: 'JavaScript & the event loop' } },
  ts: { icon: '🔷', group: 'languages', tagline: { fr: 'TypeScript & typage', en: 'TypeScript & typing' } },
  python: { icon: '🐍', group: 'languages', tagline: { fr: 'Python, du langage au ML', en: 'Python, language to ML' } },
  vue: { icon: '💚', group: 'languages', tagline: { fr: 'Réactivité & virtual DOM', en: 'Reactivity & virtual DOM' } },
  react: { icon: '⚛️', group: 'languages', tagline: { fr: 'Hooks, rendu & réconciliation', en: 'Hooks, rendering & reconciliation' } },
  swift: { icon: '🦅', group: 'languages', tagline: { fr: 'Swift, ARC & concurrence', en: 'Swift, ARC & concurrency' } },
  ruby: { icon: '💎', group: 'languages', tagline: { fr: 'Ruby, blocks & GVL', en: 'Ruby, blocks & the GVL' } },
  kotlin: { icon: '🟪', group: 'languages', tagline: { fr: 'Kotlin, coroutines & Flow', en: 'Kotlin, coroutines & Flow' } },
  java: { icon: '☕', group: 'languages', tagline: { fr: 'Java, JVM & pièges', en: 'Java, the JVM & gotchas' } },
  go: { icon: '🐹', group: 'languages', tagline: { fr: 'Go, les fondamentaux', en: 'Go, the essentials' } },
  rust: { icon: '🦀', group: 'languages', tagline: { fr: 'Rust & l’ownership', en: 'Rust & ownership' } },
  c: { icon: '💾', group: 'languages', tagline: { fr: 'C, pointeurs & mémoire', en: 'C, pointers & memory' } },
  sql: { icon: '🗄️', group: 'tools', tagline: { fr: 'SQL & jointures', en: 'SQL & joins' } },
  git: { icon: '🔀', group: 'tools', tagline: { fr: 'Git, le DAG démystifié', en: 'Git, the DAG demystified' } },
  linux: { icon: '🐧', group: 'tools', tagline: { fr: 'Linux & le shell', en: 'Linux & the shell' } },
  os: { icon: '🖥️', group: 'tools', tagline: { fr: 'OS & ordonnancement', en: 'OS & scheduling' } },
  web: { icon: '🌐', group: 'tools', tagline: { fr: 'HTTP, CORS & cache', en: 'HTTP, CORS & caching' } },
  docker: { icon: '🐳', group: 'tools', tagline: { fr: 'Conteneurs', en: 'Containers' } },
  k8s: { icon: '☸️', group: 'tools', tagline: { fr: 'Kubernetes', en: 'Kubernetes' } },
  cicd: { icon: '🔁', group: 'tools', tagline: { fr: 'CI/CD : GitLab & GitHub', en: 'CI/CD: GitLab & GitHub' } },
};
