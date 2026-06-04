<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { RECURSION, fib, callCount } from '@/recursion.js';
import { StepPlayer } from '@/player.js';
import { t, onLocaleChange } from '@/i18n.js';
import { useI18n } from '@/composables/useI18n';
import { setStatus, wirePlayerButtons } from '@/utils/viz.js';

const { t: tt } = useI18n();

const root = ref(null);
let player = null;

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id);

  const variantEl = $('rec-variant');
  const nEl = $('rec-n');
  const speedEl = $('rec-speed');
  const stackEl = $('rec-stack');
  const info = $('rec-info');
  const status = $('rec-status');

  const fillVariants = () => {
    const keep = variantEl.value;
    variantEl.innerHTML = '';
    for (const id of ['naive', 'memo']) {
      const o = document.createElement('option');
      o.value = id;
      o.textContent = t(`rec.${id}`);
      variantEl.appendChild(o);
    }
    variantEl.value = keep || 'naive';
  };
  fillVariants();

  let stack = [];
  let calls = 0;
  let total = 0;
  const renderStack = () => {
    stackEl.innerHTML = stack
      .map((f) => `<div class="frame${f.memoHit ? ' memo' : ''}">fib(${f.k})</div>`)
      .reverse()
      .join('');
  };
  const renderInfo = () => {
    const n = +nEl.value;
    const note = t(`rec.note.${variantEl.value}`);
    info.innerHTML =
      `<b>fib(${n}) = ${fib(n).toLocaleString()}</b> · ${t('rec.calls')}: ` +
      `${calls.toLocaleString()} / ${total.toLocaleString()}<br><span class="rec-note">${note}</span>`;
  };

  player = new StepPlayer({
    onStep: (s) => {
      if (s.type === 'call') { stack.push({ k: s.k, memoHit: s.memoHit }); calls++; }
      else if (s.type === 'return') { stack.pop(); }
      renderStack(); setStatus(status, player); renderInfo();
    },
    onReset: () => { stack = []; calls = 0; renderStack(); setStatus(status, player); renderInfo(); },
    onDone: () => { setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+speedEl.value);

  const setLabel = wirePlayerButtons({
    playBtn: $('rec-play'),
    stepBtn: $('rec-step'),
    resetBtn: $('rec-reset'),
    player,
  });

  const regenerate = () => {
    const entry = RECURSION[variantEl.value];
    nEl.max = String(entry.maxN);
    if (+nEl.value > entry.maxN) nEl.value = String(entry.maxN);
    $('rec-n-val').textContent = nEl.value;
    const steps = [...entry.gen(+nEl.value)];
    total = callCount(steps);
    player.load(steps); // triggers onReset
    setLabel(false);
  };

  variantEl.onchange = regenerate;
  nEl.oninput = regenerate;
  speedEl.oninput = () => player.setSpeed(+speedEl.value);

  onLocaleChange(() => {
    fillVariants();
    renderInfo();
    setStatus(status, player);
    setLabel(player.playing);
  });

  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="rec.variant">{{ tt('rec.variant') }}</span>
        <select id="rec-variant"></select>
      </label>
      <label>n = <span id="rec-n-val">10</span>
        <input id="rec-n" type="range" min="1" max="12" value="10" />
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="rec-speed" type="range" min="1" max="100" value="72" />
      </label>
      <button id="rec-play" class="primary">▶ Play</button>
      <button id="rec-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="rec-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div id="rec-info" class="rec-info"></div>
    <div class="rec-stage">
      <h3 class="rec-h" data-i18n="rec.callstack">{{ tt('rec.callstack') }}</h3>
      <div id="rec-stack" class="rec-stack"></div>
    </div>
    <div class="status-row"><span id="rec-status" class="status"></span></div>
  </section>
</template>
