<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { calendarFromMonths } from '@/core/time'
import { PROFESSION_RANKS } from '@/core/professions'
import type { CraftDiscipline, DiscipleAssignment } from '@/types/common'
import type { CaveLogKind } from '@/types/state'
import { useGameStore } from '@/stores/game'
import { useUiStore } from '@/stores/ui'
import { describeEffects, describeRequirements, resourceLabel } from '../labels'
import { PANEL_TOOLBAR_KEY } from '../components/ui/modal-toolbar'
import TabBar from '../components/ui/TabBar.vue'

type CaveTab = 'overview' | 'buildings' | 'disciples' | 'vein' | 'craft' | 'log'
type BuildingFilter = 'all' | 'production' | 'cultivation' | 'support'
type LogFilter = 'all' | CaveLogKind

const game = useGameStore()
const ui = useUiStore()
const tab = ref<CaveTab>('overview')
const buildingFilter = ref<BuildingFilter>('all')
const discipleRole = ref<'all' | DiscipleAssignment>('all')
const craftSub = ref<CraftDiscipline>('alchemy')
const logFilter = ref<LogFilter>('all')
const toolbarTarget = inject(PANEL_TOOLBAR_KEY, '')

type BuildingView = (typeof game.buildingViews)[number]
type DiscipleView = (typeof game.caveDiscipleViews)[number]
type AssignmentOption = DiscipleView['assignmentOptions'][number]
type VisitorChoice = NonNullable<typeof game.caveVisitorView>['choices'][number]
type ChainView = (typeof game.caveChainViews)[number]
type ProfessionView = (typeof game.professionViews)[number]
type RecipeView = ProfessionView['recipes'][number]

const ASSIGNMENT_LABELS: Record<DiscipleAssignment, string> = {
  study: '研读',
  gather: '采集',
  guard: '守夜',
  craft: '炼作',
  tend: '养脉',
}

const BUILDING_CATEGORY: Record<string, BuildingFilter> = {
  'building.longhan.tide_array': 'production',
  'building.longhan.tide_loft': 'support',
  'building.longhan.herb_garden': 'production',
  'building.longhan.alchemy': 'cultivation',
  'building.longhan.forge': 'production',
  'building.longhan.meditation': 'cultivation',
  'building.longhan.beast_pen': 'production',
  'building.longhan.storehouse': 'support',
}

const BUILDING_CATEGORY_LABELS: Record<BuildingFilter, string> = {
  all: '全部',
  production: '生产',
  cultivation: '修行',
  support: '经营',
}

const LOG_KIND_LABELS: Record<CaveLogKind, string> = {
  build: '营建',
  vein: '灵脉',
  disciple: '道童',
  care: '照料',
  visitor: '来客',
  raid: '来袭',
  production: '运转',
}

const CHAIN_STATUS_LABELS: Record<ChainView['status'], string> = {
  running: '运转中',
  no_tide: '潮息不足',
  no_inputs: '缺料',
  no_purity: '灵脉太浊',
  off: '停炉',
  unlinked: '未成链',
}

const CHAIN_STATUS_CLASSES: Record<ChainView['status'], string> = {
  running: 'border-jade/40 text-jade-deep',
  no_tide: 'border-gold/45 text-gold-deep',
  no_inputs: 'border-cinnabar/40 text-cinnabar',
  no_purity: 'border-cinnabar/40 text-cinnabar',
  off: 'border-line text-muted',
  unlinked: 'border-dashed border-line text-muted',
}

const builtCount = computed(
  () => game.buildingViews.filter((building) => building.level > 0).length,
)

const recruitedCount = computed(
  () => game.caveDiscipleViews.filter((disciple) => disciple.recruited).length,
)

const tabs = computed<
  Array<{ id: CaveTab; label: string; count: string }>
>(() => [
  { id: 'overview', label: '总览', count: '' },
  {
    id: 'buildings',
    label: '建筑',
    count: `${builtCount.value}/${game.buildingViews.length}`,
  },
  {
    id: 'disciples',
    label: '道童',
    count: `${recruitedCount.value}/${game.caveDiscipleViews.length}`,
  },
  {
    id: 'vein',
    label: '灵脉',
    count: `${game.caveVeinView?.current?.level ?? 0}阶`,
  },
  {
    id: 'craft',
    label: '生计',
    count: `${game.professionViews.reduce((sum, view) => sum + view.recipes.length, 0)} 方`,
  },
  { id: 'log', label: '事迹', count: `${game.caveLogViews.length}` },
])

const craftSubTabs = computed(() =>
  game.professionViews.map((view) => ({
    id: view.discipline,
    label: view.label,
    count: view.recipes.length,
  })),
)

const activeProfession = computed(
  () =>
    game.professionViews.find((view) => view.discipline === craftSub.value) ??
    game.professionViews[0],
)

const professionProgressPercent = computed(() => {
  const view = activeProfession.value
  if (!view) return 0
  if (!view.nextRankAt) return 100
  const currentAt = PROFESSION_RANKS[view.rank]?.at ?? 0
  const span = Math.max(1, view.nextRankAt - currentAt)
  return Math.max(0, Math.min(100, Math.round(((view.proficiency - currentAt) / span) * 100)))
})

const buildingFilterTabs = computed<
  Array<{ id: BuildingFilter; label: string; count: number }>
>(() => {
  const categories: BuildingFilter[] = ['all', 'production', 'cultivation', 'support']
  return categories.map((id) => ({
    id,
    label: BUILDING_CATEGORY_LABELS[id],
    count:
      id === 'all'
        ? game.buildingViews.length
        : game.buildingViews.filter(
            (building) => BUILDING_CATEGORY[building.id] === id,
          ).length,
  }))
})

const filteredBuildings = computed(() =>
  game.buildingViews.filter(
    (building) =>
      buildingFilter.value === 'all' ||
      BUILDING_CATEGORY[building.id] === buildingFilter.value,
  ),
)

const discipleRoleTabs = computed<
  Array<{ id: 'all' | DiscipleAssignment; label: string; count: number }>
>(() => {
  const roles: Array<'all' | DiscipleAssignment> = [
    'all',
    'study',
    'gather',
    'guard',
    'craft',
    'tend',
  ]
  return roles.map((id) => ({
    id,
    label: id === 'all' ? '全部' : ASSIGNMENT_LABELS[id],
    count:
      id === 'all'
        ? game.caveDiscipleViews.length
        : game.caveDiscipleViews.filter((disciple) => disciple.assignment === id)
            .length,
  }))
})

const filteredDisciples = computed(() =>
  [...game.caveDiscipleViews]
    .filter(
      (disciple) =>
        discipleRole.value === 'all' ||
        disciple.assignment === discipleRole.value,
    )
    .sort((left, right) => Number(right.recruited) - Number(left.recruited)),
)

const logFilterTabs = computed<
  Array<{ id: LogFilter; label: string; count: number }>
>(() => {
  const kinds: LogFilter[] = [
    'all',
    'build',
    'vein',
    'disciple',
    'care',
    'visitor',
    'raid',
    'production',
  ]
  return kinds.map((id) => ({
    id,
    label: id === 'all' ? '全部' : LOG_KIND_LABELS[id],
    count:
      id === 'all'
        ? game.caveLogViews.length
        : game.caveLogViews.filter((entry) => entry.kind === id).length,
  }))
})

const filteredLog = computed(() =>
  game.caveLogViews.filter(
    (entry) => logFilter.value === 'all' || entry.kind === logFilter.value,
  ),
)

const recentLog = computed(() => game.caveLogViews.slice(0, 4))

const purityPercent = computed(
  () => `${Math.max(0, Math.min(100, game.caveProductionView.purity))}%`,
)

const buildingNameById = computed<Record<string, string>>(() =>
  Object.fromEntries(game.buildingViews.map((building) => [building.id, building.name])),
)

function chainBuildingText(chain: ChainView): string {
  return chain.definition.buildingIds
    .map((id, index) => {
      const name = buildingNameById.value[id] ?? '旧址'
      const level = chain.buildingLevels[index] ?? 0
      return `${name}${level > 0 ? `${level}阶` : '未建'}`
    })
    .join(' + ')
}

function chainProgressPercent(chain: ChainView): string {
  return `${Math.max(0, Math.min(100, Math.round((chain.progress / chain.intervalMonths) * 100)))}%`
}

function chainPurityText(chain: ChainView): string {
  const value = chain.definition.purityPerMonth
  return `澄澈 ${value > 0 ? '+' : ''}${rate(value)}/月`
}

function chainStatusNote(chain: ChainView): string {
  if (chain.status === 'unlinked') {
    const missing = chain.definition.buildingIds
      .filter((_, index) => (chain.buildingLevels[index] ?? 0) < 1)
      .map((id) => buildingNameById.value[id] ?? '另一栋旧筑')
    return `先建起${missing.join('、')}，这条链才会自己转。`
  }
  if (chain.status === 'off') return '已停炉，进度留着，随时可以再开。'
  if (chain.status === 'no_tide') return '潮息不够。同池的链按序先取，想让它转，就得停一条，或把潮库、聚潮阵抬上去。'
  if (chain.status === 'no_inputs') return `料接不上，还缺 ${chain.missingText || '材料'}。`
  if (chain.status === 'no_purity') {
    return `灵脉太浊，蚀脉的链先停了。澄澈低于 ${game.caveDaoView.purityFloor} 时，耗脉的活计会自己封炉；去灵脉处疏一次，或走「潮脉」道途把澄澈养回来。`
  }
  return `再推 ${chain.remainingMonths} 月可成一炉。`
}

function chainTagsFor(buildingId: string): ChainView[] {
  return game.caveChainViews.filter((chain) =>
    chain.definition.buildingIds.includes(buildingId),
  )
}

function chainHint(chain: ChainView): string {
  const pair = chainBuildingText(chain)
  const assignments = chain.definition.assignments
    .map((assignment) => ASSIGNMENT_LABELS[assignment])
    .join('/')
  const inputs =
    chain.inputCostText && chain.inputCostText !== '无'
      ? `投 ${chain.inputCostText}`
      : '不另耗料'
  const status = CHAIN_STATUS_LABELS[chain.status]
  return `「${chain.definition.name}」：${pair}；${status}。每月耗潮息 ${chain.tideCostText}，效率 ×${chain.efficiency}；每炉需推进 ${chain.intervalMonths} 月，${inputs}，产 ${describeEffects(chain.definition.outputs)}；${chainPurityText(chain)}。${assignments}差事上的道童会按信任与熟练再提效率。`
}

function tideHint(): string {
  return `潮息每月由聚潮阵、灵脉与听潮阁积起，上限看聚潮阵、潮库、灵脉与听潮阁。链条按「药脉丹火 → 兽火铸器 → 潮眼悟道」的次序取潮；前面的链缺潮停下时，后面的链才拿得到。`
}

const visitorInterval = computed(() =>
  Math.max(3, 8 - Math.floor(game.caveProductionView.reputation / 12)),
)

const raidInterval = computed(() =>
  Math.max(10, 18 - Math.floor(game.caveProductionView.reputation / 10)),
)

function selectTab(id: string): void {
  tab.value = id as CaveTab
}

function selectBuildingFilter(id: string): void {
  buildingFilter.value = id as BuildingFilter
}

function selectDiscipleRole(id: string): void {
  discipleRole.value = id as 'all' | DiscipleAssignment
}

function selectCraftSub(id: string): void {
  craftSub.value = id as CraftDiscipline
}

function selectLogFilter(id: string): void {
  logFilter.value = id as LogFilter
}

function rate(value: number): string {
  return Number(value.toFixed(2)).toString()
}

function monthLabel(months: number): string {
  const calendar = calendarFromMonths(months)
  return `第${calendar.year}年${calendar.month}月`
}

function assignmentOutput(option: AssignmentOption, disciple: DiscipleView): string {
  const trust = disciple.trust
  const power = option.power
  if (option.id === 'study') {
    return `修为/月 +${rate((0.2 + trust * 0.03) * power)}`
  }
  if (option.id === 'gather') {
    return `灵草/月 +${rate((0.26 + trust * 0.03) * power)}、灵石/月 +${rate(0.08 * power)}`
  }
  if (option.id === 'guard') {
    return `护洞 +${rate((3 + trust * 0.4) * power)}`
  }
  if (option.id === 'craft') {
    return `灵石/月 +${rate((0.18 + trust * 0.02) * power)}、灵矿/月 +${rate(0.06 * power)}`
  }
  return `修为/月 +${rate((0.1 + trust * 0.02) * power)}、灵草/月 +${rate((0.08 + trust * 0.01) * power)}、澄澈/月 +${rate(0.9 + trust * 0.06)}`
}

function assignmentHint(disciple: DiscipleView, option: AssignmentOption): string {
  const output = assignmentOutput(option, disciple)
  const current = ASSIGNMENT_LABELS[disciple.assignment] ?? '旧差事'
  const prefix =
    option.id === disciple.assignment
      ? `当前已派「${option.label}」：${output}`
      : `改派「${option.label}」：${output}；现为「${current}」`
  const rank = option.rank === '初习' ? '初习，尚无加成' : `${option.rank}，效率 ${Math.round(option.power * 100)}%`
  return `${prefix}。此差事已是「${rank}」；信任 ${disciple.trust}；已熟悉的旧差事不会白费。`
}

function buildingVerbHint(building: BuildingView): string {
  const verb = building.verb
  if (!verb) return ''
  const cooldown = verb.cooldown > 0 ? `；尚需 ${Math.ceil(verb.cooldown)} 月才能再行` : ''
  return `行「${verb.name}」：耗 ${verb.costText}；${describeEffects(verb.effects, '此筑功用生效')}；冷却 ${verb.cooldownMonths} 月${cooldown}；动用洞府之力会让灵脉澄澈 -0.5。`
}

function buildingUpgradeHint(building: BuildingView): string {
  const next = building.next
  if (!next) return '此筑已至三阶。'
  const verb = next.verb ? `；解锁「${next.verb.name}」` : ''
  return `营建「${next.name}」：耗 ${building.nextCostText}；${describeEffects(next.effects, '洞府气象更盛')}${verb}；动土使澄澈 -2、声名 +3。`
}

function recruitHint(disciple: DiscipleView): string {
  return `留${disciple.name}住下：耗 ${disciple.recruitCostText}；得一名道童，默认派「${ASSIGNMENT_LABELS[disciple.aptitude]}」（本命差事效率 +15%）；信任 0/6，日久后会按差事为洞府出力，也可能引出自己的后续。`
}

function veinHint(): string {
  const view = game.caveVeinView
  if (!view?.next) return ''
  return `引灵入脉：耗 ${view.costText}；${describeEffects(view.next.effects, '灵脉更盛')}；澄澈 +8、声名 +4；洞府各项产出与护洞之力随灵脉阶数提高。`
}

function tendHint(): string {
  const view = game.caveVeinView
  if (!view) return ''
  const ready =
    view.tendCooldown > 0
      ? `还需 ${Math.ceil(view.tendCooldown)} 月才能再疏`
      : view.tendAffordable
        ? '可以动手'
        : '资材不足'
  return `疏脉养息：耗 ${view.tendCostText}；澄澈 +12、声名 +1；此后 ${view.tendCooldownMonths} 月不能再疏；当前澄澈 ${Math.round(view.purity)}，产出与守御 ×${view.purityFactor}。${ready}。`
}

function visitorHint(choice: VisitorChoice): string {
  const parts = [`选择「${choice.label}」：${describeEffects(choice.effects)}`]
  if (choice.costText && choice.costText !== '无') {
    parts.push(`耗 ${choice.costText}`)
  }
  parts.push('答复后声名 +1')
  if (!choice.requirementsMet) {
    parts.push(`因缘尚缺：${describeRequirements(choice.unmet)}`)
  } else if (!choice.affordable) {
    parts.push('手头材料不足')
  }
  const stay = game.caveVisitorView?.stayMonths
  if (stay !== undefined) parts.push(`来客还会停留 ${stay} 月，错过后此择不再`)
  return `${parts.join('；')}。`
}

function raidHint(): string {
  const raid = game.caveRaidView
  if (!raid) return ''
  const vein = raid.veinDamage ? `；若失守，灵脉退 ${raid.veinDamage} 阶、澄澈 -15、声名 -5` : ''
  return `去洞口应战：处理「${raid.encounterName}」，护洞之力 ${raid.defense}${vein}。战斗在遭遇面板中结算。`
}

function recipeCostText(recipe: RecipeView): string {
  const costs = recipe.costs.map(
    (cost) => `${resourceLabel(cost.key)} ${cost.have}/${cost.need}`,
  )
  const materials = recipe.materials.map(
    (material) => `${material.name} ${material.have}/${material.need}`,
  )
  return [...costs, ...materials].join('、')
}

function craftHint(recipe: RecipeView): string {
  const required = PROFESSION_RANKS[recipe.definition.requiredRank]
  const parts = [
    `${recipe.definition.discipline === 'alchemy' ? '开炉' : '起砧'}「${recipe.definition.name}」：${recipe.buildingName}需 ${recipe.definition.requiredBuildingLevel} 级（现 ${recipe.buildingLevel} 级），职业需至${required?.name ?? '更高阶'}（现${recipe.rankName}）`,
    `耗 ${recipeCostText(recipe)}`,
    `产出 ${recipe.outputText}；品相成算 ${Math.round(recipe.qualityChance * 100)}%`,
    `冷却 ${recipe.definition.cooldownMonths} 月${recipe.cooldownRemaining > 0 ? `（尚需 ${Math.ceil(recipe.cooldownRemaining)} 月）` : ''}`,
    '开炉不会失败，火候只影响产量与品相；灵脉澄澈与派去炼作的道童都会抬高成算',
  ]
  if (recipe.blockers.length) parts.push(`尚缺：${recipe.blockers.join('；')}`)
  return `${parts.join('。')}。`
}

function doCraft(recipeId: string): void {
  game.craftRecipe(recipeId as Parameters<typeof game.craftRecipe>[0])
}

function materialHint(material: RecipeView['materials'][number]): string {
  const parts = [`${material.name}：手头 ${material.have} / 需 ${material.need}`]
  if (material.source) parts.push(`来处 · ${material.source}`)
  if (material.description) parts.push(material.description)
  const text = parts.join('；')
  return /[。！？]$/.test(text) ? text : `${text}。`
}

function craftStateLabel(recipe: RecipeView): string {
  if (recipe.canCraft) {
    return recipe.definition.discipline === 'alchemy' ? '可开炉' : '可起砧'
  }
  if (recipe.cooldownRemaining > 0) {
    return `候火 ${Math.ceil(recipe.cooldownRemaining)} 月`
  }
  if (!recipe.buildingReady || !recipe.rankReady) return '条件未齐'
  return '炉料未齐'
}
</script>

<template>
  <div class="space-y-5">
    <template v-if="game.cave && game.caveOpen">
      <section>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-serif text-2xl leading-none">{{ game.cave.name }}</p>
            <p class="mt-1.5 text-[14px] text-muted">
              {{ game.cave.spiritVein.name }} · {{ game.cave.spiritVein.attributes.join(' / ') }}
            </p>
          </div>
          <span class="shrink-0 rounded-sm border border-jade/35 bg-jade-soft px-2 py-1 text-[13px] text-jade-deep">
            {{ game.caveStatus.label }}
          </span>
        </div>
        <p class="mt-3 text-[14px] leading-7 text-muted">{{ game.cave.description }}</p>
        <p class="mt-1 text-[13px] leading-5 text-muted">{{ game.caveStatus.detail }}</p>

        <div class="mt-3.5 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          <div class="rounded-sm border border-line/70 bg-paper/50 px-2 py-1.5 text-center">
            <p class="text-[12px] text-muted">修为 / 月</p>
            <p class="mt-0.5 text-[14px] font-medium">{{ game.caveProductionView.cultivation }}</p>
          </div>
          <div
            v-for="resource in game.caveProductionView.resources"
            :key="resource.key"
            class="rounded-sm border border-line/70 bg-paper/50 px-2 py-1.5 text-center"
          >
            <p class="text-[12px] text-muted">{{ resource.label }} / 月</p>
            <p class="mt-0.5 text-[14px] font-medium">{{ resource.value }}</p>
          </div>
          <div class="rounded-sm border border-line/70 bg-paper/50 px-2 py-1.5 text-center">
            <p class="text-[12px] text-muted">行旅 / 月</p>
            <p class="mt-0.5 text-[14px] font-medium">{{ game.caveProductionView.travel }}</p>
          </div>
          <div class="rounded-sm border border-line/70 bg-paper/50 px-2 py-1.5 text-center">
            <p class="text-[12px] text-muted">护洞</p>
            <p class="mt-0.5 text-[14px] font-medium">{{ game.caveDefenseValue }}</p>
          </div>
          <div class="rounded-sm border border-line/70 bg-paper/50 px-2 py-1.5 text-center">
            <p class="text-[12px] text-muted">澄澈</p>
            <p class="mt-0.5 text-[14px] font-medium">{{ Math.round(game.caveProductionView.purity) }}</p>
          </div>
          <div class="rounded-sm border border-line/70 bg-paper/50 px-2 py-1.5 text-center">
            <p class="text-[12px] text-muted">声名</p>
            <p class="mt-0.5 text-[14px] font-medium">{{ game.caveProductionView.reputation }}</p>
          </div>
        </div>
        <p class="mt-1.5 text-[12px] leading-4 text-muted">
          洞府槽开启时，产出与灵脉进度一并计入离线结算；澄澈按月自行消退，也会被营建、取用与来袭拖低。
        </p>
      </section>

      <Teleport v-if="toolbarTarget" :to="`#${toolbarTarget}`" defer>
        <div class="space-y-1.5">
          <TabBar :tabs="tabs" :active="tab" @select="selectTab" />
          <TabBar
            v-if="tab === 'buildings'"
            size="sm"
            :tabs="buildingFilterTabs"
            :active="buildingFilter"
            @select="selectBuildingFilter"
          />
          <TabBar
            v-else-if="tab === 'disciples'"
            size="sm"
            :tabs="discipleRoleTabs"
            :active="discipleRole"
            @select="selectDiscipleRole"
          />
          <TabBar
            v-else-if="tab === 'craft'"
            size="sm"
            :tabs="craftSubTabs"
            :active="craftSub"
            @select="selectCraftSub"
          />
          <TabBar
            v-else-if="tab === 'log'"
            size="sm"
            :tabs="logFilterTabs"
            :active="logFilter"
            @select="selectLogFilter"
          />
        </div>
      </Teleport>

      <template v-if="tab === 'overview'">
        <section class="rounded-sm border border-line/80 bg-white/25 p-3.5">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <p class="text-[13px] tracking-[0.22em] text-jade">洞府气数</p>
            <span class="text-[12px] text-muted">
              产出与守御 ×{{ game.caveProductionView.purityFactor }}
            </span>
          </div>
          <div class="mt-2 flex items-center gap-2">
            <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-line/70">
              <div
                class="h-full rounded-full transition-all"
                :class="
                  game.caveProductionView.purity >= 60
                    ? 'bg-jade/65'
                    : game.caveProductionView.purity >= 35
                      ? 'bg-gold/70'
                      : 'bg-cinnabar/70'
                "
                :style="{ width: purityPercent }"
              ></div>
            </div>
            <span class="shrink-0 text-[13px] font-medium">
              澄澈 {{ Math.round(game.caveProductionView.purity) }} / 100
            </span>
          </div>
          <p class="mt-1.5 text-[13px] leading-5 text-muted">
            {{
              game.caveProductionView.purity >= 60
                ? '潮声清透，洞中草木、丹炉与守阵都在顺处。'
                : game.caveProductionView.purity >= 35
                  ? '灵脉里积了薄浊，产出已开始打折。派一名道童养脉，或亲手疏一次。'
                  : '浊意压过了潮声，洞府先于外敌显出败相。再不理它，灵脉会一点点枯下去。'
            }}
          </p>
          <p class="mt-1 text-[12px] leading-4 text-muted">
            {{ game.caveDaoView.stallText }}
          </p>
          <div
            v-if="game.caveDaoView.notes.length"
            class="mt-2 flex flex-wrap gap-1.5 border-t border-line/60 pt-2"
          >
            <span
              v-for="note in game.caveDaoView.notes"
              :key="note.label"
              class="rounded-sm border border-jade/30 bg-jade/[0.04] px-1.5 py-0.5 text-[12px] text-jade-deep"
              v-hint="note.detail"
            >
              {{ note.label }}
            </span>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-2 border-t border-line/60 pt-2 text-[12px] leading-5 text-muted">
            <p>声名 {{ game.caveProductionView.reputation }}：来客约 {{ visitorInterval }} 月一至</p>
            <p>守胜之后，来袭约 {{ raidInterval }} 月后再起</p>
          </div>
        </section>

        <section class="rounded-sm border border-jade/30 bg-jade-soft/20 p-3.5">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <p class="text-[13px] tracking-[0.22em] text-jade">洞府运转</p>
            <span class="text-[12px] text-muted">
              潮息 {{ game.caveTideView.tideText }} / {{ game.caveTideView.cap }} · 每月 +{{ game.caveTideView.perMonthText }}
            </span>
          </div>
          <div class="mt-2 flex items-center gap-2" v-hint="tideHint()">
            <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-line/70">
              <div
                class="h-full rounded-full bg-gold/65 transition-all"
                :style="{ width: `${game.caveTideView.percent}%` }"
              ></div>
            </div>
            <span class="shrink-0 text-[12px] text-muted">{{ game.caveTideView.percent }}%</span>
          </div>
          <p class="mt-1.5 text-[12px] leading-4 text-muted">
            三条链共用一池潮息，按「药脉丹火 → 兽火铸器 → 潮眼悟道」的次序取用。缺潮或缺料就停一炉，已完成的那部分不会白费。
            <span v-if="game.caveTideView.percent >= 100" class="text-gold-deep">
              潮息已满，多出的会散进礁缝。
            </span>
          </p>

          <div class="mt-2.5 space-y-2">
            <article
              v-for="chain in game.caveChainViews"
              :key="chain.definition.id"
              class="rounded-sm border border-line/70 bg-white/30 px-2.5 py-2.5"
            >
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <p class="text-[14px] font-medium">{{ chain.definition.name }}</p>
                    <span
                      class="rounded-sm border px-1.5 py-0.5 text-[12px]"
                      :class="CHAIN_STATUS_CLASSES[chain.status]"
                    >
                      {{ CHAIN_STATUS_LABELS[chain.status] }}
                    </span>
                  </div>
                  <p class="mt-0.5 text-[12px] leading-4 text-muted">
                    {{ chainBuildingText(chain) }} · 效率 ×{{ chain.efficiency }}
                    <template v-if="chain.disciples"> · 道童 {{ chain.disciples }}</template>
                  </p>
                </div>
                <button
                  v-if="chain.linked"
                  type="button"
                  class="shrink-0 rounded-sm border px-2 py-1 text-[12px] transition"
                  :class="
                    chain.enabled
                      ? 'border-line text-muted hover:border-cinnabar/35 hover:text-cinnabar'
                      : 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                  "
                  v-hint="
                    chain.enabled
                      ? '停炉：不再取用潮息，已完成的推进保留；后面的链会拿到更多潮息。'
                      : '开炉：按固定次序取用潮息；潮息或料不足时，这一炉会压着等。'
                  "
                  @click="game.toggleCaveChain(chain.definition.id, !chain.enabled)"
                >
                  {{ chain.enabled ? '停炉' : '开炉' }}
                </button>
              </div>

              <div class="mt-1.5 flex items-center gap-2" v-hint="chainHint(chain)">
                <div class="h-1 flex-1 overflow-hidden rounded-full bg-line/70">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="
                      chain.status === 'running'
                        ? 'bg-jade/60'
                        : chain.status === 'no_tide'
                          ? 'bg-gold/65'
                          : chain.status === 'no_inputs'
                            ? 'bg-cinnabar/60'
                            : 'bg-line'
                    "
                    :style="{ width: chainProgressPercent(chain) }"
                  ></div>
                </div>
                <span class="shrink-0 text-[12px] text-muted">
                  {{ Math.round((chain.progress / chain.intervalMonths) * 100) }}%
                </span>
              </div>
              <p class="mt-1 text-[12px] leading-4 text-muted">{{ chainStatusNote(chain) }}</p>
              <div class="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[12px] leading-4 text-muted">
                <span>潮 {{ chain.tideCostText }}/月</span>
                <span v-if="chain.inputCostText && chain.inputCostText !== '无'">
                  投 {{ chain.inputCostText }}
                </span>
                <span>产 {{ describeEffects(chain.definition.outputs) }}</span>
                <span :class="chain.definition.purityPerMonth < 0 ? 'text-cinnabar/80' : 'text-jade-deep/80'">
                  {{ chainPurityText(chain) }}
                </span>
              </div>
            </article>
          </div>
        </section>

        <section
          v-if="game.caveRaidView"
          class="rounded-sm border border-cinnabar/40 bg-cinnabar/[0.03] p-3.5"
        >
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-[12px] tracking-[0.16em] text-cinnabar/80">洞口动静</p>
              <p class="mt-1 font-serif text-lg leading-tight">{{ game.caveRaidView.name }}</p>
            </div>
            <span class="shrink-0 rounded-sm border border-cinnabar/35 px-1.5 py-0.5 text-[12px] text-cinnabar">
              {{
                game.caveRaidView.encounterQueued
                  ? '已至洞口'
                  : `${game.caveRaidView.dueIn} 月后抵达`
              }}
            </span>
          </div>
          <p class="mt-2 text-[14px] leading-6 text-ink-soft">{{ game.caveRaidView.warning }}</p>
          <p class="mt-1 text-[13px] leading-5 text-muted">{{ game.caveRaidView.description }}</p>
          <p class="mt-2 text-[12px] leading-4 text-muted">
            来袭者：{{ game.caveRaidView.encounterName }} · 护洞之力 {{ game.caveRaidView.defense }}
            <template v-if="game.caveRaidView.veinDamage">
              · 若失守，灵脉退 {{ game.caveRaidView.veinDamage }} 阶、澄澈 -15、声名 -5
            </template>
          </p>
          <button
            v-if="game.caveRaidView.encounterQueued"
            type="button"
            class="mt-2.5 w-full rounded-sm border border-cinnabar/40 bg-cinnabar/[0.05] px-2.5 py-1.5 text-[13px] tracking-[0.08em] text-cinnabar transition hover:bg-cinnabar/[0.1]"
            v-hint="raidHint()"
            @click="ui.openPanel('combat')"
          >
            去洞口应战
          </button>
          <p v-else class="mt-2 text-[12px] leading-4 text-muted">
            还有时间。升级聚潮阵、请守脉道童或施展回澜护穴，都会让这一战好过一些。
          </p>
        </section>

        <section
          v-if="game.caveVisitorView"
          class="rounded-sm border border-line bg-white/25 p-3.5"
        >
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-[12px] tracking-[0.16em] text-muted">洞口来客</p>
              <p class="mt-1 font-serif text-lg leading-tight">
                {{ game.caveVisitorView.name }}
                <span class="ml-1 text-[13px] font-normal text-muted">
                  {{ game.caveVisitorView.title }}
                </span>
              </p>
            </div>
            <span class="shrink-0 rounded-sm border border-line px-1.5 py-0.5 text-[12px] text-muted">
              还会留 {{ game.caveVisitorView.stayMonths }} 月
            </span>
          </div>
          <p class="mt-2 text-[14px] leading-6 text-ink-soft">{{ game.caveVisitorView.greeting }}</p>
          <p class="mt-1 text-[13px] leading-5 text-muted">{{ game.caveVisitorView.description }}</p>
          <div class="mt-2.5 space-y-2">
            <button
              v-for="choice in game.caveVisitorView.choices"
              :key="choice.id"
              type="button"
              class="w-full rounded-sm border px-2.5 py-2 text-left transition"
              :class="
                choice.canChoose
                  ? 'border-line bg-paper/40 hover:border-jade/40'
                  : 'cursor-not-allowed border-line/60 bg-paper/20'
              "
              :disabled="!choice.canChoose"
              v-hint="visitorHint(choice)"
              @click="game.chooseCaveVisitor(choice.id)"
            >
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <span class="text-[14px] font-medium">{{ choice.label }}</span>
                <span
                  v-if="choice.costText && choice.costText !== '无'"
                  class="text-[12px] text-muted"
                >
                  {{ choice.costText }}
                </span>
              </div>
              <p class="mt-1 text-[13px] leading-5 text-muted">{{ choice.description }}</p>
              <p
                v-if="!choice.requirementsMet"
                class="mt-1 text-[12px] leading-4 text-cinnabar/80"
              >
                尚缺：{{ describeRequirements(choice.unmet) }}
              </p>
              <p
                v-else-if="!choice.affordable"
                class="mt-1 text-[12px] leading-4 text-cinnabar/80"
              >
                手头材料不足。
              </p>
            </button>
          </div>
        </section>

        <section v-if="recentLog.length" class="rounded-sm border border-line/80 bg-paper/40 p-3">
          <div class="flex items-center justify-between gap-2">
            <p class="text-[13px] tracking-[0.22em] text-jade">近日事迹</p>
            <button
              type="button"
              class="text-[12px] text-muted transition hover:text-jade"
              @click="tab = 'log'"
            >
              查看全部
            </button>
          </div>
          <ul class="mt-2 space-y-1.5">
            <li
              v-for="entry in recentLog"
              :key="entry.id"
              class="flex gap-2 text-[13px] leading-5"
            >
              <span class="shrink-0 rounded-sm border border-line px-1 text-[12px] text-muted">
                {{ LOG_KIND_LABELS[entry.kind] }}
              </span>
              <span class="min-w-0 flex-1 text-muted">{{ entry.text }}</span>
              <span class="shrink-0 text-[12px] text-muted/80">{{ monthLabel(entry.createdAtMonths) }}</span>
            </li>
          </ul>
        </section>

        <section class="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            class="rounded-sm border border-line bg-white/25 px-2.5 py-2 text-left transition hover:border-jade/40"
            @click="tab = 'buildings'"
          >
            <p class="text-[13px] font-medium">营建</p>
            <p class="mt-0.5 text-[12px] leading-4 text-muted">八筑各有功用，动土会惊脉。</p>
          </button>
          <button
            type="button"
            class="rounded-sm border border-line bg-white/25 px-2.5 py-2 text-left transition hover:border-jade/40"
            @click="tab = 'disciples'"
          >
            <p class="text-[13px] font-medium">道童</p>
            <p class="mt-0.5 text-[12px] leading-4 text-muted">差事做得久了，会成自己的手段。</p>
          </button>
          <button
            type="button"
            class="rounded-sm border border-line bg-white/25 px-2.5 py-2 text-left transition hover:border-jade/40"
            @click="tab = 'vein'"
          >
            <p class="text-[13px] font-medium">灵脉</p>
            <p class="mt-0.5 text-[12px] leading-4 text-muted">养脉、疏脉，决定洞府的底子。</p>
          </button>
        </section>
      </template>

      <template v-else-if="tab === 'buildings'">
        <section class="space-y-3">
          <p v-if="!filteredBuildings.length" class="rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted">
            这一类还没有动土的建筑。
          </p>
          <article
            v-for="building in filteredBuildings"
            :key="building.id"
            class="rounded-sm border border-line/80 bg-paper p-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="font-serif text-lg leading-tight">{{ building.name }}</p>
                  <span class="rounded-sm border border-line px-1.5 py-0.5 text-[12px] text-muted">
                    {{ building.current?.name ?? '未动土' }}
                  </span>
                  <span class="rounded-sm border border-jade/25 px-1.5 py-0.5 text-[12px] text-jade-deep/80">
                    {{ BUILDING_CATEGORY_LABELS[BUILDING_CATEGORY[building.id] ?? 'all'] }}
                  </span>
                  <span
                    v-for="chain in chainTagsFor(building.id)"
                    :key="chain.definition.id"
                    class="rounded-sm border px-1.5 py-0.5 text-[12px]"
                    :class="CHAIN_STATUS_CLASSES[chain.status]"
                    v-hint="chainHint(chain)"
                  >
                    {{ chain.definition.name }}
                  </span>
                </div>
                <p class="mt-1 text-[13px] leading-5 text-muted">
                  {{ building.current?.description ?? building.description }}
                </p>
              </div>
              <div class="flex shrink-0 gap-1 pt-1.5">
                <span
                  v-for="level in building.levels"
                  :key="level.level"
                  class="h-1.5 w-4 rounded-full"
                  :class="level.unlocked ? 'bg-jade/60' : 'bg-line'"
                ></span>
              </div>
            </div>

            <div
              v-if="building.verb"
              class="mt-2.5 rounded-sm border border-line/60 bg-paper/40 px-2.5 py-2"
            >
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <p class="text-[14px] font-medium">{{ building.verb.name }}</p>
                <span class="text-[12px] text-muted">{{ building.verb.costText }}</span>
              </div>
              <p class="mt-1 text-[13px] leading-5 text-muted">{{ building.verb.description }}</p>
              <button
                type="button"
                class="mt-2 w-full rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
                :class="
                  building.verb.canUse
                    ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                    : 'cursor-not-allowed border-line text-muted'
                "
                :disabled="!building.verb.canUse"
                v-hint="buildingVerbHint(building)"
                @click="game.useCaveBuilding(building.id)"
              >
                {{
                  building.verb.cooldown > 0
                    ? `需再候 ${Math.ceil(building.verb.cooldown)} 月`
                    : building.verb.affordable
                      ? `行「${building.verb.name}」`
                      : '材料不足'
                }}
              </button>
            </div>
            <p v-else class="mt-2 text-[13px] leading-5 text-muted">{{ building.description }}</p>

            <div v-if="building.next" class="mt-2.5 border-t border-line/70 pt-2.5">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <p class="text-[13px] font-medium">下一阶 · {{ building.next.name }}</p>
                <span class="text-[12px] text-muted">{{ building.nextCostText }}</span>
              </div>
              <p class="mt-1 text-[13px] leading-5 text-muted">{{ building.next.description }}</p>
              <p class="mt-1 text-[12px] leading-4 text-muted">
                动土：澄澈 -2 · 声名 +3
              </p>
              <button
                type="button"
                class="mt-2 w-full rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
                :class="
                  building.canUpgrade
                    ? 'border-line bg-paper/40 text-ink-soft hover:border-jade/40 hover:text-jade'
                    : 'cursor-not-allowed border-line text-muted'
                "
                :disabled="!building.canUpgrade"
                v-hint="buildingUpgradeHint(building)"
                @click="game.upgradeCaveBuilding(building.id)"
              >
                {{ building.canUpgrade ? `营建「${building.next.name}」` : '材料不足' }}
              </button>
            </div>
            <p v-else class="mt-2 border-t border-line/70 pt-2 text-[12px] text-muted">
              三阶已尽。再往下不是营建，是往灵脉深处走。
            </p>
          </article>
        </section>
      </template>

      <template v-else-if="tab === 'disciples'">
        <section class="space-y-3">
          <p v-if="!filteredDisciples.length" class="rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted">
            这一类差事上还没有人。
          </p>
          <article
            v-for="disciple in filteredDisciples"
            :key="disciple.id"
            class="rounded-sm border p-3.5"
            :class="
              disciple.recruited
                ? 'border-line/80 bg-white/25'
                : 'border-dashed border-line/80 bg-paper/20'
            "
          >
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="font-serif text-lg leading-tight">
                  {{ disciple.name }}
                  <span class="ml-1 text-[13px] font-normal text-muted">{{ disciple.title }}</span>
                </p>
                <p class="mt-1 text-[13px] leading-5 text-muted">{{ disciple.description }}</p>
                <p class="mt-1 text-[12px] leading-4 text-muted">
                  性情：{{ disciple.temperament }} · 本命：{{ ASSIGNMENT_LABELS[disciple.aptitude] }}
                </p>
              </div>
              <span
                class="shrink-0 rounded-sm border px-1.5 py-0.5 text-[12px]"
                :class="
                  disciple.recruited
                    ? 'border-jade/40 text-jade-deep'
                    : 'border-line text-muted'
                "
              >
                {{ disciple.recruited ? `信 ${disciple.trust}` : '未入洞' }}
              </span>
            </div>

            <template v-if="disciple.recruited">
              <div class="mt-2.5 rounded-sm border border-line/60 bg-paper/40 px-2.5 py-1.5 text-[12px] leading-4">
                <span class="text-ink-soft">当前差事 · {{ disciple.assignmentLabel }}</span>
                <span class="text-muted"> · {{ disciple.expertiseRank }} · {{ disciple.powerText }}</span>
                <p class="mt-0.5 text-muted">
                  已做 {{ disciple.expertiseMonths }} 月；下一境 {{ disciple.expertiseNext }}
                </p>
              </div>
              <div class="mt-2 flex gap-1">
                <button
                  v-for="option in disciple.assignmentOptions"
                  :key="option.id"
                  type="button"
                  class="flex-1 rounded-sm border px-1.5 py-1.5 text-[13px] transition"
                  :class="
                    option.active
                      ? 'border-jade/40 bg-jade-soft text-jade-deep'
                      : 'border-line text-muted hover:text-ink'
                  "
                  v-hint="assignmentHint(disciple, option)"
                  @click="game.assignCaveDisciple(disciple.id, option.id)"
                >
                  {{ option.label }}
                </button>
              </div>
              <div class="mt-2 flex items-center gap-2">
                <div class="flex gap-1">
                  <span
                    v-for="step in disciple.trustMax"
                    :key="step"
                    class="h-1 w-3 rounded-full"
                    :class="step <= disciple.trust ? 'bg-jade/55' : 'bg-line'"
                  ></span>
                </div>
                <p class="min-w-0 flex-1 text-[12px] leading-4 text-muted">
                  {{ disciple.trustLine }}
                </p>
              </div>
              <p class="mt-1.5 border-t border-line/60 pt-1.5 text-[12px] leading-4 text-muted">
                {{ disciple.bondNote }}
              </p>
            </template>

            <template v-else>
              <p class="mt-2 text-[12px] leading-4 text-muted">
                入门条件：{{ describeRequirements(disciple.requirements) }}
              </p>
              <p class="mt-0.5 text-[12px] leading-4 text-muted">
                安顿所费：{{ disciple.recruitCostText }} · 入洞后默认派「{{ ASSIGNMENT_LABELS[disciple.aptitude] }}」
              </p>
              <p
                v-if="!disciple.requirementsMet"
                class="mt-1 text-[12px] leading-4 text-cinnabar/80"
              >
                尚缺：{{ describeRequirements(disciple.unmet) }}
              </p>
              <button
                type="button"
                class="mt-2 w-full rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
                :class="
                  disciple.canRecruit
                    ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                    : 'cursor-not-allowed border-line text-muted'
                "
                :disabled="!disciple.canRecruit"
                v-hint="recruitHint(disciple)"
                @click="game.recruitCaveDisciple(disciple.id)"
              >
                {{
                  !disciple.requirementsMet
                    ? '因缘未到'
                    : disciple.affordable
                      ? '留他住下'
                      : '安顿不起'
                }}
              </button>
            </template>
          </article>
        </section>
      </template>

      <template v-else-if="tab === 'vein'">
        <section class="space-y-3">
          <article class="rounded-sm border border-line/80 bg-white/25 p-3.5">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="font-serif text-lg leading-tight">
                  {{ game.caveVeinView?.current?.name ?? game.cave.spiritVein.name }}
                </p>
                <p class="mt-1 text-[13px] leading-5 text-muted">
                  {{ game.caveVeinView?.current?.description ?? game.cave.spiritVein.description }}
                </p>
              </div>
              <span class="shrink-0 rounded-sm border border-line px-1.5 py-0.5 text-[12px] text-muted">
                第 {{ game.caveVeinView?.current?.level ?? 0 }} 阶
              </span>
            </div>
            <p class="mt-2 border-t border-line/70 pt-2 text-[13px] leading-5 text-muted">
              {{ game.cave.spiritVein.description }}
            </p>
          </article>

          <article
            v-if="game.caveVeinView"
            class="rounded-sm border p-3.5"
            :class="
              game.caveVeinView.purity >= 60
                ? 'border-jade/30 bg-jade-soft/40'
                : game.caveVeinView.purity >= 35
                  ? 'border-gold/35 bg-gold/[0.04]'
                  : 'border-cinnabar/40 bg-cinnabar/[0.03]'
            "
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">灵脉澄澈</p>
              <span class="text-[12px] text-muted">
                产出与守御 ×{{ game.caveVeinView.purityFactor }}
              </span>
            </div>
            <div class="mt-2 flex items-center gap-2">
              <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-line/70">
                <div
                  class="h-full rounded-full"
                  :class="
                    game.caveVeinView.purity >= 60
                      ? 'bg-jade/65'
                      : game.caveVeinView.purity >= 35
                        ? 'bg-gold/70'
                        : 'bg-cinnabar/70'
                  "
                  :style="{ width: `${Math.max(0, Math.min(100, game.caveVeinView.purity))}%` }"
                ></div>
              </div>
              <span class="shrink-0 text-[13px] font-medium">
                {{ Math.round(game.caveVeinView.purity) }} / 100
              </span>
            </div>
            <p class="mt-1.5 text-[12px] leading-5 text-muted">
              澄澈按月自行消退；营建、使用建筑与失守都会让它更低。派道童「养脉」可从根上托住，亲手疏脉则更快见效。
            </p>
            <div
              v-if="game.caveDaoView.notes.length"
              class="mt-2 border-t border-line/60 pt-2"
            >
              <p class="text-[12px] text-muted">道途在灵脉上的回响</p>
              <ul class="mt-1 space-y-0.5">
                <li
                  v-for="note in game.caveDaoView.notes"
                  :key="note.label"
                  class="text-[12px] leading-4 text-ink-soft"
                >
                  <span class="text-jade-deep">{{ note.label }}</span>
                  <span class="text-muted"> · </span>{{ note.detail }}
                </li>
              </ul>
            </div>
            <p v-else class="mt-2 border-t border-line/60 pt-2 text-[12px] leading-4 text-muted">
              星图上的「潮脉」若点亮，灵脉会自己记住更多潮声。
            </p>
            <p class="mt-1 text-[12px] leading-4 text-muted">
              {{ game.caveDaoView.stallText }}
            </p>
            <button
              type="button"
              class="mt-2 w-full rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
              :class="
                game.caveVeinView.canTend
                  ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                  : 'cursor-not-allowed border-line text-muted'
              "
              :disabled="!game.caveVeinView.canTend"
              v-hint="tendHint()"
              @click="game.tendCaveVein()"
            >
              {{
                game.caveVeinView.tendCooldown > 0
                  ? `需再候 ${Math.ceil(game.caveVeinView.tendCooldown)} 月`
                  : game.caveVeinView.purity >= 100
                    ? '灵脉已澄'
                    : game.caveVeinView.tendAffordable
                      ? `疏脉养息 · ${game.caveVeinView.tendCostText}`
                      : '资材不足'
              }}
            </button>
          </article>

          <ol class="space-y-2">
            <li
              v-for="level in game.caveVeinView?.levels ?? []"
              :key="level.level"
              class="rounded-sm border px-2.5 py-2"
              :class="
                (game.caveVeinView?.current?.level ?? 0) >= level.level
                  ? 'border-line/80 bg-paper/40'
                  : 'border-dashed border-line/70'
              "
            >
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <p class="text-[14px] font-medium">
                  第 {{ level.level }} 阶 · {{ level.name }}
                </p>
                <span
                  v-if="(game.caveVeinView?.current?.level ?? 0) === level.level"
                  class="text-[12px] text-jade-deep"
                >
                  当前
                </span>
              </div>
              <p class="mt-1 text-[13px] leading-5 text-muted">{{ level.description }}</p>
            </li>
          </ol>

          <div
            v-if="game.caveVeinView?.next"
            class="rounded-sm border border-line bg-paper p-3"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-[14px] font-medium">
                养脉 · {{ game.caveVeinView.next.name }}
              </p>
              <span class="text-[12px] text-muted">{{ game.caveVeinView.costText }}</span>
            </div>
            <p class="mt-1 text-[13px] leading-5 text-muted">
              {{ game.caveVeinView.next.description }}
            </p>
            <p class="mt-1 text-[12px] leading-4 text-muted">成脉：澄澈 +8 · 声名 +4</p>
            <button
              type="button"
              class="mt-2 w-full rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
              :class="
                game.caveVeinView.canUpgrade
                  ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                  : 'cursor-not-allowed border-line text-muted'
              "
              :disabled="!game.caveVeinView.canUpgrade"
              v-hint="veinHint()"
              @click="game.upgradeCaveVein()"
            >
              {{ game.caveVeinView.canUpgrade ? '引灵入脉' : '灵材不足' }}
            </button>
          </div>
          <p v-else class="rounded-sm border border-dashed border-line px-3 py-4 text-center text-[13px] leading-5 text-muted">
            灵脉已养至听潮见海。再往上，需要等一次真正的潮汐。
          </p>
        </section>
      </template>

      <template v-else-if="tab === 'craft'">
        <section class="rounded-sm border border-line/80 bg-white/25 p-3.5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-serif text-xl leading-tight">{{ activeProfession.label }}</p>
              <p class="mt-1 text-[13px] text-muted">
                {{ activeProfession.rankName }} ·
                已{{ activeProfession.discipline === 'alchemy' ? '开炉' : '起砧' }}
                {{ activeProfession.crafts }} 次
              </p>
            </div>
            <span class="shrink-0 rounded-sm border border-jade/35 bg-jade-soft px-2 py-1 text-[12px] text-jade-deep">
              熟练 {{ activeProfession.proficiency }}
            </span>
          </div>
          <div class="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line/70">
            <div
              class="h-full rounded-full bg-jade/60"
              :style="{ width: `${professionProgressPercent}%` }"
            ></div>
          </div>
          <p class="mt-1.5 text-[12px] leading-4 text-muted">
            <template v-if="activeProfession.nextRankName">
              距{{ activeProfession.nextRankName }}还差
              {{ (activeProfession.nextRankAt ?? 0) - activeProfession.proficiency }} 熟练
            </template>
            <template v-else>已至宗师，火候不再长进。</template>
          </p>
          <p class="mt-1.5 text-[13px] leading-5 text-ink-soft">
            {{ activeProfession.rankPassive }}
          </p>
        </section>

        <p class="text-[13px] leading-5 text-muted">
          丹道与器道都在洞府里起炉。开炉不会失败，火候只决定产量与品相；职业越熟、灵脉越澄澈、派去炼作的道童越多，火候佳的机会越大。
        </p>

        <article
          v-for="recipe in activeProfession.recipes"
          :key="recipe.definition.id"
          class="rounded-sm border p-3.5"
          :class="
            recipe.canCraft
              ? 'border-jade/35 bg-white/25'
              : 'border-line/80 bg-paper/25'
          "
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-serif text-lg leading-tight">{{ recipe.definition.name }}</p>
              <p class="mt-1 text-[13px] leading-5 text-muted">
                {{ recipe.definition.description }}
              </p>
            </div>
            <span
              class="shrink-0 rounded-sm border px-1.5 py-0.5 text-[12px]"
              :class="
                recipe.canCraft
                  ? 'border-jade/40 text-jade-deep'
                  : 'border-line text-muted'
              "
            >
              {{ craftStateLabel(recipe) }}
            </span>
          </div>

          <div class="mt-2 flex flex-wrap gap-1.5 text-[12px]">
            <span
              class="rounded-sm border px-1.5 py-0.5"
              :class="
                recipe.buildingReady
                  ? 'border-line text-muted'
                  : 'border-cinnabar/30 text-cinnabar/80'
              "
            >
              {{ recipe.buildingName }} {{ recipe.buildingLevel }} /
              {{ recipe.definition.requiredBuildingLevel }} 级
            </span>
            <span
              class="rounded-sm border px-1.5 py-0.5"
              :class="
                recipe.rankReady
                  ? 'border-line text-muted'
                  : 'border-cinnabar/30 text-cinnabar/80'
              "
            >
              需{{ PROFESSION_RANKS[recipe.definition.requiredRank]?.name }} · 现{{ recipe.rankName }}
            </span>
            <span class="rounded-sm border border-line px-1.5 py-0.5 text-muted">
              冷却 {{ recipe.definition.cooldownMonths }} 月
            </span>
          </div>

          <div class="mt-2 rounded-sm border border-line/70 px-2.5 py-2">
            <p class="text-[12px] tracking-[0.16em] text-muted">炉料</p>
            <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[12px] leading-4">
              <span
                v-for="cost in recipe.costs"
                :key="cost.key"
                :class="cost.ready ? 'text-ink-soft' : 'text-cinnabar/80'"
              >
                {{ resourceLabel(cost.key) }} {{ cost.have }} / {{ cost.need }}
              </span>
              <span
                v-for="material in recipe.materials"
                :key="material.itemId"
                class="cursor-help"
                :class="material.ready ? 'text-ink-soft' : 'text-cinnabar/80'"
                v-hint="materialHint(material)"
              >
                {{ material.name }} {{ material.have }} / {{ material.need }}
              </span>
            </div>
          </div>

          <div class="mt-1.5 flex flex-wrap items-baseline justify-between gap-2 text-[12px] text-muted">
            <span>产出 {{ recipe.outputText }}</span>
            <span>品相成算 {{ Math.round(recipe.qualityChance * 100) }}%</span>
          </div>
          <p
            v-if="recipe.blockers.length"
            class="mt-1 text-[12px] leading-4 text-cinnabar/80"
          >
            尚缺：{{ recipe.blockers.join('；') }}
          </p>

          <button
            type="button"
            class="mt-2 w-full rounded-sm border px-2.5 py-1.5 text-[13px] tracking-[0.08em] transition"
            :class="
              recipe.canCraft
                ? 'border-jade/40 bg-jade-soft text-jade-deep hover:bg-jade/15'
                : 'cursor-not-allowed border-line text-muted'
            "
            :disabled="!recipe.canCraft"
            v-hint="craftHint(recipe)"
            @click="doCraft(recipe.definition.id)"
          >
            {{
              recipe.canCraft
                ? recipe.definition.discipline === 'alchemy'
                  ? '开炉'
                  : '起砧'
                : craftStateLabel(recipe)
            }}
          </button>
        </article>
      </template>

      <template v-else-if="tab === 'log'">
        <section class="space-y-2">
          <p v-if="!filteredLog.length" class="rounded-sm border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted">
            这一类还没有值得记下的事。
          </p>
          <ol v-else class="space-y-0">
            <li
              v-for="entry in filteredLog"
              :key="entry.id"
              class="relative border-l border-line pb-3.5 pl-3.5 last:pb-0"
            >
              <span class="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-jade/60"></span>
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <span class="rounded-sm border border-line px-1.5 py-0.5 text-[12px] text-muted">
                  {{ LOG_KIND_LABELS[entry.kind] }}
                </span>
                <span class="text-[12px] text-muted">{{ monthLabel(entry.createdAtMonths) }}</span>
              </div>
              <p class="mt-1 text-[13px] leading-5 text-ink-soft">{{ entry.text }}</p>
            </li>
          </ol>
          <p class="pt-1 text-[12px] leading-4 text-muted">
            洞府只记最近 {{ game.caveLogViews.length }} 件；更早的事会沉回潮声里。
          </p>
        </section>
      </template>
    </template>

    <template v-else>
      <p class="font-serif text-2xl leading-none">尚未寻得洞府</p>
      <p class="mt-3 text-[14px] leading-7 text-muted">
        听潮洞还没有出现在你的命数里。潮市、龙门与某位巡海使之间，似乎有一条只在退潮时显形的路。
      </p>
      <div class="mt-3 rounded-sm border border-dashed border-line px-3 py-2 text-[13px] text-muted">
        洞府未寻 · 建筑 0 / 8 · 道童 0 / 3
      </div>
      <p class="mt-4 text-[13px] leading-5 text-muted">
        寻得洞府后，可养灵脉、营建八筑、收留道童。洞府不是仓库，而是一处会自己长出麻烦与因果的地方。
      </p>
    </template>
  </div>
</template>