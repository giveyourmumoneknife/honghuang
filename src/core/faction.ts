import type { FactionId, ResourceCost } from '@/types/common'
import type { FactionDefinition, RankDefinition, TechniqueDefinition } from '@/types/content'
import type { GameSaveData } from '@/types/state'
import { evaluateRequirements } from './conditions'
import { autoEquipTechnique } from './divine'
import { cloneGameSaveData } from './state'
import { calendarFromMonths } from './time'

export const FACTION_DUTY_COOLDOWN_MONTHS = 6

export type FactionActionFailure =
  | 'ending'
  | 'missing'
  | 'not-member'
  | 'already-member'
  | 'other-member'
  | 'requirements'
  | 'resources'
  | 'max-rank'
  | 'rank'
  | 'known'
  | 'contribution'
  | 'reputation'
  | 'cooldown'
  | 'not-allowed'

export interface FactionActionResult {
  ok: boolean
  state: GameSaveData
  message: string
  failure?: FactionActionFailure
  cooldownRemaining?: number
}

export function findPlayerFaction(state: GameSaveData): FactionId | undefined {
  return Object.values(state.campaign.world.factions).find((faction) => faction.membership)?.id
}

export function factionRankTitle(
  definition: FactionDefinition | undefined,
  rank: number,
): string {
  return definition?.ranks.find((entry) => entry.order === rank)?.title ?? '门外客'
}

export function nextRankDefinition(
  definition: FactionDefinition,
  rank: number,
): RankDefinition | undefined {
  return [...definition.ranks]
    .sort((left, right) => left.order - right.order)
    .find((entry) => entry.order > rank)
}

export function promotionCost(rankOrder: number): { contribution: number; reputation: number } {
  if (rankOrder <= 1) return { contribution: 0, reputation: 0 }
  if (rankOrder === 2) return { contribution: 20, reputation: 5 }
  return { contribution: 50, reputation: 20 }
}

export function factionTechniqueRank(technique: TechniqueDefinition): number {
  if (technique.tier >= 4) return 3
  if (technique.tier >= 3) return 2
  return 1
}

export function factionTechniqueCost(technique: TechniqueDefinition): {
  contribution: number
  spiritStones: number
} {
  return {
    contribution: technique.tier * 12,
    spiritStones: technique.tier * 20,
  }
}

function canPay(cost: ResourceCost | undefined, state: GameSaveData): boolean {
  if (!cost) return true
  return Object.entries(cost).every(([key, amount]) => {
    if (!amount || amount <= 0) return true
    return (state.player.resources[key as keyof typeof state.player.resources] ?? 0) >= amount
  })
}

function payCost(state: GameSaveData, cost: ResourceCost | undefined): void {
  if (!cost) return
  for (const [key, amount] of Object.entries(cost)) {
    if (!amount || amount <= 0) continue
    const resource = key as keyof typeof state.player.resources
    state.player.resources[resource] = Math.max(
      0,
      (state.player.resources[resource] ?? 0) - amount,
    )
  }
}

function appendFactionChronicle(
  state: GameSaveData,
  id: string,
  title: string,
  text: string,
): void {
  if (state.chronicle.some((entry) => entry.id === id)) return
  state.chronicle.push({
    id,
    eraId: state.campaign.currentEra,
    title,
    text,
    year: calendarFromMonths(state.clock.elapsedMonths).year,
  })
}

function monthNow(state: GameSaveData): number {
  return Math.floor(state.clock.elapsedMonths)
}

function scheduleFactionScene(
  state: GameSaveData,
  eventId: string | undefined,
  delayMonths: number,
): void {
  if (!eventId) return
  state.eventRuntime.scheduled.push({
    id: `schedule.${state.eventRuntime.nextSequence}`,
    eventId,
    dueMonths: state.clock.elapsedMonths + delayMonths,
  })
  state.eventRuntime.nextSequence += 1
}

export function joinFaction(
  state: GameSaveData,
  definition: FactionDefinition,
): FactionActionResult {
  if (state.campaign.ending) {
    return { ok: false, state, message: '此劫已定，势力不再收录新的名字。', failure: 'ending' }
  }
  if (!definition.joinable || !definition.join) {
    return { ok: false, state, message: `${definition.name}不从门外收人。`, failure: 'not-allowed' }
  }
  const currentMembership = findPlayerFaction(state)
  if (currentMembership === definition.id) {
    return { ok: false, state, message: `你已在${definition.name}的名册上。`, failure: 'already-member' }
  }
  if (currentMembership) {
    return {
      ok: false,
      state,
      message: '一身只能先受一家的印。要入此门，需先与旧势力作了断。',
      failure: 'other-member',
    }
  }

  const requirements = evaluateRequirements(state, definition.join.requirements)
  if (!requirements.ok) {
    return {
      ok: false,
      state,
      message: `入门因缘未足：${definition.join.description}`,
      failure: 'requirements',
    }
  }
  if (!canPay(definition.join.entryCost, state)) {
    return { ok: false, state, message: '入门所需的资财不够。', failure: 'resources' }
  }

  const next = cloneGameSaveData(state)
  payCost(next, definition.join.entryCost)
  const faction = next.campaign.world.factions[definition.id] ?? {
    id: definition.id,
    membership: false,
    rank: 0,
    contribution: 0,
    reputation: 0,
    fortune: 0,
    flags: {},
  }
  faction.membership = true
  faction.rank = Math.max(1, faction.rank)
  faction.reputation += 5
  faction.flags['joined_year'] = calendarFromMonths(next.clock.elapsedMonths).year
  next.campaign.world.factions[definition.id] = faction

  appendFactionChronicle(
    next,
    `chronicle:faction:${definition.id}:joined`,
    `受印入${definition.name}`,
    definition.join.description,
  )
  scheduleFactionScene(next, definition.join.entryEventId, 2)
  next.eventRuntime.rumors.push({
    id: `rumor.faction.${definition.id}.joined`,
    text: `有人在${definition.name}的名册上添了一个新名字。${definition.join.description.split('。')[0]}。`,
    createdAtMonths: next.clock.elapsedMonths,
  })

  return {
    ok: true,
    state: next,
    message: `你受了${definition.name}的印，成为${factionRankTitle(definition, faction.rank)}。`,
  }
}

export function performFactionDuty(
  state: GameSaveData,
  definition: FactionDefinition,
): FactionActionResult {
  if (state.campaign.ending) {
    return { ok: false, state, message: '此劫已定，门中不再派下新的差事。', failure: 'ending' }
  }
  const faction = state.campaign.world.factions[definition.id]
  if (!faction?.membership) {
    return { ok: false, state, message: `你还没有在${definition.name}中领受差事。`, failure: 'not-member' }
  }
  const lastDuty = faction.flags['duty_last_month']
  if (typeof lastDuty === 'number') {
    const readyAt = lastDuty + FACTION_DUTY_COOLDOWN_MONTHS
    const remaining = readyAt - state.clock.elapsedMonths
    if (remaining > 0) {
      return {
        ok: false,
        state,
        message: `门中刚派过一桩事，还需 ${Math.ceil(remaining)} 个月才会再想起你。`,
        failure: 'cooldown',
        cooldownRemaining: remaining,
      }
    }
  }

  const next = cloneGameSaveData(state)
  const nextFaction = next.campaign.world.factions[definition.id]
  if (!nextFaction) {
    return { ok: false, state, message: '势力名录残缺，无法派差。', failure: 'missing' }
  }
  const rank = Math.max(1, nextFaction.rank)
  const contribution = 3 + rank * 2
  const reputation = 1 + rank
  const stones = 2 + rank * 2
  nextFaction.contribution += contribution
  nextFaction.reputation += reputation
  nextFaction.flags['duty_last_month'] = monthNow(next)
  nextFaction.flags['duty_count'] = (nextFaction.flags['duty_count'] ?? 0) as number
  if (typeof nextFaction.flags['duty_count'] === 'number') {
    nextFaction.flags['duty_count'] += 1
  }
  next.player.resources.spirit_stones += stones
  next.player.resources.contribution += contribution

  const flavor =
    definition.archetype === 'teaching'
      ? '你替门中做了件不记名的事，回报摆在无光处。'
      : definition.archetype === 'court'
        ? '你替官署跑了一趟旧案，签押的人没有问你姓名。'
        : '你替族中跑了一趟潮路，事不大，却足以让名册往前翻一页。'

  return {
    ok: true,
    state: next,
    message: `${flavor} 贡献 +${contribution}，声望 +${reputation}，灵石 +${stones}。`,
  }
}

export function promoteFaction(
  state: GameSaveData,
  definition: FactionDefinition,
): FactionActionResult {
  if (state.campaign.ending) {
    return { ok: false, state, message: '此劫已定，晋升之试不再开启。', failure: 'ending' }
  }
  const faction = state.campaign.world.factions[definition.id]
  if (!faction?.membership) {
    return { ok: false, state, message: `先入了${definition.name}，才谈得上晋升。`, failure: 'not-member' }
  }
  const target = nextRankDefinition(definition, faction.rank)
  if (!target) {
    return { ok: false, state, message: '你已站在此门能给你的最高处。', failure: 'max-rank' }
  }

  const requirements = evaluateRequirements(state, target.requirements)
  if (!requirements.ok) {
    return {
      ok: false,
      state,
      message: `晋升${target.title}的旧功未齐：${target.trial}`,
      failure: 'requirements',
    }
  }
  const cost = promotionCost(target.order)
  if (faction.contribution < cost.contribution) {
    return {
      ok: false,
      state,
      message: `晋升${target.title}还差 ${Math.ceil(cost.contribution - faction.contribution)} 点贡献。`,
      failure: 'contribution',
    }
  }
  if (faction.reputation < cost.reputation) {
    return {
      ok: false,
      state,
      message: `门中还没有足够的人愿意为你说话（声望需 ${cost.reputation}）。`,
      failure: 'reputation',
    }
  }

  const next = cloneGameSaveData(state)
  const nextFaction = next.campaign.world.factions[definition.id]
  if (!nextFaction) {
    return { ok: false, state, message: '势力名录残缺，无法晋升。', failure: 'missing' }
  }
  nextFaction.contribution -= cost.contribution
  nextFaction.rank = target.order
  nextFaction.reputation += 5
  scheduleFactionScene(next, target.trialEventId, 3)
  appendFactionChronicle(
    next,
    `chronicle:faction:${definition.id}:rank:${target.order}`,
    `${definition.name} · ${target.title}`,
    target.trial,
  )
  next.eventRuntime.rumors.push({
    id: `rumor.faction.${definition.id}.rank.${target.order}`,
    text: `${definition.name}中有人听见你的新称谓：${target.title}。`,
    createdAtMonths: next.clock.elapsedMonths,
  })

  return {
    ok: true,
    state: next,
    message: `你过了“${target.trial}”，成为${target.title}。`,
  }
}

export function learnFactionTechnique(
  state: GameSaveData,
  definition: FactionDefinition,
  technique: TechniqueDefinition,
): FactionActionResult {
  if (state.campaign.ending) {
    return { ok: false, state, message: '此劫已定，门中不再传法。', failure: 'ending' }
  }
  const faction = state.campaign.world.factions[definition.id]
  if (!faction?.membership) {
    return {
      ok: false,
      state,
      message: `先入了${definition.name}，才轮得到门中传法。`,
      failure: 'not-member',
    }
  }
  if (!(definition.techniqueIds ?? []).includes(technique.id)) {
    return {
      ok: false,
      state,
      message: `${definition.name}不传这部《${technique.name}》。`,
      failure: 'not-allowed',
    }
  }
  if (state.player.techniqueIds.includes(technique.id)) {
    return {
      ok: false,
      state,
      message: `你已听过《${technique.name}》的入门，余下的要靠自己参悟。`,
      failure: 'known',
    }
  }
  const requiredRank = factionTechniqueRank(technique)
  if (faction.rank < requiredRank) {
    return {
      ok: false,
      state,
      message: `传《${technique.name}》至少要坐到第 ${requiredRank} 阶。`,
      failure: 'rank',
    }
  }
  const cost = factionTechniqueCost(technique)
  if (faction.contribution < cost.contribution) {
    return {
      ok: false,
      state,
      message: `请传此诀还差 ${Math.ceil(cost.contribution - faction.contribution)} 点贡献。`,
      failure: 'contribution',
    }
  }
  if ((state.player.resources.spirit_stones ?? 0) < cost.spiritStones) {
    return {
      ok: false,
      state,
      message: `供奉传法所需的 ${cost.spiritStones} 灵石还不够。`,
      failure: 'resources',
    }
  }

  const next = cloneGameSaveData(state)
  const nextFaction = next.campaign.world.factions[definition.id]
  if (!nextFaction) {
    return { ok: false, state, message: '势力名录残缺，无法传法。', failure: 'missing' }
  }
  nextFaction.contribution -= cost.contribution
  next.player.resources.spirit_stones -= cost.spiritStones
  next.player.techniqueIds.push(technique.id)
  next.player.techniqueProgress[technique.id] = 0
  autoEquipTechnique(next.player, technique.id)
  appendFactionChronicle(
    next,
    `chronicle:faction:${definition.id}:technique:${technique.id}`,
    `受传《${technique.name}》`,
    `在${definition.name}的门内听完入门，余下每一层都需自行参透。`,
  )
  next.eventRuntime.rumors.push({
    id: `rumor.faction.${definition.id}.technique.${technique.id}`,
    text: `${definition.name}中有人看见你捧走一部旧诀：《${technique.name}》。`,
    createdAtMonths: next.clock.elapsedMonths,
  })

  return {
    ok: true,
    state: next,
    message: `你从${definition.name}受传《${technique.name}》，第一卷已能自行参悟。`,
  }
}

export function leaveFaction(
  state: GameSaveData,
  definition: FactionDefinition,
): FactionActionResult {
  if (state.campaign.ending) {
    return { ok: false, state, message: '此劫已定，旧印也随潮水落了灰。', failure: 'ending' }
  }
  const faction = state.campaign.world.factions[definition.id]
  if (!faction?.membership) {
    return { ok: false, state, message: `你本就不在${definition.name}的名册上。`, failure: 'not-member' }
  }
  if (definition.exit && !definition.exit.allowed) {
    return { ok: false, state, message: `${definition.name}不许人带走自己的名字。`, failure: 'not-allowed' }
  }
  const requirements = evaluateRequirements(state, definition.exit?.requirements ?? [])
  if (!requirements.ok) {
    return {
      ok: false,
      state,
      message: '门中旧誓未解，还不能就此脱身。',
      failure: 'requirements',
    }
  }

  const next = cloneGameSaveData(state)
  const nextFaction = next.campaign.world.factions[definition.id]
  if (!nextFaction) {
    return { ok: false, state, message: '势力名录残缺，无法退门。', failure: 'missing' }
  }
  nextFaction.membership = false
  nextFaction.rank = 0
  nextFaction.contribution = 0
  nextFaction.reputation = Math.max(-50, nextFaction.reputation - 8)
  nextFaction.flags['departed_year'] = calendarFromMonths(next.clock.elapsedMonths).year
  next.player.statuses = next.player.statuses.filter(
    (status) => status.id !== 'status.world.oath_broken',
  )
  next.player.statuses.push({
    id: 'status.world.oath_broken',
    monthsRemaining: 6,
    source: `退出${definition.name}`,
  })
  appendFactionChronicle(
    next,
    `chronicle:faction:${definition.id}:left:${calendarFromMonths(next.clock.elapsedMonths).year}`,
    `退出${definition.name}`,
    definition.exit?.consequence ?? '你交还了旧印，名册上少了一个名字。',
  )

  return {
    ok: true,
    state: next,
    message: definition.exit?.consequence ?? `你退出了${definition.name}。`,
  }
}
