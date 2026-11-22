import type { RealmId, RealmStage } from '@/types/common'
import type { Requirement } from '@/types/dsl'
import type { GameSaveData } from '@/types/state'

const REALM_ORDER: Record<RealmId, number> = {
  mortal: 0,
  qi_refining: 1,
  foundation: 2,
  golden_core: 3,
}

function realmRank(realm: RealmId, stage: RealmStage): number {
  return REALM_ORDER[realm] * 3 + (stage - 1)
}

function flagMatches(actual: boolean | number | string | undefined, expected: unknown): boolean {
  if (expected === undefined) return Boolean(actual)
  return actual === expected
}

function requirementMatchesRequirement(
  state: GameSaveData,
  requirement: Requirement,
): boolean {
  switch (requirement.kind) {
    case 'flag':
      // Event flags live in world.flags so they survive reincarnation.
      return flagMatches(state.campaign.world.flags[requirement.flag], requirement.value)
    case 'era':
      return state.campaign.currentEra === requirement.eraId
    case 'phase':
      return (
        state.campaign.currentEra === requirement.eraId &&
        state.campaign.world.phaseId === requirement.phaseId
      )
    case 'factionMembership': {
      const faction = state.campaign.world.factions[requirement.factionId]
      if (!faction?.membership) return false
      return requirement.rankAtLeast === undefined || faction.rank >= requirement.rankAtLeast
    }
    case 'factionReputation': {
      const faction = state.campaign.world.factions[requirement.factionId]
      return (faction?.reputation ?? 0) >= requirement.minReputation
    }
    case 'regionUnlocked':
      return state.campaign.world.regions[requirement.regionId]?.unlocked === true
    case 'regionVisited':
      return state.campaign.world.regions[requirement.regionId]?.visited === true
    case 'regionState': {
      const region = state.campaign.world.regions[requirement.regionId]
      return region !== undefined && flagMatches(region.flags[requirement.key], requirement.value)
    }
    case 'realm': {
      const minStage = requirement.minStage ?? 1
      return (
        realmRank(state.player.realm, state.player.stage) >=
        realmRank(requirement.minRealm, minStage)
      )
    }
    case 'bodyStage':
      return state.player.body.stage >= requirement.minStage
    case 'bloodlineStage':
      return (state.player.bloodline?.stage ?? 0) >= requirement.minStage
    case 'item':
      return (state.player.inventory[requirement.itemId] ?? 0) >= (requirement.count ?? 1)
    case 'technique':
      return state.player.techniqueIds.includes(requirement.techniqueId)
    case 'petNotOwned':
      return !state.player.petIds.includes(requirement.petId)
    case 'mountNotOwned':
      return !state.player.mountIds.includes(requirement.mountId)
    case 'treasureNotOwned':
      return !state.player.treasureIds.includes(requirement.treasureId)
    case 'partnerFavor': {
      const favor = state.player.partnerFavor[requirement.partnerId]
      return favor !== undefined && favor >= requirement.minTier
    }
    case 'all':
      return requirement.of.every((child) => requirementMatchesRequirement(state, child))
    case 'any':
      return requirement.of.some((child) => requirementMatchesRequirement(state, child))
    case 'not':
      return !requirementMatchesRequirement(state, requirement.of)
    default: {
      const exhaustive: never = requirement
      throw new Error(`未知条件类型：${String(exhaustive)}`)
    }
  }
}

export function requirementMatches(state: GameSaveData, requirement: Requirement): boolean {
  return requirementMatchesRequirement(state, requirement)
}

function collectUnmet(
  state: GameSaveData,
  requirement: Requirement,
): Requirement[] {
  if (requirementMatchesRequirement(state, requirement)) return []
  if (requirement.kind === 'all') {
    return requirement.of.flatMap((child) => collectUnmet(state, child))
  }
  return [requirement]
}

export interface RequirementEvaluation {
  ok: boolean
  unmet: Requirement[]
}

export function evaluateRequirements(
  state: GameSaveData,
  requirements: readonly Requirement[],
): RequirementEvaluation {
  const unmet = requirements.flatMap((requirement) => collectUnmet(state, requirement))
  return { ok: unmet.length === 0, unmet }
}
