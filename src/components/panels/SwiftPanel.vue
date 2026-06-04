<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { COMBINE_SCENARIOS, combineScenarioById, simulate as cbSimulate, stagesOf } from '@/combine.js';
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

  const select = $('sw-scenario');
  const speedEl = $('sw-speed');
  const pipeEl = $('sw-pipeline');
  const recvEl = $('sw-received');
  const status = $('sw-status');
  const codeEl = $('sw-code');
  for (const s of COMBINE_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let stages = [], active = -1, current = null, received = [], dropped = false;
  const render = () => {
    pipeEl.innerHTML = stages.map((st, i) =>
      `<div class="sw-stage${i === active ? ' hot' : ''}">` +
      `<div class="sw-kind">${esc(st.kind)}</div><div class="sw-label">${esc(st.label)}</div>` +
      (i === active && current != null ? `<div class="sw-token${dropped ? ' dropped' : ''}">${esc(current)}</div>` : '') +
      `</div>`).join('<div class="sw-arrow">→</div>');
    recvEl.innerHTML = received.map((v) => `<div class="el-log">${esc(v)}</div>`).join('');
  };
  const apply = (s) => {
    dropped = false;
    if (s.type === 'emit') { active = 0; current = s.value; }
    else if (s.type === 'map') { active = s.stage + 1; current = s.to; }
    else if (s.type === 'filter') { active = s.stage + 1; current = s.value; }
    else if (s.type === 'drop') { active = s.stage + 1; current = s.value; dropped = true; }
    else if (s.type === 'sink') { active = stages.length - 1; current = s.value; received.push(s.value); }
    render();
  };
  player = new StepPlayer({
    slow: 3, // Combine pipeline is meant to be watched one value at a time — slow the floor right down
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { active = -1; current = null; received = []; dropped = false; render(); setStatus(status, player); },
    onDone: () => { active = -1; current = null; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+speedEl.value);

  const setLabel = wirePlayerButtons({ playBtn: $('sw-play'), stepBtn: $('sw-step'), resetBtn: $('sw-reset'), player });

  const updateCode = () => { codeEl.innerHTML = highlight(combineScenarioById(select.value).code, 'swift'); };
  const regenerate = () => {
    const sc = combineScenarioById(select.value);
    stages = stagesOf(sc.operators);
    updateCode();
    player.load([...cbSimulate(sc.source, sc.operators)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  speedEl.oninput = () => player.setSpeed(+speedEl.value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="sw.scenario">{{ tt('sw.scenario') }}</span>
        <select id="sw-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="sw-speed" type="range" min="1" max="100" value="30" />
      </label>
      <button id="sw-play" class="primary">▶ Play</button>
      <button id="sw-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="sw-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Swift</span></div>
      <pre><code id="sw-code"></code></pre>
    </div>
    <div id="sw-pipeline" class="sw-pipeline"></div>
    <h3 class="rec-h" data-i18n="sw.received">{{ tt('sw.received') }}</h3>
    <div id="sw-received" class="el-console"></div>
    <p class="hint" data-i18n="sw.note">{{ tt('sw.note') }}</p>
    <div class="status-row"><span id="sw-status" class="status"></span></div>
  </section>
</template>
