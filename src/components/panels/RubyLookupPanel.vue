<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { RUBYLOOKUP_SCENARIOS, rubyLookupScenarioById, simulate } from '@/rubylookup.js';
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

  const select = $('rl-scenario');
  const chainEl = $('rl-chain');
  const consEl = $('rl-console');
  const phaseEl = $('rl-phase');
  const status = $('rl-status');
  const codeEl = $('rl-code');
  for (const s of RUBYLOOKUP_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let chain = [], marks = {}, hot = '', method = '', out = [];

  const render = () => {
    chainEl.innerHTML = chain.map((name) => {
      const mark = marks[name] === 'found' ? ' ✓' : marks[name] === 'miss' ? ' ✗' : '';
      return `<div class="sw-stage${name === hot ? ' hot' : ''}">` +
        `<div class="sw-kind">${esc(marks[name] || '')}</div>` +
        `<div class="sw-label">${esc(name)}${mark}</div></div>`;
    }).join('<div class="sw-arrow">→</div>');
    consEl.innerHTML = out.map((v) => `<div class="el-log">${esc(v)}</div>`).join('');
    phaseEl.textContent = method ? t('rl.searching')(method) : '';
  };

  const apply = (s) => {
    if (s.type === 'lookup') { chain = s.chain; marks = {}; method = s.method; hot = ''; }
    else if (s.type === 'check') { hot = s.at; marks[s.at] = s.found ? 'found' : 'miss'; }
    else if (s.type === 'found') { hot = s.at; marks[s.at] = 'found'; }
    else if (s.type === 'invoke') { hot = s.at; out.push(s.output); }
    else if (s.type === 'methodMissing') { marks = {}; hot = ''; method = 'method_missing'; out.push(t('rl.mm')); }
    render();
  };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { chain = []; marks = {}; hot = ''; method = ''; out = []; render(); setStatus(status, player); },
    onDone: () => { hot = ''; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('rl-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('rl-play'), stepBtn: $('rl-step'), resetBtn: $('rl-reset'), player });

  const regenerate = () => {
    const sc = rubyLookupScenarioById(select.value);
    codeEl.innerHTML = highlight(sc.code, 'ruby');
    chain = []; marks = {}; hot = ''; method = ''; out = [];
    player.load([...simulate(sc.world, sc.className, sc.call)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('rl-speed').oninput = () => player.setSpeed(+$('rl-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="rl.scenario">{{ tt('rl.scenario') }}</span>
        <select id="rl-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="rl-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="rl-play" class="primary">▶ Play</button>
      <button id="rl-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="rl-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
      <span id="rl-phase" class="el-phase"></span>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Ruby</span></div>
      <pre><code id="rl-code"></code></pre>
    </div>
    <h3 class="rec-h" data-i18n="rl.chain">{{ tt('rl.chain') }}</h3>
    <div id="rl-chain" class="sw-pipeline"></div>
    <h3 class="rec-h" data-i18n="rl.console">{{ tt('rl.console') }}</h3>
    <div id="rl-console" class="el-console"></div>
    <p class="hint" data-i18n="rl.note">{{ tt('rl.note') }}</p>
    <div class="status-row"><span id="rl-status" class="status"></span></div>
  </section>
</template>
