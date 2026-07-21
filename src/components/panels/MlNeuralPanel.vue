<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { StepPlayer } from '@/player.js';
import { MlPlaneRenderer } from '@/render/mlPlaneRenderer.js';
import { drawLossCurve } from '@/render/lossCurveRenderer.js';
import { moons } from '@/ml/datasets.js';
import { nnSteps } from '@/ml/nn.js';
import { highlight } from '@/highlight.js';
import { t, onLocaleChange } from '@/i18n.js';
import { useI18n } from '@/composables/useI18n';
import { setStatus, wirePlayerButtons } from '@/utils/viz.js';

const SNIPPET = `from sklearn.neural_network import MLPClassifier
clf = MLPClassifier(hidden_layer_sizes=(8,), activation="tanh").fit(X, y)
clf.predict(X_new)     # frontière non linéaire apprise`;

const { t: tt } = useI18n();
const root = ref(null);
let player = null;
let seed = 1;

// Schéma statique du réseau : 2 entrées → couche cachée → 1 sortie.
function netSvg(hidden) {
  const W = 260;
  const rows = Math.max(hidden, 2);
  const H = 30 + rows * 22;
  const colX = [34, 130, 226];
  const colY = (count, i) => (H - (count - 1) * 22) / 2 + i * 22;
  const nodes = [
    Array.from({ length: 2 }, (_, i) => ({ x: colX[0], y: colY(2, i) })),
    Array.from({ length: hidden }, (_, i) => ({ x: colX[1], y: colY(hidden, i) })),
    [{ x: colX[2], y: colY(1, 0) }],
  ];
  const parts = [];
  for (let l = 0; l < 2; l++) {
    for (const a of nodes[l]) {
      for (const b of nodes[l + 1]) {
        parts.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="rgba(100,116,139,0.25)"/>`);
      }
    }
  }
  const fills = ['#64748b', '#6366f1', '#22c55e'];
  nodes.forEach((layer, l) => {
    for (const nd of layer) parts.push(`<circle cx="${nd.x}" cy="${nd.y}" r="6" fill="${fills[l]}"/>`);
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="ml-net" role="img" aria-label="${tt('ml.nn.netAria')}">${parts.join('')}</svg>`;
}

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id);
  const canvas = $('mln-canvas');
  const lossCanvas = $('mln-loss');
  const netEl = $('mln-net');
  const hiddenEl = $('mln-hidden');
  const speedEl = $('mln-speed');
  const status = $('mln-status');
  const metrics = $('mln-metrics');
  $('mln-code').innerHTML = highlight(SNIPPET, 'python');

  const renderer = new MlPlaneRenderer(canvas);
  let frames = [];
  let losses = [];
  let current = null;

  const renderFrame = (f) => {
    current = f;
    renderer.draw(f);
    drawLossCurve(lossCanvas, losses, f.idx);
    metrics.textContent = t('ml.metrics.nn')({ epoch: f.epoch, loss: f.loss });
  };

  player = new StepPlayer({
    slow: 3,
    onStep: (f) => { renderFrame(f); setStatus(status, player); },
    onReset: () => { if (frames[0]) renderFrame(frames[0]); setStatus(status, player); },
    onDone: () => setStatus(status, player, t('status.done')),
  });
  player.setSpeed(+speedEl.value);

  const setLabel = wirePlayerButtons({
    playBtn: $('mln-play'), stepBtn: $('mln-step'), resetBtn: $('mln-reset'), player,
  });

  const regenerate = () => {
    const hidden = +hiddenEl.value;
    const points = moons({ n: 120, noise: 0.06, seed });
    renderer.setPoints(points);
    const out = nnSteps(points, { hidden, epochs: 300, res: 32, seed: 3 });
    frames = out.frames;
    frames.forEach((f, i) => { f.idx = i; });
    losses = frames.map((f) => f.loss);
    netEl.innerHTML = netSvg(hidden);
    player.load(frames);
    setLabel(false);
  };
  hiddenEl.onchange = regenerate;
  $('mln-new').onclick = () => { seed += 1; regenerate(); };
  speedEl.oninput = () => player.setSpeed(+speedEl.value);
  onLocaleChange(() => { if (current) renderFrame(current); setStatus(status, player); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <h2 class="panel-title">{{ tt('tabs.mlneural') }}</h2>
    <div class="controls">
      <label><span>{{ tt('ml.nn.hidden') }}</span>
        <select id="mln-hidden">
          <option value="4">4</option>
          <option value="8" selected>8</option>
          <option value="12">12</option>
        </select>
      </label>
      <label><span>{{ tt('ctrl.speed') }}</span>
        <input id="mln-speed" type="range" min="1" max="100" value="35" />
      </label>
      <button id="mln-play" class="primary">▶ Play</button>
      <button id="mln-step">{{ tt('btn.step') }}</button>
      <button id="mln-reset">{{ tt('btn.reset') }}</button>
      <button id="mln-new">{{ tt('ml.regenerate') }}</button>
    </div>
    <div class="ml-split">
      <canvas id="mln-canvas" class="ml-canvas" width="480" height="480" role="img" :aria-label="tt('ml.nn.planeAria')"></canvas>
      <div class="ml-aside">
        <span class="ml-aside-label">loss (BCE)</span>
        <canvas id="mln-loss" class="ml-loss" width="240" height="120"></canvas>
        <span class="ml-aside-label">{{ tt('ml.nn.diagram') }}</span>
        <div id="mln-net"></div>
      </div>
    </div>
    <div id="mln-metrics" class="cx-row"></div>
    <div class="code-box">
      <div class="code-head"><span>scikit-learn</span></div>
      <pre><code id="mln-code"></code></pre>
    </div>
    <p class="hint">{{ tt('ml.nn.hint') }}</p>
    <div class="status-row"><span id="mln-status" class="status"></span></div>
  </section>
</template>
