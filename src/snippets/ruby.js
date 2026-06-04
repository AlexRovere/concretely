// Ruby implementations (educational — clean textbook versions).
export default {
  bubble: `def bubble_sort(a)
  n = a.length
  loop do
    swapped = false
    (0...n - 1).each do |i|
      if a[i] > a[i + 1]
        a[i], a[i + 1] = a[i + 1], a[i]
        swapped = true
      end
    end
    n -= 1
    break unless swapped
  end
  a
end`,
  insertion: `def insertion_sort(a)
  (1...a.length).each do |i|
    key = a[i]
    j = i - 1
    while j >= 0 && a[j] > key
      a[j + 1] = a[j]
      j -= 1
    end
    a[j + 1] = key
  end
  a
end`,
  selection: `def selection_sort(a)
  n = a.length
  (0...n - 1).each do |i|
    min = i
    ((i + 1)...n).each do |j|
      min = j if a[j] < a[min]
    end
    a[i], a[min] = a[min], a[i] if min != i
  end
  a
end`,
  quick: `def quick_sort(a)
  return a if a.length <= 1
  pivot = a[a.length / 2]
  left  = a.select { |x| x < pivot }
  mid   = a.select { |x| x == pivot }
  right = a.select { |x| x > pivot }
  quick_sort(left) + mid + quick_sort(right)
end`,
  merge: `def merge_sort(a)
  return a if a.length <= 1
  mid = a.length / 2
  left = merge_sort(a[0...mid])
  right = merge_sort(a[mid..])
  merge(left, right)
end

def merge(left, right)
  result = []
  i = 0
  j = 0
  while i < left.length && j < right.length
    if left[i] <= right[j]
      result << left[i]
      i += 1
    else
      result << right[j]
      j += 1
    end
  end
  result + left[i..] + right[j..]
end`,
  gnome: `def gnome_sort(a)
  i = 0
  n = a.length
  while i < n
    if i == 0 || a[i] >= a[i - 1]
      i += 1
    else
      a[i], a[i - 1] = a[i - 1], a[i]
      i -= 1
    end
  end
  a
end`,
  pancake: `def pancake_sort(a)
  n = a.length
  while n > 1
    max_idx = (0...n).max_by { |i| a[i] }
    if max_idx != n - 1
      flip(a, max_idx) if max_idx > 0
      flip(a, n - 1)
    end
    n -= 1
  end
  a
end

def flip(a, k)
  i = 0
  while i < k
    a[i], a[k] = a[k], a[i]
    i += 1
    k -= 1
  end
end`,
  stooge: `def stooge_sort(a, i = 0, j = a.length - 1)
  if a[i] > a[j]
    a[i], a[j] = a[j], a[i]
  end
  if j - i + 1 > 2
    t = (j - i + 1) / 3
    stooge_sort(a, i, j - t)
    stooge_sort(a, i + t, j)
    stooge_sort(a, i, j - t)
  end
  a
end`,
  bogo: `def sorted?(a)
  (0...a.length - 1).all? { |i| a[i] <= a[i + 1] }
end

def bogo_sort(a)
  a.shuffle! until sorted?(a)
  a
end`,
  bfs: `def bfs(grid, start, goal)
  rows = grid.length
  cols = grid[0].length
  queue = [start]
  visited = { start => true }
  parent = {}
  dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]

  until queue.empty?
    r, c = queue.shift
    if [r, c] == goal
      path = []
      cur = goal
      while cur
        path.unshift(cur)
        cur = parent[cur]
      end
      return path
    end
    dirs.each do |dr, dc|
      nr = r + dr
      nc = c + dc
      next if nr < 0 || nr >= rows || nc < 0 || nc >= cols
      next if grid[nr][nc] == 1 || visited[[nr, nc]]
      visited[[nr, nc]] = true
      parent[[nr, nc]] = [r, c]
      queue << [nr, nc]
    end
  end
  nil
end`,
  dijkstra: `require 'set'

def dijkstra(grid, start, goal)
  rows = grid.length
  cols = grid[0].length
  dist = Hash.new(Float::INFINITY)
  dist[start] = 0
  parent = {}
  visited = Set.new
  dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]

  until visited.size == rows * cols
    cur = nil
    best = Float::INFINITY
    dist.each do |node, d|
      if !visited.include?(node) && d < best
        best = d
        cur = node
      end
    end
    break if cur.nil?
    break if cur == goal
    visited.add(cur)
    r, c = cur
    dirs.each do |dr, dc|
      nr = r + dr
      nc = c + dc
      next if nr < 0 || nr >= rows || nc < 0 || nc >= cols
      next if grid[nr][nc] == 1
      nd = dist[cur] + 1
      if nd < dist[[nr, nc]]
        dist[[nr, nc]] = nd
        parent[[nr, nc]] = cur
      end
    end
  end

  return nil unless parent.key?(goal) || start == goal
  path = []
  node = goal
  while node
    path.unshift(node)
    node = parent[node]
  end
  path
end`,
  astar: `require 'set'

def heuristic(a, b)
  (a[0] - b[0]).abs + (a[1] - b[1]).abs
end

def astar(grid, start, goal)
  rows = grid.length
  cols = grid[0].length
  g = Hash.new(Float::INFINITY)
  g[start] = 0
  f = Hash.new(Float::INFINITY)
  f[start] = heuristic(start, goal)
  parent = {}
  open = Set.new([start])
  dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]

  until open.empty?
    cur = open.min_by { |node| f[node] }
    if cur == goal
      path = []
      node = goal
      while node
        path.unshift(node)
        node = parent[node]
      end
      return path
    end
    open.delete(cur)
    r, c = cur
    dirs.each do |dr, dc|
      nr = r + dr
      nc = c + dc
      next if nr < 0 || nr >= rows || nc < 0 || nc >= cols
      next if grid[nr][nc] == 1
      neighbor = [nr, nc]
      tentative = g[cur] + 1
      if tentative < g[neighbor]
        parent[neighbor] = cur
        g[neighbor] = tentative
        f[neighbor] = tentative + heuristic(neighbor, goal)
        open.add(neighbor)
      end
    end
  end
  nil
end`,
};
