<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { SWIFTSTATE_SCENARIOS, swiftStateScenarioById, simulate } from '@/swiftstate.js';
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

  const select = $('ss-scenario');
  const treeEl = $('ss-tree');
  const logEl = $('ss-log');
  const status = $('ss-status');
  const codeEl = $('ss-code');
  for (const s of SWIFTSTATE_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let scenario = null;
  let state = {}, renders = {}, objects = {}, hot = '', skipped = new Set(), resetFlash = '', log = [];

  const initFrom = (sc) => {
    state = { ...(sc.tree.state || {}) };
    renders = {}; objects = {}; hot = ''; skipped = new Set(); resetFlash = ''; log = [];
    (function walk(n) {
      if (n.object) objects[n.id] = { name: n.object.name, kind: n.object.kind, instance: 1, values: { ...n.object.values } };
      for (const c of n.children || []) walk(c);
    })(sc.tree);
  };

  const viewHtml = (node) => {
    const cls = ['ss-view', node.id === hot ? 'hot' : '', skipped.has(node.id) ? 'skipped' : ''].join(' ');
    let meta = '';
    if (node.state) meta += `<div class="ss-meta">@State ${Object.entries(state).map(([k, v]) => `${esc(k)} = ${esc(v)}`).join(' · ')}</div>`;
    const obj = objects[node.id];
    if (obj) {
      const wrap = obj.kind === 'observed' ? '@ObservedObject' : '@StateObject';
      meta += `<div class="ss-meta${node.id === resetFlash ? ' reset' : ''}">${wrap} ${esc(obj.name)} — ${esc(t('ss.instance')(obj.instance))} · ${Object.entries(obj.values).map(([k, v]) => `${esc(k)} = ${esc(v)}`).join(' · ')}</div>`;
    }
    const kids = (node.children || []).map(viewHtml).join('');
    return `<div class="${cls}"><span class="ss-name">${esc(node.id)}</span>` +
      `<span class="ss-badge">${esc(t('ss.renders')(renders[node.id] || 0))}</span>` +
      meta + (kids ? `<div class="ss-children">${kids}</div>` : '') + `</div>`;
  };

  const render = () => {
    treeEl.innerHTML = scenario ? viewHtml(scenario.tree) : '';
    logEl.innerHTML = log.map((l) => `<div class="el-log">${l}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  };

  const apply = (s) => {
    hot = '';
    if (s.type === 'tap') { skipped = new Set(); resetFlash = ''; log.push(esc(t('ss.log.tap')(s.view))); }
    else if (s.type === 'set') { state[s.prop] = s.value; hot = s.view; log.push(esc(t('ss.log.set')(s.view, s.prop, s.value))); }
    else if (s.type === 'objectSet') { objects[s.view].values[s.prop] = s.value; hot = s.view; log.push(esc(t('ss.log.objectSet')(s.name, s.prop, s.value))); }
    else if (s.type === 'body') { renders[s.view] = s.n; hot = s.view; skipped.delete(s.view); log.push(esc(t('ss.log.body')(s.view, s.n))); }
    else if (s.type === 'skip') { skipped.add(s.view); log.push(esc(t('ss.log.skip')(s.view))); }
    else if (s.type === 'recreate') {
      const o = objects[s.view]; o.instance = s.instance;
      // Recursive lookup: the object view may sit anywhere in the tree.
      const findNode = (n) => (n.id === s.view ? n : (n.children || []).map(findNode).find(Boolean));
      o.values = { ...findNode(scenario.tree).object.values };
      resetFlash = s.view; hot = s.view;
      log.push(esc(t('ss.log.recreate')(s.name, s.instance)));
    } else if (s.type === 'keep') { hot = s.view; log.push(esc(t('ss.log.keep')(s.name, s.instance))); }
    render();
  };

  player = new StepPlayer({
    slow: 3, // conceptual steps — keep the floor slow enough to read
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { initFrom(scenario); render(); setStatus(status, player); },
    onDone: () => { hot = ''; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('ss-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('ss-play'), stepBtn: $('ss-step'), resetBtn: $('ss-reset'), player });

  const regenerate = () => {
    scenario = swiftStateScenarioById(select.value);
    codeEl.innerHTML = highlight(scenario.code, 'swift');
    initFrom(scenario);
    player.load([...simulate(scenario)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('ss-speed').oninput = () => player.setSpeed(+$('ss-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="ss.scenario">{{ tt('ss.scenario') }}</span>
        <select id="ss-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="ss-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="ss-play" class="primary">▶ Play</button>
      <button id="ss-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="ss-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Swift</span></div>
      <pre><code id="ss-code"></code></pre>
    </div>
    <div class="vr-stage">
      <div class="vr-col"><h3 class="rec-h" data-i18n="ss.tree">{{ tt('ss.tree') }}</h3><div id="ss-tree" class="ss-tree"></div></div>
      <div class="vr-col"><h3 class="rec-h" data-i18n="ss.journal">{{ tt('ss.journal') }}</h3><div id="ss-log" class="el-console"></div></div>
    </div>
    <p class="hint" data-i18n="ss.note">{{ tt('ss.note') }}</p>
    <div class="status-row"><span id="ss-status" class="status"></span></div>
  </section>
</template>
