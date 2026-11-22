import type {
  BloodlineDefinition,
  CatalogItem,
  CaveDefinition,
  CharacterOriginDefinition,
  CharacterPhysiqueDefinition,
  CharacterRootDefinition,
  CraftRecipeDefinition,
  DataPack,
  DivineAbilityDefinition,
  EncounterDefinition,
  EnemyDefinition,
  EraDefinition,
  EventDefinition,
  FactionDefinition,
  MountDefinition,
  PartnerDefinition,
  PetDefinition,
  RegionDefinition,
  SecretRealmDefinition,
  SiteDefinition,
  TalentDefinition,
  TechniqueDefinition,
  WorldBossDefinition,
} from '@/types/content'
import type {
  DaoClusterDefinition,
  DaoNodeDefinition,
  DaoPrincipleDefinition,
} from '@/types/dao'
import type {
  CaveId,
  EncounterId,
  EnemyId,
  EraId,
  EventId,
  FactionId,
  ItemId,
  MountId,
  PartnerId,
  PetId,
  RegionId,
  SecretRealmId,
  SiteId,
  TechniqueId,
  WorldBossId,
  DaoClusterId,
  DaoNodeId,
  DaoPrincipleId,
  DivineAbilityId,
  CraftRecipeId,
  PhysiqueId,
  BloodlineId,
} from '@/types/common'

export const VALIDATION_CODES = [
  'MISSING_FIELD',
  'INVALID_ID',
  'DUPLICATE_ID',
  'INVALID_ENUM',
  'INVALID_RANGE',
  'INVALID_VALUE',
  'MISSING_REFERENCE',
  'NON_NUMERIC_EFFECT_REQUIRED',
  'EMPTY_BRANCH',
  'EVENT_DEAD_END',
  'EVENT_UNREACHABLE',
  'EVENT_CYCLE',
  'FACTION_JOIN_MISSING',
  'FACTION_EXIT_MISSING',
  'FACTION_PROMOTION_MISSING',
  'PARTNER_BOND_MISSING',
  'PARTNER_POST_BOND_MISSING',
  'BUILDING_VERB_MISSING',
  'DAILY_TASK_FORBIDDEN',
  'PLACEHOLDER_TEXT',
  'CROSS_ERA_FATE_MISSING',
  'REGISTRY_ERROR',
] as const

export type ValidationCode = (typeof VALIDATION_CODES)[number]
export type ValidationSeverity = 'error' | 'warning'

export interface ValidationIssue {
  code: ValidationCode
  path: string
  message: string
  severity: ValidationSeverity
}

export interface ValidationStats {
  eras: number
  factions: number
  regions: number
  sites: number
  events: number
  catalogItems: number
  techniques: number
  divineAbilities: number
  craftRecipes: number
  partners: number
  caves: number
  mounts: number
  pets: number
  origins: number
  roots: number
  talents: number
  physiques: number
  bloodlines: number
  enemies: number
  encounters: number
  secretRealms: number
  worldBosses: number
  daoClusters: number
  daoNodes: number
  daoPrinciples: number
}

export interface ValidationResult {
  ok: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  stats: ValidationStats
}

export interface SiteIndexEntry {
  region: RegionDefinition
  site: SiteDefinition
}

export interface ContentIndex {
  eras: Map<EraId, EraDefinition>
  factions: Map<FactionId, FactionDefinition>
  regions: Map<RegionId, RegionDefinition>
  events: Map<EventId, EventDefinition>
  catalog: Map<ItemId, CatalogItem>
  techniques: Map<TechniqueId, TechniqueDefinition>
  divineAbilities: Map<DivineAbilityId, DivineAbilityDefinition>
  craftRecipes: Map<CraftRecipeId, CraftRecipeDefinition>
  partners: Map<PartnerId, PartnerDefinition>
  caves: Map<CaveId, CaveDefinition>
  mounts: Map<MountId, MountDefinition>
  pets: Map<PetId, PetDefinition>
  origins: Map<string, CharacterOriginDefinition>
  roots: Map<string, CharacterRootDefinition>
  talents: Map<string, TalentDefinition>
  physiques: Map<PhysiqueId, CharacterPhysiqueDefinition>
  bloodlines: Map<BloodlineId, BloodlineDefinition>
  enemies: Map<EnemyId, EnemyDefinition>
  encounters: Map<EncounterId, EncounterDefinition>
  secretRealms: Map<SecretRealmId, SecretRealmDefinition>
  worldBosses: Map<WorldBossId, WorldBossDefinition>
  daoClusters: Map<DaoClusterId, DaoClusterDefinition>
  daoNodes: Map<DaoNodeId, DaoNodeDefinition>
  daoPrinciples: Map<DaoPrincipleId, DaoPrincipleDefinition>
  sites: Map<SiteId, SiteIndexEntry>
}

export interface ValidationContext {
  packs: DataPack[]
  index: ContentIndex
  issues: ValidationIssue[]
}
