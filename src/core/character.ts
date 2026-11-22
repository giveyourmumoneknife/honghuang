import type {
  Element,
  ItemId,
  MountId,
  PetId,
  RealmId,
  RealmStage,
  ResourceCost,
  TechniqueId,
} from '@/types/common'
import type {
  BloodlineDefinition,
  CharacterOriginDefinition,
  CharacterPhysiqueDefinition,
  CharacterRootDefinition,
  CombatStats,
  TechniqueDefinition,
  TreasureDefinition,
} from '@/types/content'
import type { GameSaveData, PlayerBloodlineState } from '@/types/state'
import type { CombatMods } from '@/types/gear'
import type { ContentRegistry } from '@/data/registry'
import { realmCombatScale } from './balance'
import {
  bodyBalanceInfo,
  bodyPathDefinition,
  bodyStageDefinition,
  bodyStatContribution,
  bloodlineContribution,
  physiqueContribution,
} from './body'
import type { BodyBalanceInfo, BodyPathDefinition, BodyStageDefinition } from './body'
import { daoRealmMilestones, daoStatusMonths } from './dao'
import { evaluateRequirements } from './conditions'
import { activeDivineDefinitions, autoEquipTechnique } from './divine'
import { applyEffects } from './effects'
import { addCombatMods, collectGearBonuses, emptyCombatMods } from './gear'
import { alchemyCooldownReduction } from './professions'
import { Rng } from './rng'
import { cloneGameSaveData } from './state'

export const REALM_SEQUENCE: RealmId[] = [
  'mortal',
  'qi_refining',
  'foundation',
  'golden_core',
]

export const REALM_LABELS: Record<RealmId, string> = {
  mortal: '凡人',
  qi_refining: '炼气',
  foundation: '筑基',
  golden_core: '金丹',
}

export const STAGE_LABELS: Record<RealmStage, string> = {
  1: '初层',
  2: '中层',
  3: '圆满',
}

const BREAKTHROUGH_COSTS: Record<RealmId, [number, number, number]> = {
  mortal: [30, 70, 140],
  qi_refining: [180, 320, 520],
  foundation: [800, 1250, 1800],
  golden_core: [2600, 3600, 4800],
}

const EMPTY_STATS: Required<CombatStats> = {
  health: 0,
  attack: 0,
  defense: 0,
  speed: 0,
  crit: 0,
  spirit: 0,
}

const BASE_STATS: Required<CombatStats> = {
  health: 80,
  attack: 6,
  defense: 3,
  speed: 5,
  crit: 5,
  spirit: 5,
}

export interface CharacterStatSource {
  id: string
  label: string
  kind:
    | 'realm'
    | 'origin'
    | 'root'
    | 'talent'
    | 'gear'
    | 'technique'
    | 'foundation'
    | 'divine'
    | 'mount'
    | 'pet'
    | 'treasure'
    | 'dao'
    | 'physique'
    | 'body'
    | 'bloodline'
  stats: Required<CombatStats>
}

export interface CultivationBreakdown {
  root: number
  physique: number
  path: number
  balance: number
  talent: number
  mods: number
}

export interface CharacterSheet {
  maxHealth: number
  attack: number
  defense: number
  speed: number
  crit: number
  spirit: number
  element?: Element
  cultivationMultiplier: number
  origin?: CharacterOriginDefinition
  root?: CharacterRootDefinition
  physique?: CharacterPhysiqueDefinition
  bodyStage: BodyStageDefinition
  bodyPath: BodyPathDefinition
  bodyBalance: BodyBalanceInfo
  bloodline?: BloodlineDefinition
  bloodlineState?: PlayerBloodlineState
  cultivationBreakdown: CultivationBreakdown
  gearSets: Array<{ name: string; count: number; size: number; activeThresholds: string[] }>
  mods: CombatMods
  baseStats: Required<CombatStats>
  statSources: CharacterStatSource[]
}

export interface BreakthroughInfo {
  atMax: boolean
  nextRealm: RealmId
  nextStage: RealmStage
  label: string
  cost: number
  chance: number
  affordable: boolean
  healthReady: boolean
  /** 法体平衡带来的额外成功率。 */
  balanceBonus: number
  /** 是否已服破境丹；冲关时会被消耗。 */
  aidActive: boolean
}

export const BREAKTHROUGH_AID_STATUS = 'status.longhan.breakthrough_aid'

export interface BreakthroughResult {
  ok: boolean
  success: boolean
  state: GameSaveData
  message: string
  chance: number
}

export interface TechniqueNodeView {
  index: number
  id: string
  name: string
  description: string
  stats?: CombatStats
  costText: string
  unlocked: boolean
  canStudy: boolean
  met: boolean
  unmet: ReturnType<typeof evaluateRequirements>['unmet']
  affordable: boolean
}

export interface TechniqueView {
  definition: TechniqueDefinition
  learned: boolean
  equipped: boolean
  progress: number
  skill?: TechniqueDefinition['skill']
  nodes: TechniqueNodeView[]
}

function addStats(target: Required<CombatStats>, stats?: CombatStats): void {
  if (!stats) return
  for (const key of Object.keys(EMPTY_STATS) as Array<keyof Required<CombatStats>>) {
    const value = stats[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      target[key] += value
    }
  }
}

function fullStats(stats?: CombatStats): Required<CombatStats> {
  const result = { ...EMPTY_STATS }
  addStats(result, stats)
  return result
}

function hasStats(stats: Required<CombatStats>): boolean {
  return Object.values(stats).some((value) => value !== 0)
}

export function treasureTemperLevel(
  state: GameSaveData,
  treasure: TreasureDefinition,
): number {
  const raw = Math.floor(state.player.treasureTemper[treasure.id] ?? 0)
  return Math.max(0, Math.min(treasure.tempering.length, raw))
}

export function treasureTemperStats(
  treasure: TreasureDefinition,
  level: number,
): CombatStats {
  const stats: Required<CombatStats> = { ...EMPTY_STATS }
  for (const stage of treasure.tempering) {
    if (stage.stage <= level) addStats(stats, stage.stats)
  }
  return stats
}

export function treasureEffectiveStats(
  treasure: TreasureDefinition,
  level: number,
): CombatStats {
  const stats: Required<CombatStats> = {
    ...EMPTY_STATS,
    ...treasureTemperStats(treasure, level),
  }
  addStats(stats, treasure.passiveStats)
  return stats
}

export function treasureActiveCooldown(
  treasure: TreasureDefinition,
  level: number,
): number {
  const reduction = treasure.tempering
    .filter((stage) => stage.stage <= level)
    .reduce((sum, stage) => sum + stage.cooldownReduction, 0)
  return Math.max(2, 6 - reduction)
}

function hasResources(state: GameSaveData, cost: ResourceCost | undefined): boolean {
  if (!cost) return true
  return Object.entries(cost).every(([key, amount]) => {
    if (typeof amount !== 'number' || amount <= 0) return true
    return (state.player.resources[key as keyof typeof state.player.resources] ?? 0) >= amount
  })
}

function deductResources(state: GameSaveData, cost: ResourceCost | undefined): void {
  if (!cost) return
  for (const [key, amount] of Object.entries(cost)) {
    if (typeof amount !== 'number' || amount <= 0) continue
    const resource = key as keyof typeof state.player.resources
    state.player.resources[resource] = Math.max(
      0,
      (state.player.resources[resource] ?? 0) - amount,
    )
  }
}

export function characterElement(state: GameSaveData, registry: ContentRegistry): Element | undefined {
  return registry.roots.get(state.player.rootId)?.element
}

export function computeCharacterSheet(
  state: GameSaveData,
  registry: ContentRegistry,
): CharacterSheet {
  const player = state.player
  const stats: Required<CombatStats> = { ...EMPTY_STATS }
  const mods = emptyCombatMods()
  const statSources: CharacterStatSource[] = []
  const addSource = (
    id: string,
    label: string,
    kind: CharacterStatSource['kind'],
    raw?: CombatStats,
  ) => {
    const normalized = fullStats(raw)
    if (!hasStats(normalized)) return
    addStats(stats, normalized)
    statSources.push({ id, label, kind, stats: normalized })
  }
  const realmScale = realmCombatScale(player.realm, player.stage)
  if (realmScale > 1) {
    const rootScale = Math.sqrt(realmScale)
    addSource(
      'realm.base',
      `境界 · ${REALM_LABELS[player.realm]}${STAGE_LABELS[player.stage]}`,
      'realm',
      {
        health: Math.round(BASE_STATS.health * (realmScale - 1)),
        attack: Math.round(BASE_STATS.attack * (realmScale - 1)),
        defense: Math.round(BASE_STATS.defense * (realmScale - 1)),
        speed: Math.round(4 * (rootScale - 1)),
        crit: Math.round(2 * (rootScale - 1)),
        spirit: Math.round(4 * (realmScale - 1)),
      },
    )
  }

  const origin = registry.origins.get(player.originId)
  const root = registry.roots.get(player.rootId)
  if (origin) addSource(origin.id, `出身 · ${origin.name}`, 'origin', origin.stats)
  if (root) addSource(root.id, `灵根 · ${root.name}`, 'root', root.stats)

  const physique = registry.physiques.get(player.physiqueId)
  const physiqueEffect = physiqueContribution(physique, player.body.stage)
  for (const source of physiqueEffect.sources) {
    addSource(source.id, source.label, 'physique', source.stats)
  }
  addCombatMods(mods, physiqueEffect.mods)

  const bodyEffect = bodyStatContribution(player.body.stage)
  if (bodyEffect.source) {
    addSource(bodyEffect.source.id, bodyEffect.source.label, 'body', bodyEffect.source.stats)
  }

  const bloodlineState = player.bloodline
  const bloodline = bloodlineState ? registry.bloodlines.get(bloodlineState.id) : undefined
  const bloodlineEffect = bloodlineContribution(bloodline, bloodlineState)
  for (const source of bloodlineEffect.sources) {
    addSource(source.id, source.label, 'bloodline', source.stats)
  }
  addCombatMods(mods, bloodlineEffect.mods)

  const bodyPath = bodyPathDefinition(player.body.path)
  const bodyBalance = bodyBalanceInfo(player.body, player.realm, player.stage)
  let talentBonus = 0
  for (const talentId of player.talentIds) {
    const talent = registry.talents.get(talentId)
    if (!talent) continue
    addSource(talent.id, `天赋 · ${talent.name}`, 'talent', talent.stats)
    talentBonus += talent.cultivationBonus ?? 0
  }
  const cultivationBreakdown: CultivationBreakdown = {
    root: root?.cultivationMultiplier ?? 1,
    physique: physique?.cultivationMultiplier ?? 1,
    path: bodyPath.lawMultiplier,
    balance: bodyBalance.cultivationMultiplier,
    talent: talentBonus,
    mods: 0,
  }
  let cultivationMultiplier =
    cultivationBreakdown.root *
    cultivationBreakdown.physique *
    cultivationBreakdown.path *
    cultivationBreakdown.balance
  cultivationMultiplier += talentBonus

  for (const nodeId of player.dao.nodes) {
    const node = registry.daoNodes.get(nodeId)
    if (!node) continue
    addSource(node.id, `道途 · ${node.name}`, 'dao', node.stats)
    addCombatMods(mods, node.mods)
  }
  for (const principleId of player.dao.principles) {
    const principle = registry.daoPrinciples.get(principleId)
    if (!principle) continue
    addSource(principle.id, `道则 · ${principle.name}`, 'dao', principle.stats)
    addCombatMods(mods, principle.mods)
  }

  const gearBonuses = collectGearBonuses(player)
  addSource('gear.equipped', '着身器物', 'gear', gearBonuses.stats)
  addCombatMods(mods, gearBonuses.mods)
  const gearSets = gearBonuses.sets.map((set) => ({
    name: set.rule.name,
    count: set.count,
    size: set.rule.size,
    activeThresholds: set.activeThresholds,
  }))

  for (const techniqueId of player.techniqueIds) {
    const technique = registry.techniques.get(techniqueId)
    if (!technique) continue
    const completed = player.techniqueProgress[techniqueId] ?? 0
    const techniqueStats: Required<CombatStats> = { ...EMPTY_STATS }
    technique.nodes.slice(0, completed).forEach((node) => addStats(techniqueStats, node.stats))
    addSource(techniqueId, `功法 · ${technique.name}`, 'technique', techniqueStats)
  }

  addSource(
    'foundation.tempered',
    '根基 · 后天淬炼',
    'foundation',
    player.foundation,
  )

  for (const ability of activeDivineDefinitions(state, registry)) {
    addSource(ability.id, `神通 · ${ability.name}`, 'divine', ability.passiveStats)
  }

  const mountId = player.activeMountId
  if (mountId) {
    const mount = registry.mounts.get(mountId)
    const stageIndex = Math.max(1, Math.min(mount?.stages.length ?? 1, player.mountStages[mountId] ?? 1))
    const stage = mount?.stages.find((entry) => entry.stage === stageIndex)
    if (mount) addSource(mount.id, `坐骑 · ${mount.name}`, 'mount', stage?.stats)
  }

  const petId = player.activePetId
  if (petId) {
    const pet = registry.pets.get(petId)
    const evolutionIndex = Math.max(1, Math.min(pet?.evolutions.length ?? 1, player.petEvolutions[petId] ?? 1))
    if (pet) {
      addSource(
        pet.id,
        `灵宠 · ${pet.name}`,
        'pet',
        pet.evolutions[evolutionIndex - 1]?.stats,
      )
    }
  }

  const treasure = player.activeTreasureId
    ? registry.treasures.get(player.activeTreasureId)
    : undefined
  if (treasure) {
    addSource(
      treasure.id,
      `法宝 · ${treasure.name}`,
      'treasure',
      treasureEffectiveStats(treasure, treasureTemperLevel(state, treasure)),
    )
  }

  cultivationBreakdown.mods = mods.cultivation

  return {
    maxHealth: Math.max(1, Math.round(BASE_STATS.health + stats.health)),
    attack: Math.max(1, Math.round(BASE_STATS.attack + stats.attack)),
    defense: Math.max(0, Math.round(BASE_STATS.defense + stats.defense)),
    speed: Math.max(1, Math.round(BASE_STATS.speed + stats.speed)),
    crit: Math.max(0, Math.min(80, Math.round(BASE_STATS.crit + stats.crit))),
    spirit: Math.max(1, Math.round(BASE_STATS.spirit + stats.spirit)),
    element: root?.element,
    cultivationMultiplier: Math.max(
      0.1,
      cultivationMultiplier * (1 + Math.max(0, mods.cultivation)),
    ),
    origin,
    root,
    physique,
    bodyStage: bodyStageDefinition(player.body.stage),
    bodyPath,
    bodyBalance,
    bloodline,
    bloodlineState,
    cultivationBreakdown,
    gearSets,
    mods,
    baseStats: { ...BASE_STATS },
    statSources,
  }
}

export function breakthroughInfo(
  state: GameSaveData,
  registry: ContentRegistry,
): BreakthroughInfo {
  const player = state.player
  const realmIndex = REALM_SEQUENCE.indexOf(player.realm)
  const atMax = realmIndex === REALM_SEQUENCE.length - 1 && player.stage >= 3
  if (atMax) {
    return {
      atMax: true,
      nextRealm: player.realm,
      nextStage: 3,
      label: '此世已无更高境界',
      cost: 0,
      chance: 0,
      affordable: false,
      healthReady: true,
      balanceBonus: 0,
      aidActive: false,
    }
  }

  const nextRealm = player.stage < 3 ? player.realm : REALM_SEQUENCE[realmIndex + 1]
  const nextStage = (player.stage < 3 ? player.stage + 1 : 1) as RealmStage
  const cost = BREAKTHROUGH_COSTS[player.realm][player.stage - 1]
  const sheet = computeCharacterSheet(state, registry)
  const healthRatio = Math.max(0, Math.min(1, player.health / sheet.maxHealth))
  const aidActive = player.statuses.some((status) => status.id === BREAKTHROUGH_AID_STATUS)
  const balanceBonus = sheet.bodyBalance.lawBreakthroughBonus
  const chance = Math.max(
    0.35,
    Math.min(
      0.95,
      0.72 +
        realmIndex * 0.03 -
        player.stage * 0.06 +
        Math.min(0.12, sheet.spirit * 0.004) +
        healthRatio * 0.08 +
        balanceBonus +
        (aidActive ? 0.12 : 0),
    ),
  )

  return {
    atMax: false,
    nextRealm,
    nextStage,
    label: `${REALM_LABELS[nextRealm]} ${STAGE_LABELS[nextStage]}`,
    cost,
    chance,
    affordable: player.cultivation >= cost,
    healthReady: healthRatio >= 0.55,
    balanceBonus,
    aidActive,
  }
}

export function attemptBreakthrough(
  state: GameSaveData,
  registry: ContentRegistry,
): BreakthroughResult {
  const info = breakthroughInfo(state, registry)
  if (info.atMax) {
    return { ok: false, success: false, state, message: '金丹圆满已是此世顶点。', chance: 0 }
  }
  if (!info.affordable) {
    return {
      ok: false,
      success: false,
      state,
      message: `修为还差 ${Math.ceil(info.cost - state.player.cultivation)}，此时冲关只会伤了根基。`,
      chance: info.chance,
    }
  }
  if (!info.healthReady) {
    return {
      ok: false,
      success: false,
      state,
      message: '气血未复，强行冲关九死一生。先调息再说。',
      chance: info.chance,
    }
  }

  const next = cloneGameSaveData(state)
  next.player.statuses = next.player.statuses.filter(
    (status) => status.id !== BREAKTHROUGH_AID_STATUS,
  )
  const rng = Rng.fromState(next.rng)
  const roll = rng.next()
  next.rng = rng.getState()
  const success = roll < info.chance
  next.player.cultivation -= info.cost
  const milestoneBefore = daoRealmMilestones(state.player.realm, state.player.stage)

  if (success) {
    next.player.realm = info.nextRealm
    next.player.stage = info.nextStage
    const sheet = computeCharacterSheet(next, registry)
    next.player.health = sheet.maxHealth
    const milestoneGain = Math.max(
      0,
      daoRealmMilestones(next.player.realm, next.player.stage) - milestoneBefore,
    )
    if (milestoneGain > 0) {
      next.player.dao.marks += milestoneGain
      next.player.dao.earned += milestoneGain
    }
    return {
      ok: true,
      success: true,
      state: next,
      message: `冲关成功，境界落定于${info.label}。${info.aidActive ? ' 破境丹在最后一刻稳住了经脉。' : ''}${milestoneGain > 0 ? ` 星图感应，星痕 +${milestoneGain}。` : ''}`,
      chance: info.chance,
    }
  }

  const loss = Math.floor(info.cost * 0.35)
  next.player.cultivation = Math.max(0, next.player.cultivation - loss)
  next.player.health = Math.max(1, Math.floor(next.player.health * 0.6))
  const existing = next.player.statuses.find((status) => status.id === 'status.breakthrough.backlash')
  const status = {
    id: 'status.breakthrough.backlash',
    monthsRemaining: daoStatusMonths(next, 'status.breakthrough.backlash', 3),
    source: '冲关反噬',
  }
  if (existing) Object.assign(existing, status)
  else next.player.statuses.push(status)

  return {
    ok: true,
    success: false,
    state: next,
    message: `冲关失手，修为散去 ${loss}，气血受损。需静养三月再试。${info.aidActive ? ' 破境丹药力已散。' : ''}`,
    chance: info.chance,
  }
}

export function techniqueViews(
  state: GameSaveData,
  registry: ContentRegistry,
): TechniqueView[] {
  return [...registry.techniques.values()]
    .filter((technique) => technique.tier <= 4)
    .sort((left, right) => left.tier - right.tier)
    .map((definition) => {
      const learned = state.player.techniqueIds.includes(definition.id)
      const progress = state.player.techniqueProgress[definition.id] ?? 0
      const nodes = definition.nodes.map((node, index) => {
        const unlocked = progress > index
        const requirement = evaluateRequirements(state, node.requirements)
        const cost = node.cost ?? { cultivation: 0 }
        const affordable =
          state.player.cultivation >= cost.cultivation &&
          (state.player.resources.spirit_stones ?? 0) >= (cost.spiritStones ?? 0)
        return {
          index,
          id: node.id,
          name: node.name,
          description: node.description,
          stats: node.stats,
          costText: `${cost.cultivation} 修为${cost.spiritStones ? ` · ${cost.spiritStones} 灵石` : ''}`,
          unlocked,
          canStudy:
            learned &&
            !unlocked &&
            progress === index &&
            requirement.ok &&
            affordable,
          met: requirement.ok,
          unmet: requirement.unmet,
          affordable,
        }
      })
      return {
        definition,
        learned,
        equipped: state.player.equippedTechniqueIds.includes(definition.id),
        progress,
        skill: definition.skill,
        nodes,
      }
    })
}

export type CharacterActionResult =
  | { ok: true; state: GameSaveData; message: string }
  | { ok: false; state: GameSaveData; message: string }

function fail(state: GameSaveData, message: string): CharacterActionResult {
  return { ok: false, state, message }
}

function succeed(state: GameSaveData, message: string): CharacterActionResult {
  return { ok: true, state, message }
}

export function learnTechnique(
  state: GameSaveData,
  techniqueId: TechniqueId,
  registry: ContentRegistry,
): CharacterActionResult {
  if (!registry.techniques.has(techniqueId)) return fail(state, '此处没有这门功法。')
  if (state.player.techniqueIds.includes(techniqueId)) return fail(state, '你已记住这门功法。')
  const next = cloneGameSaveData(state)
  next.player.techniqueIds.push(techniqueId)
  next.player.techniqueProgress[techniqueId] = 0
  autoEquipTechnique(next.player, techniqueId)
  return succeed(next, `功法入门：${registry.techniques.get(techniqueId)?.name ?? '无名功法'}`)
}

export function studyTechniqueNode(
  state: GameSaveData,
  techniqueId: TechniqueId,
  nodeIndex: number,
  registry: ContentRegistry,
): CharacterActionResult {
  const technique = registry.techniques.get(techniqueId)
  if (!technique) return fail(state, '这门功法并不存在。')
  if (!state.player.techniqueIds.includes(techniqueId)) return fail(state, '先入门，再谈参悟。')
  const node = technique.nodes[nodeIndex]
  if (!node) return fail(state, '没有这一层心法。')
  const progress = state.player.techniqueProgress[techniqueId] ?? 0
  if (progress > nodeIndex) return fail(state, '这一层已经参透。')
  if (progress < nodeIndex) return fail(state, '前一层尚未参透。')

  const requirement = evaluateRequirements(state, node.requirements)
  if (!requirement.ok) return fail(state, '境界未到，强行参悟只会伤神。')
  const cost = node.cost ?? { cultivation: 0 }
  if (state.player.cultivation < cost.cultivation) {
    return fail(state, `修为不足，还差 ${Math.ceil(cost.cultivation - state.player.cultivation)}。`)
  }
  if ((state.player.resources.spirit_stones ?? 0) < (cost.spiritStones ?? 0)) {
    return fail(state, '灵石不足，静室里的灯也点不长久。')
  }

  const next = cloneGameSaveData(state)
  next.player.cultivation -= cost.cultivation
  next.player.resources.spirit_stones -= cost.spiritStones ?? 0
  next.player.techniqueProgress[techniqueId] = nodeIndex + 1
  return succeed(next, `参透「${node.name}」。`)
}

export function useConsumableItem(
  state: GameSaveData,
  itemId: ItemId,
  registry: ContentRegistry,
): CharacterActionResult {
  const item = registry.items.get(itemId)
  if (!item || item.category !== 'consumable') return fail(state, '这不是可以服用的东西。')
  if ((state.player.inventory[itemId] ?? 0) <= 0) return fail(state, '行囊里已经没有它了。')
  const readyAt = state.player.itemCooldowns[itemId] ?? 0
  if (state.clock.elapsedMonths < readyAt) {
    return fail(state, `药性未散，还需 ${Math.ceil(readyAt - state.clock.elapsedMonths)} 个月。`)
  }

  let next = cloneGameSaveData(state)
  next.player.inventory[itemId] = (next.player.inventory[itemId] ?? 0) - 1
  if (next.player.inventory[itemId] <= 0) delete next.player.inventory[itemId]
  next = applyEffects(next, item.effects, { sourceEventId: undefined })
  const cooldown = Math.max(
    1,
    (item.cooldownMonths ?? 1) - alchemyCooldownReduction(next.player),
  )
  next.player.itemCooldowns[itemId] = next.clock.elapsedMonths + cooldown
  return succeed(next, `服下${item.name}。`)
}

export function setActiveTreasure(
  state: GameSaveData,
  treasureId: ItemId | undefined,
): CharacterActionResult {
  if (treasureId && !state.player.treasureIds.includes(treasureId)) {
    return fail(state, '你还没有得到这件法宝。')
  }
  const next = cloneGameSaveData(state)
  if (treasureId) next.player.activeTreasureId = treasureId
  else delete next.player.activeTreasureId
  return succeed(next, treasureId ? '法宝已悬于身侧。' : '你收起了法宝。')
}

export function activateTreasure(
  state: GameSaveData,
  registry: ContentRegistry,
): CharacterActionResult {
  const treasureId = state.player.activeTreasureId
  if (!treasureId) return fail(state, '没有悬在身侧的法宝。')
  const treasure = registry.treasures.get(treasureId)
  if (!treasure) return fail(state, '这件法宝已经失去器灵。')
  const readyAt = state.player.treasureCooldowns[treasureId] ?? 0
  if (state.clock.elapsedMonths < readyAt) {
    return fail(state, `器灵尚未苏醒，还需 ${Math.ceil(readyAt - state.clock.elapsedMonths)} 个月。`)
  }

  let next = cloneGameSaveData(state)
  next = applyEffects(next, treasure.cost.effects, { sourceEventId: undefined })
  next = applyEffects(next, treasure.active.effects, { sourceEventId: undefined })
  const temperLevel = treasureTemperLevel(state, treasure)
  next.player.treasureCooldowns[treasureId] =
    next.clock.elapsedMonths + treasureActiveCooldown(treasure, temperLevel)
  return succeed(next, `${treasure.active.name}：${treasure.active.description}`)
}

export function temperTreasure(
  state: GameSaveData,
  treasureId: ItemId,
  registry: ContentRegistry,
): CharacterActionResult {
  const treasure = registry.treasures.get(treasureId)
  if (!treasure) return fail(state, '这件法宝已经失去器灵。')
  if (!state.player.treasureIds.includes(treasureId)) {
    return fail(state, '你还没有得到这件法宝。')
  }
  const level = treasureTemperLevel(state, treasure)
  const stage = treasure.tempering[level]
  if (!stage) return fail(state, '器灵已温养至尽头。')
  const gate = evaluateRequirements(state, stage.requirements)
  if (!gate.ok) {
    return fail(state, `器灵还不肯进入「${stage.name}」这一层。`)
  }
  if (state.player.cultivation < stage.cultivation) {
    return fail(state, `温养至「${stage.name}」还需 ${Math.ceil(stage.cultivation - state.player.cultivation)} 修为。`)
  }
  if (!hasResources(state, stage.cost)) {
    return fail(state, '温养所需的资材还不够。')
  }

  const next = cloneGameSaveData(state)
  next.player.cultivation -= stage.cultivation
  deductResources(next, stage.cost)
  next.player.treasureTemper[treasureId] = stage.stage
  return succeed(next, `${treasure.name}温养至「${stage.name}」，器灵与你的气息又近了一层。`)
}

export function setActiveMount(
  state: GameSaveData,
  mountId: MountId | undefined,
): CharacterActionResult {
  if (mountId && !state.player.mountIds.includes(mountId)) {
    return fail(state, '你还没有这头坐骑。')
  }
  const next = cloneGameSaveData(state)
  if (mountId) next.player.activeMountId = mountId
  else delete next.player.activeMountId
  return succeed(next, mountId ? '坐骑已候在门外。' : '你让坐骑留在原地。')
}

export function growMount(
  state: GameSaveData,
  mountId: MountId,
  registry: ContentRegistry,
): CharacterActionResult {
  const mount = registry.mounts.get(mountId)
  if (!mount) return fail(state, '没有这头坐骑。')
  const stage = state.player.mountStages[mountId] ?? 1
  if (stage >= mount.stages.length) return fail(state, '这头坐骑已经长到尽头。')
  const nextStage = mount.stages[stage]
  const cultivationCost = 60 * stage
  const stoneCost = 12 * stage
  if (state.player.cultivation < cultivationCost) {
    return fail(state, `坐骑成长需要 ${cultivationCost} 修为。`)
  }
  if ((state.player.resources.spirit_stones ?? 0) < stoneCost) {
    return fail(state, `还差 ${stoneCost} 灵石来养这头坐骑。`)
  }
  const next = cloneGameSaveData(state)
  next.player.cultivation -= cultivationCost
  next.player.resources.spirit_stones -= stoneCost
  next.player.mountStages[mountId] = nextStage.stage
  return succeed(next, `${mount.name}长成「${nextStage.name}」。`)
}

export function setActivePet(
  state: GameSaveData,
  petId: PetId | undefined,
): CharacterActionResult {
  if (petId && !state.player.petIds.includes(petId)) {
    return fail(state, '你还没有这只灵宠。')
  }
  const next = cloneGameSaveData(state)
  if (petId) next.player.activePetId = petId
  else delete next.player.activePetId
  return succeed(next, petId ? '灵宠已跟在你身后。' : '你让灵宠自己待一会儿。')
}

export function evolvePet(
  state: GameSaveData,
  petId: PetId,
  registry: ContentRegistry,
): CharacterActionResult {
  const pet = registry.pets.get(petId)
  if (!pet) return fail(state, '没有这只灵宠。')
  const evolution = state.player.petEvolutions[petId] ?? 1
  if (evolution >= pet.evolutions.length) return fail(state, '它已经走到这一世的尽头。')
  const nextEvolution = pet.evolutions[evolution]
  const cultivationCost = 80 * evolution
  const coreCost = 2 * evolution
  if (state.player.cultivation < cultivationCost) {
    return fail(state, `灵宠蜕变需要 ${cultivationCost} 修为。`)
  }
  if ((state.player.resources.beast_cores ?? 0) < coreCost) {
    return fail(state, `还差 ${coreCost} 枚兽核来喂它。`)
  }
  const next = cloneGameSaveData(state)
  next.player.cultivation -= cultivationCost
  next.player.resources.beast_cores -= coreCost
  next.player.petEvolutions[petId] = evolution + 1
  return succeed(next, `${pet.name}蜕变为「${nextEvolution.name}」。`)
}

export function advanceCharacterTime(
  state: GameSaveData,
  months: number,
  registry: ContentRegistry,
): GameSaveData {
  if (!Number.isFinite(months) || months <= 0) return state
  const sheet = computeCharacterSheet(state, registry)
  const hasStatuses = state.player.statuses.length > 0
  const needsHealing = state.player.health < sheet.maxHealth
  if (!hasStatuses && !needsHealing) return state

  const next = cloneGameSaveData(state)
  if (needsHealing) {
    const regen = Math.max(1, Math.floor(sheet.maxHealth * 0.025 * months))
    next.player.health = Math.min(sheet.maxHealth, next.player.health + regen)
  }
  next.player.statuses = next.player.statuses
    .map((status) => ({ ...status, monthsRemaining: status.monthsRemaining - months }))
    .filter((status) => status.monthsRemaining > 0)
  const newSheet = computeCharacterSheet(next, registry)
  next.player.health = Math.min(newSheet.maxHealth, next.player.health)
  return next
}

export function statusLabel(statusId: string): string {
  const labels: Record<string, string> = {
    'status.breakthrough.backlash': '冲关反噬',
    'status.longhan.clear_mind': '心清',
    'status.longhan.spirit_dryness': '灵机枯竭',
    'status.longhan.first_flame_mark': '初火烙痕',
    'status.longhan.old_tide_dream': '旧潮入梦',
    'status.longhan.ridge_hold': '镇脉',
    'status.longhan.ridge_slowness': '地脉迟滞',
    'status.longhan.raider_wound': '水匪旧伤',
    'status.longhan.crow_pecked': '鸦啄伤',
    'status.longhan.burn_scar': '火灼',
    'status.longhan.vein_corruption': '浊脉',
    'status.longhan.mirror_mind': '镜心',
    'status.longhan.tide_breath': '海息',
    'status.longhan.cave_ward': '回澜',
    'status.longhan.tide_stride': '潮步',
    'status.longhan.pill_breath': '丹息',
    'status.longhan.quiet_room': '静室',
    'status.longhan.bone_chill': '骨寒',
    'status.longhan.cave_damp': '阴湿',
    'status.longhan.deep_pressure': '重渊压身',
    'status.longhan.ember_forgetting': '烬忘',
    'status.longhan.ember_guard': '余烬护心',
    'status.longhan.memory_ash': '忆灰',
    'status.longhan.name_borrowed': '借名',
    'status.longhan.rekindled': '余烬复燃',
    'status.longhan.tide_recovery': '回潮',
    'status.longhan.vein_anchor': '定脉',
    'status.longhan.vein_silence': '脉寂',
    'status.longhan.breakthrough_aid': '破境',
    'status.longhan.body_backlash': '破体旧伤',
    'status.longhan.bloodline_backlash': '血脉反噬',
    'status.prologue.cold_shadow': '寒影',
    'status.prologue.first_stillness': '初静',
    'status.world.karma_touched': '因果沾身',
    'status.world.wayworn': '风尘',
  }
  return labels[statusId] ?? '旧痕'
}

export function statusDescription(statusId: string): string {
  const descriptions: Record<string, string> = {
    'status.breakthrough.backlash':
      '冲关失败后被震伤的经脉，气血亏空。三个月内再强行冲关，身体未必撑得住。',
    'status.longhan.clear_mind':
      '心湖暂时沉了下来，杂念退到远处。做决定时不容易被一时的火气推着走。',
    'status.longhan.spirit_dryness':
      '灵机像被抽走了一层，经脉里空得发响。这是强行引火、动用重宝后的代价，得靠时间慢慢养回来。',
    'status.longhan.first_flame_mark':
      '初火在识海里留下的烙痕。看得见旧事，也容易被旧事看见。',
    'status.longhan.old_tide_dream':
      '潮声在梦里反复。闭眼就是退潮的岸，醒来时常分不清哪一段是梦。',
    'status.longhan.ridge_hold':
      '借地脉之力压住了心神与气血，站得稳、扛得住。但脚像生了根，身法会慢半拍。',
    'status.longhan.ridge_slowness':
      '地脉借走了一部分气力，身体像从很深的水里往上走，反应总慢一线。',
    'status.longhan.raider_wound':
      '水匪留下的旧伤。平时不碍事，遇上湿冷天气或剧烈动手就会隐隐作痛。',
    'status.longhan.crow_pecked':
      '被火山灰里的乌鸦啄伤。伤口不深，却总像有细小的喙在里头翻找东西。',
    'status.longhan.burn_scar':
      '火灼留下的疤。皮肉长好了，可那一块总比别处烫一点，也更怕冷。',
    'status.longhan.vein_corruption':
      '浊气顺着伤处渗进经脉。运转灵机时有一点滞涩，像水底缠了根旧绳。',
    'status.longhan.mirror_mind':
      '照心池照过的后遗。心里偶尔会浮出一个不是自己的念头，转瞬又沉下去。',
    'status.longhan.tide_breath':
      '海息留在肺腑里，呼吸比常人悠长。在水边或潮气重的地方，精神会更好。',
    'status.longhan.cave_ward':
      '洞府回澜阵留在身上的护持。水汽会替你挡掉一点不适，离开洞府后还能撑一阵。',
    'status.longhan.tide_stride':
      '潮步的余韵。落脚比平时轻，赶路不费劲，就是有时会不自觉跟着潮声走。',
    'status.longhan.pill_breath':
      '丹药之力还含在经脉里，气血恢复比平时快。药劲散尽之前，别急着再服第二炉。',
    'status.longhan.quiet_room':
      '在静室里养出来的安定。外头再吵，心里也能留出一小块不出声的地方。',
    'status.longhan.bone_chill':
      '寒气钻进了骨头缝。裹再多层也暖不透，夜里尤其难熬。',
    'status.longhan.cave_damp':
      '洞府深处的阴湿附在关节上。这不是病，只是让人时刻记着地下离你有多近。',
    'status.longhan.deep_pressure':
      '在深渊底下待久了，身上还背着那层看不见的水压。走平地也会觉得脚下发沉。',
    'status.longhan.ember_forgetting':
      '涅槃灯取走了一小段记忆作灯油。你知道自己忘了点什么，却想不起忘的是什么。',
    'status.longhan.ember_guard':
      '余烬护着心口。火已经不旺了，但外来的寒意一时半会儿侵不进去。',
    'status.longhan.memory_ash':
      '一段记忆被烧成了灰，还留在原处。风一吹就会散，碰一下就会疼。',
    'status.longhan.name_borrowed':
      '名字被无字镜借走了一小段。别人叫你时，你偶尔会慢半拍才应。',
    'status.longhan.rekindled':
      '熄灭过的灵机又被点着了。火不大，却足够把冷透的地方一点点烘热。',
    'status.longhan.tide_recovery':
      '潮气回到经脉里，像退去的海水重新漫上来。身体正在自己修补自己。',
    'status.longhan.vein_anchor':
      '七针把那方土地的脉动系在你身上。站定的时候，能借到一点地脉的稳。',
    'status.longhan.vein_silence':
      '地脉暂时不再回应你。脚下明明是土，却像隔着一层很厚的布。',
    'status.longhan.breakthrough_aid':
      '破境丹在经脉里搭起了一段“旧路”。下一次冲关成算 +12%，无论成败，冲关后药力都会散尽。',
    'status.longhan.body_backlash':
      '破体失败后筋骨留下的暗伤。三个月内再冲一次，旧伤会先于新境发作；断血后的虚弱也算在此列。',
    'status.longhan.bloodline_backlash':
      '旧血苏醒失败后留下的躁动。血脉还在，只是暂时不肯再听你调度，三个月内不宜再唤醒。',
    'status.prologue.cold_shadow':
      '初影留下的寒意。影子被你打散了，那股冷还贴在脊背上没退。',
    'status.prologue.first_stillness':
      '初醒时看见潮线的那一刻，心里忽然静下来的感觉。像有人替你把世界的音量拧小了一点。',
    'status.world.karma_touched':
      '在魔渊或混沌之地沾上的因果。你未必做了什么，但有些东西已经记住你了。',
    'status.world.wayworn':
      '长途游历留下的风尘。身体累了，眼界却比出门时宽。',
    'status.world.oath_broken':
      '你主动退出了旧势力，名册上的那个名字已经划掉。旧同门未必翻脸，但再见面总归多一层隔阂。',
  }
  return descriptions[statusId] ?? '一段还没说清的旧事。它会跟着你一阵子，然后自己走。'
}

export function treasureCooldownRemaining(
  state: GameSaveData,
  treasure: TreasureDefinition,
): number {
  return Math.max(0, (state.player.treasureCooldowns[treasure.id] ?? 0) - state.clock.elapsedMonths)
}
