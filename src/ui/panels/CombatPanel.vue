<script setup lang="ts">
import { computed, inject, reactive, ref } from 'vue'
import { STANCE_DESCRIPTIONS, STANCE_LABELS } from '@/core/combat'
import { useGameStore } from '@/stores/game'
import { describeEffects, describeReward } from '../labels'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type CombatTab = 'encounters' | 'report'
type EncounterFilter = 'all' | 'flee' | 'locked'
type ReportFilter = 'all' | 'win' | 'loss' | 'fled'

const game = useGameStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const combatTab = ref<CombatTab>('encounters')
const encounterFilter = ref<EncounterFilter>('all')
const reportFilter = ref<ReportFilter>('all')

const stances = reactive<Record<string, 'steady' | 'aggressive' | 'guarded'>>({})

const ELEMENT_LABELS: Record<string, string> = {
  metal: '金',
  wood: '木',
  water: '水',
  fire: '火',
  earth: '土',
  thunder: '雷',
  ice: '冰',
  wind: '风',
}

const STANCE_TONE: Record<'steady' | 'aggressive' | 'guarded', string> = {
  steady: 'border-line bg-paper/40 text-ink-soft',
  aggressive: 'border-cinnabar/35 bg-cinnabar/[0.04] text-cinnabar',
  guarded: 'border-ink-soft/30 bg-ink-soft/[0.05] text-ink-soft',
}

function stanceFor(encounterId: string): 'steady' | 'aggressive' | 'guarded' {
  return stances[encounterId] ?? 'steady'
}

function setStance(encounterId: string, stance: 'steady' | 'aggressive' | 'guarded'): void {
  stances[encounterId] = stance
}

function fight(encounterId: string): void {
  game.fightEncounter(
    encounterId as Parameters<typeof game.fightEncounter>[0],
    stanceFor(encounterId),
  )
}

function flee(encounterId: string): void {
  game.fleeFromEncounter(encounterId as Parameters<typeof game.fleeFromEncounter>[0])
}

type PendingView = (typeof game.pendingEncounterViews)[number]

const STANCE_FACTS: Record<'steady' | 'aggressive' | 'guarded', string> = {
  steady: '出手 ×1.00 · 护体 ×1.00',
  aggressive: '出手 ×1.25 · 护体 ×0.80',
  guarded: '出手 ×0.82 · 护体 ×1.35',
}

function stanceHint(stance: 'steady' | 'aggressive' | 'guarded'): string {
  return `${STANCE_LABELS[stance]}：${STANCE_FACTS[stance]}。${STANCE_DESCRIPTIONS[stance]}`
}

function enemyTotals(pending: PendingView): { health: number; attack: number } {
  return pending.enemies.reduce(
    (sum, enemy) => ({
      health: sum.health + Math.round(enemy.stats.health ?? 0),
      attack: sum.attack + Math.round(enemy.stats.attack ?? 0),
    }),
    { health: 0, attack: 0 },
  )
}

function fightHint(pending: PendingView): string {
  const stance = stanceFor(pending.encounterId)
  const totals = enemyTotals(pending)
  const reward = describeReward(pending.reward)
  const victory = describeEffects(pending.victoryEffects, '')
  const defeat = describeEffects(pending.defeatEffects, '无额外损失')
  return [
    `应战 · ${STANCE_LABELS[stance]}`,
    reward ? `胜得 ${reward}` : '胜后无额外战利',
    victory ? `胜后 ${victory}` : '',
    `败则气血跌至约 22%，${defeat}`,
    `敌方合计气血 ${totals.health}、攻势 ${totals.attack}`,
    `我方气血 ${Math.ceil(game.game.player.health)}/${game.sheet.maxHealth}、攻势 ${game.sheet.attack}`,
  ]
    .filter(Boolean)
    .join('；') + '。'
}

function fleeHint(): string {
  if (game.daoCannotFlee) {
    return '「向死而生」压住了退路：这一战只能打到有人倒下。'
  }
  return `退走：立即脱离这场遭遇，不受伤、无修为与器物入账；行旅 -2（当前 ${Math.floor(game.travelProgress)}）。`
}

const DAO_DESPERATE_HINT =
  '「向死而生」已落定：无法退走；气血低于四成时攻势 +30%、暴伤 +40%；每回合失去 1% 最大气血。'

function canFlee(pending: PendingView): boolean {
  return pending.fleeAllowed && !game.daoCannotFlee
}

const lastCombat = computed(() => game.lastCombat)

const outcomeLabel = computed(() => {
  const result = lastCombat.value
  if (!result) return ''
  if (result.victory) return '胜'
  if (result.fled) return '退'
  return '败'
})

const outcomeTone = computed(() => {
  const result = lastCombat.value
  if (!result) return ''
  if (result.victory) return 'border-cinnabar/35 text-cinnabar'
  if (result.fled) return 'border-line text-ink-soft'
  return 'border-cinnabar/35 bg-cinnabar/[0.04] text-cinnabar'
})

const combatTabs = computed(() => [
  { id: 'encounters', label: '待决', count: game.pendingEncounterViews.length },
  { id: 'report', label: '战报', count: lastCombat.value ? 1 : 0 },
])

const encounterTabs = computed(() => [
  { id: 'all', label: '全部', count: game.pendingEncounterViews.length },
  {
    id: 'flee',
    label: '可退',
    count: game.pendingEncounterViews.filter((pending) => canFlee(pending)).length,
  },
  {
    id: 'locked',
    label: '死战',
    count: game.pendingEncounterViews.filter((pending) => !canFlee(pending)).length,
  },
])

const reportTabs = computed(() => [
  { id: 'all', label: '全部' },
  { id: 'win', label: '胜' },
  { id: 'loss', label: '败' },
  { id: 'fled', label: '退' },
])

const visibleEncounters = computed(() =>
  game.pendingEncounterViews.filter((pending) => {
    if (encounterFilter.value === 'flee') return canFlee(pending)
    if (encounterFilter.value === 'locked') return !canFlee(pending)
    return true
  }),
)

const reportMatches = computed(() => {
  const result = lastCombat.value
  if (!result) return false
  if (reportFilter.value === 'win') return result.victory
  if (reportFilter.value === 'loss') return !result.victory && !result.fled
  if (reportFilter.value === 'fled') return result.fled
  return true
})

function selectCombatTab(id: string): void {
  combatTab.value = id as CombatTab
}

function selectEncounterFilter(id: string): void {
  encounterFilter.value = id as EncounterFilter
}

function selectReportFilter(id: string): void {
  reportFilter.value = id as ReportFilter
}
</script>

<template>
  <div class="space-y-5">
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="combatTabs" :active="combatTab" @select="selectCombatTab" />
        <TabBar
          v-if="combatTab === 'encounters'"
          size="sm"
          :tabs="encounterTabs"
          :active="encounterFilter"
          @select="selectEncounterFilter"
        />
        <TabBar
          v-else
          size="sm"
          :tabs="reportTabs"
          :active="reportFilter"
          @select="selectReportFilter"
        />
      </div>
    </Teleport>

    <section v-if="combatTab === 'encounters'">
      <div class="flex items-end justify-between gap-3">
        <div>
          <p class="text-[13px] tracking-[0.22em] text-cinnabar">候你的动静</p>
          <p class="mt-1 text-[13px] text-muted">
            遭遇一旦缠上，便不会自己走开。选一种出手方式，胜负由属性、功法与一点潮声决定。
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-1.5">
          <span
            v-if="game.daoCannotFlee"
            class="rounded-sm border border-cinnabar/40 bg-cinnabar/[0.04] px-2 py-0.5 text-[12px] text-cinnabar"
            v-hint="DAO_DESPERATE_HINT"
          >
            向死而生
          </span>
          <span class="rounded-sm border border-line px-2 py-0.5 text-[12px] text-muted">
            {{ game.pendingEncounterViews.length }} 处
          </span>
        </div>
      </div>

      <p
        v-if="!visibleEncounters.length"
        class="mt-2.5 rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] leading-5 text-muted"
      >
        这一分类里没有缠住你的东西。去危险些的幽微处走走，或等潮水把旧账送回来。
      </p>

      <div v-else class="mt-2.5 space-y-2.5">
        <article
          v-for="pending in visibleEncounters"
          :key="pending.id"
          class="rounded-sm border border-cinnabar/30 bg-cinnabar/[0.025] p-3.5"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-serif text-xl leading-tight">{{ pending.name }}</p>
              <p class="mt-0.5 text-[12px] text-muted">
                {{ pending.regionName ?? '潮路之上' }} · {{ pending.enemies.length }} 名敌手
              </p>
            </div>
            <span class="shrink-0 rounded-sm border border-cinnabar/30 px-1.5 py-0.5 text-[12px] text-cinnabar">
              未决
            </span>
          </div>

          <p class="mt-1.5 text-[13px] leading-5 text-muted">{{ pending.summary }}</p>
          <p class="mt-1 text-[12px] leading-4 text-muted">{{ pending.description }}</p>

          <div class="mt-2 flex flex-wrap gap-1.5">
            <span
              v-for="enemy in pending.enemies"
              :key="enemy.id"
              class="rounded-sm border border-line bg-white/30 px-2 py-0.5 text-[12px] text-ink-soft"
            >
              {{ enemy.name }} · {{ enemy.title }}
              <template v-if="enemy.element">
                · {{ ELEMENT_LABELS[enemy.element] ?? '无属' }}
              </template>
            </span>
          </div>

          <div class="mt-3">
            <p class="text-[12px] tracking-[0.18em] text-muted">出手方式</p>
            <div class="mt-1.5 grid grid-cols-3 gap-1.5">
              <button
                v-for="(label, stance) in STANCE_LABELS"
                :key="stance"
                type="button"
                class="rounded-sm border px-2 py-1.5 text-[13px] transition"
                :class="
                  stanceFor(pending.encounterId) === stance
                    ? STANCE_TONE[stance]
                    : 'border-line text-muted hover:border-cinnabar/25'
                "
                v-hint="stanceHint(stance)"
                @click="setStance(pending.encounterId, stance)"
              >
                {{ label }}
              </button>
            </div>
            <p class="mt-1.5 text-[12px] leading-4 text-muted">
              {{ STANCE_DESCRIPTIONS[stanceFor(pending.encounterId)] }}
            </p>
          </div>

          <div class="mt-2.5 flex gap-2">
            <button
              type="button"
              class="flex-1 rounded-sm border border-cinnabar/35 bg-cinnabar/[0.04] px-2.5 py-1.5 text-[13px] tracking-[0.08em] text-cinnabar transition hover:bg-cinnabar/[0.08]"
              v-hint="fightHint(pending)"
              @click="fight(pending.encounterId)"
            >
              应战
            </button>
            <button
              v-if="pending.fleeAllowed && !game.daoCannotFlee"
              type="button"
              class="rounded-sm border border-line px-2.5 py-1.5 text-[13px] tracking-[0.08em] text-muted transition hover:border-cinnabar/35 hover:text-cinnabar"
              v-hint="fleeHint()"
              @click="flee(pending.encounterId)"
            >
              退走 · 行旅 -2
            </button>
            <span
              v-else-if="game.daoCannotFlee"
              class="self-center rounded-sm border border-dashed border-cinnabar/30 px-2 py-1.5 text-[12px] text-cinnabar/80"
              v-hint="fleeHint()"
            >
              无路可退
            </span>
          </div>
        </article>
      </div>
    </section>

    <section v-if="combatTab === 'report'">
      <p
        v-if="!lastCombat || !reportMatches"
        class="rounded-sm border border-dashed border-line px-3 py-8 text-center text-[13px] leading-5 text-muted"
      >
        {{ lastCombat ? '这一类里没有上一场战报。' : '还没有打过一场。潮水会把第一笔旧账带来的。' }}
      </p>

      <template v-else>
      <div class="flex items-end justify-between gap-3">
        <div>
          <p class="text-[13px] tracking-[0.22em] text-cinnabar">上一场</p>
          <p class="mt-1 text-[13px] text-muted">
            {{ lastCombat.message }}
            · {{ lastCombat.rounds }} 回合
            · 气血 {{ Math.ceil(lastCombat.playerHealth) }} / {{ lastCombat.playerMaxHealth }}
          </p>
        </div>
        <span
          class="shrink-0 rounded-sm border px-1.5 py-0.5 text-[12px]"
          :class="outcomeTone"
        >
          {{ outcomeLabel }}
        </span>
      </div>

      <div v-if="lastCombat.rewards.length" class="mt-2 flex flex-wrap gap-1.5">
        <span
          v-for="reward in lastCombat.rewards"
          :key="reward"
          class="rounded-sm border border-line bg-white/25 px-2 py-0.5 text-[12px] text-ink-soft"
        >
          {{ reward }}
        </span>
      </div>

      <div class="mt-2.5 max-h-64 space-y-1 overflow-y-auto rounded-sm border border-line/80 bg-paper/30 px-3 py-2.5">
        <p
          v-for="(line, index) in game.combatLog"
          :key="`${line.round}-${index}`"
          class="text-[12px] leading-5"
          :class="
            line.tone === 'good' || line.tone === 'skill'
              ? 'text-ink-soft'
              : line.tone === 'bad'
                ? 'text-cinnabar/80'
                : line.tone === 'fate'
                  ? 'text-cinnabar'
                  : 'text-muted'
          "
        >
          <span v-if="line.round > 0" class="mr-1.5 text-muted/70">{{ line.round }}</span>
          {{ line.text }}
        </p>
      </div>

      <div class="mt-2 flex justify-end">
        <button
          type="button"
          class="rounded-sm border border-line px-2 py-1 text-[12px] text-muted transition hover:border-cinnabar/35 hover:text-cinnabar"
          v-hint="'收起上一场战报；胜负、伤势与所得都不会被撤回。'"
          @click="game.clearCombatResult()"
        >
          收起战报
        </button>
      </div>
      </template>
    </section>

    <p class="border-t border-line/70 pt-3 text-[12px] leading-5 text-muted">
      战败不会结束这一世，但会留下实打实的伤与一段被夺走的东西。打不过时，退走也是活法。
    </p>
  </div>
</template>
