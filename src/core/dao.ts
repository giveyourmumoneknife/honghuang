import type { DaoNodeId, DaoPrincipleId, RealmId, RealmStage } from '@/types/common'
import type { GameSaveData } from '@/types/state'
import type { ContentRegistry } from '@/data/registry'
import { cloneGameSaveData } from './state'

export const DAO_NODE_TIDE_DRAW = 'dao.node.tide.draw'
export const DAO_NODE_TIDE_FILTER = 'dao.node.tide.filter'
export const DAO_NODE_TIDE_STORE = 'dao.node.tide.store'
export const DAO_NODE_WAR_OPENING = 'dao.node.war.opening'
export const DAO_NODE_WAR_BREAK = 'dao.node.war.break'
export const DAO_NODE_WAR_BLOOD = 'dao.node.war.blood'
export const DAO_NODE_KARMA_INSIGHT = 'dao.node.karma.insight'
export const DAO_NODE_KARMA_BURDEN = 'dao.node.karma.burden'
export const DAO_NODE_KARMA_TRIBULATION = 'dao.node.karma.tribulation'

export const DAO_PRINCIPLE_TIDE_LIFE = 'dao.principle.tide_life'
export const DAO_PRINCIPLE_DESPERATE = 'dao.principle.desperate'

/** 五位龙汉世界首领的初退会留下星痕。 */
export const DAO_BOSS_MARK_IDS = [
  'worldboss.longhan.ao_ming',
  'worldboss.longhan.dan_xi',
  'worldboss.longhan.xuan_qi',
  'worldboss.longhan.rahu_greed',
  'worldboss.longhan.kalpa',
] as const

export const DAO_STORY_MARK_EVENT_IDS = [
  'event.longhan.three_clans_covenant',
  'event.longhan.dragon_gate',
  'event.longhan.calamity_breaks',
] as const

const REALM_ORDER: RealmId[] = ['mortal', 'qi_refining', 'foundation', 'golden_core']

const POSITIVE_STATUSES = new Set([
  'status.longhan.clear_mind',
  'status.longhan.ridge_hold',
  'status.longhan.tide_breath',
  'status.longhan.cave_ward',
  'status.longhan.tide_stride',
  'status.longhan.pill_breath',
  'status.longhan.quiet_room',
  'status.longhan.ember_guard',
  'status.longhan.rekindled',
  'status.longhan.tide_recovery',
  'status.longhan.vein_anchor',
  'status.longhan.breakthrough_aid',
])

const NEGATIVE_STATUSES = new Set([
  'status.breakthrough.backlash',
  'status.longhan.spirit_dryness',
  'status.longhan.old_tide_dream',
  'status.longhan.ridge_slowness',
  'status.longhan.raider_wound',
  'status.longhan.crow_pecked',
  'status.longhan.burn_scar',
  'status.longhan.vein_corruption',
  'status.longhan.bone_chill',
  'status.longhan.cave_damp',
  'status.longhan.deep_pressure',
  'status.longhan.ember_forgetting',
  'status.longhan.memory_ash',
  'status.longhan.name_borrowed',
  'status.longhan.vein_silence',
  'status.prologue.cold_shadow',
  'status.world.karma_touched',
  'status.world.wayworn',
])

export type StatusPolarity = 'positive' | 'negative' | 'neutral'

export function statusPolarity(statusId: string): StatusPolarity {
  if (POSITIVE_STATUSES.has(statusId)) return 'positive'
  if (NEGATIVE_STATUSES.has(statusId)) return 'negative'
  return 'neutral'
}

export function daoHasNode(state: GameSaveData, nodeId: DaoNodeId | string): boolean {
  return state.player.dao.nodes.includes(nodeId)
}

export function daoHasPrinciple(
  state: GameSaveData,
  principleId: DaoPrincipleId | string,
): boolean {
  return state.player.dao.principles.includes(principleId)
}

export function daoActivePrincipleId(state: GameSaveData): DaoPrincipleId | undefined {
  return state.player.dao.principles[0]
}

/** 星图点亮的绝对里程碑数；突破时取新旧之差发放星痕。 */
export function daoRealmMilestones(realm: RealmId, stage: RealmStage): number {
  const realmIndex = Math.max(0, REALM_ORDER.indexOf(realm))
  return Math.max(0, Math.min(8, realmIndex * 3 + stage - 4))
}

export function daoSpentMarks(state: GameSaveData, registry: ContentRegistry): number {
  let spent = 0
  for (const nodeId of state.player.dao.nodes) {
    spent += registry.daoNodes.get(nodeId)?.cost ?? 0
  }
  for (const principleId of state.player.dao.principles) {
    spent += registry.daoPrinciples.get(principleId)?.cost ?? 0
  }
  return spent
}

export interface DaoCombatRules {
  firstRoundDamageBonus: number
  killHealPercent: number
  roundHpLoss: number
  cannotFlee: boolean
}

export function daoCombatRules(state: GameSaveData): DaoCombatRules {
  const desperate = daoHasPrinciple(state, DAO_PRINCIPLE_DESPERATE)
  return {
    firstRoundDamageBonus: daoHasNode(state, DAO_NODE_WAR_OPENING) ? 0.3 : 0,
    killHealPercent: daoHasNode(state, DAO_NODE_WAR_BLOOD) ? 0.1 : 0,
    roundHpLoss: desperate ? 0.01 : 0,
    cannotFlee: desperate,
  }
}

/** 承负只在剧情事件的因果里放大收益，日常劳作不受影响。 */
export function daoEventGainMultiplier(
  state: GameSaveData,
  sourceEventId: string | undefined,
): number {
  if (!sourceEventId) return 1
  return daoHasNode(state, DAO_NODE_KARMA_BURDEN) ? 1.5 : 1
}

/** 转劫调整状态持续：顺劫多留一月，避劫早走一月。 */
export function daoStatusMonths(
  state: GameSaveData,
  statusId: string,
  months: number,
): number {
  if (!daoHasNode(state, DAO_NODE_KARMA_TRIBULATION)) return months
  const polarity = statusPolarity(statusId)
  if (polarity === 'positive') return months + 1
  if (polarity === 'negative') return Math.max(1, months - 1)
  return months
}

export interface DaoProductionRules {
  tideCapBonus: number
  tidePerMonthBonus: number
  purityLossMultiplier: number
  overflowToPurity: boolean
  overflowMaxPurity: number
  tendPurityBonus: number
  tideLifePurity: number
  noPurityFloor: number
}

export function daoProductionRules(state: GameSaveData): DaoProductionRules {
  const draw = daoHasNode(state, DAO_NODE_TIDE_DRAW)
  const store = daoHasNode(state, DAO_NODE_TIDE_STORE)
  const filter = daoHasNode(state, DAO_NODE_TIDE_FILTER)
  const tideLife = daoHasPrinciple(state, DAO_PRINCIPLE_TIDE_LIFE)
  return {
    tideCapBonus: (draw ? 4 : 0) + (store ? 6 : 0),
    tidePerMonthBonus: draw ? 0.3 : 0,
    purityLossMultiplier: filter ? 0.5 : 1,
    overflowToPurity: store,
    overflowMaxPurity: store ? 2 : 0,
    tendPurityBonus: filter ? 3 : 0,
    tideLifePurity: tideLife ? 2 : 0,
    noPurityFloor: 30,
  }
}

export interface DaoActionResult {
  ok: boolean
  state: GameSaveData
  message: string
}

function fail(state: GameSaveData, message: string): DaoActionResult {
  return { ok: false, state, message }
}

export function purchaseDaoNode(
  state: GameSaveData,
  registry: ContentRegistry,
  nodeId: DaoNodeId,
): DaoActionResult {
  const node = registry.daoNodes.get(nodeId)
  if (!node) return fail(state, '星图上没有这一枚星。')
  if (state.player.dao.nodes.includes(nodeId)) {
    return fail(state, `「${node.name}」已经亮着。`)
  }
  if (node.requires) {
    const required = registry.daoNodes.get(node.requires)
    if (!state.player.dao.nodes.includes(node.requires)) {
      return fail(state, `要先点亮「${required?.name ?? '前一枚星'}」，这枚星才有落处。`)
    }
  }
  if (state.player.dao.marks < node.cost) {
    return fail(
      state,
      `星痕不足。点「${node.name}」需要 ${node.cost} 点，你手里只有 ${state.player.dao.marks} 点。`,
    )
  }
  const next = cloneGameSaveData(state)
  next.player.dao.marks -= node.cost
  next.player.dao.nodes.push(node.id)
  const labels = node.rules.map((rule) => rule.label).join('、')
  return {
    ok: true,
    state: next,
    message: `「${node.name}」亮起。${labels ? `${labels}已入道途。` : ''}`,
  }
}

export function purchaseDaoPrinciple(
  state: GameSaveData,
  registry: ContentRegistry,
  principleId: DaoPrincipleId,
): DaoActionResult {
  const principle = registry.daoPrinciples.get(principleId)
  if (!principle) return fail(state, '星图上没有这一条道则。')
  const activeId = state.player.dao.principles[0]
  if (activeId) {
    const active = registry.daoPrinciples.get(activeId)
    return fail(
      state,
      `你已经择定「${active?.name ?? '一条道则'}」。道则互斥，一世只能走一条。`,
    )
  }
  const cluster = registry.daoClusters.get(principle.clusterId)
  const clusterNodeIds = cluster?.nodeIds ?? []
  const lit = clusterNodeIds.filter((id) => state.player.dao.nodes.includes(id)).length
  if (lit < principle.requiredNodes) {
    return fail(
      state,
      `「${cluster?.name ?? '这一簇'}」的星还没点全（${lit}/${principle.requiredNodes}），道则无从落下。`,
    )
  }
  if (state.player.dao.marks < principle.cost) {
    return fail(
      state,
      `星痕不足。择定「${principle.name}」需要 ${principle.cost} 点，你手里只有 ${state.player.dao.marks} 点。`,
    )
  }
  const next = cloneGameSaveData(state)
  next.player.dao.marks -= principle.cost
  next.player.dao.principles = [principle.id]
  return {
    ok: true,
    state: next,
    message: `道则落定：「${principle.name}」。${principle.title}。`,
  }
}

export const DAO_RESET_COST = 1

export function resetDao(state: GameSaveData, registry: ContentRegistry): DaoActionResult {
  const dao = state.player.dao
  if (dao.nodes.length === 0 && dao.principles.length === 0) {
    return fail(state, '星图还空着，没有什么可重塑的。')
  }
  if (dao.marks < DAO_RESET_COST) {
    return fail(
      state,
      `重塑道途需要 ${DAO_RESET_COST} 点星痕压住反噬，你手里只有 ${dao.marks} 点。`,
    )
  }
  const refund = daoSpentMarks(state, registry)
  const next = cloneGameSaveData(state)
  next.player.dao.marks += refund - DAO_RESET_COST
  next.player.dao.nodes = []
  next.player.dao.principles = []
  next.player.dao.respecs += 1
  return {
    ok: true,
    state: next,
    message: `星图暗了下去，${refund} 点星痕退回手中（耗去 ${DAO_RESET_COST} 点稳住神魂）。这一次重塑被记在第 ${next.player.dao.respecs} 回。`,
  }
}

/** 迁移与导入时按玩家已有履历补齐星痕。 */
export function daoEarnedFromProgress(state: GameSaveData): number {
  let earned = 1
  earned += daoRealmMilestones(state.player.realm, state.player.stage)
  for (const bossId of DAO_BOSS_MARK_IDS) {
    if (state.worldBosses[bossId]?.firstKilledAtMonths !== undefined) earned += 1
  }
  for (const eventId of DAO_STORY_MARK_EVENT_IDS) {
    const entry = state.eventRuntime.history[eventId]
    if (entry && (entry.count ?? 0) > 0) earned += 1
  }
  return earned
}
