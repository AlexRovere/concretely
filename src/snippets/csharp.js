// C# implementations (educational — clean textbook versions).
export default {
  bubble: `static void BubbleSort(int[] a) {
  int n = a.Length;
  for (int i = 0; i < n - 1; i++) {
    bool swapped = false;
    for (int j = 0; j < n - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        (a[j], a[j + 1]) = (a[j + 1], a[j]);
        swapped = true;
      }
    }
    if (!swapped) break;
  }
}`,

  insertion: `static void InsertionSort(int[] a) {
  for (int i = 1; i < a.Length; i++) {
    int key = a[i];
    int j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
}`,

  selection: `static void SelectionSort(int[] a) {
  int n = a.Length;
  for (int i = 0; i < n - 1; i++) {
    int min = i;
    for (int j = i + 1; j < n; j++) {
      if (a[j] < a[min]) min = j;
    }
    if (min != i) (a[i], a[min]) = (a[min], a[i]);
  }
}`,

  quick: `static void QuickSort(int[] a) {
  Sort(a, 0, a.Length - 1);
}

static void Sort(int[] a, int lo, int hi) {
  if (lo >= hi) return;
  int p = Partition(a, lo, hi);
  Sort(a, lo, p - 1);
  Sort(a, p + 1, hi);
}

static int Partition(int[] a, int lo, int hi) {
  int pivot = a[hi];
  int i = lo - 1;
  for (int j = lo; j < hi; j++) {
    if (a[j] <= pivot) {
      i++;
      (a[i], a[j]) = (a[j], a[i]);
    }
  }
  (a[i + 1], a[hi]) = (a[hi], a[i + 1]);
  return i + 1;
}`,

  merge: `static void MergeSort(int[] a) {
  if (a.Length < 2) return;
  int mid = a.Length / 2;
  int[] left = a[..mid];
  int[] right = a[mid..];
  MergeSort(left);
  MergeSort(right);
  Merge(a, left, right);
}

static void Merge(int[] a, int[] left, int[] right) {
  int i = 0, j = 0, k = 0;
  while (i < left.Length && j < right.Length)
    a[k++] = left[i] <= right[j] ? left[i++] : right[j++];
  while (i < left.Length) a[k++] = left[i++];
  while (j < right.Length) a[k++] = right[j++];
}`,

  gnome: `static void GnomeSort(int[] a) {
  int i = 0;
  while (i < a.Length) {
    if (i == 0 || a[i] >= a[i - 1]) {
      i++;
    } else {
      (a[i], a[i - 1]) = (a[i - 1], a[i]);
      i--;
    }
  }
}`,

  pancake: `static void PancakeSort(int[] a) {
  for (int size = a.Length; size > 1; size--) {
    int maxIdx = 0;
    for (int i = 1; i < size; i++)
      if (a[i] > a[maxIdx]) maxIdx = i;
    if (maxIdx == size - 1) continue;
    Flip(a, maxIdx);
    Flip(a, size - 1);
  }
}

static void Flip(int[] a, int k) {
  int lo = 0;
  while (lo < k) {
    (a[lo], a[k]) = (a[k], a[lo]);
    lo++;
    k--;
  }
}`,

  stooge: `static void StoogeSort(int[] a) {
  Stooge(a, 0, a.Length - 1);
}

static void Stooge(int[] a, int lo, int hi) {
  if (lo >= hi) return;
  if (a[lo] > a[hi]) (a[lo], a[hi]) = (a[hi], a[lo]);
  if (hi - lo + 1 > 2) {
    int t = (hi - lo + 1) / 3;
    Stooge(a, lo, hi - t);
    Stooge(a, lo + t, hi);
    Stooge(a, lo, hi - t);
  }
}`,

  bogo: `static void BogoSort(int[] a) {
  var rng = new Random();
  while (!IsSorted(a)) Shuffle(a, rng);
}

static bool IsSorted(int[] a) {
  for (int i = 1; i < a.Length; i++)
    if (a[i - 1] > a[i]) return false;
  return true;
}

static void Shuffle(int[] a, Random rng) {
  for (int i = a.Length - 1; i > 0; i--) {
    int j = rng.Next(i + 1);
    (a[i], a[j]) = (a[j], a[i]);
  }
}`,

  bfs: `static List<int[]> Bfs(int[][] grid, int[] start, int[] end) {
  int rows = grid.Length, cols = grid[0].Length;
  int[][] dirs = { new[] { 1, 0 }, new[] { -1, 0 }, new[] { 0, 1 }, new[] { 0, -1 } };
  var queue = new Queue<int[]>();
  var prev = new Dictionary<(int, int), (int, int)?>();
  queue.Enqueue(start);
  prev[(start[0], start[1])] = null;
  while (queue.Count > 0) {
    var cur = queue.Dequeue();
    if (cur[0] == end[0] && cur[1] == end[1])
      return Reconstruct(prev, end);
    foreach (var d in dirs) {
      int nr = cur[0] + d[0], nc = cur[1] + d[1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] == 1 || prev.ContainsKey((nr, nc))) continue;
      prev[(nr, nc)] = (cur[0], cur[1]);
      queue.Enqueue(new[] { nr, nc });
    }
  }
  return new List<int[]>();
}

static List<int[]> Reconstruct(Dictionary<(int, int), (int, int)?> prev, int[] end) {
  var path = new List<int[]>();
  (int, int)? at = (end[0], end[1]);
  while (at != null) {
    path.Add(new[] { at.Value.Item1, at.Value.Item2 });
    at = prev[at.Value];
  }
  path.Reverse();
  return path;
}`,

  dijkstra: `static List<int[]> Dijkstra(int[][] grid, int[] start, int[] end) {
  int rows = grid.Length, cols = grid[0].Length;
  int[][] dirs = { new[] { 1, 0 }, new[] { -1, 0 }, new[] { 0, 1 }, new[] { 0, -1 } };
  var dist = new Dictionary<(int, int), int>();
  var prev = new Dictionary<(int, int), (int, int)?>();
  var pq = new PriorityQueue<(int, int), int>();
  dist[(start[0], start[1])] = 0;
  prev[(start[0], start[1])] = null;
  pq.Enqueue((start[0], start[1]), 0);
  while (pq.Count > 0) {
    pq.TryDequeue(out var cur, out int cost);
    if (cur.Item1 == end[0] && cur.Item2 == end[1])
      return Reconstruct(prev, end);
    if (cost > dist[cur]) continue;
    foreach (var d in dirs) {
      int nr = cur.Item1 + d[0], nc = cur.Item2 + d[1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] == 1) continue;
      int nd = cost + 1;
      var key = (nr, nc);
      if (!dist.ContainsKey(key) || nd < dist[key]) {
        dist[key] = nd;
        prev[key] = cur;
        pq.Enqueue(key, nd);
      }
    }
  }
  return new List<int[]>();
}

static List<int[]> Reconstruct(Dictionary<(int, int), (int, int)?> prev, int[] end) {
  var path = new List<int[]>();
  (int, int)? at = (end[0], end[1]);
  while (at != null) {
    path.Add(new[] { at.Value.Item1, at.Value.Item2 });
    at = prev[at.Value];
  }
  path.Reverse();
  return path;
}`,

  astar: `static List<int[]> AStar(int[][] grid, int[] start, int[] end) {
  int rows = grid.Length, cols = grid[0].Length;
  int[][] dirs = { new[] { 1, 0 }, new[] { -1, 0 }, new[] { 0, 1 }, new[] { 0, -1 } };
  var g = new Dictionary<(int, int), int>();
  var prev = new Dictionary<(int, int), (int, int)?>();
  var open = new PriorityQueue<(int, int), int>();
  g[(start[0], start[1])] = 0;
  prev[(start[0], start[1])] = null;
  open.Enqueue((start[0], start[1]), Heuristic(start[0], start[1], end));
  while (open.Count > 0) {
    open.TryDequeue(out var cur, out _);
    if (cur.Item1 == end[0] && cur.Item2 == end[1])
      return Reconstruct(prev, end);
    foreach (var d in dirs) {
      int nr = cur.Item1 + d[0], nc = cur.Item2 + d[1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] == 1) continue;
      int tentative = g[cur] + 1;
      var key = (nr, nc);
      if (!g.ContainsKey(key) || tentative < g[key]) {
        g[key] = tentative;
        prev[key] = cur;
        open.Enqueue(key, tentative + Heuristic(nr, nc, end));
      }
    }
  }
  return new List<int[]>();
}

static int Heuristic(int r, int c, int[] end) {
  return Math.Abs(r - end[0]) + Math.Abs(c - end[1]);
}

static List<int[]> Reconstruct(Dictionary<(int, int), (int, int)?> prev, int[] end) {
  var path = new List<int[]>();
  (int, int)? at = (end[0], end[1]);
  while (at != null) {
    path.Add(new[] { at.Value.Item1, at.Value.Item2 });
    at = prev[at.Value];
  }
  path.Reverse();
  return path;
}`,
};
