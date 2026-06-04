// Go implementations (educational — clean textbook versions).
export default {
  bubble: `func bubbleSort(a []int) {
  for i := 0; i < len(a)-1; i++ {
    swapped := false
    for j := 0; j < len(a)-1-i; j++ {
      if a[j] > a[j+1] {
        a[j], a[j+1] = a[j+1], a[j]
        swapped = true
      }
    }
    if !swapped {
      break
    }
  }
}`,

  insertion: `func insertionSort(a []int) {
  for i := 1; i < len(a); i++ {
    key := a[i]
    j := i - 1
    for j >= 0 && a[j] > key {
      a[j+1] = a[j]
      j--
    }
    a[j+1] = key
  }
}`,

  selection: `func selectionSort(a []int) {
  for i := 0; i < len(a)-1; i++ {
    min := i
    for j := i + 1; j < len(a); j++ {
      if a[j] < a[min] {
        min = j
      }
    }
    a[i], a[min] = a[min], a[i]
  }
}`,

  quick: `func quickSort(a []int) {
  if len(a) < 2 {
    return
  }
  quick(a, 0, len(a)-1)
}

func quick(a []int, lo, hi int) {
  if lo >= hi {
    return
  }
  p := partition(a, lo, hi)
  quick(a, lo, p-1)
  quick(a, p+1, hi)
}

func partition(a []int, lo, hi int) int {
  pivot := a[hi]
  i := lo
  for j := lo; j < hi; j++ {
    if a[j] < pivot {
      a[i], a[j] = a[j], a[i]
      i++
    }
  }
  a[i], a[hi] = a[hi], a[i]
  return i
}`,

  merge: `func mergeSort(a []int) []int {
  if len(a) < 2 {
    return a
  }
  mid := len(a) / 2
  left := mergeSort(a[:mid])
  right := mergeSort(a[mid:])
  return merge(left, right)
}

func merge(left, right []int) []int {
  result := make([]int, 0, len(left)+len(right))
  i, j := 0, 0
  for i < len(left) && j < len(right) {
    if left[i] <= right[j] {
      result = append(result, left[i])
      i++
    } else {
      result = append(result, right[j])
      j++
    }
  }
  result = append(result, left[i:]...)
  result = append(result, right[j:]...)
  return result
}`,

  gnome: `func gnomeSort(a []int) {
  i := 0
  for i < len(a) {
    if i == 0 || a[i-1] <= a[i] {
      i++
    } else {
      a[i-1], a[i] = a[i], a[i-1]
      i--
    }
  }
}`,

  pancake: `func pancakeSort(a []int) {
  for size := len(a); size > 1; size-- {
    maxIdx := 0
    for i := 1; i < size; i++ {
      if a[i] > a[maxIdx] {
        maxIdx = i
      }
    }
    if maxIdx != size-1 {
      flip(a, maxIdx)
      flip(a, size-1)
    }
  }
}

func flip(a []int, k int) {
  for i, j := 0, k; i < j; i, j = i+1, j-1 {
    a[i], a[j] = a[j], a[i]
  }
}`,

  stooge: `func stoogeSort(a []int) {
  stooge(a, 0, len(a)-1)
}

func stooge(a []int, lo, hi int) {
  if lo >= hi {
    return
  }
  if a[lo] > a[hi] {
    a[lo], a[hi] = a[hi], a[lo]
  }
  if hi-lo+1 > 2 {
    t := (hi - lo + 1) / 3
    stooge(a, lo, hi-t)
    stooge(a, lo+t, hi)
    stooge(a, lo, hi-t)
  }
}`,

  bogo: `func bogoSort(a []int) {
  for !isSorted(a) {
    shuffle(a)
  }
}

func isSorted(a []int) bool {
  for i := 1; i < len(a); i++ {
    if a[i-1] > a[i] {
      return false
    }
  }
  return true
}

func shuffle(a []int) {
  for i := len(a) - 1; i > 0; i-- {
    j := rand.Intn(i + 1)
    a[i], a[j] = a[j], a[i]
  }
}`,

  bfs: `func bfs(grid [][]int, start, end [2]int) [][2]int {
  rows, cols := len(grid), len(grid[0])
  dirs := [4][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}
  prev := make(map[[2]int][2]int)
  visited := make(map[[2]int]bool)
  visited[start] = true
  queue := [][2]int{start}
  for len(queue) > 0 {
    cur := queue[0]
    queue = queue[1:]
    if cur == end {
      return reconstruct(prev, start, end)
    }
    for _, d := range dirs {
      nr, nc := cur[0]+d[0], cur[1]+d[1]
      next := [2]int{nr, nc}
      if nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
        grid[nr][nc] == 0 && !visited[next] {
        visited[next] = true
        prev[next] = cur
        queue = append(queue, next)
      }
    }
  }
  return nil
}

func reconstruct(prev map[[2]int][2]int, start, end [2]int) [][2]int {
  path := [][2]int{end}
  for cur := end; cur != start; {
    cur = prev[cur]
    path = append([][2]int{cur}, path...)
  }
  return path
}`,

  dijkstra: `type item struct {
  pos  [2]int
  dist int
}

type pq []item

func (p pq) Len() int            { return len(p) }
func (p pq) Less(i, j int) bool  { return p[i].dist < p[j].dist }
func (p pq) Swap(i, j int)       { p[i], p[j] = p[j], p[i] }
func (p *pq) Push(x interface{}) { *p = append(*p, x.(item)) }
func (p *pq) Pop() interface{} {
  old := *p
  n := len(old)
  it := old[n-1]
  *p = old[:n-1]
  return it
}

func dijkstra(grid [][]int, start, end [2]int) [][2]int {
  rows, cols := len(grid), len(grid[0])
  dirs := [4][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}
  dist := make(map[[2]int]int)
  prev := make(map[[2]int][2]int)
  dist[start] = 0
  h := &pq{{start, 0}}
  heap.Init(h)
  for h.Len() > 0 {
    cur := heap.Pop(h).(item)
    if cur.pos == end {
      return reconstruct(prev, start, end)
    }
    if d, ok := dist[cur.pos]; ok && cur.dist > d {
      continue
    }
    for _, dir := range dirs {
      nr, nc := cur.pos[0]+dir[0], cur.pos[1]+dir[1]
      next := [2]int{nr, nc}
      if nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 0 {
        nd := cur.dist + 1
        if old, ok := dist[next]; !ok || nd < old {
          dist[next] = nd
          prev[next] = cur.pos
          heap.Push(h, item{next, nd})
        }
      }
    }
  }
  return nil
}`,

  astar: `func abs(x int) int {
  if x < 0 {
    return -x
  }
  return x
}

func astar(grid [][]int, start, end [2]int) [][2]int {
  rows, cols := len(grid), len(grid[0])
  dirs := [4][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}
  h := func(p [2]int) int {
    return abs(p[0]-end[0]) + abs(p[1]-end[1])
  }
  g := make(map[[2]int]int)
  prev := make(map[[2]int][2]int)
  g[start] = 0
  open := &pq{{start, h(start)}}
  heap.Init(open)
  for open.Len() > 0 {
    cur := heap.Pop(open).(item)
    if cur.pos == end {
      return reconstruct(prev, start, end)
    }
    for _, dir := range dirs {
      nr, nc := cur.pos[0]+dir[0], cur.pos[1]+dir[1]
      next := [2]int{nr, nc}
      if nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 0 {
        ng := g[cur.pos] + 1
        if old, ok := g[next]; !ok || ng < old {
          g[next] = ng
          prev[next] = cur.pos
          heap.Push(open, item{next, ng + h(next)})
        }
      }
    }
  }
  return nil
}`,
};
