<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { calendarFromMonths } from '@/core/time'
import { getContentRegistry } from '@/data'
import { useGameStore } from '@/stores/game'
import { useUiStore, type ArchiveTab } from '@/stores/ui'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type TimeFilter = 'all' | 'recent' | 'older'

const registry = getContentRegistry()
const game = useGameStore()
const ui = useUiStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const chronicleEra = ref('all')
const timeFilter = ref<TimeFilter>('all')

const tabs = computed<Array<{ id: ArchiveTab; label: string; count: number }>>(() => [
  { id: 'chronicle', label: '编年', count: game.chronicle.length },
  { id: 'rumors', label: '潮声', count: game.rumors.length },
  { id: 'memories', label: '旧忆', count: game.memories.length },
])

const eraTabs = computed(() => {
  const seen = new Map<string, { id: string; label: string; count: number }>()
  for (const entry of game.chronicle) {
    const existing = seen.get(entry.eraId)
    const label = registry.eras.get(entry.eraId)?.name ?? '未记之劫'
    if (existing) {
      existing.count += 1
    } else {
      seen.set(entry.eraId, { id: entry.eraId, label, count: 1 })
    }
  }
  return [{ id: 'all', label: '诸劫' }, ...seen.values()]
})

const timeTabs = computed(() => [
  { id: 'all', label: '全部' },
  { id: 'recent', label: '近十二月' },
  { id: 'older', label: '更早' },
])

const visibleChronicle = computed(() =>
  game.chronicle.filter(
    (entry) => chronicleEra.value === 'all' || entry.eraId === chronicleEra.value,
  ),
)

function matchesTime(months: number): boolean {
  if (timeFilter.value === 'all') return true
  const recent = months >= game.game.clock.elapsedMonths - 12
  return timeFilter.value === 'recent' ? recent : !recent
}

const visibleRumors = computed(() =>
  game.rumors.filter((entry) => matchesTime(entry.createdAtMonths)),
)

const visibleMemories = computed(() =>
  game.memories.filter((entry) => matchesTime(entry.createdAtMonths)),
)

function selectArchive(id: string): void {
  ui.archiveTab = id as ArchiveTab
}

function selectChronicleEra(id: string): void {
  chronicleEra.value = id
}

function selectTimeFilter(id: string): void {
  timeFilter.value = id as TimeFilter
}

function monthLabel(months: number): string {
  const calendar = calendarFromMonths(months)
  return `第${calendar.year}年${calendar.month}月`
}
</script>

<template>
  <div>
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="tabs" :active="ui.archiveTab" @select="selectArchive" />
        <TabBar
          v-if="ui.archiveTab === 'chronicle'"
          size="sm"
          :tabs="eraTabs"
          :active="chronicleEra"
          @select="selectChronicleEra"
        />
        <TabBar
          v-else
          size="sm"
          :tabs="timeTabs"
          :active="timeFilter"
          @select="selectTimeFilter"
        />
      </div>
    </Teleport>

    <div v-if="ui.archiveTab === 'chronicle'" class="mt-4">
      <ol v-if="visibleChronicle.length" class="space-y-0">
        <li
          v-for="entry in visibleChronicle"
          :key="entry.id"
          class="relative border-l border-line pb-4 pl-4 last:pb-0"
        >
          <span class="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-cinnabar/70"></span>
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h3 class="font-serif text-lg leading-snug">{{ entry.title }}</h3>
            <span class="text-[13px] tracking-[0.12em] text-muted">第{{ entry.year }}年</span>
          </div>
          <p class="mt-1.5 text-[14px] leading-6 text-muted">{{ entry.text }}</p>
        </li>
      </ol>
      <p v-else class="rounded-sm border border-dashed border-line px-4 py-6 text-center text-[14px] leading-6 text-muted">
        编年尚未落笔。你作出的每一个选择，都会在这里留下可重读的一页。
      </p>
    </div>

    <div v-else-if="ui.archiveTab === 'rumors'" class="mt-4">
      <ul v-if="visibleRumors.length" class="space-y-3">
        <li
          v-for="rumor in visibleRumors"
          :key="rumor.id"
          class="border-l border-cinnabar/25 pl-3"
        >
          <p class="text-[14px] leading-6 text-ink-soft">{{ rumor.text }}</p>
          <p class="mt-1 text-[13px] text-muted">{{ monthLabel(rumor.createdAtMonths) }}</p>
        </li>
      </ul>
      <p v-else class="rounded-sm border border-dashed border-line px-4 py-6 text-center text-[14px] leading-6 text-muted">
        风里还没有值得记下的见闻。
      </p>
    </div>

    <div v-else class="mt-4">
      <ul v-if="visibleMemories.length" class="space-y-3">
        <li
          v-for="memory in visibleMemories"
          :key="memory.id"
          class="border-l border-cinnabar/25 pl-3"
        >
          <p class="text-[14px] leading-6 text-ink-soft">{{ memory.text }}</p>
          <p class="mt-1 text-[13px] text-muted">{{ monthLabel(memory.createdAtMonths) }}</p>
        </li>
      </ul>
      <p v-else class="rounded-sm border border-dashed border-line px-4 py-6 text-center text-[14px] leading-6 text-muted">
        第一段旧忆，要等一件你愿意记住的事。
      </p>
    </div>
  </div>
</template>
