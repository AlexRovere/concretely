<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { MlPlaneRenderer } from '@/render/mlPlaneRenderer.js';
import { blobs } from '@/ml/datasets.js';
import { knnRegionGrid } from '@/ml/knn.js';
import { highlight } from '@/highlight.js';
import { t, onLocaleChange } from '@/i18n.js';
import { useI18n } from '@/composables/useI18n';

const SNIPPET = `from sklearn.neighbors import KNeighborsClassifier
knn = KNeighborsClassifier(n_neighbors=5).fit(X, y)
knn.predict([[0.5, 0.5]])   # vote des 5 voisins les plus proches`;

const { t: tt } = useI18n();
const root = ref(null);
let seed = 1;
let cleanup = null;

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id);
  const canvas = $('mlk-canvas');
  const kEl = $('mlk-k');
  const classEl = $('mlk-class');
  const metrics = $('mlk-metrics');
  $('mlk-code').innerHTML = highlight(SNIPPET, 'python');

  const renderer = new MlPlaneRenderer(canvas);
  let points = [];

  const recompute = () => {
    const k = +kEl.value;
    renderer.setPoints(points);
    renderer.draw({ regionGrid: knnRegionGrid(points, k) });
    metrics.textContent = t('ml.metrics.knn')({ n: points.length, k });
  };

  const regenerate = () => {
    points = blobs({ k: 3, n: 90, seed });
    recompute();
  };

  const onClick = (e) => {
    const { x, y } = renderer.pointerToUnit(e.clientX, e.clientY);
    points = [...points, { x, y, label: +classEl.value }];
    recompute();
  };

  kEl.onchange = recompute;
  $('mlk-new').onclick = () => { seed += 1; regenerate(); };
  canvas.addEventListener('click', onClick);
  onLocaleChange(recompute);
  cleanup = () => canvas.removeEventListener('click', onClick);
  regenerate();
});

onUnmounted(() => cleanup?.());
</script>

<template>
  <section ref="root" class="panel">
    <h2 class="panel-title">{{ tt('tabs.mlknn') }}</h2>
    <div class="controls">
      <label><span>k</span>
        <select id="mlk-k">
          <option value="1">1</option>
          <option value="5" selected>5</option>
          <option value="15">15</option>
          <option value="30">30</option>
        </select>
      </label>
      <label><span>{{ tt('ml.knn.addClass') }}</span>
        <select id="mlk-class">
          <option value="0">A</option>
          <option value="1">B</option>
          <option value="2">C</option>
        </select>
      </label>
      <button id="mlk-new">{{ tt('ml.regenerate') }}</button>
    </div>
    <canvas id="mlk-canvas" class="ml-canvas" width="480" height="480" role="img" :aria-label="tt('ml.knn.aria')"></canvas>
    <div id="mlk-metrics" class="cx-row"></div>
    <div class="code-box">
      <div class="code-head"><span>scikit-learn</span></div>
      <pre><code id="mlk-code"></code></pre>
    </div>
    <p class="hint">{{ tt('ml.knn.hint') }}</p>
  </section>
</template>
