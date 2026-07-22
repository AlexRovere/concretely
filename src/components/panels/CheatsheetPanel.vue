<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { cheatsheetFor } from '@/cheatsheets/index.js';
import { highlight } from '@/highlight.js';
import { useI18n } from '@/composables/useI18n';

// `cat` follows the app's category selector; `query` is seeded by the Ctrl+K palette.
// `item` is a deep-link target (#/cat/cheatsheet/<id>) to scroll to + highlight.
const props = defineProps({
  cat: { type: String, default: 'general' },
  query: { type: String, default: '' },
  item: { type: String, default: '' },
});
const { t, tf, locale } = useI18n();

const sheet = computed(() => cheatsheetFor(props.cat) ?? cheatsheetFor('general'));
const L = (v) => v?.[locale.value] ?? v?.fr ?? '';

const q = ref('');
watch(() => props.cat, () => { q.value = ''; });
// The palette hands over its query so the picked snippet is already filtered in.
watch(() => props.query, (v) => { if (v) q.value = v; });

// Accent-insensitive matching ("memoisation" finds "mémoïsation").
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

const filtered = computed(() => {
  const needle = norm(q.value.trim());
  if (!needle) return sheet.value.sections;
  return sheet.value.sections
    .map((s) => ({
      ...s,
      items: s.items.filter((it) =>
        norm(`${it.title.fr} ${it.title.en} ${it.code} ${it.note.fr} ${it.note.en} ${L(s.title)}`)
          .includes(needle)),
    }))
    .filter((s) => s.items.length > 0);
});

const count = computed(() => filtered.value.reduce((n, s) => n + s.items.length, 0));

const copied = ref('');
let copyTimer = null;
async function copy(item) {
  try {
    await navigator.clipboard.writeText(item.code);
    copied.value = item.id;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copied.value = ''; }, 1200);
  } catch { /* clipboard unavailable (http) — silently ignore */ }
}

// Deep-link : surbrillance de l'item ciblé + scroll, et copie du lien partageable.
const root = ref(null);
const highlighted = ref('');
let hlTimer = null;

function focusItem(id) {
  if (!id) return;
  nextTick(() => {
    const el = root.value?.querySelector(`[data-item="${CSS.escape(id)}"]`);
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    highlighted.value = id;
    clearTimeout(hlTimer);
    hlTimer = setTimeout(() => { highlighted.value = ''; }, 2000);
  });
}
watch(() => props.item, focusItem, { immediate: true });
watch(() => props.cat, () => { highlighted.value = ''; });

const linked = ref('');
let linkTimer = null;
async function copyLink(item) {
  const url = `${location.origin}${location.pathname}#/${props.cat}/cheatsheet/${item.id}`;
  try {
    await navigator.clipboard.writeText(url);
    linked.value = item.id;
    clearTimeout(linkTimer);
    linkTimer = setTimeout(() => { linked.value = ''; }, 1200);
  } catch { /* clipboard indisponible (http) */ }
}
</script>

<template>
  <section ref="root" class="panel">
    <div class="controls cs-controls">
      <label class="cs-search">
        <span>🔍</span>
        <input
          v-model="q"
          type="search"
          :placeholder="t('cheat.search')"
          :aria-label="t('cheat.search')"
        />
      </label>
      <span class="el-phase">{{ tf('cheat.count', count) }}</span>
    </div>

    <div v-for="s in filtered" :key="s.id" class="cs-section">
      <h2 class="cs-section-title">{{ L(s.title) }}</h2>
      <div class="cs-grid">
        <article
          v-for="it in s.items"
          :key="it.id"
          class="cs-card"
          :class="{ 'cs-hl': highlighted === it.id }"
          :data-item="it.id"
        >
          <header class="cs-card-head">
            <h3>{{ L(it.title) }}</h3>
            <span class="cs-actions">
              <button class="cs-copy" :title="t('cheat.link')" @click="copyLink(it)">
                {{ linked === it.id ? t('cheat.copied') : '🔗' }}
              </button>
              <button class="cs-copy" :title="t('cheat.copy')" @click="copy(it)">
                {{ copied === it.id ? t('cheat.copied') : '📋' }}
              </button>
            </span>
          </header>
          <pre class="cs-code"><code v-html="highlight(it.code, it.lang ?? sheet.lang)"></code></pre>
          <p class="cs-note">{{ L(it.note) }}</p>
        </article>
      </div>
    </div>

    <p v-if="count === 0" class="hint cs-empty">{{ t('cheat.empty') }}</p>
  </section>
</template>
