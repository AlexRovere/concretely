<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { RUBYBASICS_SCENARIOS, rubyBasicsScenarioById, simulate } from '@/rubybasics.js';
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

  const select = $('rb-scenario');
  const logEl = $('rb-log');
  const status = $('rb-status');
  const codeEl = $('rb-code');
  for (const s of RUBYBASICS_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let lines = [];

  const render = () => {
    logEl.innerHTML = lines.map((l) => `<div class="el-log">${l}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  };

  const apply = (s) => {
    if (s.type === 'eval') lines.push(`${esc(s.code)} <b># => ${esc(s.value)}</b>${s.note ? ` <span class="arc-kind">— ${esc(s.note)}</span>` : ''}`);
    else if (s.type === 'alloc') lines.push(`${esc(s.code)} <b># => ${esc(s.objectId)}</b> <span class="arc-kind">${esc(s.kind === 'symbol' ? (s.reused ? t('rb.alloc.reused') : t('rb.alloc.interned')) : t('rb.alloc.new'))}</span>`);
    else if (s.type === 'branch') lines.push(`${esc(s.cond)} <b># ${esc(s.truthy ? t('rb.truthy') : t('rb.falsy'))}</b>`);
    else if (s.type === 'log') lines.push(`<span class="vr-ref">puts</span> ${esc(s.value)}`);
    render();
  };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { lines = []; render(); setStatus(status, player); },
    onDone: () => { render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('rb-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('rb-play'), stepBtn: $('rb-step'), resetBtn: $('rb-reset'), player });

  const regenerate = () => {
    const sc = rubyBasicsScenarioById(select.value);
    codeEl.innerHTML = highlight(sc.code, 'ruby');
    lines = [];
    player.load([...simulate(sc.ops)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('rb-speed').oninput = () => player.setSpeed(+$('rb-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="rb.scenario">{{ tt('rb.scenario') }}</span>
        <select id="rb-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="rb-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="rb-play" class="primary">▶ Play</button>
      <button id="rb-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="rb-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Ruby</span></div>
      <pre><code id="rb-code"></code></pre>
    </div>
    <h3 class="rec-h" data-i18n="rb.journal">{{ tt('rb.journal') }}</h3>
    <div id="rb-log" class="el-console"></div>
    <p class="hint" data-i18n="rb.note">{{ tt('rb.note') }}</p>
    <div class="status-row"><span id="rb-status" class="status"></span></div>
  </section>
</template>
