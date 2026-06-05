<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { BUBBLING_SCENARIOS, bubblingScenarioById, simulate } from '@/bubbling.js';
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

  const select = $('bb-scenario');
  const treeEl = $('bb-tree');
  const consEl = $('bb-console');
  const phaseEl = $('bb-phase');
  const status = $('bb-status');
  const codeEl = $('bb-code');
  for (const s of BUBBLING_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let scenario = null, current = '', phase = '', fired = new Set(), stoppedAt = '', out = [];

  const render = () => {
    if (!scenario) return;
    const build = (i) => {
      const node = scenario.path[i];
      const listeners = scenario.listeners.filter((l) => l.node === node);
      const ls = listeners.map((l) =>
        `<div class="ss-meta">${fired.has(l.label) ? '🔔' : '·'} ${esc(l.label)} <span class="arc-kind">(${l.phase})</span></div>`).join('');
      const inner = i + 1 < scenario.path.length ? `<div class="ss-children">${build(i + 1)}</div>` : '';
      const cls = ['ss-view', node === current ? ' hot' : '', node === stoppedAt ? ' skipped' : ''].join('');
      return `<div class="${cls}"><span class="ss-name">${esc(node)}</span>` +
        (node === current && phase ? `<span class="ss-badge">${esc(t('bb.phase')(phase))}</span>` : '') + ls + inner + `</div>`;
    };
    treeEl.innerHTML = build(0);
    consEl.innerHTML = out.map((v) => `<div class="el-log">${esc(v)}</div>`).join('');
    phaseEl.textContent = phase ? t('bb.phase')(phase) : '';
  };

  const apply = (s) => {
    if (s.type === 'phase') { phase = s.phase; current = ''; }
    else if (s.type === 'visit') { current = s.node; phase = s.phase; }
    else if (s.type === 'listener') { current = s.node; fired.add(s.label); out.push(t('bb.log.listener')(s.label, s.node)); }
    else if (s.type === 'log') { out.push(s.value); }
    else if (s.type === 'stopped') { stoppedAt = s.node; out.push(t('bb.log.stopped')(s.node)); }
    render();
  };

  const resetState = () => { current = ''; phase = ''; fired = new Set(); stoppedAt = ''; out = []; };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { resetState(); render(); setStatus(status, player); },
    onDone: () => { current = ''; phase = ''; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('bb-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('bb-play'), stepBtn: $('bb-step'), resetBtn: $('bb-reset'), player });

  const regenerate = () => {
    scenario = bubblingScenarioById(select.value);
    codeEl.innerHTML = highlight(scenario.code, 'js');
    resetState();
    player.load([...simulate(scenario)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('bb-speed').oninput = () => player.setSpeed(+$('bb-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="bb.scenario">{{ tt('bb.scenario') }}</span>
        <select id="bb-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="bb-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="bb-play" class="primary">▶ Play</button>
      <button id="bb-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="bb-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
      <span id="bb-phase" class="el-phase"></span>
    </div>
    <div class="code-box">
      <div class="code-head"><span>JavaScript</span></div>
      <pre><code id="bb-code"></code></pre>
    </div>
    <div class="vr-stage">
      <div class="vr-col"><h3 class="rec-h" data-i18n="bb.tree">{{ tt('bb.tree') }}</h3><div id="bb-tree" class="ss-tree"></div></div>
      <div class="vr-col"><h3 class="rec-h" data-i18n="bb.console">{{ tt('bb.console') }}</h3><div id="bb-console" class="el-console"></div></div>
    </div>
    <p class="hint" data-i18n="bb.note">{{ tt('bb.note') }}</p>
    <div class="status-row"><span id="bb-status" class="status"></span></div>
  </section>
</template>
