import type {
  DiscipleAssignment,
  ResourceCost,
  ResourceKey,
} from '@/types/common'
import type {
  CaveDefinition,
  CaveDiscipleDefinition,
  CaveProductionChainDefinition,
  CaveRaidDefinition,
  CaveVisitorDefinition,
} from '@/types/content'
import type { Effect } from '@/types/dsl'
import type { CaveState, CaveLogKind, GameSaveData } from '@/types/state'
import type { ContentRegistry } from '@/data/registry'
import { evaluateRequirements } from './conditions'
import { daoProductionRules } from './dao'
import { applyEffects } from './effects'
import { Rng } from './rng'
import { cloneGameSaveData } from './state'

export const VISITOR_STAY_MONTHS = 4
const TRUST_TICK_MONTHS = 6
export const TRUST_MAX = 6
export const CAVE_LOG_LIMIT = 40

export const ASSIGNMENT_TEXT: Record<DiscipleAssignment, string> = {
  study: '研读',
  gather: '采集',
  guard: '守夜',
  craft: '研磨',
  tend: '养脉',
}

export interface ExpertiseRank {
  /** 达到此级所需的差事月数。 */
  months: number
  name: string
  bonus: number
}

export const EXPERTISE_RANKS: ExpertiseRank[] = [
  { months: 0, name: '初习', bonus: 0 },
  { months: 4, name: '熟手', bonus: 0.12 },
  { months: 12, name: '专精', bonus: 0.28 },
  { months: 30, name: '心传', bonus: 0.48 },
]

export function expertiseMonths(
  cave: CaveState,
  discipleId: string,
  assignment: DiscipleAssignment,
): number {
  const entry = cave.discipleExpertise?.[discipleId]?.[assignment] ?? 0
  return Number.isFinite(entry) ? Math.max(0, entry) : 0
}

export function expertiseRank(months: number): ExpertiseRank {
  let current = EXPERTISE_RANKS[0]
  for (const rank of EXPERTISE_RANKS) {
    if (months >= rank.months) current = rank
  }
  return current
}

export function nextExpertiseRank(months: number): ExpertiseRank | undefined {
  return EXPERTISE_RANKS.find((rank) => rank.months > months)
}

export function discipleAssignmentPower(
  cave: CaveState,
  disciple: CaveDiscipleDefinition,
  assignment: DiscipleAssignment,
): number {
  const aptitudeBonus = disciple.aptitude === assignment ? 0.15 : 0
  const rank = expertiseRank(expertiseMonths(cave, disciple.id, assignment))
  return 1 + aptitudeBonus + rank.bonus
}

export interface CaveProduction {
  cultivationPerMonth: number
  resources: Partial<Record<ResourceKey, number>>
  travelPerMonth: number
  defense: number
  purityFactor: number
}

export interface CaveActionResult {
  ok: boolean
  state: GameSaveData
  message: string
}

function fail(state: GameSaveData, message: string): CaveActionResult {
  return { ok: false, state, message }
}

function succeed(state: GameSaveData, message: string): CaveActionResult {
  return { ok: true, state, message }
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function caveDefinition(
  state: GameSaveData,
  registry: ContentRegistry,
): CaveDefinition | undefined {
  return state.cave ? registry.caves.get(state.cave.id) : undefined
}

export function buildingLevel(cave: CaveState, buildingId: string): number {
  return cave.buildings[buildingId] ?? 0
}

export function discipleAssignment(
  cave: CaveState,
  disciple: CaveDiscipleDefinition,
): DiscipleAssignment {
  return cave.discipleAssignments[disciple.id] ?? disciple.aptitude
}

export function caveProduction(
  state: GameSaveData,
  registry: ContentRegistry,
): CaveProduction {
  const cave = state.cave
  const definition = caveDefinition(state, registry)
  if (!cave) {
    return {
      cultivationPerMonth: 0,
      resources: {},
      travelPerMonth: 0,
      defense: 0,
      purityFactor: 1,
    }
  }

  const level = (id: string) => buildingLevel(cave, id)
  const vein = cave.spiritVeinLevel
  const arrayLevel = level('building.longhan.tide_array')
  const loftLevel = level('building.longhan.tide_loft')
  const gardenLevel = level('building.longhan.herb_garden')
  const alchemyLevel = level('building.longhan.alchemy')
  const forgeLevel = level('building.longhan.forge')
  const meditationLevel = level('building.longhan.meditation')
  const penLevel = level('building.longhan.beast_pen')
  const storeLevel = level('building.longhan.storehouse')
  const purityFactor = 0.75 + (cave.purity / 100) * 0.45

  let stones = 0.6 + arrayLevel * 0.2 + alchemyLevel * 0.08 + storeLevel * 0.26 + vein * 0.16
  let herbs = 0.12 + gardenLevel * 0.3 + vein * 0.05
  let ore = 0.03 + forgeLevel * 0.13 + vein * 0.02
  let cores = penLevel * 0.07 + vein * 0.01
  let cultivation = 0.35 + arrayLevel * 0.22 + meditationLevel * 0.26 + vein * 0.04
  let defense = arrayLevel * 1.2 + Math.max(0, vein - 1) * 0.6 + penLevel * 0.8

  for (const discipleId of cave.discipleIds) {
    const disciple = definition?.disciples.find((entry) => entry.id === discipleId)
    if (!disciple) continue
    const assignment = discipleAssignment(cave, disciple)
    const trust = cave.discipleTrust[discipleId] ?? 0
    const power = discipleAssignmentPower(cave, disciple, assignment)
    if (assignment === 'study') cultivation += (0.2 + trust * 0.03) * power
    if (assignment === 'gather') {
      herbs += (0.26 + trust * 0.03) * power
      stones += 0.08 * power
    }
    if (assignment === 'craft') {
      stones += (0.18 + trust * 0.02) * power
      ore += 0.06 * power
    }
    if (assignment === 'guard') defense += (3 + trust * 0.4) * power
    if (assignment === 'tend') {
      cultivation += (0.1 + trust * 0.02) * power
      herbs += (0.08 + trust * 0.01) * power
    }
  }

  const storeMultiplier =
    (1 + storeLevel * 0.08 + Math.max(0, vein - 1) * 0.04) * purityFactor
  return {
    cultivationPerMonth: round(cultivation * purityFactor, 2),
    resources: {
      spirit_stones: round(stones * storeMultiplier),
      spirit_herbs: round(herbs * storeMultiplier),
      ore: round(ore * storeMultiplier),
      beast_cores: round(cores * storeMultiplier),
    },
    travelPerMonth: round(loftLevel * 0.8, 2),
    defense: Math.round(defense * purityFactor),
    purityFactor: round(purityFactor, 3),
  }
}

export type CaveChainStatus =
  | 'unlinked'
  | 'off'
  | 'running'
  | 'no_tide'
  | 'no_inputs'
  | 'no_purity'

export interface CaveTideState {
  tide: number
  cap: number
  perMonth: number
  purityFactor: number
}

export interface CaveChainState {
  definition: CaveProductionChainDefinition
  linked: boolean
  enabled: boolean
  status: CaveChainStatus
  buildingLevels: [number, number]
  efficiency: number
  progress: number
  intervalMonths: number
  remainingMonths: number
  disciples: number
  missing: ResourceCost
}

function chainLevels(
  cave: CaveState,
  chain: CaveProductionChainDefinition,
): [number, number] {
  return [
    buildingLevel(cave, chain.buildingIds[0]),
    buildingLevel(cave, chain.buildingIds[1]),
  ]
}

function chainEfficiency(
  cave: CaveState,
  definition: CaveDefinition,
  chain: CaveProductionChainDefinition,
): number {
  const [first, second] = chainLevels(cave, chain)
  if (first < 1 || second < 1) return 0
  const storeLevel = buildingLevel(cave, 'building.longhan.storehouse')
  const loftLevel = buildingLevel(cave, 'building.longhan.tide_loft')
  const purityFactor = 0.75 + (cave.purity / 100) * 0.45
  let bonus = 1
  bonus += Math.max(0, first - 1) * 0.1
  bonus += Math.max(0, second - 1) * 0.1
  bonus += storeLevel * 0.05
  bonus += loftLevel * 0.03
  bonus += cave.spiritVeinLevel * 0.03

  for (const discipleId of cave.discipleIds) {
    const disciple = definition.disciples.find((entry) => entry.id === discipleId)
    if (!disciple) continue
    const assignment = discipleAssignment(cave, disciple)
    if (!chain.assignments.includes(assignment)) continue
    const trust = cave.discipleTrust[discipleId] ?? 0
    const power = discipleAssignmentPower(cave, disciple, assignment)
    bonus += 0.04 + trust * 0.01 + Math.max(0, power - 1) * 0.12
  }

  return round(Math.min(3, bonus * purityFactor), 2)
}

function resourceShortfall(
  resources: Partial<Record<ResourceKey, number>>,
  cost: ResourceCost | undefined,
): ResourceCost {
  const missing: ResourceCost = {}
  if (!cost) return missing
  for (const [key, amount] of Object.entries(cost)) {
    if (typeof amount !== 'number' || amount <= 0) continue
    const resource = key as ResourceKey
    const diff = amount - (resources[resource] ?? 0)
    if (diff > 0.0001) missing[resource] = round(diff, 2)
  }
  return missing
}

export function caveTideState(
  state: GameSaveData,
  registry: ContentRegistry,
): CaveTideState {
  const cave = state.cave
  const definition = caveDefinition(state, registry)
  if (!cave || !definition) {
    return { tide: 0, cap: 0, perMonth: 0, purityFactor: 1 }
  }
  const arrayLevel = buildingLevel(cave, 'building.longhan.tide_array')
  const storeLevel = buildingLevel(cave, 'building.longhan.storehouse')
  const loftLevel = buildingLevel(cave, 'building.longhan.tide_loft')
  const vein = cave.spiritVeinLevel
  const purityFactor = 0.75 + (cave.purity / 100) * 0.45
  const daoRules = daoProductionRules(state)
  const cap =
    6 +
    arrayLevel * 4 +
    storeLevel * 5 +
    vein * 2 +
    loftLevel * 1 +
    daoRules.tideCapBonus
  const perMonth =
    (1.4 + arrayLevel * 1.0 + vein * 0.5 + loftLevel * 0.12) * purityFactor +
    daoRules.tidePerMonthBonus
  return {
    tide: round(cave.tide ?? 0, 2),
    cap,
    perMonth: round(perMonth, 2),
    purityFactor: round(purityFactor, 3),
  }
}

export function caveChainStates(
  state: GameSaveData,
  registry: ContentRegistry,
): CaveChainState[] {
  const cave = state.cave
  const definition = caveDefinition(state, registry)
  if (!cave || !definition) return []
  const tide = caveTideState(state, registry)
  const daoRules = daoProductionRules(state)
  let simulatedTide = Math.min(tide.cap, tide.tide + tide.perMonth)
  let simulatedPurity = cave.purity

  return definition.chains.map((chain) => {
    const levels = chainLevels(cave, chain)
    const linked = levels[0] >= 1 && levels[1] >= 1
    const enabled = cave.chainEnabled?.[chain.id] !== false
    const progress = round(cave.chainProgress?.[chain.id] ?? 0, 2)
    const intervalMonths = Math.max(1, chain.intervalMonths)
    const missing = resourceShortfall(state.player.resources, chain.inputs)
    const efficiency = linked ? chainEfficiency(cave, definition, chain) : 0
    let disciples = 0
    for (const discipleId of cave.discipleIds) {
      const disciple = definition.disciples.find((entry) => entry.id === discipleId)
      if (disciple && chain.assignments.includes(discipleAssignment(cave, disciple))) {
        disciples += 1
      }
    }

    let status: CaveChainStatus = 'running'
    if (!linked) {
      status = 'unlinked'
    } else if (!enabled) {
      status = 'off'
    } else if (
      progress >= intervalMonths - 0.0001 &&
      Object.keys(missing).length > 0
    ) {
      status = 'no_inputs'
    } else if (
      chain.purityPerMonth < 0 &&
      simulatedPurity < daoRules.noPurityFloor
    ) {
      status = 'no_purity'
    } else if (simulatedTide + 0.0001 < chain.tidePerMonth) {
      status = 'no_tide'
    } else {
      simulatedTide = Math.max(0, simulatedTide - chain.tidePerMonth)
      const purityDelta =
        chain.purityPerMonth < 0
          ? chain.purityPerMonth * daoRules.purityLossMultiplier
          : chain.purityPerMonth
      simulatedPurity = Math.max(0, Math.min(100, simulatedPurity + purityDelta))
    }

    const remainingMonths =
      status === 'running'
        ? Math.max(
            1,
            Math.ceil(
              (intervalMonths - progress) / Math.max(0.05, efficiency),
            ),
          )
        : 0

    return {
      definition: chain,
      linked,
      enabled,
      status,
      buildingLevels: levels,
      efficiency,
      progress,
      intervalMonths,
      remainingMonths,
      disciples,
      missing,
    }
  })
}

export function toggleCaveChain(
  state: GameSaveData,
  chainId: string,
  registry: ContentRegistry,
  enabled?: boolean,
): CaveActionResult {
  const definition = caveDefinition(state, registry)
  const chain = definition?.chains.find((entry) => entry.id === chainId)
  if (!definition || !chain) return fail(state, '这条生产链不存在。')
  const next = cloneGameSaveData(state)
  if (!next.cave) return fail(state, '还没有洞府可以运转。')
  next.cave.chainEnabled ??= {}
  const target = enabled ?? next.cave.chainEnabled[chainId] === false
  next.cave.chainEnabled[chainId] = target
  return succeed(
    next,
    target ? `${chain.name}重新开炉。` : `${chain.name}停炉，已完成的进度会留着。`,
  )
}

function applyChainOutputs(
  state: GameSaveData,
  effects: readonly Effect[],
  efficiency: number,
): void {
  for (const effect of effects) {
    switch (effect.kind) {
      case 'changeResource': {
        const current = state.player.resources[effect.resource] ?? 0
        state.player.resources[effect.resource] = Math.max(
          0,
          current + effect.amount * efficiency,
        )
        break
      }
      case 'gainCultivation':
        state.player.cultivation = Math.max(
          0,
          state.player.cultivation + effect.amount * efficiency,
        )
        break
      case 'grantItem': {
        const count = Math.max(0, Math.floor(effect.count ?? 1))
        if (count > 0) {
          state.player.inventory[effect.itemId] =
            (state.player.inventory[effect.itemId] ?? 0) + count
        }
        break
      }
      case 'applyStatus': {
        const months = Math.floor(effect.months ?? 1)
        const index = state.player.statuses.findIndex(
          (status) => status.id === effect.statusId,
        )
        if (months <= 0) {
          if (index >= 0) state.player.statuses.splice(index, 1)
          break
        }
        const status = {
          id: effect.statusId,
          monthsRemaining: months,
          source: effect.source,
        }
        if (index >= 0) state.player.statuses[index] = status
        else state.player.statuses.push(status)
        break
      }
      default:
        break
    }
  }
}

interface CaveProductionSummary {
  batches: Map<string, number>
  stalls: Map<string, 'no_tide' | 'no_inputs' | 'no_purity'>
}

function settleCaveProduction(
  state: GameSaveData,
  definition: CaveDefinition,
  registry: ContentRegistry,
  months: number,
  efficiency: number,
): CaveProductionSummary {
  const cave = state.cave
  const summary: CaveProductionSummary = {
    batches: new Map(),
    stalls: new Map(),
  }
  if (!cave || months <= 0) return summary
  cave.chainEnabled ??= {}
  cave.chainProgress ??= {}

  const daoRules = daoProductionRules(state)

  for (let month = 0; month < months; month += 1) {
    const tide = caveTideState(state, registry)
    const before = cave.tide ?? 0
    const filled = before + tide.perMonth
    cave.tide = round(Math.min(tide.cap, filled), 3)
    if (daoRules.overflowToPurity && filled > tide.cap) {
      const overflow = filled - tide.cap
      const gained = Math.min(daoRules.overflowMaxPurity, Math.floor(overflow / 3))
      if (gained > 0) adjustPurity(cave, gained)
    }
    if (daoRules.tideLifePurity > 0 && cave.tide >= 6) {
      adjustPurity(cave, daoRules.tideLifePurity)
    }

    for (const chain of definition.chains) {
      const [first, second] = chainLevels(cave, chain)
      if (first < 1 || second < 1) continue
      if (cave.chainEnabled[chain.id] === false) continue

      const interval = Math.max(1, chain.intervalMonths)
      let progress = cave.chainProgress[chain.id] ?? 0
      let batchCount = 0
      const produce = (): void => {
        if (!canPayCost(state, chain.inputs)) return
        payCost(state, chain.inputs)
        applyChainOutputs(state, chain.outputs, efficiency)
        progress -= interval
        batchCount += 1
      }

      if (chain.purityPerMonth < 0 && cave.purity < daoRules.noPurityFloor) {
        summary.stalls.set(chain.id, 'no_purity')
        cave.chainProgress[chain.id] = round(progress, 3)
        continue
      }

      if (progress >= interval - 0.0001) {
        produce()
        if (progress >= interval - 0.0001) {
          summary.stalls.set(chain.id, 'no_inputs')
          cave.chainProgress[chain.id] = interval
          continue
        }
      }

      if (cave.tide + 0.0001 < chain.tidePerMonth) {
        summary.stalls.set(chain.id, 'no_tide')
        cave.chainProgress[chain.id] = round(progress, 3)
        continue
      }

      cave.tide = round(cave.tide - chain.tidePerMonth, 3)
      const purityDelta =
        chain.purityPerMonth < 0
          ? chain.purityPerMonth * daoRules.purityLossMultiplier
          : chain.purityPerMonth
      adjustPurity(cave, purityDelta)
      progress += chainEfficiency(cave, definition, chain)
      while (progress >= interval - 0.0001) {
        const beforeBatch = progress
        produce()
        if (progress === beforeBatch) break
      }
      cave.chainProgress[chain.id] = round(Math.min(progress, interval), 3)
      if (progress >= interval - 0.0001 && !canPayCost(state, chain.inputs)) {
        summary.stalls.set(chain.id, 'no_inputs')
      } else {
        summary.stalls.delete(chain.id)
      }

      if (batchCount > 0) {
        summary.batches.set(
          chain.id,
          (summary.batches.get(chain.id) ?? 0) + batchCount,
        )
      }
    }
  }

  return summary
}

export function caveDefenseBonus(
  state: GameSaveData,
  registry: ContentRegistry,
): number {
  const base = caveProduction(state, registry).defense
  let bonus = base
  if (state.player.statuses.some((status) => status.id === 'status.longhan.cave_ward')) {
    bonus += 3
  }
  const petId = state.player.activePetId
  if (petId && registry.pets.get(petId)?.role === 'guard') bonus += 2
  return Math.max(0, Math.round(bonus))
}

export function pushCaveLog(
  cave: CaveState,
  kind: CaveLogKind,
  text: string,
  now: number,
): void {
  const previous = cave.flags['log_seq']
  const seq = (typeof previous === 'number' ? previous : 0) + 1
  cave.flags['log_seq'] = seq
  cave.log.push({
    id: `cave.log.${seq}`,
    kind,
    text,
    createdAtMonths: now,
  })
  if (cave.log.length > CAVE_LOG_LIMIT) {
    cave.log.splice(0, cave.log.length - CAVE_LOG_LIMIT)
  }
}

function clampPurity(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10))
}

function adjustPurity(cave: CaveState, delta: number): number {
  const before = cave.purity
  cave.purity = clampPurity(cave.purity + delta)
  return cave.purity - before
}

function adjustReputation(cave: CaveState, delta: number): void {
  cave.reputation = Math.max(0, Math.round(cave.reputation + delta))
}

export const VEIN_TEND_COST: ResourceCost = {
  spirit_stones: 3,
  spirit_herbs: 2,
}

export const VEIN_TEND_COOLDOWN = 3

export function caveVeinTendCooldown(state: GameSaveData): number {
  const cave = state.cave
  if (!cave) return 0
  const readyAt = cave.flags['vein_tend_cd']
  const value =
    typeof readyAt === 'number' && Number.isFinite(readyAt) ? readyAt : 0
  return Math.max(0, value - state.clock.elapsedMonths)
}

export function tendCaveVein(
  state: GameSaveData,
  registry: ContentRegistry,
): CaveActionResult {
  const cave = state.cave
  if (!cave || !caveDefinition(state, registry)) {
    return fail(state, '你还没有可养的灵脉。')
  }
  if (cave.purity >= 100) {
    return fail(state, '灵脉已经澄澈见底，不必再疏。')
  }
  const cooldown = caveVeinTendCooldown(state)
  if (cooldown > 0) {
    return fail(state, `刚刚疏过脉，还需 ${Math.ceil(cooldown)} 个月才能再动。`)
  }
  if (!canPayCost(state, VEIN_TEND_COST)) {
    return fail(state, '灵石或灵草不够，养脉不是空口白话。')
  }

  const cloned = cloneGameSaveData(state)
  if (!cloned.cave) return fail(state, '你还没有可养的灵脉。')
  payCost(cloned, VEIN_TEND_COST)
  cloned.cave.flags['vein_tend_cd'] =
    cloned.clock.elapsedMonths + VEIN_TEND_COOLDOWN
  const gained = adjustPurity(
    cloned.cave,
    12 + daoProductionRules(cloned).tendPurityBonus,
  )
  adjustReputation(cloned.cave, 1)
  pushCaveLog(
    cloned.cave,
    'vein',
    `你以灵草与灵石疏了一回脉，灵脉澄澈 +${Math.round(gained)}，如今是 ${cloned.cave.purity.toFixed(0)}。`,
    cloned.clock.elapsedMonths,
  )
  return succeed(
    cloned,
    `灵脉澄澈 +${Math.round(gained)}，潮声低了一层。`,
  )
}

export function canPayCost(state: GameSaveData, cost: ResourceCost | undefined): boolean {
  if (!cost) return true
  return Object.entries(cost).every(([key, amount]) => {
    if (typeof amount !== 'number' || amount <= 0) return true
    return (state.player.resources[key as ResourceKey] ?? 0) >= amount
  })
}

function payCost(state: GameSaveData, cost: ResourceCost | undefined): void {
  if (!cost) return
  for (const [key, amount] of Object.entries(cost)) {
    if (typeof amount !== 'number' || amount <= 0) continue
    const resource = key as ResourceKey
    state.player.resources[resource] = Math.max(
      0,
      (state.player.resources[resource] ?? 0) - amount,
    )
  }
}

export function caveVerbCooldown(
  state: GameSaveData,
  verbId: string,
): number {
  const cave = state.cave
  if (!cave) return 0
  const readyAt = cave.flags[`verb_cd.${verbId}`]
  const value =
    typeof readyAt === 'number' && Number.isFinite(readyAt) ? readyAt : 0
  return Math.max(0, value - state.clock.elapsedMonths)
}

export function upgradeCaveBuilding(
  state: GameSaveData,
  buildingId: string,
  registry: ContentRegistry,
): CaveActionResult {
  const cave = state.cave
  const definition = caveDefinition(state, registry)
  if (!cave || !definition) return fail(state, '你还没有一处可以动土的洞府。')
  const building = definition.buildings.find((entry) => entry.id === buildingId)
  if (!building) return fail(state, '这里没有这栋建筑。')
  const currentLevel = buildingLevel(cave, buildingId)
  const next = building.levels.find((entry) => entry.level === currentLevel + 1)
  if (!next) return fail(state, '这栋建筑已经修到尽头。')
  if (!canPayCost(state, next.cost)) {
    return fail(state, '材料不够，动土只会坏了地基。')
  }

  let cloned = cloneGameSaveData(state)
  if (!cloned.cave) return fail(state, '你还没有一处可以动土的洞府。')
  payCost(cloned, next.cost)
  cloned.cave.buildings[buildingId] = next.level
  cloned = applyEffects(cloned, next.effects, { sourceEventId: undefined })
  if (!cloned.cave) return fail(state, '你还没有一处可以动土的洞府。')
  const now = cloned.clock.elapsedMonths
  adjustReputation(cloned.cave, 3)
  adjustPurity(cloned.cave, -2)
  pushCaveLog(
    cloned.cave,
    'build',
    `${building.name}修至「${next.name}」。动土惊了灵脉，澄澈 -2，声名 +3。`,
    now,
  )
  return succeed(
    cloned,
    `${building.name}落成「${next.name}」，${next.verb?.name ?? next.verbs[0]}已可用。`,
  )
}

export function upgradeCaveVein(
  state: GameSaveData,
  registry: ContentRegistry,
): CaveActionResult {
  const cave = state.cave
  const definition = caveDefinition(state, registry)
  if (!cave || !definition) return fail(state, '你还没有可养的灵脉。')
  const currentLevel = cave.spiritVeinLevel
  const next = definition.spiritVein.levels.find(
    (entry) => entry.level === currentLevel + 1,
  )
  if (!next) return fail(state, '这条灵脉已经养到尽头。')
  if (!canPayCost(state, next.cost)) {
    return fail(state, '灵材不够，灵脉不会替你凭空长大。')
  }

  let cloned = cloneGameSaveData(state)
  if (!cloned.cave) return fail(state, '你还没有可养的灵脉。')
  payCost(cloned, next.cost)
  cloned.cave.spiritVeinLevel = next.level
  cloned = applyEffects(cloned, next.effects, { sourceEventId: undefined })
  if (!cloned.cave) return fail(state, '你还没有可养的灵脉。')
  adjustReputation(cloned.cave, 4)
  adjustPurity(cloned.cave, 8)
  pushCaveLog(
    cloned.cave,
    'vein',
    `灵脉养至「${next.name}」，潮声更清。澄澈 +8，声名 +4。`,
    cloned.clock.elapsedMonths,
  )
  return succeed(cloned, `灵脉养至「${next.name}」。`)
}

export function useCaveVerb(
  state: GameSaveData,
  buildingId: string,
  registry: ContentRegistry,
): CaveActionResult {
  const cave = state.cave
  const definition = caveDefinition(state, registry)
  if (!cave || !definition) return fail(state, '你还没有可用的洞府。')
  const building = definition.buildings.find((entry) => entry.id === buildingId)
  if (!building) return fail(state, '这里没有这栋建筑。')
  const current = building.levels.find(
    (entry) => entry.level === buildingLevel(cave, buildingId),
  )
  const verb = current?.verb
  if (!current || !verb) return fail(state, '这栋建筑还没有可做的事。')
  const cooldown = caveVerbCooldown(state, verb.id)
  if (cooldown > 0) {
    return fail(state, `${verb.name}还需 ${Math.ceil(cooldown)} 个月才能再用。`)
  }
  if (!canPayCost(state, verb.cost)) {
    return fail(state, `材料不够，${verb.name}无法开始。`)
  }

  let cloned = cloneGameSaveData(state)
  if (!cloned.cave) return fail(state, '你还没有可用的洞府。')
  payCost(cloned, verb.cost)
  cloned.cave.flags[`verb_cd.${verb.id}`] =
    cloned.clock.elapsedMonths + verb.cooldownMonths
  cloned = applyEffects(cloned, verb.effects, { sourceEventId: undefined })
  if (!cloned.cave) return fail(state, '你还没有可用的洞府。')
  adjustPurity(cloned.cave, -0.5)
  return succeed(cloned, `${building.name}：${verb.name}。`)
}

export function recruitDisciple(
  state: GameSaveData,
  discipleId: string,
  registry: ContentRegistry,
): CaveActionResult {
  const cave = state.cave
  const definition = caveDefinition(state, registry)
  if (!cave || !definition) return fail(state, '你还没有能收留人的洞府。')
  const disciple = definition.disciples.find((entry) => entry.id === discipleId)
  if (!disciple) return fail(state, '这个人并不在洞府名册上。')
  if (cave.discipleIds.includes(discipleId)) {
    return fail(state, `${disciple.name}已经住在洞里了。`)
  }
  const gate = evaluateRequirements(state, disciple.requirements)
  if (!gate.ok) return fail(state, '因缘未到，此时留不住这个人。')
  if (!canPayCost(state, disciple.recruitCost)) {
    return fail(state, '安顿一个人需要花销，眼下还差一些。')
  }

  const cloned = cloneGameSaveData(state)
  if (!cloned.cave) return fail(state, '你还没有能收留人的洞府。')
  payCost(cloned, disciple.recruitCost)
  cloned.cave.discipleIds.push(discipleId)
  cloned.cave.discipleAssignments[discipleId] = disciple.aptitude
  cloned.cave.discipleTrust[discipleId] = 0
  cloned.cave.discipleExpertise[discipleId] = {
    [disciple.aptitude]: 0,
  }
  adjustReputation(cloned.cave, 2)
  pushCaveLog(
    cloned.cave,
    'disciple',
    `${disciple.name}住进听潮洞，先领了「${ASSIGNMENT_TEXT[disciple.aptitude]}」的差事。`,
    cloned.clock.elapsedMonths,
  )
  return succeed(cloned, `${disciple.name}住进了听潮洞。`)
}

export function assignDisciple(
  state: GameSaveData,
  discipleId: string,
  assignment: DiscipleAssignment,
  registry?: ContentRegistry,
): CaveActionResult {
  const cave = state.cave
  if (!cave) return fail(state, '你还没有洞府。')
  if (!cave.discipleIds.includes(discipleId)) {
    return fail(state, '这个人还没有留在洞中。')
  }
  if (!['study', 'gather', 'guard', 'craft', 'tend'].includes(assignment)) {
    return fail(state, '这不是洞府里该做的事。')
  }
  const definition = registry ? caveDefinition(state, registry) : undefined
  const disciple = definition?.disciples.find((entry) => entry.id === discipleId)
  const cloned = cloneGameSaveData(state)
  if (!cloned.cave) return fail(state, '你还没有洞府。')
  cloned.cave.discipleAssignments[discipleId] = assignment
  pushCaveLog(
    cloned.cave,
    'disciple',
    `${disciple?.name ?? '弟子'}改领「${ASSIGNMENT_TEXT[assignment]}」，已熟悉的旧差事不会白费。`,
    cloned.clock.elapsedMonths,
  )
  return succeed(cloned, '差事已经换了。')
}

export function resolveCaveVisitor(
  state: GameSaveData,
  choiceId: string,
  registry: ContentRegistry,
): CaveActionResult {
  const cave = state.cave
  const definition = caveDefinition(state, registry)
  if (!cave || !definition || !cave.visitor) {
    return fail(state, '洞口此刻没有访客。')
  }
  const visitor = definition.visitors.find(
    (entry) => entry.id === cave.visitor?.visitorId,
  )
  if (!visitor) return fail(state, '洞口的人已经走了。')
  const choice = visitor.choices.find((entry) => entry.id === choiceId)
  if (!choice) return fail(state, '这不是一句能说出口的话。')
  const gate = evaluateRequirements(state, choice.requirements)
  if (!gate.ok) return fail(state, '你还没有能这样回答的底气。')
  if (!canPayCost(state, choice.cost)) {
    return fail(state, '手头的材料不够。')
  }

  let cloned = cloneGameSaveData(state)
  if (!cloned.cave) return fail(state, '洞口此刻没有访客。')
  payCost(cloned, choice.cost)
  cloned = applyEffects(cloned, choice.effects, { sourceEventId: undefined })
  if (!cloned.cave) return fail(state, '洞口此刻没有访客。')
  delete cloned.cave.visitor
  cloned.cave.nextVisitorMonths =
    cloned.clock.elapsedMonths + Math.max(3, 8 - Math.floor(cloned.cave.reputation / 12))
  adjustReputation(cloned.cave, 1)
  pushCaveLog(
    cloned.cave,
    'visitor',
    `${visitor.name}来过洞口，你答了「${choice.label}」。声名 +1。`,
    cloned.clock.elapsedMonths,
  )
  return succeed(cloned, `${visitor.name}：${choice.label}。`)
}

function findRaid(
  definition: CaveDefinition | undefined,
  raidId: string,
): CaveRaidDefinition | undefined {
  return definition?.raids.find((entry) => entry.id === raidId)
}

export function caveRaidDefinition(
  state: GameSaveData,
  registry: ContentRegistry,
): CaveRaidDefinition | undefined {
  const raidId = state.cave?.raid?.raidId
  if (!raidId) return undefined
  return findRaid(caveDefinition(state, registry), raidId)
}

export function caveVisitorDefinition(
  state: GameSaveData,
  registry: ContentRegistry,
): CaveVisitorDefinition | undefined {
  const visitorId = state.cave?.visitor?.visitorId
  if (!visitorId) return undefined
  return caveDefinition(state, registry)?.visitors.find(
    (entry) => entry.id === visitorId,
  )
}

function pushRumor(
  state: GameSaveData,
  id: string,
  text: string,
): void {
  const entry = {
    id,
    text,
    createdAtMonths: state.clock.elapsedMonths,
  }
  const index = state.eventRuntime.rumors.findIndex((rumor) => rumor.id === id)
  if (index >= 0) state.eventRuntime.rumors[index] = entry
  else state.eventRuntime.rumors.push(entry)
}

export function applyCaveRaidOutcome(
  state: GameSaveData,
  victory: boolean,
  registry: ContentRegistry,
): GameSaveData {
  const cave = state.cave
  if (!cave?.raid) return state
  const definition = caveDefinition(state, registry)
  const raid = findRaid(definition, cave.raid.raidId)
  let next = cloneGameSaveData(state)
  if (!next.cave) return state
  const now = next.clock.elapsedMonths

  if (victory) {
    next.cave.raidsDefended += 1
    adjustReputation(next.cave, 5)
    adjustPurity(next.cave, 5)
    next.cave.nextRaidMonths =
      now + Math.max(10, 18 - Math.floor(next.cave.reputation / 10)) + next.cave.spiritVeinLevel * 2
    next.cave.flags['raid_last_result'] = 'defended'
    next.campaign.world.flags['longhan.cave.raids_defended'] = true
    const previous =
      typeof next.campaign.world.flags['longhan.cave.raids_defended_count'] === 'number'
        ? (next.campaign.world.flags['longhan.cave.raids_defended_count'] as number)
        : 0
    next.campaign.world.flags['longhan.cave.raids_defended_count'] = previous + 1
    pushCaveLog(
      next.cave,
      'raid',
      `${raid?.name ?? '来袭'}退去。守住了洞口，声名 +5，灵脉澄澈 +5。`,
      now,
    )
    pushRumor(
      next,
      `rumor.longhan.raid_repelled.${now}`,
      `${raid?.name ?? '来袭'}退去。洞口只留下被潮水抹平的脚印，没有人再来收尸。`,
    )
  } else {
    if (raid) {
      next = applyEffects(next, raid.ignoredEffects, { sourceEventId: undefined })
      if (!next.cave) return next
      const damage = Math.max(0, Math.round(raid.veinDamage ?? 0))
      if (damage > 0) {
        next.cave.spiritVeinLevel = Math.max(
          1,
          next.cave.spiritVeinLevel - damage,
        )
      }
      next.cave.flags['raid_last_ignored'] = raid.id
      adjustReputation(next.cave, -5)
      adjustPurity(next.cave, -15)
      pushCaveLog(
        next.cave,
        'raid',
        `${raid.name}闯过洞口。灵脉受损，声名 -5，澄澈 -15。`,
        now,
      )
      pushRumor(
        next,
        `rumor.longhan.raid_ignored.${now}`,
        `${raid.name}过去了。洞府还在，但灵脉里多了一层洗不掉的浊意。`,
      )
    }
    next.cave.flags['raid_last_result'] = 'lost'
    next.cave.nextRaidMonths = now + 10
  }

  if (next.cave) delete next.cave.raid
  return next
}

export function advanceCaveTime(
  state: GameSaveData,
  months: number,
  registry: ContentRegistry,
  efficiency = 1,
): GameSaveData {
  const cave = state.cave
  const definition = caveDefinition(state, registry)
  if (
    !cave ||
    !definition ||
    !Number.isFinite(months) ||
    months <= 0
  ) {
    return state
  }
  const now = state.clock.elapsedMonths
  const lastTrust =
    typeof cave.flags['trust_tick_month'] === 'number'
      ? (cave.flags['trust_tick_month'] as number)
      : 0
  const lastCare =
    typeof cave.flags['care_tick_month'] === 'number'
      ? (cave.flags['care_tick_month'] as number)
      : now - Math.max(1, Math.floor(months))
  const careDue = now - lastCare >= 1
  const trustDue = now - lastTrust >= TRUST_TICK_MONTHS
  const visitorExpired =
    !!cave.visitor && now - cave.visitor.arrivedMonths >= VISITOR_STAY_MONTHS
  const raidMissingDefinition =
    !!cave.raid && !findRaid(definition, cave.raid.raidId)
  const raidDue =
    !!cave.raid && !cave.raid.encounterQueued && now >= cave.raid.dueMonths
  const raidSpawn = !cave.raid && now >= cave.nextRaidMonths
  const visitorSpawn = !cave.visitor && now >= cave.nextVisitorMonths
  const productionMonths = Math.max(0, Math.floor(months))
  const productionDue = productionMonths > 0 && definition.chains.length > 0
  if (
    !careDue &&
    !trustDue &&
    !visitorExpired &&
    !raidMissingDefinition &&
    !raidDue &&
    !raidSpawn &&
    !visitorSpawn &&
    !productionDue
  ) {
    return state
  }

  const next = cloneGameSaveData(state)
  if (!next.cave) return state
  const rng = Rng.fromState(next.rng)
  let changed = false

  if (careDue) {
    const ticks = Math.max(1, Math.floor(now - lastCare))
    let tenders = 0
    next.cave.discipleExpertise ??= {}
    for (const discipleId of next.cave.discipleIds) {
      const disciple = definition.disciples.find((entry) => entry.id === discipleId)
      if (!disciple) continue
      const assignment = discipleAssignment(next.cave, disciple)
      const entry =
        next.cave.discipleExpertise[discipleId] ??
        (next.cave.discipleExpertise[discipleId] = {})
      const before = entry[assignment] ?? 0
      const after = Math.min(120, before + ticks)
      entry[assignment] = after
      const rankBefore = expertiseRank(before)
      const rankAfter = expertiseRank(after)
      if (rankAfter.name !== rankBefore.name) {
        pushCaveLog(
          next.cave,
          'care',
          `${disciple.name}在「${ASSIGNMENT_TEXT[assignment]}」上熬到了「${rankAfter.name}」，往后这份差事会更顺手。`,
          now,
        )
      }
      if (assignment === 'tend') {
        tenders += 1 + (next.cave.discipleTrust[discipleId] ?? 0) * 0.06
      }
    }

    const gardenLevel = buildingLevel(next.cave, 'building.longhan.herb_garden')
    const decay = 0.35 + Math.max(0, 3 - gardenLevel) * 0.06
    const net = (tenders * 0.9 - decay) * ticks
    const purityBefore = next.cave.purity
    adjustPurity(next.cave, net)
    if (next.cave.purity !== purityBefore) changed = true

    const purity = next.cave.purity
    if (purity < 40 && next.cave.flags['purity_warned_40'] !== true) {
      next.cave.flags['purity_warned_40'] = true
      pushCaveLog(
        next.cave,
        'care',
        '灵脉里的浊意压过了潮声，产出与守御都开始打折。该疏一次脉，或让一名弟子去养脉了。',
        now,
      )
    }
    if (purity < 20 && next.cave.flags['purity_warned_20'] !== true) {
      next.cave.flags['purity_warned_20'] = true
      pushCaveLog(
        next.cave,
        'care',
        '灵脉已经浊得发暗。洞中草木萎黄，连弟子走路都放轻了脚。再放任下去，洞府会先于外敌垮掉。',
        now,
      )
    }
    if (purity >= 45) {
      delete next.cave.flags['purity_warned_40']
      delete next.cave.flags['purity_warned_20']
    } else if (purity >= 25) {
      delete next.cave.flags['purity_warned_20']
    }

    next.cave.flags['care_tick_month'] = lastCare + ticks
    changed = true
  }

  if (trustDue) {
    const ticks = Math.max(1, Math.floor((now - lastTrust) / TRUST_TICK_MONTHS))
    for (const discipleId of next.cave.discipleIds) {
      const current = next.cave.discipleTrust[discipleId] ?? 0
      if (current < TRUST_MAX) {
        next.cave.discipleTrust[discipleId] = Math.min(
          TRUST_MAX,
          current + ticks,
        )
        changed = true
      }
    }
    next.cave.flags['trust_tick_month'] = lastTrust + ticks * TRUST_TICK_MONTHS
  }

  if (visitorExpired && next.cave.visitor) {
    const visitor = caveVisitorDefinition(next, registry)
    delete next.cave.visitor
    next.cave.nextVisitorMonths =
      now + Math.max(3, 6 - Math.floor(next.cave.reputation / 12)) + rng.nextInt(0, 6)
    if (visitor) {
      pushCaveLog(
        next.cave,
        'visitor',
        `${visitor.name}在洞口等不到回话，沿着潮线走了。水痕很快会被下一次涨潮抹掉。`,
        now,
      )
    }
    changed = true
  }

  if (raidMissingDefinition) {
    delete next.cave.raid
    next.cave.nextRaidMonths = now + 8
    changed = true
  }

  if (next.cave.raid) {
    const raid = findRaid(definition, next.cave.raid.raidId)
    if (raid && !next.cave.raid.encounterQueued) {
      const pendingExists = next.eventRuntime.pendingEncounters.some(
        (entry) =>
          entry.encounterId === raid.encounterId && entry.source === 'cave_raid',
      )
      if (!pendingExists && now >= next.cave.raid.dueMonths) {
        next.eventRuntime.pendingEncounters.push({
          id: `encounter.${next.eventRuntime.nextSequence}`,
          encounterId: raid.encounterId,
          fleeAllowed: false,
          createdAtMonths: now,
          source: 'cave_raid',
        })
        next.eventRuntime.nextSequence += 1
        next.cave.raid.encounterQueued = true
        changed = true
      }
    } else if (raid && next.cave.raid.encounterQueued) {
      const pendingExists = next.eventRuntime.pendingEncounters.some(
        (entry) =>
          entry.encounterId === raid.encounterId && entry.source === 'cave_raid',
      )
      if (!pendingExists) {
        next.cave.raid.encounterQueued = false
        changed = true
      }
    }
  } else if (now >= next.cave.nextRaidMonths) {
    const candidates = definition.raids.filter(
      (entry) => next.cave && next.cave.spiritVeinLevel >= entry.minVeinLevel,
    )
    const chosen = rng.pickWeighted(candidates)
    if (chosen) {
      next.cave.raid = {
        raidId: chosen.id,
        startedMonths: now,
        dueMonths: now + Math.max(1, chosen.warningMonths),
        encounterQueued: false,
      }
      pushRumor(
        next,
        `rumor.longhan.raid_warning.${now}`,
        `${chosen.name}：${chosen.warning}`,
      )
      changed = true
    } else {
      next.cave.nextRaidMonths = now + 6
      changed = true
    }
  }

  if (!next.cave.visitor && now >= next.cave.nextVisitorMonths) {
    const candidates = definition.visitors.filter((visitor) =>
      evaluateRequirements(next, visitor.requirements).ok,
    )
    const chosen = rng.pickWeighted(candidates)
    if (chosen) {
      next.cave.visitor = { visitorId: chosen.id, arrivedMonths: now }
      pushRumor(
        next,
        `rumor.longhan.visitor.${now}`,
        `${chosen.name}在洞口停下：${chosen.greeting}`,
      )
      changed = true
    } else {
      next.cave.nextVisitorMonths = now + 6
      changed = true
    }
  }

  if (productionDue) {
    const summary = settleCaveProduction(
      next,
      definition,
      registry,
      productionMonths,
      Math.max(0, Math.min(1, efficiency)),
    )
    const batches: string[] = []
    for (const chain of definition.chains) {
      const count = summary.batches.get(chain.id) ?? 0
      if (count > 0) batches.push(`${chain.name} ${count} 炉`)
    }
    if (batches.length > 0) {
      const stallLabels = {
        no_tide: '潮息不足',
        no_inputs: '缺料',
        no_purity: '灵脉太浊',
      } as const
      const stalled = definition.chains.flatMap((chain) => {
        const reason = summary.stalls.get(chain.id)
        if (!reason) return []
        return [`${chain.name}（${stallLabels[reason]}）`]
      })
      const cap = caveTideState(next, registry).cap
      const stallText =
        productionMonths > 1 && stalled.length > 0
          ? `；受滞：${stalled.join('、')}`
          : ''
      const headline =
        productionMonths > 1 ? `洞府运转 ${productionMonths} 月` : '洞府出一炉'
      pushCaveLog(
        next.cave,
        'production',
        `${headline}：${batches.join('，')}。潮息余 ${round(next.cave.tide, 1)}/${cap}${stallText}。`,
        now,
      )
    }
    changed = true
  }

  if (!changed) return state
  next.rng = rng.getState()
  return next
}
