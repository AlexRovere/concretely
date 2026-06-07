<script setup>
import TracePanel from './TracePanel.vue';
import { OSBASICS_SCENARIOS } from '@/osbasics.js';
</script>

<template>
  <TracePanel :scenarios="OSBASICS_SCENARIOS" lang="bash" label="Système" note-key="osb.note" />
</template>
