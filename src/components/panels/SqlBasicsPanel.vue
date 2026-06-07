<script setup>
import TracePanel from './TracePanel.vue';
import { SQLBASICS_SCENARIOS } from '@/sqlbasics.js';
</script>

<template>
  <TracePanel :scenarios="SQLBASICS_SCENARIOS" lang="sql" label="SQL" note-key="sqb.note" />
</template>
