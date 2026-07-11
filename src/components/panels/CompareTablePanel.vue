<script setup>
import { computed } from 'vue';
import { comparisonFor } from '@/swiftcompare.js';
import { highlight } from '@/highlight.js';
import { useI18n } from '@/composables/useI18n';

// Tableau comparatif générique (dimensions x candidats) + code de référence.
// `id` vient d'un wrapper court (un par comparaison).
const props = defineProps({
  id: { type: String, required: true },
  cat: { type: String, default: 'swift' },
  query: { type: String, default: '' },
});

const { t, locale } = useI18n();
const L = (v) => v?.[locale.value] ?? v?.fr ?? '';

const cmp = computed(() => comparisonFor(props.id));
</script>

<template>
  <section v-if="cmp" class="panel cmp-panel">
    <p class="cmp-intro">{{ L(cmp.intro) }}</p>

    <div class="cmp-scroll">
      <table class="cmp-table">
        <thead>
          <tr>
            <th></th>
            <th v-for="c in cmp.candidates" :key="c.id" scope="col" class="cmp-cand">{{ c.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in cmp.dimensions" :key="d.id">
            <th scope="row" class="cmp-dim">{{ L(d.label) }}</th>
            <td v-for="c in cmp.candidates" :key="c.id">{{ L(d.cells[c.id]) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="cmp-h">{{ t('cmp.code') }}</h3>
    <div class="cmp-cards">
      <article v-for="c in cmp.candidates" :key="c.id" class="cmp-card">
        <header class="cmp-card-head"><code>{{ c.label }}</code></header>
        <pre class="cmp-code"><code v-html="highlight(c.code, 'swift')"></code></pre>
        <p class="cmp-when"><b>{{ t('cmp.when') }} :</b> {{ L(c.when) }}</p>
      </article>
    </div>

    <h3 class="cmp-h">{{ t('cmp.notes') }}</h3>
    <ul class="cmp-notes">
      <li v-for="(n, i) in cmp.notes" :key="i">{{ L(n) }}</li>
    </ul>
  </section>
</template>
