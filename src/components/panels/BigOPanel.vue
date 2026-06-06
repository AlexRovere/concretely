<script setup>
import { ref, onMounted } from 'vue';
import { GROWTH, growthById, series, opsAt, formatOps } from '@/bigo.js';
import { t, onLocaleChange } from '@/i18n.js';
import { themeColors, onThemeChange } from '@/render/cssColors.js';
import { useI18n } from '@/composables/useI18n';

const { t: tt } = useI18n();
const root = ref(null);

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id);

  const canvas = $('bigo-canvas');
  const ctx = canvas.getContext('2d');
  const nEl = $('bigo-n');
  const fs = $('bigo-curves');
  const readout = $('bigo-readout');

  const on = new Set(['ologn', 'on', 'onlogn', 'on2']);
  for (const g of GROWTH) {
    const label = document.createElement('label');
    label.className = 'curve';
    label.innerHTML =
      `<input type="checkbox" id="bigo-c-${g.id}"${on.has(g.id) ? ' checked' : ''}>` +
      `<span class="swatch" style="background:${g.color}"></span>${g.label}`;
    fs.appendChild(label);
  }
  const selected = () => GROWTH.filter((g) => $(`bigo-c-${g.id}`).checked);

  const draw = () => {
    const W = canvas.width, H = canvas.height, pad = 34;
    ctx.clearRect(0, 0, W, H);
    const maxN = +nEl.value;
    const curves = selected();
    let maxY = 1;
    for (const g of curves) maxY = Math.max(maxY, g.fn(maxN));
    const px = (n) => pad + ((n - 1) / Math.max(1, maxN - 1)) * (W - 2 * pad);
    const py = (v) => H - pad - Math.min(1, v / maxY) * (H - 2 * pad);
    ctx.strokeStyle = themeColors({ axis: ['--border', '#1f2937'] }).axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad); ctx.lineTo(pad, H - pad); ctx.lineTo(W - pad, H - pad);
    ctx.stroke();
    for (const g of curves) {
      ctx.strokeStyle = g.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      series(g.fn, maxN, 300).forEach(([n, v], i) => {
        const x = px(n), y = py(v);
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      });
      ctx.stroke();
    }
  };

  const renderReadout = () => {
    const n = +nEl.value;
    const rows = opsAt(n)
      .filter((r) => $(`bigo-c-${r.id}`).checked)
      .map((r) => `<div><b style="color:${growthById(r.id).color}">${r.label}</b> ${formatOps(r.ops)}</div>`)
      .join('');
    readout.innerHTML = `<div class="readout-title">${t('bigo.opsHeader')(n)}</div><div class="readout-grid">${rows}</div>`;
  };

  const update = () => { $('bigo-n-val').textContent = nEl.value; draw(); renderReadout(); };
  nEl.oninput = update;
  fs.addEventListener('change', update);
  onLocaleChange(renderReadout);
  onThemeChange(draw);
  update();
});
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <fieldset id="bigo-curves" class="curves">
        <legend>{{ tt('bigo.curves') }}</legend>
      </fieldset>
      <label>n = <span id="bigo-n-val">20</span>
        <input id="bigo-n" type="range" min="2" max="40" value="20" />
      </label>
    </div>
    <canvas id="bigo-canvas" width="960" height="420"></canvas>
    <div id="bigo-readout" class="readout"></div>
    <p class="hint">{{ tt('bigo.note') }}</p>
  </section>
</template>
