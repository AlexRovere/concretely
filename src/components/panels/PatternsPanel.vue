<script setup>
import { ref, computed, watch } from 'vue';
import { patternsByFamily } from '@/patterns.js';
import { highlight } from '@/highlight.js';
import { useI18n } from '@/composables/useI18n';
import { useCodeLang } from '@/composables/useCodeLang';

// Fiche de référence d'une famille de design patterns. `family` vient d'un
// wrapper court (un par famille), `query` est semé par la palette Ctrl+K.
const props = defineProps({
  family: { type: String, required: true },
  cat: { type: String, default: 'patterns' },
  query: { type: String, default: '' },
});

const { t, locale } = useI18n();
const { currentLang, LANGUAGES } = useCodeLang();
const L = (v) => v?.[locale.value] ?? v?.fr ?? '';

const list = computed(() => patternsByFamily(props.family));
const selectedId = ref(list.value[0]?.id ?? '');
const selected = computed(() => list.value.find((p) => p.id === selectedId.value) ?? list.value[0]);

// La palette peut viser un pattern précis (nom -> sélection).
watch(() => props.query, (q) => {
  if (!q) return;
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const hit = list.value.find((p) => norm(`${p.name.fr} ${p.name.en}`).includes(norm(q)));
  if (hit) selectedId.value = hit.id;
});
</script>

<template>
  <section class="panel patterns-panel">
    <div class="controls">
      <div class="pat-pills">
        <button
          v-for="p in list"
          :key="p.id"
          class="pat-pill"
          :class="{ active: p.id === selectedId }"
          @click="selectedId = p.id"
        >{{ L(p.name) }}</button>
      </div>
    </div>

    <article v-if="selected" class="pat-card">
      <h2 class="pat-name">{{ L(selected.name) }}</h2>
      <p class="pat-tagline">{{ L(selected.tagline) }}</p>

      <div class="pat-fields">
        <div><h3>{{ t('pat.problem') }}</h3><p>{{ L(selected.problem) }}</p></div>
        <div><h3>{{ t('pat.solution') }}</h3><p>{{ L(selected.solution) }}</p></div>
        <div><h3>{{ t('pat.when') }}</h3><p>{{ L(selected.when) }}</p></div>
        <div><h3>{{ t('pat.pitfalls') }}</h3><p>{{ L(selected.pitfalls) }}</p></div>
      </div>

      <div class="code-box">
        <div class="code-head">
          <span>{{ t('pat.pseudo') }}</span>
        </div>
        <pre class="cs-code"><code v-html="highlight(selected.pseudo, 'js')"></code></pre>
      </div>

      <div class="code-box">
        <div class="code-head">
          <span>{{ t('pat.code') }}</span>
          <select v-model="currentLang" class="lang-select" :aria-label="t('pat.code')">
            <option v-for="l in LANGUAGES" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>
        </div>
        <pre class="cs-code"><code v-html="highlight(selected.code[currentLang], currentLang)"></code></pre>
      </div>
    </article>
  </section>
</template>
