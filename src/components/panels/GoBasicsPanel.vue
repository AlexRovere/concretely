<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { GOBASICS_SCENARIOS, goBasicsScenarioById, simulate } from '@/gobasics.js';
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

  const select = $('gb-scenario');
  const logEl = $('gb-log');
  const status = $('gb-status');
  const codeEl = $('gb-code');
  for (const s of GOBASICS_SCENARIOS) {
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
    else if (s.type === 'error') lines.push(`<span style="color:#ef4444">❌ ${esc(s.code)} — ${esc(s.message)}</span>`);
    else if (s.type === 'crash') lines.push(`<span style="color:#ef4444">💥 ${esc(s.code)} — ${esc(s.message)}</span>`);
    else if (s.type === 'branch') lines.push(`${esc(s.cond)} <b># ${esc(s.taken ? t('lb.taken') : t('lb.skipped'))}</b>`);
    else if (s.type === 'log') lines.push(`<span class="vr-ref">›</span> ${esc(s.value)}`);
    render();
  };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { lines = []; render(); setStatus(status, player); },
    onDone: () => { render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('gb-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('gb-play'), stepBtn: $('gb-step'), resetBtn: $('gb-reset'), player });

  const regenerate = () => {
    const sc = goBasicsScenarioById(select.value);
    codeEl.innerHTML = highlight(sc.code, 'go');
    lines = [];
    player.load([...simulate(sc.ops)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('gb-speed').oninput = () => player.setSpeed(+$('gb-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="lb.scenario">{{ tt('lb.scenario') }}</span>
        <select id="gb-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="gb-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="gb-play" class="primary">▶ Play</button>
      <button id="gb-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="gb-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Go</span></div>
      <pre><code id="gb-code"></code></pre>
    </div>
    <h3 class="rec-h" data-i18n="lb.journal">{{ tt('lb.journal') }}</h3>
    <div id="gb-log" class="el-console"></div>
    <p class="hint" data-i18n="gob.note">{{ tt('gob.note') }}</p>
    <div class="status-row"><span id="gb-status" class="status"></span></div>
  </section>
</template>
