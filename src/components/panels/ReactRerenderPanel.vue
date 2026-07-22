<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { RERENDER_SCENARIOS, rerenderScenarioById, simulate } from '@/react/rerender.js';
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

  const select = $('rrn-scenario');
  const treeEl = $('rrn-tree');
  const logEl = $('rrn-log');
  const status = $('rrn-status');
  const codeEl = $('rrn-code');
  for (const s of RERENDER_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let scenario = null, log = [];

  // Recursively render the component tree into nested boxes.
  const nodeHtml = (node) => {
    const memo = node.memo ? ' <span class="rrn-badge">memo</span>' : '';
    const kids = (node.children ?? []).map(nodeHtml).join('');
    return `<div class="rrn-node" data-node="${esc(node.id)}">` +
      `<div class="rrn-box" data-box="${esc(node.id)}">${esc(node.id)}${memo}</div>` +
      (kids ? `<div class="rrn-kids">${kids}</div>` : '') +
      `</div>`;
  };

  const drawTree = () => { treeEl.innerHTML = scenario ? nodeHtml(scenario.root) : ''; };

  const mark = (id, cls) => {
    const box = treeEl.querySelector(`[data-box="${CSS.escape(id)}"]`);
    if (box) box.classList.add(cls);
  };

  const apply = (s) => {
    if (s.type === 'update') { mark(s.node, 'update'); log.push(t('rrn.log.update')(s.node)); }
    else if (s.type === 'render') { mark(s.node, 'rendered'); log.push(t('rrn.log.render')(s.node)); }
    else if (s.type === 'skip') { mark(s.node, 'skipped'); log.push(t(s.reason === 'memo' ? 'rrn.log.skipMemo' : 'rrn.log.skipParent')(s.node)); }
    logEl.innerHTML = log.map((l) => `<div class="el-log">${esc(l)}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  };

  const resetState = () => {
    log = [];
    logEl.innerHTML = '';
    treeEl.querySelectorAll('.rrn-box').forEach((b) => b.classList.remove('update', 'rendered', 'skipped'));
  };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { resetState(); setStatus(status, player); },
    onDone: () => { setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('rrn-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('rrn-play'), stepBtn: $('rrn-step'), resetBtn: $('rrn-reset'), player });

  const regenerate = () => {
    scenario = rerenderScenarioById(select.value);
    codeEl.innerHTML = highlight(scenario.code, 'js');
    drawTree();
    resetState();
    player.load([...simulate(scenario)]);
    setLabel(false);
  };
  select.onchange = regenerate;
  $('rrn-speed').oninput = () => player.setSpeed(+$('rrn-speed').value);
  onLocaleChange(() => { setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="rrn.scenario">{{ tt('rrn.scenario') }}</span>
        <select id="rrn-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="rrn-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="rrn-play" class="primary">▶ Play</button>
      <button id="rrn-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="rrn-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>React</span></div>
      <pre><code id="rrn-code"></code></pre>
    </div>
    <h3 class="rec-h" data-i18n="rrn.tree">{{ tt('rrn.tree') }}</h3>
    <div id="rrn-tree" class="rrn-tree"></div>
    <div class="rrn-legend">
      <span class="rrn-chip rendered">{{ tt('rrn.rendered') }}</span>
      <span class="rrn-chip skipped">{{ tt('rrn.skipped') }}</span>
      <span class="rrn-chip update">{{ tt('rrn.updated') }}</span>
    </div>
    <div id="rrn-log" class="el-console"></div>
    <p class="hint" data-i18n="rrn.note">{{ tt('rrn.note') }}</p>
    <div class="status-row"><span id="rrn-status" class="status"></span></div>
  </section>
</template>
