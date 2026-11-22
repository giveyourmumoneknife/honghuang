import type {
  CaveId,
  CraftDiscipline,
  CraftRecipeId,
  DiscipleAssignment,
  DivineAbilityId,
  EraId,
  EventId,
  FactionId,
  FlagValue,
  ItemId,
  MountId,
  PartnerId,
  PetId,
  PlayerId,
  RegionId,
  RealmId,
  RealmStage,
  ResourceKey,
  SiteId,
  TechniqueId,
  WorldBossId,
  PauseMode,
  PausePolicy,
  GameSpeed,
  DaoNodeId,
  DaoPrincipleId,
} from './common'
import type { GeneratedGear, GearSlot } from './gear'
import type { TrainingReport, TrainingSession } from './training'

export interface PlayerDaoState {
  /** 尚未花费的星痕。 */
  marks: number
  /** 这一世累计获得的星痕。 */
  earned: number
  /** 已点亮的星位。 */
  nodes: DaoNodeId[]
  /** 已选定的道则，至多一枚。 */
  principles: DaoPrincipleId[]
  /** 道途重塑次数。 */
  respecs: number
}

export interface PlayerProfessionState {
  /** 累计熟练度，达到门槛自动晋阶。 */
  proficiency: number
  /** 开炉次数。 */
  crafts: number
}

export type BodyPath = 'law' | 'body' | 'dual'

export interface PlayerBodyState {
  /** 已积蓄的体魄淬炼值。 */
  temper: number
  /** 体魄阶段：0 凡躯、1 淬皮、2 易骨、3 换血、4 金身、5 不漏。 */
  stage: number
  path: BodyPath
  /** 转换修行路径时的年月，用于冷却。 */
  pathChangedAtMonths?: number
  flags: Record<string, FlagValue>
}

export interface PlayerBloodlineState {
  id: string
  /** 血脉纯度，0 至 100。 */
  purity: number
  /** 血脉阶段：0 沉寂、1 苏醒、2 凝脉、3 化形、4 返祖、5 祖血。 */
  stage: number
  refinedAtMonths?: number
  flags: Record<string, FlagValue>
}

export interface PlayerState {
  id: PlayerId
  name: string
  origin: string
  lineage: string
  originId: string
  rootId: string
  talentIds: string[]
  /** 先天体质；旧存档或未选择时为凡胎。 */
  physiqueId: string
  /** 体魄：淬体进度、阶段与修行路径。 */
  body: PlayerBodyState
  /** 已承载的血脉；同一时间只能有一条。 */
  bloodline?: PlayerBloodlineState
  regionId: RegionId
  realm: RealmId
  stage: RealmStage
  cultivation: number
  health: number
  resources: Record<ResourceKey, number>
  flags: Record<string, FlagValue>
  inventory: Partial<Record<ItemId, number>>
  partnerFavor: Partial<Record<PartnerId, number>>
  techniqueIds: TechniqueId[]
  techniqueProgress: Partial<Record<TechniqueId, number>>
  /** 已装入法门位的功法；只有这些功法的招式会进入战斗。 */
  equippedTechniqueIds: TechniqueId[]
  /** 已融合收录的神通。 */
  divineAbilityIds: DivineAbilityId[]
  /** 神通活跃位；金丹期起多一个位置。 */
  activeDivineIds: DivineAbilityId[]
  /** 丹道与器道的熟练度。 */
  professions: Record<CraftDiscipline, PlayerProfessionState>
  craftCooldowns: Partial<Record<CraftRecipeId, number>>
  /** 丹药淬炼出的后天根基，永久计入六维。 */
  foundation: { health: number; attack: number; defense: number; spirit: number }
  /** 常规装备：可洗练、淬炼、封印与拓印的生成器物。 */
  gearInventory: GeneratedGear[]
  standardEquipment: Partial<Record<GearSlot, string>>
  gearSeq: number
  training?: TrainingSession
  trainingReports: TrainingReport[]
  treasureIds: ItemId[]
  activeTreasureId?: ItemId
  /** 法宝温养层数，每层都改变法宝的被动能力。 */
  treasureTemper: Partial<Record<ItemId, number>>
  mountIds: MountId[]
  mountStages: Partial<Record<MountId, number>>
  activeMountId?: MountId
  petIds: PetId[]
  petEvolutions: Partial<Record<PetId, number>>
  activePetId?: PetId
  itemCooldowns: Partial<Record<ItemId, number>>
  treasureCooldowns: Partial<Record<ItemId, number>>
  partnerIds: PartnerId[]
  /** 周天星图：星痕、星位与道则。 */
  dao: PlayerDaoState
  statuses: Array<{ id: string; monthsRemaining: number; source?: string }>
}

export interface FactionState {
  id: FactionId
  membership: boolean
  rank: number
  contribution: number
  reputation: number
  fortune: number
  flags: Record<string, FlagValue>
}

export interface RegionState {
  id: RegionId
  unlocked: boolean
  visited: boolean
  flags: Record<string, FlagValue>
  unlockedSiteIds: SiteId[]
  /** 每个地点被涉足的次数；首次涉足会留下不同的见闻。 */
  exploredSites: Record<SiteId, number>
}

export interface CharacterFate {
  id: string
  status: 'alive' | 'missing' | 'dead' | 'ascended' | 'unknown'
  note: string
}

export interface WorldState {
  eraId: EraId
  phaseId: string
  year: number
  regions: Record<RegionId, RegionState>
  factions: Record<FactionId, FactionState>
  characters: Record<string, CharacterFate>
  artifacts: Record<ItemId, string>
  fortuneLedger: Record<string, number>
  flags: Record<string, FlagValue>
}

export interface EraRecord {
  eraId: EraId
  entry: string
  exit: string
  settlementNotes: string[]
}

export interface MemoryEntry {
  id: string
  text: string
  createdAtMonths: number
  sourceEventId?: EventId
}

export interface LegacyState {
  daoguo: number
  memories: MemoryEntry[]
  cave?: CaveState
  lineage?: string
  partnerFates: Record<PartnerId, string>
}

export type EraTransitionMode = 'continue' | 'reincarnate' | 'stay'

export interface EraEnding {
  eraId: EraId
  mode: EraTransitionMode
  title: string
  summary: string
  settledAtMonths: number
  daoguoGained: number
  nextEraId?: EraId
}

export interface CampaignState {
  currentEra: EraId
  unlockedEras: EraId[]
  history: EraRecord[]
  world: WorldState
  legacy: LegacyState
  ending?: EraEnding
}

export interface CaveRaidState {
  raidId: string
  startedMonths: number
  dueMonths: number
  encounterQueued: boolean
}

export interface CaveVisitorState {
  visitorId: string
  arrivedMonths: number
}

export type CaveLogKind =
  | 'build'
  | 'vein'
  | 'disciple'
  | 'visitor'
  | 'raid'
  | 'care'
  | 'production'

export interface CaveLogEntry {
  id: string
  kind: CaveLogKind
  text: string
  createdAtMonths: number
}

export interface CaveState {
  id: CaveId
  buildings: Record<string, number>
  spiritVeinLevel: number
  /** 灵脉脉息，0 至 100；过低会拖累产出与护洞。 */
  purity: number
  /** 洞府声望；来客与来袭的频率都会受它影响。 */
  reputation: number
  discipleIds: string[]
  discipleAssignments: Partial<Record<string, DiscipleAssignment>>
  discipleTrust: Partial<Record<string, number>>
  /** 每位道童在各差事上累积的月数，换差事不会清零。 */
  discipleExpertise: Partial<
    Record<string, Partial<Record<DiscipleAssignment, number>>>
  >
  flags: Record<string, FlagValue>
  raid?: CaveRaidState
  nextRaidMonths: number
  raidsDefended: number
  visitor?: CaveVisitorState
  nextVisitorMonths: number
  /** 洞府运转的潮息库存。 */
  tide: number
  /** 每条生产链是否开炉；缺省视为运转。 */
  chainEnabled: Record<string, boolean>
  /** 每条生产链当前批次的推进月数。 */
  chainProgress: Record<string, number>
  log: CaveLogEntry[]
}

export interface InboxEntry {
  id: string
  eventId: EventId
  kind: PauseMode
  createdAt: string
  createdMonths: number
  read: boolean
  sourceEventId?: EventId
}

export interface ChronicleEntry {
  id: string
  eraId: EraId
  eventId?: EventId
  choiceId?: string
  title: string
  text: string
  year: number
}

export interface ScheduledEvent {
  id: string
  eventId: EventId
  dueMonths: number
  sourceEventId?: EventId
}

export interface EventHistoryEntry {
  eventId: EventId
  count: number
  lastTriggeredMonths: number
  lastResolvedMonths?: number
  lastChoiceId?: string
}

export interface RumorEntry {
  id: string
  text: string
  createdAtMonths: number
  sourceEventId?: EventId
}

export interface FavorLogEntry {
  partnerId: PartnerId
  delta: number
  reason: string
  createdAtMonths: number
  sourceEventId?: EventId
}

export interface PendingEncounter {
  id: string
  encounterId: string
  fleeAllowed: boolean
  createdAtMonths: number
  sourceEventId?: EventId
  /** Cave raids and world bosses carry extra stakes outside the event queue. */
  source?: 'cave_raid' | 'world_boss'
  bossId?: WorldBossId
}

export interface WorldBossState {
  id: WorldBossId
  attempts: number
  kills: number
  firstKilledAtMonths?: number
  lastKilledAtMonths?: number
  respawnAtMonths?: number
  /** 已为哪一次复活留下潮声，避免每月重复。 */
  returnRumorForMonths?: number
}

export interface EventRuntimeState {
  scheduled: ScheduledEvent[]
  history: Record<EventId, EventHistoryEntry>
  rumors: RumorEntry[]
  favorLog: FavorLogEntry[]
  pendingEncounters: PendingEncounter[]
  nextSequence: number
}

export type PauseSource = 'story' | 'ambient' | 'manual'

export interface PauseToken {
  id: string
  source: PauseSource
  label: string
  eventId?: EventId
}

export interface GameClock {
  elapsedMonths: number
  speed: GameSpeed
  tokens: PauseToken[]
}

export type IdleSlot = 'cultivation' | 'cave' | 'travel'

export interface IdleSlotState {
  active: boolean
  months: number
}

export interface IdleState {
  slots: Record<IdleSlot, IdleSlotState>
  travelProgress: number
}

export interface GameSettings {
  speed: GameSpeed
  pauseMode: PausePolicy
  offlineCapHours: number
  offlineEfficiency: number
}

export interface RngState {
  seed: number
  state: number
  draws: number
}

/** Envelope-agnostic save body; M2 owns persistence and migration. */
export interface GameSaveData {
  schemaVersion: number
  player: PlayerState
  campaign: CampaignState
  cave?: CaveState
  inbox: InboxEntry[]
  chronicle: ChronicleEntry[]
  clock: GameClock
  idle: IdleState
  eventRuntime: EventRuntimeState
  worldBosses: Record<WorldBossId, WorldBossState>
  settings: GameSettings
  rng: RngState
  lastSavedAt: string
}
