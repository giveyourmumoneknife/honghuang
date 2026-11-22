<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { describeEffects, describeRequirements } from '../labels'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type TreasureTab = 'all' | 'active' | 'vault'
type GradeFilter = 'all' | '1' | '2' | '3'

const game = useGameStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const treasureTab = ref<TreasureTab>('all')
const gradeFilter = ref<GradeFilter>('all')

type TreasureView = (typeof game.treasureViews)[number]

const activeTreasure = computed(() =>
  game.treasureViews.find((treasure) => treasure.isActive),
)

const GRADE_LABELS: Record<string, string> = {
  '1': '初阶',
  '2': '中阶',
  '3': '高阶',
}

const treasureTabs = computed(() => [
  { id: 'all', label: '全部', count: game.treasureViews.length },
  { id: 'active', label: '悬身', count: game.treasureViews.filter((entry) => entry.isActive).length },
  { id: 'vault', label: '匣中', count: game.treasureViews.filter((entry) => !entry.isActive).length },
])

const gradeTabs = computed(() => [
  { id: 'all', label: '诸阶' },
  ...(['1', '2', '3'] as GradeFilter[])
    .filter((grade) => game.treasureViews.some((entry) => String(entry.grade) === grade))
    .map((grade) => ({
      id: grade,
      label: GRADE_LABELS[grade],
      count: game.treasureViews.filter((entry) => String(entry.grade) === grade).length,
    })),
])

const visibleTreasures = computed(() =>
  game.treasureViews.filter((treasure) => {
    if (treasureTab.value === 'active' && !treasure.isActive) return false
    if (treasureTab.value === 'vault' && treasure.isActive) return false
    if (gradeFilter.value !== 'all' && String(treasure.grade) !== gradeFilter.value) return false
    return true
  }),
)

function selectTreasureTab(id: string): void {
  treasureTab.value = id as TreasureTab
}

function selectGrade(id: string): void {
  gradeFilter.value = id as GradeFilter
}

function select(id: string): void {
  game.selectTreasure(id as Parameters<typeof game.selectTreasure>[0])
}

function unselect(): void {
  game.selectTreasure(undefined)
}

function temper(id: string): void {
  game.temperTreasure(id as Parameters<typeof game.temperTreasure>[0])
}

function selectHint(treasure: TreasureView): string {
  const replaced = activeTreasure.value
    ? `替换现悬的「${activeTreasure.value.name}」`
    : '此前没有法宝悬身'
  return `悬于身侧：${replaced}；被动 ${treasure.passiveText || '无属性加成'}；换宝不会退回已付的唤醒代价。`
}

function unselectHint(): string {
  const treasure = activeTreasure.value
  if (!treasure) return '收起法宝。'
  return `收起「${treasure.name}」：失去被动 ${treasure.passiveText || '无属性加成'}；器灵冷却与已付代价不退回。`
}

function activateHint(treasure: TreasureView): string {
  return `唤醒「${treasure.active.name}」：先付代价 ${describeEffects(treasure.cost.effects, treasure.cost.description)}；再得 ${describeEffects(treasure.active.effects, treasure.active.description)}；此后器灵沉睡 ${treasure.activeCooldownMonths} 月。`
}

function temperHint(treasure: TreasureView): string {
  const stage = treasure.nextTemperStage
  if (!stage) return '这件法宝已温养至尽头，器灵不再向任何人多走一步。'
  const parts = [
    `温养至「${stage.name}」：${stage.description}`,
    `耗修为 ${treasure.temperCultivation}${treasure.temperCostText === '无' ? '' : `、${treasure.temperCostText}`}`,
  ]
  if (!treasure.temperRequirementsMet) {
    parts.push(`因缘尚缺：${describeRequirements(treasure.temperUnmet)}`)
  } else if (!treasure.temperAffordable) {
    parts.push('修为或资材不足')
  }
  parts.push(
    `被动 ${treasure.passiveText || '无'} → ${treasure.temperStatsText || '无'}；器灵沉睡 ${treasure.activeCooldownMonths} → ${treasure.nextCooldownMonths} 月${treasure.isActive ? '' : '；温养加成需悬于身侧才计入'}`,
  )
  return `${parts.join('；')}。`
}

function temperLockLabel(treasure: TreasureView): string {
  if (treasure.temperLockedBy === 'requirements') return '器灵未肯'
  if (treasure.temperLockedBy === 'resources') return '修为或资材不足'
  return '温养'
}
</script>

<template>
  <div class="space-y-4">
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="treasureTabs" :active="treasureTab" @select="selectTreasureTab" />
        <TabBar size="sm" :tabs="gradeTabs" :active="gradeFilter" @select="selectGrade" />
      </div>
    </Teleport>

    <section class="flex flex-wrap items-start justify-between gap-2">
      <p class="text-[13px] leading-5 text-muted">
        法宝悬在身侧，被动会一直生效；唤醒器灵须付出它要的代价。同一时只悬一件。
      </p>
      <button
        v-if="game.game.player.activeTreasureId"
        type="button"
        class="shrink-0 rounded-sm border border-line px-2 py-1 text-[12px] text-muted transition hover:border-jade/40 hover:text-jade"
        v-hint="unselectHint()"
        @click="unselect"
      >
        收起法宝
      </button>
    </section>

    <p
      v-if="!visibleTreasures.length"
      class="rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted"
    >
      这个分类里没有法宝。旧藏多埋在险地或长在某个人的记忆里。
    </p>

    <article
      v-for="treasure in visibleTreasures"
      :key="treasure.id"
      class="rounded-sm border p-3.5"
      :class="
        treasure.isActive
          ? 'border-jade/45 bg-jade-soft'
          : 'border-line/80 bg-white/25'
      "
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="font-serif text-xl leading-tight">{{ treasure.name }}</p>
          <p class="mt-0.5 text-[12px] text-muted">
            器灵 · {{ treasure.spirit.name }}
            <template v-if="treasure.passiveText"> · 被动 {{ treasure.passiveText }}</template>
            · 温养 {{ treasure.temperLevel }} / {{ treasure.maxTemper }}
          </p>
        </div>
        <span
          class="shrink-0 rounded-sm border px-1.5 py-0.5 text-[12px]"
          :class="
            treasure.isActive
              ? 'border-jade/40 text-jade-deep'
              : 'border-line text-muted'
          "
        >
          {{ treasure.isActive ? '悬于身侧' : '收在匣中' }}
        </span>
      </div>

      <p class="mt-1.5 text-[13px] leading-5 text-muted">{{ treasure.description }}</p>
      <p v-if="treasure.flavor" class="mt-1 text-[12px] italic leading-4 text-muted/80">
        {{ treasure.flavor }}
      </p>

      <div class="mt-2.5 space-y-1.5 border-t border-line/60 pt-2.5 text-[12px] leading-4">
        <p>
          <span class="text-ink-soft">唤醒 · {{ treasure.active.name }}：</span>
          <span class="text-muted">{{ treasure.active.description }}</span>
        </p>
        <p>
          <span class="text-ink-soft">代价：</span>
          <span class="text-muted">{{ treasure.cost.description }}</span>
        </p>
        <p>
          <span class="text-ink-soft">器灵性情：</span>
          <span class="text-muted">
            {{ treasure.spirit.traits.join(' / ') }}。{{ treasure.spirit.description }}
          </span>
        </p>
      </div>

      <div class="mt-2.5 rounded-sm border border-line/60 px-2.5 py-2">
        <div class="flex items-start justify-between gap-2">
          <p class="text-[13px] font-medium">
            温养 ·
            {{ treasure.currentTemperStage?.name ?? '器灵初醒' }}
          </p>
          <span class="shrink-0 text-[12px] text-muted">
            {{ treasure.temperLevel }} / {{ treasure.maxTemper }} 阶
          </span>
        </div>
        <p
          v-if="treasure.currentTemperStage"
          class="mt-0.5 text-[12px] leading-4 text-muted"
        >
          {{ treasure.currentTemperStage.description }}
        </p>
        <template v-if="treasure.nextTemperStage">
          <div class="mt-1.5 border-t border-line/50 pt-1.5">
            <p class="text-[12px] leading-4 text-muted">
              下一阶 · {{ treasure.nextTemperStage.name }} · 修为
              {{ treasure.temperCultivation }}
              <template v-if="treasure.temperCostText !== '无'">
                · {{ treasure.temperCostText }}
              </template>
            </p>
            <p class="mt-0.5 text-[12px] leading-4 text-muted">
              {{ treasure.nextTemperStage.description }}
            </p>
            <p
              v-if="!treasure.temperRequirementsMet"
              class="mt-0.5 text-[12px] leading-4 text-cinnabar/80"
            >
              尚缺：{{ describeRequirements(treasure.temperUnmet) }}
            </p>
            <button
              type="button"
              class="mt-1.5 w-full rounded-sm border px-2.5 py-1 text-[12px] tracking-[0.08em] transition"
              :class="
                treasure.canTemper
                  ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                  : 'cursor-not-allowed border-line text-muted'
              "
              :disabled="!treasure.canTemper"
              v-hint="temperHint(treasure)"
              @click="temper(treasure.id)"
            >
              {{
                treasure.canTemper
                  ? '温养器灵'
                  : temperLockLabel(treasure)
              }}
            </button>
          </div>
        </template>
        <p v-else class="mt-1 text-[12px] leading-4 text-muted">
          器灵已与这件法宝长在一处，再无更深的一层。
        </p>
      </div>

      <div class="mt-2.5 flex gap-2">
        <button
          v-if="!treasure.isActive"
          type="button"
          class="flex-1 rounded-sm border border-line bg-paper/40 px-2.5 py-1.5 text-[13px] tracking-[0.08em] text-ink-soft transition hover:border-jade/40 hover:text-jade"
          v-hint="selectHint(treasure)"
          @click="select(treasure.id)"
        >
          悬于身侧
        </button>
        <button
          v-else
          type="button"
          class="flex-1 rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
          :class="
            treasure.ready
              ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
              : 'cursor-not-allowed border-line text-muted'
          "
          :disabled="!treasure.ready"
          v-hint="activateHint(treasure)"
          @click="game.activateTreasure()"
        >
          {{ treasure.ready ? '唤醒器灵' : `器灵沉睡 · ${Math.ceil(treasure.cooldownMonths)} 月` }}
        </button>
      </div>
    </article>

    <p class="border-t border-line/70 pt-3 text-[12px] leading-5 text-muted">
      温养会提升法宝被动，并让器灵沉睡得更短；加成只在法宝悬于身侧时计入角色。唤醒的代价可能是灵石、气血或一段旧忆，付出之后再想换法宝，代价也不会退回。
    </p>
  </div>
</template>
