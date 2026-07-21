<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { StepPlayer } from '@/player.js';
import { MlPlaneRenderer } from '@/render/mlPlaneRenderer.js';
import { blobs } from '@/ml/datasets.js';
import { kmeansSteps } from '@/ml/kmeans.js';
import { highlight } from '@/highlight.js';
import { t, onLocaleChange } from '@/i18n.js';
import { useI18n } from '@/composables/useI18n';
import { setStatus, wirePlayerButtons } from '@/utils/viz.js';

const SNIPPET = `from sklearn.cluster import KMeans
km = KMeans(n_clusters=3, random_state=42).fit(X)
km.labels_            # cluster de chaque point
km.cluster_centers_   # position des centroïdes`;

const { t: tt } = useI18n();
const root = ref(null);
let player = null;
let seed = 1;

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id);
  const canvas = $('ml-canvas');
  const kEl = $('ml-k');
  const speedEl = $('ml-speed');
  const status = $('ml-status');
  const metrics = $('ml-metrics');
  $('ml-code').innerHTML = highlight(SNIPPET, 'python');

  const renderer = new MlPlaneRenderer(canvas);
  let frames = [];
  let current = null;

  const renderFrame = (f) => {
    current = f;
    renderer.draw(f);
    metrics.textContent = t('ml.metrics.kmeans')({ iter: f.iter + 1, inertia: f.inertia });
  };

  player = new StepPlayer({
    slow: 3,
    onStep: (f) => { renderFrame(f); setStatus(status, player); },
    onReset: () => { if (frames[0]) renderFrame(frames[0]); setStatus(status, player); },
    onDone: () => setStatus(status, player, t('status.done')),
  });
  player.setSpeed(+speedEl.value);

  const setLabel = wirePlayerButtons({
    playBtn: $('ml-play'), stepBtn: $('ml-step'), resetBtn: $('ml-reset'), player,
  });

  const regenerate = () => {
    const k = +kEl.value;
    const points = blobs({ k, n: 150, seed });
    renderer.setPoints(points);
    frames = kmeansSteps(points, { k, seed });
    player.load(frames);
    setLabel(false);
  };
  kEl.onchange = regenerate;
  $('ml-new').onclick = () => { seed += 1; regenerate(); };
  speedEl.oninput = () => player.setSpeed(+speedEl.value);
  onLocaleChange(() => { if (current) renderFrame(current); setStatus(status, player); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <h2 class="panel-title">{{ tt('tabs.mlkmeans') }}</h2>
    <div class="controls">
      <label><span>k</span>
        <select id="ml-k">
          <option value="2">2</option>
          <option value="3" selected>3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </label>
      <label><span>{{ tt('ctrl.speed') }}</span>
        <input id="ml-speed" type="range" min="1" max="100" value="30" />
      </label>
      <button id="ml-play" class="primary">▶ Play</button>
      <button id="ml-step">{{ tt('btn.step') }}</button>
      <button id="ml-reset">{{ tt('btn.reset') }}</button>
      <button id="ml-new">{{ tt('ml.regenerate') }}</button>
    </div>
    <canvas id="ml-canvas" class="ml-canvas" width="480" height="480" role="img" :aria-label="tt('ml.kmeans.aria')"></canvas>
    <div id="ml-metrics" class="cx-row"></div>
    <div class="code-box">
      <div class="code-head"><span>scikit-learn</span></div>
      <pre><code id="ml-code"></code></pre>
    </div>
    <p class="hint">{{ tt('ml.kmeans.hint') }}</p>
    <div class="status-row"><span id="ml-status" class="status"></span></div>
  </section>
</template>
