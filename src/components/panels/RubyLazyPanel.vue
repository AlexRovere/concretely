<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { RUBYLAZY_SCENARIOS, rubyLazyScenarioById, simulate } from '@/rubylazy.js';
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

  const select = $('rz-scenario');
  const pipeEl = $('rz-pipeline');
  const resEl = $('rz-result');
  const countEl = $('rz-count');
  const status = $('rz-status');
  const codeEl = $('rz-code');
  for (const s of RUBYLAZY_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let scenario = null, stages = [], active = -1, current = null, dropped = false;
  let intermediates = {}, result = [], applied = 0, banner = '';

  const stageList = (sc) => [
    { label: sc.source.infinite ? '(1..∞)' : `(1..${sc.source.length})`, kind: 'source' },
    ...sc.ops.map((o) => ({ label: `${o.op} { ${o.expr} }`, kind: o.op })),
    { label: `first(${sc.take})`, kind: 'sink' },
  ];

  const render = () => {
    pipeEl.innerHTML = stages.map((st, i) =>
      `<div class="sw-stage${i === active ? ' hot' : ''}">` +
      `<div class="sw-kind">${esc(st.kind)}</div><div class="sw-label">${esc(st.label)}</div>` +
      (i === active && current != null ? `<div class="sw-token${dropped ? ' dropped' : ''}">${esc(current)}</div>` : '') +
      (intermediates[i] ? `<div class="ss-meta">[${intermediates[i].map(esc).join(', ')}]</div>` : '') +
      `</div>`).join('<div class="sw-arrow">→</div>');
    resEl.innerHTML = result.map((v) => `<div class="el-log">${esc(v)}</div>`).join('') +
      (banner ? `<div class="el-log" style="color:#ef4444">${esc(banner)}</div>` : '');
    countEl.textContent = t('rz.applied')(applied);
  };

  const apply = (s) => {
    dropped = false;
    if (s.type === 'stage-start') { active = s.stage + 1; current = null; }
    else if (s.type === 'apply') { active = s.stage + 1; applied += 1; current = 'result' in s ? `${s.value} → ${s.result}` : `${s.value}${s.pass ? ' ✓' : ' ✗'}`; }
    else if (s.type === 'stage-end') { intermediates[s.stage + 1] = s.output; current = null; }
    else if (s.type === 'take') { result = s.values; active = stages.length - 1; current = null; }
    else if (s.type === 'emit') { active = 0; current = s.value; }
    else if (s.type === 'drop') { active = s.stage + 1; current = s.value; dropped = true; }
    else if (s.type === 'sink') { active = stages.length - 1; current = s.value; result.push(s.value); }
    else if (s.type === 'stop') { banner = t('rz.stop')(s.after); active = -1; current = null; }
    else if (s.type === 'hang') { banner = t('rz.hang'); active = 0; current = '∞'; }
    render();
  };

  const resetState = () => { active = -1; current = null; dropped = false; intermediates = {}; result = []; applied = 0; banner = ''; };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { resetState(); render(); setStatus(status, player); },
    onDone: () => { active = -1; current = null; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('rz-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('rz-play'), stepBtn: $('rz-step'), resetBtn: $('rz-reset'), player });

  const regenerate = () => {
    scenario = rubyLazyScenarioById(select.value);
    codeEl.innerHTML = highlight(scenario.code, 'ruby');
    stages = stageList(scenario);
    resetState();
    player.load([...simulate(scenario)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('rz-speed').oninput = () => player.setSpeed(+$('rz-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="rz.scenario">{{ tt('rz.scenario') }}</span>
        <select id="rz-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="rz-speed" type="range" min="1" max="100" value="35" />
      </label>
      <button id="rz-play" class="primary">▶ Play</button>
      <button id="rz-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="rz-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
      <span id="rz-count" class="el-phase"></span>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Ruby</span></div>
      <pre><code id="rz-code"></code></pre>
    </div>
    <div id="rz-pipeline" class="sw-pipeline"></div>
    <h3 class="rec-h" data-i18n="rz.result">{{ tt('rz.result') }}</h3>
    <div id="rz-result" class="el-console"></div>
    <p class="hint" data-i18n="rz.note">{{ tt('rz.note') }}</p>
    <div class="status-row"><span id="rz-status" class="status"></span></div>
  </section>
</template>
