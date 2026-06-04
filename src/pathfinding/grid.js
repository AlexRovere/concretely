/**
 * Grid model for pathfinding. Cells are identified by `${r},${c}`.
 * Walls are impassable; weights make a cell cost more to enter (Dijkstra/A*).
 */

export const key = (r, c) => `${r},${c}`;

export function createGrid(rows, cols) {
  return { rows, cols, walls: new Set(), weights: new Map() };
}

export function inBounds(grid, r, c) {
  return r >= 0 && c >= 0 && r < grid.rows && c < grid.cols;
}

export function isWall(grid, r, c) {
  return grid.walls.has(key(r, c));
}

export function setWall(grid, r, c, on = true) {
  const k = key(r, c);
  if (on) grid.walls.add(k);
  else grid.walls.delete(k);
}

/** Cost to enter cell (r,c). Defaults to 1. */
export function weight(grid, r, c) {
  return grid.weights.get(key(r, c)) ?? 1;
}

/** Orthogonal, in-bounds, non-wall neighbours of (r,c). */
export function neighbors(grid, r, c) {
  const out = [];
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nr = r + dr, nc = c + dc;
    if (inBounds(grid, nr, nc) && !isWall(grid, nr, nc)) out.push([nr, nc]);
  }
  return out;
}
