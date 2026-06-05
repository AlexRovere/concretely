<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { COMPOSE_SCENARIOS, composeScenarioById, simulate } from '@/compose.js';
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

  const select = $('cp-scenario');
  const treeEl = $('cp-tree');
  const logEl = $('cp-log');
  const status = $('cp-status');
  const codeEl = $('cp-code');
  for (const s of COMPOSE_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let scenario = null, value = 0, runs = {}, hot = '', skipped = new Set(), reinitFlash = false, log = [];

  const render = () => {
    if (!scenario) return;
    const box = (fn, meta = '') =>
      `<div class="ss-view${fn === hot ? ' hot' : ''}${skipped.has(fn) ? ' skipped' : ''}">` +
      `<span class="ss-name">${esc(fn)}</span>` +
      `<span class="ss-badge">${esc(t('cp.runs')(runs[fn] || 0))}</span>${meta}</div>`;
    const stateMeta = `<div class="ss-meta${reinitFlash ? ' reset' : ''}">${scenario.state.remember ? 'remember { mutableStateOf }' : 'mutableStateOf (sans remember)'} — ${esc(scenario.state.name)} = ${esc(value)}</div>`;
    const kids = scenario.children.map((c) => box(c.id)).join('');
    treeEl.innerHTML = box(scenario.root, stateMeta + (kids ? `<div class="ss-children">${kids}</div>` : ''));
    logEl.innerHTML = log.map((l) => `<div class="el-log">${esc(l)}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  };

  const apply = (s) => {
    hot = ''; reinitFlash = false;
    if (s.type === 'tap') { skipped = new Set(); log.push(t('cp.log.tap')); }
    else if (s.type === 'set') { value = s.value; log.push(t('cp.log.set')(s.name, s.value)); }
    else if (s.type === 'compose') { runs[s.fn] = s.n; hot = s.fn; log.push(t('cp.log.compose')(s.fn, s.n)); }
    else if (s.type === 'recompose') { runs[s.fn] = s.n; hot = s.fn; skipped.delete(s.fn); log.push(t('cp.log.recompose')(s.fn, s.n)); }
    else if (s.type === 'skip') { skipped.add(s.fn); log.push(t('cp.log.skip')(s.fn)); }
    else if (s.type === 'reinit') { value = s.value; reinitFlash = true; log.push(t('cp.log.reinit')(s.name, s.value)); }
    else if (s.type === 'keep') { log.push(t('cp.log.keep')(s.name, s.value)); }
    render();
  };

  const resetState = () => { value = scenario ? scenario.state.init : 0; runs = {}; hot = ''; skipped = new Set(); reinitFlash = false; log = []; };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { resetState(); render(); setStatus(status, player); },
    onDone: () => { hot = ''; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('cp-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('cp-play'), stepBtn: $('cp-step'), resetBtn: $('cp-reset'), player });

  const regenerate = () => {
    scenario = composeScenarioById(select.value);
    codeEl.innerHTML = highlight(scenario.code, 'kotlin');
    resetState();
    player.load([...simulate(scenario)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('cp-speed').oninput = () => player.setSpeed(+$('cp-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="cp.scenario">{{ tt('cp.scenario') }}</span>
        <select id="cp-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="cp-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="cp-play" class="primary">▶ Play</button>
      <button id="cp-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="cp-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Kotlin</span></div>
      <pre><code id="cp-code"></code></pre>
    </div>
    <div class="vr-stage">
      <div class="vr-col"><h3 class="rec-h" data-i18n="cp.tree">{{ tt('cp.tree') }}</h3><div id="cp-tree" class="ss-tree"></div></div>
      <div class="vr-col"><h3 class="rec-h" data-i18n="cp.journal">{{ tt('cp.journal') }}</h3><div id="cp-log" class="el-console"></div></div>
    </div>
    <p class="hint" data-i18n="cp.note">{{ tt('cp.note') }}</p>
    <div class="status-row"><span id="cp-status" class="status"></span></div>
  </section>
</template>
