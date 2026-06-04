// PHP implementations (educational — clean textbook versions).
export default {
  bubble: `function bubbleSort(array $a): array {
  $n = count($a);
  for ($i = 0; $i < $n - 1; $i++) {
    $swapped = false;
    for ($j = 0; $j < $n - 1 - $i; $j++) {
      if ($a[$j] > $a[$j + 1]) {
        [$a[$j], $a[$j + 1]] = [$a[$j + 1], $a[$j]];
        $swapped = true;
      }
    }
    if (!$swapped) break;
  }
  return $a;
}`,

  insertion: `function insertionSort(array $a): array {
  $n = count($a);
  for ($i = 1; $i < $n; $i++) {
    $key = $a[$i];
    $j = $i - 1;
    while ($j >= 0 && $a[$j] > $key) {
      $a[$j + 1] = $a[$j];
      $j--;
    }
    $a[$j + 1] = $key;
  }
  return $a;
}`,

  selection: `function selectionSort(array $a): array {
  $n = count($a);
  for ($i = 0; $i < $n - 1; $i++) {
    $min = $i;
    for ($j = $i + 1; $j < $n; $j++) {
      if ($a[$j] < $a[$min]) {
        $min = $j;
      }
    }
    if ($min !== $i) {
      [$a[$i], $a[$min]] = [$a[$min], $a[$i]];
    }
  }
  return $a;
}`,

  quick: `function quickSort(array $a): array {
  if (count($a) <= 1) {
    return $a;
  }
  $pivot = $a[intdiv(count($a), 2)];
  $left = $mid = $right = [];
  foreach ($a as $x) {
    if ($x < $pivot) {
      $left[] = $x;
    } elseif ($x > $pivot) {
      $right[] = $x;
    } else {
      $mid[] = $x;
    }
  }
  return array_merge(quickSort($left), $mid, quickSort($right));
}`,

  merge: `function mergeSort(array $a): array {
  $n = count($a);
  if ($n <= 1) {
    return $a;
  }
  $mid = intdiv($n, 2);
  $left = mergeSort(array_slice($a, 0, $mid));
  $right = mergeSort(array_slice($a, $mid));
  $result = [];
  $i = $j = 0;
  while ($i < count($left) && $j < count($right)) {
    if ($left[$i] <= $right[$j]) {
      $result[] = $left[$i++];
    } else {
      $result[] = $right[$j++];
    }
  }
  while ($i < count($left)) {
    $result[] = $left[$i++];
  }
  while ($j < count($right)) {
    $result[] = $right[$j++];
  }
  return $result;
}`,

  gnome: `function gnomeSort(array $a): array {
  $n = count($a);
  $i = 0;
  while ($i < $n) {
    if ($i === 0 || $a[$i] >= $a[$i - 1]) {
      $i++;
    } else {
      [$a[$i], $a[$i - 1]] = [$a[$i - 1], $a[$i]];
      $i--;
    }
  }
  return $a;
}`,

  pancake: `function pancakeSort(array $a): array {
  $flip = function (array $a, int $k): array {
    $sub = array_reverse(array_slice($a, 0, $k + 1));
    return array_merge($sub, array_slice($a, $k + 1));
  };
  for ($size = count($a); $size > 1; $size--) {
    // find index of the maximum within the unsorted prefix
    $maxIdx = 0;
    for ($i = 1; $i < $size; $i++) {
      if ($a[$i] > $a[$maxIdx]) {
        $maxIdx = $i;
      }
    }
    if ($maxIdx !== $size - 1) {
      // bring max to front, then flip it to its final position
      if ($maxIdx !== 0) {
        $a = $flip($a, $maxIdx);
      }
      $a = $flip($a, $size - 1);
    }
  }
  return $a;
}`,

  stooge: `function stoogeSort(array $a): array {
  $sort = function (array &$a, int $lo, int $hi) use (&$sort): void {
    if ($a[$lo] > $a[$hi]) {
      [$a[$lo], $a[$hi]] = [$a[$hi], $a[$lo]];
    }
    if ($hi - $lo + 1 > 2) {
      $t = intdiv($hi - $lo + 1, 3);
      $sort($a, $lo, $hi - $t);
      $sort($a, $lo + $t, $hi);
      $sort($a, $lo, $hi - $t);
    }
  };
  if (count($a) > 1) {
    $sort($a, 0, count($a) - 1);
  }
  return $a;
}`,

  bogo: `function bogoSort(array $a): array {
  $isSorted = function (array $a): bool {
    for ($i = 1; $i < count($a); $i++) {
      if ($a[$i - 1] > $a[$i]) {
        return false;
      }
    }
    return true;
  };
  while (!$isSorted($a)) {
    shuffle($a); // randomly permute in place — wildly inefficient
  }
  return $a;
}`,

  bfs: `function bfs(array $grid, array $start, array $end): array {
  $rows = count($grid);
  $cols = count($grid[0]);
  $key = fn(int $r, int $c): string => $r . ',' . $c;
  $visited = [$key($start[0], $start[1]) => true];
  $queue = [[$start[0], $start[1], [$start]]];
  $dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  while ($queue) {
    [$r, $c, $path] = array_shift($queue);
    if ($r === $end[0] && $c === $end[1]) {
      return $path;
    }
    foreach ($dirs as [$dr, $dc]) {
      $nr = $r + $dr;
      $nc = $c + $dc;
      if ($nr < 0 || $nr >= $rows || $nc < 0 || $nc >= $cols) continue;
      if ($grid[$nr][$nc] === 1) continue;
      $k = $key($nr, $nc);
      if (isset($visited[$k])) continue;
      $visited[$k] = true;
      $queue[] = [$nr, $nc, array_merge($path, [[$nr, $nc]])];
    }
  }
  return []; // no path found
}`,

  dijkstra: `function dijkstra(array $grid, array $start, array $end): array {
  $rows = count($grid);
  $cols = count($grid[0]);
  $key = fn(int $r, int $c): string => $r . ',' . $c;
  $dist = [$key($start[0], $start[1]) => 0];
  $prev = [];
  // simple priority queue: array of [dist, r, c], scanned for the minimum
  $pq = [[0, $start[0], $start[1]]];
  $dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  while ($pq) {
    // extract node with smallest distance
    $best = 0;
    foreach ($pq as $i => $node) {
      if ($node[0] < $pq[$best][0]) {
        $best = $i;
      }
    }
    [$d, $r, $c] = $pq[$best];
    array_splice($pq, $best, 1);
    if ($r === $end[0] && $c === $end[1]) {
      break;
    }
    if ($d > ($dist[$key($r, $c)] ?? PHP_INT_MAX)) continue;
    foreach ($dirs as [$dr, $dc]) {
      $nr = $r + $dr;
      $nc = $c + $dc;
      if ($nr < 0 || $nr >= $rows || $nc < 0 || $nc >= $cols) continue;
      if ($grid[$nr][$nc] === 1) continue;
      $nd = $d + 1; // every open cell costs 1
      $nk = $key($nr, $nc);
      if ($nd < ($dist[$nk] ?? PHP_INT_MAX)) {
        $dist[$nk] = $nd;
        $prev[$nk] = [$r, $c];
        $pq[] = [$nd, $nr, $nc];
      }
    }
  }
  // reconstruct path from end back to start
  $endKey = $key($end[0], $end[1]);
  if (!isset($dist[$endKey])) {
    return [];
  }
  $path = [];
  $cur = $end;
  while ($cur !== null) {
    array_unshift($path, $cur);
    $ck = $key($cur[0], $cur[1]);
    $cur = $prev[$ck] ?? null;
  }
  return $path;
}`,

  astar: `function astar(array $grid, array $start, array $end): array {
  $rows = count($grid);
  $cols = count($grid[0]);
  $key = fn(int $r, int $c): string => $r . ',' . $c;
  $heuristic = fn(int $r, int $c): int => abs($r - $end[0]) + abs($c - $end[1]);
  $g = [$key($start[0], $start[1]) => 0];
  $prev = [];
  // open set entries: [fScore, r, c]
  $open = [[$heuristic($start[0], $start[1]), $start[0], $start[1]]];
  $dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  while ($open) {
    // pick the node with the lowest fScore
    $best = 0;
    foreach ($open as $i => $node) {
      if ($node[0] < $open[$best][0]) {
        $best = $i;
      }
    }
    [, $r, $c] = $open[$best];
    array_splice($open, $best, 1);
    if ($r === $end[0] && $c === $end[1]) {
      break;
    }
    foreach ($dirs as [$dr, $dc]) {
      $nr = $r + $dr;
      $nc = $c + $dc;
      if ($nr < 0 || $nr >= $rows || $nc < 0 || $nc >= $cols) continue;
      if ($grid[$nr][$nc] === 1) continue;
      $tentative = $g[$key($r, $c)] + 1;
      $nk = $key($nr, $nc);
      if ($tentative < ($g[$nk] ?? PHP_INT_MAX)) {
        $g[$nk] = $tentative;
        $prev[$nk] = [$r, $c];
        $open[] = [$tentative + $heuristic($nr, $nc), $nr, $nc];
      }
    }
  }
  // reconstruct path
  $endKey = $key($end[0], $end[1]);
  if (!isset($g[$endKey])) {
    return [];
  }
  $path = [];
  $cur = $end;
  while ($cur !== null) {
    array_unshift($path, $cur);
    $cur = $prev[$key($cur[0], $cur[1])] ?? null;
  }
  return $path;
}`,
};
