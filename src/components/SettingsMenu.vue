<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useI18n } from '@/composables/useI18n';
import SettingsFields from '@/components/SettingsFields.vue';

const { t } = useI18n();
const { theme, toggleTheme } = useTheme();

const open = ref(false);
const root = ref(null);

function onDocClick(e) {
  if (open.value && root.value && !root.value.contains(e.target)) open.value = false;
}
function onKey(e) {
  if (e.key === 'Escape') open.value = false;
}
onMounted(() => {
  document.addEventListener('click', onDocClick);
  window.addEventListener('keydown', onKey);
});
onUnmounted(() => {
  document.removeEventListener('click', onDocClick);
  window.removeEventListener('keydown', onKey);
});
</script>

<template>
  <div ref="root" class="settings">
    <button
      class="icon-btn"
      :title="t('settings.toggleTheme')"
      :aria-label="t('settings.toggleTheme')"
      @click="toggleTheme()"
    >{{ theme === 'dark' ? '🌙' : '☀️' }}</button>

    <button
      class="icon-btn"
      :title="t('settings.title')"
      :aria-label="t('settings.title')"
      :class="{ active: open }"
      @click="open = !open"
    >⚙️</button>

    <div v-if="open" class="settings-pop" role="dialog" :aria-label="t('settings.title')">
      <p class="settings-h">{{ t('settings.title') }}</p>
      <SettingsFields />
    </div>
  </div>
</template>
