import type { FlagValue, RealmId, RealmStage } from '@/types/common'
import type { CombatStats } from '@/types/content'
import type { GearAffix, GearSlot, GeneratedGear } from '@/types/gear'
import type { TrainingReport, TrainingSession } from '@/types/training'
import type {
  CaveState,
  EventRuntimeState,
  GameSettings,
  BodyPath,
  MemoryEntry,
  PlayerBloodlineState,
  PlayerBodyState,
  PlayerDaoState,
  WorldBossState,
} from '@/types/state'
import { GEAR_QUALITY_TIERS } from '@/data/gear/catalog'
import { DAO_BOSS_MARK_IDS, DAO_STORY_MARK_EVENT_IDS, daoRealmMilestones } from './dao'
import { FOUNDATION_CAPS } from './foundation'
import { rollGear } from './gear'
import { createIdleState } from './idle'
import { Rng } from './rng'
import { createEventRuntimeState } from './state'
import { createClock } from './time'

export const SAVE_VERSION = 14

export interface SaveEnvelope<T = unknown> {
  version: number
  createdAt: string
  updatedAt: string
  checksum: string
  data: T
}

export type SaveDecodeFailureReason =
  | 'invalid-json'
  | 'invalid-envelope'
  | 'checksum'
  | 'unsupported-version'
  | 'migration'

export type SaveDecodeResult =
  | { ok: true; envelope: SaveEnvelope; migrated: boolean }
  | { ok: false; reason: SaveDecodeFailureReason; message: string }

function stableStringify(value: unknown): string {
  if (value === undefined) return 'null'
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }

  const record = value as Record<string, unknown>
  const keys = Object.keys(record)
    .filter((key) => record[key] !== undefined)
    .sort()
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`
}

export function checksum(value: unknown): string {
  const input = stableStringify(value)
  let hash = 0x811c9dc5

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }

  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function createSaveEnvelope<T>(data: T, now = new Date()): SaveEnvelope<T> {
  const timestamp = now.toISOString()

  return {
    version: SAVE_VERSION,
    createdAt: timestamp,
    updatedAt: timestamp,
    checksum: checksum(data),
    data,
  }
}

export function isSaveEnvelope(value: unknown): value is SaveEnvelope {
  if (value === null || typeof value !== 'object') return false

  const candidate = value as Partial<SaveEnvelope>
  return (
    typeof candidate.version === 'number' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    typeof candidate.checksum === 'string' &&
    'data' in candidate
  )
}

export function verifySaveEnvelope(envelope: SaveEnvelope): boolean {
  return isSaveEnvelope(envelope) && envelope.checksum === checksum(envelope.data)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function normalizeSettings(value: unknown): GameSettings {
  const record = isRecord(value) ? value : {}
  const speed = record.speed === 4 || record.speed === 16 ? record.speed : 1
  const pauseMode =
    record.pauseMode === 'all' ||
    record.pauseMode === 'story' ||
    record.pauseMode === 'none'
      ? record.pauseMode
      : 'story'
  const offlineCapHours =
    typeof record.offlineCapHours === 'number' &&
    Number.isFinite(record.offlineCapHours) &&
    record.offlineCapHours >= 0
      ? record.offlineCapHours
      : 8
  const offlineEfficiency =
    typeof record.offlineEfficiency === 'number' &&
    Number.isFinite(record.offlineEfficiency)
      ? Math.min(1, Math.max(0, record.offlineEfficiency))
      : 0.5

  return {
    speed,
    pauseMode,
    offlineCapHours,
    offlineEfficiency,
  }
}

function migrateV1ToV2(data: unknown): unknown {
  if (!isRecord(data)) return data
  return {
    ...data,
    schemaVersion: 2,
    clock: data.clock ?? createClock(),
    idle: data.idle ?? createIdleState(),
    settings: normalizeSettings(data.settings),
  }
}

function normalizeMemories(value: unknown): MemoryEntry[] {
  if (!Array.isArray(value)) return []
  const memories: MemoryEntry[] = []
  value.forEach((entry, index) => {
    if (typeof entry === 'string') {
      memories.push({
        id: `memory.legacy.${index + 1}`,
        text: entry,
        createdAtMonths: 0,
      })
      return
    }
    if (!isRecord(entry) || typeof entry.id !== 'string' || typeof entry.text !== 'string') {
      return
    }
    memories.push({
      id: entry.id,
      text: entry.text,
      createdAtMonths:
        typeof entry.createdAtMonths === 'number' && Number.isFinite(entry.createdAtMonths)
          ? entry.createdAtMonths
          : 0,
      sourceEventId:
        typeof entry.sourceEventId === 'string' ? entry.sourceEventId : undefined,
    })
  })
  return memories
}

function normalizeEventRuntime(value: unknown): EventRuntimeState {
  const record = isRecord(value) ? value : {}
  const defaults = createEventRuntimeState()
  return {
    scheduled: Array.isArray(record.scheduled) ? record.scheduled as EventRuntimeState['scheduled'] : defaults.scheduled,
    history: isRecord(record.history) ? record.history as EventRuntimeState['history'] : defaults.history,
    rumors: Array.isArray(record.rumors) ? record.rumors as EventRuntimeState['rumors'] : defaults.rumors,
    favorLog: Array.isArray(record.favorLog) ? record.favorLog as EventRuntimeState['favorLog'] : defaults.favorLog,
    pendingEncounters: Array.isArray(record.pendingEncounters) ? record.pendingEncounters as EventRuntimeState['pendingEncounters'] : defaults.pendingEncounters,
    nextSequence:
      typeof record.nextSequence === 'number' && Number.isFinite(record.nextSequence)
        ? record.nextSequence
        : defaults.nextSequence,
  }
}

function normalizeInbox(value: unknown): unknown[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => {
    if (!isRecord(entry)) return entry
    return {
      ...entry,
      createdMonths:
        typeof entry.createdMonths === 'number' && Number.isFinite(entry.createdMonths)
          ? entry.createdMonths
          : 0,
    }
  })
}

function migrateV2ToV3(data: unknown): unknown {
  if (!isRecord(data)) return data
  const player = isRecord(data.player) ? data.player : {}
  const campaign = isRecord(data.campaign) ? data.campaign : {}
  const legacy = isRecord(campaign.legacy) ? campaign.legacy : {}

  return {
    ...data,
    schemaVersion: 3,
    player: {
      ...player,
      cultivation:
        typeof player.cultivation === 'number' && Number.isFinite(player.cultivation)
          ? player.cultivation
          : 0,
      inventory: isRecord(player.inventory) ? player.inventory : {},
      partnerFavor: isRecord(player.partnerFavor) ? player.partnerFavor : {},
    },
    campaign: {
      ...campaign,
      legacy: {
        ...legacy,
        memories: normalizeMemories(legacy.memories),
      },
    },
    inbox: normalizeInbox(data.inbox),
    eventRuntime: normalizeEventRuntime(data.eventRuntime),
  }
}

function migrateV3ToV4(data: unknown): unknown {
  if (!isRecord(data)) return data
  const player = isRecord(data.player) ? data.player : {}
  const campaign = isRecord(data.campaign) ? data.campaign : {}
  const world = isRecord(campaign.world) ? campaign.world : {}
  const regions = isRecord(world.regions) ? world.regions : {}

  const normalizedRegions = Object.fromEntries(
    Object.entries(regions).map(([id, value]) => {
      const region = isRecord(value) ? value : {}
      return [
        id,
        {
          ...region,
          exploredSites: isRecord(region.exploredSites) ? region.exploredSites : {},
          unlockedSiteIds: Array.isArray(region.unlockedSiteIds)
            ? region.unlockedSiteIds
            : [],
        },
      ]
    }),
  )

  return {
    ...data,
    schemaVersion: 4,
    player: {
      ...player,
      regionId:
        typeof player.regionId === 'string' && player.regionId.length > 0
          ? player.regionId
          : 'region.longhan.four_seas',
    },
    campaign: {
      ...campaign,
      world: {
        ...world,
        regions: normalizedRegions,
      },
    },
  }
}

function migrateV4ToV5(data: unknown): unknown {
  if (!isRecord(data)) return data
  const player = isRecord(data.player) ? data.player : {}
  const techniqueIds = Array.isArray(player.techniqueIds)
    ? player.techniqueIds.filter((id): id is string => typeof id === 'string')
    : []
  const progress = isRecord(player.techniqueProgress) ? player.techniqueProgress : {}

  return {
    ...data,
    schemaVersion: 5,
    player: {
      ...player,
      origin:
        typeof player.origin === 'string' && player.origin.length > 0
          ? player.origin
          : '四海',
      originId:
        typeof player.originId === 'string'
          ? player.originId
          : 'origin.longhan.sea_drift',
      rootId:
        typeof player.rootId === 'string' ? player.rootId : 'root.longhan.water',
      talentIds: Array.isArray(player.talentIds) ? player.talentIds : [],
      health:
        typeof player.health === 'number' && Number.isFinite(player.health)
          ? player.health
          : 100,
      techniqueProgress: Object.fromEntries(
        techniqueIds.map((id) => [
          id,
          typeof progress[id] === 'number' ? progress[id] : 0,
        ]),
      ),
      treasureIds: Array.isArray(player.treasureIds) ? player.treasureIds : [],
      mountIds: Array.isArray(player.mountIds) ? player.mountIds : [],
      mountStages: isRecord(player.mountStages) ? player.mountStages : {},
      petIds: Array.isArray(player.petIds) ? player.petIds : [],
      petEvolutions: isRecord(player.petEvolutions) ? player.petEvolutions : {},
      itemCooldowns: isRecord(player.itemCooldowns) ? player.itemCooldowns : {},
      treasureCooldowns: isRecord(player.treasureCooldowns)
        ? player.treasureCooldowns
        : {},
    },
  }
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : []
}

function numberRecord(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {}
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, number] =>
        typeof entry[1] === 'number' && Number.isFinite(entry[1]),
    ),
  )
}

function booleanRecord(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) return {}
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, boolean] => typeof entry[1] === 'boolean',
    ),
  )
}

function migrateV5ToV6(data: unknown): unknown {
  if (!isRecord(data)) return data
  const player = isRecord(data.player) ? data.player : {}
  const techniqueIds = stringList(player.techniqueIds)
  const techniqueProgress = numberRecord(player.techniqueProgress)
  return {
    ...data,
    schemaVersion: 6,
    player: {
      ...player,
      originId:
        typeof player.originId === 'string'
          ? player.originId
          : 'origin.longhan.sea_drift',
      rootId:
        typeof player.rootId === 'string' ? player.rootId : 'root.longhan.water',
      talentIds: stringList(player.talentIds),
      health:
        typeof player.health === 'number' && Number.isFinite(player.health)
          ? player.health
          : 100,
      statuses: Array.isArray(player.statuses) ? player.statuses : [],
      techniqueIds,
      techniqueProgress: Object.fromEntries(
        techniqueIds.map((id) => [id, techniqueProgress[id] ?? 0]),
      ),
      equipment: isRecord(player.equipment) ? player.equipment : {},
      treasureIds: stringList(player.treasureIds),
      activeTreasureId:
        typeof player.activeTreasureId === 'string'
          ? player.activeTreasureId
          : undefined,
      mountIds: stringList(player.mountIds),
      mountStages: numberRecord(player.mountStages),
      activeMountId:
        typeof player.activeMountId === 'string'
          ? player.activeMountId
          : undefined,
      petIds: stringList(player.petIds),
      petEvolutions: numberRecord(player.petEvolutions),
      activePetId:
        typeof player.activePetId === 'string' ? player.activePetId : undefined,
      itemCooldowns: numberRecord(player.itemCooldowns),
      treasureCooldowns: numberRecord(player.treasureCooldowns),
    },
  }
}

const DISCIPLE_ASSIGNMENTS = ['study', 'gather', 'guard', 'craft', 'tend'] as const

function normalizeFlagRecord(value: unknown): Record<string, FlagValue> {
  if (!isRecord(value)) return {}
  const flags: Record<string, FlagValue> = {}
  for (const [key, entry] of Object.entries(value)) {
    if (
      typeof entry === 'boolean' ||
      typeof entry === 'string' ||
      (typeof entry === 'number' && Number.isFinite(entry))
    ) {
      flags[key] = entry
    }
  }
  return flags
}

function normalizeAssignments(
  value: unknown,
): CaveState['discipleAssignments'] {
  if (!isRecord(value)) return {}
  const assignments: CaveState['discipleAssignments'] = {}
  for (const [key, entry] of Object.entries(value)) {
    if (
      typeof entry === 'string' &&
      (DISCIPLE_ASSIGNMENTS as readonly string[]).includes(entry)
    ) {
      assignments[key] = entry as (typeof DISCIPLE_ASSIGNMENTS)[number]
    }
  }
  return assignments
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function normalizeCaveExpertise(
  value: unknown,
): CaveState['discipleExpertise'] {
  if (!isRecord(value)) return {}
  const expertise: CaveState['discipleExpertise'] = {}
  for (const [discipleId, raw] of Object.entries(value)) {
    if (!isRecord(raw)) continue
    const record: Partial<Record<(typeof DISCIPLE_ASSIGNMENTS)[number], number>> = {}
    for (const [assignment, months] of Object.entries(raw)) {
      if (
        (DISCIPLE_ASSIGNMENTS as readonly string[]).includes(assignment) &&
        typeof months === 'number' &&
        Number.isFinite(months) &&
        months > 0
      ) {
        record[assignment as (typeof DISCIPLE_ASSIGNMENTS)[number]] = months
      }
    }
    expertise[discipleId] = record
  }
  return expertise
}

const CAVE_LOG_KINDS = ['build', 'vein', 'disciple', 'visitor', 'raid', 'care'] as const

function normalizeCaveLog(value: unknown): CaveState['log'] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.text !== 'string') return []
    const kind =
      typeof entry.kind === 'string' &&
      (CAVE_LOG_KINDS as readonly string[]).includes(entry.kind)
        ? (entry.kind as (typeof CAVE_LOG_KINDS)[number])
        : 'care'
    return [
      {
        id:
          typeof entry.id === 'string' && entry.id.length > 0
            ? entry.id
            : `cave.log.${finiteNumber(entry.createdAtMonths, 0)}.${entry.text.slice(0, 8)}`,
        kind,
        text: entry.text,
        createdAtMonths: finiteNumber(entry.createdAtMonths, 0),
      },
    ]
  }).slice(-40)
}

function normalizeCaveState(value: unknown): CaveState | undefined {
  if (!isRecord(value) || typeof value.id !== 'string') return undefined
  const raid = isRecord(value.raid)
    ? {
        raidId: typeof value.raid.raidId === 'string' ? value.raid.raidId : '',
        startedMonths: finiteNumber(value.raid.startedMonths, 0),
        dueMonths: finiteNumber(value.raid.dueMonths, 0),
        encounterQueued: value.raid.encounterQueued === true,
      }
    : undefined
  const visitor = isRecord(value.visitor)
    ? {
        visitorId:
          typeof value.visitor.visitorId === 'string' ? value.visitor.visitorId : '',
        arrivedMonths: finiteNumber(value.visitor.arrivedMonths, 0),
      }
    : undefined
  return {
    id: value.id,
    buildings: numberRecord(value.buildings),
    spiritVeinLevel: Math.min(
      5,
      Math.max(1, Math.round(finiteNumber(value.spiritVeinLevel, 1))),
    ),
    purity: Math.max(0, Math.min(100, Math.round(finiteNumber(value.purity, 70)))),
    reputation: Math.max(0, Math.round(finiteNumber(value.reputation, 0))),
    discipleIds: stringList(value.discipleIds),
    discipleAssignments: normalizeAssignments(value.discipleAssignments),
    discipleTrust: numberRecord(value.discipleTrust),
    discipleExpertise: normalizeCaveExpertise(value.discipleExpertise),
    flags: normalizeFlagRecord(value.flags),
    raid: raid && raid.raidId ? raid : undefined,
    nextRaidMonths: finiteNumber(value.nextRaidMonths, 24),
    raidsDefended: Math.max(0, Math.floor(finiteNumber(value.raidsDefended, 0))),
    visitor: visitor && visitor.visitorId ? visitor : undefined,
    nextVisitorMonths: finiteNumber(value.nextVisitorMonths, 6),
    tide: Math.max(0, finiteNumber(value.tide, 4)),
    chainEnabled: booleanRecord(value.chainEnabled),
    chainProgress: numberRecord(value.chainProgress),
    log: normalizeCaveLog(value.log),
  }
}

function migrateV6ToV7(data: unknown): unknown {
  if (!isRecord(data)) return data
  return {
    ...data,
    schemaVersion: 7,
    cave: normalizeCaveState(data.cave),
    eventRuntime: normalizeEventRuntime(data.eventRuntime),
  }
}

const GEAR_SLOTS: GearSlot[] = [
  'weapon',
  'armor',
  'head',
  'cloak',
  'waist',
  'boots',
  'neck',
  'ring',
  'accessory',
  'talisman',
]

function normalizeCombatStats(value: unknown): CombatStats {
  if (!isRecord(value)) return {}
  const stats: CombatStats = {}
  for (const [key, amount] of Object.entries(value)) {
    if (
      typeof amount === 'number' &&
      Number.isFinite(amount) &&
      ['health', 'attack', 'defense', 'speed', 'crit', 'spirit'].includes(key)
    ) {
      stats[key as keyof CombatStats] = amount
    }
  }
  return stats
}

function normalizeGearAffixes(value: unknown): GearAffix[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    if (
      !isRecord(entry) ||
      typeof entry.templateId !== 'string' ||
      typeof entry.label !== 'string'
    ) {
      return []
    }
    return [
      {
        templateId: entry.templateId,
        label: entry.label,
        description: typeof entry.description === 'string' ? entry.description : entry.label,
        tier: Math.max(1, Math.min(5, Math.round(finiteNumber(entry.tier, 1)))),
        value: Math.max(0, finiteNumber(entry.value, 1)),
      },
    ]
  }).slice(0, GEAR_QUALITY_TIERS[GEAR_QUALITY_TIERS.length - 1].affixMax)
}

function normalizeGeneratedGear(value: unknown, index: number): GeneratedGear | undefined {
  if (!isRecord(value)) return undefined
  const slot = typeof value.slot === 'string' && (GEAR_SLOTS as string[]).includes(value.slot)
    ? (value.slot as GearSlot)
    : undefined
  if (!slot) return undefined
  return {
    id: typeof value.id === 'string' && value.id.length > 0 ? value.id : `gear.${index + 1}`,
    name: typeof value.name === 'string' && value.name.length > 0 ? value.name : '无名器',
    slot,
    tier: Math.max(1, Math.min(6, Math.round(finiteNumber(value.tier, 1)))),
    quality: Math.max(
      0,
      Math.min(
        GEAR_QUALITY_TIERS.length - 1,
        Math.round(finiteNumber(value.quality, 0)),
      ),
    ),
    element:
      typeof value.element === 'string'
        ? (value.element as GeneratedGear['element'])
        : undefined,
    baseStats: normalizeCombatStats(value.baseStats),
    affixes: normalizeGearAffixes(value.affixes),
    upgrade: Math.max(0, Math.min(10, Math.round(finiteNumber(value.upgrade, 0)))),
    sealed: Array.isArray(value.sealed)
      ? value.sealed.filter(
          (entry): entry is number => typeof entry === 'number' && Number.isInteger(entry),
        )
      : [],
    locked: value.locked === true,
    setId: typeof value.setId === 'string' ? value.setId : undefined,
    sourceRegionId:
      typeof value.sourceRegionId === 'string' ? value.sourceRegionId : undefined,
    createdAtMonths: finiteNumber(value.createdAtMonths, 0),
    note: typeof value.note === 'string' ? value.note : undefined,
  }
}

function normalizeGearInventory(value: unknown): GeneratedGear[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry, index) => {
    const gear = normalizeGeneratedGear(entry, index)
    return gear ? [gear] : []
  })
}

function normalizeTrainingSession(value: unknown): TrainingSession | undefined {
  if (!isRecord(value) || typeof value.regionId !== 'string') return undefined
  const mode = value.mode
  if (mode !== 'steady' && mode !== 'deep' && mode !== 'perilous') return undefined
  return {
    id: typeof value.id === 'string' ? value.id : 'training.recovered',
    regionId: value.regionId,
    mode,
    startedMonths: finiteNumber(value.startedMonths, 0),
    endsMonths: finiteNumber(value.endsMonths, 0),
    nextBattleMonths: finiteNumber(value.nextBattleMonths, 0),
    wins: Math.max(0, Math.round(finiteNumber(value.wins, 0))),
    losses: Math.max(0, Math.round(finiteNumber(value.losses, 0))),
    battles: Math.max(0, Math.round(finiteNumber(value.battles, 0))),
    cultivation: Math.max(0, finiteNumber(value.cultivation, 0)),
    resources: isRecord(value.resources) ? (value.resources as TrainingSession['resources']) : {},
    gearIds: stringList(value.gearIds),
    log: Array.isArray(value.log) ? (value.log as TrainingSession['log']).slice(-14) : [],
    bestGearId: typeof value.bestGearId === 'string' ? value.bestGearId : undefined,
  }
}

function normalizeTrainingReports(value: unknown): TrainingReport[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (entry): entry is TrainingReport =>
      isRecord(entry) &&
      typeof entry.id === 'string' &&
      typeof entry.regionId === 'string' &&
      typeof entry.mode === 'string',
  ).slice(-8)
}

function migrateV7ToV8(data: unknown): unknown {
  if (!isRecord(data)) return data
  const player = isRecord(data.player) ? data.player : {}
  let gearInventory = normalizeGearInventory(player.gearInventory)
  let standardEquipment: Partial<Record<GearSlot, string>> = {}

  if (gearInventory.length === 0) {
    const rng = new Rng(0x51ed270b)
    const starterWeapon = rollGear(
      rng,
      { tier: 1, qualityBonus: 0.6, slot: 'weapon' },
      1,
      0,
    )
    const starterArmor = rollGear(
      rng,
      { tier: 1, qualityBonus: 0.6, slot: 'armor' },
      2,
      0,
    )
    gearInventory = [starterWeapon, starterArmor]
    standardEquipment = {
      weapon: starterWeapon.id,
      armor: starterArmor.id,
    }
  }

  const knownGearIds = new Set(gearInventory.map((gear) => gear.id))
  const rawEquipment = isRecord(player.standardEquipment) ? player.standardEquipment : {}
  for (const slot of GEAR_SLOTS) {
    const gearId = rawEquipment[slot]
    if (typeof gearId === 'string' && knownGearIds.has(gearId)) {
      standardEquipment[slot] = gearId
    }
  }
  return {
    ...data,
    schemaVersion: 8,
    player: {
      ...player,
      gearInventory,
      standardEquipment,
      gearSeq: Math.max(
        gearInventory.length + 1,
        Math.round(finiteNumber(player.gearSeq, gearInventory.length + 1)),
      ),
      training: normalizeTrainingSession(player.training),
      trainingReports: normalizeTrainingReports(player.trainingReports),
    },
  }
}

function migrateV8ToV9(data: unknown): unknown {
  if (!isRecord(data)) return data
  const player = isRecord(data.player) ? data.player : {}
  const inventory = isRecord(player.inventory) ? { ...player.inventory } : {}
  const legacyEquipment = isRecord(player.equipment) ? player.equipment : {}

  for (const id of Object.values(legacyEquipment)) {
    if (typeof id !== 'string' || id.length === 0) continue
    const count = typeof inventory[id] === 'number' ? (inventory[id] as number) : 0
    inventory[id] = count + 1
  }

  const nextPlayer: Record<string, unknown> = {
    ...player,
    inventory,
    treasureTemper: isRecord(player.treasureTemper) ? player.treasureTemper : {},
  }
  delete nextPlayer.equipment

  return {
    ...data,
    schemaVersion: 9,
    player: nextPlayer,
  }
}

function migrateV9ToV10(data: unknown): unknown {
  if (!isRecord(data)) return data
  return {
    ...data,
    schemaVersion: 10,
    cave: normalizeCaveState(data.cave),
  }
}

function normalizeWorldBosses(value: unknown): Record<string, WorldBossState> {
  if (!isRecord(value)) return {}
  const bosses: Record<string, WorldBossState> = {}
  for (const [id, raw] of Object.entries(value)) {
    if (!isRecord(raw)) continue
    bosses[id] = {
      id: typeof raw.id === 'string' ? raw.id : id,
      attempts: Math.max(0, Math.floor(finiteNumber(raw.attempts, 0))),
      kills: Math.max(0, Math.floor(finiteNumber(raw.kills, 0))),
      firstKilledAtMonths:
        typeof raw.firstKilledAtMonths === 'number' && Number.isFinite(raw.firstKilledAtMonths)
          ? raw.firstKilledAtMonths
          : undefined,
      lastKilledAtMonths:
        typeof raw.lastKilledAtMonths === 'number' && Number.isFinite(raw.lastKilledAtMonths)
          ? raw.lastKilledAtMonths
          : undefined,
      respawnAtMonths:
        typeof raw.respawnAtMonths === 'number' && Number.isFinite(raw.respawnAtMonths)
          ? raw.respawnAtMonths
          : undefined,
      returnRumorForMonths:
        typeof raw.returnRumorForMonths === 'number' &&
        Number.isFinite(raw.returnRumorForMonths)
          ? raw.returnRumorForMonths
          : undefined,
    }
  }
  return bosses
}

function migrateV10ToV11(data: unknown): unknown {
  if (!isRecord(data)) return data
  return {
    ...data,
    schemaVersion: 11,
    worldBosses: normalizeWorldBosses(data.worldBosses),
  }
}

const REALM_IDS: RealmId[] = ['mortal', 'qi_refining', 'foundation', 'golden_core']

function migrationEarnedMarks(data: Record<string, unknown>): number {
  const player = isRecord(data.player) ? data.player : {}
  const realm =
    typeof player.realm === 'string' && (REALM_IDS as string[]).includes(player.realm)
      ? (player.realm as RealmId)
      : 'mortal'
  const rawStage =
    typeof player.stage === 'number' && Number.isFinite(player.stage)
      ? Math.round(player.stage)
      : 1
  const stage: RealmStage = rawStage >= 3 ? 3 : rawStage <= 1 ? 1 : 2

  let earned = 1 + daoRealmMilestones(realm, stage)
  const bosses = isRecord(data.worldBosses) ? data.worldBosses : {}
  for (const bossId of DAO_BOSS_MARK_IDS) {
    const boss = isRecord(bosses[bossId]) ? bosses[bossId] : undefined
    if (boss && boss.firstKilledAtMonths !== undefined) earned += 1
  }
  const runtime = isRecord(data.eventRuntime) ? data.eventRuntime : {}
  const history = isRecord(runtime.history) ? runtime.history : {}
  for (const eventId of DAO_STORY_MARK_EVENT_IDS) {
    const entry = isRecord(history[eventId]) ? history[eventId] : undefined
    if (entry && typeof entry.count === 'number' && entry.count > 0) earned += 1
  }
  return earned
}

function normalizeDaoState(value: unknown, fallbackEarned: number): PlayerDaoState {
  const record = isRecord(value) ? value : {}
  const storedEarned =
    typeof record.earned === 'number' && Number.isFinite(record.earned)
      ? Math.max(0, Math.floor(record.earned))
      : 0
  const earned = Math.max(storedEarned, fallbackEarned)
  const marks =
    typeof record.marks === 'number' && Number.isFinite(record.marks)
      ? Math.max(0, Math.floor(record.marks))
      : earned
  return {
    marks,
    earned,
    nodes: stringList(record.nodes),
    principles: stringList(record.principles),
    respecs: Math.max(0, Math.floor(finiteNumber(record.respecs, 0))),
  }
}

function migrateV11ToV12(data: unknown): unknown {
  if (!isRecord(data)) return data
  const player = isRecord(data.player) ? data.player : {}
  return {
    ...data,
    schemaVersion: 12,
    player: {
      ...player,
      dao: normalizeDaoState(player.dao, migrationEarnedMarks(data)),
    },
  }
}

function normalizeFoundation(value: unknown): Record<string, number> {
  const record = isRecord(value) ? value : {}
  return {
    health: Math.max(
      0,
      Math.min(FOUNDATION_CAPS.health, Math.floor(finiteNumber(record.health, 0))),
    ),
    attack: Math.max(
      0,
      Math.min(FOUNDATION_CAPS.attack, Math.floor(finiteNumber(record.attack, 0))),
    ),
    defense: Math.max(
      0,
      Math.min(FOUNDATION_CAPS.defense, Math.floor(finiteNumber(record.defense, 0))),
    ),
    spirit: Math.max(
      0,
      Math.min(FOUNDATION_CAPS.spirit, Math.floor(finiteNumber(record.spirit, 0))),
    ),
  }
}

function normalizeProfession(value: unknown): { proficiency: number; crafts: number } {
  const record = isRecord(value) ? value : {}
  return {
    proficiency: Math.max(0, Math.min(560, Math.floor(finiteNumber(record.proficiency, 0)))),
    crafts: Math.max(0, Math.floor(finiteNumber(record.crafts, 0))),
  }
}

const BODY_PATH_VALUES: readonly BodyPath[] = ['law', 'body', 'dual']
const BLOODLINE_PURITY_GATES = [0, 20, 40, 60, 78, 92]

function normalizeFlags(value: unknown): Record<string, FlagValue> {
  const result: Record<string, FlagValue> = {}
  if (!isRecord(value)) return result
  for (const [key, entry] of Object.entries(value)) {
    if (
      typeof entry === 'boolean' ||
      typeof entry === 'string' ||
      (typeof entry === 'number' && Number.isFinite(entry))
    ) {
      result[key] = entry
    }
  }
  return result
}

function bodyStageFromRealm(realm: unknown, stage: unknown): number {
  const realmId = typeof realm === 'string' && (REALM_IDS as string[]).includes(realm)
    ? realm
    : 'mortal'
  const realmStage = Math.max(1, Math.min(3, Math.round(finiteNumber(stage, 1))))
  if (realmId === 'golden_core') return 3
  if (realmId === 'foundation') return 2
  if (realmId === 'qi_refining') return realmStage >= 2 ? 1 : 0
  return 0
}

function normalizeBodyState(
  value: unknown,
  realm: unknown,
  stage: unknown,
): PlayerBodyState {
  const record = isRecord(value) ? value : {}
  const path =
    typeof record.path === 'string' && (BODY_PATH_VALUES as string[]).includes(record.path)
      ? (record.path as BodyPath)
      : 'dual'
  const fallbackStage = bodyStageFromRealm(realm, stage)
  const rawStage = Math.round(finiteNumber(record.stage, fallbackStage))
  return {
    temper: Math.max(0, Math.floor(finiteNumber(record.temper, 0))),
    stage: Math.max(0, Math.min(5, rawStage)),
    path,
    pathChangedAtMonths:
      record.pathChangedAtMonths === undefined
        ? undefined
        : Math.max(0, Math.floor(finiteNumber(record.pathChangedAtMonths, 0))),
    flags: normalizeFlags(record.flags),
  }
}

function normalizeBloodlineState(value: unknown): PlayerBloodlineState | undefined {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id.length === 0) {
    return undefined
  }
  const purity = Math.max(0, Math.min(100, Math.floor(finiteNumber(value.purity, 0))))
  let fallbackStage = 0
  for (let index = BLOODLINE_PURITY_GATES.length - 1; index >= 0; index -= 1) {
    if (purity >= BLOODLINE_PURITY_GATES[index]) {
      fallbackStage = index
      break
    }
  }
  const stage = Math.max(0, Math.min(5, Math.round(finiteNumber(value.stage, fallbackStage))))
  return {
    id: value.id,
    purity,
    stage,
    refinedAtMonths:
      value.refinedAtMonths === undefined
        ? undefined
        : Math.max(0, Math.floor(finiteNumber(value.refinedAtMonths, 0))),
    flags: normalizeFlags(value.flags),
  }
}

function normalizePlayerProgression(
  player: Record<string, unknown>,
): Record<string, unknown> {
  const techniqueIds = stringList(player.techniqueIds)
  const equippedSource = Array.isArray(player.equippedTechniqueIds)
    ? stringList(player.equippedTechniqueIds)
    : techniqueIds
  const equippedSeen = new Set<string>()
  const equippedTechniqueIds = equippedSource
    .filter((id) => {
      if (!techniqueIds.includes(id) || equippedSeen.has(id)) return false
      equippedSeen.add(id)
      return true
    })
    .slice(0, 3)

  const divineSeen = new Set<string>()
  const divineAbilityIds = stringList(player.divineAbilityIds).filter((id) => {
    if (divineSeen.has(id)) return false
    divineSeen.add(id)
    return true
  })
  const activeSource = Array.isArray(player.activeDivineIds)
    ? stringList(player.activeDivineIds)
    : []
  const activeSeen = new Set<string>()
  const realm = player.realm === 'golden_core' ? 'golden_core' : 'mortal'
  const activeLimit = realm === 'golden_core' ? 2 : 1
  const activeDivineIds = activeSource
    .filter((id) => {
      if (!divineAbilityIds.includes(id) || activeSeen.has(id)) return false
      activeSeen.add(id)
      return true
    })
    .slice(0, activeLimit)

  const professions = isRecord(player.professions) ? player.professions : {}
  const craftCooldowns: Record<string, number> = {}
  if (isRecord(player.craftCooldowns)) {
    for (const [id, value] of Object.entries(player.craftCooldowns)) {
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        craftCooldowns[id] = Math.floor(value)
      }
    }
  }

  const bloodline = normalizeBloodlineState(player.bloodline)

  return {
    ...player,
    physiqueId:
      typeof player.physiqueId === 'string' && player.physiqueId.length > 0
        ? player.physiqueId
        : 'physique.longhan.mortal',
    body: normalizeBodyState(player.body, player.realm, player.stage),
    bloodline,
    equippedTechniqueIds,
    divineAbilityIds,
    activeDivineIds,
    professions: {
      alchemy: normalizeProfession(professions.alchemy),
      forging: normalizeProfession(professions.forging),
    },
    craftCooldowns,
    foundation: normalizeFoundation(player.foundation),
  }
}

function migrateV12ToV13(data: unknown): unknown {
  if (!isRecord(data)) return data
  const player = isRecord(data.player) ? data.player : {}
  return {
    ...data,
    schemaVersion: 13,
    player: normalizePlayerProgression(player),
  }
}

function migrateV13ToV14(data: unknown): unknown {
  if (!isRecord(data)) return data
  const player = isRecord(data.player) ? data.player : {}
  return {
    ...data,
    schemaVersion: 14,
    player: normalizePlayerProgression(player),
  }
}

const MIGRATIONS: Record<number, (data: unknown) => unknown> = {
  1: migrateV1ToV2,
  2: migrateV2ToV3,
  3: migrateV3ToV4,
  4: migrateV4ToV5,
  5: migrateV5ToV6,
  6: migrateV6ToV7,
  7: migrateV7ToV8,
  8: migrateV8ToV9,
  9: migrateV9ToV10,
  10: migrateV10ToV11,
  11: migrateV11ToV12,
  12: migrateV12ToV13,
  13: migrateV13ToV14,
}

export function migrateSaveEnvelope(envelope: SaveEnvelope): SaveEnvelope {
  if (envelope.version === SAVE_VERSION) {
    if (!isRecord(envelope.data)) return envelope
    const data = envelope.data
    const player = isRecord(data.player) ? data.player : {}
    const normalized = {
      ...data,
      player: normalizePlayerProgression({
        ...player,
        dao: normalizeDaoState(player.dao, migrationEarnedMarks(data)),
      }),
    }
    return {
      ...envelope,
      checksum: checksum(normalized),
      data: normalized,
    }
  }
  if (envelope.version > SAVE_VERSION) {
    throw new RangeError(`存档版本 ${envelope.version} 高于当前支持的 ${SAVE_VERSION}`)
  }

  let version = envelope.version
  let data = envelope.data
  while (version < SAVE_VERSION) {
    const migration = MIGRATIONS[version]
    if (!migration) {
      throw new RangeError(`缺少从 v${version} 到 v${version + 1} 的迁移`)
    }
    data = migration(data)
    version += 1
  }

  return {
    version: SAVE_VERSION,
    createdAt: envelope.createdAt,
    updatedAt: envelope.updatedAt,
    checksum: checksum(data),
    data,
  }
}

export function decodeSaveEnvelope(value: unknown): SaveDecodeResult {
  if (!isSaveEnvelope(value)) {
    return {
      ok: false,
      reason: 'invalid-envelope',
      message: '存档信封结构不完整',
    }
  }
  if (value.version < 1 || value.version > SAVE_VERSION) {
    return {
      ok: false,
      reason: 'unsupported-version',
      message: `不支持的存档版本：${value.version}`,
    }
  }
  if (!verifySaveEnvelope(value)) {
    return {
      ok: false,
      reason: 'checksum',
      message: '存档校验失败，文件可能已损坏',
    }
  }

  try {
    const envelope = migrateSaveEnvelope(value)
    return {
      ok: true,
      envelope,
      migrated: envelope.version !== value.version,
    }
  } catch (error) {
    return {
      ok: false,
      reason: 'migration',
      message: error instanceof Error ? error.message : '存档迁移失败',
    }
  }
}

export function decodeSaveJson(json: string): SaveDecodeResult {
  let value: unknown
  try {
    value = JSON.parse(json)
  } catch {
    return {
      ok: false,
      reason: 'invalid-json',
      message: '存档不是合法的 JSON',
    }
  }
  return decodeSaveEnvelope(value)
}
