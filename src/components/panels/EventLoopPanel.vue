<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { EVENTLOOP_SCENARIOS, scenarioById, simulate } from '@/eventloop.js';
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

  const select = $('el-scenario');
  const speedEl = $('el-speed');
  const stackEl = $('el-stack');
  const microEl = $('el-micro');
  const macroEl = $('el-macro');
  const consoleEl = $('el-console');
  const phaseEl = $('el-phase');
  const status = $('el-status');
  const codeEl = $('el-code');

  for (const s of EVENTLOOP_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id;
    o.textContent = s.id;
    select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let stack = [], micro = [], macro = [], out = [], phase = '';
  const item = (label) => `<div class="el-item">${esc(label)}</div>`;
  const render = () => {
    stackEl.innerHTML = stack.map(item).reverse().join('');
    microEl.innerHTML = micro.map(item).join('');
    macroEl.innerHTML = macro.map(item).join('');
    consoleEl.innerHTML = out.map((v) => `<div class="el-log">${esc(v)}</div>`).join('');
    phaseEl.textContent = phase ? t(`el.phase.${phase}`) : '';
  };
  const apply = (s) => {
    switch (s.type) {
      case 'phase': phase = s.phase; break;
      case 'push': stack.push(s.label); break;
      case 'pop': stack.pop(); break;
      case 'log': out.push(s.value); break;
      case 'enqueue': (s.queue === 'micro' ? micro : macro).push(s.label); break;
      case 'dequeue': {
        const q = s.queue === 'micro' ? micro : macro;
        const i = q.indexOf(s.label);
        if (i >= 0) q.splice(i, 1); else q.shift();
        break;
      }
      default: break;
    }
  };

  player = new StepPlayer({
    onStep: (s) => { apply(s); render(); setStatus(status, player); },
    onReset: () => { stack = []; micro = []; macro = []; out = []; phase = ''; render(); setStatus(status, player); },
    onDone: () => { phase = ''; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+speedEl.value);

  const setLabel = wirePlayerButtons({ playBtn: $('el-play'), stepBtn: $('el-step'), resetBtn: $('el-reset'), player });

  const updateCode = () => { codeEl.innerHTML = highlight(scenarioById(select.value).code, 'js'); };
  const regenerate = () => {
    updateCode();
    player.load([...simulate(scenarioById(select.value).program)]);
    setLabel(false);
  };

  select.onchange = regenerate;
  speedEl.oninput = () => player.setSpeed(+speedEl.value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });

  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="el.scenario">{{ tt('el.scenario') }}</span>
        <select id="el-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="el-speed" type="range" min="1" max="100" value="22" />
      </label>
      <button id="el-play" class="primary">▶ Play</button>
      <button id="el-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="el-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
      <span id="el-phase" class="el-phase"></span>
    </div>
    <div class="code-box">
      <div class="code-head"><span>JavaScript</span></div>
      <pre><code id="el-code"></code></pre>
    </div>
    <div class="el-stage">
      <div class="el-col"><h3 class="rec-h" data-i18n="el.callstack">{{ tt('el.callstack') }}</h3><div id="el-stack" class="el-list stack"></div></div>
      <div class="el-col"><h3 class="rec-h" data-i18n="el.microtasks">{{ tt('el.microtasks') }}</h3><div id="el-micro" class="el-list"></div></div>
      <div class="el-col"><h3 class="rec-h" data-i18n="el.macrotasks">{{ tt('el.macrotasks') }}</h3><div id="el-macro" class="el-list"></div></div>
      <div class="el-col"><h3 class="rec-h" data-i18n="el.console">{{ tt('el.console') }}</h3><div id="el-console" class="el-console"></div></div>
    </div>
    <p class="hint" data-i18n="el.note">{{ tt('el.note') }}</p>
    <div class="status-row"><span id="el-status" class="status"></span></div>
  </section>
</template>
