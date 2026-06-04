// Swift implementations (educational — clean textbook versions).
export default {
  bubble: `func bubbleSort(_ a: inout [Int]) {
  let n = a.count
  guard n > 1 else { return }
  for i in 0..<n - 1 {
    var swapped = false
    for j in 0..<n - 1 - i {
      if a[j] > a[j + 1] {
        a.swapAt(j, j + 1)
        swapped = true
      }
    }
    if !swapped { break }
  }
}`,
  insertion: `func insertionSort(_ a: inout [Int]) {
  for i in 1..<a.count {
    let key = a[i]
    var j = i - 1
    while j >= 0 && a[j] > key {
      a[j + 1] = a[j]
      j -= 1
    }
    a[j + 1] = key
  }
}`,
  selection: `func selectionSort(_ a: inout [Int]) {
  let n = a.count
  guard n > 1 else { return }
  for i in 0..<n - 1 {
    var minIndex = i
    for j in i + 1..<n where a[j] < a[minIndex] {
      minIndex = j
    }
    if minIndex != i {
      a.swapAt(i, minIndex)
    }
  }
}`,
  quick: `func quickSort(_ a: inout [Int], _ low: Int = 0, _ high: Int? = nil) {
  let high = high ?? a.count - 1
  guard low < high else { return }
  let pivot = a[high]
  var i = low
  for j in low..<high where a[j] < pivot {
    a.swapAt(i, j)
    i += 1
  }
  a.swapAt(i, high)
  quickSort(&a, low, i - 1)
  quickSort(&a, i + 1, high)
}`,
  merge: `func mergeSort(_ a: [Int]) -> [Int] {
  guard a.count > 1 else { return a }
  let mid = a.count / 2
  let left = mergeSort(Array(a[..<mid]))
  let right = mergeSort(Array(a[mid...]))
  var merged: [Int] = []
  merged.reserveCapacity(a.count)
  var i = 0, j = 0
  while i < left.count && j < right.count {
    if left[i] <= right[j] {
      merged.append(left[i]); i += 1
    } else {
      merged.append(right[j]); j += 1
    }
  }
  merged.append(contentsOf: left[i...])
  merged.append(contentsOf: right[j...])
  return merged
}`,
  gnome: `func gnomeSort(_ a: inout [Int]) {
  var pos = 0
  while pos < a.count {
    if pos == 0 || a[pos] >= a[pos - 1] {
      pos += 1
    } else {
      a.swapAt(pos, pos - 1)
      pos -= 1
    }
  }
}`,
  pancake: `func pancakeSort(_ a: inout [Int]) {
  func flip(_ k: Int) {
    var i = 0, j = k
    while i < j {
      a.swapAt(i, j)
      i += 1; j -= 1
    }
  }
  var size = a.count
  while size > 1 {
    var maxIndex = 0
    for i in 1..<size where a[i] > a[maxIndex] {
      maxIndex = i
    }
    if maxIndex != size - 1 {
      if maxIndex != 0 { flip(maxIndex) }
      flip(size - 1)
    }
    size -= 1
  }
}`,
  stooge: `func stoogeSort(_ a: inout [Int], _ i: Int = 0, _ j: Int? = nil) {
  let j = j ?? a.count - 1
  guard i < j else { return }
  if a[i] > a[j] {
    a.swapAt(i, j)
  }
  if j - i + 1 > 2 {
    let t = (j - i + 1) / 3
    stoogeSort(&a, i, j - t)
    stoogeSort(&a, i + t, j)
    stoogeSort(&a, i, j - t)
  }
}`,
  bogo: `func bogoSort(_ a: inout [Int]) {
  func isSorted() -> Bool {
    for i in 1..<max(a.count, 1) where a[i] < a[i - 1] {
      return false
    }
    return true
  }
  while !isSorted() {
    a.shuffle()
  }
}`,
  bfs: `func bfs(_ grid: [[Int]], _ start: (Int, Int), _ end: (Int, Int)) -> [(Int, Int)] {
  let rows = grid.count
  guard rows > 0 else { return [] }
  let cols = grid[0].count
  func inBounds(_ r: Int, _ c: Int) -> Bool {
    return r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] == 0
  }
  guard inBounds(start.0, start.1), inBounds(end.0, end.1) else { return [] }
  var queue = [start]
  var head = 0
  var visited = Set([start.0 * cols + start.1])
  var parent: [Int: (Int, Int)] = [:]
  let moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]
  while head < queue.count {
    let cur = queue[head]; head += 1
    if cur == end {
      var path = [cur]
      var node = cur
      while let p = parent[node.0 * cols + node.1] {
        path.append(p); node = p
      }
      return path.reversed()
    }
    for m in moves {
      let nr = cur.0 + m.0, nc = cur.1 + m.1
      let key = nr * cols + nc
      if inBounds(nr, nc) && !visited.contains(key) {
        visited.insert(key)
        parent[key] = cur
        queue.append((nr, nc))
      }
    }
  }
  return []
}`,
  dijkstra: `func dijkstra(_ grid: [[Int]], _ start: (Int, Int), _ end: (Int, Int)) -> [(Int, Int)] {
  let rows = grid.count
  guard rows > 0 else { return [] }
  let cols = grid[0].count
  func inBounds(_ r: Int, _ c: Int) -> Bool {
    return r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] == 0
  }
  guard inBounds(start.0, start.1), inBounds(end.0, end.1) else { return [] }
  let total = rows * cols
  var dist = Array(repeating: Int.max, count: total)
  var parent = Array(repeating: -1, count: total)
  var visited = Array(repeating: false, count: total)
  let startKey = start.0 * cols + start.1
  let endKey = end.0 * cols + end.1
  dist[startKey] = 0
  let moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]
  while true {
    var u = -1, best = Int.max
    for k in 0..<total where !visited[k] && dist[k] < best {
      best = dist[k]; u = k
    }
    if u == -1 { break }
    if u == endKey { break }
    visited[u] = true
    let r = u / cols, c = u % cols
    for m in moves {
      let nr = r + m.0, nc = c + m.1
      if inBounds(nr, nc) {
        let v = nr * cols + nc
        if dist[u] + 1 < dist[v] {
          dist[v] = dist[u] + 1
          parent[v] = u
        }
      }
    }
  }
  if dist[endKey] == Int.max { return [] }
  var path: [(Int, Int)] = []
  var node = endKey
  while node != -1 {
    path.append((node / cols, node % cols))
    node = parent[node]
  }
  return path.reversed()
}`,
  astar: `func astar(_ grid: [[Int]], _ start: (Int, Int), _ end: (Int, Int)) -> [(Int, Int)] {
  let rows = grid.count
  guard rows > 0 else { return [] }
  let cols = grid[0].count
  func inBounds(_ r: Int, _ c: Int) -> Bool {
    return r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] == 0
  }
  guard inBounds(start.0, start.1), inBounds(end.0, end.1) else { return [] }
  func heuristic(_ r: Int, _ c: Int) -> Int {
    return abs(r - end.0) + abs(c - end.1)
  }
  let total = rows * cols
  var gScore = Array(repeating: Int.max, count: total)
  var fScore = Array(repeating: Int.max, count: total)
  var parent = Array(repeating: -1, count: total)
  var closed = Array(repeating: false, count: total)
  let startKey = start.0 * cols + start.1
  let endKey = end.0 * cols + end.1
  gScore[startKey] = 0
  fScore[startKey] = heuristic(start.0, start.1)
  var open: Set<Int> = [startKey]
  let moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]
  while !open.isEmpty {
    var current = -1, best = Int.max
    for k in open where fScore[k] < best {
      best = fScore[k]; current = k
    }
    if current == endKey {
      var path: [(Int, Int)] = []
      var node = current
      while node != -1 {
        path.append((node / cols, node % cols))
        node = parent[node]
      }
      return path.reversed()
    }
    open.remove(current)
    closed[current] = true
    let r = current / cols, c = current % cols
    for m in moves {
      let nr = r + m.0, nc = c + m.1
      if inBounds(nr, nc) {
        let v = nr * cols + nc
        if closed[v] { continue }
        let tentative = gScore[current] + 1
        if tentative < gScore[v] {
          parent[v] = current
          gScore[v] = tentative
          fScore[v] = tentative + heuristic(nr, nc)
          open.insert(v)
        }
      }
    }
  }
  return []
}`,
};
