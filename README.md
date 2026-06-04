# Concretely

Interactive visualizers that make **abstract programming concepts concrete** — to
help developers build intuition for code they can't easily "see". Built with
**Vue 3 + TypeScript + Vite + Tailwind**, bilingual (FR/EN).

## Run

```bash
npm install
npm run dev        # Vite dev server on http://localhost:5173
npm run build      # type-check (vue-tsc) + production build to dist/
npm run preview    # serve the production build
npm test           # node --test — 95 tests on the pure models
```

## What's inside

**Sorting** — Bubble, Insertion, Selection, Quick, Merge, plus the deliberately
bad ones: Gnome 🐌, Pancake 🥞, Stooge 🤪 and Bogosort 🎲 (capped so it can't
hang). Bars animate through compares (yellow), swaps (red) and finalized
positions (green). Adjustable size and speed, plus **input distributions**
(random / nearly-sorted / reversed / few-unique / sorted).

**Live counters** — comparisons, swaps and writes (or visited cells / path length
for pathfinding) tick up during the run, making the Big-O concrete.

**Pathfinding** — BFS, Dijkstra, A* (Manhattan) on a grid. Watch the frontier and
visited cells expand, then the shortest path light up. Click & drag to draw walls,
or generate a random maze.

**Big-O playground** — plot the growth curves O(1)…O(2ⁿ) against n and read the
operation counts at a chosen size: same input, wildly different work.

**Recursion & call stack** — Fibonacci, naive vs memoized. Watch the call stack
push/pop and the call count explode (2ⁿ) or stay linear with memoization.

**Event loop** — step through classic async snippets and watch the call stack,
microtask queue, macrotask queue and console — finally *see* why the output order
is what it is.

**Data structures** — stack (LIFO), queue (FIFO) and a hash map: type a key and
watch it hash into a bucket, collisions chain, and the table resize when the load
factor passes 0.75.

**Value vs reference** — step through tiny snippets and watch the variable
bindings and the object heap: primitives copy the value, objects share a
reference, so mutating through one binding changes them all.

**Swift / Combine** — a reactive pipeline: values flow one at a time from a
publisher through `map` / `filter` operators to the sink; filtered values never
arrive.

**Binary tree (BST)** — a binary search tree drawn as a diagram; step through
in/pre/post-order traversals (in-order comes out sorted) or a search that walks a
single path down to a hit or miss.

**Dynamic programming** — the edit-distance table filling in cell by cell, each
value reusing the diagonal/up/left neighbour — memoisation made visible, ending on
the distance in the bottom-right corner.

**Regex / automaton** — a regex shown as the finite automaton it compiles to: feed
an input string and watch it move between states, accepting or rejecting at the
end (includes the classic "binary divisible by 3" DFA).

**Big-O & guidance** — each algorithm shows its best/average/worst time and space
complexity, a plain-language explanation of *why*, a "💡 When to use" tip, and a
legend for the Ω/Θ/O notation. Each mode also has a "How do I choose?" guide.

**Code examples** — a language selector shows a clean reference implementation of
the selected algorithm in **JavaScript, Java, Swift, Go, PHP, Ruby and C#**, with
lightweight built-in syntax highlighting (no dependency).

**Bilingual UI** — the whole interface is available in **French and English** via
the locale switch; code snippets stay in their own language. Default is French.

## Architecture

The heart of the app is a set of **pure step generators** — each algorithm/model
yields small step objects (`compare`/`swap`/`set`, `visit`/`frontier`/`path`,
`call`/`return`, `emit`/`map`/`filter`/`sink`, …) and is completely decoupled from
rendering. These are plain framework-agnostic ES modules, unit-tested in Node with
no browser. The Vue layer only *plays* the precomputed steps onto a Canvas/DOM.

```
src/
  main.ts                    # Vue entry (mounts App, imports styles)
  App.vue                    # shell: tabs, locale switch, KeepAlive panel host
  components/panels/         # one SFC per topic (template + onMounted player logic)
    SortingPanel.vue · PathfindingPanel.vue · BigOPanel.vue · RecursionPanel.vue
    EventLoopPanel.vue · DataStructuresPanel.vue · ValueRefPanel.vue · SwiftPanel.vue
  composables/
    useI18n.ts               # bridges the JS i18n locale to a reactive Vue ref
    useCodeLang.ts           # shared code-language selection (JS, Java, Swift, …)
  utils/viz.js               # shared imperative helpers (complexity/status/player wiring)
  player.js                  # plays a step array on a timer (speed/step/pause)
  i18n.js                    # FR/EN UI strings + localized algorithm text
  highlight.js               # zero-dep generic syntax highlighter
  distributions.js · metrics.js
  bigo.js · recursion.js · eventloop.js · datastructures.js · valueref.js · combine.js
  bst.js · dp.js · automaton.js   # binary search tree · edit-distance DP · DFA models
  sorting/algorithms.js      # step generators + complexity/tips
  pathfinding/{grid,algorithms}.js
  render/{sortRenderer,gridRenderer}.js
  snippets/                  # reference code per language
  assets/styles/             # main.css (Tailwind) + visualizers.css (hand-written)
index.html · vite.config.ts · tailwind.config.js · public/.htaccess
```

Because the state is fully reconstructible by replaying steps, the models are
unit-tested without a browser:

```bash
npm test           # node --test — 95 tests
```

Tests check that replaying a sort's steps yields a sorted array (and never mutates
the input), that pathfinders return contiguous shortest paths, that every language
provides a valid snippet for every algorithm, that the highlighter escapes HTML
losslessly, and that the FR/EN string tables stay in key parity — among others.

## Deployment

`npm run build` outputs a static `dist/` (gzip + brotli precompressed) with a
hardened `.htaccess` (SPA fallback, security headers, long-lived immutable asset
caching). Deployable to any static host; the included CI builds and ships it.
