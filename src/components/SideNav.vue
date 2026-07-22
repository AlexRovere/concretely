<script setup>
import { computed } from 'vue';
import { CATEGORIES } from '@/nav.js';
import { CATEGORY_META, GROUPS, GROUP_LABEL } from '@/categoryMeta.js';
import CategoryIcon from '@/components/CategoryIcon.vue';
import SettingsFields from '@/components/SettingsFields.vue';
import { useI18n } from '@/composables/useI18n';

// Sidebar persistante (desktop) : accueil + catégories groupées + paramètres
// (apparence + langue). Masquée ≤920px, où le NavDrawer prend le relais.
const props = defineProps({
  cat: { type: String, required: true },
  view: { type: String, required: true }, // 'home' | 'panel'
});
const emit = defineEmits(['pick', 'home']);
const { t, locale, setLocale, LOCALES } = useI18n();

const groups = computed(() =>
  GROUPS.map((g) => ({
    id: g,
    label: GROUP_LABEL[g][locale.value] ?? GROUP_LABEL[g].en,
    cats: CATEGORIES.filter((c) => CATEGORY_META[c]?.group === g),
  })).filter((grp) => grp.cats.length),
);
</script>

<template>
  <aside class="sidenav" :aria-label="t('menu.nav')">
    <button
      class="sidenav-home"
      :class="{ active: props.view === 'home' }"
      @click="emit('home')"
    >
      <span class="sidenav-cat-icon" aria-hidden="true">🏠</span>{{ t('home.title') }}
    </button>

    <nav class="sidenav-cats">
      <div v-for="grp in groups" :key="grp.id" class="sidenav-group">
        <p class="sidenav-group-label">{{ grp.label }}</p>
        <button
          v-for="c in grp.cats"
          :key="c"
          class="sidenav-cat"
          :class="{ active: props.view === 'panel' && props.cat === c }"
          @click="emit('pick', c)"
        >
          <CategoryIcon :cat="c" class="sidenav-cat-icon" />{{ t('cat.' + c) }}
        </button>
      </div>
    </nav>

    <div class="sidenav-foot">
      <p class="settings-h">{{ t('settings.title') }}</p>
      <SettingsFields />
      <label class="settings-row">
        <span>{{ t('menu.lang') }}</span>
        <select :value="locale" :aria-label="t('nav.language')" @change="setLocale($event.target.value)">
          <option v-for="l in LOCALES" :key="l.id" :value="l.id">{{ l.name }}</option>
        </select>
      </label>
    </div>
  </aside>
</template>
