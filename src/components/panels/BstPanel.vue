<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue'
import { buildTree, layout, edges, opSteps, BST_OPS, bstOpById, BST_DEMO } from '@/bst.js'
import { StepPlayer } from '@/player.js'
import { t, onLocaleChange } from '@/i18n.js'
import { useI18n } from '@/composables/useI18n'
import { setStatus, wirePlayerButtons } from '@/utils/viz.js'

const { t: tt } = useI18n()
const root = ref(null)
let player = null

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id)
  const opEl = $('bst-op')
  const speedEl = $('bst-speed')
  const view = $('bst-view')
  const outEl = $('bst-output')
  const status = $('bst-status')

  const tree = buildTree(BST_DEMO)
  const { pos, width, depth } = layout(tree)
  const edgeList = edges(tree)

  const NR = 18,
    padX = 28,
    padY = 28,
    levelH = 66,
    stepX = 64
  const W = padX * 2 + Math.max(1, width - 1) * stepX
  const H = padY * 2 + depth * levelH
  const cx = (id) => padX + pos[id].x * stepX
  const cy = (id) => padY + pos[id].depth * levelH

  let hotId = null
  let resultId = null
  let miss = false
  const seen = new Set()
  let outputs = []

  const nodeFill = (id) => {
    if (id === resultId) return '#22c55e'
    if (id === hotId) return '#eab308'
    return seen.has(id) ? '#334155' : '#111827'
  }
  const render = () => {
    let svg = `<svg viewBox="0 0 ${W} ${H}" class="bst-svg">`
    for (const [a, b] of edgeList) {
      svg += `<line x1="${cx(a)}" y1="${cy(a)}" x2="${cx(b)}" y2="${cy(b)}" stroke="#334155" stroke-width="2"/>`
    }
    for (const id in pos) {
      svg +=
        `<g><circle cx="${cx(id)}" cy="${cy(id)}" r="${NR}" fill="${nodeFill(id)}" stroke="#475569" stroke-width="2"/>` +
        `<text x="${cx(id)}" y="${cy(id)}" text-anchor="middle" dominant-baseline="central" fill="#e5e7eb" font-size="13">${tree.nodes[id].value}</text></g>`
    }
    svg += '</svg>'
    view.innerHTML = svg
    outEl.innerHTML = outputs.map((v) => `<span class="bst-chip">${v}</span>`).join('')
  }
  const apply = (s) => {
    if (s.type === 'compare' || s.type === 'visit') {
      if (hotId !== null) seen.add(hotId)
      hotId = s.id
      outputs.push(tree.nodes[s.id].value)
    } else if (s.type === 'found') {
      if (hotId !== null) seen.add(hotId)
      resultId = s.id
      hotId = null
    } else if (s.type === 'notfound') {
      if (hotId !== null) seen.add(hotId)
      hotId = null
      miss = true
    }
    render()
  }

  player = new StepPlayer({
    onStep: (s) => {
      apply(s)
      setStatus(status, player)
    },
    onReset: () => {
      hotId = null
      resultId = null
      miss = false
      seen.clear()
      outputs = []
      render()
      setStatus(status, player)
    },
    onDone: () => {
      const op = bstOpById(opEl.value)
      let extra = t('status.done')
      if (op.kind === 'search') extra = miss ? t('bst.notfound')(op.value) : t('bst.found')(op.value)
      setStatus(status, player, extra)
    }
  })
  player.setSpeed(+speedEl.value)

  const setLabel = wirePlayerButtons({
    playBtn: $('bst-play'),
    stepBtn: $('bst-step'),
    resetBtn: $('bst-reset'),
    player
  })

  const fillOps = () => {
    const keep = opEl.value
    opEl.innerHTML = ''
    for (const op of BST_OPS) {
      const o = document.createElement('option')
      o.value = op.id
      o.textContent = t(`bst.${op.id}`)
      opEl.appendChild(o)
    }
    opEl.value = keep || 'in'
  }
  fillOps()

  const regenerate = () => {
    player.load(opSteps(tree, bstOpById(opEl.value)))
    setLabel(false)
  }
  opEl.onchange = regenerate
  speedEl.oninput = () => player.setSpeed(+speedEl.value)
  onLocaleChange(() => {
    const keep = opEl.value
    fillOps()
    opEl.value = keep
    setStatus(status, player)
    setLabel(player.playing)
  })

  regenerate()
})
onDeactivated(() => player?.pause())
onUnmounted(() => player?.stop())
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span>{{ tt('bst.operation') }}</span>
        <select id="bst-op"></select>
      </label>
      <label><span>{{ tt('ctrl.speed') }}</span>
        <input id="bst-speed" type="range" min="1" max="100" value="40" />
      </label>
      <button id="bst-play" class="primary">▶ Play</button>
      <button id="bst-step">{{ tt('btn.step') }}</button>
      <button id="bst-reset">{{ tt('btn.reset') }}</button>
    </div>
    <div id="bst-view" class="bst-view"></div>
    <div class="bst-out-row">
      <span class="bst-out-label">{{ tt('bst.output') }}</span>
      <div id="bst-output" class="bst-output"></div>
    </div>
    <p class="hint">{{ tt('bst.note') }}</p>
    <div class="status-row"><span id="bst-status" class="status"></span></div>
  </section>
</template>
