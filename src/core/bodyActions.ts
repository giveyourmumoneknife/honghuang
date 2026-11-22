import type { ContentRegistry } from '@/data/registry'
import type { ResourceCost, ResourceKey } from '@/types/common'
import type {
  BloodlineDefinition,
  CharacterPhysiqueDefinition,
  CombatStats,
} from '@/types/content'
import type { CombatMods } from '@/types/gear'
import type { BodyPath, GameSaveData, PlayerBloodlineState } from '@/types/state'
import type { CharacterActionResult } from './character'
import { computeCharacterSheet } from './character'
import {
  BODY_MAX_STAGE,
  bloodlineContribution,
  bloodlineNextStage,
  bloodlineSkillForCombat,
  bloodlineStageDefinition,
  bodyBalanceInfo,
  bodyPathDefinition,
  bodyProgressInfo,
  bodyStageDefinition,
  physiqueContribution,
} from './body'
import type {
  BodyBalanceInfo,
  BodyPathDefinition,
  BodyProgressInfo,
  BodyStageDefinition,
  PhysiqueAwakeningView,
} from './body'
import { Rng } from './rng'
import { cloneGameSaveData } from './state'

export const BODY_BACKLASH_STATUS = 'status.longhan.body_backlash'
export const BLOODLINE_BACKLASH_STATUS = 'status.longhan.bloodline_backlash'
const MANUAL_TEMPER_READY = 'temper.readyAt'
const BODY_BREAKTHROUGH_READY = 'breakthrough.readyAt'
const BLOODLINE_AWAKEN_READY = 'awaken.readyAt'
const PATH_CHANGE_COOLDOWN = 6
const MANUAL_TEMPER_COOLDOWN = 1
const BREAKTHROUGH_COOLDOWN = 2
const AWAKEN_COOLDOWN = 3

export interface CostItemView {
  itemId: string
  name: string
  count: number
  have: number
  enough: boolean
}

export interface ActionCostView {
  cultivation: number
  resources: ResourceCost
  items: CostItemView[]
  enough: boolean
}

export interface BloodlineAcquisitionView {
  definition: BloodlineDefinition
  affinity: number
  initialPurity: number
  cost: ActionCostView
  bodyGateMet: boolean
  hasBloodline: boolean
  canAcquire: boolean
  blockedReason?: string
  skillUnlocked: boolean
}

export interface BloodlineRefineView {
  cost: ActionCostView
  purityGain: number
  atMaxPurity: boolean
  nextStage?: BloodlineDefinition['stages'][number]
  bodyGateMet: boolean
  canRefine: boolean
  readyAtMonths: number
  blockedReason?: string
}

export interface BloodlineView {
  active: boolean
  definition?: BloodlineDefinition
  state?: PlayerBloodlineState
  stageName: string
  stageDescription: string
  purity: number
  stage: number
  nextStage?: BloodlineDefinition['stages'][number]
  nextStagePurity: number
  bodyGateMet: boolean
  skillUnlocked: boolean
  skill?: BloodlineDefinition['skill']
  stats?: CombatStats
  mods?: Partial<CombatMods>
  canAwaken: boolean
  awakenChance: number
  awakenBlockedReason?: string
  refine?: BloodlineRefineView
  severCost: ActionCostView
  options: BloodlineAcquisitionView[]
}

export interface BodyBreakthroughView {
  ready: boolean
  chance: number
  bodyReady: boolean
  temperReady: boolean
  healthReady: boolean
  cooldownMonths: number
  backlashActive: boolean
  targetStage: number
  targetName: string
  blockedReason?: string
}

export interface ManualTemperView {
  cost: ActionCostView
  gain: number
  readyAtMonths: number
  canTemper: boolean
  blockedReason?: string
}

export interface CharacterBodyView {
  physiqueId: string
  physique?: CharacterPhysiqueDefinition
  physiqueAwakenings: PhysiqueAwakeningView[]
  temper: number
  stage: BodyStageDefinition
  stageProgress: BodyProgressInfo
  path: BodyPathDefinition
  balance: BodyBalanceInfo
  paths: Array<BodyPathDefinition & { canSelect: boolean; active: boolean; blockedReason?: string }>
  breakthrough: BodyBreakthroughView
  manualTemper: ManualTemperView
  bodyTemperMultiplier: number
  cultivationMultiplier: number
  healthRatio: number
  bloodline: BloodlineView
}

function canPayResources(state: GameSaveData, cost: ResourceCost): boolean {
  for (const [key, amount] of Object.entries(cost) as Array<[ResourceKey, number]>) {
    if ((state.player.resources[key] ?? 0) < amount) return false
  }
  return true
}

function payResources(state: GameSaveData, cost: ResourceCost): void {
  for (const [key, amount] of Object.entries(cost) as Array<[ResourceKey, number]>) {
    state.player.resources[key] = (state.player.resources[key] ?? 0) - amount
  }
}

function itemCostView(
  state: GameSaveData,
  registry: ContentRegistry,
  items: Record<string, number>,
): CostItemView[] {
  return Object.entries(items).map(([itemId, count]) => {
    const have = state.player.inventory[itemId] ?? 0
    return {
      itemId,
      name: registry.getItem(itemId)?.name ?? itemId,
      count,
      have,
      enough: have >= count,
    }
  })
}

function actionCostView(
  state: GameSaveData,
  registry: ContentRegistry,
  cultivation: number,
  resources: ResourceCost,
  items: Record<string, number>,
): ActionCostView {
  const costItems = itemCostView(state, registry, items)
  return {
    cultivation,
    resources,
    items: costItems,
    enough:
      state.player.cultivation >= cultivation &&
      canPayResources(state, resources) &&
      costItems.every((item) => item.enough),
  }
}

function canPayItems(state: GameSaveData, items: Record<string, number>): boolean {
  return Object.entries(items).every(
    ([itemId, count]) => (state.player.inventory[itemId] ?? 0) >= count,
  )
}

function payItems(state: GameSaveData, items: Record<string, number>): void {
  for (const [itemId, count] of Object.entries(items)) {
    const remaining = (state.player.inventory[itemId] ?? 0) - count
    if (remaining > 0) state.player.inventory[itemId] = remaining
    else delete state.player.inventory[itemId]
  }
}

function hasStatus(state: GameSaveData, statusId: string): boolean {
  return state.player.statuses.some((status) => status.id === statusId)
}

function monthOf(state: GameSaveData): number {
  return state.clock.elapsedMonths
}

function flagNumber(state: GameSaveData, key: string): number {
  const value = state.player.body.flags[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function clampHealth(state: GameSaveData, registry: ContentRegistry): void {
  const maxHealth = computeCharacterSheet(state, registry).maxHealth
  state.player.health = Math.max(1, Math.min(maxHealth, Math.round(state.player.health)))
}

function physiqueAffinity(
  physique: CharacterPhysiqueDefinition | undefined,
  bloodline: BloodlineDefinition,
): number {
  return physique?.bloodlineAffinity[bloodline.id] ?? 0
}

export function bodyGainMultiplier(
  state: GameSaveData,
  registry: ContentRegistry,
): number {
  const physique = registry.physiques.get(state.player.physiqueId)
  const path = bodyPathDefinition(state.player.body.path)
  const balance = bodyBalanceInfo(state.player.body, state.player.realm, state.player.stage)
  const bloodlineStage = state.player.bloodline?.stage ?? 0
  return (
    path.bodyRatio *
    (physique?.bodyTemperMultiplier ?? 1) *
    balance.bodyGainMultiplier *
    (1 + bloodlineStage * 0.03)
  )
}

export function applyBodyTemperGain(
  state: GameSaveData,
  cultivationGain: number,
  registry: ContentRegistry,
): number {
  if (!Number.isFinite(cultivationGain) || cultivationGain <= 0) return 0
  const gain = cultivationGain * bodyGainMultiplier(state, registry)
  if (gain <= 0) return 0
  state.player.body.temper = Math.max(0, state.player.body.temper + gain)
  return gain
}

export function applyBattleBodyTemper(
  state: GameSaveData,
  cultivationReward: number,
  registry: ContentRegistry,
): number {
  return applyBodyTemperGain(state, cultivationReward * 0.55, registry)
}

function bodyBreakthroughChance(
  state: GameSaveData,
  registry: ContentRegistry,
  physique: CharacterPhysiqueDefinition | undefined,
): number {
  const sheet = computeCharacterSheet(state, registry)
  const healthRatio = Math.max(0, Math.min(1, state.player.health / sheet.maxHealth))
  const bloodlineStage = state.player.bloodline?.stage ?? 0
  const chance =
    0.68 +
    (physique?.bodyBreakthroughBonus ?? 0) +
    bloodlineStage * 0.015 +
    healthRatio * 0.08 +
    sheet.bodyBalance.bodyBreakthroughBonus -
    state.player.body.stage * 0.055
  return Math.max(0.3, Math.min(0.95, chance))
}

function bodyBreakthroughView(
  state: GameSaveData,
  registry: ContentRegistry,
  physique: CharacterPhysiqueDefinition | undefined,
): BodyBreakthroughView {
  const progress = bodyProgressInfo(state.player.body.temper, state.player.body.stage)
  const atMax = progress.atMax
  const healthRatio = Math.max(
    0,
    Math.min(1, state.player.health / computeCharacterSheet(state, registry).maxHealth),
  )
  const readyAt = flagNumber(state, BODY_BREAKTHROUGH_READY)
  const cooldownMonths = Math.max(0, Math.ceil(readyAt - monthOf(state)))
  const backlashActive = hasStatus(state, BODY_BACKLASH_STATUS)
  const targetStage = Math.min(BODY_MAX_STAGE, state.player.body.stage + 1)
  let blockedReason: string | undefined
  if (atMax) blockedReason = '体魄已至不漏，此世再无可淬之处。'
  else if (!progress.ready) {
    blockedReason = `淬体值还差 ${Math.ceil(progress.threshold - state.player.body.temper)}。`
  } else if (healthRatio < 0.55) blockedReason = '气血不足，强行破体会先伤到自己。'
  else if (cooldownMonths > 0) blockedReason = `经脉尚在回拢，还需 ${cooldownMonths} 个月。`
  else if (backlashActive) blockedReason = '破体旧伤未愈，再冲一次容易留下暗伤。'

  return {
    ready: !blockedReason,
    chance: bodyBreakthroughChance(state, registry, physique),
    bodyReady: progress.ready,
    temperReady: progress.ready,
    healthReady: healthRatio >= 0.55,
    cooldownMonths,
    backlashActive,
    targetStage,
    targetName: bodyStageDefinition(targetStage).name,
    blockedReason,
  }
}

function manualTemperCost(state: GameSaveData): {
  cultivation: number
  resources: ResourceCost
} {
  const stage = state.player.body.stage
  return {
    cultivation: 60 + stage * 70,
    resources: {
      spirit_stones: 6 + stage * 5,
      spirit_herbs: 2 + stage * 2,
    },
  }
}

function manualTemperGain(
  state: GameSaveData,
  registry: ContentRegistry,
): number {
  const stage = state.player.body.stage
  const physique = registry.physiques.get(state.player.physiqueId)
  const path = bodyPathDefinition(state.player.body.path)
  const balance = bodyBalanceInfo(state.player.body, state.player.realm, state.player.stage)
  return (
    (28 + stage * 14) *
    (physique?.bodyTemperMultiplier ?? 1) *
    (0.85 + path.bodyRatio * 0.4) *
    balance.bodyGainMultiplier
  )
}

function manualTemperView(
  state: GameSaveData,
  registry: ContentRegistry,
): ManualTemperView {
  const cost = manualTemperCost(state)
  const readyAt = flagNumber(state, MANUAL_TEMPER_READY)
  const cooldownMonths = Math.max(0, Math.ceil(readyAt - monthOf(state)))
  const atMax = state.player.body.stage >= BODY_MAX_STAGE
  const view = actionCostView(state, registry, cost.cultivation, cost.resources, {})
  let blockedReason: string | undefined
  if (atMax) blockedReason = '体魄已至不漏，日常淬体不再增益。'
  else if (cooldownMonths > 0) blockedReason = `刚淬过一轮，${cooldownMonths} 个月后才能再来。`
  else if (!view.enough) blockedReason = '修为或资源不足。'
  return {
    cost: view,
    gain: manualTemperGain(state, registry),
    readyAtMonths: cooldownMonths,
    canTemper: !blockedReason,
    blockedReason,
  }
}

function bloodlineRefineCostView(
  state: GameSaveData,
  registry: ContentRegistry,
  definition: BloodlineDefinition,
  stage: number,
): ActionCostView {
  const cultivation =
    definition.refinement.baseCultivation + definition.refinement.cultivationPerStage * stage
  return actionCostView(
    state,
    registry,
    cultivation,
    definition.refinement.resources,
    definition.refinement.items,
  )
}

function bloodlineAwakenChance(
  state: GameSaveData,
  physique: CharacterPhysiqueDefinition | undefined,
  definition: BloodlineDefinition,
): number {
  const affinity = physiqueAffinity(physique, definition)
  const bloodline = state.player.bloodline
  const purity = bloodline?.purity ?? 0
  const chance = 0.62 + affinity + state.player.body.stage * 0.02 + Math.max(0, purity - 20) * 0.003
  return Math.max(0.35, Math.min(0.95, chance))
}

function syncBloodlineStage(
  definition: BloodlineDefinition,
  bloodline: PlayerBloodlineState,
  bodyStage: number,
): boolean {
  let advanced = false
  while (bloodline.stage > 0) {
    const next = bloodlineNextStage(definition, bloodline.stage)
    if (!next) break
    if (bloodline.purity < next.purity || bodyStage < next.bodyStage) break
    bloodline.stage = next.stage
    advanced = true
  }
  return advanced
}

function bloodlineView(
  state: GameSaveData,
  registry: ContentRegistry,
  physique: CharacterPhysiqueDefinition | undefined,
): BloodlineView {
  const options = [...registry.bloodlines.values()].map((definition) => {
    const cost = actionCostView(
      state,
      registry,
      definition.acquisition.cultivation,
      definition.acquisition.resources,
      definition.acquisition.items,
    )
    const affinity = physiqueAffinity(physique, definition)
    const initialPurity = Math.min(80, 20 + Math.round(affinity * 100))
    const bodyGateMet = state.player.body.stage >= definition.acquisition.bodyStage
    const hasBloodline = Boolean(state.player.bloodline)
    let blockedReason: string | undefined
    if (hasBloodline) blockedReason = '你身上已有一条血脉。若要换血，须先断去旧血。'
    else if (!bodyGateMet) {
      blockedReason = `体魄需至${bodyStageDefinition(definition.acquisition.bodyStage).name}。`
    } else if (!cost.enough) blockedReason = '修为、资源或引子不足。'
    return {
      definition,
      affinity,
      initialPurity,
      cost,
      bodyGateMet,
      hasBloodline,
      canAcquire: !blockedReason,
      blockedReason,
      skillUnlocked: false,
    }
  })

  const activeState = state.player.bloodline
  const definition = activeState ? registry.bloodlines.get(activeState.id) : undefined
  if (!activeState || !definition) {
    return {
      active: false,
      stageName: '无血脉',
      stageDescription: '旧血尚未入体。你可以从下方择一条血脉承载，但同一时间只能有一条。',
      purity: 0,
      stage: 0,
      nextStagePurity: 20,
      bodyGateMet: true,
      skillUnlocked: false,
      canAwaken: false,
      awakenChance: 0,
      severCost: actionCostView(state, registry, 0, {}, {}),
      options,
    }
  }

  const currentStage = bloodlineStageDefinition(definition, activeState.stage)
  const nextStage = bloodlineNextStage(definition, activeState.stage)
  const contribution = bloodlineContribution(definition, activeState)
  const refineCost = bloodlineRefineCostView(state, registry, definition, activeState.stage)
  const readyAt = flagNumber(state, BLOODLINE_AWAKEN_READY)
  const awakenCooldown = Math.max(0, Math.ceil(readyAt - monthOf(state)))
  const awakenBacklash = hasStatus(state, BLOODLINE_BACKLASH_STATUS)
  const canAwaken =
    activeState.stage === 0 &&
    activeState.purity >= 20 &&
    state.player.body.stage >= 1 &&
    awakenCooldown === 0 &&
    !awakenBacklash
  let awakenBlockedReason: string | undefined
  if (activeState.stage > 0) awakenBlockedReason = '旧血已经苏醒。'
  else if (activeState.purity < 20) awakenBlockedReason = '纯度不足二十，旧血还未被唤醒。'
  else if (state.player.body.stage < 1) awakenBlockedReason = '体魄至少需到淬皮，才承得住苏醒的血。'
  else if (awakenCooldown > 0) awakenBlockedReason = `血脉仍在躁动，还需 ${awakenCooldown} 个月。`
  else if (awakenBacklash) awakenBlockedReason = '上次唤醒失败留下的反噬还在。'

  const bodyGateMet = nextStage
    ? state.player.body.stage >= nextStage.bodyStage
    : false
  let refineBlockedReason: string | undefined
  if (activeState.stage >= 5) refineBlockedReason = '血脉已至祖血，再无更高纯度。'
  else if (!refineCost.enough) refineBlockedReason = '修为、资源或引子不足。'
  else if (activeState.purity >= 100) refineBlockedReason = '纯度已满，只待体魄跟上。'

  const atMaxPurity = activeState.purity >= 100
  return {
    active: true,
    definition,
    state: activeState,
    stageName: currentStage.name,
    stageDescription: currentStage.description,
    purity: activeState.purity,
    stage: activeState.stage,
    nextStage,
    nextStagePurity: nextStage?.purity ?? 100,
    bodyGateMet,
    skillUnlocked: activeState.stage >= definition.skillUnlockStage,
    skill: bloodlineSkillForCombat(definition, activeState.stage),
    stats: contribution.stats,
    mods: contribution.mods,
    canAwaken,
    awakenChance: bloodlineAwakenChance(state, physique, definition),
    awakenBlockedReason,
    refine: {
      cost: refineCost,
      purityGain: definition.refinement.purityGain,
      atMaxPurity,
      nextStage,
      bodyGateMet,
      canRefine: !refineBlockedReason,
      readyAtMonths: 0,
      blockedReason: refineBlockedReason,
    },
    severCost: actionCostView(
      state,
      registry,
      definition.sever.cultivation,
      definition.sever.resources,
      {},
    ),
    options,
  }
}

export function characterBodyView(
  state: GameSaveData,
  registry: ContentRegistry,
): CharacterBodyView {
  const physique = registry.physiques.get(state.player.physiqueId)
  const physiqueEffect = physiqueContribution(physique, state.player.body.stage)
  const progress = bodyProgressInfo(state.player.body.temper, state.player.body.stage)
  const path = bodyPathDefinition(state.player.body.path)
  const balance = bodyBalanceInfo(state.player.body, state.player.realm, state.player.stage)
  const sheet = computeCharacterSheet(state, registry)
  const readyAt = flagNumber(state, 'path.readyAt')
  const pathCooldown = Math.max(0, Math.ceil(readyAt - monthOf(state)))
  return {
    physiqueId: state.player.physiqueId,
    physique,
    physiqueAwakenings: physiqueEffect.awakenings,
    temper: state.player.body.temper,
    stage: bodyStageDefinition(state.player.body.stage),
    stageProgress: progress,
    path,
    balance,
    paths: [
      ...['law', 'dual', 'body'].map((id) => {
        const definition = bodyPathDefinition(id as BodyPath)
        const active = definition.id === state.player.body.path
        let blockedReason: string | undefined
        if (active) blockedReason = '当前路径。'
        else if (pathCooldown > 0) blockedReason = `刚换过路径，还需 ${pathCooldown} 个月。`
        return {
          ...definition,
          active,
          canSelect: !blockedReason,
          blockedReason,
        }
      }),
    ],
    breakthrough: bodyBreakthroughView(state, registry, physique),
    manualTemper: manualTemperView(state, registry),
    bodyTemperMultiplier: bodyGainMultiplier(state, registry),
    cultivationMultiplier: sheet.cultivationMultiplier,
    healthRatio: Math.max(0, Math.min(1, state.player.health / sheet.maxHealth)),
    bloodline: bloodlineView(state, registry, physique),
  }
}

export function temperBody(
  state: GameSaveData,
  registry: ContentRegistry,
): CharacterActionResult {
  if (state.player.body.stage >= BODY_MAX_STAGE) {
    return { ok: false, state, message: '体魄已至不漏，日常淬体不再增益。' }
  }
  const readyAt = flagNumber(state, MANUAL_TEMPER_READY)
  if (monthOf(state) < readyAt) {
    return {
      ok: false,
      state,
      message: `刚淬过一轮，还需 ${Math.ceil(readyAt - monthOf(state))} 个月。`,
    }
  }
  const cost = manualTemperCost(state)
  if (state.player.cultivation < cost.cultivation) {
    return {
      ok: false,
      state,
      message: `修为不足，还差 ${Math.ceil(cost.cultivation - state.player.cultivation)}。`,
    }
  }
  if (!canPayResources(state, cost.resources)) {
    return { ok: false, state, message: '灵石或灵草不足，淬体池生不起火。' }
  }

  const next = cloneGameSaveData(state)
  next.player.cultivation -= cost.cultivation
  payResources(next, cost.resources)
  const gain = manualTemperGain(next, registry)
  next.player.body.temper += gain
  next.player.health = Math.max(1, next.player.health - Math.round(gain * 0.35))
  next.player.body.flags[MANUAL_TEMPER_READY] = monthOf(next) + MANUAL_TEMPER_COOLDOWN
  clampHealth(next, registry)
  return {
    ok: true,
    state: next,
    message: `淬体一轮，体魄淬炼值 +${Math.round(gain)}。气血被烧去一些，记得调息。`,
  }
}

export function setBodyPath(
  state: GameSaveData,
  path: BodyPath,
): CharacterActionResult {
  if (state.player.body.path === path) {
    return { ok: false, state, message: '你已在走这条路。' }
  }
  const readyAt = flagNumber(state, 'path.readyAt')
  if (monthOf(state) < readyAt) {
    return {
      ok: false,
      state,
      message: `经脉刚改过一次方向，还需 ${Math.ceil(readyAt - monthOf(state))} 个月才能再改。`,
    }
  }
  const next = cloneGameSaveData(state)
  next.player.body.path = path
  next.player.body.pathChangedAtMonths = monthOf(next)
  next.player.body.flags['path.readyAt'] = monthOf(next) + PATH_CHANGE_COOLDOWN
  return {
    ok: true,
    state: next,
    message: `修行路径改为${bodyPathDefinition(path).name}。此后修行与淬体的分配都会随之改变。`,
  }
}

export function attemptBodyBreakthrough(
  state: GameSaveData,
  registry: ContentRegistry,
): CharacterActionResult {
  const physique = registry.physiques.get(state.player.physiqueId)
  const view = bodyBreakthroughView(state, registry, physique)
  if (!view.ready) {
    return { ok: false, state, message: view.blockedReason ?? '此时不宜破体。' }
  }

  const next = cloneGameSaveData(state)
  const rng = Rng.fromState(next.rng)
  const roll = rng.next()
  next.rng = rng.getState()
  const success = roll < view.chance
  if (success) {
    next.player.body.stage += 1
    next.player.body.flags[BODY_BREAKTHROUGH_READY] = monthOf(next) + BREAKTHROUGH_COOLDOWN
    const bloodlineState = next.player.bloodline
    const bloodlineDefinition = bloodlineState
      ? registry.bloodlines.get(bloodlineState.id)
      : undefined
    const bloodlineAdvanced =
      bloodlineState && bloodlineDefinition
        ? syncBloodlineStage(bloodlineDefinition, bloodlineState, next.player.body.stage)
        : false
    const sheet = computeCharacterSheet(next, registry)
    next.player.health = sheet.maxHealth
    return {
      ok: true,
      state: next,
      message: bloodlineAdvanced
        ? `骨血齐鸣，体魄踏入${bodyStageDefinition(next.player.body.stage).name}；旧血随之翻涌，血脉也醒了一阶。气血尽复。`
        : `骨血齐鸣，体魄踏入${bodyStageDefinition(next.player.body.stage).name}。气血尽复。`,
    }
  }

  const lost = next.player.body.temper * 0.35
  next.player.body.temper = Math.max(0, next.player.body.temper - lost)
  next.player.health = Math.max(1, Math.round(next.player.health * 0.55))
  next.player.statuses.push({
    id: BODY_BACKLASH_STATUS,
    monthsRemaining: 3,
    source: '破体反噬',
  })
  next.player.body.flags[BODY_BREAKTHROUGH_READY] = monthOf(next) + BREAKTHROUGH_COOLDOWN
  return {
    ok: true,
    state: next,
    message: `破体失败，筋骨被震回原处。淬体值 -${Math.round(lost)}，三个月内不宜再冲。`,
  }
}

export function acquireBloodline(
  state: GameSaveData,
  bloodlineId: string,
  registry: ContentRegistry,
): CharacterActionResult {
  const definition = registry.bloodlines.get(bloodlineId)
  if (!definition) return { ok: false, state, message: '这条血脉并不在龙汉之世。' }
  if (state.player.bloodline) {
    return { ok: false, state, message: '你身上已有一条血脉。若要换血，须先断去旧血。' }
  }
  if (state.player.body.stage < definition.acquisition.bodyStage) {
    return {
      ok: false,
      state,
      message: `体魄未到${bodyStageDefinition(definition.acquisition.bodyStage).name}，强纳旧血只会伤身。`,
    }
  }
  const cost = definition.acquisition
  if (state.player.cultivation < cost.cultivation) {
    return {
      ok: false,
      state,
      message: `修为不足，还差 ${Math.ceil(cost.cultivation - state.player.cultivation)}。`,
    }
  }
  if (!canPayResources(state, cost.resources)) {
    return { ok: false, state, message: '灵石或灵草不足，承载仪式无法维持。' }
  }
  if (!canPayItems(state, cost.items)) {
    return { ok: false, state, message: '引子不齐，旧血不会应你。' }
  }

  const next = cloneGameSaveData(state)
  next.player.cultivation -= cost.cultivation
  payResources(next, cost.resources)
  payItems(next, cost.items)
  const physique = registry.physiques.get(next.player.physiqueId)
  const affinity = physiqueAffinity(physique, definition)
  const purity = Math.min(80, 20 + Math.round(affinity * 100))
  next.player.bloodline = {
    id: definition.id,
    purity,
    stage: 0,
    flags: {},
  }
  clampHealth(next, registry)
  return {
    ok: true,
    state: next,
    message: `旧血入体，${definition.name}尚在沉寂。纯度 ${purity}，需以炼血与体魄将其唤醒。`,
  }
}

export function refineBloodline(
  state: GameSaveData,
  registry: ContentRegistry,
): CharacterActionResult {
  const active = state.player.bloodline
  if (!active) return { ok: false, state, message: '你身上还没有血脉。' }
  const definition = registry.bloodlines.get(active.id)
  if (!definition) return { ok: false, state, message: '这条血脉的旧记已经散了。' }
  if (active.stage >= 5) return { ok: false, state, message: '血脉已至祖血，再无更高纯度。' }
  if (active.purity >= 100) {
    return { ok: false, state, message: '纯度已满，只待体魄跟上。' }
  }
  const cost = bloodlineRefineCostView(state, registry, definition, active.stage)
  if (!cost.enough) {
    return { ok: false, state, message: '修为、资源或引子不足，炼血无法继续。' }
  }
  const dormant = active.stage === 0

  const next = cloneGameSaveData(state)
  const bloodline = next.player.bloodline
  if (!bloodline) return { ok: false, state, message: '你身上还没有血脉。' }
  next.player.cultivation -= cost.cultivation
  payResources(next, definition.refinement.resources)
  payItems(next, definition.refinement.items)
  bloodline.purity = Math.min(100, bloodline.purity + definition.refinement.purityGain)
  bloodline.refinedAtMonths = monthOf(next)
  const advanced = syncBloodlineStage(definition, bloodline, next.player.body.stage)
  const nextStage = bloodlineNextStage(definition, bloodline.stage)
  const bodyBlocked =
    nextStage !== undefined &&
    bloodline.purity >= nextStage.purity &&
    next.player.body.stage < nextStage.bodyStage
  clampHealth(next, registry)
  if (advanced) {
    return {
      ok: true,
      state: next,
      message: `旧血更浓，血脉踏入${bloodlineStageDefinition(definition, bloodline.stage).name}。纯度 ${bloodline.purity}。`,
    }
  }
  return {
    ok: true,
    state: next,
    message: dormant
      ? `旧血尚未苏醒，但这一轮滋养让它更浓。纯度升至 ${bloodline.purity}。`
      : bodyBlocked
        ? `纯度已至 ${bloodline.purity}，但体魄未到${bodyStageDefinition(nextStage?.bodyStage ?? 0).name}，血脉暂不能再进。`
        : `炼血一轮，纯度 +${definition.refinement.purityGain}，现为 ${bloodline.purity}。`,
  }
}

export function awakenBloodline(
  state: GameSaveData,
  registry: ContentRegistry,
): CharacterActionResult {
  const active = state.player.bloodline
  if (!active) return { ok: false, state, message: '你身上还没有血脉。' }
  const definition = registry.bloodlines.get(active.id)
  if (!definition) return { ok: false, state, message: '这条血脉的旧记已经散了。' }
  if (active.stage > 0) return { ok: false, state, message: '旧血已经苏醒。' }
  if (active.purity < 20) {
    return { ok: false, state, message: '纯度不足二十，旧血听不见你。' }
  }
  if (state.player.body.stage < 1) {
    return { ok: false, state, message: '体魄至少需到淬皮，才承得住苏醒的血。' }
  }
  const readyAt = flagNumber(state, BLOODLINE_AWAKEN_READY)
  if (monthOf(state) < readyAt) {
    return {
      ok: false,
      state,
      message: `血脉仍在躁动，还需 ${Math.ceil(readyAt - monthOf(state))} 个月。`,
    }
  }
  if (hasStatus(state, BLOODLINE_BACKLASH_STATUS)) {
    return { ok: false, state, message: '上次唤醒失败留下的反噬还在，再试容易伤根。' }
  }

  const physique = registry.physiques.get(state.player.physiqueId)
  const chance = bloodlineAwakenChance(state, physique, definition)
  const next = cloneGameSaveData(state)
  const rng = Rng.fromState(next.rng)
  const roll = rng.next()
  next.rng = rng.getState()
  const success = roll < chance
  const bloodline = next.player.bloodline
  if (!bloodline) return { ok: false, state, message: '你身上还没有血脉。' }
  next.player.body.flags[BLOODLINE_AWAKEN_READY] = monthOf(next) + AWAKEN_COOLDOWN
  if (success) {
    bloodline.stage = 1
    syncBloodlineStage(definition, bloodline, next.player.body.stage)
    clampHealth(next, registry)
    return {
      ok: true,
      state: next,
      message: `旧血苏醒，${definition.name}踏入${bloodlineStageDefinition(definition, bloodline.stage).name}。`,
    }
  }

  bloodline.purity = Math.max(0, bloodline.purity - 10)
  next.player.health = Math.max(1, Math.round(next.player.health * 0.6))
  next.player.statuses.push({
    id: BLOODLINE_BACKLASH_STATUS,
    monthsRemaining: 3,
    source: '血脉反噬',
  })
  return {
    ok: true,
    state: next,
    message: `唤醒失败，旧血在经脉里翻涌了一场。纯度 -10，三个月内不宜再试。`,
  }
}

export function severBloodline(
  state: GameSaveData,
  registry: ContentRegistry,
): CharacterActionResult {
  const active = state.player.bloodline
  if (!active) return { ok: false, state, message: '你身上还没有血脉。' }
  const definition = registry.bloodlines.get(active.id)
  if (!definition) return { ok: false, state, message: '这条血脉的旧记已经散了。' }
  const cost = actionCostView(
    state,
    registry,
    definition.sever.cultivation,
    definition.sever.resources,
    {},
  )
  if (!cost.enough) {
    return { ok: false, state, message: '修为或资源不足，断血会要了半条命。' }
  }

  const next = cloneGameSaveData(state)
  next.player.cultivation -= definition.sever.cultivation
  payResources(next, definition.sever.resources)
  delete next.player.bloodline
  next.player.health = Math.max(1, Math.round(next.player.health * 0.65))
  next.player.statuses.push({
    id: BODY_BACKLASH_STATUS,
    monthsRemaining: 3,
    source: '断血反噬',
  })
  next.player.flags['body.severedBloodline'] = definition.id
  clampHealth(next, registry)
  return {
    ok: true,
    state: next,
    message: `你亲手断去${definition.name}。旧血离体时很安静，像退了一次潮。`,
  }
}