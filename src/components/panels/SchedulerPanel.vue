<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { SCHEDULER_SCENARIOS, schedulerScenarioById, simulate } from '@/scheduler.js';
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

  const select = $('sc-scenario');
  const gridEl = $('sc-grid');
  const legendEl = $('sc-legend');
  const status = $('sc-status');
  const codeEl = $('sc-code');
  for (const s of SCHEDULER_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'));
  let scenario = null, history = [];
  const procIndex = (id) => scenario.procs.findIndex((x) => x.id === id) % 4;

  const render = () => {
    if (!scenario) return;
    const ticks = history.map((h) => `<th class="tl-tick">${h.t}</th>`).join('');
    const laneRows = scenario.lanes.map((lane) => {
      const cells = history.map((h) => {
        const r = h.running.find((x) => x.lane === lane);
        return r
          ? `<td class="tl-cell tl-run-${procIndex(r.task)}" title="${esc(r.label ?? r.task)}">${esc(r.task)}</td>`
          : `<td class="tl-cell idle"></td>`;
      }).join('');
      return `<tr><th>${esc(lane)}</th>${cells}</tr>`;
    }).join('');
    const ioRow = `<tr><th>${esc(t('sch.io'))}</th>` + history.map((h) =>
      h.suspended.length
        ? `<td class="tl-cell tl-susp" title="${esc(h.suspended.map((x) => x.label ?? x.task).join(', '))}">${esc(h.suspended.map((x) => x.task).join(' '))}</td>`
        : `<td class="tl-cell idle"></td>`).join('') + '</tr>';
    const readyRow = `<tr><th>${esc(t('sch.ready'))}</th>` + history.map((h) =>
      h.waiting.length
        ? `<td class="tl-cell tl-wait">${esc(h.waiting.map((x) => x.task).join(' '))}</td>`
        : `<td class="tl-cell idle"></td>`).join('') + '</tr>';
    gridEl.innerHTML = `<table class="tl-table"><tr><th></th>${ticks}</tr>${laneRows}${ioRow}${readyRow}</table>`;
    legendEl.innerHTML = scenario.procs.map((p, i) =>
      `<span><i class="sw tl-run-${i % 4}"></i>${esc(p.id)} — ${esc(p.label || p.id)}</span>`).join('') +
      `<span><i class="sw tl-wait"></i>${esc(t('sch.ready'))}</span>`;
  };

  player = new StepPlayer({
    onStep: (s) => { history.push(s); render(); setStatus(status, player); },
    onReset: () => { history = []; render(); setStatus(status, player); },
    onDone: () => { render(); setStatus(status, player, t('rg.ticks')(history.length)); },
  });
  player.setSpeed(+$('sc-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('sc-play'), stepBtn: $('sc-step'), resetBtn: $('sc-reset'), player });

  const regenerate = () => {
    scenario = schedulerScenarioById(select.value);
    codeEl.innerHTML = highlight(scenario.code, 'bash');
    history = [];
    player.load([...simulate(scenario)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('sc-speed').oninput = () => player.setSpeed(+$('sc-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span>{{ tt('rg.scenario') }}</span>
        <select id="sc-scenario"></select>
      </label>
      <label><span>{{ tt('ctrl.speed') }}</span>
        <input id="sc-speed" type="range" min="1" max="100" value="30" />
      </label>
      <button id="sc-play" class="primary">▶ Play</button>
      <button id="sc-step">{{ tt('btn.step') }}</button>
      <button id="sc-reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Scheduler</span></div>
      <pre><code id="sc-code"></code></pre>
    </div>
    <h3 class="rec-h">{{ tt('rg.timeline') }}</h3>
    <div id="sc-grid" class="tl-wrap"></div>
    <div id="sc-legend" class="tl-legend"></div>
    <p class="hint">{{ tt('sch.note') }}</p>
    <div class="status-row"><span id="sc-status" class="status"></span></div>
  </section>
</template>
