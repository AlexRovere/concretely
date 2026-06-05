<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { RUBYBLOCKS_SCENARIOS, rubyBlocksScenarioById, simulate } from '@/rubyblocks.js';
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

  const select = $('rbk-scenario');
  const stackEl = $('rbk-stack');
  const consEl = $('rbk-console');
  const status = $('rbk-status');
  const codeEl = $('rbk-code');
  for (const s of RUBYBLOCKS_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let stack = [], out = [], banner = '';

  const render = () => {
    stackEl.innerHTML = stack.map((f) => `<div class="frame${f.kind !== 'method' ? ' memo' : ''}">${esc(f.label)}</div>`).join('');
    consEl.innerHTML = out.map((v) => `<div class="el-log">${esc(v)}</div>`).join('') +
      (banner ? `<div class="el-log" style="color:#ef4444">${esc(banner)}</div>` : '');
  };

  const apply = (s) => {
    if (s.type === 'push') stack.push({ label: s.frame, kind: stack.length ? 'block' : 'method' });
    else if (s.type === 'pop') stack.pop();
    else if (s.type === 'log') out.push(s.value);
    else if (s.type === 'unwind') banner = t('rbk.unwind');
    render();
  };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { stack = []; out = []; banner = ''; render(); setStatus(status, player); },
    onDone: () => { render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('rbk-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('rbk-play'), stepBtn: $('rbk-step'), resetBtn: $('rbk-reset'), player });

  const regenerate = () => {
    const sc = rubyBlocksScenarioById(select.value);
    codeEl.innerHTML = highlight(sc.code, 'ruby');
    stack = []; out = []; banner = '';
    player.load([...simulate(sc.program)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('rbk-speed').oninput = () => player.setSpeed(+$('rbk-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="rbk.scenario">{{ tt('rbk.scenario') }}</span>
        <select id="rbk-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="rbk-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="rbk-play" class="primary">▶ Play</button>
      <button id="rbk-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="rbk-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>Ruby</span></div>
      <pre><code id="rbk-code"></code></pre>
    </div>
    <div class="vr-stage">
      <div class="vr-col"><h3 class="rec-h" data-i18n="rbk.stack">{{ tt('rbk.stack') }}</h3><div id="rbk-stack" class="rec-stack"></div></div>
      <div class="vr-col"><h3 class="rec-h" data-i18n="rbk.console">{{ tt('rbk.console') }}</h3><div id="rbk-console" class="el-console"></div></div>
    </div>
    <p class="hint" data-i18n="rbk.note">{{ tt('rbk.note') }}</p>
    <div class="status-row"><span id="rbk-status" class="status"></span></div>
  </section>
</template>
