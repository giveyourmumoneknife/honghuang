import type {
  CraftOutput,
  CraftRecipeDefinition,
} from '@/types/content'
import type {
  CraftDiscipline,
  CraftRecipeId,
  ItemId,
  ResourceKey,
} from '@/types/common'
import type { GameSaveData, PlayerProfessionState } from '@/types/state'
import type { ContentRegistry } from '@/data/registry'
import {
  buildingLevel,
  caveDefinition,
  discipleAssignmentPower,
  pushCaveLog,
} from './cave'
import { gearQualityName, grantGeneratedGear } from './gear'
import { Rng } from './rng'
import { cloneGameSaveData } from './state'
import { calendarFromMonths } from './time'

export const PROFESSION_LABELS: Record<CraftDiscipline, string> = {
  alchemy: '丹道',
  forging: '器道',
}

export interface ProfessionRank {
  rank: number
  name: string
  at: number
  passive: string
}

export const PROFESSION_RANKS: ProfessionRank[] = [
  {
    rank: 0,
    name: '学徒',
    at: 0,
    passive: '开炉必定成丹成器，只影响产量与品相。',
  },
  {
    rank: 1,
    name: '匠人',
    at: 60,
    passive: '火候佳时多出一枚丹药；器物更容易以更高品相出炉。',
  },
  {
    rank: 2,
    name: '良工',
    at: 160,
    passive: '丹药调息缩短 1 月；火候佳时的成算继续提高。',
  },
  {
    rank: 3,
    name: '大家',
    at: 320,
    passive: '极品器成时有几率再抬一阶品相；丹成多一枚的几率提高。',
  },
  {
    rank: 4,
    name: '宗师',
    at: 560,
    passive: '丹药调息缩短 2 月；火候极佳时可多出两枚丹药。',
  },
]

export const PROFESSION_MAX_PROFICIENCY = 560

const DISCIPLINE_PASSIVES: Record<CraftDiscipline, string[]> = {
  alchemy: [
    '开炉必定成丹，只影响产量与品相。',
    '火候正好以上时多出一枚丹药。',
    '丹药调息缩短 1 月；火候佳的成算提高。',
    '火候极佳时一炉可多出两枚丹药，成算继续提高。',
    '丹药调息缩短 2 月；火候佳的成算已至顶峰。',
  ],
  forging: [
    '起砧必有器成，只影响品相。',
    '器物更容易以更高品相出炉。',
    '品相成算继续提高。',
    '极品器成时有几率再抬一阶品相。',
    '品相成算已至顶峰，极品器仍可再抬一阶。',
  ],
}

export function professionRank(proficiency: number): ProfessionRank {
  let current = PROFESSION_RANKS[0]
  for (const rank of PROFESSION_RANKS) {
    if (proficiency >= rank.at) current = rank
  }
  return current
}

export function nextProfessionRank(proficiency: number): ProfessionRank | undefined {
  return PROFESSION_RANKS.find((rank) => rank.at > proficiency)
}

export function professionProficiency(
  player: GameSaveData['player'],
  discipline: CraftDiscipline,
): number {
  return player.professions?.[discipline]?.proficiency ?? 0
}

export function professionRankOf(
  player: GameSaveData['player'],
  discipline: CraftDiscipline,
): ProfessionRank {
  return professionRank(professionProficiency(player, discipline))
}

export function alchemyCooldownReduction(
  player: GameSaveData['player'],
): number {
  const rank = professionRankOf(player, 'alchemy').rank
  if (rank >= 4) return 2
  if (rank >= 2) return 1
  return 0
}

function professionState(
  player: GameSaveData['player'],
  discipline: CraftDiscipline,
): PlayerProfessionState {
  player.professions ??= {
    alchemy: { proficiency: 0, crafts: 0 },
    forging: { proficiency: 0, crafts: 0 },
  }
  player.professions[discipline] ??= { proficiency: 0, crafts: 0 }
  return player.professions[discipline]
}

function craftDiscipleBonus(
  state: GameSaveData,
  registry: ContentRegistry,
): number {
  const cave = state.cave
  const definition = caveDefinition(state, registry)
  if (!cave || !definition) return 0
  let bonus = 0
  for (const disciple of definition.disciples) {
    if (!cave.discipleIds.includes(disciple.id)) continue
    const assignment = cave.discipleAssignments[disciple.id] ?? disciple.aptitude
    if (assignment !== 'craft') continue
    bonus += (discipleAssignmentPower(cave, disciple, 'craft') - 1) * 0.35
  }
  return Math.min(0.24, bonus)
}

export function craftQualityChance(
  state: GameSaveData,
  registry: ContentRegistry,
  discipline: CraftDiscipline,
): number {
  const rank = professionRankOf(state.player, discipline).rank
  const purity = state.cave?.purity ?? 70
  const purityBonus = Math.max(-0.05, Math.min(0.05, (purity - 70) * 0.0015))
  const chance = 0.12 + rank * 0.07 + purityBonus + craftDiscipleBonus(state, registry)
  return Math.max(0.08, Math.min(0.62, chance))
}

function outputText(output: CraftOutput, registry: ContentRegistry): string {
  if (output.kind === 'item') {
    const name = registry.getItem(output.itemId)?.name ?? '无名之物'
    const count =
      output.countMin === output.countMax
        ? `×${output.countMin}`
        : `×${output.countMin}–${output.countMax}`
    return `${name} ${count}`
  }
  return `${output.tier} 阶器物（品相 +${output.qualityBonus}）`
}

export interface CraftCostEntry {
  key: ResourceKey
  need: number
  have: number
  ready: boolean
}

export interface CraftMaterialEntry {
  itemId: ItemId
  name: string
  need: number
  have: number
  ready: boolean
  source?: string
  description?: string
}

export interface CraftRecipeView {
  definition: CraftRecipeDefinition
  buildingName: string
  buildingLevel: number
  buildingReady: boolean
  rank: number
  rankName: string
  rankReady: boolean
  cooldownRemaining: number
  costs: CraftCostEntry[]
  materials: CraftMaterialEntry[]
  outputText: string
  qualityChance: number
  blockers: string[]
  canCraft: boolean
}

export interface ProfessionView {
  discipline: CraftDiscipline
  label: string
  proficiency: number
  rank: number
  rankName: string
  rankPassive: string
  crafts: number
  nextRankName?: string
  nextRankAt?: number
  recipes: CraftRecipeView[]
}

function recipeBlockers(
  state: GameSaveData,
  recipe: CraftRecipeDefinition,
  buildingLevelValue: number,
  cooldownRemaining: number,
): string[] {
  const blockers: string[] = []
  if (!state.cave) {
    blockers.push('尚未寻得洞府')
  } else if (buildingLevelValue < recipe.requiredBuildingLevel) {
    blockers.push(`建筑需达到 ${recipe.requiredBuildingLevel} 级`)
  }
  const rank = professionRankOf(state.player, recipe.discipline)
  if (rank.rank < recipe.requiredRank) {
    blockers.push(`${PROFESSION_LABELS[recipe.discipline]}需至${PROFESSION_RANKS[recipe.requiredRank]?.name ?? '更高阶'}`)
  }
  if (cooldownRemaining > 0) {
    blockers.push(`炉温未冷，还需 ${Math.ceil(cooldownRemaining)} 月`)
  }
  for (const [key, amount] of Object.entries(recipe.cost)) {
    if ((state.player.resources[key as ResourceKey] ?? 0) < (amount ?? 0)) {
      blockers.push('资源不足')
      break
    }
  }
  for (const entry of recipe.items) {
    if ((state.player.inventory[entry.itemId] ?? 0) < entry.count) {
      blockers.push('材料不足')
      break
    }
  }
  return blockers
}

function recipeView(
  state: GameSaveData,
  registry: ContentRegistry,
  recipe: CraftRecipeDefinition,
  caveName: string | undefined,
): CraftRecipeView {
  const caveLevel = state.cave ? buildingLevel(state.cave, recipe.buildingId) : 0
  const readyAt = state.player.craftCooldowns[recipe.id] ?? 0
  const cooldownRemaining = Math.max(0, readyAt - state.clock.elapsedMonths)
  const rank = professionRankOf(state.player, recipe.discipline)
  const blockers = recipeBlockers(state, recipe, caveLevel, cooldownRemaining)
  return {
    definition: recipe,
    buildingName: caveName ?? '洞府',
    buildingLevel: caveLevel,
    buildingReady: caveLevel >= recipe.requiredBuildingLevel,
    rank: rank.rank,
    rankName: rank.name,
    rankReady: rank.rank >= recipe.requiredRank,
    cooldownRemaining,
    costs: Object.entries(recipe.cost).map(([key, amount]) => ({
      key: key as ResourceKey,
      need: amount ?? 0,
      have: state.player.resources[key as ResourceKey] ?? 0,
      ready: (state.player.resources[key as ResourceKey] ?? 0) >= (amount ?? 0),
    })),
    materials: recipe.items.map((entry) => {
      const have = state.player.inventory[entry.itemId] ?? 0
      const item = registry.getItem(entry.itemId)
      return {
        itemId: entry.itemId,
        name: item?.name ?? '无名材料',
        need: entry.count,
        have,
        ready: have >= entry.count,
        source: item?.category === 'material' ? item.source : undefined,
        description: item?.description,
      }
    }),
    outputText: outputText(recipe.output, registry),
    qualityChance: craftQualityChance(state, registry, recipe.discipline),
    blockers,
    canCraft: blockers.length === 0,
  }
}

export function professionViews(
  state: GameSaveData,
  registry: ContentRegistry,
): ProfessionView[] {
  const cave = state.cave
  const definition = caveDefinition(state, registry)
  return (['alchemy', 'forging'] as const).map((discipline) => {
    const rank = professionRankOf(state.player, discipline)
    const next = nextProfessionRank(rank.at)
    const stateEntry = state.player.professions?.[discipline] ?? { proficiency: 0, crafts: 0 }
    return {
      discipline,
      label: PROFESSION_LABELS[discipline],
      proficiency: stateEntry.proficiency,
      rank: rank.rank,
      rankName: rank.name,
      rankPassive: DISCIPLINE_PASSIVES[discipline][rank.rank] ?? rank.passive,
      crafts: stateEntry.crafts,
      nextRankName: next?.name,
      nextRankAt: next?.at,
      recipes: [...registry.craftRecipes.values()]
        .filter((recipe) => recipe.discipline === discipline)
        .map((recipe) => {
          const building = cave && definition
            ? definition.buildings.find((entry) => entry.id === recipe.buildingId)
            : undefined
          return recipeView(state, registry, recipe, building?.name)
        }),
    }
  })
}

export interface CraftResult {
  ok: boolean
  state: GameSaveData
  message: string
  quality: number
}

function fail(state: GameSaveData, message: string): CraftResult {
  return { ok: false, state, message, quality: 0 }
}

export function craftRecipe(
  state: GameSaveData,
  recipeId: CraftRecipeId,
  registry: ContentRegistry,
): CraftResult {
  const recipe = registry.craftRecipes.get(recipeId)
  if (!recipe) return fail(state, '这份配方并不存在。')
  if (!state.cave) return fail(state, '尚未寻得洞府，无处开炉。')
  const cave = caveDefinition(state, registry)
  if (!cave) return fail(state, '洞府的样子已经模糊，无法开炉。')
  const level = buildingLevel(state.cave, recipe.buildingId)
  if (level < recipe.requiredBuildingLevel) {
    return fail(state, `建筑需达到 ${recipe.requiredBuildingLevel} 级才能开这一炉。`)
  }
  const rank = professionRankOf(state.player, recipe.discipline)
  if (rank.rank < recipe.requiredRank) {
    return fail(
      state,
      `${PROFESSION_LABELS[recipe.discipline]}需至${PROFESSION_RANKS[recipe.requiredRank]?.name ?? '更高阶'}。`,
    )
  }
  const readyAt = state.player.craftCooldowns[recipe.id] ?? 0
  if (state.clock.elapsedMonths < readyAt) {
    return fail(state, `炉温未冷，还需 ${Math.ceil(readyAt - state.clock.elapsedMonths)} 个月。`)
  }
  for (const [key, amount] of Object.entries(recipe.cost)) {
    const have = state.player.resources[key as ResourceKey] ?? 0
    if (have < (amount ?? 0)) return fail(state, '资源不足，炉门只能重新合上。')
  }
  for (const entry of recipe.items) {
    if ((state.player.inventory[entry.itemId] ?? 0) < entry.count) {
      return fail(state, '材料不足，强行开炉只会毁了一炉料。')
    }
  }

  const next = cloneGameSaveData(state)
  for (const [key, amount] of Object.entries(recipe.cost)) {
    next.player.resources[key as ResourceKey] -= amount ?? 0
  }
  for (const entry of recipe.items) {
    const remaining = (next.player.inventory[entry.itemId] ?? 0) - entry.count
    if (remaining > 0) next.player.inventory[entry.itemId] = remaining
    else delete next.player.inventory[entry.itemId]
  }

  const rng = Rng.fromState(next.rng)
  const chance = craftQualityChance(next, registry, recipe.discipline)
  const roll = rng.next()
  const quality = roll < chance * 0.22 ? 2 : roll < chance ? 1 : 0
  const qualityNote =
    quality === 2 ? '火候极佳' : quality === 1 ? '火候正好' : '火候平稳'

  let message: string
  if (recipe.output.kind === 'item') {
    const itemName = registry.getItem(recipe.output.itemId)?.name ?? '一炉成药'
    const base =
      recipe.output.countMin === recipe.output.countMax
        ? recipe.output.countMin
        : rng.nextInt(recipe.output.countMin, recipe.output.countMax + 1)
    const extra = recipe.discipline === 'alchemy' ? quality : 0
    const total = base + extra
    next.player.inventory[recipe.output.itemId] =
      (next.player.inventory[recipe.output.itemId] ?? 0) + total
    const extraText =
      extra > 0 ? `，${qualityNote}，多出 ${extra} 枚` : `，${qualityNote}`
    message = `开炉得${itemName} ×${total}${extraText}。`
  } else {
    const qualityBonus =
      recipe.output.qualityBonus +
      quality +
      (professionRankOf(next.player, 'forging').rank >= 3 && quality === 2 ? 1 : 0)
    const gear = grantGeneratedGear(next, rng, {
      tier: recipe.output.tier,
      qualityBonus,
    })
    message = `器成：${gearQualityName(gear)}「${gear.name}」，${qualityNote}。`
  }
  next.rng = rng.getState()

  const profession = professionState(next.player, recipe.discipline)
  profession.proficiency = Math.min(
    PROFESSION_MAX_PROFICIENCY,
    profession.proficiency + recipe.xp,
  )
  profession.crafts += 1
  next.player.craftCooldowns[recipe.id] = next.clock.elapsedMonths + recipe.cooldownMonths

  const building = cave.buildings.find((entry) => entry.id === recipe.buildingId)
  if (next.cave) {
    pushCaveLog(
      next.cave,
      'production',
      `${building?.name ?? '洞府'}${recipe.discipline === 'alchemy' ? '开炉' : '起砧'}：${message}`,
      next.clock.elapsedMonths,
    )
  }
  if (profession.crafts === 1) {
    const chronicleId = `chronicle.craft.${recipe.discipline}`
    if (!next.chronicle.some((entry) => entry.id === chronicleId)) {
      next.chronicle.push({
        id: chronicleId,
        eraId: next.campaign.currentEra,
        title: recipe.discipline === 'alchemy' ? '丹道开炉' : '器道起砧',
        text:
          recipe.discipline === 'alchemy'
            ? `在${building?.name ?? '洞府'}开出第一炉丹，${qualityNote}。`
            : `在${building?.name ?? '洞府'}敲出第一件器，${qualityNote}。`,
        year: calendarFromMonths(next.clock.elapsedMonths).year,
      })
    }
  }

  return { ok: true, state: next, message, quality }
}
