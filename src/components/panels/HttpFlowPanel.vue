<script setup>
import TracePanel from './TracePanel.vue';
import { HTTPFLOW_SCENARIOS } from '@/httpflow.js';
</script>

<template>
  <TracePanel :scenarios="HTTPFLOW_SCENARIOS" lang="bash" label="HTTP" note-key="hfl.note" />
</template>
