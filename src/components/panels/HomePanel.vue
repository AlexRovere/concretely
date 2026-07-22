<script setup>
import { computed } from 'vue';
import { CATEGORIES } from '@/nav.js';
import { CATEGORY_META, GROUPS, GROUP_LABEL } from '@/categoryMeta.js';
import CategoryIcon from '@/components/CategoryIcon.vue';
import { useI18n } from '@/composables/useI18n';

const emit = defineEmits(['pick']);
const { t, locale } = useI18n();

const groups = computed(() =>
  GROUPS.map((g) => ({
    id: g,
    label: GROUP_LABEL[g][locale.value] ?? GROUP_LABEL[g].en,
    cats: CATEGORIES.filter((c) => CATEGORY_META[c]?.group === g),
  })).filter((grp) => grp.cats.length),
);

const tagline = (cat) => {
  const tl = CATEGORY_META[cat].tagline;
  return tl[locale.value] ?? tl.en;
};
</script>

<template>
  <section class="panel home">
    <h2 class="home-title">{{ t('home.title') }}</h2>
    <p class="home-sub">{{ t('home.sub') }}</p>

    <div v-for="grp in groups" :key="grp.id" class="home-group">
      <h3 class="home-group-label">{{ grp.label }}</h3>
      <div class="home-grid">
        <button
          v-for="cat in grp.cats"
          :key="cat"
          class="home-card"
          @click="emit('pick', cat)"
        >
          <CategoryIcon :cat="cat" class="home-card-icon" />
          <span class="home-card-name">{{ t('cat.' + cat) }}</span>
          <span class="home-card-tag">{{ tagline(cat) }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
