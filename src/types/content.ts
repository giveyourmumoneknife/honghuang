import type {
  BloodlineId,
  CaveId,
  CombatSkillEffect,
  CombatTrait,
  CraftDiscipline,
  CraftRecipeId,
  DiscipleAssignment,
  DivineAbilityId,
  Element,
  EncounterId,
  EnemyId,
  EraId,
  EventId,
  EventKind,
  FactionArchetype,
  FactionId,
  FactionStanding,
  FactionStatus,
  ItemId,
  MountId,
  MountTerrain,
  PartnerId,
  PartnerRole,
  PauseMode,
  PetId,
  PhysiqueId,
  PetRole,
  Rarity,
  RegionId,
  RegionKind,
  ResourceCost,
  ResourceKey,
  SecretRealmId,
  SiteId,
  TechniqueId,
  WorldBossId,
} from './common'
import type { DaoClusterDefinition, DaoNodeDefinition, DaoPrincipleDefinition } from './dao'
import type { Effect, Requirement } from './dsl'
import type { CombatMods, GearSlot } from './gear'

export interface CombatStats {
  health?: number
  attack?: number
  defense?: number
  speed?: number
  crit?: number
  spirit?: number
}

export interface CombatSkillDefinition {
  id: string
  name: string
  description: string
  cooldown: number
  multiplier: number
  effect?: CombatSkillEffect
  power?: number
}

export interface CharacterOriginDefinition {
  id: string
  name: string
  description: string
  note: string
  stats?: CombatStats
  startingResources?: ResourceCost
}

export interface CharacterRootDefinition {
  id: string
  name: string
  element?: Element
  description: string
  note: string
  stats: CombatStats
  cultivationMultiplier: number
}

export interface TalentDefinition {
  id: string
  name: string
  description: string
  note: string
  stats?: CombatStats
  cultivationBonus?: number
}

export interface PhysiqueAwakeningDefinition {
  /** 解锁所需的体魄阶段。 */
  stage: number
  name: string
  description: string
  stats?: CombatStats
  mods?: Partial<CombatMods>
}

export interface CharacterPhysiqueDefinition {
  id: PhysiqueId
  name: string
  description: string
  note: string
  /** 创建角色时是否可选；凡胎仅作为旧存档兜底。 */
  selectable?: boolean
  stats?: CombatStats
  cultivationMultiplier: number
  bodyTemperMultiplier: number
  /** 突破体魄时的额外成功率。 */
  bodyBreakthroughBonus: number
  /** 对各血脉的亲和加成，数值为额外成功率。 */
  bloodlineAffinity: Record<string, number>
  awakenings: PhysiqueAwakeningDefinition[]
}

export interface BloodlineStageDefinition {
  stage: number
  name: string
  description: string
  /** 达到该阶段所需纯度。 */
  purity: number
  /** 达到该阶段所需体魄阶段。 */
  bodyStage: number
  stats?: CombatStats
  mods?: Partial<CombatMods>
}

export interface BloodlineAcquisitionDefinition {
  bodyStage: number
  cultivation: number
  resources: ResourceCost
  items: Record<string, number>
  hint: string
}

export interface BloodlineRefinementDefinition {
  purityGain: number
  baseCultivation: number
  cultivationPerStage: number
  resources: ResourceCost
  items: Record<string, number>
}

export interface BloodlineDefinition {
  id: BloodlineId
  name: string
  element?: Element
  description: string
  note: string
  affinityPhysiqueIds: PhysiqueId[]
  acquisition: BloodlineAcquisitionDefinition
  refinement: BloodlineRefinementDefinition
  sever: {
    cultivation: number
    resources: ResourceCost
  }
  stages: BloodlineStageDefinition[]
  /** 达到该阶段后可在争斗中施展血脉神通。 */
  skillUnlockStage: number
  skill: CombatSkillDefinition
}

export interface SiteDefinition {
  id: SiteId
  name: string
  description: string
  hidden: boolean
  unlockRequirements: Requirement[]
  tags?: string[]
}

export interface RegionDefinition {
  id: RegionId
  name: string
  kind: RegionKind
  description: string
  eraIds: EraId[]
  hidden: boolean
  danger: number
  /** 已通潮路的相邻区域；未解锁区域只能从相邻处踏入。 */
  neighbors: RegionId[]
  /** 未解锁时的额外因缘；留空表示相邻即可开路。 */
  unlockRequirements?: Requirement[]
  sites: SiteDefinition[]
  factionPresence: FactionId[]
  /** 探幽时有几率撞上的遭遇；危险地域才会填写。 */
  encounterIds?: EncounterId[]
  tags?: string[]
}

export interface EraPhase {
  id: string
  name: string
  order: number
  summary: string
  gateRequirements: Requirement[]
}

export interface FactionPresence {
  factionId: FactionId
  status: FactionStatus
  note: string
}

export interface EraTransition {
  nextEraId?: EraId
  modes: Array<'continue' | 'reincarnate' | 'stay'>
  summary: string
}

export interface SettlementRule {
  id: string
  label: string
  description: string
  effects: Effect[]
}

export interface EraDefinition {
  id: EraId
  order: number
  name: string
  subtitle: string
  summary: string
  startYear: number
  endYear: number
  phases: EraPhase[]
  factionRoster: FactionPresence[]
  regionIds: RegionId[]
  eventIds: EventId[]
  transition: EraTransition
  settlement: SettlementRule[]
  /** Optional gates that must be satisfied before the era can be settled. */
  settlementRequirements?: Requirement[]
  tags?: string[]
}

export interface JoinRule {
  requirements: Requirement[]
  entryEventId?: EventId
  entryCost?: ResourceCost
  description: string
}

export interface ExitRule {
  allowed: boolean
  requirements: Requirement[]
  consequence: string
}

export interface RankDefinition {
  id: string
  title: string
  order: number
  requirements: Requirement[]
  /** A promotion must have a test, even when it is resolved by an event. */
  trial: string
  trialEventId?: EventId
}

export interface FactionRelation {
  factionId: FactionId
  standing: FactionStanding
  note: string
}

export interface FactionDefinition {
  id: FactionId
  name: string
  archetype: FactionArchetype
  joinable: boolean
  description: string
  /** Every era in the campaign must have a presence entry, including `absent`. */
  eraPresence: Record<string, FactionStatus>
  join?: JoinRule
  exit?: ExitRule
  ranks: RankDefinition[]
  treeId?: string
  facilityId?: string
  /** Techniques the faction can pass on once the player has earned a rank. */
  techniqueIds?: TechniqueId[]
  eventIds: EventId[]
  relations: FactionRelation[]
  tags?: string[]
}

export interface ChoiceDefinition {
  id: string
  text: string
  requirements: Requirement[]
  effects: Effect[]
  outcome: string
  nextEventId?: EventId
}

export interface EventDefinition {
  id: EventId
  eraId: EraId
  kind: EventKind
  title: string
  summary: string
  body: string
  /** Story events stop all timers; ambient events go to the inbox. */
  pause: PauseMode
  repeatable: boolean
  weight?: number
  cooldownMonths?: number
  /** Marks this event as part of the world's roaming event pool. */
  dispatch?: boolean
  factionId?: FactionId
  regionId?: RegionId
  partnerId?: PartnerId
  requirements: Requirement[]
  onEnter: Effect[]
  choices: ChoiceDefinition[]
  tags?: string[]
  /** Set on events created by `scheduleEvent` for chronicle tracing. */
  sourceEventId?: EventId
}

export interface EncounterReward {
  cultivation?: number
  resources?: ResourceCost
  items?: Array<{ itemId: ItemId; count?: number }>
}

export interface EnemyDefinition {
  id: EnemyId
  name: string
  title: string
  description: string
  element?: Element
  stats: CombatStats
  traits: CombatTrait[]
  skills: CombatSkillDefinition[]
  reward?: EncounterReward
}

export interface EncounterDefinition {
  id: EncounterId
  name: string
  summary: string
  description: string
  enemyIds: EnemyId[]
  regionId?: RegionId
  /** 敌势阶 1–6，决定历练是否会在当前境界遇到它，也用于地域强度展示。 */
  tier?: number
  requirements: Requirement[]
  victoryEffects: Effect[]
  defeatEffects: Effect[]
  reward?: EncounterReward
  fleeAllowed: boolean
  tags?: string[]
}

export type SecretRealmRewardKind =
  | 'item'
  | 'resource'
  | 'cultivation'
  | 'gear'
  | 'technique'
  | 'treasure'
  | 'mount'
  | 'pet'

/** 秘境奖励条目。一次秘境会按权重抽取若干条，重复获得的养成物会转成修为。 */
export interface SecretRealmReward {
  kind: SecretRealmRewardKind
  weight: number
  itemId?: ItemId
  countMin?: number
  countMax?: number
  resource?: ResourceKey
  amountMin?: number
  amountMax?: number
  cultivationMin?: number
  cultivationMax?: number
  techniqueId?: TechniqueId
  treasureId?: ItemId
  mountId?: MountId
  petId?: PetId
  gearTier?: number
  qualityBonus?: number
}

/**
 * A place that opens off the training road for a few days and then closes.
 * Rewards use ranges so the same realm can feel different on each visit.
 */
export interface SecretRealmDefinition {
  id: SecretRealmId
  eraId: EraId
  name: string
  summary: string
  description: string
  regionIds: RegionId[]
  /** 1–6，和遭遇敌势同一把尺子。 */
  tier: number
  weight: number
  /** 一次发现抽取几条奖励（含上下限）。 */
  rewardPicks: [number, number]
  rewards: SecretRealmReward[]
  tags?: string[]
}

export type WorldBossDropKind = 'item' | 'treasure' | 'resource' | 'cultivation' | 'gear'

/** 世界 Boss 的掉落条目；数值区间由引擎按存档随机流掷出。 */
export interface WorldBossDrop {
  kind: WorldBossDropKind
  weight: number
  itemId?: ItemId
  countMin?: number
  countMax?: number
  resource?: ResourceKey
  amountMin?: number
  amountMax?: number
  cultivationMin?: number
  cultivationMax?: number
  gearSlot?: GearSlot
  gearTier?: number
  qualityBonus?: number
  firstKillOnly?: boolean
}

/**
 * 世界 Boss 的某一段分身。原身只存在于背景与掉落描述里；
 * 现世出现的是它在不同量劫阶段留下的那一部分。
 */
export interface WorldBossDefinition {
  id: WorldBossId
  eraId: EraId
  name: string
  title: string
  originalName: string
  summary: string
  description: string
  originalBody: string
  regionId: RegionId
  encounterId: EncounterId
  /** 从该阶段顺序起可现身；更早阶段视为尚未到来。 */
  phaseOrder: number
  requirements: Requirement[]
  respawnMonths: number
  /** 每多击杀一次，分身强度增加的比例与上限。 */
  killScale: number
  maxScale: number
  guaranteedDrops: WorldBossDrop[]
  dropPicks: [number, number]
  drops: WorldBossDrop[]
  onFirstKill?: Effect[]
  onEveryKill?: Effect[]
  /** 未满足现世条件前，不在图鉴之外的世界列表显露。 */
  hidden?: boolean
  tags?: string[]
}

export interface ItemBase {
  id: ItemId
  name: string
  rarity: Rarity
  description: string
  flavor?: string
  tags?: string[]
  stackLimit?: number
  value?: number
}

export interface MaterialItemDefinition extends ItemBase {
  category: 'material'
  source: string
  usedBy: string[]
}

export interface ConsumableItemDefinition extends ItemBase {
  category: 'consumable'
  effects: Effect[]
  drawback: string
  cooldownMonths?: number
}

export interface QuestItemDefinition extends ItemBase {
  category: 'quest'
}

export type ItemDefinition =
  | MaterialItemDefinition
  | ConsumableItemDefinition
  | QuestItemDefinition

export interface TreasureAbility {
  id: string
  name: string
  description: string
  effects: Effect[]
}

export interface TreasureCost {
  description: string
  effects: Effect[]
}

export interface TreasureSpirit {
  name: string
  traits: string[]
  description: string
}

export interface TreasureTemperStage {
  stage: 1 | 2
  name: string
  description: string
  requirements: Requirement[]
  cultivation: number
  cost: ResourceCost
  stats: CombatStats
  cooldownReduction: number
}

export interface TreasureDefinition {
  id: ItemId
  name: string
  category: 'treasure'
  grade: 1 | 2 | 3
  rarity: Rarity
  description: string
  flavor?: string
  active: TreasureAbility
  cost: TreasureCost
  spirit: TreasureSpirit
  passiveStats?: CombatStats
  tempering: TreasureTemperStage[]
  value?: number
  tags?: string[]
}

export interface TechniqueNode {
  id: string
  name: string
  description: string
  requirements: Requirement[]
  effects: Effect[]
  stats?: CombatStats
  cost?: { cultivation: number; spiritStones?: number }
}

export interface TechniqueDefinition {
  id: TechniqueId
  name: string
  description: string
  schoolId: string
  element?: Element
  tier: number
  nodes: TechniqueNode[]
  passive: string[]
  skill?: CombatSkillDefinition
  tags?: string[]
}

/**
 * 两门圆满功法融合出的神通。融合后永久收录，但只有活跃位中的神通
 * 才会把招式带入战斗，迫使玩家在收集与出战之间取舍。
 */
export interface DivineAbilityDefinition {
  id: DivineAbilityId
  name: string
  title: string
  description: string
  flavor?: string
  techniqueIds: [TechniqueId, TechniqueId]
  element?: Element
  cultivation: number
  spiritStones: number
  items: Array<{ itemId: ItemId; count: number }>
  passiveStats?: CombatStats
  skill: CombatSkillDefinition
  tags?: string[]
}

export type CraftOutput =
  | { kind: 'item'; itemId: ItemId; countMin: number; countMax: number }
  | { kind: 'gear'; tier: number; qualityBonus: number }

export interface CraftRecipeDefinition {
  id: CraftRecipeId
  discipline: CraftDiscipline
  name: string
  description: string
  buildingId: string
  requiredBuildingLevel: number
  requiredRank: number
  cost: ResourceCost
  items: Array<{ itemId: ItemId; count: number }>
  cooldownMonths: number
  xp: number
  output: CraftOutput
  flavor?: string
  tags?: string[]
}

export interface BondRule {
  requirements: Requirement[]
  eventId?: EventId
  description: string
}

export interface PartnerDefinition {
  id: PartnerId
  name: string
  factionId?: FactionId
  /** A partner must leave a fate entry for every era in the campaign. */
  eraFates: Record<string, string>
  description: string
  role: PartnerRole
  bond: BondRule
  postBondEventIds: EventId[]
  publicEventIds?: EventId[]
  combatSkill?: string
  tags?: string[]
}

export interface CaveVerbDefinition {
  id: string
  name: string
  description: string
  cost: ResourceCost
  cooldownMonths: number
  effects: Effect[]
}

export interface BuildingLevelDefinition {
  level: 1 | 2 | 3
  name: string
  description: string
  cost: ResourceCost
  /** Every upgrade must unlock a verb, not only a passive percentage. */
  verbs: string[]
  verb?: CaveVerbDefinition
  effects: Effect[]
}

export interface CaveBuildingDefinition {
  id: string
  name: string
  description: string
  levels: BuildingLevelDefinition[]
}

export interface SpiritVeinLevelDefinition {
  level: number
  name: string
  description: string
  cost: ResourceCost
  effects: Effect[]
}

export interface CaveSpiritVein {
  name: string
  attributes: string[]
  description: string
  levels: SpiritVeinLevelDefinition[]
}

export interface CaveDiscipleDefinition {
  id: string
  name: string
  title: string
  description: string
  temperament: string
  bondNote: string
  aptitude: DiscipleAssignment
  requirements: Requirement[]
  recruitCost: ResourceCost
  /** Lines shown in the cave as trust rises. */
  trustLines: string[]
}

export interface CaveRaidDefinition {
  id: string
  name: string
  description: string
  warning: string
  encounterId: EncounterId
  minVeinLevel: number
  warningMonths: number
  weight: number
  /** Vein levels torn away when the warning is ignored. */
  veinDamage?: number
  /** What happens when the warning is ignored for too long. */
  ignoredEffects: Effect[]
}

export interface CaveVisitorChoice {
  id: string
  label: string
  description: string
  requirements: Requirement[]
  cost?: ResourceCost
  effects: Effect[]
}

export interface CaveVisitorDefinition {
  id: string
  name: string
  title: string
  description: string
  greeting: string
  requirements: Requirement[]
  weight: number
  choices: CaveVisitorChoice[]
}

export interface CaveProductionChainDefinition {
  id: string
  name: string
  description: string
  /** 两栋建筑共同成链；都达到 1 级才运转。 */
  buildingIds: [string, string]
  /** 会为这条链加成的道童差事。 */
  assignments: DiscipleAssignment[]
  tidePerMonth: number
  /** 完成一批产出所需的月数；效率越高，推进越快。 */
  intervalMonths: number
  inputs: ResourceCost
  outputs: Effect[]
  /** 运转时每月对灵脉澄澈的影响，可为负。 */
  purityPerMonth: number
}

export interface CaveDefinition {
  id: CaveId
  name: string
  description: string
  buildings: CaveBuildingDefinition[]
  spiritVein: CaveSpiritVein
  disciples: CaveDiscipleDefinition[]
  raids: CaveRaidDefinition[]
  visitors: CaveVisitorDefinition[]
  /** 长期运转的生产链，由洞府自动按月结算。 */
  chains: CaveProductionChainDefinition[]
}

export interface MountStage {
  stage: 1 | 2 | 3
  name: string
  description: string
  effects: Effect[]
  stats?: CombatStats
  travelBonus?: number
}

export interface MountDefinition {
  id: MountId
  name: string
  description: string
  terrain: MountTerrain
  stages: MountStage[]
  tags?: string[]
}

export interface PetEvolution {
  id: string
  name: string
  description: string
  role: PetRole
  effects: Effect[]
  stats?: CombatStats
}

export interface PetDefinition {
  id: PetId
  name: string
  description: string
  role: PetRole
  temperament: string
  evolutions: PetEvolution[]
  tags?: string[]
}

/**
 * A pack is the unit of content loading. IDs are globally unique across all
 * packs and all entity kinds, so effects can reference them without ambiguity.
 */
export interface DataPack {
  id: string
  version: number
  eras: EraDefinition[]
  factions: FactionDefinition[]
  regions: RegionDefinition[]
  events: EventDefinition[]
  origins: CharacterOriginDefinition[]
  roots: CharacterRootDefinition[]
  talents: TalentDefinition[]
  physiques: CharacterPhysiqueDefinition[]
  bloodlines: BloodlineDefinition[]
  items: ItemDefinition[]
  treasures: TreasureDefinition[]
  techniques: TechniqueDefinition[]
  divineAbilities: DivineAbilityDefinition[]
  craftRecipes: CraftRecipeDefinition[]
  partners: PartnerDefinition[]
  caves: CaveDefinition[]
  mounts: MountDefinition[]
  pets: PetDefinition[]
  enemies: EnemyDefinition[]
  encounters: EncounterDefinition[]
  secretRealms: SecretRealmDefinition[]
  worldBosses: WorldBossDefinition[]
  daoClusters: DaoClusterDefinition[]
  daoNodes: DaoNodeDefinition[]
  daoPrinciples: DaoPrincipleDefinition[]
}

export type CatalogItem = ItemDefinition | TreasureDefinition
