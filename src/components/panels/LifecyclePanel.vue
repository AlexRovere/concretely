<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { LIFECYCLE_SCENARIOS, lifecycleScenarioById, simulate } from '@/lifecycle.js';
import { StepPlayer } from '@/player.js';
import { highlight } from '@/highlight.js';
import { t, onLocaleChange } from '@/i18n.js';
import { useI18n } from '@/composables/useI18n';
import { setStatus, wirePlayerButtons } from '@/utils/viz.js';

const { t: tt } = useI18n();
const root = ref(null);
let player = null;

const STATES = ['initialized', 'created', 'started', 'resumed', 'destroyed'];

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id);

  const select = $('lc-scenario');
  const statesEl = $('lc-states');
  const logEl = $('lc-log');
  const phaseEl = $('lc-phase');
  const status = $('lc-status');
  const codeEl = $('lc-code');
  for (const s of LIFECYCLE_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let state = 'initialized', instance = 1, log = [];

  const render = () => {
    statesEl.innerHTML = STATES.map((st) =>
      `<div class="sw-stage${st === state ? ' hot' : ''}">` +
      `<div class="sw-kind">${esc(st === 'resumed' ? t('lc.visibleFocus') : st === 'started' ? t('lc.visible') : '')}</div>` +
      `<div class="sw-label">${esc(st)}</div></div>`).join('<div class="sw-arrow">→</div>');
    phaseEl.textContent = t('lc.instance')(instance);
    logEl.innerHTML = log.map((l) => `<div class="el-log">${l}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  };

  const apply = (s) => {
    if (s.type === 'action') { log.push(`<b>— ${esc(s.label)} —</b>`); }
    else if (s.type === 'callback') { state = s.state; log.push(`${esc(s.name)}() → ${esc(s.state)}`); }
    else if (s.type === 'instance') { instance = s.n; state = 'initialized'; log.push(`🆕 ${esc(t('lc.instance')(s.n))}`); }
    render();
  };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { state = 'initialized'; instance = 1; log = []; render(); setStatus(status, player); },
    onDone: () => { render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('lc-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('lc-play'), stepBtn: $('lc-step'), resetBtn: $('lc-reset'), player });

  const regenerate = () => {
    const sc = lifecycleScenarioById(select.value);
    codeEl.innerHTML = highlight(sc.code, 'kotlin');
    state = 'initialized'; instance = 1; log = [];
    player.load([...simulate(sc.actions)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('lc-speed').oninput = () => player.setSpeed(+$('lc-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="lc.scenario">{{ tt('lc.scenario') }}</span>
        <select id="lc-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="lc-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="lc-play" class="primary">▶ Play</button>
      <button id="lc-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="lc-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
      <span id="lc-phase" class="el-phase"></span>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Kotlin</span></div>
      <pre><code id="lc-code"></code></pre>
    </div>
    <h3 class="rec-h" data-i18n="lc.states">{{ tt('lc.states') }}</h3>
    <div id="lc-states" class="sw-pipeline"></div>
    <h3 class="rec-h" data-i18n="lc.journal">{{ tt('lc.journal') }}</h3>
    <div id="lc-log" class="el-console"></div>
    <p class="hint" data-i18n="lc.note">{{ tt('lc.note') }}</p>
    <div class="status-row"><span id="lc-status" class="status"></span></div>
  </section>
</template>
