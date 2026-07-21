/**
 * k plus proches voisins (classification 2D). Pas d'apprentissage : on classe
 * un point par le vote majoritaire de ses k voisins les plus proches parmi les
 * points étiquetés. Sert à peindre une surface de décision (grille res×res).
 */

const dist2 = (a, bx, by) => (a.x - bx) ** 2 + (a.y - by) ** 2;

/** Classe (label) attribuée au point (x,y) par vote des k plus proches. */
export function knnClassify(points, k, x, y) {
  if (!points.length) return -1;
  const ranked = points
    .map((p) => ({ label: p.label, d2: dist2(p, x, y) }))
    .sort((a, b) => a.d2 - b.d2)
    .slice(0, Math.min(k, points.length));
  const counts = new Map();
  for (const r of ranked) counts.set(r.label, (counts.get(r.label) || 0) + 1);
  let best = -1;
  let bestN = -1;
  for (const [label, n] of counts) {
    if (n > bestN) { bestN = n; best = label; }
  }
  return best;
}

/**
 * Grille de régions de décision res×res : chaque cellule prend la classe
 * prédite au centre de la cellule. Format consommé par MlPlaneRenderer :
 * { res, cells } avec cells[iy*res + ix] = classe (ou -1).
 */
export function knnRegionGrid(points, k, res = 48) {
  const cells = new Int8Array(res * res);
  for (let iy = 0; iy < res; iy++) {
    for (let ix = 0; ix < res; ix++) {
      const x = (ix + 0.5) / res;
      const y = (iy + 0.5) / res;
      cells[iy * res + ix] = knnClassify(points, k, x, y);
    }
  }
  return { res, cells };
}
