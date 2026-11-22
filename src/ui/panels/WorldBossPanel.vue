<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { useUiStore } from '@/stores/ui'
import { describeRequirements } from '../labels'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type BossTab = 'present' | 'record' | 'codex'
type PresentFilter = 'all' | 'ready' | 'cooling' | 'hidden'
type RecordFilter = 'all' | 'first' | 'again'
type CodexFilter = 'all' | 'seen' | 'unknown'

const game = useGameStore()
const ui = useUiStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const bossTab = ref<BossTab>('present')
const presentFilter = ref<PresentFilter>('all')
const recordFilter = ref<RecordFilter>('all')
const codexFilter = ref<CodexFilter>('all')
const expandedId = ref<string | null>(null)

type BossView = (typeof game.worldBossViews)[number]

const STATUS_LABELS: Record<BossView['status'], string> = {
  ready: '现世',
  cooling: '退潮',
  locked: '未至',
  hidden: '未显',
  ending: '已落笔',
}

const STATUS_TONES: Record<BossView['status'], string> = {
  ready: 'border-cinnabar/40 bg-cinnabar/[0.04] text-cinnabar',
  cooling: 'border-line bg-ink-soft/[0.04] text-muted',
  locked: 'border-line bg-white/30 text-muted',
  hidden: 'border-dashed border-line bg-white/20 text-muted',
  ending: 'border-line bg-white/20 text-muted',
}

const summary = computed(() => game.worldBossSummary)

const tabs = computed(() => [
  { id: 'present', label: '现世', count: summary.value.ready },
  { id: 'record', label: '战记', count: summary.value.kills },
  { id: 'codex', label: '图鉴', count: game.worldBossViews.filter((boss) => boss.revealed).length },
])

const presentTabs = computed(() => [
  { id: 'all', label: '全部', count: game.worldBossViews.length },
  {
    id: 'ready',
    label: '现世',
    count: game.worldBossViews.filter((boss) => boss.status === 'ready').length,
  },
  {
    id: 'cooling',
    label: '退潮',
    count: game.worldBossViews.filter((boss) => boss.status === 'cooling').length,
  },
  {
    id: 'hidden',
    label: '未显',
    count: game.worldBossViews.filter((boss) => !boss.revealed).length,
  },
])

const recordTabs = computed(() => {
  const records = bossRecords.value
  return [
    { id: 'all', label: '全部', count: records.length },
    {
      id: 'first',
      label: '初退',
      count: records.filter((entry) => entry.id.includes('初退')).length,
    },
    {
      id: 'again',
      label: '再退',
      count: records.filter((entry) => entry.id.includes('再退')).length,
    },
  ]
})

const codexTabs = computed(() => [
  { id: 'all', label: '全部', count: game.worldBossViews.length },
  {
    id: 'seen',
    label: '已识',
    count: game.worldBossViews.filter((boss) => boss.revealed).length,
  },
  {
    id: 'unknown',
    label: '未识',
    count: game.worldBossViews.filter((boss) => !boss.revealed).length,
  },
])

const presentBosses = computed(() =>
  game.worldBossViews.filter((boss) => {
    if (presentFilter.value === 'ready') return boss.status === 'ready'
    if (presentFilter.value === 'cooling') return boss.status === 'cooling'
    if (presentFilter.value === 'hidden') return !boss.revealed
    return true
  }),
)

const codexBosses = computed(() =>
  game.worldBossViews.filter((boss) => {
    if (codexFilter.value === 'seen') return boss.revealed
    if (codexFilter.value === 'unknown') return !boss.revealed
    return true
  }),
)

const bossRecords = computed(() =>
  game.chronicle.filter((entry) => entry.id.startsWith('chronicle:worldboss:')),
)

const visibleRecords = computed(() =>
  bossRecords.value.filter((entry) => {
    if (recordFilter.value === 'first') return entry.title.includes('初退')
    if (recordFilter.value === 'again') return entry.title.includes('再退')
    return true
  }),
)

function selectTab(id: string): void {
  bossTab.value = id as BossTab
  expandedId.value = null
}

function selectPresentFilter(id: string): void {
  presentFilter.value = id as PresentFilter
}

function selectRecordFilter(id: string): void {
  recordFilter.value = id as RecordFilter
}

function selectCodexFilter(id: string): void {
  codexFilter.value = id as CodexFilter
}

function displayName(boss: BossView): string {
  return boss.revealed ? boss.name : '未名之影'
}

function displayTitle(boss: BossView): string {
  return boss.revealed ? boss.title : '旧誓碑下尚未睁开的一道轮廓'
}

function toggleBoss(bossId: string): void {
  expandedId.value = expandedId.value === bossId ? null : bossId
}

function totalStats(boss: BossView): string {
  const totals = boss.enemyStats.reduce<{
    health: number
    attack: number
    defense: number
  }>(
    (sum, stats) => ({
      health: sum.health + (stats.health ?? 0),
      attack: sum.attack + (stats.attack ?? 0),
      defense: sum.defense + (stats.defense ?? 0),
    }),
    { health: 0, attack: 0, defense: 0 },
  )
  return `气血 ${totals.health} · 攻势 ${totals.attack} · 护体 ${totals.defense}`
}

function statusHint(boss: BossView): string {
  if (boss.status === 'cooling') {
    return `退潮中：还需 ${boss.coolingMonths} 个月才会重新现世；已退 ${boss.kills} 次，下次强度 ${boss.scalePercent}%。`
  }
  if (boss.status === 'ending') return '此劫已经落笔，旧影不再回应挑战。'
  if (!boss.revealed) return '它还没有显形。先顺着与此劫有关的旧事走下去。'
  if (boss.status === 'locked') {
    return `因缘未至：${describeRequirements(boss.unmet)}。`
  }
  if (boss.pending) return '它已经在等你出手，前往遭遇应战即可。'
  return ''
}

function challengeHint(boss: BossView): string {
  const guaranteed = boss.guaranteedDropViews
    .filter((entry) => !entry.drop.firstKillOnly || !boss.firstKillDone)
    .map((entry) => entry.label)
    .join('、')
  const sigil = boss.sigil
  const sigilLine =
    sigil && !boss.firstKillDone
      ? `；初退另留「${sigil.name}」`
      : ''
  return `挑战「${boss.name}」：本次强度 ${boss.scalePercent}%，${totalStats(boss)}；敌方不会退让，败则气血跌至约 22%。胜后必得 ${guaranteed || '旧潮余响'}${sigilLine}，并从它的旧物中随机带走 ${boss.dropPicks[0]}-${boss.dropPicks[1]} 份；${boss.respawnMonths} 个月后复活，且每次复活都会更强一线。`
}

function challenge(boss: BossView): void {
  if (!boss.canChallenge) return
  if (game.challengeWorldBoss(boss.id)) {
    ui.closePanel()
    ui.openPanel('combat')
  }
}

function firstKillLabel(boss: BossView): string {
  if (!boss.firstKilledAtMonths) return ''
  return `初退于第 ${Math.floor(boss.firstKilledAtMonths / 12) + 1} 年`
}
</script>

<template>
  <div class="space-y-4">
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="tabs" :active="bossTab" @select="selectTab" />
        <TabBar
          v-if="bossTab === 'present'"
          size="sm"
          :tabs="presentTabs"
          :active="presentFilter"
          @select="selectPresentFilter"
        />
        <TabBar
          v-else-if="bossTab === 'record'"
          size="sm"
          :tabs="recordTabs"
          :active="recordFilter"
          @select="selectRecordFilter"
        />
        <TabBar
          v-else
          size="sm"
          :tabs="codexTabs"
          :active="codexFilter"
          @select="selectCodexFilter"
        />
      </div>
    </Teleport>

    <template v-if="bossTab === 'present'">
      <section class="rounded-sm border border-line/70 bg-white/20 px-3 py-2.5">
        <p class="text-[13px] leading-5 text-muted">
          世界 Boss 是原身留在这一劫的分身。它们不会真正死去，只会在退潮后记住你，带着比上一次更硬的壳回来。
        </p>
        <p class="mt-1 text-[12px] text-muted">
          现世 {{ summary.ready }} · 退潮 {{ summary.cooling }} · 已退影 {{ summary.kills }} 次
        </p>
      </section>

      <p
        v-if="!presentBosses.length"
        class="rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted"
      >
        这个分类里没有旧影。潮水还在别处翻动。
      </p>

      <article
        v-for="boss in presentBosses"
        :key="boss.id"
        class="rounded-sm border bg-white/25 p-3 transition"
        :class="
          boss.status === 'ready'
            ? 'border-cinnabar/30'
            : boss.revealed
              ? 'border-line/80'
              : 'border-dashed border-line/80'
        "
      >
        <button
          type="button"
          class="flex w-full items-start justify-between gap-2 text-left"
          @click="toggleBoss(boss.id)"
        >
          <div class="min-w-0">
            <p class="font-serif text-lg leading-tight">{{ displayName(boss) }}</p>
            <p class="mt-0.5 text-[12px] leading-4 text-muted">{{ displayTitle(boss) }}</p>
            <p v-if="boss.revealed" class="mt-0.5 text-[12px] text-muted">
              {{ boss.regionName }} · 强度 {{ boss.scalePercent }}% · 交手 {{ boss.attempts }} 次
            </p>
          </div>
          <div class="flex shrink-0 flex-col items-end gap-1">
            <span class="rounded-sm border px-1.5 py-0.5 text-[12px]" :class="STATUS_TONES[boss.status]">
              {{ boss.status === 'cooling' ? `退潮 ${boss.coolingMonths} 月` : STATUS_LABELS[boss.status] }}
            </span>
            <span v-if="boss.kills > 0" class="text-[12px] text-muted">已退 {{ boss.kills }} 次</span>
          </div>
        </button>

        <p v-if="boss.revealed" class="mt-1.5 text-[13px] leading-5 text-muted">
          {{ boss.summary }}
        </p>
        <p v-else class="mt-1.5 text-[13px] leading-5 text-muted">
          它的名字被潮声遮住。与此劫相关的事再走远一些，或许会听见它在旧誓碑下翻身。
        </p>

        <p
          v-if="statusHint(boss) && boss.status !== 'ready'"
          class="mt-1.5 rounded-sm border border-dashed border-line/70 px-2.5 py-1.5 text-[12px] leading-4 text-muted"
        >
          {{ statusHint(boss) }}
        </p>

        <div v-if="expandedId === boss.id" class="mt-2 space-y-2 border-t border-line/60 pt-2">
          <p class="text-[12px] leading-4 text-muted">{{ boss.description }}</p>
          <p class="text-[12px] leading-4 text-ink-soft">原身：{{ boss.originalBody }}</p>
          <div v-if="boss.revealed" class="rounded-sm border border-line/60 px-2.5 py-2 text-[12px] leading-4">
            <p class="text-muted">
              本体现世：{{ totalStats(boss) }}
            </p>
            <p v-if="boss.sigil" class="mt-0.5 text-ink-soft">
              初退信物：{{ boss.firstKillDone ? '已取' : boss.sigil.name }}
              <span class="text-muted">（收集四道原身信物，旧誓碑才会回应）</span>
            </p>
            <p class="mt-0.5 text-muted">
              必得：{{ boss.guaranteedDropViews.map((entry) => entry.label).join('、') }}
            </p>
            <p class="mt-0.5 text-muted">
              随机旧物：{{ boss.dropViews.map((entry) => entry.label).join('、') }}
            </p>
            <p class="mt-0.5 text-muted">
              退潮 {{ boss.respawnMonths }} 月 · 每次复活强度 +{{ Math.round(boss.killScale * 100) }}%（至 {{ Math.round(boss.maxScale * 100) }}%）
            </p>
            <p v-if="firstKillLabel(boss)" class="mt-0.5 text-jade-deep">{{ firstKillLabel(boss) }}</p>
          </div>
          <p v-if="!boss.requirementsMet && boss.revealed" class="text-[12px] leading-4 text-cinnabar">
            尚未满足：{{ describeRequirements(boss.unmet) }}
          </p>
        </div>

        <div class="mt-2 flex items-center justify-between gap-2">
          <button
            type="button"
            class="text-[12px] text-muted transition hover:text-jade-deep"
            @click="toggleBoss(boss.id)"
          >
            {{ expandedId === boss.id ? '收起详情' : '展开详情' }}
          </button>
          <button
            v-if="boss.pending"
            type="button"
            class="rounded-sm border border-cinnabar/30 bg-cinnabar/[0.04] px-2.5 py-1.5 text-[13px] tracking-[0.08em] text-cinnabar transition hover:border-cinnabar/60"
            @click="ui.openPanel('combat')"
          >
            前往应战
          </button>
          <button
            v-else
            type="button"
            class="rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
            :class="
              boss.canChallenge
                ? 'border-cinnabar/40 bg-cinnabar/[0.04] text-cinnabar hover:border-cinnabar/70'
                : 'cursor-not-allowed border-line bg-white/20 text-muted'
            "
            :disabled="!boss.canChallenge"
            v-hint="boss.canChallenge ? challengeHint(boss) : statusHint(boss)"
            @click="challenge(boss)"
          >
            {{ boss.status === 'cooling' ? '退潮中' : boss.canChallenge ? '寻它出手' : '尚不可战' }}
          </button>
        </div>
      </article>
    </template>

    <template v-else-if="bossTab === 'record'">
      <section class="rounded-sm border border-line/70 bg-white/20 px-3 py-2.5 text-[13px] leading-5 text-muted">
        已退影 {{ summary.kills }} 次，现世 {{ summary.ready }} 道，退潮 {{ summary.cooling }} 道。
        每次退影都会写入编年，原身不会忘记。
      </section>

      <p
        v-if="!visibleRecords.length"
        class="rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted"
      >
        还没有与旧影交手的记录。
      </p>

      <article
        v-for="entry in visibleRecords"
        :key="entry.id"
        class="rounded-sm border border-line/80 bg-white/25 p-3"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="font-serif text-[15px] leading-tight">{{ entry.title }}</p>
          <span class="shrink-0 text-[12px] text-muted">第 {{ entry.year }} 年</span>
        </div>
        <p class="mt-1 text-[13px] leading-5 text-muted">{{ entry.text }}</p>
      </article>
    </template>

    <template v-else>
      <section class="rounded-sm border border-line/70 bg-white/20 px-3 py-2.5 text-[13px] leading-5 text-muted">
        分身只继承了原身的一小部分。图鉴记下的是它们在这一劫里露出的那一面，而不是原身的全部。
      </section>

      <p
        v-if="!codexBosses.length"
        class="rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted"
      >
        这一分类里没有记载。
      </p>

      <article
        v-for="boss in codexBosses"
        :key="boss.id"
        class="rounded-sm border border-line/80 bg-white/25 p-3"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="font-serif text-lg leading-tight">{{ displayName(boss) }}</p>
            <p class="mt-0.5 text-[12px] text-muted">{{ displayTitle(boss) }}</p>
          </div>
          <span class="shrink-0 rounded-sm border px-1.5 py-0.5 text-[12px]" :class="STATUS_TONES[boss.status]">
            {{ boss.revealed ? '已识' : '未识' }}
          </span>
        </div>
        <template v-if="boss.revealed">
          <p class="mt-1.5 text-[13px] leading-5 text-muted">{{ boss.summary }}</p>
          <p class="mt-1 text-[12px] leading-4 text-ink-soft">原身：{{ boss.originalBody }}</p>
          <p class="mt-1 text-[12px] text-muted">
            {{ boss.regionName }} · 已退 {{ boss.kills }} 次<template v-if="boss.sigil"> · 信物 {{ boss.sigil.name }}</template>
          </p>
        </template>
        <p v-else class="mt-1.5 text-[13px] leading-5 text-muted">
          这一页还没有被潮水翻开。满足与它相关的因缘后，记载会自己补全。
        </p>
      </article>
    </template>
  </div>
</template>