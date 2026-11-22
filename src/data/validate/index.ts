import type { DataPack } from '@/types/content'
import { createValidationContext } from './context'
import { validateEvents } from './events'
import { validateEras, validateFactions, validateRegions } from './world'
import {
  validateItems,
  validateMounts,
  validatePets,
  validateTechniques,
  validateTreasures,
} from './catalog'
import { validateCraftRecipes, validateDivineAbilities } from './progression'
import { validateCaves, validatePartners } from './party'
import { validateDao } from './dao'
import { validateSecretRealms } from './secretrealm'
import { validateWorldBosses } from './worldboss'
import {
  validateCharacterBases,
  validateEncounters,
  validateEnemies,
} from './roster'
import type { ValidationResult, ValidationStats } from './types'

function countStats(packs: DataPack[]): ValidationStats {
  return packs.reduce<ValidationStats>(
    (stats, pack) => ({
      eras: stats.eras + pack.eras.length,
      factions: stats.factions + pack.factions.length,
      regions: stats.regions + pack.regions.length,
      sites: stats.sites + pack.regions.reduce((sum, region) => sum + region.sites.length, 0),
      events: stats.events + pack.events.length,
      catalogItems: stats.catalogItems + pack.items.length + pack.treasures.length,
      techniques: stats.techniques + pack.techniques.length,
      divineAbilities: stats.divineAbilities + pack.divineAbilities.length,
      craftRecipes: stats.craftRecipes + pack.craftRecipes.length,
      partners: stats.partners + pack.partners.length,
      caves: stats.caves + pack.caves.length,
      mounts: stats.mounts + pack.mounts.length,
      pets: stats.pets + pack.pets.length,
      origins: stats.origins + pack.origins.length,
      roots: stats.roots + pack.roots.length,
      talents: stats.talents + pack.talents.length,
      physiques: stats.physiques + pack.physiques.length,
      bloodlines: stats.bloodlines + pack.bloodlines.length,
      enemies: stats.enemies + pack.enemies.length,
      encounters: stats.encounters + pack.encounters.length,
      secretRealms: stats.secretRealms + pack.secretRealms.length,
      worldBosses: stats.worldBosses + pack.worldBosses.length,
      daoClusters: stats.daoClusters + pack.daoClusters.length,
      daoNodes: stats.daoNodes + pack.daoNodes.length,
      daoPrinciples: stats.daoPrinciples + pack.daoPrinciples.length,
    }),
    {
      eras: 0,
      factions: 0,
      regions: 0,
      sites: 0,
      events: 0,
      catalogItems: 0,
      techniques: 0,
      divineAbilities: 0,
      craftRecipes: 0,
      partners: 0,
      caves: 0,
      mounts: 0,
      pets: 0,
      origins: 0,
      roots: 0,
      talents: 0,
      physiques: 0,
      bloodlines: 0,
      enemies: 0,
      encounters: 0,
      secretRealms: 0,
      worldBosses: 0,
      daoClusters: 0,
      daoNodes: 0,
      daoPrinciples: 0,
    },
  )
}

export function validateContent(packs: DataPack[]): ValidationResult {
  const context = createValidationContext(packs)

  validateEras(context)
  validateFactions(context)
  validateRegions(context)
  validateEvents(context)
  validateItems(context)
  validateTreasures(context)
  validateTechniques(context)
  validateDivineAbilities(context)
  validateCraftRecipes(context)
  validateMounts(context)
  validatePets(context)
  validateCharacterBases(context)
  validateEnemies(context)
  validateEncounters(context)
  validateSecretRealms(context)
  validateWorldBosses(context)
  validatePartners(context)
  validateCaves(context)
  validateDao(context)

  const errors = context.issues.filter((issue) => issue.severity === 'error')
  const warnings = context.issues.filter((issue) => issue.severity === 'warning')

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: countStats(packs),
  }
}

export type { ValidationIssue, ValidationResult, ValidationStats } from './types'
