<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { useUiStore } from '@/stores/ui'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type InboxFilter = 'all' | 'unread' | 'story' | 'ambient'
type KindFilter = 'all' | 'main' | 'faction' | 'partner' | 'cave' | 'world' | 'hidden' | 'ambient'

const game = useGameStore()
const ui = useUiStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const inboxFilter = ref<InboxFilter>('all')
const kindFilter = ref<KindFilter>('all')

const EVENT_KIND_LABELS: Record<string, string> = {
  main: '主线',
  faction: '势力',
  partner: '道侣',
  cave: '洞府',
  world: '天下',
  hidden: '隐闻',
  ambient: '潮声',
}

function kindLabel(kind: string): string {
  return EVENT_KIND_LABELS[kind] ?? '潮声'
}

function openEntry(entryId: string): void {
  game.openEvent(entryId)
  ui.closePanel()
}

type InboxView = (typeof game.inboxViews)[number]

function entryHint(entry: InboxView): string {
  return [
    `开启「${entry.title}」`,
    `${kindLabel(entry.eventKind)}之事，${entry.kind === 'story' ? '时光已在它面前停驻，落定后才继续' : '可以此刻处理，也可以稍后再读'}`,
    entry.read ? '此信已读过' : '此信尚未读过',
  ].join('。')
}

const inboxTabs = computed(() => [
  { id: 'all', label: '全部', count: game.inboxViews.length },
  { id: 'unread', label: '未读', count: game.inboxViews.filter((entry) => !entry.read).length },
  { id: 'story', label: '故事', count: game.inboxViews.filter((entry) => entry.kind === 'story').length },
  { id: 'ambient', label: '潮声', count: game.inboxViews.filter((entry) => entry.kind !== 'story').length },
])

const kindTabs = computed(() => [
  { id: 'all', label: '诸事' },
  ...(Object.keys(EVENT_KIND_LABELS) as KindFilter[])
    .filter((kind) => game.inboxViews.some((entry) => entry.eventKind === kind))
    .map((kind) => ({
      id: kind,
      label: EVENT_KIND_LABELS[kind],
      count: game.inboxViews.filter((entry) => entry.eventKind === kind).length,
    })),
])

const visibleInbox = computed(() =>
  game.inboxViews.filter((entry) => {
    if (inboxFilter.value === 'unread' && entry.read) return false
    if (inboxFilter.value === 'story' && entry.kind !== 'story') return false
    if (inboxFilter.value === 'ambient' && entry.kind === 'story') return false
    if (kindFilter.value !== 'all' && entry.eventKind !== kindFilter.value) return false
    return true
  }),
)

function selectInboxFilter(id: string): void {
  inboxFilter.value = id as InboxFilter
}

function selectKind(id: string): void {
  kindFilter.value = id as KindFilter
}
</script>

<template>
  <div>
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="inboxTabs" :active="inboxFilter" @select="selectInboxFilter" />
        <TabBar size="sm" :tabs="kindTabs" :active="kindFilter" @select="selectKind" />
      </div>
    </Teleport>

    <p class="text-[13px] tracking-[0.24em] text-jade">
      共 {{ game.inboxViews.length }} 封 · 最多 8 封不丢
    </p>

    <div v-if="visibleInbox.length" class="mt-3 divide-y divide-line/70">
      <button
        v-for="entry in visibleInbox"
        :key="entry.id"
        type="button"
        class="flex w-full items-start justify-between gap-3 py-3 text-left transition hover:text-jade"
        v-hint="entryHint(entry)"
        @click="openEntry(entry.id)"
      >
        <span class="min-w-0">
          <span class="flex items-center gap-2">
            <span
              class="h-1.5 w-1.5 shrink-0 rounded-full"
              :class="entry.read ? 'bg-line' : 'bg-cinnabar'"
            ></span>
            <span
              class="truncate text-[14px]"
              :class="entry.read ? 'text-ink-soft' : 'font-medium text-ink'"
            >
              {{ entry.title }}
            </span>
          </span>
          <span class="mt-1 block pl-3.5 text-[13px] text-muted">
            {{ kindLabel(entry.eventKind) }} ·
            {{ entry.kind === 'story' ? '时光已停' : '可稍后处理' }}
          </span>
        </span>
        <span class="shrink-0 pt-0.5 text-[12px] tracking-[0.12em] text-muted">
          {{ entry.read ? '已读' : '未读' }}
        </span>
      </button>
    </div>

    <p v-else class="mt-3 text-[14px] leading-6 text-muted">
      眼下没有未拆的潮声。推进时间，或去龙庭旧册边等一等。
    </p>
  </div>
</template>
