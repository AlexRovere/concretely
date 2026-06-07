<script setup>
import TracePanel from './TracePanel.vue';
import { PYBASICS_SCENARIOS } from '@/pybasics.js';
</script>

<template>
  <TracePanel :scenarios="PYBASICS_SCENARIOS" lang="bash" label="Python" note-key="pyb.note" />
</template>
