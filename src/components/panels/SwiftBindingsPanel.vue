<script setup>
import CompareTablePanel from './CompareTablePanel.vue';
defineProps({ cat: { type: String, default: 'swift' }, query: { type: String, default: '' } });
</script>
<template>
  <CompareTablePanel id="bindings" :cat="cat" :query="query" />
</template>
