import type {
  CaveId,
  EraId,
  EventId,
  FactionId,
  RegionId,
  RealmId,
  RealmStage,
  ResourceKey,
  SiteId,
} from '@/types/common'
import type { GameSaveData } from '@/types/state'
import { createIdleState } from './idle'
import { rollGear } from './gear'
import { Rng } from './rng'
import { SAVE_VERSION } from './save'
import { createCaveState, createEventRuntimeState } from './state'
import { createClock } from './time'

export interface NewGameRegionOption {
  id: RegionId
  unlocked?: boolean
  visited?: boolean
  unlockedSiteIds?: SiteId[]
}

export interface NewGameFactionOption {
  id: FactionId
  membership?: boolean
  rank?: number
}

export interface NewGameOptions {
  playerName: string
  origin: string
  originId?: string
  rootId?: string
  talentIds?: string[]
  physiqueId?: string
  lineage: string
  eraId: EraId
  phaseId: string
  realm?: RealmId
  stage?: RealmStage
  health?: number
  regionId?: RegionId
  regions?: NewGameRegionOption[]
  factions?: NewGameFactionOption[]
  caveId?: CaveId
  resources?: Partial<Record<ResourceKey, number>>
  idleActive?: Partial<Record<'cultivation' | 'cave' | 'travel', boolean>>
  openingEventId?: EventId
  seed?: number
  now?: Date
}

const RESOURCE_KEYS: readonly ResourceKey[] = [
  'spirit_stones',
  'spirit_herbs',
  'ore',
  'beast_cores',
  'contribution',
  'merit',
  'karma',
]

export function createNewGameSave(options: NewGameOptions): GameSaveData {
  const now = options.now ?? new Date()
  const resources = Object.fromEntries(
    RESOURCE_KEYS.map((key) => [key, options.resources?.[key] ?? 0]),
  ) as Record<ResourceKey, number>
  const regions = Object.fromEntries(
    (options.regions ?? []).map((region) => [
      region.id,
      {
        id: region.id,
        unlocked: region.unlocked ?? false,
        visited: region.visited ?? false,
        flags: {},
        unlockedSiteIds: [...(region.unlockedSiteIds ?? [])],
        exploredSites: {},
      },
    ]),
  )
  const factions = Object.fromEntries(
    (options.factions ?? []).map((faction) => [
      faction.id,
      {
        id: faction.id,
        membership: faction.membership ?? false,
        rank: faction.rank ?? 0,
        contribution: 0,
        reputation: 0,
        fortune: 0,
        flags: {},
      },
    ]),
  )
  const startingRegionId =
    options.regionId ??
    options.regions?.find((region) => region.unlocked)?.id ??
    options.regions?.[0]?.id ??
    ''
  const eventRuntime = createEventRuntimeState()
  if (options.openingEventId) {
    eventRuntime.scheduled.push({
      id: 'schedule.opening',
      eventId: options.openingEventId,
      dueMonths: 0,
    })
  }

  const starterRng = new Rng((options.seed ?? 0x9e3779b9) ^ 0x51ed270b)
  const starterWeapon = rollGear(
    starterRng,
    { tier: 1, qualityBonus: 0.6, slot: 'weapon', regionId: startingRegionId },
    1,
    0,
  )
  const starterArmor = rollGear(
    starterRng,
    { tier: 1, qualityBonus: 0.6, slot: 'armor', regionId: startingRegionId },
    2,
    0,
  )

  return {
    schemaVersion: SAVE_VERSION,
    player: {
      id: 'player.current',
      name: options.playerName,
      origin: options.origin,
      lineage: options.lineage,
      originId: options.originId ?? 'origin.longhan.sea_drift',
      rootId: options.rootId ?? 'root.longhan.water',
      talentIds: [...(options.talentIds ?? [])],
      physiqueId: options.physiqueId ?? 'physique.longhan.mortal',
      body: { temper: 0, stage: 0, path: 'dual', flags: {} },
      regionId: startingRegionId,
      realm: options.realm ?? 'qi_refining',
      stage: options.stage ?? 1,
      cultivation: 0,
      health: options.health ?? 100,
      resources,
      flags: {},
      inventory: {},
      partnerFavor: {},
      techniqueIds: [],
      techniqueProgress: {},
      equippedTechniqueIds: [],
      divineAbilityIds: [],
      activeDivineIds: [],
      professions: {
        alchemy: { proficiency: 0, crafts: 0 },
        forging: { proficiency: 0, crafts: 0 },
      },
      craftCooldowns: {},
      foundation: { health: 0, attack: 0, defense: 0, spirit: 0 },
      gearInventory: [starterWeapon, starterArmor],
      standardEquipment: {
        weapon: starterWeapon.id,
        armor: starterArmor.id,
      },
      gearSeq: 3,
      trainingReports: [],
      treasureIds: [],
      treasureTemper: {},
      mountIds: [],
      mountStages: {},
      petIds: [],
      petEvolutions: {},
      itemCooldowns: {},
      treasureCooldowns: {},
      partnerIds: [],
      dao: { marks: 1, earned: 1, nodes: [], principles: [], respecs: 0 },
      statuses: [],
    },
    campaign: {
      currentEra: options.eraId,
      unlockedEras: [options.eraId],
      history: [],
      world: {
        eraId: options.eraId,
        phaseId: options.phaseId,
        year: 1,
        regions,
        factions,
        characters: {},
        artifacts: {},
        fortuneLedger: {},
        flags: {},
      },
      legacy: {
        daoguo: 0,
        memories: [],
        partnerFates: {},
      },
    },
    cave: options.caveId ? createCaveState(options.caveId) : undefined,
    inbox: [],
    chronicle: [],
    clock: createClock(),
    idle: createIdleState(options.idleActive),
    eventRuntime,
    worldBosses: {},
    settings: {
      speed: 1,
      pauseMode: 'story',
      offlineCapHours: 8,
      offlineEfficiency: 0.5,
    },
    rng: new Rng(options.seed ?? 0x9e3779b9).getState(),
    lastSavedAt: now.toISOString(),
  }
}
