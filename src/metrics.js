/**
 * Live operation counters derived from the step stream — pure and testable.
 * Sorting steps contribute compares/swaps/writes; pathfinding steps contribute
 * visits/frontier/pathLength.
 */

export function emptyMetrics() {
  return { compares: 0, swaps: 0, writes: 0, visits: 0, frontier: 0, pathLength: 0 };
}

/**
 * Fold a single step into a metrics object (mutates and returns it).
 * @param {ReturnType<typeof emptyMetrics>} m
 * @param {object} step
 */
export function accumulate(m, step) {
  switch (step.type) {
    case 'compare': m.compares++; break;
    case 'swap': m.swaps++; break;
    case 'set': m.writes++; break;
    case 'visit': m.visits++; break;
    case 'frontier': m.frontier++; break;
    case 'path': m.pathLength = step.cells.length; break;
    default: break;
  }
  return m;
}

/** Total metrics over a whole step array. */
export function totalMetrics(steps) {
  const m = emptyMetrics();
  for (const s of steps) accumulate(m, s);
  return m;
}
