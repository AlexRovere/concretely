<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { ARC_SCENARIOS, arcScenarioById, simulate } from '@/arc.js';
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

  const select = $('arc-scenario');
  const varsEl = $('arc-vars');
  const objsEl = $('arc-objects');
  const logEl = $('arc-log');
  const status = $('arc-status');
  const codeEl = $('arc-code');
  for (const s of ARC_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let vars = {}, objects = {}, hotObj = -1, log = [];

  const render = () => {
    varsEl.innerHTML = Object.entries(vars).map(([name, id]) =>
      `<div class="vr-var">${esc(name)} ${id == null ? '= <b>nil</b>' : `→ <span class="vr-ref">#${id}</span>`}</div>`).join('')
      || `<div class="ds-empty">—</div>`;
    objsEl.innerHTML = Object.entries(objects).map(([id, o]) => {
      const cls = ['vr-obj', +id === hotObj ? 'hot' : '', !o.alive ? 'arc-dead' : '', o.leaked ? 'arc-leak' : ''].join(' ');
      const props = o.props.map((p) =>
        `<div class="arc-prop">${esc(p.label.split('.')[1] || p.label)} → ${p.targetId == null ? 'nil' : `<span class="vr-ref">#${p.targetId}</span>`} <span class="arc-kind${p.kind === 'weak' ? ' weak' : ''}">(${p.kind})</span></div>`).join('');
      const badge = o.alive
        ? `<span class="arc-rc${o.rc === 0 ? ' zero' : ''}">rc = ${o.rc}</span>${o.leaked ? ` <b>${esc(t('arc.leaked'))}</b>` : ''}`
        : `<span class="arc-rc zero">${esc(t('arc.dealloc'))}</span>`;
      return `<div class="${cls}"><span class="ds-bi">#${id}</span> <b>${esc(o.cls)}</b> ${badge}${props}</div>`;
    }).join('') || `<div class="ds-empty">—</div>`;
    logEl.innerHTML = log.map((l) => `<div class="el-log">${l}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  };

  const apply = (s) => {
    hotObj = -1;
    if (s.type === 'alloc') {
      objects[s.objId] = { cls: s.cls, rc: 1, alive: true, leaked: false, props: [] };
      vars[s.var] = s.objId; hotObj = s.objId;
      log.push(esc(t('arc.log.alloc')(s.cls, s.objId)));
    } else if (s.type === 'retain') {
      objects[s.objId].rc = s.rc; hotObj = s.objId;
      if (s.by.includes('.')) {
        const [ownerVar] = s.by.split('.');
        objects[vars[ownerVar]].props.push({ label: s.by, targetId: s.objId, kind: 'strong' });
      } else {
        vars[s.by] = s.objId;
      }
      log.push(esc(t('arc.log.retain')(s.objId, s.rc, s.by)));
    } else if (s.type === 'weakAssign') {
      const [ownerVar] = s.by.split('.');
      objects[vars[ownerVar]].props.push({ label: s.by, targetId: s.objId, kind: 'weak' });
      hotObj = s.objId;
      log.push(esc(t('arc.log.weak')(s.objId, s.by)));
    } else if (s.type === 'release') {
      objects[s.objId].rc = s.rc; hotObj = s.objId;
      if (!s.by.includes('.')) vars[s.by] = null;
      log.push(esc(t('arc.log.release')(s.objId, s.rc, s.by)));
    } else if (s.type === 'dealloc') {
      objects[s.objId].alive = false; hotObj = s.objId;
      log.push(esc(t('arc.log.dealloc')(s.objId)));
    } else if (s.type === 'weakZero') {
      for (const o of Object.values(objects)) {
        for (const p of o.props) if (p.kind === 'weak' && p.targetId === s.objId) p.targetId = null;
      }
      log.push(esc(t('arc.log.weakZero')(s.by)));
    } else if (s.type === 'leak') {
      for (const id of s.objIds) objects[id].leaked = true;
      log.push(esc(t('arc.log.leak')(s.objIds)));
    }
    render();
  };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { vars = {}; objects = {}; hotObj = -1; log = []; render(); setStatus(status, player); },
    onDone: () => { hotObj = -1; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('arc-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('arc-play'), stepBtn: $('arc-step'), resetBtn: $('arc-reset'), player });

  const regenerate = () => {
    const sc = arcScenarioById(select.value);
    codeEl.innerHTML = highlight(sc.code, 'swift');
    vars = {}; objects = {}; hotObj = -1; log = [];
    player.load([...simulate(sc.ops)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('arc-speed').oninput = () => player.setSpeed(+$('arc-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="arc.scenario">{{ tt('arc.scenario') }}</span>
        <select id="arc-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="arc-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="arc-play" class="primary">▶ Play</button>
      <button id="arc-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="arc-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Swift</span></div>
      <pre><code id="arc-code"></code></pre>
    </div>
    <div class="vr-stage">
      <div class="vr-col"><h3 class="rec-h" data-i18n="arc.vars">{{ tt('arc.vars') }}</h3><div id="arc-vars" class="vr-vars"></div></div>
      <div class="vr-col"><h3 class="rec-h" data-i18n="arc.objects">{{ tt('arc.objects') }}</h3><div id="arc-objects" class="vr-heap"></div></div>
    </div>
    <h3 class="rec-h" data-i18n="arc.journal">{{ tt('arc.journal') }}</h3>
    <div id="arc-log" class="el-console"></div>
    <p class="hint" data-i18n="arc.note">{{ tt('arc.note') }}</p>
    <div class="status-row"><span id="arc-status" class="status"></span></div>
  </section>
</template>
