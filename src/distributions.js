/**
 * Input distributions for the sorting visualizer. Different shapes expose the
 * best/worst-case behaviour the Big-O panel describes (e.g. insertion sort is
 * ~linear on "nearly sorted", quicksort degrades on "sorted"/"reversed").
 */

export const DISTRIBUTIONS = [
  { id: 'random', name: 'Random' },
  { id: 'nearly', name: 'Nearly sorted' },
  { id: 'reversed', name: 'Reversed' },
  { id: 'few', name: 'Few unique' },
  { id: 'sorted', name: 'Sorted' },
];

const MIN = 5;
const MAX = 100;
const SPAN = MAX - MIN;

/**
 * Generate an array of `n` bar heights following a distribution.
 * @param {number} n
 * @param {string} [dist]  one of DISTRIBUTIONS ids
 * @param {() => number} [rnd]  RNG in [0,1) — injectable for deterministic tests
 * @returns {number[]}
 */
export function generateArray(n, dist = 'random', rnd = Math.random) {
  const ascending = (i) => MIN + Math.round((i / Math.max(1, n - 1)) * SPAN);

  switch (dist) {
    case 'sorted':
      return Array.from({ length: n }, (_, i) => ascending(i));

    case 'reversed':
      return Array.from({ length: n }, (_, i) => ascending(n - 1 - i));

    case 'nearly': {
      const a = Array.from({ length: n }, (_, i) => ascending(i));
      const swaps = Math.max(1, Math.round(n * 0.05));
      for (let k = 0; k < swaps; k++) {
        const i = Math.floor(rnd() * n);
        const j = Math.floor(rnd() * n);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    case 'few': {
      const buckets = 4;
      const stepH = Math.floor(SPAN / (buckets - 1));
      return Array.from({ length: n }, () => MIN + Math.floor(rnd() * buckets) * stepH);
    }

    case 'random':
    default:
      return Array.from({ length: n }, () => MIN + Math.floor(rnd() * (SPAN + 1)));
  }
}
