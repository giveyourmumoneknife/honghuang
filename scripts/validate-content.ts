import { DATA_PACKS } from '../src/data'
import { validateContent } from '../src/data/validate'

const result = validateContent(DATA_PACKS)
const { stats } = result

console.log(
  `[content] eras=${stats.eras} factions=${stats.factions} regions=${stats.regions} sites=${stats.sites} events=${stats.events} catalog=${stats.catalogItems} techniques=${stats.techniques} partners=${stats.partners} caves=${stats.caves} mounts=${stats.mounts} pets=${stats.pets} encounters=${stats.encounters} secretRealms=${stats.secretRealms} bosses=${stats.worldBosses} dao=${stats.daoClusters}/${stats.daoNodes}/${stats.daoPrinciples} divine=${stats.divineAbilities} recipes=${stats.craftRecipes}`,
)

if (result.warnings.length > 0) {
  for (const warning of result.warnings) {
    console.warn(`[warn] ${warning.code} ${warning.path}: ${warning.message}`)
  }
}

if (!result.ok) {
  for (const error of result.errors) {
    console.error(`[error] ${error.code} ${error.path}: ${error.message}`)
  }
  console.error(`[content] failed with ${result.errors.length} error(s)`)
  process.exit(1)
}

console.log(`[content] ok (${result.errors.length} errors, ${result.warnings.length} warnings)`)
