// JavaScript implementations (educational — clean textbook versions).
export default {
  bubble: `function bubbleSort(a) {
  for (let i = 0; i < a.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < a.length - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return a;
}`,
  insertion: `function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
  return a;
}`,
  selection: `function selectionSort(a) {
  for (let i = 0; i < a.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) [a[i], a[min]] = [a[min], a[i]];
  }
  return a;
}`,
  quick: `function quickSort(a) {
  if (a.length <= 1) return a;
  const [pivot, ...rest] = a;
  const left = rest.filter((x) => x < pivot);
  const right = rest.filter((x) => x >= pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}`,
  merge: `function mergeSort(a) {
  if (a.length <= 1) return a;
  const mid = Math.floor(a.length / 2);
  const left = mergeSort(a.slice(0, mid));
  const right = mergeSort(a.slice(mid));
  const merged = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) merged.push(left[i++]);
    else merged.push(right[j++]);
  }
  return merged.concat(left.slice(i)).concat(right.slice(j));
}`,
  gnome: `function gnomeSort(a) {
  let i = 0;
  while (i < a.length) {
    if (i === 0 || a[i] >= a[i - 1]) {
      i++;
    } else {
      [a[i], a[i - 1]] = [a[i - 1], a[i]];
      i--;
    }
  }
  return a;
}`,
  pancake: `function flip(a, k) {
  let lo = 0;
  while (lo < k) {
    [a[lo], a[k]] = [a[k], a[lo]];
    lo++;
    k--;
  }
}

function pancakeSort(a) {
  for (let size = a.length; size > 1; size--) {
    let maxIdx = 0;
    for (let i = 1; i < size; i++) {
      if (a[i] > a[maxIdx]) maxIdx = i;
    }
    if (maxIdx !== size - 1) {
      flip(a, maxIdx);
      flip(a, size - 1);
    }
  }
  return a;
}`,
  stooge: `function stoogeSort(a, lo = 0, hi = a.length - 1) {
  if (a[lo] > a[hi]) [a[lo], a[hi]] = [a[hi], a[lo]];
  if (hi - lo + 1 > 2) {
    const third = Math.floor((hi - lo + 1) / 3);
    stoogeSort(a, lo, hi - third);
    stoogeSort(a, lo + third, hi);
    stoogeSort(a, lo, hi - third);
  }
  return a;
}`,
  bogo: `function isSorted(a) {
  for (let i = 1; i < a.length; i++) {
    if (a[i - 1] > a[i]) return false;
  }
  return true;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function bogoSort(a) {
  while (!isSorted(a)) shuffle(a);
  return a;
}`,
  bfs: `function bfs(grid, start, end) {
  const rows = grid.length, cols = grid[0].length;
  const moves = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
  const prev = new Map();
  const key = (r, c) => r + "," + c;
  const queue = [start];
  seen[start[0]][start[1]] = true;
  while (queue.length) {
    const [r, c] = queue.shift();
    if (r === end[0] && c === end[1]) {
      const path = [];
      let cur = key(r, c);
      while (cur !== undefined) {
        const [pr, pc] = cur.split(",").map(Number);
        path.unshift([pr, pc]);
        cur = prev.get(cur);
      }
      return path;
    }
    for (const [dr, dc] of moves) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (grid[nr][nc] === 1 || seen[nr][nc]) continue;
      seen[nr][nc] = true;
      prev.set(key(nr, nc), key(r, c));
      queue.push([nr, nc]);
    }
  }
  return [];
}`,
  dijkstra: `function dijkstra(grid, start, end, cost) {
  const rows = grid.length, cols = grid[0].length;
  const moves = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const key = (r, c) => r + "," + c;
  const dist = new Map([[key(start[0], start[1]), 0]]);
  const prev = new Map();
  const pq = [[0, start[0], start[1]]];
  const stepCost = (r, c) => (cost ? cost[r][c] : 1);
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, r, c] = pq.shift();
    if (r === end[0] && c === end[1]) {
      const path = [];
      let cur = key(r, c);
      while (cur !== undefined) {
        const [pr, pc] = cur.split(",").map(Number);
        path.unshift([pr, pc]);
        cur = prev.get(cur);
      }
      return path;
    }
    if (d > (dist.get(key(r, c)) ?? Infinity)) continue;
    for (const [dr, dc] of moves) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (grid[nr][nc] === 1) continue;
      const nd = d + stepCost(nr, nc);
      if (nd < (dist.get(key(nr, nc)) ?? Infinity)) {
        dist.set(key(nr, nc), nd);
        prev.set(key(nr, nc), key(r, c));
        pq.push([nd, nr, nc]);
      }
    }
  }
  return [];
}`,
  astar: `function astar(grid, start, end) {
  const rows = grid.length, cols = grid[0].length;
  const moves = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const key = (r, c) => r + "," + c;
  const h = (r, c) => Math.abs(r - end[0]) + Math.abs(c - end[1]);
  const g = new Map([[key(start[0], start[1]), 0]]);
  const prev = new Map();
  const open = [[h(start[0], start[1]), start[0], start[1]]];
  while (open.length) {
    open.sort((a, b) => a[0] - b[0]);
    const [, r, c] = open.shift();
    if (r === end[0] && c === end[1]) {
      const path = [];
      let cur = key(r, c);
      while (cur !== undefined) {
        const [pr, pc] = cur.split(",").map(Number);
        path.unshift([pr, pc]);
        cur = prev.get(cur);
      }
      return path;
    }
    for (const [dr, dc] of moves) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (grid[nr][nc] === 1) continue;
      const ng = g.get(key(r, c)) + 1;
      if (ng < (g.get(key(nr, nc)) ?? Infinity)) {
        g.set(key(nr, nc), ng);
        prev.set(key(nr, nc), key(r, c));
        open.push([ng + h(nr, nc), nr, nc]);
      }
    }
  }
  return [];
}`,
};
