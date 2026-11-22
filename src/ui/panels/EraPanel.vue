<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import {
  TRANSITION_MODE_DESCRIPTIONS,
  TRANSITION_MODE_LABELS,
} from '@/core/era'
import { useGameStore } from '@/stores/game'
import type { EraTransitionMode } from '@/types/state'
import { describeRequirements } from '../labels'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type EraTab = 'overview' | 'phases' | 'settlement'
type PhaseFilter = 'all' | 'passed' | 'active' | 'upcoming'

const game = useGameStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const eraTab = ref<EraTab>('overview')
const phaseFilter = ref<PhaseFilter>('all')
const chosenMode = ref<EraTransitionMode>('continue')

const modes: EraTransitionMode[] = ['continue', 'reincarnate', 'stay']

const MODE_DAOGUO: Record<EraTransitionMode, number> = {
  continue: 8,
  reincarnate: 12,
  stay: 5,
}

const MODE_FACTS: Record<EraTransitionMode, string> = {
  continue: '道果 +8 · 带着此世姓名与因缘向前，旧盟约仍算数，旧债也会跟来',
  reincarnate: '道果 +12 · 换作「转世之身」，道侣归期交给下一劫，旧物人情未必还能带走',
  stay: '道果 +5 · 此世就此停笔，道侣与你一同留在余烬，世界的下一步先把你留在身后',
}

function modeHint(mode: EraTransitionMode): string {
  return `${TRANSITION_MODE_LABELS[mode]}：${MODE_FACTS[mode]}。${TRANSITION_MODE_DESCRIPTIONS[mode]}`
}

const settleHint = computed(() => {
  const mode = chosenMode.value
  const rules = (game.era?.settlement ?? []).map((rule) => rule.label).join('、')
  return `以「${TRANSITION_MODE_LABELS[mode]}」落笔：先执行劫末结算（${rules}），随后道果 +${MODE_DAOGUO[mode]}，并写入编年与旧忆；此劫就此封存，不可再改。`
})

const settlementReason = computed(() => {
  const readiness = game.settlementReadiness
  if (readiness.reason === 'ending') return '此劫已经落笔。'
  if (readiness.reason === 'missing-era') return '找不到当前量劫的记载。'
  if (readiness.reason === 'no-rules') return '这一劫还没有可执行的结算规则。'
  if (readiness.reason === 'not-final-phase') {
    return '须先走到余烬阶段，才能为这一劫落笔。'
  }
  if (readiness.reason === 'requirements') {
    return `劫主尚未作答：${describeRequirements(readiness.unmet)}。`
  }
  return ''
})

const endingYear = computed(() => {
  const ending = game.ending
  if (!ending) return ''
  const months = ending.settledAtMonths
  return `第 ${Math.floor(months / 12) + 1} 年 · ${(months % 12) + 1} 月`
})

const eraTabs = computed(() => [
  { id: 'overview', label: '劫数' },
  { id: 'phases', label: '阶段', count: game.eraPhases.length },
  { id: 'settlement', label: '结算' },
])

const phaseTabs = computed(() => [
  { id: 'all', label: '全部', count: game.eraPhases.length },
  { id: 'passed', label: '已过', count: game.eraPhases.filter((phase) => phase.passed).length },
  { id: 'active', label: '当下', count: game.eraPhases.filter((phase) => phase.active).length },
  { id: 'upcoming', label: '未至', count: game.eraPhases.filter((phase) => !phase.passed && !phase.active).length },
])

const visiblePhases = computed(() =>
  game.eraPhases.filter((phase) => {
    if (phaseFilter.value === 'passed') return phase.passed
    if (phaseFilter.value === 'active') return phase.active
    if (phaseFilter.value === 'upcoming') return !phase.passed && !phase.active
    return true
  }),
)

function selectEraTab(id: string): void {
  eraTab.value = id as EraTab
}

function selectPhase(id: string): void {
  phaseFilter.value = id as PhaseFilter
}

function settle(): void {
  game.settleEra(chosenMode.value)
}
</script>

<template>
  <div class="space-y-5">
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="eraTabs" :active="eraTab" @select="selectEraTab" />
        <TabBar
          v-if="eraTab === 'phases'"
          size="sm"
          :tabs="phaseTabs"
          :active="phaseFilter"
          @select="selectPhase"
        />
      </div>
    </Teleport>

    <section v-if="eraTab === 'overview' && game.ending" class="rounded-sm border border-cinnabar/40 bg-cinnabar/[0.04] p-4">
      <p class="text-[12px] tracking-[0.24em] text-cinnabar">此劫已落笔</p>
      <p class="mt-2 font-serif text-xl leading-tight">{{ game.ending.title }}</p>
      <p class="mt-2 text-[14px] leading-6 text-ink-soft">{{ game.ending.summary }}</p>
      <div class="mt-3 grid grid-cols-2 gap-2 border-t border-cinnabar/15 pt-3 text-[13px] text-muted">
        <span>结算于 {{ endingYear }}</span>
        <span class="text-right">道果 +{{ game.ending.daoguoGained }} · 累计 {{ game.game.campaign.legacy.daoguo }}</span>
      </div>
      <p class="mt-2 text-[13px] leading-5 text-muted">
        下一劫的记载尚未开放。余烬中的潮声会留在此世存档里。
      </p>
    </section>

    <section v-else-if="eraTab === 'overview'">
      <p class="font-serif text-2xl leading-none">{{ game.era?.name ?? '当前量劫' }}</p>
      <p class="mt-1 text-[13px] tracking-[0.14em] text-muted">{{ game.era?.subtitle }}</p>
      <p class="mt-2 text-[14px] leading-6 text-muted">{{ game.era?.summary }}</p>
    </section>

    <section v-if="eraTab === 'phases'">
      <div class="flex items-end justify-between gap-3">
        <div>
          <p class="text-[13px] tracking-[0.22em] text-cinnabar">劫数依次</p>
          <p class="mt-1 text-[13px] text-muted">条件满足后，潮水会自行把这一劫推向下一阶段。</p>
        </div>
      </div>

      <p
        v-if="!visiblePhases.length"
        class="mt-2.5 rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted"
      >
        这个分类里暂时没有阶段。
      </p>

      <ol v-else class="mt-2.5 space-y-2">
        <li
          v-for="phase in visiblePhases"
          :key="phase.id"
          class="relative rounded-sm border p-3 pl-8"
          :class="
            phase.active
              ? 'border-cinnabar/45 bg-cinnabar/[0.035]'
              : phase.passed
                ? 'border-line/70 bg-white/20'
                : 'border-dashed border-line/80 bg-paper/20'
          "
        >
          <span
            class="absolute left-3 top-3 grid h-5 w-5 place-items-center rounded-full border text-[12px]"
            :class="
              phase.active
                ? 'border-cinnabar/60 bg-cinnabar/10 text-cinnabar'
                : phase.passed
                  ? 'border-line bg-ink/10 text-ink-soft'
                  : 'border-line text-muted'
            "
          >
            {{ phase.order }}
          </span>
          <div class="flex items-start justify-between gap-2">
            <p class="font-serif text-base leading-tight">{{ phase.name }}</p>
            <span
              class="shrink-0 rounded-sm border px-1.5 py-0.5 text-[12px]"
              :class="
                phase.active
                  ? 'border-cinnabar/35 text-cinnabar'
                  : phase.passed
                    ? 'border-line text-ink-soft'
                    : 'border-line text-muted'
              "
            >
              {{ phase.active ? '当下' : phase.passed ? '已过' : phase.gateMet ? '将开' : '未至' }}
            </span>
          </div>
          <p class="mt-1 text-[13px] leading-5 text-muted">{{ phase.summary }}</p>
          <p
            v-if="phase.active && game.nextPhaseInfo && !game.nextPhaseInfo.gateMet"
            class="mt-1.5 text-[12px] leading-4 text-cinnabar/75"
          >
            下一阶段尚缺：{{ describeRequirements(game.nextPhaseInfo.unmet) }}
          </p>
        </li>
      </ol>
    </section>

    <section v-if="eraTab === 'settlement'">
      <p class="text-[13px] tracking-[0.22em] text-cinnabar">劫末结算</p>

      <div
        v-if="game.ending"
        class="mt-2 rounded-sm border border-cinnabar/25 bg-cinnabar/[0.03] px-3 py-2.5 text-[13px] leading-5 text-muted"
      >
        此劫已于 {{ endingYear }} 落笔，所得道果 {{ game.ending.daoguoGained }}。结算只可落笔一次，余烬里的潮声会留在此世存档中。
      </div>

      <div
        v-else-if="!game.settlementReadiness.ready"
        class="mt-2 rounded-sm border border-dashed border-line px-3 py-2.5 text-[13px] leading-5 text-muted"
      >
        {{ settlementReason }}
      </div>

      <template v-else>
        <p class="mt-2 text-[13px] leading-5 text-muted">
          走到余烬之后，须为这一劫择一种去法。结算只可落笔一次。
        </p>

        <div class="mt-2.5 space-y-2">
          <button
            v-for="mode in modes"
            :key="mode"
            type="button"
            class="w-full rounded-sm border px-3 py-2.5 text-left transition"
            :class="
              chosenMode === mode
                ? 'border-cinnabar/45 bg-cinnabar/[0.05]'
                : 'border-line bg-white/20 hover:border-cinnabar/30'
            "
            v-hint="modeHint(mode)"
            @click="chosenMode = mode"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-serif text-base">{{ TRANSITION_MODE_LABELS[mode] }}</span>
              <span
                class="h-2 w-2 rounded-full border"
                :class="
                  chosenMode === mode
                    ? 'border-cinnabar/60 bg-cinnabar/60'
                    : 'border-line'
                "
              ></span>
            </div>
            <p class="mt-1 text-[13px] leading-5 text-muted">
              {{ TRANSITION_MODE_DESCRIPTIONS[mode] }}
            </p>
          </button>
        </div>

        <button
          type="button"
          class="mt-3 w-full rounded-sm border border-cinnabar/45 bg-cinnabar/[0.06] px-3 py-2 text-[14px] tracking-[0.16em] text-cinnabar transition hover:bg-cinnabar/[0.1]"
          v-hint="settleHint"
          @click="settle"
        >
          以此法落笔
        </button>
      </template>

      <div v-if="!game.ending" class="mt-3 border-t border-line/70 pt-3">
        <p class="text-[12px] tracking-[0.18em] text-muted">结算将写入</p>
        <ul class="mt-1.5 space-y-1.5">
          <li
            v-for="rule in game.era?.settlement ?? []"
            :key="rule.id"
            class="text-[13px] leading-5 text-muted"
          >
            <span class="text-ink-soft">{{ rule.label }}</span> · {{ rule.description }}
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
