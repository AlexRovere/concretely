<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { parseHash, formatRoute, resolveRoute } from '@/hashRoute.js'
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
import SwiftTypesPanel from '@/components/panels/SwiftTypesPanel.vue'
import SwiftBindingsPanel from '@/components/panels/SwiftBindingsPanel.vue'
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
import LinuxBasicsPanel from '@/components/panels/LinuxBasicsPanel.vue'
import SqlBasicsPanel from '@/components/panels/SqlBasicsPanel.vue'
import SqlJoinsPanel from '@/components/panels/SqlJoinsPanel.vue'
import HttpFlowPanel from '@/components/panels/HttpFlowPanel.vue'
import CorsPanel from '@/components/panels/CorsPanel.vue'
import HttpCachePanel from '@/components/panels/HttpCachePanel.vue'
import DockerBasicsPanel from '@/components/panels/DockerBasicsPanel.vue'
import PyBasicsPanel from '@/components/panels/PyBasicsPanel.vue'
import CBasicsPanel from '@/components/panels/CBasicsPanel.vue'
import CMemoryPanel from '@/components/panels/CMemoryPanel.vue'
import SchedulerPanel from '@/components/panels/SchedulerPanel.vue'
import OsBasicsPanel from '@/components/panels/OsBasicsPanel.vue'
import K8sBasicsPanel from '@/components/panels/K8sBasicsPanel.vue'
import JavaBasicsPanel from '@/components/panels/JavaBasicsPanel.vue'
import PatternsCreationalPanel from '@/components/panels/PatternsCreationalPanel.vue'
import PatternsStructuralPanel from '@/components/panels/PatternsStructuralPanel.vue'
import PatternsBehavioralPanel from '@/components/panels/PatternsBehavioralPanel.vue'
import MlKmeansPanel from '@/components/panels/MlKmeansPanel.vue'
import MlGradientPanel from '@/components/panels/MlGradientPanel.vue'
import MlKnnPanel from '@/components/panels/MlKnnPanel.vue'
import MlTreePanel from '@/components/panels/MlTreePanel.vue'
import MlNeuralPanel from '@/components/panels/MlNeuralPanel.vue'

const { t, locale, setLocale, LOCALES } = useI18n()
useTheme() // applies the persisted theme + code palette/font on startup

// Languages first, then tools/infra.
const CATEGORIES = [
  'general', 'patterns', 'js', 'ts', 'python', 'vue', 'swift', 'ruby', 'kotlin', 'java', 'go', 'rust', 'c', 'ml',
  'sql', 'git', 'linux', 'os', 'web', 'docker', 'k8s'
]

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
  { mode: 'patternscreational', key: 'tabs.patternscreational', cat: 'patterns' },
  { mode: 'patternsstructural', key: 'tabs.patternsstructural', cat: 'patterns' },
  { mode: 'patternsbehavioral', key: 'tabs.patternsbehavioral', cat: 'patterns' },
  { mode: 'valueref', key: 'tabs.valueref', cat: 'js' },
  { mode: 'swiftbasics', key: 'tabs.swiftbasics', cat: 'swift' },
  { mode: 'swift', key: 'tabs.swift', cat: 'swift' },
  { mode: 'swiftstate', key: 'tabs.swiftstate', cat: 'swift' },
  { mode: 'swifttypes', key: 'tabs.swifttypes', cat: 'swift' },
  { mode: 'swiftbindings', key: 'tabs.swiftbindings', cat: 'swift' },
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
  { mode: 'linuxbasics', key: 'tabs.linuxbasics', cat: 'linux' },
  { mode: 'sqlbasics', key: 'tabs.sqlbasics', cat: 'sql' },
  { mode: 'sqljoins', key: 'tabs.sqljoins', cat: 'sql' },
  { mode: 'httpflow', key: 'tabs.httpflow', cat: 'web' },
  { mode: 'cors', key: 'tabs.cors', cat: 'web' },
  { mode: 'httpcache', key: 'tabs.httpcache', cat: 'web' },
  { mode: 'dockerbasics', key: 'tabs.dockerbasics', cat: 'docker' },
  { mode: 'pybasics', key: 'tabs.pybasics', cat: 'python' },
  { mode: 'mlkmeans', key: 'tabs.mlkmeans', cat: 'ml' },
  { mode: 'mlgradient', key: 'tabs.mlgradient', cat: 'ml' },
  { mode: 'mlknn', key: 'tabs.mlknn', cat: 'ml' },
  { mode: 'mltree', key: 'tabs.mltree', cat: 'ml' },
  { mode: 'mlneural', key: 'tabs.mlneural', cat: 'ml' },
  { mode: 'cbasics', key: 'tabs.cbasics', cat: 'c' },
  { mode: 'cmemory', key: 'tabs.cmemory', cat: 'c' },
  { mode: 'scheduler', key: 'tabs.scheduler', cat: 'os' },
  { mode: 'osbasics', key: 'tabs.osbasics', cat: 'os' },
  { mode: 'k8sbasics', key: 'tabs.k8sbasics', cat: 'k8s' },
  { mode: 'javabasics', key: 'tabs.javabasics', cat: 'java' },
  { mode: 'cheatsheet', key: 'tabs.cheatsheet', cat: '*' },
  { mode: 'playground', key: 'tabs.playground', cat: '*', not: ['swift', 'web', 'docker', 'os', 'k8s', 'patterns'] },
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
  swifttypes: SwiftTypesPanel,
  swiftbindings: SwiftBindingsPanel,
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
  linuxbasics: LinuxBasicsPanel,
  sqlbasics: SqlBasicsPanel,
  sqljoins: SqlJoinsPanel,
  httpflow: HttpFlowPanel,
  cors: CorsPanel,
  httpcache: HttpCachePanel,
  dockerbasics: DockerBasicsPanel,
  pybasics: PyBasicsPanel,
  mlkmeans: MlKmeansPanel,
  mlgradient: MlGradientPanel,
  mlknn: MlKnnPanel,
  mltree: MlTreePanel,
  mlneural: MlNeuralPanel,
  cbasics: CBasicsPanel,
  cmemory: CMemoryPanel,
  scheduler: SchedulerPanel,
  osbasics: OsBasicsPanel,
  k8sbasics: K8sBasicsPanel,
  javabasics: JavaBasicsPanel,
  bst: BstPanel,
  dp: DpPanel,
  regex: RegexPanel,
  patternscreational: PatternsCreationalPanel,
  patternsstructural: PatternsStructuralPanel,
  patternsbehavioral: PatternsBehavioralPanel
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

// ---- Hash router: URL <-> (cat, mode) -----------------------------------
// Visible tab modes of a category (topic tabs + universal ones).
function modesForCat(c: string): string[] {
  return [
    ...TABS.filter((tb) => tb.cat === c),
    ...TABS.filter((tb) => tb.cat === '*' && !tb.not?.includes(c))
  ].map((tb) => tb.mode)
}
const nav = {
  categories: CATEGORIES,
  firstMode: (c: string) => modesForCat(c)[0] ?? null,
  isValidMode: (c: string, m: string) => modesForCat(c).includes(m)
}
// Apply the current URL hash to the app state (invalid → default view).
function applyHash() {
  const resolved = resolveRoute(parseHash(window.location.hash), nav)
  if (resolved.view === 'home') {
    // R1: no home page yet — fall back to the default view.
    cat.value = 'general'
    mode.value = modesForCat('general')[0] ?? 'sorting'
  } else {
    cat.value = resolved.cat as string
    mode.value = resolved.mode as string
  }
}
// Reflect the app state back into the URL (guarded to avoid a write loop).
function syncHash() {
  const h = formatRoute({ view: 'panel', cat: cat.value, mode: mode.value })
  if (window.location.hash !== h) window.location.hash = h
}
onMounted(() => {
  applyHash()
  window.addEventListener('hashchange', applyHash)
})
onUnmounted(() => window.removeEventListener('hashchange', applyHash))
watch([cat, mode], syncHash)

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
      <select id="category" :value="cat" :aria-label="t('nav.category')" @change="onCat">
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
      <select id="locale" :value="locale" :aria-label="t('nav.language')" @change="onLocale">
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
