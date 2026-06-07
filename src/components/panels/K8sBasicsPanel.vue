<script setup>
import TracePanel from './TracePanel.vue';
import { K8SBASICS_SCENARIOS } from '@/k8sbasics.js';
</script>

<template>
  <TracePanel :scenarios="K8SBASICS_SCENARIOS" lang="bash" label="Kubernetes" note-key="k8b.note" />
</template>
