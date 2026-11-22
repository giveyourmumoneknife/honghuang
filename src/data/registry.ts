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
import type {
  DaoClusterDefinition,
  DaoNodeDefinition,
  DaoPrincipleDefinition,
} from '@/types/dao'
import type {
  CatalogItem,
  CaveDefinition,
  BloodlineDefinition,
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
  ItemDefinition,
  MountDefinition,
  PartnerDefinition,
  PetDefinition,
  RegionDefinition,
  SecretRealmDefinition,
  SiteDefinition,
  TalentDefinition,
  TechniqueDefinition,
  TreasureDefinition,
  WorldBossDefinition,
} from '@/types/content'

export type ContentKind =
  | 'era'
  | 'faction'
  | 'region'
  | 'site'
  | 'event'
  | 'origin'
  | 'root'
  | 'talent'
  | 'physique'
  | 'bloodline'
  | 'item'
  | 'treasure'
  | 'technique'
  | 'divineAbility'
  | 'craftRecipe'
  | 'partner'
  | 'cave'
  | 'mount'
  | 'pet'
  | 'enemy'
  | 'encounter'
  | 'secretRealm'
  | 'worldBoss'
  | 'daoCluster'
  | 'daoNode'
  | 'daoPrinciple'

export interface ContentRegistry {
  packs: readonly DataPack[]
  eras: ReadonlyMap<EraId, EraDefinition>
  factions: ReadonlyMap<FactionId, FactionDefinition>
  regions: ReadonlyMap<RegionId, RegionDefinition>
  events: ReadonlyMap<EventId, EventDefinition>
  origins: ReadonlyMap<string, CharacterOriginDefinition>
  roots: ReadonlyMap<string, CharacterRootDefinition>
  talents: ReadonlyMap<string, TalentDefinition>
  physiques: ReadonlyMap<PhysiqueId, CharacterPhysiqueDefinition>
  bloodlines: ReadonlyMap<BloodlineId, BloodlineDefinition>
  items: ReadonlyMap<ItemId, ItemDefinition>
  treasures: ReadonlyMap<ItemId, TreasureDefinition>
  techniques: ReadonlyMap<TechniqueId, TechniqueDefinition>
  divineAbilities: ReadonlyMap<DivineAbilityId, DivineAbilityDefinition>
  craftRecipes: ReadonlyMap<CraftRecipeId, CraftRecipeDefinition>
  partners: ReadonlyMap<PartnerId, PartnerDefinition>
  caves: ReadonlyMap<CaveId, CaveDefinition>
  mounts: ReadonlyMap<MountId, MountDefinition>
  pets: ReadonlyMap<PetId, PetDefinition>
  enemies: ReadonlyMap<EnemyId, EnemyDefinition>
  encounters: ReadonlyMap<EncounterId, EncounterDefinition>
  secretRealms: ReadonlyMap<SecretRealmId, SecretRealmDefinition>
  worldBosses: ReadonlyMap<WorldBossId, WorldBossDefinition>
  daoClusters: ReadonlyMap<DaoClusterId, DaoClusterDefinition>
  daoNodes: ReadonlyMap<DaoNodeId, DaoNodeDefinition>
  daoPrinciples: ReadonlyMap<DaoPrincipleId, DaoPrincipleDefinition>
  allItems: ReadonlyMap<ItemId, CatalogItem>
  siteOwners: ReadonlyMap<SiteId, RegionId>
  getItem(id: ItemId): CatalogItem | undefined
  resolveSite(id: SiteId): { region: RegionDefinition; site: SiteDefinition } | undefined
}

export interface ContentStats {
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
  enemies: number
  encounters: number
  secretRealms: number
  worldBosses: number
  daoClusters: number
  daoNodes: number
  daoPrinciples: number
  physiques: number
  bloodlines: number
}

export class DuplicateContentIdError extends Error {
  readonly id: string
  readonly kind: ContentKind
  readonly existingKind: ContentKind

  constructor(id: string, kind: ContentKind, existingKind: ContentKind) {
    super(`内容 ID 重复：${id}（已有 ${existingKind}，又出现 ${kind}）`)
    this.name = 'DuplicateContentIdError'
    this.id = id
    this.kind = kind
    this.existingKind = existingKind
  }
}

function indexById<T extends { id: string }>(
  entries: readonly T[],
  kind: ContentKind,
  target: Map<string, T>,
  seen: Map<string, ContentKind>,
): void {
  for (const entry of entries) {
    const existingKind = seen.get(entry.id)
    if (existingKind) {
      throw new DuplicateContentIdError(entry.id, kind, existingKind)
    }
    seen.set(entry.id, kind)
    target.set(entry.id, entry)
  }
}

export function createContentRegistry(packs: DataPack[]): ContentRegistry {
  const eras = new Map<EraId, EraDefinition>()
  const factions = new Map<FactionId, FactionDefinition>()
  const regions = new Map<RegionId, RegionDefinition>()
  const events = new Map<EventId, EventDefinition>()
  const origins = new Map<string, CharacterOriginDefinition>()
  const roots = new Map<string, CharacterRootDefinition>()
  const talents = new Map<string, TalentDefinition>()
  const physiques = new Map<PhysiqueId, CharacterPhysiqueDefinition>()
  const bloodlines = new Map<BloodlineId, BloodlineDefinition>()
  const items = new Map<ItemId, ItemDefinition>()
  const treasures = new Map<ItemId, TreasureDefinition>()
  const techniques = new Map<TechniqueId, TechniqueDefinition>()
  const divineAbilities = new Map<DivineAbilityId, DivineAbilityDefinition>()
  const craftRecipes = new Map<CraftRecipeId, CraftRecipeDefinition>()
  const partners = new Map<PartnerId, PartnerDefinition>()
  const caves = new Map<CaveId, CaveDefinition>()
  const mounts = new Map<MountId, MountDefinition>()
  const pets = new Map<PetId, PetDefinition>()
  const enemies = new Map<EnemyId, EnemyDefinition>()
  const encounters = new Map<EncounterId, EncounterDefinition>()
  const secretRealms = new Map<SecretRealmId, SecretRealmDefinition>()
  const worldBosses = new Map<WorldBossId, WorldBossDefinition>()
  const daoClusters = new Map<DaoClusterId, DaoClusterDefinition>()
  const daoNodes = new Map<DaoNodeId, DaoNodeDefinition>()
  const daoPrinciples = new Map<DaoPrincipleId, DaoPrincipleDefinition>()
  const allItems = new Map<ItemId, CatalogItem>()
  const siteOwners = new Map<SiteId, RegionId>()
  const seen = new Map<string, ContentKind>()

  for (const pack of packs) {
    indexById(pack.eras, 'era', eras, seen)
    indexById(pack.factions, 'faction', factions, seen)
    indexById(pack.regions, 'region', regions, seen)
    indexById(pack.events, 'event', events, seen)
    indexById(pack.origins, 'origin', origins, seen)
    indexById(pack.roots, 'root', roots, seen)
    indexById(pack.talents, 'talent', talents, seen)
    indexById(pack.physiques, 'physique', physiques, seen)
    indexById(pack.bloodlines, 'bloodline', bloodlines, seen)
    indexById(pack.items, 'item', items, seen)
    indexById(pack.treasures, 'treasure', treasures, seen)
    indexById(pack.techniques, 'technique', techniques, seen)
    indexById(pack.divineAbilities, 'divineAbility', divineAbilities, seen)
    indexById(pack.craftRecipes, 'craftRecipe', craftRecipes, seen)
    indexById(pack.partners, 'partner', partners, seen)
    indexById(pack.caves, 'cave', caves, seen)
    indexById(pack.mounts, 'mount', mounts, seen)
    indexById(pack.pets, 'pet', pets, seen)
    indexById(pack.enemies, 'enemy', enemies, seen)
    indexById(pack.encounters, 'encounter', encounters, seen)
    indexById(pack.secretRealms, 'secretRealm', secretRealms, seen)
    indexById(pack.worldBosses, 'worldBoss', worldBosses, seen)
    indexById(pack.daoClusters, 'daoCluster', daoClusters, seen)
    indexById(pack.daoNodes, 'daoNode', daoNodes, seen)
    indexById(pack.daoPrinciples, 'daoPrinciple', daoPrinciples, seen)

    for (const region of pack.regions) {
      for (const site of region.sites) {
        const existingKind = seen.get(site.id)
        if (existingKind) {
          throw new DuplicateContentIdError(site.id, 'site', existingKind)
        }
        seen.set(site.id, 'site')
        siteOwners.set(site.id, region.id)
      }
    }
  }

  for (const entry of items.values()) allItems.set(entry.id, entry)
  for (const entry of treasures.values()) allItems.set(entry.id, entry)

  return {
    packs,
    eras,
    factions,
    regions,
    events,
    origins,
    roots,
    talents,
    physiques,
    bloodlines,
    items,
    treasures,
    techniques,
    divineAbilities,
    craftRecipes,
    partners,
    caves,
    mounts,
    pets,
    enemies,
    encounters,
    secretRealms,
    worldBosses,
    daoClusters,
    daoNodes,
    daoPrinciples,
    allItems,
    siteOwners,
    getItem(id) {
      return allItems.get(id)
    },
    resolveSite(id) {
      const regionId = siteOwners.get(id)
      if (!regionId) return undefined
      const region = regions.get(regionId)
      const site = region?.sites.find((candidate) => candidate.id === id)
      return region && site ? { region, site } : undefined
    },
  }
}

export function getContentStats(registry: ContentRegistry): ContentStats {
  return {
    eras: registry.eras.size,
    factions: registry.factions.size,
    regions: registry.regions.size,
    sites: registry.siteOwners.size,
    events: registry.events.size,
    catalogItems: registry.allItems.size,
    techniques: registry.techniques.size,
    divineAbilities: registry.divineAbilities.size,
    craftRecipes: registry.craftRecipes.size,
    partners: registry.partners.size,
    caves: registry.caves.size,
    mounts: registry.mounts.size,
    pets: registry.pets.size,
    enemies: registry.enemies.size,
    encounters: registry.encounters.size,
    secretRealms: registry.secretRealms.size,
    worldBosses: registry.worldBosses.size,
    daoClusters: registry.daoClusters.size,
    daoNodes: registry.daoNodes.size,
    daoPrinciples: registry.daoPrinciples.size,
    physiques: registry.physiques.size,
    bloodlines: registry.bloodlines.size,
  }
}
