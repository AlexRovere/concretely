/**
 * Générateurs de données 2D seedés pour les visualizers ML.
 * Déterministes pour une seed donnée : visuels reproductibles + tests stables.
 */

/** mulberry32 — PRNG déterministe minimal. Renvoie une fonction → [0,1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Box-Muller : une normale centrée réduite à partir d'un rng [0,1). */
function gaussian(rng) {
  const u = 1 - rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * `k` blobs gaussiens dans le carré unité. `label` = cluster VRAI (sert
 * uniquement à placer les points, jamais lu par les algorithmes).
 */
export function blobs({ k = 3, n = 150, spread = 0.06, seed = 1 } = {}) {
  const rng = mulberry32(seed);
  const centers = Array.from({ length: k }, () => ({
    x: 0.15 + rng() * 0.7,
    y: 0.15 + rng() * 0.7,
  }));
  const pts = [];
  for (let i = 0; i < n; i++) {
    const c = i % k;
    pts.push({
      x: clamp01(centers[c].x + gaussian(rng) * spread),
      y: clamp01(centers[c].y + gaussian(rng) * spread),
      label: c,
    });
  }
  return pts;
}
