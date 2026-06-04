<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue'
import { run, AUTOMATA, automatonById } from '@/automaton.js'
import { StepPlayer } from '@/player.js'
import { t, onLocaleChange } from '@/i18n.js'
import { useI18n } from '@/composables/useI18n'
import { setStatus, wirePlayerButtons } from '@/utils/viz.js'

const { t: tt } = useI18n()
const root = ref(null)
let player = null

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id)
  const patEl = $('rx-pattern')
  const inputEl = $('rx-input')
  const speedEl = $('rx-speed')
  const diagramEl = $('rx-diagram')
  const tapeEl = $('rx-tape')
  const status = $('rx-status')

  for (const a of AUTOMATA) {
    const o = document.createElement('option')
    o.value = a.id
    o.textContent = a.id
    patEl.appendChild(o)
  }

  let auto = automatonById(patEl.value)
  let curState = null
  let idx = -1
  let failIdx = -1
  let verdict = ''

  const fillInputs = () => {
    inputEl.innerHTML = ''
    for (const inp of auto.inputs) {
      const o = document.createElement('option')
      o.value = inp
      o.textContent = `"${inp}"`
      inputEl.appendChild(o)
    }
  }

  const diagram = () => {
    const states = auto.states
    const N = states.length
    const R = 22
    const gapX = 130
    const padX = 50
    const midY = 95
    const W = padX * 2 + (N - 1) * gapX
    const H = 190
    const sx = (i) => padX + i * gapX
    const idxOf = (s) => states.indexOf(s)

    // Group transitions by from>to, combining the chars on shared edges.
    const groups = {}
    for (const from in auto.dfa.delta) {
      for (const ch in auto.dfa.delta[from]) {
        const to = auto.dfa.delta[from][ch]
        const key = from + '>' + to
        groups[key] = groups[key] || { from, to, chars: [] }
        groups[key].chars.push(ch)
      }
    }

    let svg =
      `<svg viewBox="0 0 ${W} ${H}" class="rx-svg"><defs>` +
      `<marker id="rx-ah" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">` +
      `<path d="M0,0 L7,3 L0,6 Z" fill="#94a3b8"/></marker></defs>`

    const s0x = sx(idxOf(auto.dfa.start))
    svg += `<line x1="${s0x - R - 26}" y1="${midY}" x2="${s0x - R - 2}" y2="${midY}" stroke="#94a3b8" stroke-width="2" marker-end="url(#rx-ah)"/>`

    for (const key in groups) {
      const g = groups[key]
      const fi = idxOf(g.from)
      const ti = idxOf(g.to)
      const fx = sx(fi)
      const txx = sx(ti)
      const label = g.chars.join(',')
      if (fi === ti) {
        svg += `<path d="M ${fx - 10} ${midY - R} C ${fx - 46} ${midY - R - 56}, ${fx + 46} ${midY - R - 56}, ${fx + 10} ${midY - R}" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#rx-ah)"/>`
        svg += `<text x="${fx}" y="${midY - R - 50}" text-anchor="middle" fill="#cbd5e1" font-size="13">${label}</text>`
      } else if (ti > fi) {
        const mx = (fx + txx) / 2
        svg += `<path d="M ${fx + R} ${midY - 6} Q ${mx} ${midY - 52} ${txx - R} ${midY - 6}" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#rx-ah)"/>`
        svg += `<text x="${mx}" y="${midY - 48}" text-anchor="middle" fill="#cbd5e1" font-size="13">${label}</text>`
      } else {
        const mx = (fx + txx) / 2
        svg += `<path d="M ${fx - R} ${midY + 6} Q ${mx} ${midY + 56} ${txx + R} ${midY + 6}" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#rx-ah)"/>`
        svg += `<text x="${mx}" y="${midY + 58}" text-anchor="middle" fill="#cbd5e1" font-size="13">${label}</text>`
      }
    }

    for (let i = 0; i < N; i++) {
      const st = states[i]
      const accepting = auto.dfa.accept.includes(st)
      const fill = st === curState ? '#eab308' : '#111827'
      svg += `<circle cx="${sx(i)}" cy="${midY}" r="${R}" fill="${fill}" stroke="#475569" stroke-width="2"/>`
      if (accepting) {
        svg += `<circle cx="${sx(i)}" cy="${midY}" r="${R - 4}" fill="none" stroke="#475569" stroke-width="1.5"/>`
      }
      svg += `<text x="${sx(i)}" y="${midY}" text-anchor="middle" dominant-baseline="central" fill="#e5e7eb" font-size="12">${st}</text>`
    }
    svg += '</svg>'
    return svg
  }

  const tape = () => {
    const input = inputEl.value
    let chips = ''
    for (let k = 0; k < input.length; k++) {
      const cls =
        k === failIdx ? 'rx-cell fail' : k === idx ? 'rx-cell cur' : k < idx ? 'rx-cell done' : 'rx-cell'
      chips += `<span class="${cls}">${input[k]}</span>`
    }
    return chips
  }

  const render = () => {
    diagramEl.innerHTML = diagram()
    tapeEl.innerHTML = tape()
  }

  const apply = (s) => {
    if (s.type === 'start') {
      curState = s.state
      idx = -1
      failIdx = -1
      verdict = ''
    } else if (s.type === 'read') {
      idx = s.index
      if (s.to === null) failIdx = s.index
      else curState = s.to
    } else if (s.type === 'accept') {
      verdict = 'accept'
    } else if (s.type === 'reject') {
      verdict = 'reject'
      if (s.index != null) failIdx = s.index
    }
    render()
  }

  player = new StepPlayer({
    slow: 1.5, // a finite automaton is best watched one transition at a time
    onStep: (s) => {
      apply(s)
      setStatus(status, player)
    },
    onReset: () => {
      curState = auto.dfa.start
      idx = -1
      failIdx = -1
      verdict = ''
      render()
      setStatus(status, player)
    },
    onDone: () => {
      setStatus(status, player, verdict === 'accept' ? t('regex.accepted') : t('regex.rejected'))
    }
  })
  player.setSpeed(+speedEl.value)

  const setLabel = wirePlayerButtons({
    playBtn: $('rx-play'),
    stepBtn: $('rx-step'),
    resetBtn: $('rx-reset'),
    player
  })

  const regenerate = () => {
    player.load([...run(auto.dfa, inputEl.value)])
    setLabel(false)
  }
  patEl.onchange = () => {
    auto = automatonById(patEl.value)
    fillInputs()
    regenerate()
  }
  inputEl.onchange = regenerate
  speedEl.oninput = () => player.setSpeed(+speedEl.value)
  onLocaleChange(() => {
    setStatus(status, player)
    setLabel(player.playing)
  })

  fillInputs()
  regenerate()
})
onDeactivated(() => player?.pause())
onUnmounted(() => player?.stop())
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span>{{ tt('regex.pattern') }}</span>
        <select id="rx-pattern" class="lang-select"></select>
      </label>
      <label><span>{{ tt('regex.input') }}</span>
        <select id="rx-input"></select>
      </label>
      <label><span>{{ tt('ctrl.speed') }}</span>
        <input id="rx-speed" type="range" min="1" max="100" value="35" />
      </label>
      <button id="rx-play" class="primary">▶ Play</button>
      <button id="rx-step">{{ tt('btn.step') }}</button>
      <button id="rx-reset">{{ tt('btn.reset') }}</button>
    </div>
    <div id="rx-diagram" class="rx-diagram"></div>
    <div id="rx-tape" class="rx-tape"></div>
    <p class="hint">{{ tt('regex.note') }}</p>
    <div class="status-row"><span id="rx-status" class="status"></span></div>
  </section>
</template>
