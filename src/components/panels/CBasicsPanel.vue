<script setup>
import TracePanel from './TracePanel.vue';
import { CBASICS_SCENARIOS } from '@/cbasics.js';
</script>

<template>
  <TracePanel :scenarios="CBASICS_SCENARIOS" lang="js" label="C" note-key="cb.note" />
</template>
