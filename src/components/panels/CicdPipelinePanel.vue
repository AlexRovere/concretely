<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createEditor } from '@/playground/editor.js';
import { parseYaml } from '@/pipeline/yaml.js';
import { gitlabModel, githubModel } from '@/pipeline/model.js';
import { layout } from '@/pipeline/layout.js';
import { renderPipelineSvg } from '@/render/pipelineSvg.js';
import { PIPELINE_SAMPLES } from '@/pipeline/samples.js';
import { useI18n } from '@/composables/useI18n';

const { t } = useI18n();
const root = ref(null);
const format = ref('gitlab');
const svg = ref('');
const error = ref('');
let editor = null;
let timer = null;

// Recalcule le graphe depuis le YAML courant (garde le dernier graphe valide en cas d'erreur).
function refresh() {
  const parsed = parseYaml(editor.getCode());
  if (parsed.error) {
    error.value = t('pl.error')({ line: parsed.error.line, message: parsed.error.message });
    return;
  }
  const model = format.value === 'gitlab' ? gitlabModel(parsed.value) : githubModel(parsed.value);
  error.value = model.errors.length ? model.errors.join(' · ') : '';
  const laidOut = layout(model);
  const headers = format.value === 'gitlab'
    ? model.stages
    : Array.from({ length: laidOut.cols }, (_, i) => t('pl.level')(i + 1));
  svg.value = renderPipelineSvg(laidOut, { headers });
}

// Léger debounce : redessine ~150 ms après la dernière frappe.
function scheduleRefresh() {
  clearTimeout(timer);
  timer = setTimeout(refresh, 150);
}

function loadSample() {
  editor.setCode(PIPELINE_SAMPLES[format.value]);
  refresh();
}

function setFormat(f) {
  if (f === format.value) return;
  format.value = f;
  loadSample();
}

onMounted(() => {
  const parent = root.value.querySelector('#pl-editor');
  editor = createEditor({ parent, doc: PIPELINE_SAMPLES.gitlab, lang: 'yaml', onRun: refresh });
  editor.view.dom.addEventListener('keyup', scheduleRefresh);
  refresh();
});

onUnmounted(() => {
  clearTimeout(timer);
  editor?.destroy();
});
</script>

<template>
  <section ref="root" class="panel">
    <h2 class="panel-title">{{ t('tabs.cicdpipeline') }}</h2>
    <div class="controls pl-toolbar">
      <div class="seg">
        <button :class="{ on: format === 'gitlab' }" @click="setFormat('gitlab')">GitLab CI</button>
        <button :class="{ on: format === 'github' }" @click="setFormat('github')">GitHub Actions</button>
      </div>
      <button @click="loadSample">{{ t('pl.sample') }}</button>
    </div>

    <div class="pl-split">
      <div id="pl-editor" class="pl-editor"></div>
      <div class="pl-graph">
        <p v-if="error" class="pl-err">{{ error }}</p>
        <!-- eslint-disable-next-line vue/no-v-html -- SVG construit localement par renderPipelineSvg (aucune entrée HTML) -->
        <div class="pl-graph-svg" v-html="svg"></div>
      </div>
    </div>

    <p class="hint">{{ t('pl.hint') }}</p>
  </section>
</template>
