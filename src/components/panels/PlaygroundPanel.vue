<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { playgroundFor } from '@/playground/samples.js';
import { runJs } from '@/playground/runjs.js';
import { parseGitCommands, runGitOps, renderDagSvg } from '@/playground/gitrepl.js';
import { useI18n } from '@/composables/useI18n';

const props = defineProps({
  cat: { type: String, default: 'js' },
  query: { type: String, default: '' }, // unused (cheatsheet seed) — declared to swallow the prop
});
const { t, tf } = useI18n();

// The playground follows the app category; swift has no engine (no tab).
const conf = computed(() => playgroundFor(props.cat) ?? playgroundFor('js'));
const engine = computed(() => conf.value.engine);

const editorEl = ref(null);
const logs = ref([]);
const running = ref(false);
const loading = ref(false); // a heavy engine chunk (ruby.wasm, typescript) is downloading
const dagSvg = ref('');
const vueSrc = ref(null); // { id, srcdoc }
let editor = null;
const docs = new Map(); // per-category buffer, survives category switches

function run() {
  if (!editor || running.value) return;
  const code = editor.getCode();
  logs.value = [];
  if (engine.value === 'git') return runGit(code);
  if (engine.value === 'vue') return runVue(code);
  runText(code);
}

async function runText(code) {
  running.value = true;
  try {
    if (engine.value === 'js') {
      const { logs: out, timedOut } = await runJs(code);
      logs.value = out;
      if (timedOut) logs.value.push({ kind: 'crash', text: t('pg.timeout') });
    } else if (engine.value === 'ts') {
      const { runTs } = await import('@/playground/runts.js');
      const { logs: out, timedOut, netError } = await runTs(code, { onLoading: () => { loading.value = true; } });
      logs.value = out;
      if (timedOut) logs.value.push({ kind: 'crash', text: t('pg.timeout') });
      if (netError) logs.value.push({ kind: 'crash', text: t('pg.netError') });
    } else if (engine.value === 'ruby') {
      const { runRuby } = await import('@/playground/runruby.js');
      const { logs: out } = await runRuby(code, { onLoading: () => { loading.value = true; } });
      logs.value = out;
    } else if (engine.value === 'kotlin') {
      const { runKotlin } = await import('@/playground/runkotlin.js');
      const { logs: out, netError } = await runKotlin(code);
      logs.value = out;
      if (netError) logs.value.push({ kind: 'crash', text: t('pg.netError') });
    } else if (engine.value === 'go') {
      const { runGo } = await import('@/playground/rungo.js');
      const { logs: out, netError } = await runGo(code);
      logs.value = out;
      if (netError) logs.value.push({ kind: 'crash', text: t('pg.netError') });
    } else if (engine.value === 'rust') {
      const { runRust } = await import('@/playground/runrust.js');
      const { logs: out, netError } = await runRust(code);
      logs.value = out;
      if (netError) logs.value.push({ kind: 'crash', text: t('pg.netError') });
    }
  } finally {
    running.value = false;
    loading.value = false;
  }
}

function runGit(code) {
  const { ops, errors } = parseGitCommands(code);
  const state = runGitOps(ops);
  dagSvg.value = renderDagSvg(state);
  logs.value = [
    ...state.events.map((e) => ({ kind: 'log', text: e })),
    ...errors.map((e) => ({ kind: 'crash', text: tf('pg.gitBad', e.line, e.text) })),
  ];
}

async function runVue(code) {
  running.value = true;
  const { vueSrcdoc } = await import('@/playground/runvue.js');
  vueSrc.value = vueSrcdoc(code);
  running.value = false;
}

// Console messages relayed from the Vue preview iframe.
function onMessage(e) {
  if (!vueSrc.value || e.data?.pg !== vueSrc.value.id) return;
  if (e.data.kind !== 'done') logs.value.push({ kind: e.data.kind, text: e.data.text });
}

function resetSample() {
  editor?.setCode(conf.value.sample);
  clearOutput();
}
function clearOutput() {
  logs.value = [];
  dagSvg.value = '';
  vueSrc.value = null;
}

onMounted(async () => {
  const { createEditor } = await import('@/playground/editor.js');
  editor = createEditor({
    parent: editorEl.value,
    doc: conf.value.sample,
    lang: conf.value.lang,
    onRun: run,
  });
  window.addEventListener('message', onMessage);
});

watch(() => props.cat, (cat, prev) => {
  if (!editor) return;
  docs.set(prev, editor.getCode());
  const c = playgroundFor(cat) ?? playgroundFor('js');
  editor.setCode(docs.get(cat) ?? c.sample);
  editor.setLang(c.lang);
  clearOutput();
});

onUnmounted(() => {
  window.removeEventListener('message', onMessage);
  editor?.destroy();
});
</script>

<template>
  <section class="panel">
    <div class="controls pg-controls">
      <button class="primary" :disabled="running" @click="run">
        {{ running ? t('pg.running') : t('pg.run') }}
      </button>
      <button @click="resetSample">{{ t('pg.sample') }}</button>
      <button @click="clearOutput">{{ t('pg.clear') }}</button>
      <span class="el-phase pg-engine">{{ t('pg.engine.' + engine) }}</span>
    </div>

    <div ref="editorEl" class="pg-editor"></div>

    <p v-if="loading" class="pg-loading">{{ t(engine === 'ruby' ? 'pg.rubyLoading' : 'pg.tsLoading') }}</p>

    <template v-if="engine === 'vue'">
      <h3 class="rec-h">{{ t('pg.preview') }}</h3>
      <iframe
        v-if="vueSrc"
        :key="vueSrc.id"
        class="pg-preview"
        sandbox="allow-scripts allow-same-origin"
        :srcdoc="vueSrc.srcdoc"
      ></iframe>
      <p v-else class="hint">{{ t('pg.vueHint') }}</p>
    </template>

    <template v-if="engine === 'git'">
      <h3 class="rec-h">{{ t('gd.graph') }}</h3>
      <div class="gd-wrap pg-dag" v-html="dagSvg"></div>
    </template>

    <h3 class="rec-h">{{ t('pg.console') }}</h3>
    <div class="pg-console">
      <div v-for="(l, i) in logs" :key="i" class="pg-line" :class="'pg-' + l.kind">{{ l.text }}</div>
      <p v-if="logs.length === 0" class="ds-empty">{{ t('pg.empty') }}</p>
    </div>

    <p class="hint">{{ t('pg.note.' + engine) }}</p>
  </section>
</template>
