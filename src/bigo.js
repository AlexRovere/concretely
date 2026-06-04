/**
 * Growth functions for the Big-O playground. Pure and testable: each returns
 * the (approximate) number of operations for an input of size n.
 */

export const GROWTH = [
  { id: 'o1', label: 'O(1)', color: '#22c55e', fn: () => 1 },
  { id: 'ologn', label: 'O(log n)', color: '#2ac3de', fn: (n) => Math.log2(Math.max(1, n)) },
  { id: 'on', label: 'O(n)', color: '#7aa2f7', fn: (n) => n },
  { id: 'onlogn', label: 'O(n log n)', color: '#bb9af7', fn: (n) => n * Math.log2(Math.max(1, n)) },
  { id: 'on2', label: 'O(n²)', color: '#eab308', fn: (n) => n * n },
  { id: 'o2n', label: 'O(2ⁿ)', color: '#ef4444', fn: (n) => 2 ** n },
];

export const growthById = (id) => GROWTH.find((g) => g.id === id);

/**
 * Sampled series of [n, ops] points from 1..maxN (capped count of samples).
 * @param {(n:number)=>number} fn
 * @param {number} maxN
 * @param {number} [samples]
 */
export function series(fn, maxN, samples = 200) {
  const pts = [];
  const stepN = Math.max(1, Math.floor(maxN / samples));
  for (let n = 1; n <= maxN; n += stepN) pts.push([n, fn(n)]);
  if (pts.at(-1)?.[0] !== maxN) pts.push([maxN, fn(maxN)]);
  return pts;
}

/** Operations at a given n for every growth class (for the readout table). */
export function opsAt(n) {
  return GROWTH.map((g) => ({ id: g.id, label: g.label, ops: g.fn(n) }));
}

/** Human-readable big number (e.g. 1.2M, 3.4e15). */
export function formatOps(x) {
  if (!Number.isFinite(x)) return '∞';
  if (x < 1000) return String(Math.round(x));
  if (x < 1e6) return `${(x / 1e3).toFixed(1)}K`;
  if (x < 1e9) return `${(x / 1e6).toFixed(1)}M`;
  if (x < 1e12) return `${(x / 1e9).toFixed(1)}B`;
  if (x < 1e15) return `${(x / 1e12).toFixed(1)}T`;
  return x.toExponential(1);
}
