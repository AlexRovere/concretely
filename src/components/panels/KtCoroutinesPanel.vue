<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { KTCOROUTINES_SCENARIOS, ktCoroutinesScenarioById, simulate } from '@/ktcoroutines.js';
import { StepPlayer } from '@/player.js';
import { highlight } from '@/highlight.js';
import { t, onLocaleChange } from '@/i18n.js';
import { useI18n } from '@/composables/useI18n';
import { setStatus, wirePlayerButtons } from '@/utils/viz.js';

const { t: tt } = useI18n();
const root = ref(null);
let player = null;

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id);

  const select = $('kc-scenario');
  const gridEl = $('kc-grid');
  const legendEl = $('kc-legend');
  const status = $('kc-status');
  const codeEl = $('kc-code');
  for (const s of KTCOROUTINES_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  // Also escapes quotes: these strings land inside title="…" attributes.
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'));
  let scenario = null, history = [];
  const taskIndex = (id) => scenario.tasks.findIndex((x) => x.id === id) % 4;

  const render = () => {
    if (!scenario) return;
    const ticks = history.map((h) => `<th class="tl-tick">${h.t}</th>`).join('');
    const laneRows = scenario.lanes.map((lane) => {
      const cells = history.map((h) => {
        const r = h.running.find((x) => x.lane === lane);
        return r
          ? `<td class="tl-cell tl-run-${taskIndex(r.task)}" title="${esc(r.label)}">${esc(r.task)}</td>`
          : `<td class="tl-cell idle"></td>`;
      }).join('');
      return `<tr><th>${esc(lane === 'main' ? 'Main' : lane)}</th>${cells}</tr>`;
    }).join('');
    const suspRow = `<tr><th>${esc(t('kc.suspended'))}</th>` + history.map((h) =>
      h.suspended.length
        ? `<td class="tl-cell tl-susp" title="${esc(h.suspended.map((x) => x.label).join(', '))}">${esc(h.suspended.map((x) => x.task).join(' '))}</td>`
        : `<td class="tl-cell idle"></td>`).join('') + '</tr>';
    const waitRow = `<tr><th>${esc(t('kc.waiting'))}</th>` + history.map((h) =>
      h.waiting.length
        ? `<td class="tl-cell tl-wait">${esc(h.waiting.map((x) => `${x.task}⏳`).join(' '))}</td>`
        : `<td class="tl-cell idle"></td>`).join('') + '</tr>';
    gridEl.innerHTML = `<table class="tl-table"><tr><th></th>${ticks}</tr>${laneRows}${suspRow}${waitRow}</table>`;
    legendEl.innerHTML = scenario.tasks.map((task, i) =>
      `<span><i class="sw tl-run-${i % 4}"></i>${esc(task.id)} — ${esc(task.label || task.id)}</span>`).join('') +
      `<span><i class="sw tl-susp"></i>${esc(t('kc.suspended'))}</span>`;
  };

  player = new StepPlayer({
    onStep: (s) => { history.push(s); render(); setStatus(status, player); },
    onReset: () => { history = []; render(); setStatus(status, player); },
    onDone: () => { render(); setStatus(status, player, t('kc.ticks')(history.length)); },
  });
  player.setSpeed(+$('kc-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('kc-play'), stepBtn: $('kc-step'), resetBtn: $('kc-reset'), player });

  const regenerate = () => {
    scenario = ktCoroutinesScenarioById(select.value);
    codeEl.innerHTML = highlight(scenario.code, 'kotlin');
    history = [];
    player.load([...simulate(scenario)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('kc-speed').oninput = () => player.setSpeed(+$('kc-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="kc.scenario">{{ tt('kc.scenario') }}</span>
        <select id="kc-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="kc-speed" type="range" min="1" max="100" value="30" />
      </label>
      <button id="kc-play" class="primary">▶ Play</button>
      <button id="kc-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="kc-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Kotlin</span></div>
      <pre><code id="kc-code"></code></pre>
    </div>
    <h3 class="rec-h" data-i18n="kc.timeline">{{ tt('kc.timeline') }}</h3>
    <div id="kc-grid" class="tl-wrap"></div>
    <div id="kc-legend" class="tl-legend"></div>
    <p class="hint" data-i18n="kc.note">{{ tt('kc.note') }}</p>
    <div class="status-row"><span id="kc-status" class="status"></span></div>
  </section>
</template>
