<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { createEditor } from '@/playground/editor.js';
import { createKernel } from '@/playground/runNotebook.js';
import { renderMarkdown } from '@/notebooks/markdown.js';
import { NOTEBOOKS, notebookById } from '@/notebooks/index.js';
import { useI18n } from '@/composables/useI18n';

const { t, locale } = useI18n();
const root = ref(null);

let uid = 0;
const storageKey = (id) => `nb.${id}`;

function makeCells(src) {
  return src.map((c) => ({
    key: uid++,
    type: c.type,
    source: c.source,
    html: c.type === 'markdown' ? renderMarkdown(c.source) : '',
    editing: c.type === 'markdown' && !c.source,
    running: false,
    outputs: null,
  }));
}

// Restaure depuis localStorage (édits utilisateur) ou l'original.
function restore(id) {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (raw) {
      const parsed = JSON.parse(raw);
      const ok = Array.isArray(parsed) && parsed.every(
        (c) => (c.type === 'code' || c.type === 'markdown') && typeof c.source === 'string',
      );
      if (ok) return makeCells(parsed);
    }
  } catch {
    /* JSON invalide : on retombe sur l'original */
  }
  return makeCells(notebookById(id).cells);
}

const currentId = ref(NOTEBOOKS[0].id);
const cells = ref(restore(currentId.value));
const loading = ref(false);
const busy = ref(false);

let kernel = null;
const cellEls = new Map(); // cell.key → élément hôte
const editors = new Map(); // cell.key → éditeur

function registerEl(key, el) {
  if (el) cellEls.set(key, el);
  else cellEls.delete(key);
}

// Monte les éditeurs manquants, détruit ceux des cellules disparues.
function syncEditors() {
  for (const cell of cells.value) {
    if (cell.type !== 'code' || editors.has(cell.key)) continue;
    const el = cellEls.get(cell.key);
    if (el) editors.set(cell.key, createEditor({ parent: el, doc: cell.source, lang: 'python', onRun: () => runCell(cell) }));
  }
  for (const [key, ed] of [...editors]) {
    if (!cells.value.some((c) => c.key === key)) { ed.destroy(); editors.delete(key); }
  }
}

function snapshot() {
  return cells.value.map((c) => ({
    type: c.type,
    source: c.type === 'code' ? (editors.get(c.key)?.getCode() ?? c.source) : c.source,
  }));
}
function persist() {
  try { localStorage.setItem(storageKey(currentId.value), JSON.stringify(snapshot())); } catch { /* quota */ }
}

function loadNotebook(id) {
  if (id === currentId.value) return;
  persist(); // sauve le notebook courant avant de le quitter
  editors.forEach((e) => e.destroy());
  editors.clear();
  cellEls.clear();
  currentId.value = id;
  cells.value = restore(id);
  nextTick(syncEditors);
}

function resetNotebook() {
  try { localStorage.removeItem(storageKey(currentId.value)); } catch { /* ignore */ }
  editors.forEach((e) => e.destroy());
  editors.clear();
  cellEls.clear();
  cells.value = makeCells(notebookById(currentId.value).cells);
  nextTick(syncEditors);
}

onMounted(() => {
  kernel = createKernel();
  syncEditors();
});
onUnmounted(() => {
  editors.forEach((e) => e.destroy());
  editors.clear();
});

async function runCell(cell) {
  const editor = editors.get(cell.key);
  if (!editor || busy.value) return;
  cell.source = editor.getCode();
  cell.running = true;
  busy.value = true;
  try {
    const { outputs } = await kernel.run(cell.source, { onLoading: () => { loading.value = true; } });
    cell.outputs = outputs;
  } finally {
    loading.value = false;
    cell.running = false;
    busy.value = false;
  }
  persist();
}

async function runAll() {
  if (busy.value) return;
  for (const cell of cells.value) {
    if (cell.type === 'code') await runCell(cell); // séquentiel : l'état dépend de l'ordre
  }
}

function restart() {
  kernel?.reset();
  for (const cell of cells.value) cell.outputs = null;
}

function addCell(type) {
  cells.value.push(makeCells([{ type, source: '' }])[0]);
  nextTick(syncEditors);
  persist();
}
function deleteCell(key) {
  editors.get(key)?.destroy();
  editors.delete(key);
  cells.value = cells.value.filter((c) => c.key !== key);
  persist();
}

function editMarkdown(cell) { cell.editing = true; }
function commitMarkdown(cell) {
  cell.editing = false;
  cell.html = renderMarkdown(cell.source);
  persist();
}
</script>

<template>
  <section ref="root" class="panel nb">
    <div class="controls nb-toolbar">
      <label><span>{{ t('nb.notebook') }}</span>
        <select :value="currentId" @change="loadNotebook($event.target.value)">
          <option v-for="n in NOTEBOOKS" :key="n.id" :value="n.id">{{ n.title[locale] ?? n.title.en }}</option>
        </select>
      </label>
      <button class="primary" :disabled="busy" @click="runAll">▶▶ {{ t('nb.runAll') }}</button>
      <button :disabled="busy" @click="restart">⟳ {{ t('nb.restart') }}</button>
      <button :disabled="busy" @click="resetNotebook">↺ {{ t('nb.reset') }}</button>
      <span v-if="loading" class="nb-loading">{{ t('nb.loading') }}</span>
    </div>

    <div
      v-for="cell in cells"
      :key="cell.key"
      class="nb-cell"
      :class="{ ['nb-' + cell.type]: true }"
    >
      <button class="nb-del" :aria-label="t('nb.delete')" @click="deleteCell(cell.key)">✕</button>

      <template v-if="cell.type === 'markdown'">
        <textarea
          v-if="cell.editing"
          v-model="cell.source"
          class="nb-md-edit"
          rows="4"
          @blur="commitMarkdown(cell)"
        ></textarea>
        <!-- eslint-disable-next-line vue/no-v-html -- markdown déjà échappé + whitelisté par renderMarkdown -->
        <div v-else class="nb-md" @click="editMarkdown(cell)" v-html="cell.html"></div>
      </template>

      <template v-else>
        <div class="nb-code-row">
          <button class="nb-run" :disabled="busy" :title="t('nb.run')" @click="runCell(cell)">
            {{ cell.running ? '…' : '▶' }}
          </button>
          <div :ref="(el) => registerEl(cell.key, el)" class="nb-editor"></div>
        </div>
        <div v-if="cell.outputs && cell.outputs.length" class="nb-outputs">
          <template v-for="(out, oi) in cell.outputs" :key="oi">
            <pre v-if="out.type === 'stream'" class="nb-out" :class="{ 'nb-err': out.stream === 'stderr' }">{{ out.text }}</pre>
            <pre v-else-if="out.type === 'error'" class="nb-out nb-err">{{ out.text }}</pre>
            <!-- eslint-disable-next-line vue/no-v-html -- sortie pandas locale de confiance (noyau Pyodide, exécution client) -->
            <div v-else-if="out.type === 'html'" class="nb-out-html" v-html="out.html"></div>
            <img v-else-if="out.type === 'image'" class="nb-out-img" :src="'data:image/png;base64,' + out.png" alt="figure" />
          </template>
        </div>
      </template>
    </div>

    <div class="nb-add">
      <button @click="addCell('code')">+ {{ t('nb.addCode') }}</button>
      <button @click="addCell('markdown')">+ {{ t('nb.addMd') }}</button>
    </div>
    <p class="hint">{{ t('nb.hint') }}</p>
  </section>
</template>
