<script setup lang="ts">
import { computed, ref } from 'vue'
import { getContentRegistry } from '@/data'
import type { CombatStats } from '@/types/content'
import { useGameStore } from '@/stores/game'
import { useUiStore } from '@/stores/ui'

const registry = getContentRegistry()
const game = useGameStore()
const ui = useUiStore()

const origins = [...registry.origins.values()]
const roots = [...registry.roots.values()]
const physiques = game.physiqueOptions
const talents = [...registry.talents.values()]

const name = ref('')
const originId = ref(origins[0]?.id ?? '')
const rootId = ref(roots[0]?.id ?? '')
const physiqueId = ref(physiques[0]?.id ?? 'physique.longhan.mortal')
const talentIds = ref<string[]>([])

const MAX_TALENTS = 2

function statsText(stats?: CombatStats): string {
  if (!stats) return ''
  return (
    [
      ['health', '气血'],
      ['attack', '攻'],
      ['defense', '防'],
      ['speed', '速'],
      ['crit', '暴'],
      ['spirit', '神'],
    ] as const
  )
    .filter(([key]) => typeof stats[key] === 'number' && stats[key] !== 0)
    .map(([key, label]) => `${label} ${(stats[key] ?? 0) > 0 ? '+' : ''}${stats[key]}`)
    .join(' · ')
}

const selectedOrigin = computed(() => registry.origins.get(originId.value))
const selectedRoot = computed(() => registry.roots.get(rootId.value))
const selectedPhysique = computed(() =>
  physiques.find((physique) => physique.id === physiqueId.value),
)
const selectedTalents = computed(() =>
  talentIds.value
    .map((id) => registry.talents.get(id))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined),
)

const preview = computed(() => {
  const totals: Record<string, number> = {
    health: 0,
    attack: 0,
    defense: 0,
    speed: 0,
    crit: 0,
    spirit: 0,
  }
  const stack = (stats?: CombatStats) => {
    if (!stats) return
    for (const key of Object.keys(totals)) {
      totals[key] += (stats as Record<string, number | undefined>)[key] ?? 0
    }
  }
  stack(selectedOrigin.value?.stats)
  stack(selectedRoot.value?.stats)
  stack(selectedPhysique.value?.stats)
  for (const talent of selectedTalents.value) stack(talent.stats)
  const cultivation =
    (selectedRoot.value?.cultivationMultiplier ?? 1) *
      (selectedPhysique.value?.cultivationMultiplier ?? 1) +
    selectedTalents.value.reduce((sum, talent) => sum + (talent.cultivationBonus ?? 0), 0)
  return { totals, cultivation }
})

const previewText = computed(() => {
  const labels: Record<string, string> = {
    health: '气血',
    attack: '攻',
    defense: '防',
    speed: '速',
    crit: '暴',
    spirit: '神',
  }
  return Object.entries(preview.value.totals)
    .map(([key, value]) => `${labels[key] ?? '属性'} ${value > 0 ? '+' : ''}${value}`)
    .join(' · ')
})

type OriginChoice = (typeof origins)[number]
type RootChoice = (typeof roots)[number]
type PhysiqueChoice = (typeof physiques)[number]
type TalentChoice = (typeof talents)[number]

function originHint(origin: OriginChoice): string {
  return [
    `择「${origin.name}」为来处`,
    statsText(origin.stats) || '无直接属性修正',
    origin.note,
    '选定后计入初生之身总属性',
  ].join('。')
}

function rootHint(root: RootChoice): string {
  return [
    `择「${root.name}」为灵根`,
    `修行 ×${root.cultivationMultiplier.toFixed(2)}`,
    statsText(root.stats) || '无直接属性修正',
    root.note,
  ].join('。')
}

function physiqueHint(physique: PhysiqueChoice): string {
  return [
    `择「${physique.name}」为先天体质`,
    statsText(physique.stats) || '无直接属性修正',
    `修行 ×${physique.cultivationMultiplier.toFixed(2)} · 淬体 ×${physique.bodyTemperMultiplier.toFixed(2)} · 破体 ${physique.bodyBreakthroughBonus >= 0 ? '+' : ''}${Math.round(physique.bodyBreakthroughBonus * 100)}%`,
    physique.note,
    physique.awakenings.length
      ? `淬体到 ${physique.awakenings.map((entry) => `${entry.stage} 阶`).join('、')} 时另有觉醒`
      : '此体质没有额外觉醒，全靠后天淬炼',
  ].join('。')
}

function talentHint(talent: TalentChoice): string {
  const bonus = talent.cultivationBonus
    ? `修行 +${Math.round(talent.cultivationBonus * 100)}%`
    : ''
  if (talentIds.value.includes(talent.id)) {
    return `取消「${talent.name}」：${talent.note}${bonus ? `。${bonus}` : ''}`
  }
  if (talentIds.value.length >= MAX_TALENTS) {
    return `已选满 ${MAX_TALENTS} 门天赋，需先取消一门才能选「${talent.name}」`
  }
  return [
    `择「${talent.name}」：${talent.note}`,
    statsText(talent.stats) || '',
    `${bonus || '无修行加成'}，最多同时持有 ${MAX_TALENTS} 门`,
  ]
    .filter(Boolean)
    .join('。')
}

const beginHint = computed(
  () =>
    `以「${selectedOrigin.value?.name ?? '来处未定'} · ${selectedRoot.value?.name ?? '灵根未显'} · ${selectedPhysique.value?.name ?? '凡胎'}」睁眼入轮回：会替换当前此世并覆盖自动存档，不可撤销。初生之身：${previewText.value} · 修行 ×${preview.value.cultivation.toFixed(2)} · 淬体 ×${(selectedPhysique.value?.bodyTemperMultiplier ?? 1).toFixed(2)}`,
)

function toggleTalent(id: string): void {
  if (talentIds.value.includes(id)) {
    talentIds.value = talentIds.value.filter((entry) => entry !== id)
    return
  }
  if (talentIds.value.length >= MAX_TALENTS) return
  talentIds.value = [...talentIds.value, id]
}

function begin(): void {
  if (!originId.value || !rootId.value) return
  if (!window.confirm('入轮回会替换当前此世并覆盖自动存档，确定继续？')) return
  game.startNewGame({
    name: name.value,
    originId: originId.value,
    rootId: rootId.value,
    physiqueId: physiqueId.value,
    talentIds: talentIds.value,
  })
  ui.closePanel()
}
</script>

<template>
  <div class="space-y-5">
    <p class="text-[13px] leading-5 text-muted">
      开天未久，四海未定。你在这一刻睁开眼，先记住自己的名，再决定这具身体从哪里来、亲近哪一行灵机。
    </p>

    <label class="block space-y-1">
      <span class="text-[13px] tracking-[0.1em] text-muted">道号</span>
      <input
        v-model="name"
        maxlength="12"
        placeholder="无名散修"
        class="w-full rounded-sm border border-line bg-paper/60 px-3 py-2 font-serif text-lg text-ink outline-none transition placeholder:text-muted/50 focus:border-jade/50"
      />
      <span class="block text-[12px] text-muted">留空则以「无名散修」行走洪荒。</span>
    </label>

    <section class="space-y-2">
      <h3 class="font-serif text-base text-ink">来处</h3>
      <div class="grid gap-2 sm:grid-cols-2">
        <button
          v-for="origin in origins"
          :key="origin.id"
          type="button"
          class="rounded-sm border p-3 text-left transition"
          :class="
            originId === origin.id
              ? 'border-jade/55 bg-jade-soft'
              : 'border-line/80 bg-white/20 hover:border-jade/40'
          "
          v-hint="originHint(origin)"
          @click="originId = origin.id"
        >
          <div class="flex items-baseline justify-between gap-2">
            <span
              class="font-serif text-base"
              :class="originId === origin.id ? 'text-jade-deep' : 'text-ink'"
            >
              {{ origin.name }}
            </span>
            <span class="text-[12px] text-muted">{{ statsText(origin.stats) }}</span>
          </div>
          <p class="mt-1 text-[13px] leading-4 text-muted">{{ origin.description }}</p>
          <p class="mt-1 text-[12px] leading-4 text-ink-soft">{{ origin.note }}</p>
        </button>
      </div>
    </section>

    <section class="space-y-2">
      <h3 class="font-serif text-base text-ink">灵根</h3>
      <div class="grid gap-2 sm:grid-cols-2">
        <button
          v-for="root in roots"
          :key="root.id"
          type="button"
          class="rounded-sm border p-3 text-left transition"
          :class="
            rootId === root.id
              ? 'border-jade/55 bg-jade-soft'
              : 'border-line/80 bg-white/20 hover:border-jade/40'
          "
          v-hint="rootHint(root)"
          @click="rootId = root.id"
        >
          <div class="flex items-baseline justify-between gap-2">
            <span
              class="font-serif text-base"
              :class="rootId === root.id ? 'text-jade-deep' : 'text-ink'"
            >
              {{ root.name }}
            </span>
            <span class="text-[12px] text-muted">
              修行 ×{{ root.cultivationMultiplier.toFixed(2) }}
            </span>
          </div>
          <p class="mt-1 text-[13px] leading-4 text-muted">{{ root.description }}</p>
          <p class="mt-1 text-[12px] leading-4 text-ink-soft">
            {{ statsText(root.stats) }} · {{ root.note }}
          </p>
        </button>
      </div>
    </section>

    <section class="space-y-2">
      <div class="flex items-baseline justify-between gap-2">
        <h3 class="font-serif text-base text-ink">体质</h3>
        <span class="text-[12px] text-muted">先天一副筋骨，往后可淬不可改</span>
      </div>
      <div class="grid gap-1.5 sm:grid-cols-2">
        <button
          v-for="physique in physiques"
          :key="physique.id"
          type="button"
          class="rounded-sm border p-2.5 text-left transition"
          :class="
            physiqueId === physique.id
              ? 'border-jade/55 bg-jade-soft'
              : 'border-line/80 bg-white/20 hover:border-jade/40'
          "
          v-hint="physiqueHint(physique)"
          @click="physiqueId = physique.id"
        >
          <div class="flex items-baseline justify-between gap-2">
            <span
              class="font-serif text-sm"
              :class="physiqueId === physique.id ? 'text-jade-deep' : 'text-ink'"
            >
              {{ physique.name }}
            </span>
            <span class="text-[12px] text-muted">
              修行 ×{{ physique.cultivationMultiplier.toFixed(2) }}
            </span>
          </div>
          <p class="mt-0.5 text-[12px] leading-4 text-muted">
            {{ statsText(physique.stats) || '无直接属性修正' }}
          </p>
          <p class="mt-0.5 text-[12px] leading-4 text-ink-soft">
            淬体 ×{{ physique.bodyTemperMultiplier.toFixed(2) }} · 破体
            {{ physique.bodyBreakthroughBonus >= 0 ? '+' : '' }}{{ Math.round(physique.bodyBreakthroughBonus * 100) }}%
          </p>
        </button>
      </div>
    </section>

    <section class="space-y-2">
      <div class="flex items-baseline justify-between gap-2">
        <h3 class="font-serif text-base text-ink">天赋</h3>
        <span class="text-[12px] text-muted">
          已选 {{ talentIds.length }} / {{ MAX_TALENTS }}
        </span>
      </div>
      <div class="grid gap-1.5 sm:grid-cols-2">
        <button
          v-for="talent in talents"
          :key="talent.id"
          type="button"
          class="rounded-sm border p-2.5 text-left transition disabled:opacity-45"
          :class="
            talentIds.includes(talent.id)
              ? 'border-jade/55 bg-jade-soft'
              : 'border-line/80 bg-white/20 hover:border-jade/40'
          "
          :disabled="!talentIds.includes(talent.id) && talentIds.length >= MAX_TALENTS"
          v-hint="talentHint(talent)"
          @click="toggleTalent(talent.id)"
        >
          <div class="flex items-baseline justify-between gap-2">
            <span
              class="font-serif text-sm"
              :class="talentIds.includes(talent.id) ? 'text-jade-deep' : 'text-ink'"
            >
              {{ talent.name }}
            </span>
            <span class="text-[12px] text-muted">{{ statsText(talent.stats) }}</span>
          </div>
          <p class="mt-0.5 text-[12px] leading-4 text-muted">
            {{ talent.note }}
            <span v-if="talent.cultivationBonus" class="text-ink-soft">
              · 修行 +{{ Math.round(talent.cultivationBonus * 100) }}%
            </span>
          </p>
        </button>
      </div>
    </section>

    <section class="rounded-sm border border-line/80 bg-paper/40 p-3">
      <h3 class="font-serif text-sm text-ink">初生之身</h3>
      <p class="mt-1 text-[13px] leading-5 text-muted">
        {{ selectedOrigin?.name ?? '来处未定' }} · {{ selectedRoot?.name ?? '灵根未显' }} ·
        {{ selectedPhysique?.name ?? '凡胎' }}
        <span v-if="selectedTalents.length">
          · {{ selectedTalents.map((talent) => talent.name).join(' / ') }}
        </span>
      </p>
      <p class="mt-1 text-[13px] leading-5 text-ink-soft">
        {{ previewText }} · 修行 ×{{ preview.cultivation.toFixed(2) }}
      </p>
    </section>

    <button
      type="button"
      class="w-full rounded-sm border border-jade-deep bg-jade-deep px-4 py-2.5 font-serif text-base tracking-[0.2em] text-white transition hover:border-jade hover:bg-jade disabled:opacity-40"
      :disabled="!originId || !rootId || !physiqueId"
      v-hint="beginHint"
      @click="begin"
    >
      睁 眼
    </button>
  </div>
</template>
