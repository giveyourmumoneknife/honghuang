import type { DataPack } from '@/types/content'
import { prologueEra } from './era'
import { prologueEncounters, prologueEnemies, prologueEvents } from './events'
import {
  prologueBossEncounters,
  prologueBossEnemies,
  prologueWorldBosses,
} from './world-boss'

export const prologuePack: DataPack = {
  id: 'prologue',
  version: 1,
  eras: [prologueEra],
  factions: [],
  regions: [],
  events: prologueEvents,
  origins: [],
  roots: [],
  talents: [],
  physiques: [],
  bloodlines: [],
  items: [],
  treasures: [],
  techniques: [],
  divineAbilities: [],
  craftRecipes: [],
  partners: [],
  caves: [],
  mounts: [],
  pets: [],
  enemies: [...prologueEnemies, ...prologueBossEnemies],
  encounters: [...prologueEncounters, ...prologueBossEncounters],
  secretRealms: [],
  worldBosses: prologueWorldBosses,
  daoClusters: [],
  daoNodes: [],
  daoPrinciples: [],
}
