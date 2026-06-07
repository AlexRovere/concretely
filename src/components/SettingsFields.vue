<script setup>
import { computed } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { codeThemeById, PREVIEW_CODE } from '@/themes.js';
import { highlight } from '@/highlight.js';
import { useI18n } from '@/composables/useI18n';

// Form rows shared by the desktop ⚙️ popover and the mobile drawer.
const { t } = useI18n();
const { theme, codeTheme, codeFont, CODE_THEMES, CODE_FONTS } = useTheme();

// The preview repaints from the LIVE --code-*/--tok-* vars, so it always
// shows exactly what the code boxes will look like.
const previewHtml = computed(() => {
  void codeTheme.value;
  return highlight(PREVIEW_CODE, 'js');
});
const sheetName = computed(() => codeThemeById(codeTheme.value)?.name ?? '');
</script>

<template>
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
</template>
