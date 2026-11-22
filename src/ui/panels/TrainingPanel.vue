<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { TrainingMode } from '@/types/training'
import { useGameStore } from '@/stores/game'
import { encounterTierLabel } from '@/core/balance'
import { formatGameTime } from '@/core/time'
import { resourceLabel } from '@/ui/labels'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type TrainingTab = 'setup' | 'active' | 'reports'
type SetupSub = 'region' | 'mode'
type ReportFilter = 'all' | 'early'

const game = useGameStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const trainingTab = ref<TrainingTab>(game.trainingView ? 'active' : 'setup')
const setupSub = ref<SetupSub>('region')
const reportFilter = ref<ReportFilter>('all')
const selectedRegionId = ref('')
const selectedMode = ref<TrainingMode>('deep')

const regionId = computed(
  () =>
    selectedRegionId.value ||
    game.trainingRegionViews.find((region) => region.current)?.id ||
    game.trainingRegionViews[0]?.id ||
    '',
)

const selectedRegion = computed(() =>
  game.trainingRegionViews.find((region) => region.id === regionId.value),
)

const mode = computed(
  () => game.trainingModeViews.find((entry) => entry.id === selectedMode.value) ?? game.trainingModeViews[0],
)

const stones = computed(() => game.game.player.resources.spirit_stones ?? 0)
const travel = computed(() => Math.floor(game.travelProgress))

const canStart = computed(
  () =>
    !!selectedRegion.value &&
    !game.trainingView &&
    stones.value >= (mode.value?.stoneCost ?? 0) &&
    travel.value >= (mode.value?.travelCost ?? 0),
)

const LOG_TONES: Record<string, string> = {
  plain: 'text-muted',
  good: 'text-ink-soft',
  bad: 'text-cinnabar',
  fate: 'text-gold-deep',
}

function start(): void {
  if (!canStart.value) return
  game.startTraining(regionId.value, selectedMode.value)
}

function pickRegion(id: string): void {
  selectedRegionId.value = id
}

function resourceText(resources: Partial<Record<string, number>>): string {
  return Object.entries(resources)
    .filter(([, amount]) => (amount ?? 0) > 0)
    .map(([key, amount]) => `${resourceLabel(key)} +${Math.round(amount ?? 0)}`)
    .join(' · ')
}

type RegionView = (typeof game.trainingRegionViews)[number]
type ModeView = (typeof game.trainingModeViews)[number]

function tierRange(region: RegionView): string {
  if (region.tierMin === region.tierMax) return encounterTierLabel(region.tierMin)
  return `${encounterTierLabel(region.tierMin)}至${encounterTierLabel(region.tierMax)}`
}

function regionHint(region: RegionView): string {
  const route = region.current ? '你正身处此地' : '启程不会改变你当前所在的地域'
  return `在${region.name}历练：险度 ${region.danger}；敌势 ${tierRange(region)}；可遇 ${region.encounterNames.join('、') || '无名敌手'}；${route}。`
}

function intervalText(months: number): string {
  if (months >= 1) return `约每 ${Number(months.toFixed(1))} 月一战`
  return `约每 ${Math.max(1, Math.round(months * 30))} 日一战`
}

function modeHint(entry: ModeView): string {
  const quality = entry.qualityBonus > 0
    ? `器物品相 +${entry.qualityBonus.toFixed(2)}`
    : '器物品相如常'
  return `${entry.name}：历时 ${entry.months} 月，${intervalText(entry.battleInterval)}，最多 ${entry.maxBattles} 场；敌势 ×${entry.enemyScale.toFixed(2)}，修为 ×${entry.rewardScale.toFixed(2)}，${quality}，器物掉落率约 ${Math.round(entry.dropChance * 100)}%；耗行旅 ${entry.travelCost}、灵石 ${entry.stoneCost}。`
}

function startHint(): string {
  if (!selectedRegion.value || !mode.value) return '尚未择地定程。'
  const missing: string[] = []
  if (stones.value < mode.value.stoneCost) {
    missing.push(`灵石还差 ${mode.value.stoneCost - stones.value}`)
  }
  if (travel.value < mode.value.travelCost) {
    missing.push(`行旅还差 ${mode.value.travelCost - travel.value}`)
  }
  const body = `启程历练：${selectedRegion.value.name}·${mode.value.name}；${modeHint(mode.value)} 途中可随时提前收束。`
  return missing.length > 0 ? `${body} 此刻${missing.join('，')}。` : body
}

const stopHint = '提前收束：立即结算途中已得的修为、资财与器物；未走完的月份不再遇敌，也不退还启程所耗。'

const trainingTabs = computed(() => [
  { id: 'setup', label: '启程' },
  { id: 'active', label: '途中', count: game.trainingView ? 1 : 0 },
  { id: 'reports', label: '旧札', count: game.trainingReports.length },
])

const setupTabs = [
  { id: 'region', label: '择地' },
  { id: 'mode', label: '定程' },
]

const reportTabs = computed(() => [
  { id: 'all', label: '全部', count: game.trainingReports.length },
  {
    id: 'early',
    label: '提前收束',
    count: game.trainingReports.filter((report) => report.earlyStopped).length,
  },
])

const visibleReports = computed(() =>
  game.trainingReports.filter(
    (report) => reportFilter.value === 'all' || report.earlyStopped,
  ),
)

function selectTrainingTab(id: string): void {
  trainingTab.value = id as TrainingTab
}

function selectSetupSub(id: string): void {
  setupSub.value = id as SetupSub
}

function selectReportFilter(id: string): void {
  reportFilter.value = id as ReportFilter
}
</script>

<template>
  <div class="space-y-4">
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="trainingTabs" :active="trainingTab" @select="selectTrainingTab" />
        <TabBar
          v-if="trainingTab === 'setup'"
          size="sm"
          :tabs="setupTabs"
          :active="setupSub"
          @select="selectSetupSub"
        />
        <TabBar
          v-else-if="trainingTab === 'reports'"
          size="sm"
          :tabs="reportTabs"
          :active="reportFilter"
          @select="selectReportFilter"
        />
      </div>
    </Teleport>

    <template v-if="trainingTab === 'active' && game.trainingView">
      <section class="rounded-sm border border-jade/25 bg-jade-soft px-3 py-3">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[12px] tracking-[0.2em] text-jade">历练途中</p>
            <p class="mt-1 font-serif text-xl leading-tight">
              {{ game.trainingView.regionName }} · {{ game.trainingView.modeName }}
            </p>
            <p class="mt-1 text-[13px] leading-5 text-muted">
              {{ game.trainingView.modeDescription }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-sm border border-line px-2.5 py-1.5 text-[13px] text-muted transition hover:border-jade/40 hover:text-jade-deep"
            v-hint="stopHint"
            @click="game.stopTraining()"
          >
            提前收束
          </button>
        </div>

        <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-line/70">
          <div
            class="h-full rounded-full bg-jade/60 transition-[width] duration-500"
            :style="{ width: `${Math.round(game.trainingView.progress * 100)}%` }"
          ></div>
        </div>
        <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
          <span>余 {{ Math.ceil(game.trainingView.remainingMonths) }} 月</span>
          <span>交手 {{ game.trainingView.wins + game.trainingView.losses }} 场</span>
          <span>胜 {{ game.trainingView.wins }}</span>
          <span>负 {{ game.trainingView.losses }}</span>
          <span>修为 +{{ Math.round(game.trainingView.cultivation) }}</span>
          <span>还可遇敌 {{ game.trainingView.battlesLeft }} 次</span>
        </div>
        <p v-if="resourceText(game.trainingView.resources)" class="mt-1.5 text-[13px] text-muted">
          途中所得：{{ resourceText(game.trainingView.resources) }}
        </p>
        <p v-if="game.trainingView.bestGearName" class="mt-1.5 text-[13px] text-gold-deep">
          此行最佳：{{ game.trainingView.bestGearName }}
        </p>
        <div
          v-if="game.trainingView.secretRealms.length"
          class="mt-2 flex flex-wrap items-center gap-1.5"
        >
          <span class="text-[12px] text-muted">秘境奇遇</span>
          <span
            v-for="entry in game.trainingView.secretRealms"
            :key="entry.id"
            class="rounded-sm border border-jade/30 bg-white/30 px-2 py-0.5 text-[12px] text-jade-deep"
            v-hint="`${entry.name}：${entry.rewardText}`"
          >
            {{ entry.name }}
          </span>
        </div>
      </section>

      <section>
        <p class="text-[13px] tracking-[0.2em] text-muted">途中札记</p>
        <div class="mt-2 space-y-1.5">
          <p
            v-for="(entry, index) in game.trainingView.log"
            :key="index"
            class="rounded-sm border border-line/60 bg-white/20 px-2.5 py-1.5 text-[13px] leading-5"
            :class="LOG_TONES[entry.tone] ?? 'text-muted'"
          >
            <span class="mr-2 tabular-nums text-[12px] text-muted">{{ formatGameTime(entry.months) }}</span>
            {{ entry.text }}
          </p>
          <p v-if="!game.trainingView.log.length" class="text-[13px] text-muted">
            还没有遇敌。潮路会在下一个月把动静带来。
          </p>
        </div>
      </section>

      <section v-if="game.trainingView.gearNames.length">
        <p class="text-[13px] tracking-[0.2em] text-muted">已拾器物</p>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <span
            v-for="name in game.trainingView.gearNames"
            :key="name"
            class="rounded-sm border border-gold/35 bg-gold/[0.06] px-2 py-1 text-[12px] text-gold-deep"
          >
            {{ name }}
          </span>
        </div>
        <p class="mt-2 text-[12px] leading-5 text-muted">
          历练所得会直接放入器匣；可在装备面板比较、淬炼或拓印词条。
        </p>
      </section>
    </template>

    <template v-else-if="trainingTab === 'active'">
      <p class="rounded-sm border border-dashed border-line px-3 py-8 text-center text-[13px] leading-5 text-muted">
        此刻没有在路上的历练。去「启程」处择一条潮路，或在旧札里重读走过的路。
      </p>
    </template>

    <template v-else-if="trainingTab === 'setup'">
      <section v-if="setupSub === 'region'">
        <p class="text-[13px] leading-5 text-muted">
          历练是以六个月为一程的自动游历。途中自行遇敌、拾取常规器物；伤势过重时会停下调息，不会因此丧命。
        </p>
      </section>

      <section v-if="setupSub === 'region'">
        <div class="flex items-end justify-between gap-3">
          <p class="text-[13px] tracking-[0.2em] text-muted">择一处潮路</p>
          <p class="text-[12px] text-muted">行旅 {{ travel }} · 灵石 {{ stones }}</p>
        </div>
        <div v-if="game.trainingRegionViews.length" class="mt-2 grid grid-cols-2 gap-2">
          <button
            v-for="region in game.trainingRegionViews"
            :key="region.id"
            type="button"
            class="rounded-sm border px-2.5 py-2 text-left transition"
            :class="
              region.id === regionId
                ? 'border-jade/45 bg-jade-soft'
                : 'border-line/80 bg-white/20 hover:border-jade/35'
            "
            v-hint="regionHint(region)"
            @click="pickRegion(region.id)"
          >
            <span class="flex items-center justify-between gap-2">
              <span class="truncate text-[14px]">{{ region.name }}</span>
              <span class="shrink-0 text-[12px] text-muted">险 {{ region.danger }} · {{ tierRange(region) }}</span>
            </span>
            <span class="mt-1 block truncate text-[12px] text-muted">
              {{ region.encounterNames.join(' · ') }}
            </span>
          </button>
        </div>
        <p v-else class="mt-2 rounded-sm border border-line/70 px-3 py-2 text-[13px] leading-5 text-muted">
          还没有接上任何可历练的潮路。先在地图上走近一处有敌迹的地域。
        </p>
      </section>

      <section v-if="setupSub === 'mode'">
        <p class="text-[13px] tracking-[0.2em] text-muted">定一程深浅</p>
        <div class="mt-2 space-y-2">
          <button
            v-for="entry in game.trainingModeViews"
            :key="entry.id"
            type="button"
            class="block w-full rounded-sm border px-3 py-2.5 text-left transition"
            :class="
              entry.id === selectedMode
                ? 'border-jade/45 bg-jade-soft'
                : 'border-line/80 bg-white/20 hover:border-jade/35'
            "
            v-hint="modeHint(entry)"
            @click="selectedMode = entry.id"
          >
            <span class="flex flex-wrap items-center justify-between gap-2">
              <span class="font-serif text-base">{{ entry.name }}</span>
              <span class="text-[12px]" :class="entry.tone">
                行旅 {{ entry.travelCost }} · 灵石 {{ entry.stoneCost }}
              </span>
            </span>
            <span class="mt-1 block text-[13px] leading-5 text-muted">{{ entry.description }}</span>
            <span class="mt-1 block text-[12px] text-muted">
              敌势 ×{{ entry.enemyScale.toFixed(2) }} · 修为 ×{{ entry.rewardScale.toFixed(2) }} ·
              器物品相 {{ entry.qualityBonus > 0 ? `+${entry.qualityBonus.toFixed(2)}` : '如常' }}
            </span>
          </button>
        </div>
      </section>

      <section v-if="setupSub === 'mode'" class="rounded-sm border border-line/80 px-3 py-2.5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[14px]">
              {{ selectedRegion?.name ?? '尚未择地' }} · {{ mode?.name ?? '历练' }}
            </p>
            <p class="mt-1 text-[12px] leading-4 text-muted">
              抵达后六个月内自行遇敌，{{ intervalText(mode?.battleInterval ?? 1) }}；最多
              {{ mode?.maxBattles ?? 0 }} 场。
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-sm border px-3 py-1.5 text-[13px] tracking-[0.08em] transition"
            :class="
              canStart
                ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                : 'cursor-not-allowed border-line text-muted'
            "
            :disabled="!canStart"
            v-hint="startHint()"
            @click="start"
          >
            {{ canStart ? '启程历练' : '尚不可行' }}
          </button>
        </div>
        <p v-if="selectedRegion && !canStart && !game.trainingView" class="mt-2 text-[12px] leading-4 text-muted">
          <template v-if="stones < (mode?.stoneCost ?? 0)">灵石不足；</template>
          <template v-if="travel < (mode?.travelCost ?? 0)">行旅不足，需再等潮路积攒；</template>
          启程后不会改变你当前所在的地域。
        </p>
      </section>
    </template>

    <template v-else>
      <p
        v-if="!visibleReports.length"
        class="rounded-sm border border-dashed border-line px-3 py-8 text-center text-[13px] text-muted"
      >
        这一类里还没有旧札。走完或提前收束一程历练，都会留下一条路数。
      </p>

      <section v-else>
        <p class="text-[13px] tracking-[0.2em] text-muted">行囊里的旧札</p>
        <div class="mt-2 space-y-1.5">
          <article
            v-for="report in visibleReports"
            :key="report.id"
            class="rounded-sm border border-line/70 px-2.5 py-2"
          >
            <p class="text-[13px] text-ink-soft">
              {{ report.regionName }} · {{ report.modeName }}
              <span v-if="report.earlyStopped" class="text-[12px] text-muted">（提前收束）</span>
            </p>
            <p class="mt-1 text-[12px] leading-4 text-muted">
              胜 {{ report.wins }} · 负 {{ report.losses }} · 修为 +{{ Math.round(report.cultivation) }}
              <template v-if="resourceText(report.resources)"> · {{ resourceText(report.resources) }}</template>
              <template v-if="report.bestGearName"> · 最佳 {{ report.bestGearName }}</template>
              <template v-if="report.secretRealms?.length"> · 秘境 {{ report.secretRealms.length }} 处</template>
            </p>
            <p
              v-if="report.secretRealms?.length"
              class="mt-1 text-[12px] leading-4 text-jade-deep"
            >
              <span
                v-for="entry in report.secretRealms"
                :key="entry.id"
                class="mr-2 inline-block"
                v-hint="`${entry.name}：${entry.rewardText}`"
              >
                {{ entry.name }}
              </span>
            </p>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>