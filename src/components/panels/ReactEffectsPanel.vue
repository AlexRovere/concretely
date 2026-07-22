<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { EFFECTS_SCENARIOS, effectsScenarioById, simulate } from '@/react/effects.js';
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

  const select = $('rfx-scenario');
  const timelineEl = $('rfx-timeline');
  const countsEl = $('rfx-counts');
  const status = $('rfx-status');
  const codeEl = $('rfx-code');
  for (const s of EFFECTS_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let rows = [], runs = 0, cleanups = 0;

  const render = () => {
    timelineEl.innerHTML = rows.map((r) => `<div class="rfx-row ${r.cls}">${esc(r.text)}</div>`).join('');
    timelineEl.scrollTop = timelineEl.scrollHeight;
    countsEl.textContent = t('rfx.counts')(runs, cleanups);
  };

  const apply = (s) => {
    if (s.type === 'render') rows.push({ cls: 'render', text: t('rfx.render')(t(`rfx.phase.${s.label}`)) });
    else if (s.type === 'effect') { runs++; rows.push({ cls: 'effect', text: t('rfx.effect')(s.label) }); }
    else if (s.type === 'cleanup') { cleanups++; rows.push({ cls: 'cleanup', text: t('rfx.cleanup')(s.label) }); }
    render();
  };

  const resetState = () => { rows = []; runs = 0; cleanups = 0; };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { resetState(); render(); setStatus(status, player); },
    onDone: () => { render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('rfx-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('rfx-play'), stepBtn: $('rfx-step'), resetBtn: $('rfx-reset'), player });

  const regenerate = () => {
    const scenario = effectsScenarioById(select.value);
    codeEl.innerHTML = highlight(scenario.code, 'js');
    resetState();
    player.load([...simulate(scenario)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('rfx-speed').oninput = () => player.setSpeed(+$('rfx-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="rfx.scenario">{{ tt('rfx.scenario') }}</span>
        <select id="rfx-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="rfx-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="rfx-play" class="primary">▶ Play</button>
      <button id="rfx-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="rfx-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
      <span id="rfx-counts" class="el-phase"></span>
    </div>
    <div class="code-box">
      <div class="code-head"><span>React</span></div>
      <pre><code id="rfx-code"></code></pre>
    </div>
    <h3 class="rec-h" data-i18n="rfx.journal">{{ tt('rfx.journal') }}</h3>
    <div id="rfx-timeline" class="rfx-timeline"></div>
    <p class="hint" data-i18n="rfx.note">{{ tt('rfx.note') }}</p>
    <div class="status-row"><span id="rfx-status" class="status"></span></div>
  </section>
</template>
