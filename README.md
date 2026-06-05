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
npm test           # node --test — 284 tests on the pure models
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

**SwiftUI state** — step through @State / @Binding / @StateObject /
@ObservedObject: see who owns the state, which bodies re-evaluate, and the
classic "my counter resets" bug — an `@ObservedObject` created in the parent's
body is recreated on every parent render; `@StateObject` survives it.

**Swift concurrency** — a tick timeline of threads: `await` suspends and FREES
its thread, `async let` children run in parallel on the pool, and an actor
serializes access (watch the second task wait for the lock — no data race).

**Main thread** — the same 6-tick heavy load run synchronously on the main
thread (frames drop, taps queue, the app feels frozen ❄) vs dispatched to the
background with a final hop back to main for the UI update (everything stays
fluid).

**ARC & memory** — retain counts live: alloc, retain, release, deinit — then a
strong↔strong retain cycle that leaks, and the `weak` reference that fixes it.

**Structs vs classes** — Swift value semantics side by side with reference
semantics, plus copy-on-write: `var b = a` shares the array buffer until the
first `append` triggers the real copy.

**Language basics** — each language category opens with a "basics & quirks"
tab stepped line by line: **JS** (`==` coercion traps cross-checked by real
JavaScript in the tests, hoisting/TDZ, IEEE 754, `typeof null`), **Swift**
(optionals in the type system, zero truthiness — `if 0` doesn't compile,
`defer` LIFO, `let` semantics), **Kotlin** (null safety `?.`/`?:`/`!!`,
`==` structural vs `===` referential — the inverse Java trap, `val` vs
mutation, `when` as expression), and **Ruby** below.

**Ruby basics** — everything is an object and an expression, truthiness where
`0` and `""` are truthy (only `nil`/`false` are falsy), string literals that
allocate on every use vs interned symbols (live `object_id`s), and `&.` / `||=`.

**Blocks & lambdas** — `yield`, then THE trap: `return` in a lambda hands
control back to the caller, `return` in a proc unwinds the enclosing method —
watched live on the call stack.

**Method lookup** — `obj.method` walking the ancestors chain: `prepend` before
the class, `include` after it, `super` resuming from the next ancestor, and the
second `method_missing` pass when nothing matches.

**Eager vs lazy** — `map.select.first(2)`: eager builds a full intermediate
array per stage (20 block calls); `.lazy` flows one element at a time and stops
at 8 — and works on an infinite range.

**GVL & threads** — the same two threads on two cores: CPU-bound work
serializes behind the GVL (no speedup), while blocking I/O releases it and the
waits genuinely overlap — why Ruby threads shine for I/O.

**Compose recomposition** — `mutableStateOf` without `remember` is rebuilt on
every recomposition (the counter that never moves 💥) vs `remember` that
survives; and smart recomposition: only composables READING the changed state
re-execute, the rest are skipped.

**Coroutines & dispatchers** — `suspend` frees the main thread (a click handler
runs during the network wait), `withContext(Dispatchers.IO)` hops the work off
main and resumes on it, `async`/`awaitAll` overlaps requests.

**ViewModel & rotation** — the Android classic: rotation destroys the Activity
(plain fields lost 💥), a ViewModel survives rotation but not process death,
`SavedStateHandle` (Bundle) survives both.

**Flow: cold vs hot** — a cold flow re-runs its producer for every collector; a
`StateFlow` shares one producer and replays its latest value to late collectors
(♻️) — where UI state belongs.

**Lifecycle** — onCreate → … → onDestroy stepped on three journeys: rotation
(full teardown + a brand-new instance), Home/return (`onRestart`), and Back
(destroyed for good).

**Vue reactivity** — the reactive proxy tracking reads (get) and triggering
exactly the subscribed effects on writes (set); `computed` evaluating lazily,
serving from cache, and going *dirty* on a dependency change without
recomputing until the next read.

**Virtual DOM & :key** — the same list update diffed by POSITION (no key:
a prepend patches every node, input state scrambles) vs by KEY (nodes are
reused and moved, never rebuilt) — with live op counters.

**DOM events** — capture ↓, target, bubble ↑ on a DOM tree; `stopPropagation`
cutting the walk; and event delegation handling every `<li>` with one listener.

**Debounce vs throttle** — the same event stream on a tick timeline: debounce
fires once per burst after the silence; throttle fires at a steady rate
starting immediately — and the scroll case where debounce never fires.

**Git: branches & merge** — the commit DAG live (SVG): branches as pointers,
divergence, a real merge commit (two parents) vs fast-forward, and rebase
replaying commits under NEW ids, orphaning the old ones.

**Git: reset** — a change travelling working tree → index → HEAD, then
`reset --soft/--mixed/--hard` shown zone by zone: what each mode keeps and
what `--hard` destroys.

**🎯 Quiz** — "predict the output" before watching it: 28 interview-classic
questions drawn from the topic scenarios (event-loop order, the proc return,
the @ObservedObject reset, `'' == '0'`, `if 0` in Swift vs Ruby, `!!`,
rebase ids, BST traversals…). The pool follows the active category, with
explanations and a jump to the matching animation. Every correct answer is
cross-checked against the simulations (or real JavaScript) by the test
suite — the quiz can never disagree with the models.

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

**Category filter** — a selector in the header narrows the tabs to one family
(All / General / JavaScript / Vue-Front / Swift / Ruby / Kotlin-Android / Git),
so the language deep-dives don't crowd the algorithm topics.

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
    SwiftStatePanel.vue · SwiftConcurrencyPanel.vue · MainThreadPanel.vue
    ArcPanel.vue · CowPanel.vue · BstPanel.vue · DpPanel.vue · RegexPanel.vue
    RubyBasicsPanel.vue · RubyBlocksPanel.vue · RubyLookupPanel.vue
    RubyLazyPanel.vue · RubyGvlPanel.vue · ComposePanel.vue
    KtCoroutinesPanel.vue · ViewModelPanel.vue · KtFlowPanel.vue · LifecyclePanel.vue
    VueReactivityPanel.vue · VdomPanel.vue · BubblingPanel.vue · DebouncePanel.vue
    GitDagPanel.vue · GitResetPanel.vue
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
  swiftstate.js · swiftconcurrency.js · mainthread.js · arc.js · cow.js  # Swift models
  rubybasics.js · rubyblocks.js · rubylookup.js · rubylazy.js · rubygvl.js # Ruby models
  compose.js · ktcoroutines.js · viewmodel.js · ktflow.js · lifecycle.js   # Kotlin/Android
                                  # (rubygvl & ktcoroutines reuse the swiftconcurrency tick engine)
  vuereactivity.js · vdom.js · bubbling.js · debounce.js                   # Vue / Front models
  gitdag.js · gitreset.js                                                  # Git models
  quiz.js                          # predict-the-output questions, model-backed
  evaltrace.js                     # shared eval-trace engine for the basics tabs
  jsbasics.js · swiftbasics.js · kotlinbasics.js  # language quirks (+ rubybasics.js)
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
npm test           # node --test — 284 tests
```

Tests check that replaying a sort's steps yields a sorted array (and never mutates
the input), that pathfinders return contiguous shortest paths, that every language
provides a valid snippet for every algorithm, that the highlighter escapes HTML
losslessly, and that the FR/EN string tables stay in key parity — among others.

## Deployment

`npm run build` outputs a static `dist/` (gzip + brotli precompressed) with a
hardened `.htaccess` (SPA fallback, security headers, long-lived immutable asset
caching). Deployable to any static host; the included CI builds and ships it.
