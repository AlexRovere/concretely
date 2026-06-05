<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import SortingPanel from '@/components/panels/SortingPanel.vue'
import PathfindingPanel from '@/components/panels/PathfindingPanel.vue'
import BigOPanel from '@/components/panels/BigOPanel.vue'
import RecursionPanel from '@/components/panels/RecursionPanel.vue'
import EventLoopPanel from '@/components/panels/EventLoopPanel.vue'
import DataStructuresPanel from '@/components/panels/DataStructuresPanel.vue'
import ValueRefPanel from '@/components/panels/ValueRefPanel.vue'
import SwiftPanel from '@/components/panels/SwiftPanel.vue'
import BstPanel from '@/components/panels/BstPanel.vue'
import DpPanel from '@/components/panels/DpPanel.vue'
import RegexPanel from '@/components/panels/RegexPanel.vue'
import SwiftStatePanel from '@/components/panels/SwiftStatePanel.vue'
import SwiftConcurrencyPanel from '@/components/panels/SwiftConcurrencyPanel.vue'
import MainThreadPanel from '@/components/panels/MainThreadPanel.vue'
import ArcPanel from '@/components/panels/ArcPanel.vue'
import CowPanel from '@/components/panels/CowPanel.vue'
import RubyBasicsPanel from '@/components/panels/RubyBasicsPanel.vue'
import RubyBlocksPanel from '@/components/panels/RubyBlocksPanel.vue'
import RubyLookupPanel from '@/components/panels/RubyLookupPanel.vue'
import RubyLazyPanel from '@/components/panels/RubyLazyPanel.vue'
import RubyGvlPanel from '@/components/panels/RubyGvlPanel.vue'
import ComposePanel from '@/components/panels/ComposePanel.vue'
import KtCoroutinesPanel from '@/components/panels/KtCoroutinesPanel.vue'
import ViewModelPanel from '@/components/panels/ViewModelPanel.vue'
import KtFlowPanel from '@/components/panels/KtFlowPanel.vue'
import LifecyclePanel from '@/components/panels/LifecyclePanel.vue'
import VueReactivityPanel from '@/components/panels/VueReactivityPanel.vue'
import VdomPanel from '@/components/panels/VdomPanel.vue'
import BubblingPanel from '@/components/panels/BubblingPanel.vue'
import DebouncePanel from '@/components/panels/DebouncePanel.vue'
import GitDagPanel from '@/components/panels/GitDagPanel.vue'
import GitResetPanel from '@/components/panels/GitResetPanel.vue'

const { t, locale, setLocale, LOCALES } = useI18n()

const CATEGORIES = ['all', 'general', 'js', 'vue', 'swift', 'ruby', 'kotlin', 'git']

const TABS = [
  { mode: 'sorting', key: 'tabs.sorting', cat: 'general' },
  { mode: 'pathfinding', key: 'tabs.pathfinding', cat: 'general' },
  { mode: 'bigo', key: 'tabs.bigo', cat: 'general' },
  { mode: 'recursion', key: 'tabs.recursion', cat: 'general' },
  { mode: 'eventloop', key: 'tabs.eventloop', cat: 'js' },
  { mode: 'datastructures', key: 'tabs.datastructures', cat: 'general' },
  { mode: 'valueref', key: 'tabs.valueref', cat: 'js' },
  { mode: 'swift', key: 'tabs.swift', cat: 'swift' },
  { mode: 'swiftstate', key: 'tabs.swiftstate', cat: 'swift' },
  { mode: 'swiftconcurrency', key: 'tabs.swiftconcurrency', cat: 'swift' },
  { mode: 'mainthread', key: 'tabs.mainthread', cat: 'swift' },
  { mode: 'arc', key: 'tabs.arc', cat: 'swift' },
  { mode: 'cow', key: 'tabs.cow', cat: 'swift' },
  { mode: 'rubybasics', key: 'tabs.rubybasics', cat: 'ruby' },
  { mode: 'rubyblocks', key: 'tabs.rubyblocks', cat: 'ruby' },
  { mode: 'rubylookup', key: 'tabs.rubylookup', cat: 'ruby' },
  { mode: 'rubylazy', key: 'tabs.rubylazy', cat: 'ruby' },
  { mode: 'rubygvl', key: 'tabs.rubygvl', cat: 'ruby' },
  { mode: 'compose', key: 'tabs.compose', cat: 'kotlin' },
  { mode: 'ktcoroutines', key: 'tabs.ktcoroutines', cat: 'kotlin' },
  { mode: 'viewmodel', key: 'tabs.viewmodel', cat: 'kotlin' },
  { mode: 'ktflow', key: 'tabs.ktflow', cat: 'kotlin' },
  { mode: 'lifecycle', key: 'tabs.lifecycle', cat: 'kotlin' },
  { mode: 'vuereactivity', key: 'tabs.vuereactivity', cat: 'vue' },
  { mode: 'vdom', key: 'tabs.vdom', cat: 'vue' },
  { mode: 'bubbling', key: 'tabs.bubbling', cat: 'vue' },
  { mode: 'debounce', key: 'tabs.debounce', cat: 'vue' },
  { mode: 'gitdag', key: 'tabs.gitdag', cat: 'git' },
  { mode: 'gitreset', key: 'tabs.gitreset', cat: 'git' },
  { mode: 'bst', key: 'tabs.bst', cat: 'general' },
  { mode: 'dp', key: 'tabs.dp', cat: 'general' },
  { mode: 'regex', key: 'tabs.regex', cat: 'general' }
]

const panels: Record<string, unknown> = {
  sorting: SortingPanel,
  pathfinding: PathfindingPanel,
  bigo: BigOPanel,
  recursion: RecursionPanel,
  eventloop: EventLoopPanel,
  datastructures: DataStructuresPanel,
  valueref: ValueRefPanel,
  swift: SwiftPanel,
  swiftstate: SwiftStatePanel,
  swiftconcurrency: SwiftConcurrencyPanel,
  mainthread: MainThreadPanel,
  arc: ArcPanel,
  cow: CowPanel,
  rubybasics: RubyBasicsPanel,
  rubyblocks: RubyBlocksPanel,
  rubylookup: RubyLookupPanel,
  rubylazy: RubyLazyPanel,
  rubygvl: RubyGvlPanel,
  compose: ComposePanel,
  ktcoroutines: KtCoroutinesPanel,
  viewmodel: ViewModelPanel,
  ktflow: KtFlowPanel,
  lifecycle: LifecyclePanel,
  vuereactivity: VueReactivityPanel,
  vdom: VdomPanel,
  bubbling: BubblingPanel,
  debounce: DebouncePanel,
  gitdag: GitDagPanel,
  gitreset: GitResetPanel,
  bst: BstPanel,
  dp: DpPanel,
  regex: RegexPanel
}

const mode = ref<string>('sorting')
const currentPanel = computed(() => panels[mode.value])

const cat = ref<string>('all')
const visibleTabs = computed(() =>
  cat.value === 'all' ? TABS : TABS.filter((tb) => tb.cat === cat.value)
)

function onCat(e: Event) {
  cat.value = (e.target as HTMLSelectElement).value
  // If the active tab is filtered out, jump to the first visible one.
  if (!visibleTabs.value.some((tb) => tb.mode === mode.value)) {
    mode.value = visibleTabs.value[0].mode
  }
}

function onLocale(e: Event) {
  setLocale((e.target as HTMLSelectElement).value)
}
</script>

<template>
  <header>
    <h1>Concretely</h1>
    <label class="locale-pick cat-pick">
      <select id="category" :value="cat" @change="onCat">
        <option v-for="c in CATEGORIES" :key="c" :value="c">{{ t('cat.' + c) }}</option>
      </select>
    </label>
    <nav class="tabs">
      <button
        v-for="tab in visibleTabs"
        :key="tab.mode"
        class="tab"
        :class="{ active: mode === tab.mode }"
        @click="mode = tab.mode"
      >
        {{ t(tab.key) }}
      </button>
    </nav>
    <label class="locale-pick">
      <select id="locale" :value="locale" @change="onLocale">
        <option v-for="l in LOCALES" :key="l.id" :value="l.id">{{ l.name }}</option>
      </select>
    </label>
  </header>

  <main>
    <KeepAlive>
      <component :is="currentPanel" />
    </KeepAlive>
  </main>
</template>
