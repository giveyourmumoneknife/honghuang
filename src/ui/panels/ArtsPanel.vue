<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { useUiStore } from '@/stores/ui'
import { describeRequirements, describeStats } from '../labels'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type TechniqueView = (typeof game.techniqueViews)[number]
type TechniqueNode = TechniqueView['nodes'][number]
type DivineView = (typeof game.divineAbilityViews)[number]
type ArtTab = 'learning' | 'loadout' | 'divine'
type ArtFilter = 'all' | 'learned' | 'unknown'
type TierFilter = 'all' | 'low' | 'mid' | 'high'

const game = useGameStore()
const ui = useUiStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const tab = ref<ArtTab>('learning')
const artFilter = ref<ArtFilter>('all')
const tierFilter = ref<TierFilter>('all')

const MAX_TECHNIQUE_SLOTS = 3

const TIER_BANDS: Array<{ id: TierFilter; label: string; match: (tier: number) => boolean }> = [
  { id: 'low', label: '一至二阶', match: (tier) => tier <= 2 },
  { id: 'mid', label: '三至四阶', match: (tier) => tier >= 3 && tier <= 4 },
  { id: 'high', label: '五阶以上', match: (tier) => tier >= 5 },
]

const equippedTechniques = computed(() =>
  game.game.player.equippedTechniqueIds.flatMap((id) => {
    const view = game.techniqueViews.find((entry) => entry.definition.id === id)
    return view ? [view] : []
  }),
)

const techniqueSlots = computed(() =>
  Array.from({ length: MAX_TECHNIQUE_SLOTS }, (_, index) => ({
    index,
    view: equippedTechniques.value[index],
  })),
)

const benchTechniques = computed(() =>
  game.techniqueViews.filter((view) => view.learned && !view.equipped),
)

const tabs = computed(() => [
  { id: 'learning', label: '功法', count: game.techniqueViews.length },
  {
    id: 'loadout',
    label: '法门',
    count: `${equippedTechniques.value.length}/${MAX_TECHNIQUE_SLOTS}`,
  },
  {
    id: 'divine',
    label: '神通',
    count: `${game.divineSummary.collected}/${game.divineSummary.total}`,
  },
])

const artTabs = computed(() => [
  { id: 'all', label: '全部', count: game.techniqueViews.length },
  { id: 'learned', label: '已修', count: game.techniqueViews.filter((view) => view.learned).length },
  { id: 'unknown', label: '未得', count: game.techniqueViews.filter((view) => !view.learned).length },
])

const tierTabs = computed(() => [
  { id: 'all', label: '诸阶' },
  ...TIER_BANDS.filter((band) =>
    game.techniqueViews.some((view) => band.match(view.definition.tier)),
  ).map((band) => ({
    id: band.id,
    label: band.label,
    count: game.techniqueViews.filter((view) => band.match(view.definition.tier)).length,
  })),
])

const fuseProspectMap = computed(() => {
  const map = new Map<string, string[]>()
  for (const view of game.techniqueViews) {
    if (!view.learned || !view.nodes.length || view.progress < view.nodes.length) continue
    const prospects = game.divineAbilityViews
      .filter(
        (divine) =>
          !divine.collected &&
          divine.techniques.some((technique) => technique.id === view.definition.id) &&
          divine.techniques.every((technique) => technique.mastered),
      )
      .map((divine) => {
        const partners = divine.techniques
          .filter((technique) => technique.id !== view.definition.id)
          .map((technique) => `《${technique.name}》`)
        return `「${divine.definition.name}」${partners.length ? `与${partners.join('、')}` : ''}`
      })
    if (prospects.length) map.set(view.definition.id, prospects)
  }
  return map
})

const fuseReadyCount = computed(
  () =>
    game.divineAbilityViews.filter((view) => !view.collected && view.canFuse).length,
)

const learnedCount = computed(
  () => game.techniqueViews.filter((view) => view.learned).length,
)

const visibleTechniques = computed(() =>
  game.techniqueViews.filter((view) => {
    if (artFilter.value === 'learned' && !view.learned) return false
    if (artFilter.value === 'unknown' && view.learned) return false
    if (tierFilter.value !== 'all') {
      const band = TIER_BANDS.find((entry) => entry.id === tierFilter.value)
      if (band && !band.match(view.definition.tier)) return false
    }
    return true
  }),
)

function selectTab(id: string): void {
  tab.value = id as ArtTab
}

function selectArtFilter(id: string): void {
  artFilter.value = id as ArtFilter
}

function selectTier(id: string): void {
  tierFilter.value = id as TierFilter
}

function studyHint(view: TechniqueView, node: TechniqueNode): string {
  const parts = [
    `参悟《${view.definition.name}》第${node.index + 1}层「${node.name}」：耗 ${node.costText}`,
  ]
  if (node.stats) parts.push(describeStats(node.stats))
  if (!node.met) {
    parts.push(`因缘尚缺：${describeRequirements(node.unmet)}`)
  } else if (!node.affordable) {
    parts.push('修为或灵石不足')
  }
  parts.push('参透后属性计入角色，装入法门位的招式才会在遭遇中出手')
  return `${parts.join('；')}。`
}

function loadoutHint(view: TechniqueView): string {
  const parts = [`《${view.definition.name}》已参透心法的属性已全数计入角色`]
  if (view.skill) {
    parts.push(`装入法门位后，战技「${view.skill.name}」会按冷却自动出手（冷却 ${view.skill.cooldown} 回合 · 倍率 ${view.skill.multiplier}）`)
  } else {
    parts.push('此门没有战技，装入法门位不会改变出手')
  }
  parts.push('三个法门位只决定战技，不影响功法属性')
  return `${parts.join('；')}。`
}

function unequipHint(view: TechniqueView): string {
  return `卸下《${view.definition.name}》的战技${view.skill ? `「${view.skill.name}」` : ''}：功法属性仍然全部生效，只是这门招式不再于战中出手。`
}

function fuseHint(view: DivineView): string {
  if (view.collected) return '此神通已经收录，无需再炼。'
  const parts = [
    `合炼「${view.definition.name}」：需两门功法圆满、修为 ${view.definition.cultivation}、灵石 ${view.definition.spiritStones}`,
    view.definition.items
      .map((entry) => {
        const material = view.materials.find((row) => row.itemId === entry.itemId)
        return `${material?.name ?? '材料'} ×${entry.count}`
      })
      .join('、'),
    '成功后永久收录，但只有落入活跃位时，被动与战技才会生效',
  ]
  if (view.blockers.length) parts.push(`尚缺：${view.blockers.join('；')}`)
  return `${parts.join('；')}。`
}

function materialHint(material: DivineView['materials'][number]): string {
  const parts = [`${material.name}：手头 ${material.have} / 需 ${material.need}`]
  if (material.source) parts.push(`来处 · ${material.source}`)
  if (material.description) parts.push(material.description)
  const text = parts.join('；')
  return /[。！？]$/.test(text) ? text : `${text}。`
}

function divineHint(view: DivineView): string {
  if (!view.collected) return fuseHint(view)
  if (view.active) return `收回「${view.definition.name}」：被动属性与战技将暂不生效，但仍留在收录中。`
  const full = view.activeSlots <= game.divineSummary.active
  return `让「${view.definition.name}」落入活跃位：被动 ${describeStats(view.definition.passiveStats) || '无'}；战技「${view.definition.skill.name}」会按冷却出手。${full ? `活跃位已满（${view.activeSlots} 个），先收回一份。` : `当前活跃 ${game.divineSummary.active}/${view.activeSlots}。`}`
}

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

function study(techniqueId: string, nodeIndex: number): void {
  game.studyTechnique(
    techniqueId as Parameters<typeof game.studyTechnique>[0],
    nodeIndex,
  )
}

function equipTechnique(techniqueId: string): void {
  game.equipTechnique(techniqueId as Parameters<typeof game.equipTechnique>[0])
}

function unequipTechnique(techniqueId: string): void {
  game.unequipTechnique(techniqueId as Parameters<typeof game.unequipTechnique>[0])
}

function fuseAbility(abilityId: string): void {
  game.fuseDivineAbility(abilityId as Parameters<typeof game.fuseDivineAbility>[0])
}

function toggleDivine(abilityId: string, active: boolean): void {
  game.setDivineAbilityActive(
    abilityId as Parameters<typeof game.setDivineAbilityActive>[0],
    active,
  )
}
</script>

<template>
  <div class="space-y-4">
    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="tabs" :active="tab" @select="selectTab" />
        <template v-if="tab === 'learning'">
          <TabBar :tabs="artTabs" :active="artFilter" @select="selectArtFilter" />
          <TabBar size="sm" :tabs="tierTabs" :active="tierFilter" @select="selectTier" />
        </template>
      </div>
    </Teleport>

    <template v-if="tab === 'learning'">
      <p class="text-[13px] leading-5 text-muted">
        功法不是一次学会便算完：入门之后，每一层心法都要以修为与灵石慢慢参透。参透前一层，后一层才会显出真意。
      </p>

      <section
        v-if="!learnedCount"
        class="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-gold/35 bg-gold/[0.05] px-3 py-2"
      >
        <p class="text-[13px] leading-5 text-gold-deep">
          还没有得传任何功法。入一方势力、领受门中差事，攒下的贡献才能换到传法；旧藏与奇遇里也散着残章。
        </p>
        <button
          type="button"
          class="shrink-0 rounded-sm border border-gold/40 bg-white/30 px-2.5 py-1 text-[12px] text-gold-deep transition hover:bg-gold/10"
          @click="ui.openPanel('faction')"
        >
          去势力页
        </button>
      </section>

      <section
        v-if="fuseReadyCount"
        class="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-jade/35 bg-jade-soft/50 px-3 py-2"
      >
        <p class="text-[13px] leading-5 text-jade-deep">
          有两门圆满功法的意境已经合上，可合炼 {{ fuseReadyCount }} 份神通。
        </p>
        <button
          type="button"
          class="shrink-0 rounded-sm border border-jade/40 bg-white/30 px-2.5 py-1 text-[12px] text-jade-deep transition hover:bg-jade/15"
          @click="tab = 'divine'"
        >
          前往神通
        </button>
      </section>

      <p
        v-if="!visibleTechniques.length"
        class="rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted"
      >
        这个分类里暂时没有功法。
      </p>

      <article
        v-for="view in visibleTechniques"
        :key="view.definition.id"
        class="rounded-sm border p-3.5"
        :class="
          view.learned
            ? 'border-line/80 bg-white/25'
            : 'border-dashed border-line/80 bg-paper/20'
        "
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-serif text-xl leading-tight">
                {{ view.definition.name }}
              </p>
              <span class="rounded-sm border border-line px-1.5 py-0.5 text-[12px] text-muted">
                {{ view.definition.tier }} 阶
                <template v-if="view.definition.element">
                  · {{ ELEMENT_LABELS[view.definition.element] ?? '无属' }}
                </template>
              </span>
              <span
                v-if="view.equipped"
                class="rounded-sm border border-jade/40 px-1.5 py-0.5 text-[12px] text-jade-deep"
              >
                法门位
              </span>
              <span
                v-if="fuseProspectMap.get(view.definition.id)?.length"
                class="rounded-sm border border-gold/45 px-1.5 py-0.5 text-[12px] text-gold-deep"
              >
                意境已成
              </span>
            </div>
            <p class="mt-1 text-[13px] leading-5 text-muted">{{ view.definition.description }}</p>
          </div>
          <span
            class="shrink-0 rounded-sm border px-1.5 py-0.5 text-[12px]"
            :class="
              view.learned
                ? 'border-jade/40 text-jade-deep'
                : 'border-line text-muted'
            "
          >
            {{ view.learned ? `${view.progress} / ${view.nodes.length} 层` : '未入门' }}
          </span>
        </div>

        <template v-if="view.learned">
          <div v-if="view.skill" class="mt-2.5 rounded-sm border border-line/70 px-2.5 py-2">
            <p class="text-[13px] font-medium">战中招式 · {{ view.skill.name }}</p>
            <p class="mt-0.5 text-[12px] leading-4 text-muted">
              {{ view.skill.description }}
              冷却 {{ view.skill.cooldown }} 回合 · 倍率 {{ view.skill.multiplier }}
            </p>
          </div>

          <p
            v-if="fuseProspectMap.get(view.definition.id)?.length"
            class="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-sm border border-gold/35 bg-gold/[0.04] px-2.5 py-1.5 text-[12px] leading-4 text-gold-deep"
          >
            <span>
              此门已参至圆满，意境可入神通：{{ fuseProspectMap.get(view.definition.id)?.join('、') }}
            </span>
            <button
              type="button"
              class="shrink-0 rounded-sm border border-gold/40 px-2 py-0.5 text-[12px] transition hover:bg-gold/10"
              @click="tab = 'divine'"
            >
              看配方
            </button>
          </p>

          <div class="mt-2 space-y-1.5">
            <div
              v-for="node in view.nodes"
              :key="node.id"
              class="rounded-sm border px-2.5 py-2"
              :class="
                node.unlocked
                  ? 'border-line/60 bg-paper/30'
                  : node.canStudy
                    ? 'border-jade/35 bg-jade-soft'
                    : 'border-line/50'
              "
            >
              <div class="flex items-start justify-between gap-2">
                <p class="min-w-0 text-[14px] font-medium">
                  第{{ node.index + 1 }}层 · {{ node.name }}
                </p>
                <span class="shrink-0 text-[12px] text-muted">
                  {{ node.unlocked ? '已参透' : node.costText }}
                </span>
              </div>
              <p class="mt-1 text-[12px] leading-4 text-muted">{{ node.description }}</p>
              <p v-if="node.unmet.length" class="mt-1 text-[12px] leading-4 text-cinnabar/80">
                尚缺：{{ describeRequirements(node.unmet) }}
              </p>
              <button
                v-if="!node.unlocked"
                type="button"
                class="mt-2 w-full rounded-sm border px-2.5 py-1 text-[12px] tracking-[0.08em] transition"
                :class="
                  node.canStudy
                    ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                    : 'cursor-not-allowed border-line text-muted'
                "
                :disabled="!node.canStudy"
                v-hint="studyHint(view, node)"
                @click="study(view.definition.id, node.index)"
              >
                {{
                  node.canStudy
                    ? '参悟此层'
                    : !node.met
                      ? '境界未至'
                      : !node.affordable
                        ? '修为或灵石不足'
                        : '需先参透前层'
                }}
              </button>
            </div>
          </div>
        </template>
        <p v-else class="mt-2.5 border-t border-line/60 pt-2 text-[12px] leading-4 text-muted">
          尚无人传你此诀。功法会在势力、奇遇与旧藏中出现；得传之后才会显出心法层数。
        </p>
      </article>

      <p class="border-t border-line/70 pt-3 text-[12px] leading-5 text-muted">
        功法层数的属性会计入角色；只有装入法门位的功法，招式才会在遭遇战中按冷却自动出手。
      </p>
      <button
        type="button"
        class="w-full rounded-sm border border-line px-2 py-1.5 text-[12px] text-muted transition hover:border-jade/40 hover:text-jade"
        @click="ui.openPanel('character')"
      >
        去修士页细看功法属性来源
      </button>
    </template>

    <template v-else-if="tab === 'loadout'">
      <section>
        <div class="flex items-end justify-between gap-3">
          <p class="text-[13px] tracking-[0.18em] text-muted">法门位</p>
          <p class="text-[12px] text-muted">
            {{ equippedTechniques.length }} / {{ MAX_TECHNIQUE_SLOTS }} 已装
          </p>
        </div>
        <p class="mt-1.5 text-[13px] leading-5 text-muted">
          三个法门位只装招式。所有已修功法的属性照旧全数计入六维，卸下法门位不会丢属性，只会让那门招式不再出手。
        </p>

        <div class="mt-2 grid gap-2 sm:grid-cols-3">
          <article
            v-for="slot in techniqueSlots"
            :key="slot.index"
            class="rounded-sm border p-3"
            :class="
              slot.view
                ? 'border-line/80 bg-white/25'
                : 'border-dashed border-line/70 bg-paper/20'
            "
          >
            <p class="text-[12px] tracking-[0.16em] text-muted">第 {{ slot.index + 1 }} 位</p>
            <template v-if="slot.view">
              <p class="mt-1 font-serif text-lg leading-tight">{{ slot.view.definition.name }}</p>
              <p class="mt-1 text-[12px] text-muted">
                {{ slot.view.progress }} / {{ slot.view.nodes.length }} 层
              </p>
              <p v-if="slot.view.skill" class="mt-1.5 text-[12px] leading-4 text-ink-soft">
                {{ slot.view.skill.name }} · 冷却 {{ slot.view.skill.cooldown }} ·
                倍率 {{ slot.view.skill.multiplier }}
              </p>
              <p v-else class="mt-1.5 text-[12px] leading-4 text-muted">此门无战技</p>
              <button
                type="button"
                class="mt-2 w-full rounded-sm border border-line px-2 py-1 text-[12px] text-muted transition hover:border-cinnabar/40 hover:text-cinnabar"
                v-hint="unequipHint(slot.view)"
                @click="unequipTechnique(slot.view.definition.id)"
              >
                卸下此位
              </button>
            </template>
            <template v-else>
              <p class="mt-1 font-serif text-lg leading-tight text-muted">空位</p>
              <p class="mt-1.5 text-[12px] leading-4 text-muted">
                从下方候补功法中装一门进来。
              </p>
            </template>
          </article>
        </div>
      </section>

      <section>
        <p class="text-[13px] tracking-[0.18em] text-muted">候补功法</p>
        <article
          v-for="view in benchTechniques"
          :key="view.definition.id"
          class="mt-2 flex flex-wrap items-start justify-between gap-3 rounded-sm border border-line/80 bg-paper px-3 py-2.5"
        >
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-[14px] font-medium">{{ view.definition.name }}</p>
              <span class="text-[12px] text-muted">{{ view.progress }} / {{ view.nodes.length }} 层</span>
            </div>
            <p class="mt-0.5 text-[12px] leading-4 text-muted">
              {{
                view.skill
                  ? `${view.skill.name} · 冷却 ${view.skill.cooldown} 回合 · 倍率 ${view.skill.multiplier}`
                  : '此门无战技，装入法门位不会改变出手'
              }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-sm border px-2.5 py-1 text-[12px] tracking-[0.08em] transition"
            :class="
              equippedTechniques.length >= MAX_TECHNIQUE_SLOTS
                ? 'cursor-not-allowed border-line text-muted'
                : 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
            "
            :disabled="equippedTechniques.length >= MAX_TECHNIQUE_SLOTS"
            v-hint="loadoutHint(view)"
            @click="equipTechnique(view.definition.id)"
          >
            {{ equippedTechniques.length >= MAX_TECHNIQUE_SLOTS ? '法门位已满' : '装入法门' }}
          </button>
        </article>
        <p
          v-if="!benchTechniques.length"
          class="mt-2 rounded-sm border border-dashed border-line px-3 py-5 text-center text-[13px] leading-5 text-muted"
        >
          {{
            equippedTechniques.length
              ? '已修功法都在法门位中。'
              : '还没有学会任何功法，法门位暂时空着。'
          }}
        </p>
        <button
          type="button"
          class="mt-2 w-full rounded-sm border border-line px-2 py-1.5 text-[12px] text-muted transition hover:border-jade/40 hover:text-jade"
          @click="ui.openPanel('character')"
        >
          去修士页细看每一门的属性
        </button>
      </section>
    </template>

    <template v-else>
      <section>
        <div class="flex items-end justify-between gap-3">
          <p class="text-[13px] tracking-[0.18em] text-muted">神通</p>
          <p class="text-[12px] text-muted">
            活跃 {{ game.divineSummary.active }} / {{ game.divineSummary.slots }}
          </p>
        </div>
        <p class="mt-1.5 text-[13px] leading-5 text-muted">
          两门功法参至圆满后，可按固定配方合炼神通。神通永久收录，但只有落入活跃位时，被动属性与战技才会生效。
          <template v-if="game.game.player.realm === 'golden_core'">金丹之身可同时悬两份神通。</template>
        </p>
      </section>

      <article
        v-for="view in game.divineAbilityViews"
        :key="view.definition.id"
        class="rounded-sm border p-3.5"
        :class="
          view.active
            ? 'border-jade/40 bg-jade-soft/40'
            : view.collected
              ? 'border-line/80 bg-white/25'
              : 'border-dashed border-line/80 bg-paper/20'
        "
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-serif text-xl leading-tight">{{ view.definition.name }}</p>
              <span class="rounded-sm border border-line px-1.5 py-0.5 text-[12px] text-muted">
                {{ view.definition.title }}
              </span>
              <span
                v-if="view.active"
                class="rounded-sm border border-jade/40 px-1.5 py-0.5 text-[12px] text-jade-deep"
              >
                活跃
              </span>
              <span
                v-else-if="view.collected"
                class="rounded-sm border border-line px-1.5 py-0.5 text-[12px] text-muted"
              >
                已收录
              </span>
            </div>
            <p class="mt-1 text-[13px] leading-5 text-muted">{{ view.definition.description }}</p>
          </div>
          <span class="shrink-0 text-[12px] text-muted">
            被动 {{ describeStats(view.definition.passiveStats) || '无' }}
          </span>
        </div>

        <div class="mt-2.5 grid gap-2 sm:grid-cols-2">
          <div class="rounded-sm border border-line/70 px-2.5 py-2">
            <p class="text-[12px] tracking-[0.16em] text-muted">所需功法</p>
            <p
              v-for="technique in view.techniques"
              :key="technique.id"
              class="mt-1 text-[12px] leading-4"
              :class="technique.mastered ? 'text-jade-deep' : 'text-muted'"
            >
              《{{ technique.name }}》
              {{ technique.learned ? `${technique.progress}/${technique.nodeCount} 层` : '未入门' }}
              <template v-if="technique.mastered"> · 圆满</template>
            </p>
          </div>
          <div class="rounded-sm border border-line/70 px-2.5 py-2">
            <p class="text-[12px] tracking-[0.16em] text-muted">合炼之物</p>
            <p class="mt-1 text-[12px] leading-4 text-muted">
              修为 {{ view.definition.cultivation }} · 灵石 {{ view.definition.spiritStones }}
            </p>
            <p
              v-for="material in view.materials"
              :key="material.itemId"
              class="mt-0.5 cursor-help text-[12px] leading-4 underline decoration-line/70 decoration-dotted underline-offset-2"
              :class="material.ready ? 'text-jade-deep' : 'text-cinnabar/80'"
              v-hint="materialHint(material)"
            >
              {{ material.name }} {{ material.have }} / {{ material.need }}
            </p>
          </div>
        </div>

        <div class="mt-2 rounded-sm border border-line/70 px-2.5 py-2">
          <p class="text-[13px] font-medium">战技 · {{ view.definition.skill.name }}</p>
          <p class="mt-0.5 text-[12px] leading-4 text-muted">
            {{ view.definition.skill.description }}
            冷却 {{ view.definition.skill.cooldown }} 回合 · 倍率 {{ view.definition.skill.multiplier }}
          </p>
        </div>

        <p
          v-if="!view.collected && view.blockers.length"
          class="mt-1.5 text-[12px] leading-4 text-cinnabar/80"
        >
          尚缺：{{ view.blockers.slice(0, 3).join('；') }}{{ view.blockers.length > 3 ? '……' : '' }}
        </p>
        <p
          v-else-if="view.collected && !view.active"
          class="mt-1.5 text-[12px] leading-4 text-muted"
        >
          已收录但不在活跃位：被动与战技暂不生效。
        </p>

        <button
          v-if="!view.collected"
          type="button"
          class="mt-2 w-full rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
          :class="
            view.canFuse
              ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
              : 'cursor-not-allowed border-line text-muted'
          "
          :disabled="!view.canFuse"
          v-hint="fuseHint(view)"
          @click="fuseAbility(view.definition.id)"
        >
          {{ view.canFuse ? '合炼神通' : '条件未齐' }}
        </button>
        <button
          v-else
          type="button"
          class="mt-2 w-full rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
          :class="
            view.active
              ? 'border-line text-muted hover:border-cinnabar/40 hover:text-cinnabar'
              : game.divineSummary.active < view.activeSlots
                ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                : 'cursor-not-allowed border-line text-muted'
          "
          :disabled="!view.active && game.divineSummary.active >= view.activeSlots"
          v-hint="divineHint(view)"
          @click="toggleDivine(view.definition.id, !view.active)"
        >
          {{
            view.active
              ? '收回识海'
              : game.divineSummary.active < view.activeSlots
                ? '落入活跃位'
                : '活跃位已满'
          }}
        </button>
      </article>

      <p class="border-t border-line/70 pt-3 text-[12px] leading-5 text-muted">
        神通配方固定，不随境界改变。两门功法的层数与属性都留在原处，合炼只是把它们的意境另炼成一份神通。
      </p>
    </template>
  </div>
</template>
