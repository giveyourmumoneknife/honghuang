import type { ContentRegistry } from '@/data/registry'
import type { DivineAbilityDefinition } from '@/types/content'
import type { DivineAbilityId, ItemId, TechniqueId } from '@/types/common'
import type { GameSaveData, PlayerState } from '@/types/state'
import { cloneGameSaveData } from './state'
import { calendarFromMonths } from './time'

export const MAX_EQUIPPED_TECHNIQUES = 3
export const BASE_DIVINE_SLOTS = 1

export interface DivineActionResult {
  ok: boolean
  state: GameSaveData
  message: string
}

function fail(state: GameSaveData, message: string): DivineActionResult {
  return { ok: false, state, message }
}

function succeed(state: GameSaveData, message: string): DivineActionResult {
  return { ok: true, state, message }
}

export function divineActiveSlots(state: GameSaveData): number {
  return BASE_DIVINE_SLOTS + (state.player.realm === 'golden_core' ? 1 : 0)
}

export function isTechniqueMastered(
  player: PlayerState,
  techniqueId: TechniqueId,
  registry: ContentRegistry,
): boolean {
  const technique = registry.techniques.get(techniqueId)
  if (!technique) return false
  return (player.techniqueProgress[techniqueId] ?? 0) >= technique.nodes.length
}

export function defaultTechniqueLoadout(player: PlayerState): TechniqueId[] {
  return player.techniqueIds.slice(0, MAX_EQUIPPED_TECHNIQUES)
}

/**
 * 只保留确实学会的功法，并裁到三个法门位。若老档没有这个字段，
 * 补上已学前几门，避免无声地少掉全部招式。
 */
export function normalizeTechniqueLoadout(player: PlayerState): void {
  if (!Array.isArray(player.equippedTechniqueIds)) {
    player.equippedTechniqueIds = defaultTechniqueLoadout(player)
    return
  }
  const seen = new Set<string>()
  player.equippedTechniqueIds = player.equippedTechniqueIds
    .filter((id) => {
      if (!player.techniqueIds.includes(id) || seen.has(id)) return false
      seen.add(id)
      return true
    })
    .slice(0, MAX_EQUIPPED_TECHNIQUES)
}

export function normalizeDivineLoadout(state: GameSaveData): void {
  const slots = divineActiveSlots(state)
  const seen = new Set<string>()
  state.player.activeDivineIds = (state.player.activeDivineIds ?? [])
    .filter((id) => {
      if (!state.player.divineAbilityIds.includes(id) || seen.has(id)) return false
      seen.add(id)
      return true
    })
    .slice(0, slots)
}

export function autoEquipTechnique(player: PlayerState, techniqueId: TechniqueId): void {
  if (!Array.isArray(player.equippedTechniqueIds)) {
    player.equippedTechniqueIds = []
  }
  if (player.equippedTechniqueIds.includes(techniqueId)) return
  if (player.equippedTechniqueIds.length >= MAX_EQUIPPED_TECHNIQUES) return
  player.equippedTechniqueIds.push(techniqueId)
}

export function equipTechnique(
  state: GameSaveData,
  techniqueId: TechniqueId,
  registry: ContentRegistry,
): DivineActionResult {
  if (!state.player.techniqueIds.includes(techniqueId)) return fail(state, '你还没有学会这门功法。')
  if (!registry.techniques.has(techniqueId)) return fail(state, '这门功法并不存在。')
  if (state.player.equippedTechniqueIds.includes(techniqueId)) {
    return fail(state, '这门功法已经在法门位中。')
  }
  if (state.player.equippedTechniqueIds.length >= MAX_EQUIPPED_TECHNIQUES) {
    return fail(state, '三个法门位已满。先卸下一门，再谈换法。')
  }
  const next = cloneGameSaveData(state)
  next.player.equippedTechniqueIds.push(techniqueId)
  const name = registry.techniques.get(techniqueId)?.name ?? '无名功法'
  return succeed(next, `《${name}》已装入法门位。`)
}

export function unequipTechnique(
  state: GameSaveData,
  techniqueId: TechniqueId,
  registry: ContentRegistry,
): DivineActionResult {
  if (!state.player.equippedTechniqueIds.includes(techniqueId)) {
    return fail(state, '这门功法不在法门位中。')
  }
  const next = cloneGameSaveData(state)
  next.player.equippedTechniqueIds = next.player.equippedTechniqueIds.filter(
    (id) => id !== techniqueId,
  )
  const name = registry.techniques.get(techniqueId)?.name ?? '无名功法'
  return succeed(next, `《${name}》已退出法门位，功法属性仍然保留。`)
}

export interface DivineTechniqueEntry {
  id: TechniqueId
  name: string
  progress: number
  nodeCount: number
  learned: boolean
  mastered: boolean
}

export interface DivineMaterialEntry {
  itemId: ItemId
  name: string
  need: number
  have: number
  ready: boolean
  source?: string
  description?: string
}

export interface DivineAbilityView {
  definition: DivineAbilityDefinition
  techniques: DivineTechniqueEntry[]
  materials: DivineMaterialEntry[]
  collected: boolean
  active: boolean
  activeSlots: number
  passiveActive: boolean
  canFuse: boolean
  blockers: string[]
  cultivationReady: boolean
  stonesReady: boolean
}

function materialEntry(
  state: GameSaveData,
  registry: ContentRegistry,
  itemId: ItemId,
  need: number,
): DivineMaterialEntry {
  const have = state.player.inventory[itemId] ?? 0
  const item = registry.getItem(itemId)
  return {
    itemId,
    name: item?.name ?? '无名材料',
    need,
    have,
    ready: have >= need,
    source: item?.category === 'material' ? item.source : undefined,
    description: item?.description,
  }
}

function abilityBlockers(
  state: GameSaveData,
  registry: ContentRegistry,
  definition: DivineAbilityDefinition,
): string[] {
  const blockers: string[] = []
  if (state.player.divineAbilityIds.includes(definition.id)) {
    blockers.push('此神通已经收录')
  }
  definition.techniqueIds.forEach((techniqueId) => {
    const technique = registry.techniques.get(techniqueId)
    if (!state.player.techniqueIds.includes(techniqueId)) {
      blockers.push(`尚未入门《${technique?.name ?? techniqueId}》`)
      return
    }
    const progress = state.player.techniqueProgress[techniqueId] ?? 0
    const nodes = technique?.nodes.length ?? 0
    if (progress < nodes) {
      blockers.push(`《${technique?.name ?? techniqueId}》尚未圆满（${progress}/${nodes}）`)
    }
  })
  if (state.player.cultivation < definition.cultivation) {
    blockers.push(`修为不足，还差 ${Math.ceil(definition.cultivation - state.player.cultivation)}`)
  }
  const stones = state.player.resources.spirit_stones ?? 0
  if (stones < definition.spiritStones) {
    blockers.push(`灵石不足，还差 ${definition.spiritStones - stones}`)
  }
  definition.items.forEach((entry) => {
    const have = state.player.inventory[entry.itemId] ?? 0
    if (have < entry.count) {
      const name = registry.getItem(entry.itemId)?.name ?? entry.itemId
      blockers.push(`${name}不足，还差 ${entry.count - have}`)
    }
  })
  return blockers
}

export function divineAbilityViews(
  state: GameSaveData,
  registry: ContentRegistry,
): DivineAbilityView[] {
  const activeSlots = divineActiveSlots(state)
  return [...registry.divineAbilities.values()].map((definition) => {
    const collected = state.player.divineAbilityIds.includes(definition.id)
    const active = state.player.activeDivineIds.includes(definition.id)
    const blockers = abilityBlockers(state, registry, definition)
    const techniques = definition.techniqueIds.map((techniqueId) => {
      const technique = registry.techniques.get(techniqueId)
      const progress = state.player.techniqueProgress[techniqueId] ?? 0
      const nodeCount = technique?.nodes.length ?? 0
      return {
        id: techniqueId,
        name: technique?.name ?? techniqueId,
        progress,
        nodeCount,
        learned: state.player.techniqueIds.includes(techniqueId),
        mastered: nodeCount > 0 && progress >= nodeCount,
      }
    })
    return {
      definition,
      techniques,
      materials: definition.items.map((entry) =>
        materialEntry(state, registry, entry.itemId, entry.count),
      ),
      collected,
      active,
      activeSlots,
      passiveActive: active,
      canFuse: blockers.length === 0,
      blockers,
      cultivationReady: state.player.cultivation >= definition.cultivation,
      stonesReady:
        (state.player.resources.spirit_stones ?? 0) >= definition.spiritStones,
    }
  })
}

export function divineSummary(state: GameSaveData, registry: ContentRegistry) {
  const views = divineAbilityViews(state, registry)
  return {
    collected: views.filter((view) => view.collected).length,
    total: views.length,
    active: views.filter((view) => view.active).length,
    slots: divineActiveSlots(state),
  }
}

export function fuseDivineAbility(
  state: GameSaveData,
  abilityId: DivineAbilityId,
  registry: ContentRegistry,
): DivineActionResult {
  const definition = registry.divineAbilities.get(abilityId)
  if (!definition) return fail(state, '这份神通配方并不存在。')
  const blockers = abilityBlockers(state, registry, definition)
  if (blockers.length > 0) return fail(state, blockers[0])

  const next = cloneGameSaveData(state)
  next.player.cultivation -= definition.cultivation
  next.player.resources.spirit_stones -= definition.spiritStones
  definition.items.forEach((entry) => {
    const remaining = (next.player.inventory[entry.itemId] ?? 0) - entry.count
    if (remaining > 0) next.player.inventory[entry.itemId] = remaining
    else delete next.player.inventory[entry.itemId]
  })
  next.player.divineAbilityIds.push(definition.id)

  let activated = false
  if (next.player.activeDivineIds.length < divineActiveSlots(next)) {
    next.player.activeDivineIds.push(definition.id)
    activated = true
  }

  if (!next.chronicle.some((entry) => entry.id === `chronicle.divine.${definition.id}`)) {
    next.chronicle.push({
      id: `chronicle.divine.${definition.id}`,
      eraId: next.campaign.currentEra,
      title: '神通合炼',
      text: `两门功法在静室中合成神通「${definition.name}」：${definition.title}。`,
      year: calendarFromMonths(next.clock.elapsedMonths).year,
    })
  }

  return succeed(
    next,
    activated
      ? `神通已成：${definition.name}，已自行落入活跃位。`
      : `神通已成：${definition.name}。活跃位已满，可在神通页换上一个。`,
  )
}

export function setDivineAbilityActive(
  state: GameSaveData,
  abilityId: DivineAbilityId,
  active: boolean,
  registry: ContentRegistry,
): DivineActionResult {
  if (!state.player.divineAbilityIds.includes(abilityId)) {
    return fail(state, '你还没有收录这份神通。')
  }
  const name = registry.divineAbilities.get(abilityId)?.name ?? '这份神通'
  const currentlyActive = state.player.activeDivineIds.includes(abilityId)
  if (active === currentlyActive) {
    return fail(state, active ? '这份神通已在活跃位。' : '这份神通本来就没有出战。')
  }
  if (active && state.player.activeDivineIds.length >= divineActiveSlots(state)) {
    return fail(state, '活跃位已满。先收一份神通，再让新的出战。')
  }

  const next = cloneGameSaveData(state)
  if (active) next.player.activeDivineIds.push(abilityId)
  else next.player.activeDivineIds = next.player.activeDivineIds.filter((id) => id !== abilityId)
  return succeed(next, active ? `${name}已悬于识海，招式和被动都会生效。` : `${name}已收回识海。`)
}

export function activeDivineDefinitions(
  state: GameSaveData,
  registry: ContentRegistry,
): DivineAbilityDefinition[] {
  return state.player.activeDivineIds.flatMap((id) => {
    if (!state.player.divineAbilityIds.includes(id)) return []
    const definition = registry.divineAbilities.get(id)
    return definition ? [definition] : []
  })
}
