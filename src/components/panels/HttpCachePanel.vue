<script setup>
import TracePanel from './TracePanel.vue';
import { HTTPCACHE_SCENARIOS } from '@/httpcache.js';
</script>

<template>
  <TracePanel :scenarios="HTTPCACHE_SCENARIOS" lang="bash" label="Cache HTTP" note-key="hca.note" />
</template>
