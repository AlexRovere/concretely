<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
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
import QuizPanel from '@/components/panels/QuizPanel.vue'
import CheatsheetPanel from '@/components/panels/CheatsheetPanel.vue'
import PlaygroundPanel from '@/components/panels/PlaygroundPanel.vue'
import SearchPalette from '@/components/SearchPalette.vue'
import SettingsMenu from '@/components/SettingsMenu.vue'
import NavDrawer from '@/components/NavDrawer.vue'
import { useTheme } from '@/composables/useTheme'
import JsBasicsPanel from '@/components/panels/JsBasicsPanel.vue'
import SwiftBasicsPanel from '@/components/panels/SwiftBasicsPanel.vue'
import KotlinBasicsPanel from '@/components/panels/KotlinBasicsPanel.vue'
import TsBasicsPanel from '@/components/panels/TsBasicsPanel.vue'
import GoBasicsPanel from '@/components/panels/GoBasicsPanel.vue'
import RustBasicsPanel from '@/components/panels/RustBasicsPanel.vue'

const { t, locale, setLocale, LOCALES } = useI18n()
useTheme() // applies the persisted theme + code palette/font on startup

const CATEGORIES = ['general', 'js', 'ts', 'vue', 'swift', 'ruby', 'kotlin', 'go', 'rust', 'git']

// `cat: '*'` = always-visible tab (appended last); `not` lists categories
// where such a tab is hidden (no Swift compiler runs in a browser).
const TABS: { mode: string; key: string; cat: string; not?: string[] }[] = [
  { mode: 'sorting', key: 'tabs.sorting', cat: 'general' },
  { mode: 'pathfinding', key: 'tabs.pathfinding', cat: 'general' },
  { mode: 'bigo', key: 'tabs.bigo', cat: 'general' },
  { mode: 'recursion', key: 'tabs.recursion', cat: 'general' },
  { mode: 'jsbasics', key: 'tabs.jsbasics', cat: 'js' },
  { mode: 'eventloop', key: 'tabs.eventloop', cat: 'js' },
  { mode: 'datastructures', key: 'tabs.datastructures', cat: 'general' },
  { mode: 'valueref', key: 'tabs.valueref', cat: 'js' },
  { mode: 'swiftbasics', key: 'tabs.swiftbasics', cat: 'swift' },
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
  { mode: 'kotlinbasics', key: 'tabs.kotlinbasics', cat: 'kotlin' },
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
  { mode: 'tsbasics', key: 'tabs.tsbasics', cat: 'ts' },
  { mode: 'gobasics', key: 'tabs.gobasics', cat: 'go' },
  { mode: 'rustbasics', key: 'tabs.rustbasics', cat: 'rust' },
  { mode: 'cheatsheet', key: 'tabs.cheatsheet', cat: '*' },
  { mode: 'playground', key: 'tabs.playground', cat: '*', not: ['swift'] },
  { mode: 'quiz', key: 'tabs.quiz', cat: '*' },
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
  quiz: QuizPanel,
  cheatsheet: CheatsheetPanel,
  playground: PlaygroundPanel,
  jsbasics: JsBasicsPanel,
  swiftbasics: SwiftBasicsPanel,
  kotlinbasics: KotlinBasicsPanel,
  tsbasics: TsBasicsPanel,
  gobasics: GoBasicsPanel,
  rustbasics: RustBasicsPanel,
  bst: BstPanel,
  dp: DpPanel,
  regex: RegexPanel
}

const mode = ref<string>('sorting')
const currentPanel = computed(() => panels[mode.value])

const cat = ref<string>('general')
// Topic tabs of the active category, then the always-visible tabs LAST
// (Cheatsheet, Playground, Quiz) — minus the ones excluded for this category.
const visibleTabs = computed(() => [
  ...TABS.filter((tb) => tb.cat === cat.value),
  ...TABS.filter((tb) => tb.cat === '*' && !tb.not?.includes(cat.value))
])

// Mobile: auto-hide the sticky header on scroll down, reveal on scroll up
// (the transform only applies ≤920px — see visualizers.css).
const navHidden = ref(false)
let lastY = 0
function onScroll() {
  const y = window.scrollY
  if (Math.abs(y - lastY) < 6) return // ignore sub-pixel jitter / iOS bounce
  navHidden.value = y > lastY && y > 90
  lastY = y
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

// Mobile: the tab list is a swipeable strip — keep the active tab in view.
watch([mode, cat], async () => {
  navHidden.value = false // a tab/category jump must never leave the nav hidden
  await nextTick()
  document
    .querySelector('.tabs .tab.active')
    ?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
})

// The quiz's "watch it animated" button jumps straight to a topic tab.
function onGoto(target: string) {
  const tab = TABS.find((tb) => tb.mode === target)
  if (tab && tab.cat !== '*') cat.value = tab.cat
  mode.value = target
}

// ---- Global search (Ctrl+K palette) -------------------------------------
const palette = ref<InstanceType<typeof SearchPalette> | null>(null)
// Seed handed to the CheatsheetPanel so a picked snippet is filtered in.
const cheatQuery = ref('')

function onPick(e: { kind: string; mode: string; cat: string; titleFr: string; titleEn: string }) {
  if (e.kind === 'tab') {
    onGoto(e.mode)
    return
  }
  cat.value = e.cat
  mode.value = 'cheatsheet'
  cheatQuery.value = locale.value === 'fr' ? e.titleFr : e.titleEn
}

function selectCat(c: string) {
  cat.value = c
  // If the active tab is filtered out, jump to the first visible one.
  if (!visibleTabs.value.some((tb) => tb.mode === mode.value)) {
    mode.value = visibleTabs.value[0].mode
  }
}
function onCat(e: Event) {
  selectCat((e.target as HTMLSelectElement).value)
}

// Mobile drawer (☰): navigation + options in a side panel.
const drawer = ref(false)

function onLocale(e: Event) {
  setLocale((e.target as HTMLSelectElement).value)
}
</script>

<template>
  <header :class="{ 'nav-hidden': navHidden }">
    <button class="icon-btn ham" :aria-label="t('menu.title')" @click="drawer = true">☰</button>
    <h1>Concretely</h1>
    <label class="cat-pick">
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
    <button class="search-btn" :title="t('search.btn') + ' (Ctrl K)'" @click="palette?.show()">
      🔍 <kbd>Ctrl K</kbd>
    </button>
    <SettingsMenu />
    <label class="locale-pick">
      <select id="locale" :value="locale" @change="onLocale">
        <option v-for="l in LOCALES" :key="l.id" :value="l.id">{{ l.name }}</option>
      </select>
    </label>
  </header>

  <main>
    <!-- :cat syncs the Quiz pool & the Cheatsheet; :query seeds the Cheatsheet filter. -->
    <KeepAlive>
      <component :is="currentPanel" :cat="cat" :query="cheatQuery" @goto="onGoto" />
    </KeepAlive>
  </main>

  <SearchPalette ref="palette" :tabs="TABS" @pick="onPick" />
  <NavDrawer
    :open="drawer"
    :tabs="TABS"
    :categories="CATEGORIES"
    :cat="cat"
    :mode="mode"
    @close="drawer = false"
    @cat="selectCat"
    @goto="onGoto"
  />

</template>
