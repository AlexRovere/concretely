<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { codeThemeById, PREVIEW_CODE } from '@/themes.js';
import { highlight } from '@/highlight.js';
import { useI18n } from '@/composables/useI18n';

const { t } = useI18n();
const { theme, codeTheme, codeFont, toggleTheme, CODE_THEMES, CODE_FONTS } = useTheme();

const open = ref(false);
const root = ref(null);

// The preview repaints from the LIVE --code-*/--tok-* vars, so it always
// shows exactly what the code boxes will look like.
const previewHtml = computed(() => {
  void codeTheme.value;
  return highlight(PREVIEW_CODE, 'js');
});
const sheetName = computed(() => codeThemeById(codeTheme.value)?.name ?? '');

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

      <label class="settings-row">
        <span>{{ t('settings.theme') }}</span>
        <div class="seg">
          <button :class="{ on: theme === 'dark' }" @click="theme = 'dark'">🌙 {{ t('settings.dark') }}</button>
          <button :class="{ on: theme === 'light' }" @click="theme = 'light'">☀️ {{ t('settings.light') }}</button>
        </div>
      </label>

      <label class="settings-row">
        <span>{{ t('settings.codeTheme') }}</span>
        <select v-model="codeTheme">
          <option v-for="ct in CODE_THEMES" :key="ct.id" :value="ct.id">{{ ct.name }}</option>
        </select>
      </label>

      <label class="settings-row">
        <span>{{ t('settings.codeFont') }}</span>
        <select v-model="codeFont">
          <option v-for="f in CODE_FONTS" :key="f.id" :value="f.id">{{ f.name }}</option>
        </select>
      </label>

      <div class="settings-preview" :title="sheetName">
        <pre><code v-html="previewHtml"></code></pre>
      </div>
    </div>
  </div>
</template>
