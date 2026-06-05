<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { VDOM_SCENARIOS, vdomScenarioById, simulate } from '@/vdom.js';
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

  const select = $('vd-scenario');
  const listsEl = $('vd-lists');
  const opsEl = $('vd-ops');
  const logEl = $('vd-log');
  const status = $('vd-status');
  const codeEl = $('vd-code');
  for (const s of VDOM_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let scenario = null, after = [], ops = { keep: 0, patch: 0, move: 0, insert: 0, remove: 0 }, log = [];

  const render = () => {
    if (!scenario) return;
    const cell = (item, mark) => `<div class="vd-cell${mark ? ' ' + mark : ''}">${esc(item)}</div>`;
    listsEl.innerHTML =
      `<div class="vd-row"><span class="vd-label">${scenario.mode === 'keyed' ? ':key ✓' : 'sans :key'}</span></div>` +
      `<div class="vd-row"><span class="vd-label">avant</span>${scenario.old.map((x) => cell(x, '')).join('')}</div>` +
      `<div class="vd-row"><span class="vd-label">après</span>${after.map((c) => cell(c.item, c.mark)).join('')}</div>`;
    opsEl.textContent = t('vd.ops')(ops);
    logEl.innerHTML = log.map((l) => `<div class="el-log">${esc(l)}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  };

  const apply = (s) => {
    if (s.type === 'compare') { log.push(t('vd.log.compare')(s.index, s.oldItem, s.newItem)); }
    else if (s.type === 'keep') { ops.keep++; after.push({ item: s.item, mark: 'keep' }); log.push(t('vd.log.keep')(s.item)); }
    else if (s.type === 'patch') { ops.patch++; after.push({ item: s.to, mark: 'patch' }); log.push(t('vd.log.patch')(s.from, s.to)); }
    else if (s.type === 'move') { ops.move++; after.push({ item: s.item, mark: 'move' }); log.push(t('vd.log.move')(s.item, s.from, s.to)); }
    else if (s.type === 'insert') { ops.insert++; after.push({ item: s.item, mark: 'insert' }); log.push(t('vd.log.insert')(s.item)); }
    else if (s.type === 'remove') { ops.remove++; log.push(t('vd.log.remove')(s.item ?? s.index)); }
    render();
  };

  const resetState = () => { after = []; ops = { keep: 0, patch: 0, move: 0, insert: 0, remove: 0 }; log = []; };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { resetState(); render(); setStatus(status, player); },
    onDone: () => { render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('vd-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('vd-play'), stepBtn: $('vd-step'), resetBtn: $('vd-reset'), player });

  const regenerate = () => {
    scenario = vdomScenarioById(select.value);
    codeEl.innerHTML = highlight(scenario.code, 'js');
    resetState();
    player.load([...simulate(scenario)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('vd-speed').oninput = () => player.setSpeed(+$('vd-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="vd.scenario">{{ tt('vd.scenario') }}</span>
        <select id="vd-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="vd-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="vd-play" class="primary">▶ Play</button>
      <button id="vd-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="vd-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
      <span id="vd-ops" class="el-phase"></span>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Vue</span></div>
      <pre><code id="vd-code"></code></pre>
    </div>
    <h3 class="rec-h" data-i18n="vd.lists">{{ tt('vd.lists') }}</h3>
    <div id="vd-lists" class="gd-wrap" style="padding:0.75rem"></div>
    <h3 class="rec-h" data-i18n="vd.journal">{{ tt('vd.journal') }}</h3>
    <div id="vd-log" class="el-console"></div>
    <p class="hint" data-i18n="vd.note">{{ tt('vd.note') }}</p>
    <div class="status-row"><span id="vd-status" class="status"></span></div>
  </section>
</template>
