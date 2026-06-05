<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { GITRESET_SCENARIOS, gitResetScenarioById, simulate } from '@/gitreset.js';
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

  const select = $('gr-scenario');
  const workEl = $('gr-working');
  const idxEl = $('gr-index');
  const headEl = $('gr-head');
  const logEl = $('gr-log');
  const status = $('gr-status');
  const codeEl = $('gr-code');
  for (const s of GITRESET_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let working = {}, index = {}, commits = [], hot = '', log = [];

  const files = (obj) => Object.entries(obj).map(([f, c]) => `<div class="vr-var">${esc(f)} = <b>"${esc(c)}"</b></div>`).join('') || `<div class="ds-empty">—</div>`;
  const render = () => {
    workEl.innerHTML = files(working);
    idxEl.innerHTML = files(index);
    headEl.innerHTML = commits.map((c, i) =>
      `<div class="vr-obj${i === commits.length - 1 ? (hot === 'head' ? ' hot' : '') : ''}">` +
      `<span class="ds-bi">${esc(c.id)}</span> "${esc(c.msg)}" { ` +
      Object.entries(c.files).map(([f, v]) => `${esc(f)}: <b>"${esc(v)}"</b>`).join(', ') + ' }' +
      (i === commits.length - 1 ? ' ← HEAD' : '') + `</div>`).reverse().join('')
      || `<div class="ds-empty">—</div>`;
    if (hot === 'working') workEl.firstElementChild?.classList?.add('hot');
    if (hot === 'index') idxEl.firstElementChild?.classList?.add('hot');
    logEl.innerHTML = log.map((l) => `<div class="el-log">${esc(l)}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  };

  const apply = (s) => {
    hot = '';
    if (s.type === 'edit') { working[s.file] = s.content; hot = 'working'; log.push(t('gr.log.edit')(s.file, s.content)); }
    else if (s.type === 'add') { index[s.file] = s.content; hot = 'index'; log.push(t('gr.log.add')(s.file, s.content)); }
    else if (s.type === 'commit') { commits.push({ id: s.id, msg: s.msg, files: { ...s.files } }); hot = 'head'; log.push(t('gr.log.commit')(s.id, s.msg)); }
    else if (s.type === 'reset') { commits.pop(); hot = 'head'; log.push(t('gr.log.reset')(s.mode, s.to)); }
    else if (s.type === 'zone') {
      if (s.zone === 'index') index = { ...s.state };
      else if (s.zone === 'working') working = { ...s.state };
      hot = s.zone;
      log.push(t('gr.log.zone')(s.zone));
    }
    render();
  };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { working = {}; index = {}; commits = []; hot = ''; log = []; render(); setStatus(status, player); },
    onDone: () => { hot = ''; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('gr-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('gr-play'), stepBtn: $('gr-step'), resetBtn: $('gr-reset'), player });

  const regenerate = () => {
    const sc = gitResetScenarioById(select.value);
    codeEl.innerHTML = highlight(sc.code, 'ruby'); // shell-ish highlighting
    working = {}; index = {}; commits = []; hot = ''; log = [];
    player.load([...simulate(sc.ops)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('gr-speed').oninput = () => player.setSpeed(+$('gr-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="gr.scenario">{{ tt('gr.scenario') }}</span>
        <select id="gr-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="gr-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="gr-play" class="primary">▶ Play</button>
      <button id="gr-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="gr-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>git</span></div>
      <pre><code id="gr-code"></code></pre>
    </div>
    <div class="cw-stage">
      <div class="vr-col"><h3 class="rec-h" data-i18n="gr.working">{{ tt('gr.working') }}</h3><div id="gr-working" class="vr-vars"></div></div>
      <div class="vr-col"><h3 class="rec-h" data-i18n="gr.index">{{ tt('gr.index') }}</h3><div id="gr-index" class="vr-vars"></div></div>
      <div class="vr-col"><h3 class="rec-h" data-i18n="gr.head">{{ tt('gr.head') }}</h3><div id="gr-head" class="vr-heap"></div></div>
    </div>
    <h3 class="rec-h" data-i18n="gr.journal">{{ tt('gr.journal') }}</h3>
    <div id="gr-log" class="el-console"></div>
    <p class="hint" data-i18n="gr.note">{{ tt('gr.note') }}</p>
    <div class="status-row"><span id="gr-status" class="status"></span></div>
  </section>
</template>
