<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { DEBOUNCE_SCENARIOS, debounceScenarioById, simulate } from '@/debounce.js';
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

  const select = $('db-scenario');
  const gridEl = $('db-grid');
  const sumEl = $('db-summary');
  const status = $('db-status');
  const codeEl = $('db-code');
  for (const s of DEBOUNCE_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let history = [];

  const render = () => {
    const ticks = history.map((h) => `<th class="tl-tick">${h.t}</th>`).join('');
    const rawRow = `<tr><th>${esc(t('db.raw'))}</th>` + history.map((h) =>
      h.event ? `<td class="tl-cell tl-run-0">•</td>` : `<td class="tl-cell idle"></td>`).join('') + '</tr>';
    const dbRow = `<tr><th>debounce</th>` + history.map((h) =>
      h.debounce === 'fired' ? `<td class="tl-cell tl-run-1">✓</td>`
        : h.debounce === 'waiting' ? `<td class="tl-cell tl-susp">…</td>`
          : `<td class="tl-cell idle"></td>`).join('') + '</tr>';
    const thRow = `<tr><th>throttle</th>` + history.map((h) =>
      h.throttle === 'fired' ? `<td class="tl-cell tl-run-1">✓</td>`
        : h.throttle === 'blocked' ? `<td class="tl-cell tl-drop">✗</td>`
          : `<td class="tl-cell idle"></td>`).join('') + '</tr>';
    gridEl.innerHTML = `<table class="tl-table"><tr><th></th>${ticks}</tr>${rawRow}${dbRow}${thRow}</table>`;
    const raw = history.filter((h) => h.event).length;
    const d = history.filter((h) => h.debounce === 'fired').length;
    const th = history.filter((h) => h.throttle === 'fired').length;
    sumEl.textContent = history.length ? t('db.summary')(raw, d, th) : '';
  };

  player = new StepPlayer({
    onStep: (s) => { history.push(s); render(); setStatus(status, player); },
    onReset: () => { history = []; render(); setStatus(status, player); },
    onDone: () => { render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('db-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('db-play'), stepBtn: $('db-step'), resetBtn: $('db-reset'), player });

  const regenerate = () => {
    const sc = debounceScenarioById(select.value);
    codeEl.innerHTML = highlight(sc.code, 'js');
    history = [];
    player.load([...simulate(sc)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('db-speed').oninput = () => player.setSpeed(+$('db-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="db.scenario">{{ tt('db.scenario') }}</span>
        <select id="db-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="db-speed" type="range" min="1" max="100" value="32" />
      </label>
      <button id="db-play" class="primary">▶ Play</button>
      <button id="db-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="db-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
      <span id="db-summary" class="el-phase"></span>
    </div>
    <div class="code-box">
      <div class="code-head"><span>JavaScript</span></div>
      <pre><code id="db-code"></code></pre>
    </div>
    <h3 class="rec-h" data-i18n="db.timeline">{{ tt('db.timeline') }}</h3>
    <div id="db-grid" class="tl-wrap"></div>
    <p class="hint" data-i18n="db.note">{{ tt('db.note') }}</p>
    <div class="status-row"><span id="db-status" class="status"></span></div>
  </section>
</template>
