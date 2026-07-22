/**
 * Layout pur d'un PipelineModel → nœuds positionnés (col, row) + arêtes.
 *   GitLab : col = index du stage du job.
 *   GitHub : col = profondeur topologique (plus long chemin depuis une racine
 *            via `needs`) — les cycles sont déjà signalés par le modèle ; on
 *            borne la récursion par sécurité.
 * `row` = empilement stable au sein d'une colonne (ordre d'apparition des jobs).
 * Déterministe : aucune dépendance à l'ordre d'itération non garanti.
 *
 * layout(model) → { nodes:[{ id, label, col, row, stage? }], edges:[{ from, to }], cols, rows }
 */
export function layout(model) {
  const jobs = model.jobs ?? [];
  if (!jobs.length) return { nodes: [], edges: [], cols: 0, rows: 0 };

  const ids = new Set(jobs.map((j) => j.id));
  const colOf = model.format === 'gitlab' ? gitlabColumns(model) : githubColumns(jobs, ids);

  // Empilement : row = rang du job (ordre du modèle) parmi ceux de sa colonne.
  const perCol = new Map();
  const nodes = jobs.map((j) => {
    const col = colOf.get(j.id);
    const row = perCol.get(col) ?? 0;
    perCol.set(col, row + 1);
    return { id: j.id, label: j.id, col, row, stage: j.stage };
  });

  const edges = [];
  for (const j of jobs) {
    for (const n of j.needs) {
      if (ids.has(n)) edges.push({ from: n, to: j.id });
    }
  }

  const cols = Math.max(...nodes.map((n) => n.col)) + 1;
  const rows = Math.max(...[...perCol.values()]);
  return { nodes, edges, cols, rows };
}

function gitlabColumns(model) {
  const stageIndex = new Map(model.stages.map((s, i) => [s, i]));
  const colOf = new Map();
  for (const j of model.jobs) colOf.set(j.id, stageIndex.get(j.stage) ?? 0);
  return colOf;
}

function githubColumns(jobs, ids) {
  const byId = new Map(jobs.map((j) => [j.id, j]));
  const depthCache = new Map();
  const depth = (id, seen) => {
    if (depthCache.has(id)) return depthCache.get(id);
    if (seen.has(id)) return 0; // garde-fou anti-cycle
    seen.add(id);
    const needs = (byId.get(id)?.needs ?? []).filter((n) => ids.has(n));
    const d = needs.length ? Math.max(...needs.map((n) => depth(n, seen))) + 1 : 0;
    seen.delete(id);
    depthCache.set(id, d);
    return d;
  };
  const colOf = new Map();
  for (const j of jobs) colOf.set(j.id, depth(j.id, new Set()));
  return colOf;
}
