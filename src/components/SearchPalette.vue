<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { buildSearchIndex, buildSearchEntries } from '@/search.js';
import { useI18n } from '@/composables/useI18n';

// TABS comes from App so the palette and the nav can never drift apart.
const props = defineProps({ tabs: { type: Array, required: true } });
const emit = defineEmits(['pick']);
const { t, locale } = useI18n();

const open = ref(false);
const q = ref('');
const active = ref(0);
const input = ref(null);
const list = ref(null);

const fuse = buildSearchIndex(props.tabs);
// Empty query → plain tab list, so Ctrl+K doubles as a quick tab switcher.
const tabEntries = buildSearchEntries(props.tabs).filter((e) => e.kind === 'tab');

const results = computed(() => {
  const needle = q.value.trim();
  if (!needle) return tabEntries;
  return fuse.search(needle, { limit: 12 }).map((r) => r.item);
});

const title = (e) => (locale.value === 'fr' ? e.titleFr : e.titleEn);
const section = (e) => (locale.value === 'fr' ? e.sectionFr : e.sectionEn);

watch(results, () => { active.value = 0; });

function show() {
  open.value = true;
  q.value = '';
  active.value = 0;
  nextTick(() => input.value?.focus());
}
function hide() {
  open.value = false;
}
defineExpose({ show });

function pick(e) {
  if (!e) return;
  hide();
  emit('pick', e);
}

function move(delta) {
  const n = results.value.length;
  if (!n) return;
  active.value = (active.value + delta + n) % n;
  nextTick(() => {
    list.value?.querySelector('.sp-item.active')?.scrollIntoView({ block: 'nearest' });
  });
}

function onKey(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    open.value ? hide() : show();
    return;
  }
  if (!open.value) return;
  if (e.key === 'Escape') { e.preventDefault(); hide(); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
  else if (e.key === 'Enter') { e.preventDefault(); pick(results.value[active.value]); }
}

onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="sp-overlay" @mousedown.self="hide">
      <div class="sp-box" role="dialog" aria-modal="true" :aria-label="t('search.placeholder')">
        <input
          ref="input"
          v-model="q"
          class="sp-input"
          type="text"
          :placeholder="t('search.placeholder')"
          autocomplete="off"
          spellcheck="false"
        />
        <ul ref="list" class="sp-list">
          <li
            v-for="(e, i) in results"
            :key="e.kind + (e.id ?? e.mode)"
            class="sp-item"
            :class="{ active: i === active }"
            @mousemove="active = i"
            @click="pick(e)"
          >
            <span class="sp-kind">{{ e.kind === 'tab' ? t('search.tab') : t('search.snippet') }}</span>
            <span class="sp-title">{{ title(e) }}</span>
            <span class="sp-section">{{ section(e) }}</span>
          </li>
          <li v-if="results.length === 0" class="sp-none">{{ t('search.empty') }}</li>
        </ul>
        <footer class="sp-footer">{{ t('search.hint') }}</footer>
      </div>
    </div>
  </Teleport>
</template>
