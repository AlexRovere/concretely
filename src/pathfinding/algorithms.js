/**
 * Pathfinding algorithms as step generators on a grid.
 *
 * Each generator yields visual steps and `return`s a boolean (path found?).
 * Step shapes:
 *   { type: 'visit',    r, c }        node dequeued / finalized (visual)
 *   { type: 'frontier', r, c }        node discovered and queued (visual)
 *   { type: 'path', cells: [[r,c]] }  the final shortest path (emitted once)
 */

import { key, neighbors, weight } from './grid.js';

/** Tiny binary min-heap of [priority, value] pairs. */
class MinHeap {
  constructor() { this.h = []; }
  get size() { return this.h.length; }
  push(item) {
    const h = this.h;
    h.push(item);
    let i = h.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (h[p][0] <= h[i][0]) break;
      [h[p], h[i]] = [h[i], h[p]];
      i = p;
    }
  }
  pop() {
    const h = this.h;
    const top = h[0];
    const last = h.pop();
    if (h.length) {
      h[0] = last;
      let i = 0;
      const n = h.length;
      for (;;) {
        let s = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && h[l][0] < h[s][0]) s = l;
        if (r < n && h[r][0] < h[s][0]) s = r;
        if (s === i) break;
        [h[s], h[i]] = [h[i], h[s]];
        i = s;
      }
    }
    return top;
  }
}

function reconstruct(cameFrom, endKey) {
  const path = [];
  let cur = endKey;
  while (cur !== undefined) {
    const [r, c] = cur.split(',').map(Number);
    path.push([r, c]);
    cur = cameFrom.get(cur);
  }
  return path.reverse();
}

const manhattan = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

export function* bfs(grid, start, end) {
  const sk = key(...start), ek = key(...end);
  const visited = new Set([sk]);
  const cameFrom = new Map([[sk, undefined]]);
  const queue = [start];
  while (queue.length) {
    const [r, c] = queue.shift();
    yield { type: 'visit', r, c };
    if (r === end[0] && c === end[1]) {
      yield { type: 'path', cells: reconstruct(cameFrom, ek) };
      return true;
    }
    for (const [nr, nc] of neighbors(grid, r, c)) {
      const nk = key(nr, nc);
      if (!visited.has(nk)) {
        visited.add(nk);
        cameFrom.set(nk, key(r, c));
        queue.push([nr, nc]);
        yield { type: 'frontier', r: nr, c: nc };
      }
    }
  }
  return false;
}

export function* dijkstra(grid, start, end) {
  const sk = key(...start), ek = key(...end);
  const dist = new Map([[sk, 0]]);
  const cameFrom = new Map([[sk, undefined]]);
  const pq = new MinHeap();
  pq.push([0, start]);
  const done = new Set();
  while (pq.size) {
    const [d, [r, c]] = pq.pop();
    const ck = key(r, c);
    if (done.has(ck)) continue;
    done.add(ck);
    yield { type: 'visit', r, c };
    if (r === end[0] && c === end[1]) {
      yield { type: 'path', cells: reconstruct(cameFrom, ek) };
      return true;
    }
    for (const [nr, nc] of neighbors(grid, r, c)) {
      const nk = key(nr, nc);
      const nd = d + weight(grid, nr, nc);
      if (nd < (dist.get(nk) ?? Infinity)) {
        dist.set(nk, nd);
        cameFrom.set(nk, ck);
        pq.push([nd, [nr, nc]]);
        yield { type: 'frontier', r: nr, c: nc };
      }
    }
  }
  return false;
}

export function* astar(grid, start, end) {
  const sk = key(...start), ek = key(...end);
  const g = new Map([[sk, 0]]);
  const cameFrom = new Map([[sk, undefined]]);
  const pq = new MinHeap();
  pq.push([manhattan(start, end), start]);
  const done = new Set();
  while (pq.size) {
    const [, [r, c]] = pq.pop();
    const ck = key(r, c);
    if (done.has(ck)) continue;
    done.add(ck);
    yield { type: 'visit', r, c };
    if (r === end[0] && c === end[1]) {
      yield { type: 'path', cells: reconstruct(cameFrom, ek) };
      return true;
    }
    for (const [nr, nc] of neighbors(grid, r, c)) {
      const nk = key(nr, nc);
      const ng = (g.get(ck) ?? Infinity) + weight(grid, nr, nc);
      if (ng < (g.get(nk) ?? Infinity)) {
        g.set(nk, ng);
        cameFrom.set(nk, ck);
        pq.push([ng + manhattan([nr, nc], end), [nr, nc]]);
        yield { type: 'frontier', r: nr, c: nc };
      }
    }
  }
  return false;
}

/** Registry of available pathfinders, keyed by id. `complexity` is shown in the UI. */
export const PATHFINDERS = {
  bfs: {
    name: 'BFS (unweighted)', gen: bfs,
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    desc: 'Explores the grid level by level from the start. Finds the shortest path when every step costs the same (unweighted). V = cells, E = connections.',
    tips: 'Your default when all moves cost the same — simplest correct shortest path. No weights, no heuristic needed.',
  },
  dijkstra: {
    name: 'Dijkstra', gen: dijkstra,
    complexity: { time: 'O((V + E) log V)', space: 'O(V)' },
    desc: 'Always expands the closest unvisited cell (via a min-heap). Finds the shortest path with non-negative weights; the log V factor comes from the priority queue.',
    tips: 'Use when steps have different non-negative costs (terrain, tolls) and you have no good distance estimate. For negative edges use Bellman-Ford instead.',
  },
  astar: {
    name: 'A* (Manhattan)', gen: astar,
    complexity: { time: 'O((V + E) log V)', space: 'O(V)' },
    desc: 'Dijkstra guided by a heuristic (estimated distance to the goal), so it explores far fewer cells while still finding the shortest path when the heuristic is admissible.',
    tips: 'The go-to for maps and games: when you can estimate distance to the goal, A* beats Dijkstra. Keep the heuristic admissible (never overestimating) for an optimal path.',
  },
};
