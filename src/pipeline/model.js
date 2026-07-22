/**
 * Adaptateurs : d'un objet YAML générique (parseYaml) vers un modèle de pipeline
 * commun, indépendant du format.
 *   PipelineModel = {
 *     format: 'gitlab' | 'github',
 *     stages: string[],                       // colonnes (GitLab) ; [] pour GitHub
 *     jobs: [{ id, stage?, needs: string[] }],
 *     errors: string[],                        // needs cassés, cycles…
 *   }
 * Fonctions pures et testables (aucun import Vue).
 */

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

// Clés GitLab qui ne sont PAS des jobs (mots réservés au niveau racine).
const GITLAB_RESERVED = new Set([
  'stages', 'variables', 'default', 'include', 'workflow', 'image', 'services',
  'before_script', 'after_script', 'cache', 'pages',
]);

/** Détecte les `needs` vers un job inconnu et les cycles. Complète `errors`. */
function validate(jobs, errors) {
  const ids = new Set(jobs.map((j) => j.id));
  for (const j of jobs) {
    for (const n of j.needs) {
      if (!ids.has(n)) errors.push(`job "${j.id}" needs unknown job "${n}"`);
    }
  }
  // Détection de cycle (DFS sur les arêtes valides).
  const adj = new Map(jobs.map((j) => [j.id, j.needs.filter((n) => ids.has(n))]));
  const state = new Map(); // 0 = en cours, 1 = fini
  let cyclic = false;
  const visit = (id) => {
    if (state.get(id) === 1) return;
    if (state.get(id) === 0) { cyclic = true; return; }
    state.set(id, 0);
    for (const n of adj.get(id) ?? []) visit(n);
    state.set(id, 1);
  };
  for (const j of jobs) visit(j.id);
  if (cyclic) errors.push('dependency cycle detected in needs');
}

export function gitlabModel(obj) {
  const errors = [];
  if (!isObj(obj)) return { format: 'gitlab', stages: [], jobs: [], errors };

  const declaredStages = Array.isArray(obj.stages) ? obj.stages.map(String) : [];
  const jobs = [];
  for (const [key, body] of Object.entries(obj)) {
    if (GITLAB_RESERVED.has(key)) continue;
    if (key.startsWith('.')) continue; // job caché (modèle)
    if (!isObj(body)) continue;
    const stage = body.stage != null ? String(body.stage) : 'test';
    jobs.push({ id: key, stage, needs: asList(body.needs).map(String) });
  }

  // Ordre des colonnes : stages déclarés, puis tout stage utilisé mais non déclaré.
  const stages = [...declaredStages];
  for (const j of jobs) if (!stages.includes(j.stage)) stages.push(j.stage);

  validate(jobs, errors);
  return { format: 'gitlab', stages, jobs, errors };
}

export function githubModel(obj) {
  const errors = [];
  const jobsObj = isObj(obj) && isObj(obj.jobs) ? obj.jobs : null;
  if (!jobsObj) return { format: 'github', stages: [], jobs: [], errors };

  const jobs = [];
  for (const [key, body] of Object.entries(jobsObj)) {
    if (!isObj(body)) continue;
    jobs.push({ id: key, needs: asList(body.needs).map(String) });
  }

  validate(jobs, errors);
  return { format: 'github', stages: [], jobs, errors };
}
