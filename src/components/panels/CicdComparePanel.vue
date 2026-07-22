<script setup>
import CompareTablePanel from './CompareTablePanel.vue';
import { CICD_COMPARISON } from '@/cicdcompare.js';
defineProps({ cat: { type: String, default: 'cicd' }, query: { type: String, default: '' } });
</script>
<template>
  <CompareTablePanel :data="CICD_COMPARISON" :cat="cat" :query="query" />
</template>
