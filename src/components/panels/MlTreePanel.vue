<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { StepPlayer } from '@/player.js';
import { MlPlaneRenderer, CLUSTER_HEX } from '@/render/mlPlaneRenderer.js';
import { blobs } from '@/ml/datasets.js';
import { decisionTreeSteps } from '@/ml/tree.js';
import { highlight } from '@/highlight.js';
import { t, onLocaleChange } from '@/i18n.js';
import { useI18n } from '@/composables/useI18n';
import { setStatus, wirePlayerButtons } from '@/utils/viz.js';

const SNIPPET = `from sklearn.tree import DecisionTreeClassifier
tree = DecisionTreeClassifier(max_depth=4).fit(X, y)
tree.predict(X_new)            # règles if/else apprises
tree.feature_importances_     # variables les plus décisives`;

const { t: tt } = useI18n();
const root = ref(null);
let player = null;
let seed = 1;

// Layout de l'arbre : colonne (in-order) et profondeur par nœud.
function layout(node, depth, state) {
  node.py = depth;
  state.maxDepth = Math.max(state.maxDepth, depth);
  if (!node.split) { node.px = state.col++; return; }
  layout(node.left, depth + 1, state);
  layout(node.right, depth + 1, state);
  node.px = (node.left.px + node.right.px) / 2;
}

// SVG de l'arbre révélé jusqu'à `limit` coupes (synchronisé avec le plan).
function treeSvg(tree, meta, limit) {
  const W = 300;
  const H = 44 + meta.maxDepth * 54;
  const X = (px) => 20 + (meta.maxCol ? px / meta.maxCol : 0.5) * (W - 40);
  const Y = (py) => 26 + (meta.maxDepth ? py / meta.maxDepth : 0) * (H - 52);
  const parts = [];
  const emit = (node) => {
    const x = X(node.px);
    const y = Y(node.py);
    if (node.split && node.bfs < limit) {
      for (const child of [node.left, node.right]) {
        parts.push(`<line x1="${x}" y1="${y}" x2="${X(child.px)}" y2="${Y(child.py)}" stroke="rgba(100,116,139,0.5)" stroke-width="1.5"/>`);
      }
      parts.push(`<circle cx="${x}" cy="${y}" r="5" fill="var(--panel,#fff)" stroke="#6366f1" stroke-width="2"/>`);
      parts.push(`<text x="${x}" y="${y - 9}" text-anchor="middle" font-size="9" fill="currentColor">${node.split.axis}≤${node.split.threshold.toFixed(2)}</text>`);
      emit(node.left);
      emit(node.right);
    } else {
      parts.push(`<circle cx="${x}" cy="${y}" r="7" fill="${CLUSTER_HEX[node.majority % CLUSTER_HEX.length]}" stroke="rgba(0,0,0,0.15)"/>`);
    }
  };
  emit(tree);
  return `<svg viewBox="0 0 ${W} ${H}" class="ml-tree" role="img" aria-label="${tt('ml.tree.aria')}">${parts.join('')}</svg>`;
}

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id);
  const canvas = $('mlt-canvas');
  const treeEl = $('mlt-tree');
  const depthEl = $('mlt-depth');
  const speedEl = $('mlt-speed');
  const status = $('mlt-status');
  const metrics = $('mlt-metrics');
  $('mlt-code').innerHTML = highlight(SNIPPET, 'python');

  const renderer = new MlPlaneRenderer(canvas);
  let frames = [];
  let tree = null;
  let meta = { maxCol: 0, maxDepth: 0 };
  let current = null;

  const renderFrame = (f) => {
    current = f;
    renderer.draw(f);
    treeEl.innerHTML = tree ? treeSvg(tree, meta, f.splitsShown) : '';
    metrics.textContent = t('ml.metrics.tree')({ depth: f.depth, regions: f.regions });
  };

  player = new StepPlayer({
    slow: 4,
    onStep: (f) => { renderFrame(f); setStatus(status, player); },
    onReset: () => { if (frames[0]) renderFrame(frames[0]); setStatus(status, player); },
    onDone: () => setStatus(status, player, t('status.done')),
  });
  player.setSpeed(+speedEl.value);

  const setLabel = wirePlayerButtons({
    playBtn: $('mlt-play'), stepBtn: $('mlt-step'), resetBtn: $('mlt-reset'), player,
  });

  const regenerate = () => {
    const maxDepth = +depthEl.value;
    const points = blobs({ k: 3, n: 120, seed });
    renderer.setPoints(points);
    const out = decisionTreeSteps(points, { maxDepth });
    tree = out.tree;
    frames = out.frames;
    const state = { col: 0, maxDepth: 0 };
    layout(tree, 0, state);
    meta = { maxCol: state.col - 1, maxDepth: state.maxDepth };
    player.load(frames);
    setLabel(false);
  };
  depthEl.onchange = regenerate;
  $('mlt-new').onclick = () => { seed += 1; regenerate(); };
  speedEl.oninput = () => player.setSpeed(+speedEl.value);
  onLocaleChange(() => { if (current) renderFrame(current); setStatus(status, player); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <h2 class="panel-title">{{ tt('tabs.mltree') }}</h2>
    <div class="controls">
      <label><span>max_depth</span>
        <select id="mlt-depth">
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4" selected>4</option>
          <option value="5">5</option>
        </select>
      </label>
      <label><span>{{ tt('ctrl.speed') }}</span>
        <input id="mlt-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="mlt-play" class="primary">▶ Play</button>
      <button id="mlt-step">{{ tt('btn.step') }}</button>
      <button id="mlt-reset">{{ tt('btn.reset') }}</button>
      <button id="mlt-new">{{ tt('ml.regenerate') }}</button>
    </div>
    <div class="ml-split">
      <canvas id="mlt-canvas" class="ml-canvas" width="480" height="480" role="img" :aria-label="tt('ml.tree.planeAria')"></canvas>
      <div class="ml-aside">
        <span class="ml-aside-label">{{ tt('ml.tree.diagram') }}</span>
        <div id="mlt-tree"></div>
      </div>
    </div>
    <div id="mlt-metrics" class="cx-row"></div>
    <div class="code-box">
      <div class="code-head"><span>scikit-learn</span></div>
      <pre><code id="mlt-code"></code></pre>
    </div>
    <p class="hint">{{ tt('ml.tree.hint') }}</p>
    <div class="status-row"><span id="mlt-status" class="status"></span></div>
  </section>
</template>
