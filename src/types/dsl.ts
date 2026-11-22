import type {
  CaveId,
  EraId,
  EventId,
  FactionId,
  FlagValue,
  ItemId,
  MountId,
  PartnerId,
  PetId,
  RegionId,
  RealmId,
  RealmStage,
  ResourceKey,
  SiteId,
  TechniqueId,
} from './common'

/**
 * Conditions are intentionally declarative: the event engine evaluates them
 * without executing content-authored code.
 */
export type Requirement =
  | { kind: 'flag'; flag: string; value?: FlagValue }
  | { kind: 'era'; eraId: EraId }
  | { kind: 'phase'; eraId: EraId; phaseId: string }
  | { kind: 'factionMembership'; factionId: FactionId; rankAtLeast?: number }
  | { kind: 'factionReputation'; factionId: FactionId; minReputation: number }
  | { kind: 'regionUnlocked'; regionId: RegionId }
  | { kind: 'regionVisited'; regionId: RegionId }
  | { kind: 'regionState'; regionId: RegionId; key: string; value: FlagValue }
  | { kind: 'realm'; minRealm: RealmId; minStage?: RealmStage }
  | { kind: 'bodyStage'; minStage: number }
  | { kind: 'bloodlineStage'; minStage: number }
  | { kind: 'item'; itemId: ItemId; count?: number }
  | { kind: 'technique'; techniqueId: TechniqueId }
  | { kind: 'petNotOwned'; petId: PetId }
  | { kind: 'mountNotOwned'; mountId: MountId }
  | { kind: 'treasureNotOwned'; treasureId: ItemId }
  | { kind: 'partnerFavor'; partnerId: PartnerId; minTier: number }
  | { kind: 'all'; of: Requirement[] }
  | { kind: 'any'; of: Requirement[] }
  | { kind: 'not'; of: Requirement }

/**
 * Effects are a discriminated union so unknown effects fail at compile time.
 * `changeResource` is the only pure number effect; every event must include at
 * least one effect that changes state, memory, relationships or the world.
 */
export type Effect =
  | { kind: 'setFlag'; flag: string; value: FlagValue }
  | { kind: 'clearFlag'; flag: string }
  | {
      kind: 'scheduleEvent'
      eventId: EventId
      delayMonths?: number
    }
  | {
      kind: 'changeFactionState'
      factionId: FactionId
      membership?: boolean
      rank?: number
      contributionDelta?: number
      reputationDelta?: number
      fortuneDelta?: number
      flags?: Record<string, FlagValue>
    }
  | { kind: 'changeRegionState'; regionId: RegionId; key: string; value: FlagValue }
  | { kind: 'unlockSite'; regionId: RegionId; siteId: SiteId }
  | { kind: 'unlockRegion'; regionId: RegionId }
  | { kind: 'changeEra'; eraId: EraId }
  | { kind: 'changeDaoguo'; amount: number }
  | { kind: 'gainStarMark'; amount: number }
  | { kind: 'addRumor'; rumorId: string; text: string }
  | { kind: 'changeFavorTier'; partnerId: PartnerId; delta: number; reason: string }
  | { kind: 'bondPartner'; partnerId: PartnerId }
  | { kind: 'applyStatus'; statusId: string; months?: number; source?: string }
  | {
      kind: 'gainFoundation'
      stats: { health?: number; attack?: number; defense?: number; spirit?: number }
    }
  | { kind: 'grantItem'; itemId: ItemId; count?: number }
  | { kind: 'removeItem'; itemId: ItemId; count?: number }
  | { kind: 'grantTreasure'; treasureId: ItemId }
  | { kind: 'grantMount'; mountId: MountId }
  | { kind: 'grantPet'; petId: PetId }
  | { kind: 'changeResource'; resource: ResourceKey; amount: number }
  | { kind: 'gainCultivation'; amount: number }
  | { kind: 'gainBodyTemper'; amount: number }
  | { kind: 'grantBloodline'; bloodlineId: string }
  | { kind: 'learnTechnique'; techniqueId: TechniqueId }
  | { kind: 'unlockCave'; caveId: CaveId }
  | { kind: 'unlockBuilding'; caveBuildingId: string; level: number }
  | { kind: 'addMemory'; memoryId: string; text: string }
  | { kind: 'startCombat'; encounterId: string; fleeAllowed?: boolean }

export const EFFECT_KINDS = [
  'setFlag',
  'clearFlag',
  'scheduleEvent',
  'changeFactionState',
  'changeRegionState',
  'unlockSite',
  'unlockRegion',
  'changeEra',
  'changeDaoguo',
  'gainStarMark',
  'addRumor',
  'changeFavorTier',
  'bondPartner',
  'applyStatus',
  'gainFoundation',
  'grantItem',
  'removeItem',
  'grantTreasure',
  'grantMount',
  'grantPet',
  'changeResource',
  'gainCultivation',
  'gainBodyTemper',
  'grantBloodline',
  'learnTechnique',
  'unlockCave',
  'unlockBuilding',
  'addMemory',
  'startCombat',
] as const

export type EffectKind = (typeof EFFECT_KINDS)[number]

export const NUMERIC_EFFECT_KINDS: ReadonlySet<EffectKind> = new Set([
  'changeResource',
  'changeDaoguo',
  'gainCultivation',
  'gainBodyTemper',
])
