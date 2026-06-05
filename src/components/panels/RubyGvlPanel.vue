<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { RUBYGVL_SCENARIOS, rubyGvlScenarioById, simulate } from '@/rubygvl.js';
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

  const select = $('rg-scenario');
  const gridEl = $('rg-grid');
  const legendEl = $('rg-legend');
  const status = $('rg-status');
  const codeEl = $('rg-code');
  for (const s of RUBYGVL_SCENARIOS) {
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
      return `<tr><th>${esc(lane)}</th>${cells}</tr>`;
    }).join('');
    const suspRow = `<tr><th>${esc(t('rg.suspended'))}</th>` + history.map((h) =>
      h.suspended.length
        ? `<td class="tl-cell tl-susp" title="${esc(h.suspended.map((x) => x.label).join(', '))}">${esc(h.suspended.map((x) => x.task).join(' '))}</td>`
        : `<td class="tl-cell idle"></td>`).join('') + '</tr>';
    const waitRow = `<tr><th>${esc(t('rg.waiting'))}</th>` + history.map((h) =>
      h.waiting.length
        ? `<td class="tl-cell tl-wait">${esc(h.waiting.map((x) => `${x.task}🔒`).join(' '))}</td>`
        : `<td class="tl-cell idle"></td>`).join('') + '</tr>';
    gridEl.innerHTML = `<table class="tl-table"><tr><th></th>${ticks}</tr>${laneRows}${suspRow}${waitRow}</table>`;
    legendEl.innerHTML = scenario.tasks.map((task, i) =>
      `<span><i class="sw tl-run-${i % 4}"></i>${esc(task.id)} — ${esc(task.label || task.id)}</span>`).join('') +
      `<span><i class="sw tl-susp"></i>${esc(t('rg.suspended'))}</span>` +
      `<span>${esc(t('rg.gvl'))}</span>`;
  };

  player = new StepPlayer({
    onStep: (s) => { history.push(s); render(); setStatus(status, player); },
    onReset: () => { history = []; render(); setStatus(status, player); },
    onDone: () => { render(); setStatus(status, player, t('rg.ticks')(history.length)); },
  });
  player.setSpeed(+$('rg-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('rg-play'), stepBtn: $('rg-step'), resetBtn: $('rg-reset'), player });

  const regenerate = () => {
    scenario = rubyGvlScenarioById(select.value);
    codeEl.innerHTML = highlight(scenario.code, 'ruby');
    history = [];
    player.load([...simulate(scenario)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('rg-speed').oninput = () => player.setSpeed(+$('rg-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="rg.scenario">{{ tt('rg.scenario') }}</span>
        <select id="rg-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="rg-speed" type="range" min="1" max="100" value="30" />
      </label>
      <button id="rg-play" class="primary">▶ Play</button>
      <button id="rg-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="rg-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Ruby</span></div>
      <pre><code id="rg-code"></code></pre>
    </div>
    <h3 class="rec-h" data-i18n="rg.timeline">{{ tt('rg.timeline') }}</h3>
    <div id="rg-grid" class="tl-wrap"></div>
    <div id="rg-legend" class="tl-legend"></div>
    <p class="hint" data-i18n="rg.note">{{ tt('rg.note') }}</p>
    <div class="status-row"><span id="rg-status" class="status"></span></div>
  </section>
</template>
