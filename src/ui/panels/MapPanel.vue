<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { TRAVEL_PROGRESS_CAP } from '@/core/idle'
import { useGameStore } from '@/stores/game'
import { describeRequirements, regionKindLabel } from '../labels'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type MapTab = 'overview' | 'sites' | 'roads'
type SiteFilter = 'all' | 'explored' | 'unexplored'
type RoadFilter = 'all' | 'open' | 'closed'

const game = useGameStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const mapTab = ref<MapTab>('overview')
const siteFilter = ref<SiteFilter>('all')
const roadFilter = ref<RoadFilter>('all')

const progressPercent = computed(() =>
  Math.min(100, (game.travelProgress / TRAVEL_PROGRESS_CAP) * 100),
)

const region = computed(() => game.region)

const exploredHere = computed(
  () => game.siteViews.filter((site) => site.explored > 0).length,
)

type SiteView = (typeof game.siteViews)[number]
type RegionView = (typeof game.regionViews)[number]

const hasEncounters = computed(
  () => (region.value?.encounterIds?.length ?? 0) > 0,
)

const encounterChance = computed(() => {
  const danger = region.value?.danger ?? 0
  return Math.min(45, Math.round((0.1 + danger * 0.035) * 100))
})

const mapTabs = computed(() => [
  { id: 'overview', label: '概览' },
  { id: 'sites', label: '幽微', count: game.siteViews.length },
  { id: 'roads', label: '潮路', count: game.regionViews.length },
])

const siteTabs = computed(() => [
  { id: 'all', label: '全部', count: game.siteViews.length },
  { id: 'explored', label: '已探', count: game.siteViews.filter((site) => site.explored > 0).length },
  { id: 'unexplored', label: '未探', count: game.siteViews.filter((site) => site.explored <= 0).length },
])

const roadTabs = computed(() => [
  { id: 'all', label: '全部', count: game.regionViews.length },
  { id: 'open', label: '已通', count: game.regionViews.filter((entry) => entry.unlocked).length },
  { id: 'closed', label: '未通', count: game.regionViews.filter((entry) => !entry.unlocked).length },
])

const visibleSites = computed(() =>
  game.siteViews.filter((site) => {
    if (siteFilter.value === 'explored') return site.explored > 0
    if (siteFilter.value === 'unexplored') return site.explored <= 0
    return true
  }),
)

const visibleRegions = computed(() =>
  game.regionViews.filter((entry) => {
    if (roadFilter.value === 'open') return entry.unlocked
    if (roadFilter.value === 'closed') return !entry.unlocked
    return true
  }),
)

function selectMapTab(id: string): void {
  mapTab.value = id as MapTab
}

function selectSiteFilter(id: string): void {
  siteFilter.value = id as SiteFilter
}

function selectRoadFilter(id: string): void {
  roadFilter.value = id as RoadFilter
}

function exploreHint(site: SiteView): string {
  const parts = [
    `${site.firstVisit ? '初探' : '再探'}${site.name} · 耗行旅 ${site.exploreCost}（现有 ${Math.floor(game.travelProgress)}）`,
  ]
  if (!site.accessible) {
    parts.push(
      site.unmet.length
        ? `因缘尚缺：${describeRequirements(site.unmet)}`
        : '入口还未向你显露',
    )
    return parts.join('。')
  }
  if (game.travelProgress < site.exploreCost) {
    parts.push(`行旅不足，还差 ${Math.ceil(site.exploreCost - game.travelProgress)}`)
  }
  if (site.firstVisit) {
    parts.push(
      '初次涉足会留下编年与记忆，带出一份此地物产，并可能传出一段风闻；若有势力盘踞，声望 +2',
    )
  } else {
    parts.push('旧地重游约有 55% 机会带回少量物产，其中两成机会多带一份')
    const danger = region.value?.danger ?? 0
    if (danger >= 4) {
      parts.push(
        `险度 ${danger}，约有 ${Math.round((danger === 5 ? 0.22 : 0.12) * 100)}% 概率负伤并中「行旅劳顿」两月`,
      )
    }
  }
  if (hasEncounters.value) {
    parts.push(`暗处可能藏着遭遇，此地约 ${encounterChance.value}% 概率撞见`)
  }
  return parts.join('。')
}

function travelHint(entry: RegionView): string {
  if (entry.isCurrent) return `你正身在${entry.name}，不必再动身`
  const parts = [
    `前往${entry.name} · 耗行旅 ${entry.travelCost}（现有 ${Math.floor(game.travelProgress)}）`,
  ]
  if (!entry.revealed) parts.push('真名未显，此路要多耗行旅')
  if (!entry.unlocked) {
    if (!entry.adjacent) parts.push('潮路不接，须先从相邻之地踏入')
    else if (!entry.requirementsMet) {
      parts.push(`因缘尚缺：${describeRequirements(entry.unmet)}`)
    }
  }
  if (entry.canTravel) {
    if (!entry.visited && entry.revealed) {
      parts.push('初至会留下编年，并可能带回一段风闻')
    }
    parts.push('旅程本身不耗月份；历练未收束时不能动身')
  } else if (entry.adjacent && game.travelProgress < entry.travelCost) {
    parts.push(`行旅不足，还差 ${Math.ceil(entry.travelCost - game.travelProgress)}`)
  }
  return parts.join('。')
}

function travel(regionId: string): void {
  game.travelTo(regionId as Parameters<typeof game.travelTo>[0])
}

function explore(siteId: string): void {
  game.exploreSite(siteId as Parameters<typeof game.exploreSite>[0])
}
</script>

<template>
  <div class="space-y-5">
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="mapTabs" :active="mapTab" @select="selectMapTab" />
        <TabBar
          v-if="mapTab === 'sites'"
          size="sm"
          :tabs="siteTabs"
          :active="siteFilter"
          @select="selectSiteFilter"
        />
        <TabBar
          v-else-if="mapTab === 'roads'"
          size="sm"
          :tabs="roadTabs"
          :active="roadFilter"
          @select="selectRoadFilter"
        />
      </div>
    </Teleport>

    <section v-if="mapTab === 'overview'">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-serif text-2xl leading-none">{{ region?.name ?? '无名之地' }}</p>
            <span class="rounded-sm border border-line px-1.5 py-0.5 text-[12px] text-muted">
              {{ region ? regionKindLabel(region.kind) : '未知' }} · 险度
              {{ region?.danger ?? 0 }}
            </span>
          </div>
          <p class="mt-2 max-w-xl text-[14px] leading-6 text-muted">{{ region?.description }}</p>
        </div>
        <div class="shrink-0 rounded-sm border border-line/80 bg-paper px-3 py-2 text-right">
          <p class="text-[12px] tracking-[0.18em] text-muted">此地已涉足</p>
          <p class="mt-0.5 font-serif text-lg leading-none">
            {{ exploredHere }} / {{ game.siteViews.length }}
          </p>
        </div>
      </div>

      <div class="mt-4 rounded-sm border border-line/80 px-3 py-2.5">
        <div class="flex items-center justify-between text-[13px]">
          <span class="text-muted">行旅积蓄</span>
          <span class="tabular-nums">{{ Math.floor(game.travelProgress) }} / {{ TRAVEL_PROGRESS_CAP }}</span>
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-line/70">
          <div
            class="h-full rounded-full bg-jade/60 transition-[width] duration-500"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
        <p class="mt-1.5 text-[12px] leading-4 text-muted">
          游历槽运转时持续积蓄；每行一段路消耗 10，探一处幽微消耗 6。
        </p>
      </div>
    </section>

    <section v-if="mapTab === 'sites'">
      <div class="flex items-end justify-between gap-3">
        <div>
          <p class="text-[13px] tracking-[0.22em] text-jade">此地幽微</p>
          <p class="mt-1 text-[13px] text-muted">首次涉足会留下不同的见闻，旧地重游亦有薄获。</p>
        </div>
      </div>

      <p
        v-if="!visibleSites.length"
        class="mt-2.5 rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted"
      >
        这一分类里没有幽微。
      </p>

      <div v-else class="mt-2.5 grid gap-2 sm:grid-cols-2">
        <article
          v-for="site in visibleSites"
          :key="site.id"
          class="flex flex-col rounded-sm border p-3"
          :class="
            site.accessible
              ? 'border-line/80 bg-white/25'
              : 'border-dashed border-line/80 bg-paper/20'
          "
        >
          <div class="flex items-start justify-between gap-2">
            <p class="min-w-0 font-serif text-lg leading-tight" :class="site.revealed ? 'text-ink' : 'text-muted'">
              {{ site.name }}
            </p>
            <span
              v-if="site.explored > 0"
              class="shrink-0 rounded-sm border border-line px-1.5 py-0.5 text-[12px] text-muted"
            >
              涉足 {{ site.explored }}
            </span>
          </div>
          <p class="mt-1.5 flex-1 text-[13px] leading-5 text-muted">{{ site.description }}</p>
          <p
            v-if="!site.accessible && site.unmet.length"
            class="mt-2 text-[12px] leading-4 text-cinnabar/80"
          >
            尚缺：{{ describeRequirements(site.unmet) }}
          </p>
          <button
            type="button"
            class="mt-2.5 rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
            :class="
              site.canExplore
                ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                : 'cursor-not-allowed border-line text-muted'
            "
            :disabled="!site.canExplore"
            v-hint="exploreHint(site)"
            @click="explore(site.id)"
          >
            {{ !site.accessible
              ? '因缘未至'
              : site.canExplore
                ? `${site.firstVisit ? '初探' : '再探'} · 行旅 ${site.exploreCost}`
                : `需行旅 ${site.exploreCost}` }}
          </button>
        </article>
      </div>
    </section>

    <section v-if="mapTab === 'roads'">
      <div class="flex items-end justify-between gap-3">
        <div>
          <p class="text-[13px] tracking-[0.22em] text-jade">潮路所向</p>
          <p class="mt-1 text-[13px] text-muted">只能从相邻之地踏入未知；走过后，旧路会记住你。</p>
        </div>
      </div>

      <p
        v-if="!visibleRegions.length"
        class="mt-2.5 rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted"
      >
        这一分类里没有潮路。
      </p>

      <div v-else class="mt-2.5 grid gap-2 sm:grid-cols-2">
        <article
          v-for="entry in visibleRegions"
          :key="entry.id"
          class="rounded-sm border p-3"
          :class="
            entry.isCurrent
              ? 'border-jade/45 bg-jade-soft'
              : entry.revealed
                ? 'border-line/80 bg-white/25'
                : 'border-dashed border-line/80 bg-paper/20'
          "
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p
                class="truncate font-serif text-lg leading-tight"
                :class="entry.revealed ? 'text-ink' : 'text-muted'"
              >
                {{ entry.name }}
              </p>
              <p class="mt-0.5 text-[12px] text-muted">
                {{ entry.revealed ? regionKindLabel(entry.kind) : '未明' }}
                · 幽微 {{ entry.exploredSiteCount }} / {{ entry.siteCount }}
                <template v-if="entry.factionNames.length">
                  · {{ entry.factionNames.join(' / ') }}
                </template>
              </p>
            </div>
            <span
              class="shrink-0 rounded-sm border px-1.5 py-0.5 text-[12px]"
              :class="
                entry.isCurrent
                  ? 'border-jade/40 text-jade-deep'
                  : entry.visited
                    ? 'border-line text-ink-soft'
                    : 'border-line text-muted'
              "
            >
              {{ entry.isCurrent ? '身在' : entry.visited ? '旧游' : entry.unlocked ? '已通' : '未通' }}
            </span>
          </div>

          <p class="mt-1.5 text-[13px] leading-5 text-muted">{{ entry.description }}</p>

          <p
            v-if="!entry.isCurrent && entry.revealed && !entry.requirementsMet && entry.unmet.length"
            class="mt-2 text-[12px] leading-4 text-cinnabar/80"
          >
            尚缺：{{ describeRequirements(entry.unmet) }}
          </p>

          <button
            type="button"
            class="mt-2.5 w-full rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
            :class="
              entry.canTravel
                ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                : 'cursor-not-allowed border-line text-muted'
            "
            :disabled="!entry.canTravel"
            v-hint="travelHint(entry)"
            @click="travel(entry.id)"
          >
            {{
              entry.isCurrent
                ? '此地即是'
                : entry.canTravel
                  ? `前往 · 行旅 ${entry.travelCost}`
                  : entry.adjacent
                    ? entry.travelProgress < entry.travelCost
                      ? `需行旅 ${entry.travelCost}`
                      : '因缘未至'
                    : '先至相邻之地'
            }}
          </button>
        </article>
      </div>
    </section>
  </div>
</template>
