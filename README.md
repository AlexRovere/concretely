# Concretely

Interactive visualizers that make **abstract programming concepts concrete** — to
help developers build intuition for code they can't easily "see". Starts with
**sorting** and **pathfinding** algorithms; built to grow with more topics.
Zero dependencies, pure ES modules + Canvas, bilingual (FR/EN).

## Run

```bash
npm start          # serves on http://localhost:5173
```

Then open the URL in a browser. (A server is used rather than `file://` so native
ES-module imports work in every browser.)

## What's inside

**Sorting** — Bubble, Insertion, Selection, Quick, Merge, plus the deliberately
bad ones: Gnome 🐌, Pancake 🥞, Stooge 🤪 and Bogosort 🎲 (shuffles at random until
sorted — capped so it can't hang). Bars animate through compares (yellow), swaps
(red) and finalized positions (green). Adjustable array size and speed, plus
**input distributions** (random / nearly-sorted / reversed / few-unique / sorted)
to see best- vs worst-case behaviour.

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
is what it is (sync → all microtasks → one macrotask → repeat).

**Data structures** — stack (LIFO), queue (FIFO) and a hash map: type a key and
watch it hash into a bucket, collisions chain, and the table resize when the load
factor passes 0.75 — the intuition behind O(1) average lookup.

**Value vs reference** — step through tiny snippets and watch the variable
bindings and the object heap: primitives copy the value, objects share a
reference, so mutating through one binding changes them all (the classic bug).

**Swift / Combine** — a reactive pipeline: values flow one at a time from a
publisher through `map` / `filter` operators to the sink; filtered values never
arrive. The mental model behind Combine and async streams.

**Big-O & guidance** — each algorithm shows its best/average/worst time and space
complexity, a plain-language explanation of *why*, a "💡 When to use" tip, and a
legend for the Ω/Θ/O notation. Each mode also has a "How do I choose?" guide.

**Code examples** — a language selector shows a clean reference implementation of
the selected algorithm in **JavaScript, Java, Swift, Go, PHP, Ruby and C#**, with
lightweight built-in syntax highlighting (no dependency).

**Bilingual UI** — the whole interface (labels, explanations, tips, guides) is
available in **French and English** via the locale switch; code snippets stay in
their own language. Default is French.

## Architecture

The core is **pure step generators** — each algorithm yields small step objects
(`compare`/`swap`/`set`, or `visit`/`frontier`/`path`) and is decoupled from any
rendering:

```
src/
  sorting/algorithms.js      # step generators + applyStep + complexity/tips
  pathfinding/grid.js        # grid model
  pathfinding/algorithms.js  # BFS / Dijkstra / A* (+ MinHeap)
  distributions.js           # input shapes (random/sorted/reversed/…)
  metrics.js                 # live operation counters from the step stream
  i18n.js                    # FR/EN UI strings + localized algorithm text
  highlight.js               # zero-dep generic syntax highlighter
  bigo.js · recursion.js     # Big-O growth + Fibonacci call-stack models
  eventloop.js               # JS event-loop simulator (stack/micro/macro)
  datastructures.js          # Stack / Queue / HashMap
  valueref.js · combine.js   # value-vs-reference + Combine pipeline models
  player.js                  # plays a step array on a timer (speed/step/pause)
  render/sortRenderer.js     # draws bars, applies steps
  render/gridRenderer.js     # draws grid, frontier, visited, path
  snippets/                  # reference code per language (js, java, swift, go, php, ruby, csharp)
  main.js                    # wires the DOM controls
index.html · server.js
```

Because the state is fully reconstructible by replaying steps, the algorithms are
unit-tested in Node with no browser:

```bash
npm test           # node --test — 87 tests
```

Tests check that replaying a sort's steps yields a sorted array (and never mutates
the input), that pathfinders return contiguous shortest paths, agree on path
length, handle walled-off goals, that the renderers replay real steps without
errors (headless canvas stub), that every language provides a valid snippet for
every algorithm (the JavaScript ones are executed to confirm they sort), and that
the highlighter escapes HTML and never loses or alters source text. Input
distributions (sorted/reversed/few-unique/nearly) and the live metric counters
are covered too.
