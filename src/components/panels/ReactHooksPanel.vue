<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { HOOKS_SCENARIOS, hooksScenarioById, simulate } from '@/react/hooks.js';
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

  const select = $('rhk-scenario');
  const stateEl = $('rhk-state');
  const queueEl = $('rhk-queue');
  const logEl = $('rhk-log');
  const status = $('rhk-status');
  const codeEl = $('rhk-code');
  for (const s of HOOKS_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let count = 0, queue = [], log = [], phase = '';

  const render = () => {
    stateEl.innerHTML =
      `<span class="vd-label">${esc(t('rhk.count'))}</span>` +
      `<div class="vd-cell keep">${esc(count)}</div>` +
      (phase ? `<span class="el-phase" style="margin-left:.5rem">${esc(phase)}</span>` : '');
    queueEl.innerHTML = queue.length
      ? `<span class="vd-label">${esc(t('rhk.queue'))}</span>` + queue.map((q) => `<div class="vd-cell ${q.mode === 'updater' ? 'move' : 'patch'}">${esc(q.note)}</div>`).join('')
      : `<span class="vd-label" style="opacity:.6">${esc(t('rhk.queueEmpty'))}</span>`;
    logEl.innerHTML = log.map((l) => `<div class="el-log">${esc(l)}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  };

  const apply = (s) => {
    if (s.type === 'render') { count = s.count; phase = t('rhk.phaseRender'); }
    else if (s.type === 'event') { phase = t('rhk.phaseEvent'); }
    else if (s.type === 'queue') { queue.push({ mode: s.mode, note: s.note }); }
    else if (s.type === 'commit') { count = s.to; phase = t('rhk.phaseCommit'); }
    else if (s.type === 'effect') { phase = t('rhk.phaseEffect'); }
    const line = {
      render: () => t('rhk.log.render')(s.count),
      hook: () => `useState / useEffect → ${s.name} = ${s.value}`,
      event: () => t('rhk.log.event'),
      queue: () => t('rhk.log.queue')(s.note),
      commit: () => t('rhk.log.commit')(s.from, s.to),
      effect: () => t('rhk.log.effect')(s.label),
    }[s.type];
    if (line) log.push(line());
    render();
  };

  const resetState = () => { count = 0; queue = []; log = []; phase = ''; };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { resetState(); render(); setStatus(status, player); },
    onDone: () => { render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('rhk-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('rhk-play'), stepBtn: $('rhk-step'), resetBtn: $('rhk-reset'), player });

  const regenerate = () => {
    const scenario = hooksScenarioById(select.value);
    codeEl.innerHTML = highlight(scenario.code, 'js');
    resetState();
    player.load([...simulate(scenario)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('rhk-speed').oninput = () => player.setSpeed(+$('rhk-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="rhk.scenario">{{ tt('rhk.scenario') }}</span>
        <select id="rhk-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="rhk-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="rhk-play" class="primary">▶ Play</button>
      <button id="rhk-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="rhk-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>React</span></div>
      <pre><code id="rhk-code"></code></pre>
    </div>
    <div id="rhk-state" class="gd-wrap" style="padding:0.75rem"></div>
    <div id="rhk-queue" class="gd-wrap" style="padding:0.75rem"></div>
    <h3 class="rec-h" data-i18n="rhk.journal">{{ tt('rhk.journal') }}</h3>
    <div id="rhk-log" class="el-console"></div>
    <p class="hint" data-i18n="rhk.note">{{ tt('rhk.note') }}</p>
    <div class="status-row"><span id="rhk-status" class="status"></span></div>
  </section>
</template>
