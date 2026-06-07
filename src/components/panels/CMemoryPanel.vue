<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { CMEMORY_SCENARIOS, cMemoryScenarioById, simulate } from '@/cmemory.js';
import { StepPlayer } from '@/player.js';
import { highlight } from '@/highlight.js';
import { t as ti, onLocaleChange } from '@/i18n.js';
import { useI18n } from '@/composables/useI18n';
import { setStatus, wirePlayerButtons } from '@/utils/viz.js';

// C memory, made visible: stack frames on the left (they die on return),
// heap blocks on the right (they die on free — or leak). Declarative
// rendering driven by a StepPlayer over the cmemory.js step list.
const { t } = useI18n();

const frames = ref([]); // [{ fn, vars: [{ name, value, addr, pointsTo }] }]
const heap = ref([]); // [{ id, size, label, addr, freed }]
const journal = ref([]); // { kind: 'note' | 'crash', text }
const root = ref(null);
let player = null;

function findVar(fn, name) {
  const frame = frames.value.find((f) => f.fn === fn);
  return frame?.vars.find((v) => v.name === name);
}

function applyStep(s) {
  if (s.type === 'call') {
    frames.value = [...frames.value, { fn: s.fn, vars: s.vars.map((v) => ({ ...v, pointsTo: null })) }];
  } else if (s.type === 'set') {
    const v = findVar(s.fn, s.name);
    if (v) v.value = s.value;
    frames.value = [...frames.value];
  } else if (s.type === 'ret') {
    frames.value = frames.value.filter((f) => f.fn !== s.fn);
  } else if (s.type === 'malloc') {
    heap.value = [...heap.value, { ...s, freed: false }];
  } else if (s.type === 'free') {
    heap.value = heap.value.map((b) => (b.id === s.id ? { ...b, freed: true } : b));
  } else if (s.type === 'point') {
    let v = findVar(s.fn, s.name);
    if (!v) {
      // pointer variables may appear on first use
      const frame = frames.value.find((f) => f.fn === s.fn);
      if (frame) { v = { name: s.name, value: 'ptr', addr: '', pointsTo: null }; frame.vars.push(v); }
    }
    if (v) v.pointsTo = s.to;
    frames.value = [...frames.value];
  } else if (s.type === 'note') {
    journal.value = [...journal.value, { kind: 'note', text: s.text }];
  } else if (s.type === 'crash') {
    journal.value = [...journal.value, { kind: 'crash', text: `💥 ${s.code} — ${s.message}` }];
  }
}

function targetLabel(to) {
  if (!to) return '';
  if (to.kind === 'heap') return `→ ${to.id}`;
  if (to.kind === 'stack') return `→ ${to.fn}.${to.name}`;
  return t('cm.dangling');
}

function resetView() {
  frames.value = [];
  heap.value = [];
  journal.value = [];
}

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id);
  const status = $('cm-status');
  const select = $('cm-select');
  const codeEl = $('cm-code');
  for (const s of CMEMORY_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { applyStep(s); setStatus(status, player); },
    onReset: () => { resetView(); setStatus(status, player); },
    onDone: () => { setStatus(status, player, ti('status.done')); },
  });
  player.setSpeed(+$('cm-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('cm-play'), stepBtn: $('cm-step'), resetBtn: $('cm-reset'), player });

  const regenerate = () => {
    const sc = cMemoryScenarioById(select.value);
    codeEl.innerHTML = highlight(sc.code, 'js');
    resetView();
    player.load([...simulate(sc)]);
    setLabel(false);
  };
  select.onchange = regenerate;
  $('cm-speed').oninput = () => player.setSpeed(+$('cm-speed').value);
  onLocaleChange(() => { setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span>{{ t('lb.scenario') }}</span>
        <select id="cm-select"></select>
      </label>
      <label><span>{{ t('ctrl.speed') }}</span>
        <input id="cm-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="cm-play" class="primary">▶ Play</button>
      <button id="cm-step">{{ t('btn.step') }}</button>
      <button id="cm-reset">{{ t('btn.reset') }}</button>
    </div>

    <div class="code-box">
      <div class="code-head"><span>C</span></div>
      <pre><code id="cm-code"></code></pre>
    </div>

    <div class="cm-stage">
      <div class="cm-zone">
        <h3 class="rec-h">{{ t('cm.stack') }}</h3>
        <div class="cm-frames">
          <div v-for="f in [...frames].reverse()" :key="f.fn" class="cm-frame">
            <div class="cm-fn">{{ f.fn }}()</div>
            <div v-for="v in f.vars" :key="v.name" class="cm-var">
              <b>{{ v.name }}</b> = {{ v.value }}
              <span v-if="v.pointsTo" class="cm-ptr" :class="{ dead: v.pointsTo.kind === 'dead' }">{{ targetLabel(v.pointsTo) }}</span>
              <span v-if="v.addr" class="cm-addr">{{ v.addr }}</span>
            </div>
          </div>
          <p v-if="frames.length === 0" class="ds-empty">{{ t('cm.empty') }}</p>
        </div>
      </div>
      <div class="cm-zone">
        <h3 class="rec-h">{{ t('cm.heap') }}</h3>
        <div class="cm-blocks">
          <div v-for="b in heap" :key="b.id" class="cm-block" :class="{ freed: b.freed }">
            <b>{{ b.id }}</b> · {{ b.label }} · {{ b.size }} o
            <span class="cm-addr">{{ b.addr }}</span>
            <span v-if="b.freed" class="cm-freed">{{ t('cm.freed') }}</span>
          </div>
          <p v-if="heap.length === 0" class="ds-empty">{{ t('cm.empty') }}</p>
        </div>
      </div>
    </div>

    <div class="el-console cm-journal">
      <div v-for="(l, i) in journal" :key="i" class="el-log" :class="{ 'cm-crash': l.kind === 'crash' }">{{ l.text }}</div>
    </div>

    <p class="hint">{{ t('cm.note') }}</p>
    <div class="status-row"><span id="cm-status" class="status"></span></div>
  </section>
</template>
