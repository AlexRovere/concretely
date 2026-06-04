// Java implementations (educational — clean textbook versions).
export default {
  bubble: `static void bubbleSort(int[] a) {
  int n = a.length;
  for (int i = 0; i < n - 1; i++) {
    boolean swapped = false;
    for (int j = 0; j < n - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        int tmp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = tmp;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
}`,

  insertion: `static void insertionSort(int[] a) {
  for (int i = 1; i < a.length; i++) {
    int key = a[i];
    int j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
}`,

  selection: `static void selectionSort(int[] a) {
  int n = a.length;
  for (int i = 0; i < n - 1; i++) {
    int min = i;
    for (int j = i + 1; j < n; j++) {
      if (a[j] < a[min]) min = j;
    }
    int tmp = a[i];
    a[i] = a[min];
    a[min] = tmp;
  }
}`,

  quick: `static void quickSort(int[] a) {
  quickSort(a, 0, a.length - 1);
}

static void quickSort(int[] a, int lo, int hi) {
  if (lo >= hi) return;
  int p = partition(a, lo, hi);
  quickSort(a, lo, p - 1);
  quickSort(a, p + 1, hi);
}

static int partition(int[] a, int lo, int hi) {
  int pivot = a[hi];
  int i = lo - 1;
  for (int j = lo; j < hi; j++) {
    if (a[j] <= pivot) {
      i++;
      int tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
  }
  int tmp = a[i + 1];
  a[i + 1] = a[hi];
  a[hi] = tmp;
  return i + 1;
}`,

  merge: `static void mergeSort(int[] a) {
  if (a.length < 2) return;
  int mid = a.length / 2;
  int[] left = Arrays.copyOfRange(a, 0, mid);
  int[] right = Arrays.copyOfRange(a, mid, a.length);
  mergeSort(left);
  mergeSort(right);
  int i = 0, j = 0, k = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) a[k++] = left[i++];
    else a[k++] = right[j++];
  }
  while (i < left.length) a[k++] = left[i++];
  while (j < right.length) a[k++] = right[j++];
}`,

  gnome: `static void gnomeSort(int[] a) {
  int i = 0;
  while (i < a.length) {
    if (i == 0 || a[i] >= a[i - 1]) {
      i++;
    } else {
      int tmp = a[i];
      a[i] = a[i - 1];
      a[i - 1] = tmp;
      i--;
    }
  }
}`,

  pancake: `static void pancakeSort(int[] a) {
  for (int size = a.length; size > 1; size--) {
    int maxIdx = 0;
    for (int i = 1; i < size; i++) {
      if (a[i] > a[maxIdx]) maxIdx = i;
    }
    if (maxIdx == size - 1) continue;
    flip(a, maxIdx);
    flip(a, size - 1);
  }
}

static void flip(int[] a, int k) {
  int lo = 0, hi = k;
  while (lo < hi) {
    int tmp = a[lo];
    a[lo] = a[hi];
    a[hi] = tmp;
    lo++;
    hi--;
  }
}`,

  stooge: `static void stoogeSort(int[] a) {
  stoogeSort(a, 0, a.length - 1);
}

static void stoogeSort(int[] a, int lo, int hi) {
  if (lo >= hi) return;
  if (a[lo] > a[hi]) {
    int tmp = a[lo];
    a[lo] = a[hi];
    a[hi] = tmp;
  }
  if (hi - lo + 1 > 2) {
    int third = (hi - lo + 1) / 3;
    stoogeSort(a, lo, hi - third);
    stoogeSort(a, lo + third, hi);
    stoogeSort(a, lo, hi - third);
  }
}`,

  bogo: `static void bogoSort(int[] a) {
  Random rnd = new Random();
  while (!isSorted(a)) {
    shuffle(a, rnd);
  }
}

static boolean isSorted(int[] a) {
  for (int i = 1; i < a.length; i++) {
    if (a[i - 1] > a[i]) return false;
  }
  return true;
}

static void shuffle(int[] a, Random rnd) {
  for (int i = a.length - 1; i > 0; i--) {
    int j = rnd.nextInt(i + 1);
    int tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
}`,

  bfs: `// import java.util.*;
// Returns the shortest path from start to end as a list of {row, col} cells,
// or an empty list if no path exists.
static List<int[]> bfs(int[][] grid, int[] start, int[] end) {
  int rows = grid.length, cols = grid[0].length;
  int[][] dirs = { {-1, 0}, {1, 0}, {0, -1}, {0, 1} };
  boolean[][] visited = new boolean[rows][cols];
  int[][][] parent = new int[rows][cols][];
  Queue<int[]> queue = new ArrayDeque<>();
  queue.add(start);
  visited[start[0]][start[1]] = true;
  while (!queue.isEmpty()) {
    int[] cur = queue.poll();
    if (cur[0] == end[0] && cur[1] == end[1]) {
      return reconstruct(parent, start, end);
    }
    for (int[] d : dirs) {
      int nr = cur[0] + d[0], nc = cur[1] + d[1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] == 1 || visited[nr][nc]) continue;
      visited[nr][nc] = true;
      parent[nr][nc] = cur;
      queue.add(new int[] {nr, nc});
    }
  }
  return new ArrayList<>();
}

static List<int[]> reconstruct(int[][][] parent, int[] start, int[] end) {
  LinkedList<int[]> path = new LinkedList<>();
  int[] cur = end;
  while (cur != null) {
    path.addFirst(cur);
    if (cur[0] == start[0] && cur[1] == start[1]) break;
    cur = parent[cur[0]][cur[1]];
  }
  return path;
}`,

  dijkstra: `// import java.util.*;
// Uniform edge cost of 1 per step on the grid; returns the shortest path
// from start to end as a list of {row, col} cells, or empty if unreachable.
static List<int[]> dijkstra(int[][] grid, int[] start, int[] end) {
  int rows = grid.length, cols = grid[0].length;
  int[][] dirs = { {-1, 0}, {1, 0}, {0, -1}, {0, 1} };
  int[][] dist = new int[rows][cols];
  for (int[] row : dist) Arrays.fill(row, Integer.MAX_VALUE);
  int[][][] parent = new int[rows][cols][];
  PriorityQueue<int[]> pq = new PriorityQueue<>((x, y) -> x[0] - y[0]);
  dist[start[0]][start[1]] = 0;
  pq.add(new int[] {0, start[0], start[1]});
  while (!pq.isEmpty()) {
    int[] top = pq.poll();
    int d = top[0], r = top[1], c = top[2];
    if (d > dist[r][c]) continue;
    if (r == end[0] && c == end[1]) break;
    for (int[] dir : dirs) {
      int nr = r + dir[0], nc = c + dir[1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] == 1) continue;
      int nd = d + 1;
      if (nd < dist[nr][nc]) {
        dist[nr][nc] = nd;
        parent[nr][nc] = new int[] {r, c};
        pq.add(new int[] {nd, nr, nc});
      }
    }
  }
  if (dist[end[0]][end[1]] == Integer.MAX_VALUE) return new ArrayList<>();
  LinkedList<int[]> path = new LinkedList<>();
  int[] cur = end;
  while (cur != null) {
    path.addFirst(new int[] {cur[0], cur[1]});
    cur = parent[cur[0]][cur[1]];
  }
  return path;
}`,

  astar: `// import java.util.*;
// A* with the Manhattan-distance heuristic; returns the shortest path from
// start to end as a list of {row, col} cells, or empty if unreachable.
static List<int[]> astar(int[][] grid, int[] start, int[] end) {
  int rows = grid.length, cols = grid[0].length;
  int[][] dirs = { {-1, 0}, {1, 0}, {0, -1}, {0, 1} };
  int[][] g = new int[rows][cols];
  for (int[] row : g) Arrays.fill(row, Integer.MAX_VALUE);
  int[][][] parent = new int[rows][cols][];
  PriorityQueue<int[]> pq = new PriorityQueue<>((x, y) -> x[0] - y[0]);
  g[start[0]][start[1]] = 0;
  pq.add(new int[] {heuristic(start, end), start[0], start[1]});
  while (!pq.isEmpty()) {
    int[] top = pq.poll();
    int r = top[1], c = top[2];
    if (r == end[0] && c == end[1]) break;
    for (int[] dir : dirs) {
      int nr = r + dir[0], nc = c + dir[1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] == 1) continue;
      int ng = g[r][c] + 1;
      if (ng < g[nr][nc]) {
        g[nr][nc] = ng;
        parent[nr][nc] = new int[] {r, c};
        int f = ng + heuristic(new int[] {nr, nc}, end);
        pq.add(new int[] {f, nr, nc});
      }
    }
  }
  if (g[end[0]][end[1]] == Integer.MAX_VALUE) return new ArrayList<>();
  LinkedList<int[]> path = new LinkedList<>();
  int[] cur = end;
  while (cur != null) {
    path.addFirst(new int[] {cur[0], cur[1]});
    cur = parent[cur[0]][cur[1]];
  }
  return path;
}

static int heuristic(int[] a, int[] b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}`,
};
