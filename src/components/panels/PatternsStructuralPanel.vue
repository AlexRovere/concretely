<script setup>
import PatternsPanel from './PatternsPanel.vue';
const props = defineProps({ cat: { type: String, default: 'patterns' }, query: { type: String, default: '' } });
</script>
<template>
  <PatternsPanel family="structural" :cat="cat" :query="query" />
</template>
