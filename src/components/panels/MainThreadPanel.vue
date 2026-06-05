<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { MAINTHREAD_SCENARIOS, mainthreadScenarioById, simulate } from '@/mainthread.js';
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

  const select = $('mt-scenario');
  const gridEl = $('mt-grid');
  const sumEl = $('mt-summary');
  const status = $('mt-status');
  const codeEl = $('mt-code');
  for (const s of MAINTHREAD_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  // Also escapes quotes: these strings land inside title="…" attributes.
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'));
  let scenario = null, history = [];

  // What occupies the main lane this tick → symbol + color class.
  const mainCell = (h) => {
    if (!h.main) return `<td class="tl-cell idle" title="${esc(t('mt.idle'))}"></td>`;
    if (h.frame === 'dropped') return `<td class="tl-cell tl-run-2" title="${esc(h.main.label)}">⚙</td>`;
    if (h.uiUpdated) return `<td class="tl-cell tl-run-1" title="${esc(h.main.label)}">🎨</td>`;
    return `<td class="tl-cell tl-run-0" title="${esc(h.main.label)}">👆</td>`;
  };

  const render = () => {
    if (!scenario) return;
    const ticks = history.map((h) => `<th class="tl-tick">${h.t}</th>`).join('');
    const mainRow = `<tr><th>${esc(t('mt.main'))}</th>${history.map(mainCell).join('')}</tr>`;
    const bgRow = `<tr><th>${esc(t('mt.bg'))}</th>` + history.map((h) =>
      h.bg ? `<td class="tl-cell tl-run-2" title="${esc(h.bg.label)}">⚙</td>` : `<td class="tl-cell idle"></td>`).join('') + '</tr>';
    const frameRow = `<tr><th>${esc(t('mt.frames'))}</th>` + history.map((h) =>
      h.frame === 'dropped' ? `<td class="tl-cell tl-drop">❄</td>` : `<td class="tl-cell tl-ok">✓</td>`).join('') + '</tr>';
    gridEl.innerHTML = `<table class="tl-table"><tr><th></th>${ticks}</tr>${mainRow}${bgRow}${frameRow}</table>`;

    const dropped = history.filter((h) => h.frame === 'dropped').length;
    const lat = history.filter((h) => h.handledTap !== undefined)
      .map((h) => t('mt.tapLat')(h.handledTap, h.t));
    sumEl.innerHTML = [t('mt.summary')(dropped, history.length), ...lat]
      .map((l) => `<div class="el-log">${esc(l)}</div>`).join('');
  };

  player = new StepPlayer({
    onStep: (s) => { history.push(s); render(); setStatus(status, player); },
    onReset: () => { history = []; render(); setStatus(status, player); },
    onDone: () => { render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('mt-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('mt-play'), stepBtn: $('mt-step'), resetBtn: $('mt-reset'), player });

  const regenerate = () => {
    scenario = mainthreadScenarioById(select.value);
    codeEl.innerHTML = highlight(scenario.code, 'swift');
    history = [];
    player.load([...simulate(scenario)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('mt-speed').oninput = () => player.setSpeed(+$('mt-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="mt.scenario">{{ tt('mt.scenario') }}</span>
        <select id="mt-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="mt-speed" type="range" min="1" max="100" value="30" />
      </label>
      <button id="mt-play" class="primary">▶ Play</button>
      <button id="mt-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="mt-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Swift</span></div>
      <pre><code id="mt-code"></code></pre>
    </div>
    <div id="mt-grid" class="tl-wrap"></div>
    <div class="tl-legend">
      <span><i class="sw tl-run-2"></i>⚙ {{ tt('mt.bg') }} / I/O</span>
      <span><i class="sw tl-run-0"></i>👆 tap</span>
      <span><i class="sw tl-run-1"></i>🎨 UI</span>
      <span data-i18n="mt.legend">{{ tt('mt.legend') }}</span>
    </div>
    <h3 class="rec-h" data-i18n="ss.journal">{{ tt('ss.journal') }}</h3>
    <div id="mt-summary" class="el-console"></div>
    <p class="hint" data-i18n="mt.note">{{ tt('mt.note') }}</p>
    <div class="status-row"><span id="mt-status" class="status"></span></div>
  </section>
</template>
