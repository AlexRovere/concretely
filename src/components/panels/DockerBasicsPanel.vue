<script setup>
import TracePanel from './TracePanel.vue';
import { DOCKERBASICS_SCENARIOS } from '@/dockerbasics.js';
</script>

<template>
  <TracePanel :scenarios="DOCKERBASICS_SCENARIOS" lang="bash" label="Docker" note-key="dkb.note" />
</template>
