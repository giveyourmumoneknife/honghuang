<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useGameStore } from '@/stores/game'
import { useUiStore } from '@/stores/ui'
import DetailModal from './components/DetailModal.vue'
import EventModal from './components/EventModal.vue'
import FunctionCard from './components/ui/FunctionCard.vue'
import HintBar from './components/ui/HintBar.vue'

const app = useAppStore()
const game = useGameStore()
const ui = useUiStore()

let tickTimer: number | undefined
const SPEEDS = [1, 4, 16] as const

const statusLabel = computed(() => {
  if (game.storyCount > 0) return '故事凝滞'
  if (game.manuallyPaused) return '手动暂停'
  if (game.paused) return '暂停中'
  return '潮水流转'
})

const statusTone = computed(() => {
  if (game.storyCount > 0 || game.manuallyPaused) return 'text-cinnabar'
  if (game.paused) return 'text-muted'
  return 'text-ink-soft'
})

const activeSlots = computed(() => game.idleSlotViews.filter((slot) => slot.active))

const activeSlotDetail = computed(() =>
  activeSlots.value.length
    ? activeSlots.value.map((slot) => slot.label).join(' · ')
    : '三槽皆停',
)

const factionDetail = computed(
  () =>
    `${game.factionState?.membership ? game.factionRankTitle : '门外客'} · 声望 ${game.factionState?.reputation ?? 0}`,
)

const mapDetail = computed(() => {
  const explored = game.siteViews.filter((site) => site.explored > 0).length
  return `${explored} / ${game.siteViews.length} 幽微 · 行旅 ${Math.floor(game.travelProgress)}`
})

const eraDetail = computed(() => {
  if (game.ending) return game.ending.title
  if (game.settlementReadiness.ready) return '劫末已至，可择法落笔'
  const next = game.nextPhaseInfo
  if (!next) return '此劫已走到尽头'
  return next.gateMet ? `${next.name}将自行推演` : `下一阶段 · ${next.name}`
})

const partnerDetail = computed(() => {
  const partner = game.featuredPartner
  if (!partner) return `${game.partnerViews.length} 段缘法尚未相接`
  return partner.bonded
    ? `已结缘 · 共 ${game.bondedPartnerCount} 位`
    : `${partner.favorLabel} · 情谊 ${partner.favor}`
})

const caveTitle = computed(() =>
  game.caveOpen ? game.caveStatus.label : '尚未寻得',
)

const caveDetail = computed(() => game.caveStatus.detail)

const standardEquippedCount = computed(
  () => game.standardGearSlotViews.filter((slot) => slot.equippedId).length,
)

const inventoryDetail = computed(() => '器物分类收着 · 点开看详情')

const equipmentDetail = computed(
  () =>
    `${standardEquippedCount.value} / ${game.standardGearSlotViews.length} 器位 · 攻 ${game.sheet.attack} 防 ${game.sheet.defense} 速 ${game.sheet.speed}`,
)

const trainingDetail = computed(() => {
  const view = game.trainingView
  if (view) {
    return `${view.modeName} · 交手 ${view.wins + view.losses} 场 · 余 ${Math.ceil(view.remainingMonths)} 月`
  }
  const regions = game.trainingRegionViews.length
  return regions > 0 ? `${regions} 处可往 · 带回常规器物` : '尚无可行之地'
})

const activeTreasure = computed(() =>
  game.treasureViews.find((treasure) => treasure.isActive),
)

const treasureDetail = computed(() =>
  activeTreasure.value
    ? `${activeTreasure.value.name} · ${activeTreasure.value.passiveText || '器灵在侧'}`
    : `${game.treasureViews.length} 件收在匣中`,
)

const artsDetail = computed(() => {
  const learned = game.techniqueViews.filter((view) => view.learned)
  const nodes = learned.reduce((sum, view) => sum + view.progress, 0)
  const slots = game.game.player.equippedTechniqueIds.length
  const divine = game.divineSummary
  return `${learned.length} 门入门 · ${nodes} 层已参透 · 法门 ${slots}/3 · 神通 ${divine.collected}/${divine.total}`
})

const beastDetail = computed(() => {
  const mount = game.mountViews.find((entry) => entry.active)
  const pet = game.petViews.find((entry) => entry.active)
  return `${mount ? `骑 ${mount.name}` : '未乘骑'} · ${pet ? `宠 ${pet.name}` : '未带宠'}`
})

const combatDetail = computed(() => {
  if (game.pendingEncounterCount > 0) {
    const first = game.pendingEncounterViews[0]
    return `${game.pendingEncounterCount} 处未决 · ${first?.name ?? ''}`
  }
  return game.lastCombat?.message ?? '眼下没有缠住你的东西'
})

const daoDetail = computed(() => {
  const summary = game.daoSummary
  const principle = summary.activePrinciple
  return `${summary.litNodes}/${summary.totalNodes} 星 · ${
    principle ? `道则「${principle.name}」` : '道则未定'
  } · 星痕 ${summary.marks}`
})

const worldBossDetail = computed(() => {
  const summary = game.worldBossSummary
  if (summary.ready > 0) return `${summary.ready} 道旧影现世 · 已退 ${summary.kills} 次`
  if (summary.cooling > 0) return `${summary.cooling} 道旧影退潮中 · 已退 ${summary.kills} 次`
  return summary.total > 0 ? '潮声里暂无异动' : '此劫尚未留下旧影'
})

const offlineSummary = computed(() => {
  const report = game.offlineReport
  if (!report) return ''
  const elapsed =
    report.elapsedSeconds >= 60
      ? `${Math.floor(report.elapsedSeconds / 60)} 分钟`
      : `${Math.floor(report.elapsedSeconds)} 秒`
  return `离开 ${elapsed}，潮水替你走了 ${report.gameMonths.toFixed(1)} 个月，修为 +${report.cultivation.toFixed(1)}。`
})

onMounted(async () => {
  await game.start()
  if (game.game.player.flags['meta.unborn']) {
    ui.openPanel('newgame')
  }
  tickTimer = window.setInterval(() => game.tick(1), 1000)
})

onUnmounted(() => {
  if (tickTimer !== undefined) window.clearInterval(tickTimer)
  void game.autoSave()
})

function setSpeed(speed: 1 | 4 | 16): void {
  game.setSpeed(speed)
}

const SPEED_HINTS: Record<number, string> = {
  1: '1×：每 60 秒过去 1 个月，适合细读故事',
  4: '4×：每 60 秒过去 4 个月，修炼与产出一同加快',
  16: '16×：每 60 秒过去 16 个月，适合挂机赶潮',
}

function speedHint(speed: number): string {
  return `${SPEED_HINTS[speed]}。${
    game.manuallyPaused ? '当前手动暂停，需先继续潮水' : '故事待决时时间会自动凝滞'
  }`
}

const pauseHint = computed(() =>
  game.manuallyPaused
    ? '恢复潮水：时间与三槽继续推进'
    : '暂停潮水：时间与三槽一同凝滞；故事待决时也会自动凝滞',
)

const newGameHint = computed(
  () =>
    `重开一世：进入创角，会替换当前此世并覆盖自动存档。当前为${game.eraLabel} · ${game.phaseLabel}。`,
)
</script>

<template>
  <main class="min-h-screen px-4 py-5 text-ink sm:px-6 md:py-7">
    <div class="mx-auto flex min-h-[calc(100vh-40px)] max-w-5xl flex-col sm:min-h-[calc(100vh-56px)]">
      <header class="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="grid h-11 w-11 shrink-0 place-items-center border border-cinnabar/60 text-cinnabar"
            aria-hidden="true"
          >
            <span class="font-serif text-xl leading-none">荒</span>
          </div>
          <div class="min-w-0">
            <p class="truncate text-[12px] tracking-[0.34em] text-cinnabar">
              HONGHUANG CHRONICLE · 潮声纪年
            </p>
            <h1 class="mt-1 font-serif text-3xl leading-none">{{ app.title }}</h1>
            <p class="mt-1 text-[13px] text-muted">
              {{ game.eraLabel }} · {{ game.phaseLabel }} · 单机放置文字 RPG
            </p>
          </div>
        </div>

        <div class="text-right text-[13px] leading-5 text-muted">
          <p>v{{ app.version }} · 本地自动存档</p>
          <p>{{ game.lastSavedLabel || '尚未写入' }}</p>
        </div>
      </header>

      <section class="paper-panel mt-3 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div class="flex min-w-0 items-center gap-3">
          <div class="shrink-0">
            <p class="text-[12px] tracking-[0.2em] text-muted">当下</p>
            <p class="mt-0.5 font-serif text-xl leading-none">
              第{{ game.calendar.year }}年 · {{ game.calendar.month }}月
            </p>
          </div>
          <div class="h-8 w-px shrink-0 bg-line"></div>
          <div class="min-w-0">
            <p class="flex items-center gap-2 text-[14px] font-medium" :class="statusTone">
              <span
                class="h-1.5 w-1.5 rounded-full"
                :class="game.paused ? 'bg-cinnabar' : 'bg-jade'"
              ></span>
              {{ statusLabel }}
            </p>
            <p class="mt-0.5 truncate text-[13px] text-muted">
              {{ game.paused
                ? `阻挡：${game.blockingTokens.map((token) => token.label).join(' · ')}`
                : '三槽并行 · 自动存档每 8 秒' }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="flex overflow-hidden rounded-sm border border-line">
            <button
              v-for="speed in SPEEDS"
              :key="speed"
              type="button"
              class="px-2.5 py-1.5 text-[14px] tracking-[0.08em] transition"
              :class="
                game.speed === speed
                  ? 'bg-ink text-paper'
                  : 'bg-paper/40 text-muted hover:text-ink'
              "
              v-hint="speedHint(speed)"
              @click="setSpeed(speed)"
            >
              {{ speed }}×
            </button>
          </div>
          <button
            type="button"
            class="rounded-sm border px-2.5 py-1.5 text-[14px] tracking-[0.08em] transition"
            :class="
              game.manuallyPaused
                ? 'border-cinnabar/50 bg-cinnabar/[0.05] text-cinnabar'
                : 'border-line bg-paper/40 text-muted hover:text-ink'
            "
            v-hint="pauseHint"
            @click="game.toggleManualPause()"
          >
            {{ game.manuallyPaused ? '继续' : '暂停' }}
          </button>
          <button
            type="button"
            class="rounded-sm border border-line bg-paper/40 px-2.5 py-1.5 text-[14px] tracking-[0.08em] text-muted transition hover:border-jade/40 hover:text-jade-deep"
            v-hint="newGameHint"
            @click="ui.openPanel('newgame')"
          >
            新世
          </button>
          <span
            v-if="game.storyCount > 0"
            class="rounded-sm bg-cinnabar px-2.5 py-1.5 text-[13px] tracking-[0.12em] text-paper"
          >
            待决故事 {{ game.storyCount }}
          </span>
        </div>
      </section>

      <div
        v-if="game.offlineReport"
        class="mt-2 flex items-center justify-between gap-3 rounded-sm border border-jade/25 bg-jade-soft px-3 py-2 text-[14px] text-ink-soft"
      >
        <span class="min-w-0">{{ offlineSummary }}</span>
        <button
          type="button"
          class="shrink-0 text-[13px] text-muted transition hover:text-jade-deep"
          @click="game.dismissOfflineReport()"
        >
          收起
        </button>
      </div>

      <section class="mt-5">
        <div class="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p class="text-[13px] tracking-[0.26em] text-jade">可行之事</p>
            <p class="mt-1 text-[13px] text-muted">
              主界面只留入口；详情、记录与旧忆都在弹窗中展开。
            </p>
          </div>
          <p v-if="game.upcomingScheduled.length" class="text-[13px] text-muted">
            潮水将带来：
            <span
              v-for="(entry, index) in game.upcomingScheduled"
              :key="entry.id"
              class="text-ink-soft"
            >
              <template v-if="index > 0"> · </template>{{ entry.title }}（{{ entry.dueIn }}后）
            </span>
          </p>
        </div>

        <div class="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          <FunctionCard
            label="修士"
            :title="game.game.player.name"
            :detail="`${game.realmLabel} · 修为 ${game.cultivationLabel}`"
            @select="ui.openPanel('character')"
          />
          <FunctionCard
            label="星图"
            title="周天星图"
            :detail="daoDetail"
            :badge="game.daoSummary.marks > 0 ? `星痕 ${game.daoSummary.marks}` : ''"
            :accent="game.daoSummary.litNodes > 0"
            @select="ui.openPanel('dao')"
          />
          <FunctionCard
            label="行止"
            :title="`${activeSlots.length} / 3 运转`"
            :detail="activeSlotDetail"
            :accent="activeSlots.length > 0"
            @select="ui.openPanel('idle')"
          />
          <FunctionCard
            label="地图"
            :title="game.currentRegion?.name ?? '山海图'"
            :detail="mapDetail"
            :accent="game.regionViews.some((entry) => entry.adjacent && !entry.visited)"
            @select="ui.openPanel('map')"
          />
          <FunctionCard
            label="劫数"
            :title="game.phaseLabel || '量劫'"
            :detail="eraDetail"
            :badge="game.settlementReadiness.ready ? '可结算' : ''"
            :accent="game.settlementReadiness.ready"
            @select="ui.openPanel('era')"
          />
          <FunctionCard
            label="势力"
            :title="game.faction?.name ?? '尚未入谱'"
            :detail="factionDetail"
            :accent="!!game.factionState?.membership"
            @select="ui.openPanel('faction')"
          />
          <FunctionCard
            label="缘法"
            :title="game.featuredPartner?.name ?? '尚未相逢'"
            :detail="partnerDetail"
            :accent="game.bondedPartnerCount > 0"
            @select="ui.openPanel('partner')"
          />
          <FunctionCard
            label="洞府"
            :title="caveTitle"
            :detail="caveDetail"
            :accent="game.caveOpen"
            @select="ui.openPanel('cave')"
          />
          <FunctionCard
            label="劫影"
            title="世界 Boss"
            :detail="worldBossDetail"
            :badge="game.worldBossSummary.ready > 0 ? '现世' : ''"
            :accent="game.worldBossSummary.ready > 0"
            @select="ui.openPanel('worldboss')"
          />
          <FunctionCard
            label="遭遇"
            :title="game.pendingEncounterCount > 0 ? `未决 ${game.pendingEncounterCount} 处` : '潮声暂息'"
            :detail="combatDetail"
            :badge="game.pendingEncounterCount > 0 ? '未决' : ''"
            :accent="game.pendingEncounterCount > 0"
            @select="ui.openPanel('combat')"
          />
          <FunctionCard
            label="收件箱"
            :title="`${game.inboxViews.length} 封`"
            :detail="game.storyCount > 0 ? `待决故事 ${game.storyCount}` : '眼下没有待决故事'"
            :badge="game.unreadCount > 0 ? `未读 ${game.unreadCount}` : ''"
            :accent="game.storyCount > 0"
            @select="ui.openPanel('inbox')"
          />
          <FunctionCard
            label="编年"
            :title="`${game.chronicle.length} 条`"
            detail="已落笔的史页"
            @select="ui.openArchive('chronicle')"
          />
          <FunctionCard
            label="潮声"
            :title="`${game.rumors.length} 条`"
            detail="风里带来的见闻"
            @select="ui.openArchive('rumors')"
          />
          <FunctionCard
            label="旧忆"
            :title="`${game.memories.length} 段`"
            detail="不愿忘却之事"
            @select="ui.openArchive('memories')"
          />
          <FunctionCard
            label="图鉴"
            title="洪荒图鉴"
            detail="器物 · 功法 · 灵契 · 山海"
            @select="ui.openPanel('codex')"
          />
          <FunctionCard
            label="案头"
            title="设置与存档"
            :detail="`三处手动存档 · ${game.lastSavedLabel || '尚未写入'}`"
            @select="ui.openPanel('settings')"
          />
          <FunctionCard
            label="背包"
            :title="`${game.inventoryViews.length} 种`"
            :detail="inventoryDetail"
            @select="ui.openPanel('inventory')"
          />
          <FunctionCard
            label="装备"
            :title="`${standardEquippedCount} / ${game.standardGearSlotViews.length} 器位`"
            :detail="equipmentDetail"
            :accent="game.sheet.gearSets.some((set) => set.activeThresholds.length > 0)"
            @select="ui.openPanel('equipment')"
          />
          <FunctionCard
            label="历练"
            :title="game.trainingView ? game.trainingView.regionName : '择地历练'"
            :detail="trainingDetail"
            :badge="game.trainingView ? '途中' : ''"
            :accent="!!game.trainingView"
            @select="ui.openPanel('training')"
          />
          <FunctionCard
            label="法宝"
            :title="activeTreasure?.name ?? '匣中无物'"
            :detail="treasureDetail"
            :accent="!!activeTreasure"
            @select="ui.openPanel('treasure')"
          />
          <FunctionCard
            label="功法"
            :title="`${game.techniqueViews.filter((view) => view.learned).length} 门`"
            :detail="artsDetail"
            @select="ui.openPanel('arts')"
          />
          <FunctionCard
            label="灵契"
            :title="`${game.mountViews.length} 骑 · ${game.petViews.length} 宠`"
            :detail="beastDetail"
            :accent="!!game.game.player.activeMountId || !!game.game.player.activePetId"
            @select="ui.openPanel('beast')"
          />
        </div>
      </section>

      <footer class="mt-auto pt-5">
        <div
          class="flex flex-col gap-1.5 border-t border-line pt-3 text-[13px] leading-5 text-muted sm:flex-row sm:items-center sm:justify-between"
        >
          <span>
            {{ game.eraLabel }} · {{ game.phaseLabel }} ·
            {{ app.demoSpec.map((item) => `${item.label} ${item.value}`).join(' · ') }}
          </span>
          <span>图鉴 / 存档 / 序章创角已开启 · 本地存档 · 零运营成本</span>
        </div>
      </footer>
    </div>

    <DetailModal />
    <EventModal />
    <HintBar />

    <Transition name="toast">
      <div
        v-if="game.toast"
        class="fixed inset-x-4 bottom-4 z-[80] mx-auto flex max-w-xl items-start justify-between gap-4 rounded-sm border border-jade/30 bg-surface px-4 py-3 shadow-xl shadow-ink/10"
      >
        <p class="min-w-0 text-[14px] leading-6 text-ink-soft">{{ game.toast }}</p>
        <button
          type="button"
          class="shrink-0 text-sm leading-6 text-muted transition hover:text-jade-deep"
          aria-label="收起提示"
          @click="game.dismissToast()"
        >
          ×
        </button>
      </div>
    </Transition>
  </main>
</template>
