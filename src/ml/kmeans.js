import { mulberry32 } from './datasets.js';

const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
const clone = (cs) => cs.map((c) => ({ ...c }));

function nearest(p, centroids) {
  let best = 0;
  let bd = Infinity;
  for (let c = 0; c < centroids.length; c++) {
    const d = dist2(p, centroids[c]);
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}

function meanOf(points, assignments, ci, fallback) {
  let sx = 0;
  let sy = 0;
  let count = 0;
  for (let i = 0; i < points.length; i++) {
    if (assignments[i] === ci) { sx += points[i].x; sy += points[i].y; count++; }
  }
  return count ? { x: sx / count, y: sy / count } : fallback;
}

function totalInertia(points, centroids, assignments) {
  let sum = 0;
  for (let i = 0; i < points.length; i++) sum += dist2(points[i], centroids[assignments[i]]);
  return sum;
}

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Algorithme de Lloyd comme liste de frames (snapshots complets).
 * Alterne 'assign' (points → centroïde le plus proche) et 'update'
 * (centroïdes → moyenne de leur cluster). S'arrête quand les affectations
 * se stabilisent ou à `maxIter`.
 */
export function kmeansSteps(points, { k = 3, maxIter = 20, seed = 7 } = {}) {
  const rng = mulberry32(seed);
  const idx = shuffle([...points.keys()], rng).slice(0, k);
  let centroids = idx.map((i) => ({ x: points[i].x, y: points[i].y }));
  let assignments = new Array(points.length).fill(-1);
  const frames = [];

  for (let iter = 0; iter < maxIter; iter++) {
    // phase assign
    const next = points.map((p) => nearest(p, centroids));
    frames.push({
      centroids: clone(centroids),
      assignments: [...next],
      inertia: totalInertia(points, centroids, next),
      iter,
      phase: 'assign',
    });
    const changed = next.some((c, i) => c !== assignments[i]);
    assignments = next;
    if (!changed && iter > 0) break;
    // phase update
    centroids = centroids.map((c, ci) => meanOf(points, assignments, ci, c));
    frames.push({
      centroids: clone(centroids),
      assignments: [...assignments],
      inertia: totalInertia(points, centroids, assignments),
      iter,
      phase: 'update',
    });
  }
  return frames;
}
