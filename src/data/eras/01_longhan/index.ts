import type { DataPack } from '@/types/content'
import {
  commonBloodlines,
  commonItems,
  commonOrigins,
  commonPhysiques,
  commonRelics,
  commonRoots,
  commonTalents,
  commonTechniques,
  commonTreasures,
  commonWorldBossItems,
} from '@/data/common'
import { longhanBodyEvents } from './body-events'
import { longhanCaveEvents } from './cave-events'
import { longhanCaves } from './caves'
import { longhanCraftRecipes } from './craft'
import { longhanDaoClusters, longhanDaoNodes, longhanDaoPrinciples } from './dao'
import { longhanDivineAbilities } from './divine'
import { longhanEncounters, longhanEnemies } from './combat'
import { longhanEra } from './era'
import { longhanEvents } from './events'
import { longhanFactionEvents } from './faction-events'
import { longhanFactions } from './factions'
import { longhanHiddenEvents } from './hidden-events'
import { longhanMainlineEvents } from './mainline-events'
import { longhanMounts } from './mounts'
import { longhanMythEvents } from './myth-events'
import { longhanPartnerEvents } from './partner-events'
import { longhanPartners } from './partners'
import { longhanPets } from './pets'
import { longhanRegions } from './regions'
import { longhanSecretRealms } from './secret-realms'
import {
  longhanSupplementEncounters,
  longhanSupplementEnemies,
} from './supplement-combat'
import { longhanSupplementEvents } from './supplement-events'
import { longhanSupplementSecretRealms } from './supplement-secret-realms'
import { longhanWorldEvents } from './world-events'
import {
  longhanBossEncounters,
  longhanBossEnemies,
  longhanWorldBosses,
} from './world-boss'

export const longhanPack: DataPack = {
  id: 'longhan',
  version: 1,
  eras: [longhanEra],
  factions: longhanFactions,
  regions: longhanRegions,
  events: [
    ...longhanEvents,
    ...longhanFactionEvents,
    ...longhanPartnerEvents,
    ...longhanWorldEvents,
    ...longhanHiddenEvents,
    ...longhanMainlineEvents,
    ...longhanCaveEvents,
    ...longhanMythEvents,
    ...longhanSupplementEvents,
    ...longhanBodyEvents,
  ],
  origins: commonOrigins,
  roots: commonRoots,
  talents: commonTalents,
  physiques: commonPhysiques,
  bloodlines: commonBloodlines,
  items: [...commonItems, ...commonRelics, ...commonWorldBossItems],
  treasures: commonTreasures,
  techniques: commonTechniques,
  divineAbilities: longhanDivineAbilities,
  craftRecipes: longhanCraftRecipes,
  partners: longhanPartners,
  caves: longhanCaves,
  mounts: longhanMounts,
  pets: longhanPets,
  enemies: [
    ...longhanEnemies,
    ...longhanBossEnemies,
    ...longhanSupplementEnemies,
  ],
  encounters: [
    ...longhanEncounters,
    ...longhanBossEncounters,
    ...longhanSupplementEncounters,
  ],
  secretRealms: [...longhanSecretRealms, ...longhanSupplementSecretRealms],
  worldBosses: longhanWorldBosses,
  daoClusters: longhanDaoClusters,
  daoNodes: longhanDaoNodes,
  daoPrinciples: longhanDaoPrinciples,
}
