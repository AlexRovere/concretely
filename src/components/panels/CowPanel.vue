<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { COW_SCENARIOS, cowScenarioById, simulate } from '@/cow.js';
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

  const select = $('cw-scenario');
  const varsEl = $('cw-vars');
  const heapEl = $('cw-heap');
  const bufsEl = $('cw-buffers');
  const status = $('cw-status');
  const codeEl = $('cw-code');
  for (const s of COW_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let vars = {}, heap = {}, buffers = {}, hotVar = '', hotObj = -1, hotBuf = -1;

  const fmt = (values) => Object.entries(values).map(([k, v]) => `${esc(k)}: <b>${esc(v)}</b>`).join(', ');
  const render = () => {
    varsEl.innerHTML = Object.entries(vars).map(([name, v]) => {
      const hot = name === hotVar ? ' hot' : '';
      if (v.kind === 'struct') return `<div class="vr-var${hot}">${esc(name)} = { ${fmt(v.values)} } <span class="arc-kind">(struct)</span></div>`;
      if (v.kind === 'ref') return `<div class="vr-var${hot}">${esc(name)} → <span class="vr-ref">#${v.objId}</span> <span class="arc-kind">(class)</span></div>`;
      return `<div class="vr-var${hot}">${esc(name)} → <span class="vr-ref">buf #${v.bufId}</span> <span class="arc-kind">(array)</span></div>`;
    }).join('') || `<div class="ds-empty">—</div>`;
    heapEl.innerHTML = Object.entries(heap).map(([id, obj]) =>
      `<div class="vr-obj${+id === hotObj ? ' hot' : ''}"><span class="ds-bi">#${id}</span> { ${fmt(obj)} }</div>`).join('')
      || `<div class="ds-empty">—</div>`;
    const sharers = (bufId) => Object.values(vars).filter((v) => v.kind === 'array' && v.bufId === +bufId).length;
    bufsEl.innerHTML = Object.entries(buffers).map(([id, vals]) => {
      const n = sharers(id);
      return `<div class="vr-obj${+id === hotBuf ? ' hot' : ''}"><span class="ds-bi">#${id}</span> [${vals.map((v) => `<b>${esc(v)}</b>`).join(', ')}]` +
        (n > 1 ? ` <span class="cw-shared">${esc(t('cw.shared')(n))}</span>` : '') + `</div>`;
    }).join('') || `<div class="ds-empty">—</div>`;
  };

  const apply = (s) => {
    hotVar = ''; hotObj = -1; hotBuf = -1;
    if (s.type === 'declStruct') { vars[s.name] = { kind: 'struct', values: { ...s.values } }; hotVar = s.name; }
    else if (s.type === 'declClass') { heap[s.objId] = { ...s.values }; vars[s.name] = { kind: 'ref', objId: s.objId }; hotVar = s.name; hotObj = s.objId; }
    else if (s.type === 'declArray') { buffers[s.bufId] = [...s.values]; vars[s.name] = { kind: 'array', bufId: s.bufId }; hotVar = s.name; hotBuf = s.bufId; }
    else if (s.type === 'copyStruct') { vars[s.dst] = { kind: 'struct', values: { ...s.values } }; hotVar = s.dst; }
    else if (s.type === 'copyRef') { vars[s.dst] = { kind: 'ref', objId: s.objId }; hotVar = s.dst; hotObj = s.objId; }
    else if (s.type === 'shareBuf') { vars[s.dst] = { kind: 'array', bufId: s.bufId }; hotVar = s.dst; hotBuf = s.bufId; }
    else if (s.type === 'mutateStruct') { vars[s.name].values[s.field] = s.value; hotVar = s.name; }
    else if (s.type === 'mutateClass') { heap[s.objId][s.field] = s.value; hotObj = s.objId; }
    else if (s.type === 'cowCopy') { buffers[s.to] = [...s.values]; vars[s.name].bufId = s.to; hotVar = s.name; hotBuf = s.to; }
    else if (s.type === 'append') { buffers[s.bufId] = [...s.values]; hotVar = s.name; hotBuf = s.bufId; }
    render();
  };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { vars = {}; heap = {}; buffers = {}; hotVar = ''; hotObj = -1; hotBuf = -1; render(); setStatus(status, player); },
    onDone: () => { hotVar = ''; hotObj = -1; hotBuf = -1; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('cw-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('cw-play'), stepBtn: $('cw-step'), resetBtn: $('cw-reset'), player });

  const regenerate = () => {
    const sc = cowScenarioById(select.value);
    codeEl.innerHTML = highlight(sc.code, 'swift');
    vars = {}; heap = {}; buffers = {}; hotVar = ''; hotObj = -1; hotBuf = -1;
    player.load([...simulate(sc.ops)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('cw-speed').oninput = () => player.setSpeed(+$('cw-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="cw.scenario">{{ tt('cw.scenario') }}</span>
        <select id="cw-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="cw-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="cw-play" class="primary">▶ Play</button>
      <button id="cw-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="cw-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Swift</span></div>
      <pre><code id="cw-code"></code></pre>
    </div>
    <div class="cw-stage">
      <div class="vr-col"><h3 class="rec-h" data-i18n="cw.vars">{{ tt('cw.vars') }}</h3><div id="cw-vars" class="vr-vars"></div></div>
      <div class="vr-col"><h3 class="rec-h" data-i18n="cw.heap">{{ tt('cw.heap') }}</h3><div id="cw-heap" class="vr-heap"></div></div>
      <div class="vr-col"><h3 class="rec-h" data-i18n="cw.buffers">{{ tt('cw.buffers') }}</h3><div id="cw-buffers" class="vr-heap"></div></div>
    </div>
    <p class="hint" data-i18n="cw.note">{{ tt('cw.note') }}</p>
    <div class="status-row"><span id="cw-status" class="status"></span></div>
  </section>
</template>
