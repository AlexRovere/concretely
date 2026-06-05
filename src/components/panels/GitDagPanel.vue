<script setup>
import { ref, onMounted, onDeactivated, onUnmounted } from 'vue';
import { GITDAG_SCENARIOS, gitDagScenarioById, simulate } from '@/gitdag.js';
import { StepPlayer } from '@/player.js';
import { highlight } from '@/highlight.js';
import { t, onLocaleChange } from '@/i18n.js';
import { useI18n } from '@/composables/useI18n';
import { setStatus, wirePlayerButtons } from '@/utils/viz.js';

const { t: tt } = useI18n();
const root = ref(null);
let player = null;

const LANE_COLORS = ['#1d4ed8', '#15803d', '#b45309', '#7e22ce'];

onMounted(() => {
  const $ = (id) => root.value.querySelector('#' + id);

  const select = $('gd-scenario');
  const graphEl = $('gd-graph');
  const logEl = $('gd-log');
  const status = $('gd-status');
  const codeEl = $('gd-code');
  for (const s of GITDAG_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let commits = [], branches = {}, head = 'main', hot = '', log = [];

  const render = () => {
    const X = (i) => 50 + i * 86;
    const Y = (lane) => 46 + lane * 64;
    const byId = Object.fromEntries(commits.map((c) => [c.id, c]));
    const w = Math.max(320, 100 + commits.length * 86);
    const maxLane = Math.max(0, ...commits.map((c) => c.lane));
    const h = 96 + maxLane * 64;
    let svg = '';
    for (const c of commits) {
      for (const p of c.parents) {
        const pc = byId[p];
        if (pc) svg += `<path class="edge" d="M ${X(c.i)} ${Y(c.lane)} L ${X(pc.i)} ${Y(pc.lane)}" />`;
      }
    }
    for (const c of commits) {
      const fill = c.id === branches[head] && c.id === hot ? '#38bdf8' : LANE_COLORS[c.lane % 4];
      svg += `<circle class="node${c.orphan ? ' orphan' : ''}" cx="${X(c.i)}" cy="${Y(c.lane)}" r="15" fill="${c.id === hot ? '#38bdf8' : fill}" />`;
      svg += `<text class="cid${c.orphan ? ' orphan' : ''}" x="${X(c.i)}" y="${Y(c.lane) + 4}">${esc(c.id)}</text>`;
    }
    for (const [name, tip] of Object.entries(branches)) {
      const c = byId[tip];
      if (!c) continue;
      const isHead = name === head;
      const offset = name === 'main' ? -26 : 30;
      svg += `<text class="btag${isHead ? ' head' : ''}" x="${X(c.i)}" y="${Y(c.lane) + offset}">${isHead ? '★ ' : ''}${esc(name)}</text>`;
    }
    graphEl.innerHTML = `<svg class="gd-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${svg}</svg>`;
    logEl.innerHTML = log.map((l) => `<div class="el-log">${esc(l)}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  };

  const apply = (s) => {
    hot = '';
    if (s.type === 'commit') {
      commits.push({ id: s.id, parents: s.parents, lane: s.lane, i: commits.length, orphan: false });
      branches[s.branch] = s.id;
      hot = s.id;
      log.push(s.replayOf ? t('gd.log.replay')(s.id, s.replayOf) : t('gd.log.commit')(s.id, s.branch));
    } else if (s.type === 'branch') { branches[s.name] = s.at; log.push(t('gd.log.branch')(s.name, s.at)); }
    else if (s.type === 'checkout') { head = s.name; log.push(t('gd.log.checkout')(s.name)); }
    else if (s.type === 'merge' && s.kind === 'ff') { branches[s.into] = s.to; hot = s.to; log.push(t('gd.log.ff')(s.into, s.to)); }
    else if (s.type === 'merge') {
      commits.push({ id: s.id, parents: s.parents, lane: s.lane, i: commits.length, orphan: false });
      branches[s.into] = s.id; hot = s.id;
      log.push(t('gd.log.merge')(s.id, s.parents));
    } else if (s.type === 'rebase') { log.push(t('gd.log.rebase')(s.branch, s.onto)); }
    else if (s.type === 'orphan') {
      for (const c of commits) if (s.ids.includes(c.id)) c.orphan = true;
      log.push(t('gd.log.orphan')(s.ids));
    }
    render();
  };

  const resetState = () => { commits = []; branches = { main: null }; head = 'main'; hot = ''; log = []; };

  player = new StepPlayer({
    slow: 3,
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { resetState(); render(); setStatus(status, player); },
    onDone: () => { hot = ''; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+$('gd-speed').value);

  const setLabel = wirePlayerButtons({ playBtn: $('gd-play'), stepBtn: $('gd-step'), resetBtn: $('gd-reset'), player });

  const regenerate = () => {
    const sc = gitDagScenarioById(select.value);
    codeEl.innerHTML = highlight(sc.code, 'ruby'); // shell-ish: comments + strings highlight fine
    resetState();
    player.load([...simulate(sc.ops)]);
    setLabel(false);
    render();
  };
  select.onchange = regenerate;
  $('gd-speed').oninput = () => player.setSpeed(+$('gd-speed').value);
  onLocaleChange(() => { render(); setStatus(status, player); setLabel(player.playing); });
  regenerate();
});

onDeactivated(() => player?.pause());
onUnmounted(() => player?.stop());
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls">
      <label><span data-i18n="gd.scenario">{{ tt('gd.scenario') }}</span>
        <select id="gd-scenario"></select>
      </label>
      <label><span data-i18n="ctrl.speed">{{ tt('ctrl.speed') }}</span>
        <input id="gd-speed" type="range" min="1" max="100" value="25" />
      </label>
      <button id="gd-play" class="primary">▶ Play</button>
      <button id="gd-step" data-i18n="btn.step">{{ tt('btn.step') }}</button>
      <button id="gd-reset" data-i18n="btn.reset">{{ tt('btn.reset') }}</button>
    </div>
    <div class="code-box">
      <div class="code-head"><span>git</span></div>
      <pre><code id="gd-code"></code></pre>
    </div>
    <h3 class="rec-h" data-i18n="gd.graph">{{ tt('gd.graph') }}</h3>
    <div id="gd-graph" class="gd-wrap"></div>
    <h3 class="rec-h" data-i18n="gd.journal">{{ tt('gd.journal') }}</h3>
    <div id="gd-log" class="el-console"></div>
    <p class="hint" data-i18n="gd.note">{{ tt('gd.note') }}</p>
    <div class="status-row"><span id="gd-status" class="status"></span></div>
  </section>
</template>
