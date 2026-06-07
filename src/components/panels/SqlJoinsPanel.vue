<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { USERS, ORDERS, JOIN_TYPES, simulate } from '@/sqljoins.js';
import { StepPlayer } from '@/player.js';
import { useI18n } from '@/composables/useI18n';
import { t as ti, onLocaleChange } from '@/i18n.js';
import { setStatus, wirePlayerButtons } from '@/utils/viz.js';

// Animated nested-loop JOIN: the two source tables on top, the result builds
// underneath. Declarative rendering (reactive refs), driven by a StepPlayer.
const { t } = useI18n();

const joinType = ref('inner');
const curLeft = ref(null); // index of the scanned users row
const curRight = ref(null); // index of the compared orders row
const matched = ref(null); // outcome of the current compare
const resultRows = ref([]); // { nom, produit, reason }
const dropped = ref(new Set()); // 'left-0' / 'right-3' — rows excluded from the result

const root = ref(null);
let player = null;

function applyStep(s) {
  if (s.type === 'scan-left') {
    curLeft.value = s.index;
    curRight.value = null;
    matched.value = null;
  } else if (s.type === 'compare') {
    curLeft.value = s.leftIndex;
    curRight.value = s.rightIndex;
    matched.value = s.matched;
  } else if (s.type === 'emit') {
    resultRows.value = [...resultRows.value, { ...s.row, reason: s.reason }];
  } else if (s.type === 'drop') {
    dropped.value = new Set([...dropped.value, `${s.side}-${s.index}`]);
  }
}

function resetView() {
  curLeft.value = null;
  curRight.value = null;
  matched.value = null;
  resultRows.value = [];
  dropped.value = new Set();
}

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id);
  const status = $('sj-status');

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { applyStep(s); setStatus(status, player); },
    onReset: () => { resetView(); setStatus(status, player); },
    onDone: () => { curLeft.value = null; curRight.value = null; matched.value = null; setStatus(status, player, ti('status.done')); },
  });
  player.setSpeed(+$('sj-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('sj-play'), stepBtn: $('sj-step'), resetBtn: $('sj-reset'), player });

  const regenerate = () => {
    resetView();
    player.load([...simulate(joinType.value)]);
    setLabel(false);
  };
  $('sj-type').onchange = (e) => { joinType.value = e.target.value; regenerate(); };
  $('sj-speed').oninput = () => player.setSpeed(+$('sj-speed').value);
  onLocaleChange(() => { setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span>{{ t('sj.type') }}</span>
        <select id="sj-type" :value="joinType">
          <option v-for="jt in JOIN_TYPES" :key="jt" :value="jt">{{ jt.toUpperCase() }} JOIN</option>
        </select>
      </label>
      <label><span>{{ t('ctrl.speed') }}</span>
        <input id="sj-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="sj-play" class="primary">▶ Play</button>
      <button id="sj-step">{{ t('btn.step') }}</button>
      <button id="sj-reset">{{ t('btn.reset') }}</button>
    </div>

    <p class="sj-query">
      SELECT u.nom, o.produit FROM users u
      <b>{{ joinType.toUpperCase() }} JOIN</b> orders o ON u.id = o.user_id;
    </p>

    <div class="sj-stage">
      <div>
        <h3 class="rec-h">users</h3>
        <table class="sj-table">
          <thead><tr><th>id</th><th>nom</th></tr></thead>
          <tbody>
            <tr
              v-for="(u, i) in USERS"
              :key="u.id"
              :class="{ hot: curLeft === i, ok: curLeft === i && matched === true, faded: dropped.has('left-' + i) }"
            >
              <td>{{ u.id }}</td><td>{{ u.nom }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <h3 class="rec-h">orders</h3>
        <table class="sj-table">
          <thead><tr><th>id</th><th>user_id</th><th>produit</th></tr></thead>
          <tbody>
            <tr
              v-for="(o, i) in ORDERS"
              :key="o.id"
              :class="{ hot: curRight === i, ok: curRight === i && matched === true, ko: curRight === i && matched === false, faded: dropped.has('right-' + i) }"
            >
              <td>{{ o.id }}</td><td>{{ o.user_id }}</td><td>{{ o.produit }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <h3 class="rec-h">{{ t('sj.result') }} ({{ resultRows.length }})</h3>
        <table class="sj-table">
          <thead><tr><th>nom</th><th>produit</th></tr></thead>
          <tbody>
            <tr v-for="(r, i) in resultRows" :key="i" :class="'sj-' + r.reason">
              <td><span v-if="r.nom === null" class="sj-null">NULL</span><template v-else>{{ r.nom }}</template></td>
              <td><span v-if="r.produit === null" class="sj-null">NULL</span><template v-else>{{ r.produit }}</template></td>
            </tr>
            <tr v-if="resultRows.length === 0"><td colspan="2" class="sj-empty">—</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <p class="hint">{{ t('sj.note') }}</p>
    <div class="status-row"><span id="sj-status" class="status"></span></div>
  </section>
</template>
