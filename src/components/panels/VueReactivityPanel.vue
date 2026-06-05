<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { VUEREACTIVITY_SCENARIOS, vueReactivityScenarioById, simulate } from '@/vuereactivity.js';
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

  const select = $('vy-scenario');
  const stateEl = $('vy-state');
  const logEl = $('vy-log');
  const status = $('vy-status');
  const codeEl = $('vy-code');
  for (const s of VUEREACTIVITY_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let state = {}, deps = {}, computeds = {}, hot = '', log = [];

  const render = () => {
    let html = Object.entries(state).map(([k, v]) =>
      `<div class="vr-var${hot === k ? ' hot' : ''}">${esc(k)} = <b>${esc(JSON.stringify(v))}</b></div>`).join('');
    for (const [eff, props] of Object.entries(deps)) {
      html += `<div class="vr-var">🔗 ${esc(eff)} ← [${[...props].map(esc).join(', ')}]</div>`;
    }
    for (const [cid, c] of Object.entries(computeds)) {
      html += `<div class="vr-var${hot === cid ? ' hot' : ''}">🧮 ${esc(cid)} = ${esc(c.expr)} → <b>${c.dirty ? '(dirty)' : esc(c.value)}</b></div>`;
    }
    stateEl.innerHTML = html || `<div class="ds-empty">—</div>`;
    logEl.innerHTML = log.map((l) => `<div class="el-log">${esc(l)}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  };

  const apply = (s) => {
    hot = '';
    if (s.type === 'run') { log.push(t('vy.log.run')(s.effect, s.n)); }
    else if (s.type === 'track') { (deps[s.effect] ||= new Set()).add(s.prop); log.push(t('vy.log.track')(s.effect, s.prop)); }
    else if (s.type === 'set') { state[s.prop] = s.value; hot = s.prop; log.push(t('vy.log.set')(s.prop, JSON.stringify(s.value))); }
    else if (s.type === 'trigger') { log.push(t('vy.log.trigger')(s.prop, s.effects)); }
    else if (s.type === 'dirty') { computeds[s.computed].dirty = true; hot = s.computed; log.push(t('vy.log.dirty')(s.computed)); }
    else if (s.type === 'evaluate') { computeds[s.computed].dirty = false; computeds[s.computed].value = s.value; hot = s.computed; log.push(t('vy.log.evaluate')(s.computed, s.value)); }
    else if (s.type === 'cachehit') { hot = s.computed; log.push(t('vy.log.cachehit')(s.computed, s.value)); }
    render();
  };

  let scenario = null;
  const resetState = () => {
    state = scenario ? { ...scenario.state } : {};
    deps = {}; hot = ''; log = [];
    computeds = {};
    for (const op of scenario?.ops || []) {
      if ('computed' in op) computeds[op.computed] = { expr: op.expr, dirty: true, value: undefined };
    }
  };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { resetState(); render(); setStatus(status, player); },
    onDone: () => { hot = ''; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('vy-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('vy-play'), stepBtn: $('vy-step'), resetBtn: $('vy-reset'), player });

  const regenerate = () => {
    scenario = vueReactivityScenarioById(select.value);
    codeEl.innerHTML = highlight(scenario.code, 'js');
    resetState();
    player.load([...simulate(scenario)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('vy-speed').oninput = () => player.setSpeed(+$('vy-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="vy.scenario">{{ tt('vy.scenario') }}</span>
        <select id="vy-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="vy-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="vy-play" class="primary">▶ Play</button>
      <button id="vy-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="vy-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Vue 3</span></div>
      <pre><code id="vy-code"></code></pre>
    </div>
    <div class="vr-stage">
      <div class="vr-col"><h3 class="rec-h" data-i18n="vy.state">{{ tt('vy.state') }}</h3><div id="vy-state" class="vr-vars"></div></div>
      <div class="vr-col"><h3 class="rec-h" data-i18n="vy.journal">{{ tt('vy.journal') }}</h3><div id="vy-log" class="el-console"></div></div>
    </div>
    <p class="hint" data-i18n="vy.note">{{ tt('vy.note') }}</p>
    <div class="status-row"><span id="vy-status" class="status"></span></div>
  </section>
</template>
