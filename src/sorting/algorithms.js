/**
 * Sorting algorithms as step generators.
 *
 * Each generator works on a private copy of `input`, sorts it, and yields step
 * objects describing what happens. The visual state is fully reconstructible by
 * replaying the mutation steps (see `applyStep`) — so correctness is testable in
 * Node without any rendering.
 *
 * Step shapes:
 *   { type: 'compare', a, b }        compare elements at indices a and b (visual)
 *   { type: 'swap',    a, b }        swap elements at indices a and b (mutation)
 *   { type: 'set', index, value }    write value at index (mutation, merge sort)
 *   { type: 'sorted',  index }       index is now in its final position (visual)
 */

export function* bubbleSort(input) {
  const a = [...input];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      yield { type: 'compare', a: j, b: j + 1 };
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        yield { type: 'swap', a: j, b: j + 1 };
      }
    }
    yield { type: 'sorted', index: n - 1 - i };
  }
  if (n > 0) yield { type: 'sorted', index: 0 };
}

export function* insertionSort(input) {
  const a = [...input];
  for (let i = 1; i < a.length; i++) {
    let j = i;
    while (j > 0) {
      yield { type: 'compare', a: j - 1, b: j };
      if (a[j - 1] > a[j]) {
        [a[j - 1], a[j]] = [a[j], a[j - 1]];
        yield { type: 'swap', a: j - 1, b: j };
        j--;
      } else break;
    }
  }
}

export function* selectionSort(input) {
  const a = [...input];
  const n = a.length;
  for (let i = 0; i < n; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      yield { type: 'compare', a: min, b: j };
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      yield { type: 'swap', a: i, b: min };
    }
    yield { type: 'sorted', index: i };
  }
}

export function* quickSort(input) {
  const a = [...input];
  yield* qs(0, a.length - 1);

  function* qs(lo, hi) {
    if (lo > hi) return;
    if (lo === hi) { yield { type: 'sorted', index: lo }; return; }
    const pivot = a[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      yield { type: 'compare', a: j, b: hi };
      if (a[j] < pivot) {
        if (i !== j) { [a[i], a[j]] = [a[j], a[i]]; yield { type: 'swap', a: i, b: j }; }
        i++;
      }
    }
    if (i !== hi) { [a[i], a[hi]] = [a[hi], a[i]]; yield { type: 'swap', a: i, b: hi }; }
    yield { type: 'sorted', index: i };
    yield* qs(lo, i - 1);
    yield* qs(i + 1, hi);
  }
}

export function* mergeSort(input) {
  const a = [...input];
  yield* ms(0, a.length - 1);

  function* ms(lo, hi) {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    yield* ms(lo, mid);
    yield* ms(mid + 1, hi);
    yield* merge(lo, mid, hi);
  }

  function* merge(lo, mid, hi) {
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      yield { type: 'compare', a: lo + i, b: mid + 1 + j };
      a[k] = left[i] <= right[j] ? left[i++] : right[j++];
      yield { type: 'set', index: k, value: a[k] };
      k++;
    }
    while (i < left.length) { a[k] = left[i++]; yield { type: 'set', index: k, value: a[k] }; k++; }
    while (j < right.length) { a[k] = right[j++]; yield { type: 'set', index: k, value: a[k] }; k++; }
  }
}

/* --------------------------------------------------------------------------
 * "Bad" algorithms — correct, but deliberately inefficient. Great for showing
 * how much algorithmic complexity matters.
 * ----------------------------------------------------------------------- */

/** Gnome sort — like insertion sort but steps back one swap at a time. O(n²). */
export function* gnomeSort(input) {
  const a = [...input];
  let i = 0;
  while (i < a.length) {
    if (i === 0) { i++; continue; }
    yield { type: 'compare', a: i - 1, b: i };
    if (a[i - 1] <= a[i]) {
      i++;
    } else {
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      yield { type: 'swap', a: i - 1, b: i };
      i--;
    }
  }
}

/** Pancake sort — repeatedly flip a prefix to push the max to the back. O(n²). */
export function* pancakeSort(input) {
  const a = [...input];

  function* flip(k) {
    let i = 0, j = k;
    while (i < j) { [a[i], a[j]] = [a[j], a[i]]; yield { type: 'swap', a: i, b: j }; i++; j--; }
  }

  for (let size = a.length; size > 1; size--) {
    let mi = 0;
    for (let i = 1; i < size; i++) {
      yield { type: 'compare', a: mi, b: i };
      if (a[i] > a[mi]) mi = i;
    }
    if (mi !== size - 1) {
      if (mi !== 0) yield* flip(mi);
      yield* flip(size - 1);
    }
    yield { type: 'sorted', index: size - 1 };
  }
  if (a.length) yield { type: 'sorted', index: 0 };
}

/** Stooge sort — recursive and famously inefficient. ~O(n^2.71). */
export function* stoogeSort(input) {
  const a = [...input];
  yield* st(0, a.length - 1);

  function* st(i, j) {
    yield { type: 'compare', a: i, b: j };
    if (a[i] > a[j]) { [a[i], a[j]] = [a[j], a[i]]; yield { type: 'swap', a: i, b: j }; }
    if (j - i + 1 > 2) {
      const t = Math.floor((j - i + 1) / 3);
      yield* st(i, j - t);
      yield* st(i + t, j);
      yield* st(i, j - t);
    }
  }
}

/**
 * Bogosort — shuffle the array at random until it happens to be sorted.
 * Average O((n+1)!), worst case unbounded. Capped to a max number of steps so
 * the visualizer never hangs; keep the array tiny (≤ 8) or it may give up.
 */
export function* bogoSort(input, maxSteps = 150000) {
  const a = [...input];
  let steps = 0;
  const isSortedYield = function* () {
    for (let i = 1; i < a.length; i++) {
      yield { type: 'compare', a: i - 1, b: i };
      steps++;
      if (a[i - 1] > a[i]) return false;
    }
    return true;
  };
  while (steps < maxSteps) {
    const checker = isSortedYield();
    let res = checker.next();
    while (!res.done) { yield res.value; res = checker.next(); }
    if (res.value) {
      for (let i = 0; i < a.length; i++) yield { type: 'sorted', index: i };
      return;
    }
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      if (i !== j) { [a[i], a[j]] = [a[j], a[i]]; yield { type: 'swap', a: i, b: j }; steps++; }
    }
  }
}

/**
 * Registry of available sorts, keyed by id. `complexity` is shown in the UI.
 * `chaotic` marks randomized algorithms (no finite-step guarantee); `maxN`
 * caps the array size the visualizer will run them on.
 */
export const SORTS = {
  bubble: {
    name: 'Bubble Sort', gen: bubbleSort,
    complexity: { best: 'Ω(n)', avg: 'Θ(n²)', worst: 'O(n²)', space: 'O(1)' },
    desc: 'Repeatedly swaps adjacent out-of-order pairs, "bubbling" the largest to the end each pass. Best case Ω(n) when already sorted (one clean pass), but Θ(n²) in general.',
    tips: 'Avoid in real code. Only worth it for teaching, or a tiny list you know is almost sorted (with an early-exit flag).',
  },
  insertion: {
    name: 'Insertion Sort', gen: insertionSort,
    complexity: { best: 'Ω(n)', avg: 'Θ(n²)', worst: 'O(n²)', space: 'O(1)' },
    desc: 'Grows a sorted prefix by inserting each new element into place. Excellent — near-linear — on almost-sorted data, quadratic on random data.',
    tips: 'Great for small (n < ~20) or nearly-sorted inputs; stable and in-place. Real engines (Timsort, introsort) fall back to it for small sub-arrays.',
  },
  selection: {
    name: 'Selection Sort', gen: selectionSort,
    complexity: { best: 'Ω(n²)', avg: 'Θ(n²)', worst: 'O(n²)', space: 'O(1)' },
    desc: 'Scans for the minimum of the unsorted part and places it next. Always does ~n²/2 comparisons, even if already sorted — hence Ω(n²).',
    tips: 'Rarely the right call. Its one edge: it does at most n swaps, so consider it only when writes are far costlier than reads (e.g. flash memory).',
  },
  quick: {
    name: 'Quick Sort', gen: quickSort,
    complexity: { best: 'Ω(n log n)', avg: 'Θ(n log n)', worst: 'O(n²)', space: 'O(log n)' },
    desc: 'Partitions around a pivot, then recurses on each side. Usually the fastest comparison sort (n log n), but degrades to O(n²) on poorly chosen pivots.',
    tips: 'The default for in-memory arrays. Use random or median-of-three pivots to dodge the O(n²) trap; not stable. This is what C qsort / introsort build on.',
  },
  merge: {
    name: 'Merge Sort', gen: mergeSort,
    complexity: { best: 'Ω(n log n)', avg: 'Θ(n log n)', worst: 'O(n log n)', space: 'O(n)' },
    desc: 'Splits in half, sorts each, then merges. Guaranteed n log n in every case and stable — but needs O(n) extra memory for the merge.',
    tips: 'Pick it when you need stability or guaranteed n log n, for linked lists, or for external/on-disk sorting. Basis of Python/Java object sorts (Timsort).',
  },
  gnome: {
    name: 'Gnome Sort 🐌', gen: gnomeSort,
    complexity: { best: 'Ω(n)', avg: 'Θ(n²)', worst: 'O(n²)', space: 'O(1)' },
    desc: 'Inefficient: like insertion sort but it walks back one swap at a time instead of shifting. Quadratic, included as a "bad" example.',
    tips: 'Educational only — insertion sort does the same job strictly better.',
  },
  pancake: {
    name: 'Pancake Sort 🥞', gen: pancakeSort,
    complexity: { best: 'Ω(n)', avg: 'Θ(n²)', worst: 'O(n²)', space: 'O(1)' },
    desc: 'Inefficient: sorts using only prefix "flips" (reversals), repeatedly flipping the max to the back. A fun constraint, but quadratic.',
    tips: 'A puzzle, not a tool — relevant only where the only allowed operation is a prefix reversal.',
  },
  stooge: {
    name: 'Stooge Sort 🤪', gen: stoogeSort,
    complexity: { best: 'O(n^2.71)', avg: 'Θ(n^2.71)', worst: 'O(n^2.71)', space: 'O(n)' },
    desc: 'Famously awful: recursively sorts the first 2/3, last 2/3, then first 2/3 again. ~O(n^2.71) — worse than any quadratic sort.',
    tips: 'Never use it. It exists to show that "correct" is not the same as "efficient".',
    maxN: 80,
  },
  bogo: {
    name: 'Bogosort 🎲', gen: bogoSort,
    complexity: { best: 'Ω(n)', avg: 'Θ((n+1)!)', worst: 'O(∞)', space: 'O(1)' },
    desc: 'A joke algorithm: randomly shuffle the whole array and check if it happens to be sorted; repeat. Average is factorial time and the worst case never terminates — capped here.',
    tips: 'Obviously never use it. The takeaway: a correct idea can still be unusably slow.',
    chaotic: true, maxN: 7,
  },
};

/**
 * Apply a mutation step to an array in place (no-op for visual-only steps).
 * @param {number[]} arr
 * @param {object} step
 */
export function applyStep(arr, step) {
  if (step.type === 'swap') {
    const t = arr[step.a]; arr[step.a] = arr[step.b]; arr[step.b] = t;
  } else if (step.type === 'set') {
    arr[step.index] = step.value;
  }
}
