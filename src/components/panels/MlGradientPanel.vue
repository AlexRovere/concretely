<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { StepPlayer } from '@/player.js';
import { MlPlaneRenderer } from '@/render/mlPlaneRenderer.js';
import { drawLossCurve } from '@/render/lossCurveRenderer.js';
import { linear } from '@/ml/datasets.js';
import { gradientSteps } from '@/ml/gradient.js';
import { highlight } from '@/highlight.js';
import { t, onLocaleChange } from '@/i18n.js';
import { useI18n } from '@/composables/useI18n';
import { setStatus, wirePlayerButtons } from '@/utils/viz.js';

const SNIPPET = `from sklearn.linear_model import LinearRegression
reg = LinearRegression().fit(X, y)   # ajuste la droite (moindres carrés)
reg.coef_, reg.intercept_            # pente a, ordonnée b apprises
reg.predict(X_new)                   # prédiction`;

const { t: tt } = useI18n();
const root = ref(null);
let player = null;
let seed = 1;

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id);
  const canvas = $('mlg-canvas');
  const lossCanvas = $('mlg-loss');
  const lrEl = $('mlg-lr');
  const speedEl = $('mlg-speed');
  const status = $('mlg-status');
  const metrics = $('mlg-metrics');
  $('mlg-code').innerHTML = highlight(SNIPPET, 'python');

  const renderer = new MlPlaneRenderer(canvas);
  let frames = [];
  let losses = [];
  let current = null;

  const renderFrame = (f) => {
    current = f;
    renderer.draw(f);
    drawLossCurve(lossCanvas, losses, f.epoch);
    metrics.textContent = t('ml.metrics.gradient')({ epoch: f.epoch, loss: f.loss, a: f.a, b: f.b });
  };

  player = new StepPlayer({
    slow: 3,
    onStep: (f) => { renderFrame(f); setStatus(status, player); },
    onReset: () => { if (frames[0]) renderFrame(frames[0]); setStatus(status, player); },
    onDone: () => setStatus(status, player, t('status.done')),
  });
  player.setSpeed(+speedEl.value);

  const setLabel = wirePlayerButtons({
    playBtn: $('mlg-play'), stepBtn: $('mlg-step'), resetBtn: $('mlg-reset'), player,
  });

  const regenerate = () => {
    const lr = +lrEl.value;
    const points = linear({ n: 40, seed });
    renderer.setPoints(points);
    frames = gradientSteps(points, { lr, epochs: 50 });
    losses = frames.map((f) => f.loss);
    player.load(frames);
    setLabel(false);
  };
  lrEl.onchange = regenerate;
  $('mlg-new').onclick = () => { seed += 1; regenerate(); };
  speedEl.oninput = () => player.setSpeed(+speedEl.value);
  onLocaleChange(() => { if (current) renderFrame(current); setStatus(status, player); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <h2 class="panel-title">{{ tt('tabs.mlgradient') }}</h2>
    <div class="controls">
      <label><span>learning rate</span>
        <select id="mlg-lr">
          <option value="0.1">0.1</option>
          <option value="0.3" selected>0.3</option>
          <option value="0.6">0.6</option>
        </select>
      </label>
      <label><span>{{ tt('ctrl.speed') }}</span>
        <input id="mlg-speed" type="range" min="1" max="100" value="30" />
      </label>
      <button id="mlg-play" class="primary">▶ Play</button>
      <button id="mlg-step">{{ tt('btn.step') }}</button>
      <button id="mlg-reset">{{ tt('btn.reset') }}</button>
      <button id="mlg-new">{{ tt('ml.regenerate') }}</button>
    </div>
    <div class="ml-split">
      <canvas id="mlg-canvas" class="ml-canvas" width="480" height="480" role="img" :aria-label="tt('ml.gradient.aria')"></canvas>
      <div class="ml-aside">
        <span class="ml-aside-label">loss (MSE)</span>
        <canvas id="mlg-loss" class="ml-loss" width="240" height="120"></canvas>
      </div>
    </div>
    <div id="mlg-metrics" class="cx-row"></div>
    <div class="code-box">
      <div class="code-head"><span>scikit-learn</span></div>
      <pre><code id="mlg-code"></code></pre>
    </div>
    <p class="hint">{{ tt('ml.gradient.hint') }}</p>
    <div class="status-row"><span id="mlg-status" class="status"></span></div>
  </section>
</template>
