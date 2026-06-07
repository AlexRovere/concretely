<script setup>
import TracePanel from './TracePanel.vue';
import { JAVABASICS_SCENARIOS } from '@/javabasics.js';
</script>

<template>
  <TracePanel :scenarios="JAVABASICS_SCENARIOS" lang="js" label="Java" note-key="jvb.note" />
</template>
