<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { VIEWMODEL_SCENARIOS, viewModelScenarioById, simulate } from '@/viewmodel.js';
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

  const select = $('vm-scenario');
  const actEl = $('vm-activity');
  const vmEl = $('vm-viewmodel');
  const bdlEl = $('vm-bundle');
  const logEl = $('vm-log');
  const status = $('vm-status');
  const codeEl = $('vm-code');
  for (const s of VIEWMODEL_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let holders = { activity: {}, viewmodel: {}, bundle: {} };
  let hot = '', dead = false, pendingDeath = false, log = [];

  const fmt = (o) => Object.entries(o).map(([k, v]) => `${esc(k)} = <b>${esc(v)}</b>`).join(' · ');
  const col = (el, name) => {
    el.innerHTML = Object.keys(holders[name]).length
      ? `<div class="vr-var${hot === name ? ' hot' : ''}${dead && name === 'activity' ? ' arc-dead' : ''}">${fmt(holders[name])}</div>`
      : `<div class="ds-empty">—</div>`;
  };
  const render = () => {
    col(actEl, 'activity'); col(vmEl, 'viewmodel'); col(bdlEl, 'bundle');
    logEl.innerHTML = log.map((l) => `<div class="el-log">${esc(l)}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  };

  const apply = (s) => {
    hot = '';
    if (s.type === 'set') { holders[s.holder][s.name] = s.value; hot = s.holder; log.push(t('vm.log.set')(s.holder, s.name, s.value)); }
    else if (s.type === 'rotate') { log.push(t('vm.log.rotate')); }
    else if (s.type === 'processDeath') { pendingDeath = true; log.push(t('vm.log.processDeath')); }
    else if (s.type === 'destroy') {
      dead = true;
      const fields = Object.keys(s.lost || {});
      holders.activity = {};
      if (pendingDeath) { holders.viewmodel = {}; pendingDeath = false; }
      log.push(t('vm.log.destroy')(fields));
    } else if (s.type === 'recreate') { dead = false; log.push(t('vm.log.recreate')); }
    else if (s.type === 'survive') { hot = 'viewmodel'; log.push(t('vm.log.survive')(fmtPlain(s.values))); }
    else if (s.type === 'restore') { hot = 'bundle'; log.push(t('vm.log.restore')(fmtPlain(s.values))); }
    render();
  };
  const fmtPlain = (o) => Object.entries(o).map(([k, v]) => `${k} = ${v}`).join(', ');

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { holders = { activity: {}, viewmodel: {}, bundle: {} }; hot = ''; dead = false; pendingDeath = false; log = []; render(); setStatus(status, player); },
    onDone: () => { hot = ''; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('vm-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('vm-play'), stepBtn: $('vm-step'), resetBtn: $('vm-reset'), player });

  const regenerate = () => {
    const sc = viewModelScenarioById(select.value);
    codeEl.innerHTML = highlight(sc.code, 'kotlin');
    holders = { activity: {}, viewmodel: {}, bundle: {} }; hot = ''; dead = false; pendingDeath = false; log = [];
    player.load([...simulate(sc.ops)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('vm-speed').oninput = () => player.setSpeed(+$('vm-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="vm.scenario">{{ tt('vm.scenario') }}</span>
        <select id="vm-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="vm-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="vm-play" class="primary">▶ Play</button>
      <button id="vm-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="vm-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Kotlin</span></div>
      <pre><code id="vm-code"></code></pre>
    </div>
    <div class="cw-stage">
      <div class="vr-col"><h3 class="rec-h" data-i18n="vm.activity">{{ tt('vm.activity') }}</h3><div id="vm-activity" class="vr-vars"></div></div>
      <div class="vr-col"><h3 class="rec-h" data-i18n="vm.viewmodel">{{ tt('vm.viewmodel') }}</h3><div id="vm-viewmodel" class="vr-vars"></div></div>
      <div class="vr-col"><h3 class="rec-h" data-i18n="vm.bundle">{{ tt('vm.bundle') }}</h3><div id="vm-bundle" class="vr-vars"></div></div>
    </div>
    <h3 class="rec-h" data-i18n="vm.journal">{{ tt('vm.journal') }}</h3>
    <div id="vm-log" class="el-console"></div>
    <p class="hint" data-i18n="vm.note">{{ tt('vm.note') }}</p>
    <div class="status-row"><span id="vm-status" class="status"></span></div>
  </section>
</template>
