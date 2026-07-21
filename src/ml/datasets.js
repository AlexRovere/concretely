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

/**
 * Nuage linéaire bruité pour la régression : y ≈ slope·x + intercept + bruit,
 * dans le carré unité. Les points n'ont pas de `label` (régression, pas
 * classification).
 */
export function linear({ n = 40, slope = 0.6, intercept = 0.2, noise = 0.08, seed = 1 } = {}) {
  const rng = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const x = rng();
    const y = clamp01(slope * x + intercept + gaussian(rng) * noise);
    pts.push({ x, y });
  }
  return pts;
}

/**
 * Deux « lunes » entrelacées (classes 0 et 1) — jeu non linéairement séparable,
 * idéal pour kNN et les réseaux de neurones. `label` = classe.
 */
export function moons({ n = 120, noise = 0.05, seed = 1 } = {}) {
  const rng = mulberry32(seed);
  const pts = [];
  const half = Math.floor(n / 2);
  for (let i = 0; i < n; i++) {
    const upper = i < half;
    const t = rng() * Math.PI;
    let x;
    let y;
    if (upper) {
      x = 0.5 * Math.cos(t) - 0.1;
      y = 0.5 * Math.sin(t);
    } else {
      x = 0.5 * Math.cos(t) + 0.1;
      y = 0.25 - 0.5 * Math.sin(t);
    }
    pts.push({
      x: clamp01(0.5 + x + gaussian(rng) * noise),
      y: clamp01(0.4 + y + gaussian(rng) * noise),
      label: upper ? 0 : 1,
    });
  }
  return pts;
}
