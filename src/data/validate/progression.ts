import type { CraftRecipeDefinition, DivineAbilityDefinition } from '@/types/content'
import { validateCombatSkill } from './catalog'
import {
  RESOURCE_KEYS,
  checkId,
  pushIssue,
  requireArray,
  requireEnum,
  requireNonEmptyString,
  requirePositiveInteger,
  requireRange,
  scanPlaceholders,
  validateCombatStats,
} from './context'
import type { ValidationContext } from './types'

const CRAFT_DISCIPLINES = ['alchemy', 'forging'] as const
const CRAFT_OUTPUT_KINDS = ['item', 'gear'] as const

function validateDivineAbility(
  context: ValidationContext,
  ability: DivineAbilityDefinition,
  path: string,
): void {
  checkId(context, ability.id, `${path}.id`, '神通 ID')
  requireNonEmptyString(context, ability.name, `${path}.name`, '神通名称')
  requireNonEmptyString(context, ability.title, `${path}.title`, '神通题记')
  requireNonEmptyString(context, ability.description, `${path}.description`, '神通说明')
  if (ability.element !== undefined) {
    requireEnum(
      context,
      ability.element,
      ['metal', 'wood', 'water', 'fire', 'earth', 'thunder', 'ice', 'wind'] as const,
      `${path}.element`,
      '神通五行',
    )
  }

  if (requireArray<string>(context, ability.techniqueIds, `${path}.techniqueIds`, '神通功法')) {
    if (ability.techniqueIds.length !== 2) {
      pushIssue(context, 'INVALID_VALUE', `${path}.techniqueIds`, '神通必须由两门功法合成')
    }
    const seen = new Set<string>()
    ability.techniqueIds.forEach((techniqueId, index) => {
      if (seen.has(techniqueId)) {
        pushIssue(context, 'DUPLICATE_ID', `${path}.techniqueIds[${index}]`, '神通不能重复使用同一门功法')
      }
      seen.add(techniqueId)
      if (checkId(context, techniqueId, `${path}.techniqueIds[${index}]`, '合成功法 ID')) {
        if (!context.index.techniques.has(techniqueId)) {
          pushIssue(
            context,
            'MISSING_REFERENCE',
            `${path}.techniqueIds[${index}]`,
            `合成功法引用不存在：${techniqueId}`,
          )
        }
      }
    })
  }

  requirePositiveInteger(context, ability.cultivation, `${path}.cultivation`, '神通修为消耗')
  requirePositiveInteger(context, ability.spiritStones, `${path}.spiritStones`, '神通灵石消耗')

  if (requireArray<{ itemId?: unknown; count?: unknown }>(
    context,
    ability.items,
    `${path}.items`,
    '神通材料',
  )) {
    ability.items.forEach((entry, index) => {
      const itemPath = `${path}.items[${index}]`
      if (checkId(context, entry.itemId, `${itemPath}.itemId`, '神通材料 ID')) {
        if (!context.index.catalog.has(entry.itemId)) {
          pushIssue(context, 'MISSING_REFERENCE', `${itemPath}.itemId`, `神通材料引用不存在：${entry.itemId}`)
        }
      }
      requirePositiveInteger(context, entry.count, `${itemPath}.count`, '神通材料数量')
    })
  }

  validateCombatStats(context, ability.passiveStats, `${path}.passiveStats`, '神通被动属性')
  validateCombatSkill(context, ability.skill, `${path}.skill`)
  scanPlaceholders(context, ability, path)
}

function validateCraftRecipe(
  context: ValidationContext,
  recipe: CraftRecipeDefinition,
  path: string,
): void {
  checkId(context, recipe.id, `${path}.id`, '配方 ID')
  requireEnum(context, recipe.discipline, CRAFT_DISCIPLINES, `${path}.discipline`, '配方职业')
  requireNonEmptyString(context, recipe.name, `${path}.name`, '配方名称')
  requireNonEmptyString(context, recipe.description, `${path}.description`, '配方说明')

  if (checkId(context, recipe.buildingId, `${path}.buildingId`, '配方建筑 ID')) {
    const exists = [...context.index.caves.values()].some((cave) =>
      cave.buildings.some((building) => building.id === recipe.buildingId),
    )
    if (!exists) {
      pushIssue(context, 'MISSING_REFERENCE', `${path}.buildingId`, `配方建筑引用不存在：${recipe.buildingId}`)
    }
  }
  requireRange(context, recipe.requiredBuildingLevel, 1, 3, `${path}.requiredBuildingLevel`, '配方建筑等级')
  requireRange(context, recipe.requiredRank, 0, 4, `${path}.requiredRank`, '配方职业等级')

  if (recipe.cost !== null && typeof recipe.cost === 'object' && !Array.isArray(recipe.cost)) {
    for (const [key, amount] of Object.entries(recipe.cost)) {
      if (!RESOURCE_KEYS.includes(key as (typeof RESOURCE_KEYS)[number])) {
        pushIssue(context, 'INVALID_ENUM', `${path}.cost.${key}`, `未知资源类型：${key}`)
        continue
      }
      requirePositiveInteger(context, amount, `${path}.cost.${key}`, '配方资源消耗')
    }
  } else {
    pushIssue(context, 'MISSING_FIELD', `${path}.cost`, '配方资源消耗必须是对象')
  }

  if (requireArray<{ itemId?: unknown; count?: unknown }>(
    context,
    recipe.items,
    `${path}.items`,
    '配方材料',
  )) {
    recipe.items.forEach((entry, index) => {
      const itemPath = `${path}.items[${index}]`
      if (checkId(context, entry.itemId, `${itemPath}.itemId`, '配方材料 ID')) {
        if (!context.index.catalog.has(entry.itemId)) {
          pushIssue(context, 'MISSING_REFERENCE', `${itemPath}.itemId`, `配方材料引用不存在：${entry.itemId}`)
        }
      }
      requirePositiveInteger(context, entry.count, `${itemPath}.count`, '配方材料数量')
    })
  }

  requirePositiveInteger(context, recipe.cooldownMonths, `${path}.cooldownMonths`, '配方冷却月数')
  requirePositiveInteger(context, recipe.xp, `${path}.xp`, '配方熟练度')

  if (!recipe.output || typeof recipe.output !== 'object') {
    pushIssue(context, 'MISSING_FIELD', `${path}.output`, '配方产出缺失')
  } else if (requireEnum(context, recipe.output.kind, CRAFT_OUTPUT_KINDS, `${path}.output.kind`, '配方产出类型')) {
    if (recipe.output.kind === 'item') {
      if (checkId(context, recipe.output.itemId, `${path}.output.itemId`, '配方产出物品 ID')) {
        if (!context.index.catalog.has(recipe.output.itemId)) {
          pushIssue(context, 'MISSING_REFERENCE', `${path}.output.itemId`, `配方产出引用不存在：${recipe.output.itemId}`)
        }
      }
      if (requirePositiveInteger(context, recipe.output.countMin, `${path}.output.countMin`, '配方产出下限')) {
        if (requirePositiveInteger(context, recipe.output.countMax, `${path}.output.countMax`, '配方产出上限')) {
          if (recipe.output.countMax < recipe.output.countMin) {
            pushIssue(context, 'INVALID_RANGE', `${path}.output.countMax`, '配方产出上限不能低于下限')
          }
        }
      }
    } else {
      requireRange(context, recipe.output.tier, 1, 6, `${path}.output.tier`, '配方器物品阶')
      requireRange(context, recipe.output.qualityBonus, 0, 5, `${path}.output.qualityBonus`, '配方品相加成')
    }
  }

  if (recipe.flavor !== undefined) {
    requireNonEmptyString(context, recipe.flavor, `${path}.flavor`, '配方题记')
  }
  scanPlaceholders(context, recipe, path)
}

export function validateDivineAbilities(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.divineAbilities.forEach((ability, index) => {
      validateDivineAbility(context, ability, `pack:${pack.id}.divineAbilities[${index}]`)
    })
  }
}

export function validateCraftRecipes(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.craftRecipes.forEach((recipe, index) => {
      validateCraftRecipe(context, recipe, `pack:${pack.id}.craftRecipes[${index}]`)
    })
  }
}
