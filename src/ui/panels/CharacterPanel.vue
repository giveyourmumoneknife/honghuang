<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { CombatStats } from '@/types/content'
import type { CombatMods } from '@/types/gear'
import { GEAR_MOD_LABELS, GEAR_STAT_LABELS } from '@/data/gear/catalog'
import { BODY_STAGES } from '@/core/body'
import type {
  ActionCostView,
  BloodlineAcquisitionView,
} from '@/core/bodyActions'
import { FOUNDATION_CAPS } from '@/core/foundation'
import { calendarFromMonths } from '@/core/time'
import { useGameStore } from '@/stores/game'
import { useUiStore } from '@/stores/ui'
import { formatCost } from '../labels'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type CharacterTab =
  | 'overview'
  | 'attributes'
  | 'cultivation'
  | 'lawbody'
  | 'bonds'
  | 'wealth'
type AttrSub = 'summary' | 'sources' | 'mods'
type CultSub = 'realm' | 'techniques' | 'roots'
type LawBodySub = 'physique' | 'bloodline' | 'body'
type BondSub = 'gear' | 'treasure' | 'companions'
type WealthSub = 'resources' | 'inventory' | 'training'
type StatKey = keyof CombatStats

const game = useGameStore()
const ui = useUiStore()
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')
const tab = ref<CharacterTab>('overview')
const attrSub = ref<AttrSub>('summary')
const cultSub = ref<CultSub>('realm')
const lawBodySub = ref<LawBodySub>('physique')
const bondSub = ref<BondSub>('gear')
const wealthSub = ref<WealthSub>('resources')

const body = computed(() => game.bodyView)

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

const SOURCE_KIND_LABELS: Record<
  (typeof game.sheet.statSources)[number]['kind'],
  string
> = {
  origin: '出身',
  realm: '境界',
  root: '灵根',
  talent: '天赋',
  gear: '器物',
  technique: '功法',
  mount: '坐骑',
  pet: '灵宠',
  treasure: '法宝',
  dao: '道途',
  foundation: '根基',
  divine: '神通',
  physique: '体质',
  body: '体魄',
  bloodline: '血脉',
}

const MOD_DESCRIPTIONS: Record<keyof CombatMods, string> = {
  lifesteal: '造成伤害时，按比例回复气血。',
  armorPen: '无视目标一部分护体。',
  critDamage: '暴击时额外增加的伤害倍率。',
  dodge: '闪避一次攻势的几率。',
  thorns: '受击时反弹一部分伤害。',
  regen: '每回合自行恢复的最大气血比例。',
  burn: '命中时有几率留下持续灼烧。',
  shieldStart: '争斗开始时自带的护体回合数。',
  lowHpAttack: '气血低于四成时的攻势加成。',
  elementBonus: '一切造成的伤害加成。',
  elementResist: '一切受到的伤害减免。',
  travel: '行旅进度加成。',
  cultivation: '主修与历练的修为加成。',
  dropRate: '历练战利品的额外掉落几率。',
  healing: '受治疗效果的加成。',
  firstStrike: '争斗首轮的身法加成。',
}

const FLAT_MODS = new Set<keyof CombatMods>(['shieldStart', 'firstStrike'])

const STAT_DEFS: Array<{ key: StatKey; label: string; suffix?: string; hint: string }> = [
  { key: 'health', label: '气血', hint: '承受伤害的底线；归零则败。' },
  { key: 'attack', label: '攻势', hint: '每次出手的基础伤害。' },
  { key: 'defense', label: '护体', hint: '削减受到的伤害。' },
  { key: 'speed', label: '身法', hint: '影响出手次序与先手。' },
  { key: 'crit', label: '暴击', suffix: '%', hint: '造成额外伤害的几率，最高 80%。' },
  { key: 'spirit', label: '神识', hint: '影响冲关成算与部分术法。' },
]

const rootElementLabel = computed(() => {
  const element = game.rootDefinition?.element
  return element ? (ELEMENT_LABELS[element] ?? '无属') : ''
})

const equippedSlots = computed(() =>
  game.standardGearSlotViews.filter((slot) => slot.equipped),
)

const equippedCount = computed(() => equippedSlots.value.length)

const activeSets = computed(() => game.sheet.gearSets)

const activeTreasure = computed(() =>
  game.treasureViews.find((treasure) => treasure.isActive),
)

const activeMount = computed(() => game.mountViews.find((mount) => mount.active))

const activePet = computed(() => game.petViews.find((pet) => pet.active))

const learnedTechniques = computed(() =>
  game.techniqueViews.filter((view) => view.learned),
)

const trainingReports = computed(() => game.trainingReports)

const inventoryItemGroups = computed(() => {
  const groups = new Map<string, { label: string; count: number; names: string[] }>()
  for (const entry of game.inventoryViews) {
    if (entry.kind !== 'item') continue
    const group = groups.get(entry.category) ?? {
      label: entry.categoryLabel,
      count: 0,
      names: [],
    }
    group.count += entry.count
    if (group.names.length < 4) group.names.push(entry.name)
    groups.set(entry.category, group)
  }
  return [...groups.values()]
})

const attributeViews = computed(() => {
  const sheet = game.sheet
  const totals: Record<StatKey, number> = {
    health: sheet.maxHealth,
    attack: sheet.attack,
    defense: sheet.defense,
    speed: sheet.speed,
    crit: sheet.crit,
    spirit: sheet.spirit,
  }
  return STAT_DEFS.map((definition) => {
    const contributions = sheet.statSources.flatMap((source) => {
      const value = source.stats[definition.key]
      return value
        ? [
            {
              id: source.id,
              label: source.label,
              kind: source.kind,
              value,
            },
          ]
        : []
    })
    const bonus = contributions.reduce((sum, entry) => sum + entry.value, 0)
    return {
      ...definition,
      base: sheet.baseStats[definition.key],
      bonus,
      total: totals[definition.key],
      contributions,
    }
  })
})

const modViews = computed(() => {
  const mods = game.sheet.mods
  return (Object.keys(GEAR_MOD_LABELS) as Array<keyof CombatMods>)
    .filter((key) => mods[key] !== 0)
    .map((key) => ({
      key,
      label: GEAR_MOD_LABELS[key],
      description: MOD_DESCRIPTIONS[key],
      flat: FLAT_MODS.has(key),
      value: mods[key],
    }))
})

const cultivationRate = computed(() => game.cultivationRateView)

const physiqueAffinities = computed(() => {
  const physiqueId = body.value.physiqueId
  return body.value.bloodline.options
    .filter((option) => option.definition.affinityPhysiqueIds.includes(physiqueId))
    .map((option) => ({
      id: option.definition.id,
      name: option.definition.name,
      affinity: option.affinity,
    }))
    .sort((left, right) => right.affinity - left.affinity)
})

const charTabs = computed<
  Array<{ id: CharacterTab; label: string; count?: string | number }>
>(() => [
  { id: 'overview', label: '概览' },
  { id: 'attributes', label: '属性', count: '六维' },
  { id: 'cultivation', label: '修行', count: `${learnedTechniques.value.length} 法` },
  { id: 'lawbody', label: '法体', count: body.value.stage.name },
  { id: 'bonds', label: '器缘', count: `${equippedCount.value}/10` },
  { id: 'wealth', label: '资财', count: game.resourceChips.length },
])

const attrTabs = [
  { id: 'summary', label: '六维' },
  { id: 'sources', label: '来源' },
  { id: 'mods', label: '器理' },
]

const cultTabs = [
  { id: 'realm', label: '境界' },
  { id: 'techniques', label: '功法' },
  { id: 'roots', label: '道基' },
]

const lawBodyTabs = [
  { id: 'physique', label: '体质' },
  { id: 'bloodline', label: '血脉' },
  { id: 'body', label: '体魄' },
]

const bondTabs = [
  { id: 'gear', label: '着身' },
  { id: 'treasure', label: '法宝' },
  { id: 'companions', label: '同行' },
]

const wealthTabs = [
  { id: 'resources', label: '资源' },
  { id: 'inventory', label: '行囊' },
  { id: 'training', label: '历练' },
]

const breakthroughHint = computed(() => {
  const info = game.breakthroughInfo
  if (info.atMax) return '金丹圆满已是此世顶点，无需再冲关'
  const cultivation = Math.floor(game.game.player.cultivation)
  const parts = [
    `冲关「${info.label}」 · 耗修为 ${info.cost}（现有 ${cultivation}） · 成算 ${Math.round(info.chance * 100)}%`,
    '成功：境界晋升，气血回满',
    `失手：再散 ${Math.floor(info.cost * 0.35)} 修为，气血降至六成，并中「冲关反噬」三月`,
  ]
  if (!info.affordable) {
    parts.push(`修为尚差 ${Math.ceil(info.cost - game.game.player.cultivation)}`)
  }
  if (info.aidActive) parts.push('破境丹药力在身，此次成算已加 12%，冲关后药力散尽')
  if (!info.healthReady) parts.push('气血需过半数才能冲关')
  parts.push('成算受神识与当前气血影响，气血越足越稳')
  return parts.join('。')
})

function selectTab(id: string): void {
  tab.value = id as CharacterTab
}

function selectAttrSub(id: string): void {
  attrSub.value = id as AttrSub
}

function selectCultSub(id: string): void {
  cultSub.value = id as CultSub
}

function selectLawBodySub(id: string): void {
  lawBodySub.value = id as LawBodySub
}

function selectBondSub(id: string): void {
  bondSub.value = id as BondSub
}

function selectWealthSub(id: string): void {
  wealthSub.value = id as WealthSub
}

function rate(value: number): string {
  return Number(value.toFixed(2)).toString()
}

function statText(stats?: Partial<CombatStats>): string {
  if (!stats) return '无'
  return (
    (Object.keys(GEAR_STAT_LABELS) as StatKey[])
      .flatMap((key) => {
        const value = stats[key]
        return typeof value === 'number' && value !== 0
          ? [`${GEAR_STAT_LABELS[key]} ${value > 0 ? '+' : ''}${value}`]
          : []
      })
      .join(' · ') || '无属性加成'
  )
}

function modText(value: number, flat: boolean): string {
  return flat ? `+${Math.round(value)}` : `+${Math.round(value * 100)}%`
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`
}

function monthLabel(months: number): string {
  const calendar = calendarFromMonths(months)
  return `${calendar.year}年${calendar.month}月`
}

function actionCostText(cost: ActionCostView): string {
  const parts: string[] = []
  if (cost.cultivation > 0) parts.push(`修为 ${cost.cultivation}`)
  const resources = formatCost(cost.resources)
  if (resources !== '无') parts.push(resources)
  for (const item of cost.items) {
    parts.push(`${item.name} ${item.count}/${item.have}`)
  }
  return parts.length > 0 ? parts.join(' · ') : '无'
}

function actionCostHint(cost: ActionCostView): string {
  const parts: string[] = []
  if (cost.cultivation > 0) {
    parts.push(`修为 ${cost.cultivation}（现有 ${Math.floor(game.game.player.cultivation)}）`)
  }
  const resources = formatCost(cost.resources)
  if (resources !== '无') parts.push(resources)
  for (const item of cost.items) {
    parts.push(`${item.name} ${item.count}（现有 ${item.have}）`)
  }
  return parts.length > 0 ? parts.join('，') : '无需代价'
}

function modsText(mods?: Partial<CombatMods>): string {
  if (!mods) return ''
  return (
    (Object.keys(mods) as Array<keyof CombatMods>)
      .filter((key) => (mods[key] ?? 0) !== 0)
      .map((key) => {
        const value = mods[key] ?? 0
        const display = FLAT_MODS.has(key)
          ? `+${Math.round(value)}`
          : `+${Math.round(value * 100)}%`
        return `${GEAR_MOD_LABELS[key]} ${display}`
      })
      .join(' · ') || ''
  )
}

function pathHint(path: CharacterPathView): string {
  if (path.active) return `当前修行路径。${path.description}`
  if (path.blockedReason) return `${path.blockedReason}${path.description}`
  return [
    `改走${path.name}：${path.description}`,
    `修行 ×${path.lawMultiplier.toFixed(2)}`,
    `修为转淬体 ${Math.round(path.bodyRatio * 100)}%`,
    ...(path.canSelect ? [] : [path.blockedReason ?? '']),
  ].join('。')
}

type CharacterPathView = (typeof game.bodyView)['paths'][number]

function bodyBreakthroughHint(): string {
  const info = body.value.breakthrough
  const parts = [
    `冲「${info.targetName}」 · 成算 ${Math.round(info.chance * 100)}%`,
    '成功：体魄晋阶，气血回满，血脉若够纯度也会随之苏醒',
    '失手：散三成五淬体值、气血降至五成五，并留「破体旧伤」三月',
    `需淬体值满、气血过五成五。当前气血 ${Math.round(body.value.healthRatio * 100)}%`,
  ]
  if (info.blockedReason) parts.push(info.blockedReason)
  return parts.join('。')
}

function manualTemperHint(): string {
  const view = body.value.manualTemper
  return `闭关淬体：耗 ${actionCostHint(view.cost)}，淬体值 +${Math.round(view.gain)}，气血会被烧去一部分。${view.blockedReason ?? '每月可行一次。'}`
}

function physiqueHint(): string {
  const physique = body.value.physique
  if (!physique) return '体质未显。'
  return [
    physique.description,
    physique.note,
    `修行 ×${physique.cultivationMultiplier.toFixed(2)} · 淬体 ×${physique.bodyTemperMultiplier.toFixed(2)} · 破体 ${physique.bodyBreakthroughBonus >= 0 ? '+' : ''}${Math.round(physique.bodyBreakthroughBonus * 100)}%`,
  ].join('。')
}

function affinityHint(): string {
  if (!physiqueAffinities.value.length) return '此体质没有格外亲和的旧血。'
  return `血脉亲和会影响承载后的初始纯度与唤醒成算：${physiqueAffinities.value
    .map((entry) => `${entry.name} +${Math.round(entry.affinity * 100)}%`)
    .join('，')}。`
}

function bloodlineOptionHint(option: BloodlineAcquisitionView): string {
  const parts = [
    option.definition.description,
    option.definition.note,
    `需体魄${BODY_STAGES[option.definition.acquisition.bodyStage]?.name ?? '凡躯'}，承载后初始纯度 ${option.initialPurity}`,
    `亲和 ${Math.round(option.affinity * 100)}% 会提高唤醒成算`,
    option.definition.acquisition.hint,
    `代价：${actionCostHint(option.cost)}`,
  ]
  if (option.blockedReason) parts.push(option.blockedReason)
  return parts.join('。')
}

function awakenHint(): string {
  const view = body.value.bloodline
  const parts = [
    `唤醒旧血 · 成算 ${Math.round(view.awakenChance * 100)}%`,
    '成功：血脉入一阶，开始提供属性；部分血脉还会解锁主动招式',
    '失手：纯度 -10，气血降至六成，三月内不能再唤；可继续炼血把纯度养回来',
  ]
  if (view.awakenBlockedReason) parts.push(view.awakenBlockedReason)
  return parts.join('。')
}

function refineHint(): string {
  const view = body.value.bloodline
  if (!view.refine) return '炼血尚未开启。'
  const parts = [
    `炼血一轮：纯度 +${view.refine.purityGain}`,
    `需 ${actionCostHint(view.refine.cost)}`,
    view.nextStage
      ? `下一阶「${view.nextStage.name}」需纯度 ${view.nextStage.purity}、体魄${BODY_STAGES[view.nextStage.bodyStage]?.name ?? '凡躯'}`
      : '已至最后一阶',
  ]
  if (view.stage === 0) {
    parts.push('旧血尚未苏醒，炼血先养纯度；纯度到二十后可尝试唤醒')
  }
  if (view.refine.blockedReason) parts.push(view.refine.blockedReason)
  return parts.join('。')
}

function severHint(): string {
  const view = body.value.bloodline
  return `断去旧血：永久失去当前血脉与已有纯度，气血降至六成五，并留「破体旧伤」三月。代价 ${actionCostHint(view.severCost)}。`
}

function severBloodline(): void {
  if (!window.confirm('断去血脉会永久失去它已有的纯度与阶段，确定？')) return
  game.severBloodline()
}

const bodyStageLadder = BODY_STAGES

function bodyStageName(stage: number): string {
  return BODY_STAGES[stage]?.name ?? '未知'
}

function awakenBloodline(): void {
  game.awakenBloodline()
}

function refineBloodline(): void {
  game.refineBloodline()
}

function acquireBloodline(bloodlineId: string): void {
  game.acquireBloodline(bloodlineId)
}

function selectBodyPath(path: CharacterPathView['id']): void {
  game.setBodyPath(path)
}

function temperBody(): void {
  game.temperBody()
}

function attemptBodyBreakthrough(): void {
  game.attemptBodyBreakthrough()
}
</script>

<template>
  <div class="space-y-5">
    <section>
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="font-serif text-2xl leading-none">{{ game.game.player.name }}</p>
          <p class="mt-1.5 text-[14px] text-muted">
            {{ game.game.player.origin }} · {{ game.game.player.lineage }} ·
            {{ game.originDefinition?.name ?? '来历不明' }}
          </p>
        </div>
        <span class="shrink-0 rounded-sm border border-jade/35 bg-jade-soft px-2 py-1 text-[13px] text-jade-deep">
          {{ game.realmLabel }}
        </span>
      </div>

      <div class="mt-3 flex flex-wrap gap-1.5">
        <span
          v-if="game.rootDefinition"
          class="rounded-sm border border-line bg-white/25 px-2 py-1 text-[12px] text-ink-soft"
        >
          灵根 · {{ game.rootDefinition.name }}
          <template v-if="rootElementLabel">（{{ rootElementLabel }}）</template>
        </span>
        <span
          v-for="talent in game.talentDefinitions"
          :key="talent.id"
          class="rounded-sm border border-line bg-white/25 px-2 py-1 text-[12px] text-ink-soft"
        >
          天赋 · {{ talent.name }}
        </span>
        <span
          v-hint="physiqueHint()"
          class="cursor-help rounded-sm border border-jade/30 bg-jade-soft px-2 py-1 text-[12px] text-jade-deep"
        >
          体质 · {{ body.physique?.name ?? '凡胎' }}
        </span>
        <span
          v-hint="body.balance.hint"
          class="cursor-help rounded-sm border border-line bg-white/25 px-2 py-1 text-[12px] text-ink-soft"
        >
          法体 · {{ body.stage.name }} · {{ body.balance.label }}
        </span>
        <span
          v-if="body.bloodline.active"
          class="rounded-sm border border-line bg-white/25 px-2 py-1 text-[12px] text-ink-soft"
        >
          血脉 · {{ body.bloodline.definition?.name }} {{ body.bloodline.stage }} 阶 · 纯度
          {{ body.bloodline.purity }}
        </span>
        <span class="rounded-sm border border-line bg-white/25 px-2 py-1 text-[12px] text-muted">
          修为倍率 {{ game.cultivationBonusLabel }}
        </span>
      </div>
    </section>

    <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
      <div class="space-y-1.5">
        <TabBar :tabs="charTabs" :active="tab" @select="selectTab" />
        <TabBar
          v-if="tab === 'attributes'"
          size="sm"
          :tabs="attrTabs"
          :active="attrSub"
          @select="selectAttrSub"
        />
        <TabBar
          v-else-if="tab === 'cultivation'"
          size="sm"
          :tabs="cultTabs"
          :active="cultSub"
          @select="selectCultSub"
        />
        <TabBar
          v-else-if="tab === 'lawbody'"
          size="sm"
          :tabs="lawBodyTabs"
          :active="lawBodySub"
          @select="selectLawBodySub"
        />
        <TabBar
          v-else-if="tab === 'bonds'"
          size="sm"
          :tabs="bondTabs"
          :active="bondSub"
          @select="selectBondSub"
        />
        <TabBar
          v-else-if="tab === 'wealth'"
          size="sm"
          :tabs="wealthTabs"
          :active="wealthSub"
          @select="selectWealthSub"
        />
      </div>
    </Teleport>

    <template v-if="tab === 'overview'">
      <section>
        <div class="flex items-center justify-between text-[13px]">
          <span class="tracking-[0.18em] text-muted">气血</span>
          <span class="tabular-nums text-ink-soft">{{ game.healthLabel }}</span>
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-line/70">
          <div
            class="h-full rounded-full transition-[width] duration-500"
            :class="game.healthPercent < 35 ? 'bg-cinnabar/70' : 'bg-jade/60'"
            :style="{ width: `${game.healthPercent}%` }"
          ></div>
        </div>
        <div v-if="game.statusViews.length" class="mt-2 flex flex-wrap gap-1.5">
          <span
            v-for="status in game.statusViews"
            :key="status.id"
            v-hint="`${status.description}（尚余 ${Math.ceil(status.monthsRemaining)} 月）`"
            class="cursor-help rounded-sm border border-cinnabar/25 bg-cinnabar/[0.04] px-2 py-0.5 text-[12px] text-cinnabar"
          >
            {{ status.label }} · {{ Math.ceil(status.monthsRemaining) }} 月
          </span>
        </div>
        <p v-else class="mt-2 text-[12px] leading-4 text-muted">
          身上没有未愈的伤，也没有缠着你的旧事。
        </p>
      </section>

      <section class="grid grid-cols-3 gap-2">
        <button
          v-for="attribute in game.characterAttributes"
          :key="attribute.key"
          v-hint="attribute.hint"
          type="button"
          class="rounded-sm border border-line/80 bg-paper px-2.5 py-2 text-left transition hover:border-jade/35"
          @click="tab = 'attributes'; attrSub = 'summary'"
        >
          <p class="text-[12px] text-muted">{{ attribute.label }}</p>
          <p class="mt-0.5 font-serif text-base leading-none">{{ attribute.value }}</p>
        </button>
      </section>

      <section class="border-y border-line/70 py-4">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="text-[13px] tracking-[0.18em] text-muted">修为</p>
            <p class="mt-1 font-serif text-4xl leading-none">{{ game.cultivationLabel }}</p>
          </div>
          <p class="pb-0.5 text-right text-[13px] leading-5 text-muted">
            月入 {{ rate(cultivationRate.total) }}<br />
            修为倍率 {{ game.cultivationBonusLabel }}
          </p>
        </div>
        <div class="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            class="rounded-sm border border-line px-2 py-1 text-[12px] text-muted transition hover:border-jade/40 hover:text-jade"
            @click="tab = 'cultivation'; cultSub = 'realm'"
          >
            {{ game.breakthroughInfo.atMax ? '金丹圆满' : `下一境 · ${game.breakthroughInfo.label}` }}
          </button>
          <button
            type="button"
            class="rounded-sm border border-line px-2 py-1 text-[12px] text-muted transition hover:border-jade/40 hover:text-jade"
            @click="tab = 'cultivation'; cultSub = 'techniques'"
          >
            已修 {{ learnedTechniques.length }} 门功法
          </button>
        </div>
      </section>

      <section class="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          class="rounded-sm border border-line/80 bg-white/25 px-3 py-2.5 text-left transition hover:border-jade/40"
          @click="tab = 'bonds'; bondSub = 'gear'"
        >
          <p class="text-[12px] text-muted">着身器位</p>
          <p class="mt-0.5 text-[14px]">{{ equippedCount }} / 10 已着身</p>
          <p class="mt-1 text-[12px] leading-4 text-muted">
            当前器理：{{ Object.values(game.sheet.mods).some((value) => value !== 0) ? '已生效' : '尚无' }}
          </p>
        </button>
        <button
          type="button"
          class="rounded-sm border border-line/80 bg-white/25 px-3 py-2.5 text-left transition hover:border-jade/40"
          @click="tab = 'bonds'; bondSub = 'treasure'"
        >
          <p class="text-[12px] text-muted">法宝</p>
          <p class="mt-0.5 text-[14px]">{{ activeTreasure ? `悬 · ${activeTreasure.name}` : '未悬法宝' }}</p>
          <p class="mt-1 text-[12px] leading-4 text-muted">
            {{ activeTreasure?.passiveText ? `被动 ${activeTreasure.passiveText}` : '匣中旧物尚在等一个愿意唤醒它们的人。' }}
          </p>
        </button>
        <button
          type="button"
          class="rounded-sm border border-line/80 bg-white/25 px-3 py-2.5 text-left transition hover:border-jade/40"
          @click="tab = 'bonds'; bondSub = 'companions'"
        >
          <p class="text-[12px] text-muted">同行</p>
          <p class="mt-0.5 text-[14px]">
            {{ activeMount?.name ?? '无坐骑' }} · {{ activePet?.name ?? '无灵宠' }}
          </p>
          <p class="mt-1 text-[12px] leading-4 text-muted">
            只有带在身边的，才会把力气借给你。
          </p>
        </button>
        <button
          type="button"
          class="rounded-sm border border-line/80 bg-white/25 px-3 py-2.5 text-left transition hover:border-jade/40"
          @click="tab = 'wealth'; wealthSub = 'resources'"
        >
          <p class="text-[12px] text-muted">资财</p>
          <p class="mt-0.5 text-[14px]">{{ game.resourceChips.length }} 类随身资财</p>
          <p class="mt-1 text-[12px] leading-4 text-muted">
            洞府月入 {{ game.cave ? '已计入' : '尚未有洞府' }}；资财与修为分开结算。
          </p>
        </button>
        <button
          type="button"
          class="rounded-sm border border-jade/30 bg-jade-soft/40 px-3 py-2.5 text-left transition hover:border-jade/50"
          @click="tab = 'lawbody'; lawBodySub = 'body'"
        >
          <p class="text-[12px] text-muted">法体</p>
          <p class="mt-0.5 text-[14px]">
            {{ body.stage.name }} · {{ body.balance.label }}
          </p>
          <p class="mt-1 text-[12px] leading-4 text-muted">
            淬炼值 {{ Math.floor(body.temper) }} ·
            {{ body.bloodline.active ? `${body.bloodline.definition?.name} ${body.bloodline.stage} 阶` : '旧血未承' }}
          </p>
        </button>
      </section>

      <section>
        <p class="text-[13px] tracking-[0.24em] text-jade">道基</p>
        <div class="mt-2 space-y-1.5 text-[13px] leading-5 text-muted">
          <p v-if="game.rootDefinition">
            <span class="text-ink-soft">{{ game.rootDefinition.name }}：</span>
            {{ game.rootDefinition.description }}
          </p>
          <p v-for="talent in game.talentDefinitions" :key="talent.id">
            <span class="text-ink-soft">{{ talent.name }}：</span>{{ talent.description }}
          </p>
          <p v-if="!game.talentDefinitions.length">尚未显出格外天赋，往后可因奇遇得之。</p>
        </div>
      </section>
    </template>

    <template v-else-if="tab === 'attributes'">
      <template v-if="attrSub === 'summary'">
        <section class="space-y-2">
          <article
            v-for="attribute in attributeViews"
            :key="attribute.key"
            class="rounded-sm border border-line/80 bg-paper px-3 py-2.5"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">
                {{ attribute.label }}
                <span class="ml-1 text-[12px] font-normal text-muted">{{ attribute.hint }}</span>
              </p>
              <p class="text-[16px] font-serif">
                {{ attribute.key === 'health' ? game.healthLabel : `${attribute.total}${attribute.suffix ?? ''}` }}
              </p>
            </div>
            <div class="mt-1.5 flex flex-wrap gap-1">
              <span class="rounded-sm border border-line px-1.5 py-0.5 text-[12px] text-muted">
                根底 {{ attribute.base }}
              </span>
              <span
                v-for="entry in attribute.contributions"
                :key="entry.id"
                class="rounded-sm border border-line px-1.5 py-0.5 text-[12px]"
                :class="
                  entry.kind === 'gear'
                    ? 'border-jade/30 text-jade-deep'
                    : entry.value >= 0
                      ? 'border-line text-ink-soft'
                      : 'border-cinnabar/30 text-cinnabar'
                "
              >
                {{ entry.label }} {{ entry.value > 0 ? '+' : '' }}{{ entry.value }}
              </span>
              <span v-if="!attribute.contributions.length" class="text-[12px] text-muted">
                尚无外物加成
              </span>
            </div>
          </article>
          <p class="text-[12px] leading-4 text-muted">
            六维由根底、境界、道基、器物、功法与同行者相加；暴击在结算时最高计 80%。
          </p>
        </section>
      </template>

      <template v-else-if="attrSub === 'sources'">
        <section class="space-y-2">
          <article class="rounded-sm border border-line/80 bg-paper px-3 py-2.5">
            <div class="flex items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">根底</p>
              <p class="text-[12px] text-muted">{{ statText(game.sheet.baseStats) }}</p>
            </div>
            <p class="mt-1 text-[12px] leading-4 text-muted">
              一个尚未借外物的人，也有自己的一副筋骨。
            </p>
          </article>
          <article
            v-for="source in game.sheet.statSources"
            :key="source.id"
            class="rounded-sm border border-line/80 bg-white/25 px-3 py-2.5"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">{{ source.label }}</p>
              <span class="rounded-sm border border-line px-1.5 py-0.5 text-[12px] text-muted">
                {{ SOURCE_KIND_LABELS[source.kind] }}
              </span>
            </div>
            <p class="mt-1 text-[13px] leading-5 text-ink-soft">{{ statText(source.stats) }}</p>
          </article>
          <p v-if="!game.sheet.statSources.length" class="rounded-sm border border-dashed border-line px-3 py-5 text-center text-[13px] text-muted">
            还没有任何外物在替你出力。
          </p>
        </section>
      </template>

      <template v-else>
        <section class="space-y-2">
          <article
            v-for="mod in modViews"
            :key="mod.key"
            class="rounded-sm border border-line/80 bg-paper px-3 py-2.5"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">{{ mod.label }}</p>
              <p class="text-[14px] text-jade-deep">{{ modText(mod.value, mod.flat) }}</p>
            </div>
            <p class="mt-0.5 text-[12px] leading-4 text-muted">{{ mod.description }}</p>
          </article>
          <p v-if="!modViews.length" class="rounded-sm border border-dashed border-line px-3 py-5 text-center text-[13px] leading-5 text-muted">
            器理尚未显出。器物的特殊词条会在着身后直接计入这里。
          </p>
          <p class="text-[12px] leading-4 text-muted">
            器理与六维分开结算：六维是底子，器理改的是争斗中的算法。
          </p>
        </section>
      </template>
    </template>

    <template v-else-if="tab === 'cultivation'">
      <template v-if="cultSub === 'realm'">
        <section class="space-y-3">
          <article class="rounded-sm border border-line/80 bg-paper p-3">
            <p class="text-[13px] tracking-[0.18em] text-muted">修为月入</p>
            <div class="mt-2 space-y-1 text-[13px] leading-5">
              <div class="flex justify-between gap-2">
                <span class="text-muted">主修底数</span>
                <span>{{ rate(0.8) }} / 月</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-muted">洞府栖身</span>
                <span>{{ rate(cultivationRate.caveBase) }} / 月</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-muted">洞府灵气</span>
                <span>{{ rate(cultivationRate.caveProduction) }} / 月</span>
              </div>
              <div class="flex justify-between gap-2 border-t border-line/60 pt-1">
                <span class="text-muted">相加</span>
                <span>{{ rate(cultivationRate.base) }} / 月</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-muted">灵根倍率</span>
                <span>×{{ rate(cultivationRate.rootMultiplier) }}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-muted">体质倍率</span>
                <span>×{{ rate(cultivationRate.physiqueMultiplier) }}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-muted">修行路径</span>
                <span>×{{ rate(cultivationRate.pathMultiplier) }}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-muted">法体平衡</span>
                <span>×{{ rate(cultivationRate.balanceMultiplier) }} · {{ body.balance.label }}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-muted">天赋附加</span>
                <span>+{{ percent(cultivationRate.talentBonus) }}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-muted">器理聚灵</span>
                <span>+{{ percent(cultivationRate.modBonus) }}</span>
              </div>
              <div class="flex justify-between gap-2 border-t border-line/60 pt-1 font-medium">
                <span>最终月入</span>
                <span>{{ rate(cultivationRate.total) }} 修为</span>
              </div>
            </div>
            <p class="mt-1.5 text-[12px] leading-4 text-muted">
              所入修为约有 {{ percent(cultivationRate.bodyGainMultiplier) }} 沉入筋骨，转为淬体值；体质、路径与法体平衡都会改变这份转化。
            </p>
          </article>

          <article class="rounded-sm border border-line/80 bg-white/25 px-3 py-2.5">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-[14px] font-medium">
                  {{ game.breakthroughInfo.atMax ? '金丹圆满' : `下一境 · ${game.breakthroughInfo.label}` }}
                </p>
                <p class="mt-1 text-[12px] leading-4 text-muted">
                  <template v-if="game.breakthroughInfo.atMax">
                    此世已无更高境界。往后的路要落在洞府、法宝与道侣上。
                  </template>
                  <template v-else>
                    需修为 {{ game.breakthroughInfo.cost }} · 成算
                    {{ Math.round(game.breakthroughInfo.chance * 100) }}% · 气血需过半
                    <template v-if="game.breakthroughInfo.aidActive">
                      · 破境丹药力 +12%
                    </template>
                  </template>
                </p>
              </div>
              <span
                class="shrink-0 rounded-sm border px-1.5 py-0.5 text-[12px]"
                :class="
                  game.breakthroughInfo.affordable && game.breakthroughInfo.healthReady
                    ? 'border-jade/40 text-jade-deep'
                    : 'border-line text-muted'
                "
              >
                {{
                  game.breakthroughInfo.atMax
                    ? '已至绝顶'
                    : game.breakthroughInfo.affordable
                      ? game.breakthroughInfo.healthReady
                        ? '可冲关'
                        : '气血未复'
                      : '修为未足'
                }}
              </span>
            </div>

            <button
              v-if="!game.breakthroughInfo.atMax"
              type="button"
              class="mt-2.5 w-full rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
              :class="
                game.breakthroughInfo.affordable && game.breakthroughInfo.healthReady
                  ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                  : 'cursor-not-allowed border-line text-muted'
              "
              :disabled="!game.breakthroughInfo.affordable || !game.breakthroughInfo.healthReady"
              v-hint="breakthroughHint"
              @click="game.attemptBreakthrough()"
            >
              {{
                game.breakthroughInfo.affordable && game.breakthroughInfo.healthReady
                  ? `冲关 · 耗修为 ${game.breakthroughInfo.cost}`
                  : game.breakthroughInfo.affordable
                    ? '先调息养伤'
                    : `还差 ${Math.ceil(game.breakthroughInfo.cost - game.game.player.cultivation)} 修为`
              }}
            </button>
            <p
              v-if="!game.breakthroughInfo.atMax"
              class="mt-2 text-[12px] leading-4 text-muted"
            >
              失手会散去部分修为并留下「冲关反噬」，三月内气血难复。修为不会凭空回来。
            </p>
          </article>

          <article v-if="game.statusViews.length" class="rounded-sm border border-line/80 bg-paper p-3">
            <p class="text-[13px] font-medium">身上旧事</p>
            <div class="mt-1.5 space-y-1">
              <p
                v-for="status in game.statusViews"
                :key="status.id"
                v-hint="status.description"
                class="cursor-help text-[12px] leading-4 text-muted"
              >
                {{ status.label }} · 尚余 {{ Math.ceil(status.monthsRemaining) }} 月
              </p>
            </div>
          </article>
        </section>
      </template>

      <template v-else-if="cultSub === 'techniques'">
        <section class="space-y-2">
          <article
            v-for="view in learnedTechniques"
            :key="view.definition.id"
            class="rounded-sm border border-line/80 bg-paper px-3 py-2.5"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">
                {{ view.definition.name }}
                <span
                  v-if="view.equipped"
                  class="ml-1 rounded-sm border border-jade/40 px-1 py-0.5 text-[12px] font-normal text-jade-deep"
                >
                  法门位
                </span>
              </p>
              <span class="text-[12px] text-muted">{{ view.progress }} / {{ view.nodes.length }} 重</span>
            </div>
            <p class="mt-1 text-[13px] leading-5 text-muted">{{ view.definition.description }}</p>
            <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line/70">
              <div
                class="h-full rounded-full bg-jade/60"
                :style="{ width: `${(view.progress / Math.max(1, view.nodes.length)) * 100}%` }"
              ></div>
            </div>
            <p
              v-if="view.nodes[view.progress]"
              class="mt-1.5 text-[12px] leading-4 text-muted"
            >
              下一重 · {{ view.nodes[view.progress].name }}：{{ view.nodes[view.progress].description }}
            </p>
            <p v-else class="mt-1.5 text-[12px] leading-4 text-muted">此门已参至尽头。</p>
            <button
              type="button"
              class="mt-2 w-full rounded-sm border border-line px-2 py-1 text-[12px] text-muted transition hover:border-jade/40 hover:text-jade"
              @click="ui.openPanel('arts')"
            >
              去参悟
            </button>
          </article>
          <p v-if="!learnedTechniques.length" class="rounded-sm border border-dashed border-line px-3 py-5 text-center text-[13px] leading-5 text-muted">
            还没有记住任何功法。因缘与宗门处可入门，入门后还要一重重参下去。
          </p>
        </section>
      </template>

      <template v-else>
        <section class="space-y-2">
          <article class="rounded-sm border border-line/80 bg-white/25 px-3 py-2.5">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">根基 · 后天淬炼</p>
              <span class="text-[12px] text-muted">洗髓丹所铸</span>
            </div>
            <div class="mt-1.5 grid grid-cols-2 gap-1 text-[12px] leading-4 text-ink-soft sm:grid-cols-4">
              <span>气血 {{ game.game.player.foundation.health }} / {{ FOUNDATION_CAPS.health }}</span>
              <span>攻势 {{ game.game.player.foundation.attack }} / {{ FOUNDATION_CAPS.attack }}</span>
              <span>护体 {{ game.game.player.foundation.defense }} / {{ FOUNDATION_CAPS.defense }}</span>
              <span>神识 {{ game.game.player.foundation.spirit }} / {{ FOUNDATION_CAPS.spirit }}</span>
            </div>
            <p class="mt-1 text-[12px] leading-4 text-muted">
              根基是服食洗髓丹后留在骨血里的底子，永久计入六维；每一维都有上限，到了尽头便只剩温养。
            </p>
          </article>

          <article v-if="game.rootDefinition" class="rounded-sm border border-line/80 bg-paper px-3 py-2.5">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">灵根 · {{ game.rootDefinition.name }}</p>
              <span class="text-[12px] text-muted">
                {{ rootElementLabel }}属 · 修为 ×{{ rate(game.rootDefinition.cultivationMultiplier) }}
              </span>
            </div>
            <p class="mt-1 text-[13px] leading-5 text-muted">{{ game.rootDefinition.description }}</p>
            <p class="mt-1 text-[12px] leading-4 text-muted">{{ game.rootDefinition.note }}</p>
            <p class="mt-1 text-[12px] leading-4 text-ink-soft">{{ statText(game.rootDefinition.stats) }}</p>
          </article>

          <article v-if="game.originDefinition" class="rounded-sm border border-line/80 bg-white/25 px-3 py-2.5">
            <p class="text-[14px] font-medium">出身 · {{ game.originDefinition.name }}</p>
            <p class="mt-1 text-[13px] leading-5 text-muted">{{ game.originDefinition.description }}</p>
            <p class="mt-1 text-[12px] leading-4 text-muted">{{ game.originDefinition.note }}</p>
            <p class="mt-1 text-[12px] leading-4 text-ink-soft">{{ statText(game.originDefinition.stats) }}</p>
          </article>

          <article
            v-for="talent in game.talentDefinitions"
            :key="talent.id"
            class="rounded-sm border border-line/80 bg-paper px-3 py-2.5"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">天赋 · {{ talent.name }}</p>
              <span
                v-if="talent.cultivationBonus"
                class="text-[12px] text-jade-deep"
              >
                修为 +{{ percent(talent.cultivationBonus) }}
              </span>
            </div>
            <p class="mt-1 text-[13px] leading-5 text-muted">{{ talent.description }}</p>
            <p class="mt-1 text-[12px] leading-4 text-muted">{{ talent.note }}</p>
            <p class="mt-1 text-[12px] leading-4 text-ink-soft">{{ statText(talent.stats) }}</p>
          </article>
          <p v-if="!game.talentDefinitions.length" class="rounded-sm border border-dashed border-line px-3 py-5 text-center text-[13px] leading-5 text-muted">
            尚未显出格外天赋，往后可因奇遇得之。
          </p>
        </section>
      </template>
    </template>

    <template v-else-if="tab === 'bonds'">
      <template v-if="bondSub === 'gear'">
        <section class="space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="slot in game.standardGearSlotViews"
              :key="slot.slot"
              type="button"
              class="rounded-sm border border-line/80 bg-white/25 px-2.5 py-2 text-left transition hover:border-jade/35"
              @click="ui.openPanel('equipment')"
            >
              <p class="text-[12px] tracking-[0.16em] text-muted">{{ slot.label }}</p>
              <p class="mt-0.5 truncate font-serif text-base leading-tight">
                {{ slot.equipped?.gear.name ?? '空位' }}
              </p>
              <p v-if="slot.equipped" class="mt-1 text-[12px] text-muted">
                {{ slot.equipped.qualityName }} · +{{ slot.equipped.gear.upgrade }} ·
                {{ slot.equipped.statsText || '无属性' }}
              </p>
              <p v-else class="mt-1 text-[12px] text-muted">匣中 {{ slot.owned }} 件可换</p>
            </button>
          </div>

          <article v-if="activeSets.length" class="rounded-sm border border-line/80 bg-paper px-3 py-2.5">
            <p class="text-[13px] font-medium">套装器缘</p>
            <div class="mt-1.5 flex flex-wrap gap-1.5">
              <span
                v-for="set in activeSets"
                :key="set.name"
                class="rounded-sm border px-2 py-0.5 text-[12px]"
                :class="
                  set.activeThresholds.length
                    ? 'border-jade/40 text-jade-deep'
                    : 'border-line text-muted'
                "
              >
                {{ set.name }} {{ set.count }} / {{ set.size }}
                <template v-if="set.activeThresholds.length">
                  · {{ set.activeThresholds.join(' / ') }}
                </template>
              </span>
            </div>
          </article>

          <p class="text-[12px] leading-5 text-muted">
            只有着身的器物才计入属性；器匣里的旧器可以替换、淬炼，也可以整批回收。
          </p>
          <button
            type="button"
            class="w-full rounded-sm border border-line px-2 py-1.5 text-[12px] text-muted transition hover:border-jade/40 hover:text-jade"
            @click="ui.openPanel('equipment')"
          >
            打开装备面板
          </button>
        </section>
      </template>

      <template v-else-if="bondSub === 'treasure'">
        <section class="space-y-2">
          <article
            v-if="activeTreasure"
            class="rounded-sm border border-jade/40 bg-jade-soft/50 px-3 py-2.5"
          >
            <p class="text-[12px] tracking-[0.16em] text-jade">悬于身侧</p>
            <p class="mt-0.5 font-serif text-lg leading-tight">{{ activeTreasure.name }}</p>
            <p class="mt-1 text-[12px] text-muted">
              器灵 · {{ activeTreasure.spirit.name }} · 温养 {{ activeTreasure.temperLevel }} / {{ activeTreasure.maxTemper }}
            </p>
            <p class="mt-1 text-[13px] leading-5 text-ink-soft">
              被动 {{ activeTreasure.passiveText || '无属性加成' }}
            </p>
          </article>
          <p v-else class="rounded-sm border border-dashed border-line px-3 py-5 text-center text-[13px] leading-5 text-muted">
            还没有法宝悬在身侧。旧藏多在险地或某人的记忆里。
          </p>

          <article
            v-for="treasure in game.treasureViews.filter((entry) => !entry.isActive)"
            :key="treasure.id"
            class="rounded-sm border border-line/80 bg-white/25 px-3 py-2.5"
          >
            <p class="text-[14px] font-medium">{{ treasure.name }}</p>
            <p class="mt-1 text-[12px] leading-4 text-muted">
              收在匣中 · 温养 {{ treasure.temperLevel }} / {{ treasure.maxTemper }} ·
              被动 {{ treasure.passiveText || '无' }}
            </p>
          </article>

          <button
            type="button"
            class="w-full rounded-sm border border-line px-2 py-1.5 text-[12px] text-muted transition hover:border-jade/40 hover:text-jade"
            @click="ui.openPanel('treasure')"
          >
            打开法宝面板
          </button>
        </section>
      </template>

      <template v-else>
        <section class="space-y-2">
          <article
            v-if="activeMount"
            class="rounded-sm border border-jade/40 bg-jade-soft/40 px-3 py-2.5"
          >
            <p class="text-[12px] tracking-[0.16em] text-jade">随行坐骑</p>
            <p class="mt-0.5 font-serif text-lg leading-tight">{{ activeMount.name }}</p>
            <p class="mt-1 text-[12px] text-muted">
              {{ activeMount.currentStage?.name ?? '初形' }}（{{ activeMount.stage }} / {{ activeMount.maxStage }}）
              · 行旅 +{{ rate(activeMount.currentStage?.travelBonus ?? 0) }} / 月
            </p>
            <p class="mt-1 text-[13px] leading-5 text-ink-soft">{{ activeMount.statsText || '无属性加成' }}</p>
          </article>
          <p v-else class="rounded-sm border border-dashed border-line px-3 py-4 text-center text-[13px] text-muted">
            没有坐骑随行。行旅仍照旧，只是少一段脚力。
          </p>

          <article
            v-if="activePet"
            class="rounded-sm border border-jade/40 bg-jade-soft/40 px-3 py-2.5"
          >
            <p class="text-[12px] tracking-[0.16em] text-jade">随身灵宠</p>
            <p class="mt-0.5 font-serif text-lg leading-tight">{{ activePet.name }}</p>
            <p class="mt-1 text-[12px] text-muted">
              {{ activePet.currentEvolution?.name ?? '初生' }}（{{ activePet.evolution }} / {{ activePet.maxEvolution }}）
              · 性情 {{ activePet.temperament }}
            </p>
            <p class="mt-1 text-[13px] leading-5 text-ink-soft">{{ activePet.statsText || '无属性加成' }}</p>
          </article>
          <p v-else class="rounded-sm border border-dashed border-line px-3 py-4 text-center text-[13px] text-muted">
            没有灵宠带在身边。它们会记住你怎么待它。
          </p>

          <div class="grid grid-cols-2 gap-2">
            <div class="rounded-sm border border-line/80 bg-paper px-3 py-2">
              <p class="text-[12px] text-muted">已得坐骑</p>
              <p class="mt-0.5 text-[14px]">{{ game.mountViews.length }} 头</p>
            </div>
            <div class="rounded-sm border border-line/80 bg-paper px-3 py-2">
              <p class="text-[12px] text-muted">已得灵宠</p>
              <p class="mt-0.5 text-[14px]">{{ game.petViews.length }} 只</p>
            </div>
          </div>

          <button
            type="button"
            class="w-full rounded-sm border border-line px-2 py-1.5 text-[12px] text-muted transition hover:border-jade/40 hover:text-jade"
            @click="ui.openPanel('beast')"
          >
            打开坐骑与灵宠面板
          </button>
        </section>
      </template>
    </template>

    <template v-else-if="tab === 'wealth'">
      <template v-if="wealthSub === 'resources'">
        <section class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div
            v-for="resource in game.resourceChips"
            :key="resource.key"
            class="rounded-sm border border-line/80 bg-paper px-3 py-2"
          >
            <p class="text-[13px] text-muted">{{ resource.label }}</p>
            <p class="mt-0.5 font-serif text-lg leading-none">{{ resource.value }}</p>
          </div>
        </section>

        <section class="rounded-sm border border-line/80 bg-white/25 px-3 py-2.5">
          <p class="text-[13px] tracking-[0.18em] text-muted">每月所入</p>
          <div class="mt-1.5 space-y-1 text-[13px] leading-5">
            <div class="flex justify-between gap-2">
              <span class="text-muted">修为</span>
              <span>{{ rate(cultivationRate.total) }} / 月</span>
            </div>
            <div
              v-for="resource in game.caveProductionView.resources"
              :key="resource.key"
              class="flex justify-between gap-2"
            >
              <span class="text-muted">{{ resource.label }}</span>
              <span>{{ resource.value }} / 月</span>
            </div>
            <div class="flex justify-between gap-2">
              <span class="text-muted">行旅</span>
              <span>{{ game.idleRates.travelProgressPerMonth.toFixed(2) }} / 月</span>
            </div>
          </div>
          <p class="mt-1.5 text-[12px] leading-4 text-muted">
            {{ game.cave ? `洞府产出受灵脉澄澈影响，当前系数 ×${game.caveProductionView.purityFactor}。` : '洞府未寻，洞府产出尚未计入。' }}
          </p>
        </section>
      </template>

      <template v-else-if="wealthSub === 'inventory'">
        <section class="space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="rounded-sm border border-line/80 bg-paper px-3 py-2 text-left transition hover:border-jade/35"
              @click="ui.openPanel('inventory')"
            >
              <p class="text-[12px] text-muted">行囊杂物</p>
              <p class="mt-0.5 text-[14px]">{{ game.inventoryViews.length }} 件</p>
            </button>
            <button
              type="button"
              class="rounded-sm border border-line/80 bg-paper px-3 py-2 text-left transition hover:border-jade/35"
              @click="ui.openPanel('equipment')"
            >
              <p class="text-[12px] text-muted">常规装备</p>
              <p class="mt-0.5 text-[14px]">{{ game.gearViews.length }} 件</p>
            </button>
          </div>

          <article
            v-for="group in inventoryItemGroups"
            :key="group.label"
            class="rounded-sm border border-line/80 bg-white/25 px-3 py-2.5"
          >
            <div class="flex items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">{{ group.label }}</p>
              <span class="text-[12px] text-muted">共 {{ group.count }} 件</span>
            </div>
            <p class="mt-1 text-[12px] leading-4 text-muted">
              {{ group.names.join('、') }}{{ group.count > group.names.length ? '……' : '' }}
            </p>
          </article>
          <p v-if="!inventoryItemGroups.length" class="rounded-sm border border-dashed border-line px-3 py-5 text-center text-[13px] text-muted">
            行囊里还没有杂物。
          </p>
        </section>
      </template>

      <template v-else>
        <section class="space-y-2">
          <article v-if="game.trainingView" class="rounded-sm border border-jade/35 bg-jade-soft/40 px-3 py-2.5">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">{{ game.trainingView.modeName }} · {{ game.trainingView.regionName }}</p>
              <span class="text-[12px] text-muted">还余 {{ game.trainingView.remainingMonths }} 月</span>
            </div>
            <p class="mt-1 text-[12px] leading-4 text-muted">
              战 {{ game.trainingView.battles }} 场 · 余 {{ game.trainingView.battlesLeft }} 场 ·
              进度 {{ Math.round(game.trainingView.progress * 100) }}%
            </p>
            <p v-if="game.trainingView.bestGearName" class="mt-1 text-[12px] leading-4 text-ink-soft">
              最好的一件：{{ game.trainingView.bestGearName }}
            </p>
            <button
              type="button"
              class="mt-2 w-full rounded-sm border border-line px-2 py-1 text-[12px] text-muted transition hover:border-jade/40 hover:text-jade"
              @click="ui.openPanel('training')"
            >
              打开历练
            </button>
          </article>
          <p v-else class="rounded-sm border border-dashed border-line px-3 py-4 text-center text-[13px] text-muted">
            此刻没有在路上的历练。
          </p>

          <article
            v-for="report in trainingReports"
            :key="report.id"
            class="rounded-sm border border-line/80 bg-paper px-3 py-2.5"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[13px] font-medium">{{ report.modeName }}</p>
              <span class="text-[12px] text-muted">{{ monthLabel(report.endedMonths) }}</span>
            </div>
            <p class="mt-1 text-[12px] leading-4 text-muted">{{ report.summary }}</p>
          </article>
          <p v-if="!trainingReports.length" class="text-[12px] leading-4 text-muted">
            还没有历练旧报。外出走一程，会留下属于你的路数。
          </p>
        </section>
      </template>
    </template>

    <template v-else-if="tab === 'lawbody'">
      <template v-if="lawBodySub === 'physique'">
        <section
          v-hint="physiqueHint()"
          class="cursor-help rounded-sm border border-jade/30 bg-jade-soft/40 p-3"
        >
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <p class="font-serif text-lg">{{ body.physique?.name ?? '凡胎' }}</p>
            <span class="text-[12px] text-jade-deep">先天体质 · 不可改换</span>
          </div>
          <p class="mt-1 text-[13px] leading-5 text-ink-soft">
            {{ body.physique?.description ?? '一具尚未显出格外之处的身体。' }}
          </p>
          <div class="mt-2 grid grid-cols-3 gap-1.5 text-[12px]">
            <span class="rounded-sm border border-line bg-white/30 px-2 py-1 text-center">
              修行 ×{{ (body.physique?.cultivationMultiplier ?? 1).toFixed(2) }}
            </span>
            <span class="rounded-sm border border-line bg-white/30 px-2 py-1 text-center">
              淬体 ×{{ (body.physique?.bodyTemperMultiplier ?? 1).toFixed(2) }}
            </span>
            <span class="rounded-sm border border-line bg-white/30 px-2 py-1 text-center">
              破体 {{ (body.physique?.bodyBreakthroughBonus ?? 0) >= 0 ? '+' : '' }}{{ Math.round((body.physique?.bodyBreakthroughBonus ?? 0) * 100) }}%
            </span>
          </div>
          <p class="mt-2 text-[12px] leading-4 text-muted">
            {{ body.physique?.note ?? '先淬皮，再谈别的。' }}
          </p>
          <div
            v-if="physiqueAffinities.length"
            v-hint="affinityHint()"
            class="mt-2 flex cursor-help flex-wrap gap-1"
          >
            <span
              v-for="entry in physiqueAffinities"
              :key="entry.id"
              class="rounded-sm border border-jade/25 px-1.5 py-0.5 text-[12px] text-jade-deep"
            >
              {{ entry.name }} 亲和 +{{ Math.round(entry.affinity * 100) }}%
            </span>
          </div>
          <p v-else class="mt-2 text-[12px] leading-4 text-muted">
            这具体质没有格外亲和的旧血，承载任意血脉都只能靠后天炼化。
          </p>
        </section>

        <section class="space-y-2">
          <div class="flex items-baseline justify-between gap-2">
            <p class="text-[13px] tracking-[0.18em] text-jade">体质觉醒</p>
            <span class="text-[12px] text-muted">随体魄阶段自行显化</span>
          </div>
          <article
            v-for="awakening in body.physiqueAwakenings"
            :key="awakening.stage"
            class="rounded-sm border px-3 py-2.5"
            :class="
              awakening.unlocked
                ? 'border-jade/35 bg-jade-soft/30'
                : 'border-line/80 bg-paper opacity-70'
            "
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">
                {{ awakening.name }}
                <span class="ml-1 text-[12px] font-normal text-muted">
                  {{ bodyStageName(awakening.stage) }}阶
                </span>
              </p>
              <span
                class="rounded-sm border px-1.5 py-0.5 text-[12px]"
                :class="
                  awakening.unlocked
                    ? 'border-jade/35 text-jade-deep'
                    : 'border-line text-muted'
                "
              >
                {{ awakening.unlocked ? '已显' : '未显' }}
              </span>
            </div>
            <p class="mt-1 text-[12px] leading-4 text-muted">{{ awakening.description }}</p>
            <p
              v-if="awakening.unlocked"
              class="mt-1 text-[12px] leading-4 text-ink-soft"
            >
              {{ statText(awakening.stats) }}<template v-if="modsText(awakening.mods)"> · {{ modsText(awakening.mods) }}</template>
            </p>
          </article>
          <p
            v-if="!body.physiqueAwakenings.length"
            class="rounded-sm border border-dashed border-line px-3 py-5 text-center text-[13px] leading-5 text-muted"
          >
            这具体质没有额外觉醒。它给的是底子，往后的路全靠淬炼与血脉。
          </p>
        </section>
      </template>

      <template v-else-if="lawBodySub === 'bloodline'">
        <template v-if="body.bloodline.active">
          <section class="rounded-sm border border-jade/30 bg-jade-soft/40 p-3">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p class="font-serif text-lg">{{ body.bloodline.definition?.name }}</p>
                <p class="mt-0.5 text-[12px] text-jade-deep">
                  {{ body.bloodline.stageName }} · {{ body.bloodline.stage }} / 5 阶
                </p>
              </div>
              <span class="rounded-sm border border-jade/35 px-2 py-0.5 text-[12px] text-jade-deep">
                {{ body.bloodline.skillUnlocked ? '血脉招式已醒' : '血脉招式未醒' }}
              </span>
            </div>
            <div class="mt-2 flex items-center justify-between text-[12px]">
              <span class="text-muted">纯度</span>
              <span class="tabular-nums text-ink-soft">{{ body.bloodline.purity }} / 100</span>
            </div>
            <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-line/70">
              <div
                class="h-full rounded-full bg-jade/60 transition-[width] duration-500"
                :style="{ width: `${body.bloodline.purity}%` }"
              ></div>
            </div>
            <p class="mt-2 text-[13px] leading-5 text-ink-soft">
              {{ body.bloodline.stageDescription }}
            </p>
            <p class="mt-1 text-[12px] leading-4 text-muted">
              {{ body.bloodline.definition?.description }}
            </p>
            <div class="mt-2 flex flex-wrap gap-1 text-[12px] text-ink-soft">
              <span class="rounded-sm border border-line px-1.5 py-0.5">
                {{ statText(body.bloodline.stats) }}
              </span>
              <span
                v-if="modsText(body.bloodline.mods)"
                class="rounded-sm border border-line px-1.5 py-0.5"
              >
                {{ modsText(body.bloodline.mods) }}
              </span>
            </div>
          </section>

          <section class="rounded-sm border border-line/80 bg-paper px-3 py-2.5">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">血脉招式</p>
              <span class="text-[12px] text-muted">
                {{ body.bloodline.skillUnlocked ? '已计入战斗' : '二阶解锁' }}
              </span>
            </div>
            <template v-if="body.bloodline.skill">
              <p class="mt-1 text-[13px] leading-5 text-ink-soft">
                {{ body.bloodline.skill.name }}：{{ body.bloodline.skill.description }}
              </p>
              <p class="mt-1 text-[12px] text-muted">
                倍率 ×{{ body.bloodline.skill.multiplier }} · 冷却 {{ body.bloodline.skill.cooldown }} 回合
              </p>
            </template>
            <p v-else class="mt-1 text-[12px] leading-4 text-muted">
              血脉尚未凝脉。炼到二阶后，会在战斗中多出一式主动招式。
            </p>
          </section>

          <section class="space-y-2">
            <article class="rounded-sm border border-line/80 bg-paper px-3 py-2.5">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <p class="text-[14px] font-medium">
                  {{ body.bloodline.stage === 0 ? '唤醒旧血' : '炼血' }}
                </p>
                <span class="text-[12px] text-muted">
                  <template v-if="body.bloodline.nextStage">
                    下一阶 {{ body.bloodline.nextStage.name }} · 需纯度
                    {{ body.bloodline.nextStage.purity }} · 体魄
                    {{ bodyStageName(body.bloodline.nextStage.bodyStage) }}
                  </template>
                  <template v-else>已至祖血</template>
                </span>
              </div>
              <p class="mt-1 text-[12px] leading-4 text-muted">
                唤醒成算 {{ Math.round(body.bloodline.awakenChance * 100) }}% ·
                血脉进阶同时受纯度与体魄阶段限制。
              </p>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <button
                  v-if="body.bloodline.stage === 0"
                  type="button"
                  class="rounded-sm border px-2.5 py-1 text-[12px] transition"
                  :class="
                    body.bloodline.canAwaken
                      ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                      : 'cursor-not-allowed border-line text-muted'
                  "
                  :disabled="!body.bloodline.canAwaken"
                  v-hint="awakenHint()"
                  @click="awakenBloodline()"
                >
                  唤醒旧血 · 成算 {{ Math.round(body.bloodline.awakenChance * 100) }}%
                </button>
                <button
                  v-if="body.bloodline.refine"
                  type="button"
                  class="rounded-sm border px-2.5 py-1 text-[12px] transition"
                  :class="
                    body.bloodline.refine.canRefine
                      ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                      : 'cursor-not-allowed border-line text-muted'
                  "
                  :disabled="!body.bloodline.refine.canRefine"
                  v-hint="refineHint()"
                  @click="refineBloodline()"
                >
                  炼血 · 纯度 +{{ body.bloodline.refine.purityGain }}
                </button>
              </div>
              <p
                v-if="body.bloodline.refine"
                class="mt-1.5 text-[12px] leading-4 text-muted"
              >
                耗 {{ actionCostText(body.bloodline.refine.cost) }}
              </p>
            </article>

            <article class="rounded-sm border border-cinnabar/25 bg-cinnabar/[0.03] px-3 py-2.5">
              <div class="flex items-center justify-between gap-2">
                <p class="text-[13px] font-medium text-cinnabar">断血</p>
                <button
                  type="button"
                  class="rounded-sm border border-cinnabar/30 px-2 py-1 text-[12px] text-cinnabar transition hover:bg-cinnabar/10"
                  v-hint="severHint()"
                  :disabled="!body.bloodline.severCost.enough"
                  @click="severBloodline()"
                >
                  断去此血 · 耗 {{ actionCostText(body.bloodline.severCost) }}
                </button>
              </div>
              <p class="mt-1 text-[12px] leading-4 text-muted">
                断血后永久失去这条血脉与已有纯度，并留下一段破体旧伤。换血之前没有回头路。
              </p>
            </article>
          </section>
        </template>

        <template v-else>
          <section class="rounded-sm border border-line/80 bg-paper px-3 py-2.5">
            <p class="text-[14px] font-medium">旧血未承</p>
            <p class="mt-1 text-[13px] leading-5 text-muted">
              {{ body.bloodline.stageDescription }}
            </p>
            <p class="mt-1 text-[12px] leading-4 text-muted">
              同一时间只能承载一条血脉。承载后先得纯度，再唤醒；之后以炼血提纯、以体魄破阶。
            </p>
          </section>

          <section class="space-y-2">
            <article
              v-for="option in body.bloodline.options"
              :key="option.definition.id"
              class="rounded-sm border px-3 py-2.5"
              :class="
                option.canAcquire
                  ? 'border-line/80 bg-paper'
                  : 'border-line/60 bg-white/15'
              "
              v-hint="bloodlineOptionHint(option)"
            >
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <p class="text-[14px] font-medium">{{ option.definition.name }}</p>
                <span
                  class="rounded-sm border px-1.5 py-0.5 text-[12px]"
                  :class="
                    option.bodyGateMet
                      ? 'border-jade/30 text-jade-deep'
                      : 'border-line text-muted'
                  "
                >
                  体魄 {{ bodyStageName(option.definition.acquisition.bodyStage) }} ·
                  亲和 +{{ Math.round(option.affinity * 100) }}%
                </span>
              </div>
              <p class="mt-1 text-[12px] leading-4 text-muted">
                {{ option.definition.note }}
              </p>
              <p class="mt-1 text-[12px] leading-4 text-ink-soft">
                承载纯度 {{ option.initialPurity }} · {{ option.definition.acquisition.hint }}
              </p>
              <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span class="text-[12px] text-muted">
                  耗 {{ actionCostText(option.cost) }}
                </span>
                <button
                  type="button"
                  class="rounded-sm border px-2.5 py-1 text-[12px] transition"
                  :class="
                    option.canAcquire
                      ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                      : 'cursor-not-allowed border-line text-muted'
                  "
                  :disabled="!option.canAcquire"
                  @click="acquireBloodline(option.definition.id)"
                >
                  承血
                </button>
              </div>
              <p
                v-if="option.blockedReason"
                class="mt-1 text-[12px] leading-4 text-muted"
              >
                {{ option.blockedReason }}
              </p>
            </article>
          </section>
        </template>
      </template>

      <template v-else>
        <section class="rounded-sm border border-line/80 bg-paper p-3">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p class="font-serif text-lg">{{ body.stage.name }}</p>
              <p class="mt-0.5 text-[12px] text-muted">
                {{ body.path.name }} · {{ body.balance.label }}
              </p>
            </div>
            <span class="text-[12px] text-muted">
              淬炼值 {{ Math.floor(body.temper) }}
              <template v-if="!body.stageProgress.atMax">
                / {{ body.stageProgress.threshold }}
              </template>
            </span>
          </div>
          <p class="mt-1 text-[13px] leading-5 text-ink-soft">
            {{ body.stage.description }}
          </p>
          <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-line/70">
            <div
              class="h-full rounded-full bg-jade/60 transition-[width] duration-500"
              :style="{ width: `${body.stageProgress.progress * 100}%` }"
            ></div>
          </div>
          <p class="mt-1 text-[12px] text-muted">
            <template v-if="body.stageProgress.atMax">
              已至不漏，此世体魄再无可淬之处。
            </template>
            <template v-else>
              下一阶 {{ body.stageProgress.next?.name }} · 还需淬体值
              {{ Math.max(0, Math.ceil(body.stageProgress.threshold - body.temper)) }}
            </template>
          </p>
          <p class="mt-1 text-[12px] leading-4 text-ink-soft">
            {{ statText(body.stage.stats) }}
          </p>
        </section>

        <section
          v-hint="body.balance.hint"
          class="cursor-help rounded-sm border border-jade/25 bg-jade-soft/30 px-3 py-2.5"
        >
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <p class="text-[14px] font-medium">法体 · {{ body.balance.label }}</p>
            <span class="text-[12px] text-jade-deep">法阶 {{ body.balance.lawRank }} · 体阶 {{ body.balance.bodyRank }}</span>
          </div>
          <p class="mt-1 text-[12px] leading-4 text-muted">{{ body.balance.hint }}</p>
          <div class="mt-1.5 flex flex-wrap gap-1 text-[12px]">
            <span class="rounded-sm border border-line px-1.5 py-0.5">
              修行 ×{{ body.balance.cultivationMultiplier.toFixed(2) }}
            </span>
            <span class="rounded-sm border border-line px-1.5 py-0.5">
              淬体 ×{{ body.balance.bodyGainMultiplier.toFixed(2) }}
            </span>
            <span class="rounded-sm border border-line px-1.5 py-0.5">
              破体 {{ body.balance.bodyBreakthroughBonus >= 0 ? '+' : '' }}{{ Math.round(body.balance.bodyBreakthroughBonus * 100) }}%
            </span>
            <span class="rounded-sm border border-line px-1.5 py-0.5">
              冲关 {{ body.balance.lawBreakthroughBonus >= 0 ? '+' : '' }}{{ Math.round(body.balance.lawBreakthroughBonus * 100) }}%
            </span>
          </div>
        </section>

        <section class="space-y-2">
          <div class="flex items-baseline justify-between gap-2">
            <p class="text-[13px] tracking-[0.18em] text-jade">修行路径</p>
            <span class="text-[12px] text-muted">改路需静养六月</span>
          </div>
          <div class="grid gap-1.5 sm:grid-cols-3">
            <button
              v-for="path in body.paths"
              :key="path.id"
              type="button"
              class="rounded-sm border px-2.5 py-2 text-left transition"
              :class="
                path.active
                  ? 'border-jade/45 bg-jade-soft'
                  : path.canSelect
                    ? 'border-line/80 bg-white/20 hover:border-jade/40'
                    : 'cursor-not-allowed border-line/60 bg-white/10 opacity-60'
              "
              :disabled="!path.canSelect"
              v-hint="pathHint(path)"
              @click="selectBodyPath(path.id)"
            >
              <p class="text-[13px] font-medium">{{ path.name }}</p>
              <p class="mt-0.5 text-[12px] text-muted">{{ path.tagline }}</p>
              <p class="mt-1 text-[12px] text-ink-soft">
                修行 ×{{ path.lawMultiplier.toFixed(2) }} · 淬体 {{ Math.round(path.bodyRatio * 100) }}%
              </p>
            </button>
          </div>
        </section>

        <section class="grid gap-2 sm:grid-cols-2">
          <article class="rounded-sm border border-line/80 bg-paper px-3 py-2.5">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">闭关淬体</p>
              <span class="text-[12px] text-muted">
                {{ body.manualTemper.readyAtMonths > 0 ? `余 ${body.manualTemper.readyAtMonths} 月` : '可淬' }}
              </span>
            </div>
            <p class="mt-1 text-[12px] leading-4 text-muted">
              耗 {{ actionCostText(body.manualTemper.cost) }}
            </p>
            <p class="mt-1 text-[12px] leading-4 text-ink-soft">
              淬体值 +{{ Math.round(body.manualTemper.gain) }} · 额外烧去少量气血
            </p>
            <button
              type="button"
              class="mt-2 w-full rounded-sm border px-2.5 py-1 text-[12px] transition"
              :class="
                body.manualTemper.canTemper
                  ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                  : 'cursor-not-allowed border-line text-muted'
              "
              :disabled="!body.manualTemper.canTemper"
              v-hint="manualTemperHint()"
              @click="temperBody()"
            >
              淬体一轮
            </button>
            <p
              v-if="body.manualTemper.blockedReason"
              class="mt-1 text-[12px] leading-4 text-muted"
            >
              {{ body.manualTemper.blockedReason }}
            </p>
          </article>

          <article class="rounded-sm border border-line/80 bg-paper px-3 py-2.5">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">破体入阶</p>
              <span class="text-[12px] text-muted">
                {{ body.stageProgress.atMax ? '已至不漏' : `成算 ${Math.round(body.breakthrough.chance * 100)}%` }}
              </span>
            </div>
            <p class="mt-1 text-[12px] leading-4 text-muted">
              目标 {{ body.breakthrough.targetName }} · 气血
              {{ Math.round(body.healthRatio * 100) }}%
            </p>
            <p class="mt-1 text-[12px] leading-4 text-ink-soft">
              破体失败会散去三成五淬体值，并留下破体旧伤。
            </p>
            <button
              type="button"
              class="mt-2 w-full rounded-sm border px-2.5 py-1 text-[12px] transition"
              :class="
                body.breakthrough.ready
                  ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                  : 'cursor-not-allowed border-line text-muted'
              "
              :disabled="!body.breakthrough.ready"
              v-hint="bodyBreakthroughHint()"
              @click="attemptBodyBreakthrough()"
            >
              冲击 {{ body.breakthrough.targetName }} · 成算
              {{ Math.round(body.breakthrough.chance * 100) }}%
            </button>
            <p
              v-if="body.breakthrough.blockedReason"
              class="mt-1 text-[12px] leading-4 text-muted"
            >
              {{ body.breakthrough.blockedReason }}
            </p>
          </article>
        </section>

        <section class="space-y-1.5">
          <p class="text-[13px] tracking-[0.18em] text-jade">体魄六阶</p>
          <article
            v-for="stage in bodyStageLadder"
            :key="stage.stage"
            class="flex flex-wrap items-baseline justify-between gap-2 rounded-sm border px-2.5 py-1.5 text-[12px]"
            :class="
              stage.stage === body.stage.stage
                ? 'border-jade/40 bg-jade-soft/40 text-jade-deep'
                : stage.stage < body.stage.stage
                  ? 'border-line/70 bg-white/20 text-ink-soft'
                  : 'border-line/60 bg-white/10 text-muted'
            "
          >
            <span>{{ stage.stage }} · {{ stage.name }}</span>
            <span>淬炼 {{ stage.threshold }} · 法阶 {{ stage.lawRank }}</span>
          </article>
          <p class="text-[12px] leading-4 text-muted">
            体魄每阶都会计入六维；法阶与体阶相差不超过一阶时，修行与破境都会更顺。
          </p>
        </section>
      </template>
    </template>
  </div>
</template>