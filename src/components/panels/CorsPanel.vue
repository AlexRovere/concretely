<script setup>
import TracePanel from './TracePanel.vue';
import { CORS_SCENARIOS } from '@/cors.js';
</script>

<template>
  <TracePanel :scenarios="CORS_SCENARIOS" lang="bash" label="CORS" note-key="crs.note" />
</template>
