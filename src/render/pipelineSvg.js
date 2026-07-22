/**
 * SVG d'un pipeline positionné (pipeline/layout.js). Colonnes = stages (GitLab)
 * ou niveaux du DAG (GitHub) ; nœuds = jobs (rectangles arrondis étiquetés) ;
 * arêtes fléchées = dépendances `needs`. Thémé via classes CSS (couleurs dans
 * visualizers.css), comme renderDagSvg. Pur : (laidOut, opts) → string.
 */
const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));

const COL_W = 170; // largeur d'une colonne
const ROW_H = 64; // hauteur d'une ligne
const NODE_W = 130;
const NODE_H = 38;
const PAD_X = 30;
const PAD_TOP = 48; // place pour les en-têtes de colonne

/**
 * @param {{nodes:Array,edges:Array,cols:number,rows:number}} laidOut
 * @param {{ headers?: string[] }} [opts] en-têtes de colonne (stages ou "niveau N")
 */
export function renderPipelineSvg(laidOut, { headers = [] } = {}) {
  const { nodes, edges, cols, rows } = laidOut;
  if (!nodes.length) return '';

  const cx = (col) => PAD_X + col * COL_W + NODE_W / 2;
  const cy = (row) => PAD_TOP + row * ROW_H + NODE_H / 2;
  const pos = new Map(nodes.map((n) => [n.id, n]));

  const w = PAD_X * 2 + (cols - 1) * COL_W + NODE_W;
  const h = PAD_TOP + rows * ROW_H + 12;

  let svg = '';

  // en-têtes de colonne
  for (let c = 0; c < cols; c++) {
    const label = headers[c] ?? `#${c + 1}`;
    svg += `<text class="pl-head" x="${PAD_X + c * COL_W + NODE_W / 2}" y="26" text-anchor="middle">${esc(label)}</text>`;
  }

  // arêtes (needs) — dessinées avant les nœuds
  for (const e of edges) {
    const a = pos.get(e.from);
    const b = pos.get(e.to);
    if (!a || !b) continue;
    const x1 = cx(a.col) + NODE_W / 2;
    const y1 = cy(a.row);
    const x2 = cx(b.col) - NODE_W / 2;
    const y2 = cy(b.row);
    const mx = (x1 + x2) / 2;
    svg += `<path class="pl-edge" d="M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}" marker-end="url(#pl-arrow)" />`;
  }

  // nœuds (jobs)
  for (const n of nodes) {
    const x = cx(n.col) - NODE_W / 2;
    const y = cy(n.row) - NODE_H / 2;
    svg += `<g class="pl-node">`;
    svg += `<rect x="${x}" y="${y}" width="${NODE_W}" height="${NODE_H}" rx="8" />`;
    svg += `<text x="${cx(n.col)}" y="${cy(n.row) + 4}" text-anchor="middle">${esc(n.label)}</text>`;
    svg += `</g>`;
  }

  const defs = `<defs><marker id="pl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" class="pl-arrowhead" /></marker></defs>`;
  return `<svg class="pl-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${svg}</svg>`;
}
