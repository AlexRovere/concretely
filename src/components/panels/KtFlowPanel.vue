<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { KTFLOW_SCENARIOS, ktFlowScenarioById, simulate } from '@/ktflow.js';
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

  const select = $('kf-scenario');
  const colsEl = $('kf-collectors');
  const runsEl = $('kf-runs');
  const logEl = $('kf-log');
  const status = $('kf-status');
  const codeEl = $('kf-code');
  for (const s of KTFLOW_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let scenario = null, received = {}, collecting = new Set(), runs = 0, log = [];

  const render = () => {
    if (!scenario) return;
    colsEl.innerHTML = scenario.collectors.map((c) =>
      `<div class="vr-col"><h3 class="rec-h">${esc(c.id)}${collecting.has(c.id) ? ' ▶' : ''}</h3>` +
      `<div class="el-console">${(received[c.id] || []).map((r) =>
        `<div class="el-log">${esc(r.value)}${r.replay ? ' ♻️' : ''}</div>`).join('')}</div></div>`).join('');
    runsEl.textContent = runs ? t('kf.runs')(runs) : '';
    logEl.innerHTML = log.map((l) => `<div class="el-log">${esc(l)}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  };

  const apply = (s) => {
    if (s.type === 'collect') { collecting.add(s.collector); log.push(t('kf.log.collect')(s.collector)); }
    else if (s.type === 'produce') { runs = Math.max(runs, s.run); log.push(t('kf.log.produce')(s.value, s.run)); }
    else if (s.type === 'receive') { (received[s.collector] ||= []).push({ value: s.value }); log.push(t('kf.log.receive')(s.collector, s.value)); }
    else if (s.type === 'replay') { (received[s.collector] ||= []).push({ value: s.value, replay: true }); log.push(t('kf.log.replay')(s.collector, s.value)); }
    render();
  };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { received = {}; collecting = new Set(); runs = 0; log = []; render(); setStatus(status, player); },
    onDone: () => { render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('kf-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('kf-play'), stepBtn: $('kf-step'), resetBtn: $('kf-reset'), player });

  const regenerate = () => {
    scenario = ktFlowScenarioById(select.value);
    codeEl.innerHTML = highlight(scenario.code, 'kotlin');
    received = {}; collecting = new Set(); runs = 0; log = [];
    player.load([...simulate(scenario)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('kf-speed').oninput = () => player.setSpeed(+$('kf-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="kf.scenario">{{ tt('kf.scenario') }}</span>
        <select id="kf-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="kf-speed" type="range" min="1" max="100" value="28" />
      </label>
      <button id="kf-play" class="primary">▶ Play</button>
      <button id="kf-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="kf-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
      <span id="kf-runs" class="el-phase"></span>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Kotlin</span></div>
      <pre><code id="kf-code"></code></pre>
    </div>
    <h3 class="rec-h" data-i18n="kf.collectors">{{ tt('kf.collectors') }}</h3>
    <div id="kf-collectors" class="vr-stage"></div>
    <h3 class="rec-h" data-i18n="kf.producer">{{ tt('kf.producer') }}</h3>
    <div id="kf-log" class="el-console"></div>
    <p class="hint" data-i18n="kf.note">{{ tt('kf.note') }}</p>
    <div class="status-row"><span id="kf-status" class="status"></span></div>
  </section>
</template>
