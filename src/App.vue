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

const { t, locale, setLocale, LOCALES } = useI18n()

const TABS = [
  { mode: 'sorting', key: 'tabs.sorting' },
  { mode: 'pathfinding', key: 'tabs.pathfinding' },
  { mode: 'bigo', key: 'tabs.bigo' },
  { mode: 'recursion', key: 'tabs.recursion' },
  { mode: 'eventloop', key: 'tabs.eventloop' },
  { mode: 'datastructures', key: 'tabs.datastructures' },
  { mode: 'valueref', key: 'tabs.valueref' },
  { mode: 'swift', key: 'tabs.swift' },
  { mode: 'bst', key: 'tabs.bst' },
  { mode: 'dp', key: 'tabs.dp' },
  { mode: 'regex', key: 'tabs.regex' }
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
  bst: BstPanel,
  dp: DpPanel,
  regex: RegexPanel
}

const mode = ref<string>('sorting')
const currentPanel = computed(() => panels[mode.value])

function onLocale(e: Event) {
  setLocale((e.target as HTMLSelectElement).value)
}
</script>

<template>
  <header>
    <h1>Concretely</h1>
    <nav class="tabs">
      <button
        v-for="tab in TABS"
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
