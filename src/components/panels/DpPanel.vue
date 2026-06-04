<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue'
import { editDistance, DP_SCENARIOS, dpScenarioById } from '@/dp.js'
import { StepPlayer } from '@/player.js'
import { t, onLocaleChange } from '@/i18n.js'
import { useI18n } from '@/composables/useI18n'
import { setStatus, wirePlayerButtons } from '@/utils/viz.js'

const { t: tt } = useI18n()
const root = ref(null)
let player = null

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id)
  const select = $('dp-scenario')
  const speedEl = $('dp-speed')
  const tableEl = $('dp-table')
  const info = $('dp-info')
  const status = $('dp-status')

  for (const s of DP_SCENARIOS) {
    const o = document.createElement('option')
    o.value = s.id
    o.textContent = s.id
    select.appendChild(o)
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'))
  const GLYPH = { diag: '↖', up: '↑', left: '←', init: '' }
  let a = ''
  let b = ''
  let grid = []
  let hot = null
  let src = null
  let glyph = ''

  const srcOf = (s) =>
    s.from === 'diag'
      ? { i: s.i - 1, j: s.j - 1 }
      : s.from === 'up'
        ? { i: s.i - 1, j: s.j }
        : s.from === 'left'
          ? { i: s.i, j: s.j - 1 }
          : null

  const render = () => {
    const m = a.length
    const n = b.length
    let html = '<table class="dp-grid"><tr><th class="dp-h"></th><th class="dp-h"></th>'
    for (let j = 0; j < n; j++) html += `<th class="dp-h">${esc(b[j])}</th>`
    html += '</tr>'
    for (let i = 0; i <= m; i++) {
      html += `<tr><th class="dp-h">${i === 0 ? '' : esc(a[i - 1])}</th>`
      for (let j = 0; j <= n; j++) {
        const v = grid[i] ? grid[i][j] : null
        const isHot = hot && hot.i === i && hot.j === j
        const isSrc = src && src.i === i && src.j === j
        const cls = ['dp-cell']
        if (isHot) cls.push('hot')
        else if (isSrc) cls.push('src')
        else if (v != null) cls.push('filled')
        const sup = isHot && glyph ? `<sup class="dp-from">${glyph}</sup>` : ''
        html += `<td class="${cls.join(' ')}">${v == null ? '' : v}${sup}</td>`
      }
      html += '</tr>'
    }
    html += '</table>'
    tableEl.innerHTML = html
  }

  const apply = (s) => {
    grid[s.i][s.j] = s.value
    hot = { i: s.i, j: s.j }
    src = srcOf(s)
    glyph = GLYPH[s.from] || ''
    render()
  }

  player = new StepPlayer({
    onStep: (s) => {
      apply(s)
      setStatus(status, player)
    },
    onReset: () => {
      grid = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(null))
      hot = null
      src = null
      glyph = ''
      info.textContent = ''
      render()
      setStatus(status, player)
    },
    onDone: () => {
      hot = null
      src = null
      info.textContent = t('dp.distance')(grid[a.length][b.length])
      render()
      setStatus(status, player, t('status.done'))
    }
  })
  player.setSpeed(+speedEl.value)

  const setLabel = wirePlayerButtons({
    playBtn: $('dp-play'),
    stepBtn: $('dp-step'),
    resetBtn: $('dp-reset'),
    player
  })

  const regenerate = () => {
    const sc = dpScenarioById(select.value)
    a = sc.a
    b = sc.b
    player.load([...editDistance(a, b)])
    setLabel(false)
  }
  select.onchange = regenerate
  speedEl.oninput = () => player.setSpeed(+speedEl.value)
  onLocaleChange(() => {
    setStatus(status, player)
    setLabel(player.playing)
    if (player.done && grid.length) info.textContent = t('dp.distance')(grid[a.length][b.length])
  })

  regenerate()
})
onDeactivated(() => player?.pause())
onUnmounted(() => player?.stop())
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span>{{ tt('dp.scenario') }}</span>
        <select id="dp-scenario"></select>
      </label>
      <label><span>{{ tt('ctrl.speed') }}</span>
        <input id="dp-speed" type="range" min="1" max="100" value="50" />
      </label>
      <button id="dp-play" class="primary">▶ Play</button>
      <button id="dp-step">{{ tt('btn.step') }}</button>
      <button id="dp-reset">{{ tt('btn.reset') }}</button>
    </div>
    <div id="dp-info" class="ds-info"></div>
    <div id="dp-table" class="dp-table"></div>
    <p class="hint">{{ tt('dp.legend') }} — {{ tt('dp.note') }}</p>
    <div class="status-row"><span id="dp-status" class="status"></span></div>
  </section>
</template>
