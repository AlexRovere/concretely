<script setup>
import { watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from '@/composables/useI18n';
import SettingsFields from '@/components/SettingsFields.vue';

// Mobile side drawer: full navigation (categories + tabs) and options
// (appearance + language). Opened by the ☰ button — header ≤920px only.
const props = defineProps({
  open: { type: Boolean, default: false },
  tabs: { type: Array, required: true },
  categories: { type: Array, required: true },
  cat: { type: String, required: true },
  mode: { type: String, required: true },
});
const emit = defineEmits(['close', 'cat', 'goto']);
const { t, locale, setLocale, LOCALES } = useI18n();

// Same visibility rule as the header strip: topic tabs of the category,
// then the always-visible ones (minus those excluded for this category).
function tabsFor(c) {
  return [
    ...props.tabs.filter((tb) => tb.cat === c),
    ...props.tabs.filter((tb) => tb.cat === '*' && !(tb.not || []).includes(c)),
  ];
}

function pick(mode) {
  emit('goto', mode);
  emit('close');
}

// Lock the page scroll while the drawer is open.
watch(() => props.open, (o) => {
  document.documentElement.style.overflow = o ? 'hidden' : '';
});

function onKey(e) {
  if (e.key === 'Escape' && props.open) emit('close');
}
onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => {
  window.removeEventListener('keydown', onKey);
  document.documentElement.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="dw-overlay" @click.self="emit('close')">
        <aside class="dw" role="dialog" :aria-label="t('menu.title')">
          <div class="dw-head">
            <strong class="dw-title">Concretely</strong>
            <button class="icon-btn" :aria-label="t('menu.close')" @click="emit('close')">✕</button>
          </div>

          <p class="settings-h">{{ t('menu.nav') }}</p>
          <div class="dw-cats">
            <button
              v-for="c in categories"
              :key="c"
              class="tab"
              :class="{ active: c === cat }"
              @click="emit('cat', c)"
            >{{ t('cat.' + c) }}</button>
          </div>

          <nav class="dw-tabs">
            <button
              v-for="tb in tabsFor(cat)"
              :key="tb.mode"
              class="dw-tab"
              :class="{ active: mode === tb.mode }"
              @click="pick(tb.mode)"
            >{{ t(tb.key) }}</button>
          </nav>

          <hr class="dw-sep" />

          <p class="settings-h">{{ t('settings.title') }}</p>
          <SettingsFields />

          <label class="settings-row">
            <span>{{ t('menu.lang') }}</span>
            <select :value="locale" @change="setLocale($event.target.value)">
              <option v-for="l in LOCALES" :key="l.id" :value="l.id">{{ l.name }}</option>
            </select>
          </label>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>
