<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { VALUEREF_SCENARIOS, vrScenarioById, simulate as vrSimulate } from '@/valueref.js';
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

  const select = $('vr-scenario');
  const varsEl = $('vr-vars');
  const heapEl = $('vr-heap');
  const status = $('vr-status');
  const codeEl = $('vr-code');
  for (const s of VALUEREF_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let vars = {}, heap = {}, hotVar = '', hotObj = -1;
  const render = () => {
    varsEl.innerHTML = Object.entries(vars).map(([name, v]) =>
      v.kind === 'value'
        ? `<div class="vr-var${name === hotVar ? ' hot' : ''}">${esc(name)} = <b>${esc(v.value)}</b></div>`
        : `<div class="vr-var${name === hotVar ? ' hot' : ''}">${esc(name)} → <span class="vr-ref">#${v.objId}</span></div>`).join('')
      || `<div class="ds-empty">—</div>`;
    heapEl.innerHTML = Object.entries(heap).map(([id, obj]) =>
      `<div class="vr-obj${+id === hotObj ? ' hot' : ''}"><span class="ds-bi">#${id}</span> { ` +
      Object.entries(obj).map(([k, val]) => `${esc(k)}: <b>${esc(val)}</b>`).join(', ') + ' }</div>').join('')
      || `<div class="ds-empty">—</div>`;
  };
  const apply = (s) => {
    hotVar = ''; hotObj = -1;
    if (s.type === 'declVal') { vars[s.name] = { kind: 'value', value: s.value }; hotVar = s.name; }
    else if (s.type === 'declObj') { heap[s.objId] = { ...s.obj }; vars[s.name] = { kind: 'ref', objId: s.objId }; hotVar = s.name; hotObj = s.objId; }
    else if (s.type === 'copyVal') { vars[s.dst] = { kind: 'value', value: s.value }; hotVar = s.dst; }
    else if (s.type === 'copyRef') { vars[s.dst] = { kind: 'ref', objId: s.objId }; hotVar = s.dst; hotObj = s.objId; }
    else if (s.type === 'setVal') { vars[s.name] = { kind: 'value', value: s.value }; hotVar = s.name; }
    else if (s.type === 'mutate') { heap[s.objId][s.field] = s.value; hotObj = s.objId; }
    render();
  };
  player = new StepPlayer({
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { vars = {}; heap = {}; hotVar = ''; hotObj = -1; render(); setStatus(status, player); },
    onDone: () => { hotVar = ''; hotObj = -1; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(16);

  const setLabel = wirePlayerButtons({ playBtn: $('vr-play'), stepBtn: $('vr-step'), resetBtn: $('vr-reset'), player });

  const updateCode = () => { codeEl.innerHTML = highlight(vrScenarioById(select.value).code, 'js'); };
  const regenerate = () => { updateCode(); player.load([...vrSimulate(vrScenarioById(select.value).ops)]); setLabel(false); };
  select.onchange = regenerate;
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="vr.scenario">{{ tt('vr.scenario') }}</span>
        <select id="vr-scenario"></select>
      </label>
      <button id="vr-play" class="primary">▶ Play</button>
      <button id="vr-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="vr-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>JavaScript</span></div>
      <pre><code id="vr-code"></code></pre>
    </div>
    <div class="vr-stage">
      <div class="vr-col"><h3 class="rec-h" data-i18n="vr.variables">{{ tt('vr.variables') }}</h3><div id="vr-vars" class="vr-vars"></div></div>
      <div class="vr-col"><h3 class="rec-h" data-i18n="vr.heap">{{ tt('vr.heap') }}</h3><div id="vr-heap" class="vr-heap"></div></div>
    </div>
    <p class="hint" data-i18n="vr.note">{{ tt('vr.note') }}</p>
    <div class="status-row"><span id="vr-status" class="status"></span></div>
  </section>
</template>
