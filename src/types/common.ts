export type ContentId = string
export type PlayerId = string
export type EraId = ContentId
export type FactionId = ContentId
export type RegionId = ContentId
export type SiteId = ContentId
export type EventId = ContentId
export type ItemId = ContentId
export type TechniqueId = ContentId
export type PartnerId = ContentId
export type CaveId = ContentId
export type MountId = ContentId
export type PetId = ContentId
export type EnemyId = ContentId
export type EncounterId = ContentId
export type SecretRealmId = ContentId
export type WorldBossId = ContentId
export type DaoClusterId = ContentId
export type DaoNodeId = ContentId
export type DaoPrincipleId = ContentId
export type DivineAbilityId = ContentId
export type CraftRecipeId = ContentId
export type PhysiqueId = ContentId
export type BloodlineId = ContentId

export type FlagValue = boolean | number | string

export type ResourceKey =
  | 'spirit_stones'
  | 'spirit_herbs'
  | 'ore'
  | 'beast_cores'
  | 'contribution'
  | 'merit'
  | 'karma'

export type Element =
  | 'metal'
  | 'wood'
  | 'water'
  | 'fire'
  | 'earth'
  | 'thunder'
  | 'ice'
  | 'wind'

export type RealmId = 'mortal' | 'qi_refining' | 'foundation' | 'golden_core'
export type RealmStage = 1 | 2 | 3

export type CombatStance = 'steady' | 'aggressive' | 'guarded'
export type CombatTrait =
  | 'armored'
  | 'swift'
  | 'venom'
  | 'regenerating'
  | 'berserk'
  | 'spirit_eater'
export type CombatSkillEffect =
  | 'burn'
  | 'poison'
  | 'stun'
  | 'heal'
  | 'shield'
  | 'drain'
  | 'execute'

export type PauseMode = 'story' | 'ambient'
export type PausePolicy = 'all' | 'story' | 'none'
export type GameSpeed = 1 | 4 | 16
export type EventKind =
  | 'main'
  | 'faction'
  | 'partner'
  | 'cave'
  | 'world'
  | 'hidden'
  | 'ambient'

export type FactionArchetype =
  | 'race'
  | 'teaching'
  | 'court'
  | 'dynasty'
  | 'local'
  | 'rogue'

export type FactionStatus = 'dominant' | 'active' | 'declining' | 'hidden' | 'absent'
export type FactionStanding = 'ally' | 'neutral' | 'rival' | 'enemy'

export type RegionKind =
  | 'land'
  | 'sea'
  | 'volcano'
  | 'cliff'
  | 'abyss'
  | 'wilds'
  | 'mountain'
  | 'palace'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'
export type ItemCategory = 'material' | 'consumable' | 'equipment' | 'treasure' | 'quest'

export type PartnerRole = 'companion' | 'guardian' | 'scout' | 'teacher'
export type MountTerrain = 'land' | 'sea' | 'cloud'
export type PetRole = 'gather' | 'guard' | 'cave' | 'travel'
export type DiscipleAssignment = 'study' | 'gather' | 'guard' | 'craft' | 'tend'
export type CraftDiscipline = 'alchemy' | 'forging'

export type ResourceCost = Partial<Record<ResourceKey, number>>
