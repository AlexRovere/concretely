<script setup>
import { ref, onMounted, onActivated, onDeactivated, onUnmounted, watch } from 'vue'
import { SORTS } from '@/sorting/algorithms.js'
import { StepPlayer } from '@/player.js'
import { SortRenderer } from '@/render/sortRenderer.js'
import { snippet } from '@/snippets/index.js'
import { highlight } from '@/highlight.js'
import { generateArray } from '@/distributions.js'
import { emptyMetrics, accumulate } from '@/metrics.js'
import { t, algoMeta, onLocaleChange } from '@/i18n.js'
import { useI18n } from '@/composables/useI18n'
import { useCodeLang } from '@/composables/useCodeLang'
import {
  fillAlgoSelect,
  relabelAlgoSelect,
  fillDistSelect,
  relabelDistSelect,
  setStatus,
  showComplexity,
  wirePlayerButtons
} from '@/utils/viz.js'

// `tt` = reactive translate for the template; raw `t` is used in imperative code.
const { t: tt } = useI18n()
const { currentLang, LANGUAGES } = useCodeLang()
const root = ref(null)
let player = null

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id)
  const canvas = $('sort-canvas')
  const select = $('sort-algo')
  const distEl = $('sort-dist')
  const sizeEl = $('sort-size')
  const speedEl = $('sort-speed')
  const status = $('sort-status')
  const metricsEl = $('sort-metrics')
  const complexity = $('sort-complexity')
  fillAlgoSelect(select, Object.keys(SORTS))
  fillDistSelect(distEl)

  let array = generateArray(+sizeEl.value, distEl.value) // full master array
  let current = array // effective (possibly capped) array
  let metrics = emptyMetrics()
  const renderMetrics = () => {
    metricsEl.textContent = t('metrics.sort')(metrics)
  }
  const renderer = new SortRenderer(canvas, array)
  player = new StepPlayer({
    onStep: (s) => {
      renderer.step(s)
      accumulate(metrics, s)
      setStatus(status, player)
      renderMetrics()
    },
    onReset: () => {
      renderer.reset(current)
      metrics = emptyMetrics()
      setStatus(status, player)
      renderMetrics()
    },
    onDone: () => {
      renderer.markAllSorted()
      setStatus(status, player, t('status.done'))
    }
  })
  player.setSpeed(+speedEl.value)

  const updateCode = () => {
    $('sort-code').innerHTML = highlight(snippet(select.value, currentLang.value), currentLang.value)
    $('sort-code-title').textContent = algoMeta(select.value).name
  }
  const cappedFor = (entry) => (entry.maxN && array.length > entry.maxN ? entry.maxN : null)
  const paintMeta = (entry, capped) => {
    $('sort-size-val').textContent = capped
      ? t('size.capped')(array.length, capped)
      : String(array.length)
    showComplexity(complexity, entry, capped)
    updateCode()
  }
  const regenerate = () => {
    const entry = algoMeta(select.value)
    const capped = cappedFor(entry)
    current = capped ? array.slice(0, capped) : array
    paintMeta(entry, capped)
    player.load([...entry.gen(current)]) // load() triggers onReset → renderer.reset(current)
    setLabel(false)
  }
  const shuffle = () => {
    array = generateArray(+sizeEl.value, distEl.value)
    regenerate()
  }

  const setLabel = wirePlayerButtons({
    playBtn: $('sort-play'),
    stepBtn: $('sort-step'),
    resetBtn: $('sort-reset'),
    player
  })

  const refresh = () => {
    relabelAlgoSelect(select)
    relabelDistSelect(distEl)
    const entry = algoMeta(select.value)
    paintMeta(entry, cappedFor(entry))
    setStatus(status, player)
    renderMetrics()
    setLabel(player.playing)
  }
  onLocaleChange(refresh)

  $('sort-shuffle').onclick = shuffle
  distEl.onchange = shuffle
  select.onchange = regenerate
  sizeEl.oninput = shuffle
  speedEl.oninput = () => player.setSpeed(+speedEl.value)
  watch(currentLang, updateCode)

  shuffle()
})

// Pause the animation when the user switches away (KeepAlive keeps state).
onActivated(() => {})
onDeactivated(() => player?.pause())
onUnmounted(() => player?.stop())
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label>
        <span>{{ tt('ctrl.algorithm') }}</span>
        <select id="sort-algo"></select>
      </label>
      <label>
        <span>{{ tt('ctrl.input') }}</span>
        <select id="sort-dist"></select>
      </label>
      <label>
        <span>{{ tt('ctrl.size') }}</span> <span id="sort-size-val">60</span>
        <input id="sort-size" type="range" min="10" max="160" value="60" />
      </label>
      <label>
        <span>{{ tt('ctrl.speed') }}</span>
        <input id="sort-speed" type="range" min="1" max="100" value="55" />
      </label>
      <button id="sort-shuffle">{{ tt('btn.shuffle') }}</button>
      <button id="sort-play" class="primary">▶ Play</button>
      <button id="sort-step">{{ tt('btn.step') }}</button>
      <button id="sort-reset">{{ tt('btn.reset') }}</button>
    </div>
    <div id="sort-complexity" class="complexity"></div>
    <div id="sort-metrics" class="metrics"></div>
    <canvas id="sort-canvas" width="960" height="420"></canvas>
    <div class="status-row">
      <span id="sort-status" class="status"></span>
      <span class="legend">
        <i class="sw" style="background: #475569"></i><span>{{ tt('legend.value') }}</span>
        <i class="sw" style="background: #eab308"></i><span>{{ tt('legend.compare') }}</span>
        <i class="sw" style="background: #ef4444"></i><span>{{ tt('legend.swap') }}</span>
        <i class="sw" style="background: #22c55e"></i><span>{{ tt('legend.sorted') }}</span>
      </span>
    </div>
    <div class="code-box">
      <div class="code-head">
        <span id="sort-code-title"></span>
        <select id="sort-lang" v-model="currentLang" class="lang-select">
          <option v-for="l in LANGUAGES" :key="l.id" :value="l.id">{{ l.name }}</option>
        </select>
      </div>
      <pre><code id="sort-code"></code></pre>
    </div>
    <details class="guide">
      <summary>{{ tt('guide.sort.summary') }}</summary>
      <div v-html="tt('guide.sort.html')"></div>
    </details>
  </section>
</template>
