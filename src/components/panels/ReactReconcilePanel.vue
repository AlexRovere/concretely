<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { REACT_RECONCILE_SCENARIOS, reactReconcileScenarioById, simulate } from '@/react/reconcile.js';
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

  const select = $('rcn-scenario');
  const listsEl = $('rcn-lists');
  const opsEl = $('rcn-ops');
  const logEl = $('rcn-log');
  const status = $('rcn-status');
  const codeEl = $('rcn-code');
  for (const s of REACT_RECONCILE_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let scenario = null, after = [], ops = { keep: 0, patch: 0, move: 0, insert: 0, remove: 0 }, log = [];

  const render = () => {
    if (!scenario) return;
    const cell = (item, mark) => `<div class="vd-cell${mark ? ' ' + mark : ''}">${esc(item)}</div>`;
    listsEl.innerHTML =
      `<div class="vd-row"><span class="vd-label">${esc(t(scenario.mode === 'keyed' ? 'rcn.keyed' : 'rcn.unkeyed'))}</span></div>` +
      `<div class="vd-row"><span class="vd-label">${esc(t('rcn.before'))}</span>${scenario.old.map((x) => cell(x, '')).join('')}</div>` +
      `<div class="vd-row"><span class="vd-label">${esc(t('rcn.after'))}</span>${after.map((c) => cell(c.item, c.mark)).join('')}</div>`;
    opsEl.textContent = t('rcn.ops')(ops);
    logEl.innerHTML = log.map((l) => `<div class="el-log">${esc(l)}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  };

  const apply = (s) => {
    if (s.type === 'compare') { log.push(t('rcn.log.compare')(s.index, s.oldItem, s.newItem)); }
    else if (s.type === 'keep') { ops.keep++; after.push({ item: s.item, mark: 'keep' }); log.push(t('rcn.log.keep')(s.item)); }
    else if (s.type === 'patch') { ops.patch++; after.push({ item: s.to, mark: 'patch' }); log.push(t('rcn.log.patch')(s.from, s.to)); }
    else if (s.type === 'move') { ops.move++; after.push({ item: s.item, mark: 'move' }); log.push(t('rcn.log.move')(s.item, s.from, s.to)); }
    else if (s.type === 'insert') { ops.insert++; after.push({ item: s.item, mark: 'insert' }); log.push(t('rcn.log.insert')(s.item)); }
    else if (s.type === 'remove') { ops.remove++; log.push(t('rcn.log.remove')(s.item ?? s.index)); }
    render();
  };

  const resetState = () => { after = []; ops = { keep: 0, patch: 0, move: 0, insert: 0, remove: 0 }; log = []; };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { resetState(); render(); setStatus(status, player); },
    onDone: () => { render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('rcn-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('rcn-play'), stepBtn: $('rcn-step'), resetBtn: $('rcn-reset'), player });

  const regenerate = () => {
    scenario = reactReconcileScenarioById(select.value);
    codeEl.innerHTML = highlight(scenario.code, 'js');
    resetState();
    player.load([...simulate(scenario)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('rcn-speed').oninput = () => player.setSpeed(+$('rcn-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="rcn.scenario">{{ tt('rcn.scenario') }}</span>
        <select id="rcn-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="rcn-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="rcn-play" class="primary">▶ Play</button>
      <button id="rcn-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="rcn-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
      <span id="rcn-ops" class="el-phase"></span>
    </div>
    <div class="code-box">
      <div class="code-head"><span>React</span></div>
      <pre><code id="rcn-code"></code></pre>
    </div>
    <h3 class="rec-h" data-i18n="rcn.lists">{{ tt('rcn.lists') }}</h3>
    <div id="rcn-lists" class="gd-wrap" style="padding:0.75rem"></div>
    <h3 class="rec-h" data-i18n="rcn.journal">{{ tt('rcn.journal') }}</h3>
    <div id="rcn-log" class="el-console"></div>
    <p class="hint" data-i18n="rcn.note">{{ tt('rcn.note') }}</p>
    <div class="status-row"><span id="rcn-status" class="status"></span></div>
  </section>
</template>
