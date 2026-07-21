<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createEditor } from '@/playground/editor.js';
import { createKernel } from '@/playground/runNotebook.js';
import { renderMarkdown } from '@/notebooks/markdown.js';
import { notebookById } from '@/notebooks/index.js';
import { useI18n } from '@/composables/useI18n';

const { t } = useI18n();
const root = ref(null);

// N2 : notebook unique (« Régression linéaire »). Sélecteur multi + persistance en N3.
const nb = notebookById('regression');
const cells = ref(
  nb.cells.map((c, i) => ({
    key: i,
    type: c.type,
    source: c.source,
    html: c.type === 'markdown' ? renderMarkdown(c.source) : '',
    editing: false,
    running: false,
    outputs: null,
  })),
);

const loading = ref(false); // téléchargement Pyodide/packages au 1er run
const busy = ref(false);
let kernel = null;
const cellEls = new Map(); // idx → élément hôte de l'éditeur
const editors = new Map(); // idx → éditeur CodeMirror

function registerEl(idx, el) {
  if (el) cellEls.set(idx, el);
  else cellEls.delete(idx);
}

onMounted(() => {
  kernel = createKernel();
  cells.value.forEach((cell, idx) => {
    if (cell.type !== 'code') return;
    const parent = cellEls.get(idx);
    if (!parent) return;
    editors.set(
      idx,
      createEditor({ parent, doc: cell.source, lang: 'python', onRun: () => runCell(idx) }),
    );
  });
});

onUnmounted(() => {
  editors.forEach((e) => e.destroy());
  editors.clear();
});

async function runCell(idx) {
  const cell = cells.value[idx];
  const editor = editors.get(idx);
  if (!cell || !editor || busy.value) return;
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
}

async function runAll() {
  if (busy.value) return;
  for (let idx = 0; idx < cells.value.length; idx += 1) {
    if (cells.value[idx].type === 'code') await runCell(idx); // séquentiel : l'état dépend de l'ordre
  }
}

function restart() {
  kernel?.reset();
  for (const cell of cells.value) cell.outputs = null;
}

function editMarkdown(idx) {
  cells.value[idx].editing = true;
}
function commitMarkdown(idx) {
  const cell = cells.value[idx];
  cell.editing = false;
  cell.html = renderMarkdown(cell.source);
}
</script>

<template>
  <section ref="root" class="panel nb">
    <h2 class="panel-title">{{ t('tabs.mlnotebook') }} — {{ nb.title.fr }}</h2>
    <div class="controls nb-toolbar">
      <button class="primary" :disabled="busy" @click="runAll">▶▶ {{ t('nb.runAll') }}</button>
      <button :disabled="busy" @click="restart">⟳ {{ t('nb.restart') }}</button>
      <span v-if="loading" class="nb-loading">{{ t('nb.loading') }}</span>
    </div>

    <div
      v-for="(cell, idx) in cells"
      :key="cell.key"
      class="nb-cell"
      :class="{ ['nb-' + cell.type]: true }"
    >
      <!-- Markdown : rendu, clic pour éditer -->
      <template v-if="cell.type === 'markdown'">
        <textarea
          v-if="cell.editing"
          v-model="cell.source"
          class="nb-md-edit"
          rows="4"
          @blur="commitMarkdown(idx)"
        ></textarea>
        <!-- eslint-disable-next-line vue/no-v-html -- markdown déjà échappé + whitelisté par renderMarkdown -->
        <div v-else class="nb-md" @click="editMarkdown(idx)" v-html="cell.html"></div>
      </template>

      <!-- Code : éditeur + run + sorties -->
      <template v-else>
        <div class="nb-code-row">
          <button class="nb-run" :disabled="busy" :title="t('nb.run')" @click="runCell(idx)">
            {{ cell.running ? '…' : '▶' }}
          </button>
          <div :ref="(el) => registerEl(idx, el)" class="nb-editor"></div>
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

    <p class="hint">{{ t('nb.hint') }}</p>
  </section>
</template>
