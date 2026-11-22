import type { EventId, FactionId, RegionId } from '@/types/common'
import type { Effect } from '@/types/dsl'
import type { FactionState, GameSaveData, RegionState } from '@/types/state'
import { cloneGameSaveData, createCaveState } from './state'
import { daoEventGainMultiplier, daoStatusMonths } from './dao'
import { autoEquipTechnique } from './divine'
import { gainFoundation } from './foundation'

export interface EffectApplicationContext {
  sourceEventId?: EventId
}

const PLAYER_CAVE_ID = 'cave.longhan.tide_grotto'

function ensureFaction(state: GameSaveData, factionId: FactionId): FactionState {
  let faction = state.campaign.world.factions[factionId]
  if (!faction) {
    faction = {
      id: factionId,
      membership: false,
      rank: 0,
      contribution: 0,
      reputation: 0,
      fortune: 0,
      flags: {},
    }
    state.campaign.world.factions[factionId] = faction
  }
  return faction
}

function ensureRegion(state: GameSaveData, regionId: RegionId): RegionState {
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
  return region
}

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback
}

function applyEffectToDraft(
  state: GameSaveData,
  effect: Effect,
  context: EffectApplicationContext,
): void {
  switch (effect.kind) {
    case 'setFlag':
      state.campaign.world.flags[effect.flag] = effect.value
      break
    case 'clearFlag':
      delete state.campaign.world.flags[effect.flag]
      break
    case 'scheduleEvent': {
      const delay = Math.max(0, finiteOr(effect.delayMonths ?? 0, 0))
      state.eventRuntime.scheduled.push({
        id: `schedule.${state.eventRuntime.nextSequence}`,
        eventId: effect.eventId,
        dueMonths: state.clock.elapsedMonths + delay,
        sourceEventId: context.sourceEventId,
      })
      state.eventRuntime.nextSequence += 1
      break
    }
    case 'changeFactionState': {
      const faction = ensureFaction(state, effect.factionId)
      if (effect.membership !== undefined) {
        faction.membership = effect.membership
        if (!effect.membership) faction.rank = 0
      }
      if (effect.rank !== undefined) faction.rank = effect.rank
      if (effect.contributionDelta !== undefined) {
        faction.contribution += finiteOr(effect.contributionDelta, 0)
      }
      if (effect.reputationDelta !== undefined) {
        faction.reputation += finiteOr(effect.reputationDelta, 0)
      }
      if (effect.fortuneDelta !== undefined) {
        faction.fortune += finiteOr(effect.fortuneDelta, 0)
      }
      if (effect.flags) {
        Object.assign(faction.flags, effect.flags)
      }
      break
    }
    case 'changeRegionState':
      ensureRegion(state, effect.regionId).flags[effect.key] = effect.value
      break
    case 'unlockSite': {
      const region = ensureRegion(state, effect.regionId)
      if (!region.unlockedSiteIds.includes(effect.siteId)) {
        region.unlockedSiteIds.push(effect.siteId)
      }
      break
    }
    case 'unlockRegion': {
      const region = ensureRegion(state, effect.regionId)
      region.unlocked = true
      break
    }
    case 'changeEra':
      state.campaign.currentEra = effect.eraId
      state.campaign.world.eraId = effect.eraId
      state.campaign.world.phaseId = ''
      if (!state.campaign.unlockedEras.includes(effect.eraId)) {
        state.campaign.unlockedEras.push(effect.eraId)
      }
      break
    case 'changeDaoguo':
      state.campaign.legacy.daoguo = Math.max(
        0,
        state.campaign.legacy.daoguo + finiteOr(effect.amount, 0),
      )
      break
    case 'gainStarMark': {
      const amount = Math.max(0, Math.floor(finiteOr(effect.amount, 0)))
      state.player.dao.marks += amount
      state.player.dao.earned += amount
      break
    }
    case 'addRumor': {
      const entry = {
        id: effect.rumorId,
        text: effect.text,
        createdAtMonths: state.clock.elapsedMonths,
        sourceEventId: context.sourceEventId,
      }
      const index = state.eventRuntime.rumors.findIndex((rumor) => rumor.id === effect.rumorId)
      if (index >= 0) state.eventRuntime.rumors[index] = entry
      else state.eventRuntime.rumors.push(entry)
      break
    }
    case 'changeFavorTier': {
      const delta = finiteOr(effect.delta, 0)
      const partnerId = effect.partnerId
      state.player.partnerFavor[partnerId] =
        (state.player.partnerFavor[partnerId] ?? 0) + delta
      state.eventRuntime.favorLog.push({
        partnerId,
        delta,
        reason: effect.reason,
        createdAtMonths: state.clock.elapsedMonths,
        sourceEventId: context.sourceEventId,
      })
      break
    }
    case 'bondPartner':
      if (!state.player.partnerIds.includes(effect.partnerId)) {
        state.player.partnerIds.push(effect.partnerId)
      }
      break
    case 'applyStatus': {
      const statusId = effect.statusId
      const index = state.player.statuses.findIndex((status) => status.id === statusId)
      const rawMonths = Math.floor(finiteOr(effect.months ?? 1, 1))
      if (rawMonths <= 0) {
        if (index >= 0) state.player.statuses.splice(index, 1)
        break
      }
      const status = {
        id: statusId,
        monthsRemaining: daoStatusMonths(state, statusId, rawMonths),
        source: effect.source ?? context.sourceEventId,
      }
      if (index >= 0) state.player.statuses[index] = status
      else state.player.statuses.push(status)
      break
    }
    case 'grantItem': {
      const count = Math.max(0, Math.floor(finiteOr(effect.count ?? 1, 1)))
      if (count === 0) break
      state.player.inventory[effect.itemId] =
        (state.player.inventory[effect.itemId] ?? 0) + count
      break
    }
    case 'removeItem': {
      const count = Math.max(0, Math.floor(finiteOr(effect.count ?? 1, 1)))
      if (count === 0) break
      const remaining = (state.player.inventory[effect.itemId] ?? 0) - count
      if (remaining > 0) state.player.inventory[effect.itemId] = remaining
      else delete state.player.inventory[effect.itemId]
      break
    }
    case 'grantTreasure':
      if (!state.player.treasureIds.includes(effect.treasureId)) {
        state.player.treasureIds.push(effect.treasureId)
      }
      state.player.activeTreasureId ??= effect.treasureId
      break
    case 'grantMount':
      if (!state.player.mountIds.includes(effect.mountId)) {
        state.player.mountIds.push(effect.mountId)
      }
      state.player.activeMountId ??= effect.mountId
      break
    case 'grantPet':
      if (!state.player.petIds.includes(effect.petId)) {
        state.player.petIds.push(effect.petId)
      }
      state.player.activePetId ??= effect.petId
      break
    case 'changeResource': {
      const raw = finiteOr(effect.amount, 0)
      const amount =
        raw > 0 ? raw * daoEventGainMultiplier(state, context.sourceEventId) : raw
      const current = state.player.resources[effect.resource] ?? 0
      state.player.resources[effect.resource] = Math.max(0, current + amount)
      break
    }
    case 'gainCultivation': {
      const raw = finiteOr(effect.amount, 0)
      const amount =
        raw > 0 ? raw * daoEventGainMultiplier(state, context.sourceEventId) : raw
      state.player.cultivation = Math.max(0, state.player.cultivation + amount)
      break
    }
    case 'gainBodyTemper':
      state.player.body.temper = Math.max(0, state.player.body.temper + finiteOr(effect.amount, 0))
      break
    case 'grantBloodline':
      if (!state.player.bloodline) {
        state.player.bloodline = {
          id: effect.bloodlineId,
          purity: 20,
          stage: 1,
          flags: {},
        }
        state.player.flags['body.grantedBloodline'] = effect.bloodlineId
      }
      break
    case 'gainFoundation':
      gainFoundation(state.player, effect.stats)
      break
    case 'learnTechnique':
      if (!state.player.techniqueIds.includes(effect.techniqueId)) {
        state.player.techniqueIds.push(effect.techniqueId)
        state.player.techniqueProgress[effect.techniqueId] = 0
        autoEquipTechnique(state.player, effect.techniqueId)
      }
      break
    case 'unlockCave':
      if (!state.cave || state.cave.id !== effect.caveId) {
        state.cave = createCaveState(effect.caveId, state.clock.elapsedMonths)
      }
      break
    case 'unlockBuilding': {
      state.cave ??= createCaveState(PLAYER_CAVE_ID, state.clock.elapsedMonths)
      const level = Math.min(3, Math.max(1, Math.round(finiteOr(effect.level, 1))))
      state.cave.buildings[effect.caveBuildingId] = Math.max(
        state.cave.buildings[effect.caveBuildingId] ?? 0,
        level,
      )
      break
    }
    case 'addMemory': {
      const entry = {
        id: effect.memoryId,
        text: effect.text,
        createdAtMonths: state.clock.elapsedMonths,
        sourceEventId: context.sourceEventId,
      }
      const memories = state.campaign.legacy.memories
      const index = memories.findIndex((memory) => memory.id === effect.memoryId)
      if (index >= 0) memories[index] = entry
      else memories.push(entry)
      break
    }
    case 'startCombat':
      state.eventRuntime.pendingEncounters.push({
        id: `encounter.${state.eventRuntime.nextSequence}`,
        encounterId: effect.encounterId,
        fleeAllowed: effect.fleeAllowed ?? true,
        createdAtMonths: state.clock.elapsedMonths,
        sourceEventId: context.sourceEventId,
      })
      state.eventRuntime.nextSequence += 1
      break
    default: {
      const exhaustive: never = effect
      throw new Error(`未知效果类型：${String(exhaustive)}`)
    }
  }
}

export function applyEffects(
  state: GameSaveData,
  effects: readonly Effect[],
  context: EffectApplicationContext = {},
): GameSaveData {
  if (effects.length === 0) return state

  const next = cloneGameSaveData(state)
  for (const effect of effects) {
    applyEffectToDraft(next, effect, context)
  }
  return next
}
