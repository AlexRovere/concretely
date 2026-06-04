<script setup>
import { ref, onMounted, onDeactivated, onUnmounted, watch } from 'vue'
import { PATHFINDERS } from '@/pathfinding/algorithms.js'
import { createGrid, setWall, isWall } from '@/pathfinding/grid.js'
import { GridRenderer } from '@/render/gridRenderer.js'
import { StepPlayer } from '@/player.js'
import { snippet } from '@/snippets/index.js'
import { highlight } from '@/highlight.js'
import { emptyMetrics, accumulate } from '@/metrics.js'
import { t, algoMeta, onLocaleChange } from '@/i18n.js'
import { useI18n } from '@/composables/useI18n'
import { useCodeLang } from '@/composables/useCodeLang'
import { fillAlgoSelect, relabelAlgoSelect, setStatus, showComplexity, wirePlayerButtons } from '@/utils/viz.js'

const { t: tt } = useI18n()
const { currentLang, LANGUAGES } = useCodeLang()
const root = ref(null)
let player = null

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id)
  const canvas = $('grid-canvas')
  const select = $('grid-algo')
  const speedEl = $('grid-speed')
  const status = $('grid-status')
  const metricsEl = $('grid-metrics')
  const complexity = $('grid-complexity')
  fillAlgoSelect(select, Object.keys(PATHFINDERS))

  const ROWS = 25, COLS = 40
  let grid = createGrid(ROWS, COLS)
  const start = [0, 0]
  const end = [ROWS - 1, COLS - 1]
  let metrics = emptyMetrics()
  const renderMetrics = () => { metricsEl.textContent = t('metrics.path')(metrics) }
  const renderer = new GridRenderer(canvas, grid, start, end)
  player = new StepPlayer({
    onStep: (s) => { renderer.step(s); accumulate(metrics, s); setStatus(status, player); renderMetrics() },
    onReset: () => { renderer.clearOverlay(); metrics = emptyMetrics(); setStatus(status, player); renderMetrics() },
    onDone: () => setStatus(status, player, renderer.path.length ? t('path.cells')(renderer.path.length) : t('path.none')),
  })
  player.setSpeed(+speedEl.value)

  const updateCode = () => {
    $('grid-code').innerHTML = highlight(snippet(select.value, currentLang.value), currentLang.value)
    $('grid-code-title').textContent = algoMeta(select.value).name
  }
  const regenerate = () => {
    renderer.clearOverlay()
    showComplexity(complexity, algoMeta(select.value))
    updateCode()
    player.load([...algoMeta(select.value).gen(grid, start, end)])
    setLabel(false)
  }
  watch(currentLang, updateCode)
  onLocaleChange(() => {
    relabelAlgoSelect(select)
    showComplexity(complexity, algoMeta(select.value))
    updateCode()
    setStatus(status, player)
    renderMetrics()
    setLabel(player.playing)
  })

  const isEndpoint = (r, c) => (r === start[0] && c === start[1]) || (r === end[0] && c === end[1])

  const randomMaze = () => {
    grid = createGrid(ROWS, COLS)
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!isEndpoint(r, c) && Math.random() < 0.28) setWall(grid, r, c)
      }
    }
    renderer.set(grid, start, end)
    regenerate()
  }

  let drawing = false
  let drawValue = true
  const paint = (ev) => {
    const rect = canvas.getBoundingClientRect()
    const [r, c] = renderer.cellAt(ev.clientX - rect.left, ev.clientY - rect.top)
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS || isEndpoint(r, c)) return
    setWall(grid, r, c, drawValue)
    renderer.draw()
  }
  canvas.addEventListener('mousedown', (ev) => {
    const rect = canvas.getBoundingClientRect()
    const [r, c] = renderer.cellAt(ev.clientX - rect.left, ev.clientY - rect.top)
    drawing = true
    drawValue = !isWall(grid, r, c)
    paint(ev)
  })
  canvas.addEventListener('mousemove', (ev) => { if (drawing) paint(ev) })
  window.addEventListener('mouseup', () => { if (drawing) { drawing = false; regenerate() } })

  const setLabel = wirePlayerButtons({ playBtn: $('grid-play'), stepBtn: $('grid-step'), resetBtn: $('grid-reset'), player })

  regenerate()

  $('grid-maze').onclick = randomMaze
  $('grid-clear').onclick = () => { grid = createGrid(ROWS, COLS); renderer.set(grid, start, end); regenerate() }
  select.onchange = regenerate
  speedEl.oninput = () => player.setSpeed(+speedEl.value)
})
onDeactivated(() => player?.pause())
onUnmounted(() => player?.stop())
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span>{{ tt('ctrl.algorithm') }}</span>
        <select id="grid-algo"></select>
      </label>
      <label><span>{{ tt('ctrl.speed') }}</span>
        <input id="grid-speed" type="range" min="1" max="100" value="65" />
      </label>
      <button id="grid-maze">{{ tt('btn.maze') }}</button>
      <button id="grid-clear">{{ tt('btn.clear') }}</button>
      <button id="grid-play" class="primary">▶ Play</button>
      <button id="grid-step">{{ tt('btn.step') }}</button>
      <button id="grid-reset">{{ tt('btn.reset') }}</button>
    </div>
    <div id="grid-complexity" class="complexity"></div>
    <div id="grid-metrics" class="metrics"></div>
    <canvas id="grid-canvas" width="960" height="600"></canvas>
    <div class="status-row">
      <span id="grid-status" class="status"></span>
      <span class="legend">
        <i class="sw" style="background:#22c55e"></i><span>{{ tt('legend.start') }}</span>
        <i class="sw" style="background:#ef4444"></i><span>{{ tt('legend.end') }}</span>
        <i class="sw" style="background:#0b1220"></i><span>{{ tt('legend.wall') }}</span>
        <i class="sw" style="background:#0ea5e9"></i><span>{{ tt('legend.frontier') }}</span>
        <i class="sw" style="background:#7c3aed"></i><span>{{ tt('legend.visited') }}</span>
        <i class="sw" style="background:#eab308"></i><span>{{ tt('legend.path') }}</span>
      </span>
    </div>
    <p class="hint">{{ tt('hint.walls') }}</p>
    <div class="code-box">
      <div class="code-head">
        <span id="grid-code-title"></span>
        <select id="grid-lang" class="lang-select" v-model="currentLang">
          <option v-for="l in LANGUAGES" :key="l.id" :value="l.id">{{ l.name }}</option>
        </select>
      </div>
      <pre><code id="grid-code"></code></pre>
    </div>
    <details class="guide">
      <summary>{{ tt('guide.path.summary') }}</summary>
      <div v-html="tt('guide.path.html')"></div>
    </details>
  </section>
</template>
