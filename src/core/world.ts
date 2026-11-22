import type { EncounterId, RegionId, ResourceKey, SiteId } from '@/types/common'
import type { RegionDefinition, SiteDefinition } from '@/types/content'
import type { Effect } from '@/types/dsl'
import type { GameSaveData } from '@/types/state'
import { evaluateRequirements } from './conditions'
import { applyEffects } from './effects'
import { Rng } from './rng'
import { cloneGameSaveData } from './state'
import { calendarFromMonths } from './time'

export const TRAVEL_PROGRESS_COST = 10
export const HIDDEN_TRAVEL_PROGRESS_COST = 24
export const SITE_EXPLORE_COST = 6

export type WorldActionFailure =
  | 'ending'
  | 'missing'
  | 'already-here'
  | 'not-current'
  | 'not-adjacent'
  | 'requirements'
  | 'progress'
  | 'hidden'

export interface TravelResult {
  ok: boolean
  state: GameSaveData
  message: string
  reason?: WorldActionFailure
  cost?: number
  firstVisit?: boolean
}

export interface ExploreResult {
  ok: boolean
  state: GameSaveData
  message: string
  reason?: WorldActionFailure
  discovered?: boolean
  gained?: string
  encounterId?: string
}

function adventureYear(state: GameSaveData): number {
  return calendarFromMonths(state.clock.elapsedMonths).year
}

function appendChronicle(
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
    year: adventureYear(state),
  })
}

function ensureRegionState(state: GameSaveData, regionId: RegionId) {
  let region = state.campaign.world.regions[regionId]
  if (!region) {
    region = {
      id: regionId,
      unlocked: false,
      visited: false,
      flags: {},
      unlockedSiteIds: [],
      exploredSites: {},
    }
    state.campaign.world.regions[regionId] = region
  }
  region.exploredSites ??= {}
  region.unlockedSiteIds ??= []
  return region
}

function siteTags(site: SiteDefinition, region: RegionDefinition): Set<string> {
  return new Set([...(region.tags ?? []), ...(site.tags ?? [])])
}

function firstVisitEffects(
  region: RegionDefinition,
  site: SiteDefinition,
  rng: Rng,
): { effects: Effect[]; gained: string } {
  const tags = siteTags(site, region)
  const amount = 2 + region.danger
  const effects: Effect[] = []
  let resource: ResourceKey = 'spirit_stones'
  let count = amount

  if (tags.has('faction_home')) {
    resource = 'spirit_stones'
    count += 2
  } else if (tags.has('fire')) {
    resource = 'spirit_herbs'
  } else if (tags.has('earth') || tags.has('landmark') || tags.has('pillar')) {
    resource = 'ore'
  } else if (tags.has('wilds') || tags.has('beast')) {
    resource = 'beast_cores'
    count = Math.max(1, Math.floor(region.danger / 2))
  } else if (tags.has('abyss') || tags.has('chaos')) {
    resource = 'karma'
    count = 1
  } else if (tags.has('dao') || tags.has('ancestor') || tags.has('origin')) {
    resource = 'merit'
    count = 1
  }

  effects.push({ kind: 'changeResource', resource, amount: count })
  if (tags.has('dao') || tags.has('ancestor') || tags.has('origin')) {
    effects.push({ kind: 'changeDaoguo', amount: 1 })
  }
  if (tags.has('abyss') || tags.has('chaos')) {
    effects.push({
      kind: 'applyStatus',
      statusId: 'status.world.karma_touched',
      months: 3,
      source: `涉足${site.name}`,
    })
  }
  if (region.factionPresence.length > 0) {
    const factionId = region.factionPresence[rng.nextInt(0, region.factionPresence.length)]
    if (factionId) {
      effects.push({
        kind: 'changeFactionState',
        factionId,
        reputationDelta: 2,
      })
    }
  }

  const firstSentence = site.description.split('。')[0] ?? site.description
  effects.push({
    kind: 'addMemory',
    memoryId: `memory.site.${site.id}`,
    text: `你第一次走进${site.name}。${firstSentence}。`,
  })
  effects.push({
    kind: 'addRumor',
    rumorId: `rumor.site.${site.id}`,
    text: `有人从${region.name}带回${site.name}的消息：${firstSentence}。`,
  })

  const resourceLabel: Record<string, string> = {
    spirit_stones: '灵石',
    spirit_herbs: '灵草',
    ore: '灵矿',
    beast_cores: '兽核',
    merit: '功德',
    karma: '因果',
  }
  return {
    effects,
    gained: `${resourceLabel[resource] ?? '物料'} +${count}`,
  }
}

function repeatVisitEffects(
  region: RegionDefinition,
  site: SiteDefinition,
  rng: Rng,
): { effects: Effect[]; gained: string; wounded: boolean } {
  const effects: Effect[] = []
  let gained = ''
  const tags = siteTags(site, region)

  if (rng.chance(0.55)) {
    const resource: ResourceKey =
      tags.has('wilds') || tags.has('beast')
        ? 'beast_cores'
        : tags.has('fire')
          ? 'spirit_herbs'
          : tags.has('earth')
            ? 'ore'
            : 'spirit_stones'
    const amount = 1 + (rng.chance(0.2) ? 1 : 0)
    effects.push({ kind: 'changeResource', resource, amount })
    const labels: Record<string, string> = {
      spirit_stones: '灵石',
      spirit_herbs: '灵草',
      ore: '灵矿',
      beast_cores: '兽核',
    }
    gained = `${labels[resource] ?? '物料'} +${amount}`
  }

  const wounded = region.danger >= 4 && rng.chance(region.danger === 5 ? 0.22 : 0.12)
  if (wounded) {
    effects.push({
      kind: 'applyStatus',
      statusId: 'status.world.wayworn',
      months: 2,
      source: `重探${site.name}`,
    })
  }

  return { effects, gained, wounded }
}

export function travelToRegion(
  state: GameSaveData,
  target: RegionDefinition,
  currentRegion?: RegionDefinition,
): TravelResult {
  if (state.campaign.ending) {
    return { ok: false, state, message: '此劫已定，潮路不再为你展开。', reason: 'ending' }
  }
  if (state.player.regionId === target.id) {
    return { ok: false, state, message: `你已经在${target.name}。`, reason: 'already-here' }
  }

  const targetState = ensureRegionState(state, target.id)
  const cost = target.hidden ? HIDDEN_TRAVEL_PROGRESS_COST : TRAVEL_PROGRESS_COST
  if (state.idle.travelProgress < cost) {
    return {
      ok: false,
      state,
      message: `潮路尚短：需 ${cost} 点行旅，当前只有 ${Math.floor(state.idle.travelProgress)} 点。`,
      reason: 'progress',
      cost,
    }
  }

  const registering = !targetState.unlocked
  if (registering) {
    const adjacent =
      currentRegion?.neighbors.includes(target.id) === true ||
      currentRegion?.id === target.id
    if (!adjacent) {
      return {
        ok: false,
        state,
        message: `${target.name}不在你当前可接上的潮路上。`,
        reason: 'not-adjacent',
      }
    }
    const requirements = evaluateRequirements(state, target.unlockRequirements ?? [])
    if (!requirements.ok) {
      return {
        ok: false,
        state,
        message: `潮路已近，却还差一段因缘才能踏入${target.name}。`,
        reason: 'requirements',
      }
    }
  } else {
    const adjacent =
      currentRegion?.neighbors.includes(target.id) === true ||
      state.campaign.world.regions[target.id]?.visited === true
    if (!adjacent) {
      return {
        ok: false,
        state,
        message: `${target.name}与现处之地没有相接的潮路。`,
        reason: 'not-adjacent',
      }
    }
  }

  const rng = Rng.fromState(state.rng)
  let next = cloneGameSaveData(state)
  next.idle.travelProgress = Math.max(0, next.idle.travelProgress - cost)
  const nextTargetState = ensureRegionState(next, target.id)
  const firstVisit = !nextTargetState.visited
  nextTargetState.unlocked = true
  nextTargetState.visited = true
  next.player.regionId = target.id

  if (firstVisit) {
    nextTargetState.flags.first_visit_year = adventureYear(next)
    appendChronicle(
      next,
      `chronicle:region:${target.id}`,
      `初至${target.name}`,
      target.description,
    )
    if (rng.chance(0.35)) {
      next = applyEffects(next, [
        {
          kind: 'addRumor',
          rumorId: `rumor.region.${target.id}`,
          text: `${target.name}的潮路第一次被人走通。${target.description.split('。')[0]}。`,
        },
      ])
    }
  }

  next.rng = rng.getState()
  return {
    ok: true,
    state: next,
    message: firstVisit
      ? `你沿着潮路第一次踏入${target.name}，耗去 ${cost} 点行旅。`
      : `你从旧路回到${target.name}，耗去 ${cost} 点行旅。`,
    cost,
    firstVisit,
  }
}

export function exploreSite(
  state: GameSaveData,
  region: RegionDefinition,
  site: SiteDefinition,
  encounterCandidates: EncounterId[] = [],
): ExploreResult {
  if (state.campaign.ending) {
    return { ok: false, state, message: '此劫已定，旧地不再生出新的回声。', reason: 'ending' }
  }
  if (state.player.regionId !== region.id) {
    return {
      ok: false,
      state,
      message: `要涉足${site.name}，得先到${region.name}去。`,
      reason: 'not-current',
    }
  }
  if (state.idle.travelProgress < SITE_EXPLORE_COST) {
    return {
      ok: false,
      state,
      message: `涉足此地需 ${SITE_EXPLORE_COST} 点行旅，当前只有 ${Math.floor(state.idle.travelProgress)} 点。`,
      reason: 'progress',
    }
  }

  const regionState = ensureRegionState(state, region.id)
  const alreadyUnlocked = regionState.unlockedSiteIds.includes(site.id)
  const requirements = evaluateRequirements(state, site.unlockRequirements)
  if (site.hidden && !alreadyUnlocked && !requirements.ok) {
    return {
      ok: false,
      state,
      message: `此处云雾未开，还看不见${site.name}。`,
      reason: 'hidden',
    }
  }
  if (!site.hidden && !requirements.ok) {
    return {
      ok: false,
      state,
      message: `${site.name}尚未向你显露真正的入口。`,
      reason: 'requirements',
    }
  }

  const rng = Rng.fromState(state.rng)
  let next = cloneGameSaveData(state)
  const nextRegion = ensureRegionState(next, region.id)
  next.idle.travelProgress = Math.max(0, next.idle.travelProgress - SITE_EXPLORE_COST)

  const discovered = site.hidden && !alreadyUnlocked
  if (discovered) {
    nextRegion.unlockedSiteIds.push(site.id)
  }

  const previousVisits = nextRegion.exploredSites[site.id] ?? 0
  const firstVisit = previousVisits === 0
  nextRegion.exploredSites[site.id] = previousVisits + 1

  let effects: Effect[] = []
  let gained = ''
  let wounded = false
  if (firstVisit) {
    const result = firstVisitEffects(region, site, rng)
    effects = result.effects
    gained = result.gained
    appendChronicle(
      next,
      `chronicle:site:${site.id}`,
      discovered ? `寻得${site.name}` : `涉足${site.name}`,
      site.description,
    )
  } else {
    const result = repeatVisitEffects(region, site, rng)
    effects = result.effects
    gained = result.gained
    wounded = result.wounded
  }

  if (effects.length > 0) {
    next = applyEffects(next, effects)
  }
  const finalRegion = ensureRegionState(next, region.id)
  const cleared = (encounterId: string) =>
    finalRegion.flags[`encounter_cleared.${encounterId}`] === true
  const candidates = encounterCandidates.filter((encounterId) => !cleared(encounterId))
  let encounterId: string | undefined
  if (
    candidates.length > 0 &&
    rng.chance(Math.min(0.45, 0.1 + region.danger * 0.035))
  ) {
    const chosen = candidates[rng.nextInt(0, candidates.length)]
    next.eventRuntime.pendingEncounters.push({
      id: `encounter.${next.eventRuntime.nextSequence}`,
      encounterId: chosen,
      fleeAllowed: true,
      createdAtMonths: next.clock.elapsedMonths,
    })
    next.eventRuntime.nextSequence += 1
    encounterId = chosen
  }
  next.rng = rng.getState()

  let message: string
  if (discovered) {
    message = `你拨开${region.name}的旧雾，第一次看见${site.name}。${gained ? `${gained}。` : ''}`
  } else if (firstVisit) {
    message = `你在${site.name}留下第一道足迹。${gained ? `${gained}。` : ''}`
  } else if (wounded) {
    message = `${site.name}收走了你的一些力气。${gained ? `你带回了${gained}，` : '你'}但身上添了伤。`
  } else {
    message = gained
      ? `旧地仍有余响：${gained}。`
      : `${site.name}这次没有交出新的东西。`
  }

  return {
    ok: true,
    state: next,
    message,
    discovered,
    gained,
    encounterId,
    reason: undefined,
  }
}

export function currentRegionState(state: GameSaveData) {
  return state.campaign.world.regions[state.player.regionId]
}

export function siteHasBeenExplored(state: GameSaveData, siteId: SiteId): boolean {
  return (currentRegionState(state)?.exploredSites[siteId] ?? 0) > 0
}
