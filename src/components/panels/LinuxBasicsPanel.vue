<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { LINUXBASICS_SCENARIOS, linuxBasicsScenarioById, simulate } from '@/linuxbasics.js';
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

  const select = $('lx-scenario');
  const logEl = $('lx-log');
  const status = $('lx-status');
  const codeEl = $('lx-code');
  for (const s of LINUXBASICS_SCENARIOS) {
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
  player.setSpeed(+$('lx-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('lx-play'), stepBtn: $('lx-step'), resetBtn: $('lx-reset'), player });

  const regenerate = () => {
    const sc = linuxBasicsScenarioById(select.value);
    codeEl.innerHTML = highlight(sc.code, 'bash');
    lines = [];
    player.load([...simulate(sc.ops)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('lx-speed').oninput = () => player.setSpeed(+$('lx-speed').value);
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
        <select id="lx-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="lx-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="lx-play" class="primary">▶ Play</button>
      <button id="lx-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="lx-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Shell (bash)</span></div>
      <pre><code id="lx-code"></code></pre>
    </div>
    <h3 class="rec-h" data-i18n="lb.journal">{{ tt('lb.journal') }}</h3>
    <div id="lx-log" class="el-console"></div>
    <p class="hint" data-i18n="lxb.note">{{ tt('lxb.note') }}</p>
    <div class="status-row"><span id="lx-status" class="status"></span></div>
  </section>
</template>
