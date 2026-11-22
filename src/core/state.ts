import type { CaveId } from '@/types/common'
import type {
  CaveState,
  CharacterFate,
  EventRuntimeState,
  GameSaveData,
  IdleSlotState,
  PlayerState,
} from '@/types/state'

export function createCaveState(id: CaveId, nowMonths = 0): CaveState {
  return {
    id,
    buildings: {},
    spiritVeinLevel: 1,
    purity: 70,
    reputation: 0,
    discipleIds: [],
    discipleAssignments: {},
    discipleTrust: {},
    discipleExpertise: {},
    flags: {},
    nextRaidMonths: nowMonths + 24,
    raidsDefended: 0,
    nextVisitorMonths: nowMonths + 6,
    tide: 4,
    chainEnabled: {},
    chainProgress: {},
    log: [],
  }
}

function cloneCave(cave: CaveState): CaveState {
  return {
    ...cave,
    buildings: { ...cave.buildings },
    discipleIds: [...cave.discipleIds],
    discipleAssignments: { ...cave.discipleAssignments },
    discipleTrust: { ...cave.discipleTrust },
    discipleExpertise: Object.fromEntries(
      Object.entries(cave.discipleExpertise ?? {}).map(([id, record]) => [
        id,
        { ...record },
      ]),
    ),
    flags: { ...cave.flags },
    raid: cave.raid ? { ...cave.raid } : undefined,
    visitor: cave.visitor ? { ...cave.visitor } : undefined,
    chainEnabled: { ...(cave.chainEnabled ?? {}) },
    chainProgress: { ...(cave.chainProgress ?? {}) },
    log: (cave.log ?? []).map((entry) => ({ ...entry })),
  }
}

function cloneRecord<T extends object>(record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, { ...value }]),
  )
}

function cloneIdleSlot(slot: IdleSlotState): IdleSlotState {
  return { ...slot }
}

function clonePlayer(player: PlayerState): PlayerState {
  return {
    ...player,
    physiqueId: player.physiqueId ?? 'physique.longhan.mortal',
    body: {
      ...(player.body ?? { temper: 0, stage: 0, path: 'dual' as const, flags: {} }),
      flags: { ...(player.body?.flags ?? {}) },
    },
    bloodline: player.bloodline
      ? { ...player.bloodline, flags: { ...(player.bloodline.flags ?? {}) } }
      : undefined,
    resources: { ...player.resources },
    flags: { ...player.flags },
    inventory: { ...player.inventory },
    partnerFavor: { ...player.partnerFavor },
    techniqueIds: [...player.techniqueIds],
    techniqueProgress: { ...player.techniqueProgress },
    equippedTechniqueIds: [...(player.equippedTechniqueIds ?? [])],
    divineAbilityIds: [...(player.divineAbilityIds ?? [])],
    activeDivineIds: [...(player.activeDivineIds ?? [])],
    professions: {
      alchemy: { ...(player.professions?.alchemy ?? { proficiency: 0, crafts: 0 }) },
      forging: { ...(player.professions?.forging ?? { proficiency: 0, crafts: 0 }) },
    },
    craftCooldowns: { ...(player.craftCooldowns ?? {}) },
    foundation: { ...(player.foundation ?? { health: 0, attack: 0, defense: 0, spirit: 0 }) },
    treasureIds: [...player.treasureIds],
    treasureTemper: { ...player.treasureTemper },
    mountIds: [...player.mountIds],
    mountStages: { ...player.mountStages },
    petIds: [...player.petIds],
    petEvolutions: { ...player.petEvolutions },
    talentIds: [...player.talentIds],
    itemCooldowns: { ...player.itemCooldowns },
    treasureCooldowns: { ...player.treasureCooldowns },
    partnerIds: [...player.partnerIds],
    dao: {
      ...player.dao,
      nodes: [...player.dao.nodes],
      principles: [...player.dao.principles],
    },
    statuses: player.statuses.map((status) => ({ ...status })),
  }
}

export function createEventRuntimeState(): EventRuntimeState {
  return {
    scheduled: [],
    history: {},
    rumors: [],
    favorLog: [],
    pendingEncounters: [],
    nextSequence: 1,
  }
}

export function cloneGameSaveData(state: GameSaveData): GameSaveData {
  const world = state.campaign.world
  const legacy = state.campaign.legacy

  return {
    ...state,
    player: clonePlayer(state.player),
    campaign: {
      ...state.campaign,
      unlockedEras: [...state.campaign.unlockedEras],
      history: state.campaign.history.map((record) => ({
        ...record,
        settlementNotes: [...record.settlementNotes],
      })),
      world: {
        ...world,
        regions: Object.fromEntries(
          Object.entries(world.regions).map(([id, region]) => [
            id,
            {
              ...region,
              flags: { ...region.flags },
              unlockedSiteIds: [...region.unlockedSiteIds],
              exploredSites: { ...region.exploredSites },
            },
          ]),
        ),
        factions: cloneRecord(world.factions),
        characters: cloneRecord<CharacterFate>(world.characters),
        artifacts: { ...world.artifacts },
        fortuneLedger: { ...world.fortuneLedger },
        flags: { ...world.flags },
      },
      legacy: {
        ...legacy,
        memories: legacy.memories.map((memory) => ({ ...memory })),
        cave: legacy.cave ? cloneCave(legacy.cave) : undefined,
        partnerFates: { ...legacy.partnerFates },
      },
    },
    cave: state.cave ? cloneCave(state.cave) : undefined,
    inbox: state.inbox.map((entry) => ({ ...entry })),
    chronicle: state.chronicle.map((entry) => ({ ...entry })),
    clock: {
      ...state.clock,
      tokens: state.clock.tokens.map((token) => ({ ...token })),
    },
    idle: {
      slots: {
        cultivation: cloneIdleSlot(state.idle.slots.cultivation),
        cave: cloneIdleSlot(state.idle.slots.cave),
        travel: cloneIdleSlot(state.idle.slots.travel),
      },
      travelProgress: state.idle.travelProgress,
    },
    eventRuntime: {
      scheduled: state.eventRuntime.scheduled.map((entry) => ({ ...entry })),
      history: cloneRecord(state.eventRuntime.history),
      rumors: state.eventRuntime.rumors.map((entry) => ({ ...entry })),
      favorLog: state.eventRuntime.favorLog.map((entry) => ({ ...entry })),
      pendingEncounters: state.eventRuntime.pendingEncounters.map((entry) => ({ ...entry })),
      nextSequence: state.eventRuntime.nextSequence,
    },
    worldBosses: cloneRecord(state.worldBosses ?? {}),
    settings: { ...state.settings },
    rng: { ...state.rng },
  }
}
