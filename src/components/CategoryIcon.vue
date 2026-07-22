<script setup>
import { computed } from 'vue';
import { CATEGORY_META } from '@/categoryMeta.js';
import { CATEGORY_SVG } from '@/categoryIcons.js';

const props = defineProps({ cat: { type: String, required: true } });
// Logo de marque si dispo, sinon l'emoji de la catégorie (concepts).
const svg = computed(() => CATEGORY_SVG[props.cat] ?? null);
const emoji = computed(() => CATEGORY_META[props.cat]?.icon ?? '');
</script>

<template>
  <span class="cat-logo" aria-hidden="true">
    <!-- SVG local et de confiance (assets embarqués), pas de contenu utilisateur -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span v-if="svg" class="cat-logo-svg" v-html="svg"></span>
    <template v-else>{{ emoji }}</template>
  </span>
</template>
