import { SORTS } from './sorting/algorithms.js';
import { PATHFINDERS } from './pathfinding/algorithms.js';
import { createGrid, setWall, isWall } from './pathfinding/grid.js';
import { StepPlayer } from './player.js';
import { SortRenderer } from './render/sortRenderer.js';
import { GridRenderer } from './render/gridRenderer.js';
import { LANGUAGES, snippet } from './snippets/index.js';
import { highlight } from './highlight.js';
import { DISTRIBUTIONS, generateArray } from './distributions.js';
import { emptyMetrics, accumulate } from './metrics.js';
import { LOCALES, getLocale, setLocale, onLocaleChange, t, algoMeta } from './i18n.js';
import { GROWTH, growthById, series, opsAt, formatOps } from './bigo.js';
import { RECURSION, fib, callCount } from './recursion.js';
import { EVENTLOOP_SCENARIOS, scenarioById, simulate } from './eventloop.js';
import { STRUCTURES, Stack, Queue, HashMap } from './datastructures.js';
import { VALUEREF_SCENARIOS, vrScenarioById, simulate as vrSimulate } from './valueref.js';
import { COMBINE_SCENARIOS, combineScenarioById, simulate as cbSimulate, stagesOf } from './combine.js';

const $ = (id) => document.getElementById(id);

/* --------------------------------------------------- code language (shared) */

let currentLang = 'js';
const langSelects = [];
const codeUpdaters = [];

function registerLangSelect(sel, updateCode) {
  for (const { id, name } of LANGUAGES) {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = name; // language names are proper nouns — not translated
    sel.appendChild(opt);
  }
  sel.value = currentLang;
  sel.addEventListener('change', () => setLang(sel.value));
  langSelects.push(sel);
  codeUpdaters.push(updateCode);
}

function setLang(lang) {
  currentLang = lang;
  for (const s of langSelects) s.value = lang;
  for (const u of codeUpdaters) u();
}

/* ----------------------------------------------------------- locale (UI) */

const localeRefreshers = [];

function applyStaticI18n() {
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml);
}

function setupLocale() {
  const sel = $('locale');
  for (const { id, name } of LOCALES) {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = name;
    sel.appendChild(opt);
  }
  sel.value = getLocale();
  sel.addEventListener('change', () => setLocale(sel.value));
  onLocaleChange(() => { applyStaticI18n(); for (const r of localeRefreshers) r(); });
}

/* ------------------------------------------------------------------ helpers */

function fillAlgoSelect(select, ids) {
  select.innerHTML = '';
  for (const id of ids) {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = algoMeta(id).name;
    select.appendChild(opt);
  }
}
const relabelAlgoSelect = (select) => {
  for (const opt of select.options) opt.textContent = algoMeta(opt.value).name;
};

function fillDistSelect(select) {
  select.innerHTML = '';
  for (const { id } of DISTRIBUTIONS) {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = t(`dist.${id}`);
    select.appendChild(opt);
  }
}
const relabelDistSelect = (select) => {
  for (const opt of select.options) opt.textContent = t(`dist.${opt.value}`);
};

function setStatus(el, player, extra = '') {
  const pct = Math.round(player.progress * 100);
  el.textContent = `${pct}% — ${player.steps.length} ${t('status.steps')}${extra ? ' — ' + extra : ''}`;
}

const playLabel = (playing) => (playing ? `⏸ ${t('btn.pause')}` : `▶ ${t('btn.play')}`);

/** Render an algorithm's complexity, plain-language explanation, tip and legend. */
function showComplexity(el, entry, capped) {
  const c = entry.complexity || {};
  const tags = Object.entries(c)
    .map(([k, v]) => `<span class="cx" title="${t(`cx.title.${k}`)}"><b>${t(`cx.label.${k}`)}</b> ${v}</span>`)
    .join('');
  let html = `<div class="cx-row">${tags}</div>`;
  if (entry.desc) html += `<p class="cx-desc">${entry.desc}</p>`;
  if (entry.tips) html += `<p class="cx-tips"><b>${t('cx.whenToUse')}</b> ${entry.tips}</p>`;
  if (capped) html += `<p class="cx-warn">${t('cx.capped')(capped)}</p>`;
  html += `<p class="cx-legend">${t('cx.legend')}</p>`;
  el.innerHTML = html;
}

/* ----------------------------------------------------------------- sorting */

function setupSorting() {
  const canvas = $('sort-canvas');
  const select = $('sort-algo');
  const distEl = $('sort-dist');
  const sizeEl = $('sort-size');
  const speedEl = $('sort-speed');
  const status = $('sort-status');
  const metricsEl = $('sort-metrics');
  const complexity = $('sort-complexity');
  fillAlgoSelect(select, Object.keys(SORTS));
  fillDistSelect(distEl);

  let array = generateArray(+sizeEl.value, distEl.value); // full master array
  let current = array;                                    // effective (possibly capped) array
  let metrics = emptyMetrics();
  const renderMetrics = () => { metricsEl.textContent = t('metrics.sort')(metrics); };
  const renderer = new SortRenderer(canvas, array);
  const player = new StepPlayer({
    onStep: (s) => { renderer.step(s); accumulate(metrics, s); setStatus(status, player); renderMetrics(); },
    onReset: () => { renderer.reset(current); metrics = emptyMetrics(); setStatus(status, player); renderMetrics(); },
    onDone: () => { renderer.markAllSorted(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+speedEl.value);

  const updateCode = () => {
    $('sort-code').innerHTML = highlight(snippet(select.value, currentLang), currentLang);
    $('sort-code-title').textContent = algoMeta(select.value).name;
  };
  const cappedFor = (entry) => (entry.maxN && array.length > entry.maxN ? entry.maxN : null);
  const paintMeta = (entry, capped) => {
    $('sort-size-val').textContent = capped ? t('size.capped')(array.length, capped) : String(array.length);
    showComplexity(complexity, entry, capped);
    updateCode();
  };
  const regenerate = () => {
    const entry = algoMeta(select.value);
    const capped = cappedFor(entry);
    current = capped ? array.slice(0, capped) : array;
    paintMeta(entry, capped);
    player.load([...entry.gen(current)]); // load() triggers onReset → renderer.reset(current)
    $('sort-play').textContent = playLabel(false);
  };
  const shuffle = () => { array = generateArray(+sizeEl.value, distEl.value); regenerate(); };

  registerLangSelect($('sort-lang'), updateCode);
  localeRefreshers.push(() => {
    relabelAlgoSelect(select);
    relabelDistSelect(distEl);
    const entry = algoMeta(select.value);
    paintMeta(entry, cappedFor(entry));
    setStatus(status, player);
    renderMetrics();
    $('sort-play').textContent = playLabel(player.playing);
  });

  shuffle();

  $('sort-shuffle').onclick = shuffle;
  distEl.onchange = shuffle;
  select.onchange = regenerate;
  sizeEl.oninput = shuffle;
  speedEl.oninput = () => player.setSpeed(+speedEl.value);
  $('sort-step').onclick = () => { player.pause(); player.stepOnce(); $('sort-play').textContent = playLabel(false); };
  $('sort-reset').onclick = () => { player.load(player.steps); $('sort-play').textContent = playLabel(false); };
  $('sort-play').onclick = () => {
    if (player.playing) { player.pause(); }
    else { if (player.done) player.load(player.steps); player.play(); }
    $('sort-play').textContent = playLabel(player.playing);
  };
}

/* ------------------------------------------------------------- pathfinding */

function setupPathfinding() {
  const canvas = $('grid-canvas');
  const select = $('grid-algo');
  const speedEl = $('grid-speed');
  const status = $('grid-status');
  const metricsEl = $('grid-metrics');
  const complexity = $('grid-complexity');
  fillAlgoSelect(select, Object.keys(PATHFINDERS));

  const ROWS = 25, COLS = 40;
  let grid = createGrid(ROWS, COLS);
  const start = [0, 0];
  const end = [ROWS - 1, COLS - 1];
  let metrics = emptyMetrics();
  const renderMetrics = () => { metricsEl.textContent = t('metrics.path')(metrics); };
  const renderer = new GridRenderer(canvas, grid, start, end);
  const player = new StepPlayer({
    onStep: (s) => { renderer.step(s); accumulate(metrics, s); setStatus(status, player); renderMetrics(); },
    onReset: () => { renderer.clearOverlay(); metrics = emptyMetrics(); setStatus(status, player); renderMetrics(); },
    onDone: () => setStatus(status, player, renderer.path.length ? t('path.cells')(renderer.path.length) : t('path.none')),
  });
  player.setSpeed(+speedEl.value);

  const updateCode = () => {
    $('grid-code').innerHTML = highlight(snippet(select.value, currentLang), currentLang);
    $('grid-code-title').textContent = algoMeta(select.value).name;
  };
  const regenerate = () => {
    renderer.clearOverlay();
    showComplexity(complexity, algoMeta(select.value));
    updateCode();
    player.load([...algoMeta(select.value).gen(grid, start, end)]);
    $('grid-play').textContent = playLabel(false);
  };
  registerLangSelect($('grid-lang'), updateCode);
  localeRefreshers.push(() => {
    relabelAlgoSelect(select);
    showComplexity(complexity, algoMeta(select.value));
    updateCode();
    setStatus(status, player);
    renderMetrics();
    $('grid-play').textContent = playLabel(player.playing);
  });

  const isEndpoint = (r, c) => (r === start[0] && c === start[1]) || (r === end[0] && c === end[1]);

  const randomMaze = () => {
    grid = createGrid(ROWS, COLS);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!isEndpoint(r, c) && Math.random() < 0.28) setWall(grid, r, c);
      }
    }
    renderer.set(grid, start, end);
    regenerate();
  };

  // draw walls with the mouse
  let drawing = false;
  let drawValue = true;
  const paint = (ev) => {
    const rect = canvas.getBoundingClientRect();
    const [r, c] = renderer.cellAt(ev.clientX - rect.left, ev.clientY - rect.top);
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS || isEndpoint(r, c)) return;
    setWall(grid, r, c, drawValue);
    renderer.draw();
  };
  canvas.addEventListener('mousedown', (ev) => {
    const rect = canvas.getBoundingClientRect();
    const [r, c] = renderer.cellAt(ev.clientX - rect.left, ev.clientY - rect.top);
    drawing = true;
    drawValue = !isWall(grid, r, c);
    paint(ev);
  });
  canvas.addEventListener('mousemove', (ev) => { if (drawing) paint(ev); });
  window.addEventListener('mouseup', () => { if (drawing) { drawing = false; regenerate(); } });

  regenerate();

  $('grid-maze').onclick = randomMaze;
  $('grid-clear').onclick = () => { grid = createGrid(ROWS, COLS); renderer.set(grid, start, end); regenerate(); };
  select.onchange = regenerate;
  speedEl.oninput = () => player.setSpeed(+speedEl.value);
  $('grid-step').onclick = () => { player.pause(); player.stepOnce(); $('grid-play').textContent = playLabel(false); };
  $('grid-reset').onclick = () => { player.load(player.steps); $('grid-play').textContent = playLabel(false); };
  $('grid-play').onclick = () => {
    if (player.playing) { player.pause(); }
    else { if (player.done) player.load(player.steps); player.play(); }
    $('grid-play').textContent = playLabel(player.playing);
  };
}

/* ------------------------------------------------------------- Big-O play */

function setupBigO() {
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
    ctx.strokeStyle = '#1f2937';
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
  localeRefreshers.push(renderReadout);
  update();
}

/* ------------------------------------------------------- Recursion stack */

function setupRecursion() {
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

  const player = new StepPlayer({
    onStep: (s) => {
      if (s.type === 'call') { stack.push({ k: s.k, memoHit: s.memoHit }); calls++; }
      else if (s.type === 'return') { stack.pop(); }
      renderStack(); setStatus(status, player); renderInfo();
    },
    onReset: () => { stack = []; calls = 0; renderStack(); setStatus(status, player); renderInfo(); },
    onDone: () => { setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+speedEl.value);

  const regenerate = () => {
    const entry = RECURSION[variantEl.value];
    nEl.max = String(entry.maxN);
    if (+nEl.value > entry.maxN) nEl.value = String(entry.maxN);
    $('rec-n-val').textContent = nEl.value;
    const steps = [...entry.gen(+nEl.value)];
    total = callCount(steps);
    player.load(steps); // triggers onReset
    $('rec-play').textContent = playLabel(false);
  };

  variantEl.onchange = regenerate;
  nEl.oninput = regenerate;
  speedEl.oninput = () => player.setSpeed(+speedEl.value);
  $('rec-step').onclick = () => { player.pause(); player.stepOnce(); $('rec-play').textContent = playLabel(false); };
  $('rec-reset').onclick = () => { player.load(player.steps); $('rec-play').textContent = playLabel(false); };
  $('rec-play').onclick = () => {
    if (player.playing) { player.pause(); }
    else { if (player.done) player.load(player.steps); player.play(); }
    $('rec-play').textContent = playLabel(player.playing);
  };

  localeRefreshers.push(() => {
    fillVariants();
    renderInfo();
    setStatus(status, player);
    $('rec-play').textContent = playLabel(player.playing);
  });

  regenerate();
}

/* --------------------------------------------------------- Event loop */

function setupEventLoop() {
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

  const player = new StepPlayer({
    onStep: (s) => { apply(s); render(); setStatus(status, player); },
    onReset: () => { stack = []; micro = []; macro = []; out = []; phase = ''; render(); setStatus(status, player); },
    onDone: () => { phase = ''; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+speedEl.value);

  const updateCode = () => { codeEl.innerHTML = highlight(scenarioById(select.value).code, 'js'); };
  const regenerate = () => {
    updateCode();
    player.load([...simulate(scenarioById(select.value).program)]);
    $('el-play').textContent = playLabel(false);
  };

  select.onchange = regenerate;
  speedEl.oninput = () => player.setSpeed(+speedEl.value);
  $('el-step').onclick = () => { player.pause(); player.stepOnce(); $('el-play').textContent = playLabel(false); };
  $('el-reset').onclick = () => { player.load(player.steps); $('el-play').textContent = playLabel(false); };
  $('el-play').onclick = () => {
    if (player.playing) { player.pause(); }
    else { if (player.done) player.load(player.steps); player.play(); }
    $('el-play').textContent = playLabel(player.playing);
  };
  localeRefreshers.push(() => { render(); setStatus(status, player); $('el-play').textContent = playLabel(player.playing); });

  regenerate();
}

/* ----------------------------------------------------- Data structures */

function setupDataStructures() {
  const structEl = $('ds-structure');
  const valueEl = $('ds-value');
  const view = $('ds-view');
  const info = $('ds-info');
  const addBtn = $('ds-add');
  const removeBtn = $('ds-remove');
  const inputLabel = $('ds-input-label');
  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));

  const fillStruct = () => {
    const keep = structEl.value;
    structEl.innerHTML = '';
    for (const id of STRUCTURES) {
      const o = document.createElement('option');
      o.value = id;
      o.textContent = t(`ds.${id}`);
      structEl.appendChild(o);
    }
    structEl.value = keep || 'stack';
  };
  fillStruct();

  let stack = new Stack();
  let queue = new Queue();
  let map = new HashMap(8);
  let hot = -1; // highlighted bucket
  const kind = () => structEl.value;

  const relabelControls = () => {
    if (kind() === 'stack') { addBtn.textContent = t('ds.push'); removeBtn.textContent = t('ds.pop'); removeBtn.hidden = false; inputLabel.textContent = t('ds.value'); }
    else if (kind() === 'queue') { addBtn.textContent = t('ds.enqueue'); removeBtn.textContent = t('ds.dequeue'); removeBtn.hidden = false; inputLabel.textContent = t('ds.value'); }
    else { addBtn.textContent = t('ds.set'); removeBtn.hidden = true; inputLabel.textContent = t('ds.key'); }
  };

  const render = () => {
    if (kind() === 'stack') {
      view.className = 'ds-view stack';
      view.innerHTML = stack.items.map((v) => `<div class="ds-cell">${esc(v)}</div>`).reverse().join('')
        || `<div class="ds-empty">${t('ds.empty')}</div>`;
    } else if (kind() === 'queue') {
      view.className = 'ds-view queue';
      view.innerHTML = queue.items.map((v) => `<div class="ds-cell">${esc(v)}</div>`).join('')
        || `<div class="ds-empty">${t('ds.empty')}</div>`;
    } else {
      view.className = 'ds-view hashmap';
      view.innerHTML = map.buckets.map((chain, i) =>
        `<div class="ds-bucket${i === hot ? ' hot' : ''}"><span class="ds-bi">${i}</span>` +
        chain.map((e) => `<span class="ds-entry">${esc(e.key)}</span>`).join('') +
        '</div>').join('');
    }
  };

  const nextVal = () => valueEl.value.trim() || String(Math.floor(Math.random() * 99) + 1);

  const add = () => {
    const v = nextVal();
    if (kind() === 'stack') { stack.push(v); hot = -1; info.textContent = `${t('ds.push')} ${v}`; }
    else if (kind() === 'queue') { queue.enqueue(v); info.textContent = `${t('ds.enqueue')} ${v}`; }
    else {
      const r = map.set(v);
      hot = r.index;
      let msg = `"${v}" → ${t('ds.bucket')} ${r.index}`;
      if (r.collision) msg += ` · ${t('ds.collision')}`;
      if (r.resized) msg += ` · ${t('ds.resized')(map.nBuckets)}`;
      msg += ` · ${t('ds.load')(map.loadFactor().toFixed(2))}`;
      info.textContent = msg;
    }
    valueEl.value = '';
    render();
  };

  const remove = () => {
    if (kind() === 'stack') { const v = stack.pop(); info.textContent = v !== undefined ? `${t('ds.pop')} ${v}` : t('ds.empty'); }
    else if (kind() === 'queue') { const v = queue.dequeue(); info.textContent = v !== undefined ? `${t('ds.dequeue')} ${v}` : t('ds.empty'); }
    render();
  };

  const clear = () => { stack = new Stack(); queue = new Queue(); map = new HashMap(8); hot = -1; info.textContent = ''; render(); };

  addBtn.onclick = add;
  removeBtn.onclick = remove;
  $('ds-clear').onclick = clear;
  valueEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
  structEl.onchange = () => { relabelControls(); info.textContent = ''; render(); };
  localeRefreshers.push(() => { const keep = structEl.value; fillStruct(); structEl.value = keep; relabelControls(); render(); });

  relabelControls();
  render();
}

/* --------------------------------------------------- Value vs reference */

function setupValueRef() {
  const select = $('vr-scenario');
  const varsEl = $('vr-vars');
  const heapEl = $('vr-heap');
  const status = $('vr-status');
  const codeEl = $('vr-code');
  for (const s of VALUEREF_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let vars = {}, heap = {}, hotVar = '', hotObj = -1;
  const render = () => {
    varsEl.innerHTML = Object.entries(vars).map(([name, v]) =>
      v.kind === 'value'
        ? `<div class="vr-var${name === hotVar ? ' hot' : ''}">${esc(name)} = <b>${esc(v.value)}</b></div>`
        : `<div class="vr-var${name === hotVar ? ' hot' : ''}">${esc(name)} → <span class="vr-ref">#${v.objId}</span></div>`).join('')
      || `<div class="ds-empty">—</div>`;
    heapEl.innerHTML = Object.entries(heap).map(([id, obj]) =>
      `<div class="vr-obj${+id === hotObj ? ' hot' : ''}"><span class="ds-bi">#${id}</span> { ` +
      Object.entries(obj).map(([k, val]) => `${esc(k)}: <b>${esc(val)}</b>`).join(', ') + ' }</div>').join('')
      || `<div class="ds-empty">—</div>`;
  };
  const apply = (s) => {
    hotVar = ''; hotObj = -1;
    if (s.type === 'declVal') { vars[s.name] = { kind: 'value', value: s.value }; hotVar = s.name; }
    else if (s.type === 'declObj') { heap[s.objId] = { ...s.obj }; vars[s.name] = { kind: 'ref', objId: s.objId }; hotVar = s.name; hotObj = s.objId; }
    else if (s.type === 'copyVal') { vars[s.dst] = { kind: 'value', value: s.value }; hotVar = s.dst; }
    else if (s.type === 'copyRef') { vars[s.dst] = { kind: 'ref', objId: s.objId }; hotVar = s.dst; hotObj = s.objId; }
    else if (s.type === 'setVal') { vars[s.name] = { kind: 'value', value: s.value }; hotVar = s.name; }
    else if (s.type === 'mutate') { heap[s.objId][s.field] = s.value; hotObj = s.objId; }
    render();
  };
  const player = new StepPlayer({
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { vars = {}; heap = {}; hotVar = ''; hotObj = -1; render(); setStatus(status, player); },
    onDone: () => { hotVar = ''; hotObj = -1; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(16);
  const updateCode = () => { codeEl.innerHTML = highlight(vrScenarioById(select.value).code, 'js'); };
  const regenerate = () => { updateCode(); player.load([...vrSimulate(vrScenarioById(select.value).ops)]); $('vr-play').textContent = playLabel(false); };
  select.onchange = regenerate;
  $('vr-step').onclick = () => { player.pause(); player.stepOnce(); $('vr-play').textContent = playLabel(false); };
  $('vr-reset').onclick = () => { player.load(player.steps); $('vr-play').textContent = playLabel(false); };
  $('vr-play').onclick = () => {
    if (player.playing) { player.pause(); } else { if (player.done) player.load(player.steps); player.play(); }
    $('vr-play').textContent = playLabel(player.playing);
  };
  localeRefreshers.push(() => { render(); setStatus(status, player); $('vr-play').textContent = playLabel(player.playing); });
  regenerate();
}

/* ----------------------------------------------------------- Swift / Combine */

function setupSwift() {
  const select = $('sw-scenario');
  const speedEl = $('sw-speed');
  const pipeEl = $('sw-pipeline');
  const recvEl = $('sw-received');
  const status = $('sw-status');
  const codeEl = $('sw-code');
  for (const s of COMBINE_SCENARIOS) {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.id; select.appendChild(o);
  }

  const esc = (v) => String(v).replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'));
  let stages = [], active = -1, current = null, received = [], dropped = false;
  const render = () => {
    pipeEl.innerHTML = stages.map((st, i) =>
      `<div class="sw-stage${i === active ? ' hot' : ''}">` +
      `<div class="sw-kind">${esc(st.kind)}</div><div class="sw-label">${esc(st.label)}</div>` +
      (i === active && current != null ? `<div class="sw-token${dropped ? ' dropped' : ''}">${esc(current)}</div>` : '') +
      `</div>`).join('<div class="sw-arrow">→</div>');
    recvEl.innerHTML = received.map((v) => `<div class="el-log">${esc(v)}</div>`).join('');
  };
  const apply = (s) => {
    dropped = false;
    if (s.type === 'emit') { active = 0; current = s.value; }
    else if (s.type === 'map') { active = s.stage + 1; current = s.to; }
    else if (s.type === 'filter') { active = s.stage + 1; current = s.value; }
    else if (s.type === 'drop') { active = s.stage + 1; current = s.value; dropped = true; }
    else if (s.type === 'sink') { active = stages.length - 1; current = s.value; received.push(s.value); }
    render();
  };
  const player = new StepPlayer({
    onStep: (s) => { apply(s); setStatus(status, player); },
    onReset: () => { active = -1; current = null; received = []; dropped = false; render(); setStatus(status, player); },
    onDone: () => { active = -1; current = null; render(); setStatus(status, player, t('status.done')); },
  });
  player.setSpeed(+speedEl.value);
  const updateCode = () => { codeEl.innerHTML = highlight(combineScenarioById(select.value).code, 'swift'); };
  const regenerate = () => {
    const sc = combineScenarioById(select.value);
    stages = stagesOf(sc.operators);
    updateCode();
    player.load([...cbSimulate(sc.source, sc.operators)]);
    $('sw-play').textContent = playLabel(false);
    render();
  };
  select.onchange = regenerate;
  speedEl.oninput = () => player.setSpeed(+speedEl.value);
  $('sw-step').onclick = () => { player.pause(); player.stepOnce(); $('sw-play').textContent = playLabel(false); };
  $('sw-reset').onclick = () => { player.load(player.steps); $('sw-play').textContent = playLabel(false); };
  $('sw-play').onclick = () => {
    if (player.playing) { player.pause(); } else { if (player.done) player.load(player.steps); player.play(); }
    $('sw-play').textContent = playLabel(player.playing);
  };
  localeRefreshers.push(() => { render(); setStatus(status, player); $('sw-play').textContent = playLabel(player.playing); });
  regenerate();
}

/* ----------------------------------------------------------------- tabs */

function setupTabs() {
  const tabs = [...document.querySelectorAll('.tab')];
  const panels = [...document.querySelectorAll('.panel')];
  const show = (mode) => {
    for (const t of tabs) t.classList.toggle('active', t.dataset.mode === mode);
    for (const p of panels) p.hidden = p.id !== `panel-${mode}`;
  };
  for (const tab of tabs) tab.onclick = () => show(tab.dataset.mode);
}

setupLocale();
setupTabs();
setupSorting();
setupPathfinding();
setupBigO();
setupRecursion();
setupEventLoop();
setupDataStructures();
setupValueRef();
setupSwift();
applyStaticI18n();
