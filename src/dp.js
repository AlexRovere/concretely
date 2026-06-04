// Dynamic programming — edit distance (Levenshtein), pure model + step generator.
// The visualizer fills the (m+1)×(n+1) table cell by cell; each cell's value is
// derived from the diagonal (substitute/match), up (delete) or left (insert).

export function editDistanceValue(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j - 1] + cost, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
    }
  }
  return dp[m][n];
}

/**
 * Yields one `cell` step per table entry (row-major after the init row/col), each
 * carrying its value, which neighbour it came `from` ('init'|'diag'|'up'|'left')
 * and whether the two characters `match`. The last step is the bottom-right cell
 * whose value is the edit distance.
 */
export function* editDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
    yield { type: 'cell', i, j: 0, value: i, from: 'init' };
  }
  for (let j = 1; j <= n; j++) {
    dp[0][j] = j;
    yield { type: 'cell', i: 0, j, value: j, from: 'init' };
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = a[i - 1] === b[j - 1];
      const cost = match ? 0 : 1;
      const diag = dp[i - 1][j - 1] + cost;
      const up = dp[i - 1][j] + 1;
      const left = dp[i][j - 1] + 1;
      const value = Math.min(diag, up, left);
      const from = value === diag ? 'diag' : value === up ? 'up' : 'left';
      dp[i][j] = value;
      yield { type: 'cell', i, j, value, from, match };
    }
  }
  return dp[m][n];
}

export const DP_SCENARIOS = [
  { id: 'kitten → sitting', a: 'kitten', b: 'sitting' },
  { id: 'sunday → saturday', a: 'sunday', b: 'saturday' },
  { id: 'flaw → lawn', a: 'flaw', b: 'lawn' }
];

export function dpScenarioById(id) {
  return DP_SCENARIOS.find((s) => s.id === id) ?? DP_SCENARIOS[0];
}
