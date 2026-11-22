import type {
  ConsumableItemDefinition,
  ItemDefinition,
  MaterialItemDefinition,
  MountDefinition,
  PetDefinition,
  TechniqueDefinition,
  TreasureDefinition,
} from '@/types/content'
import {
  checkId,
  pushIssue,
  requireArray,
  requireEnum,
  requireNonEmptyString,
  requireNumber,
  requireRange,
  scanPlaceholders,
  validateCombatStats,
  validateEffects,
  validateRequirements,
} from './context'
import type { ValidationContext } from './types'

const ITEM_CATEGORIES = ['material', 'consumable', 'equipment', 'treasure', 'quest'] as const
const RARITIES = ['common', 'uncommon', 'rare', 'legendary'] as const
const MOUNT_TERRAINS = ['land', 'sea', 'cloud'] as const
const PET_ROLES = ['gather', 'guard', 'cave', 'travel'] as const
const SKILL_EFFECTS = ['burn', 'poison', 'stun', 'heal', 'shield', 'drain', 'execute'] as const

export function validateCombatSkill(
  context: ValidationContext,
  skill: {
    id: string
    name: string
    description: string
    cooldown: number
    multiplier: number
    effect?: string
    power?: number
  },
  path: string,
): void {
  checkId(context, skill.id, `${path}.id`, '战斗技能 ID')
  requireNonEmptyString(context, skill.name, `${path}.name`, '战斗技能名称')
  requireNonEmptyString(context, skill.description, `${path}.description`, '战斗技能说明')
  requireRange(context, skill.cooldown, 1, 12, `${path}.cooldown`, '战斗技能冷却')
  requireRange(context, skill.multiplier, 0.1, 10, `${path}.multiplier`, '战斗技能倍率')
  if (skill.effect !== undefined) {
    requireEnum(context, skill.effect, SKILL_EFFECTS, `${path}.effect`, '战斗技能效果')
  }
  if (skill.power !== undefined) {
    requireRange(context, skill.power, 0, 100, `${path}.power`, '战斗技能强度')
  }
}

function validateMaterial(context: ValidationContext, item: MaterialItemDefinition, path: string): void {
  requireNonEmptyString(context, item.source, `${path}.source`, '材料来源')
  if (requireArray<string>(context, item.usedBy, `${path}.usedBy`, '材料用途')) {
    if (item.usedBy.length === 0) {
      pushIssue(context, 'MISSING_FIELD', `${path}.usedBy`, '材料至少需要一个用途')
    }
    item.usedBy.forEach((use, i) => requireNonEmptyString(context, use, `${path}.usedBy[${i}]`, '材料用途'))
  }
}

function validateConsumable(context: ValidationContext, item: ConsumableItemDefinition, path: string): void {
  requireNonEmptyString(context, item.drawback, `${path}.drawback`, '消耗品代价')
  validateEffects(context, item.effects, `${path}.effects`)
  if (item.cooldownMonths !== undefined) {
    requireNumber(context, item.cooldownMonths, `${path}.cooldownMonths`, '消耗品冷却月数')
  }
}

export function validateItems(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.items.forEach((item: ItemDefinition, index) => {
      const path = `pack:${pack.id}.items[${index}]`
      checkId(context, item.id, `${path}.id`, '物品 ID')
      requireNonEmptyString(context, item.name, `${path}.name`, '物品名称')
      requireEnum(context, item.category, ITEM_CATEGORIES, `${path}.category`, '物品类别')
      requireEnum(context, item.rarity, RARITIES, `${path}.rarity`, '物品稀有度')
      requireNonEmptyString(context, item.description, `${path}.description`, '物品说明')

      if (item.category === 'material') validateMaterial(context, item, path)
      if (item.category === 'consumable') validateConsumable(context, item, path)

      scanPlaceholders(context, item, path)
    })
  }
}

export function validateTreasures(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.treasures.forEach((treasure: TreasureDefinition, index) => {
      const path = `pack:${pack.id}.treasures[${index}]`
      checkId(context, treasure.id, `${path}.id`, '法宝 ID')
      requireNonEmptyString(context, treasure.name, `${path}.name`, '法宝名称')
      requireEnum(context, treasure.category, ['treasure'] as const, `${path}.category`, '法宝类别')
      requireRange(context, treasure.grade, 1, 3, `${path}.grade`, '法宝品阶')
      requireEnum(context, treasure.rarity, RARITIES, `${path}.rarity`, '法宝稀有度')
      requireNonEmptyString(context, treasure.description, `${path}.description`, '法宝说明')

      if (treasure.active) {
        const activePath = `${path}.active`
        checkId(context, treasure.active.id, `${activePath}.id`, '法宝技能 ID')
        requireNonEmptyString(context, treasure.active.name, `${activePath}.name`, '法宝技能名称')
        requireNonEmptyString(context, treasure.active.description, `${activePath}.description`, '法宝技能说明')
        validateEffects(context, treasure.active.effects, `${activePath}.effects`)
      } else {
        pushIssue(context, 'MISSING_FIELD', `${path}.active`, '法宝缺少主动技能')
      }

      if (treasure.cost) {
        requireNonEmptyString(context, treasure.cost.description, `${path}.cost.description`, '法宝代价说明')
        validateEffects(context, treasure.cost.effects, `${path}.cost.effects`)
      } else {
        pushIssue(context, 'MISSING_FIELD', `${path}.cost`, '法宝缺少使用代价')
      }

      if (treasure.spirit) {
        requireNonEmptyString(context, treasure.spirit.name, `${path}.spirit.name`, '器灵名称')
        requireNonEmptyString(context, treasure.spirit.description, `${path}.spirit.description`, '器灵说明')
        if (requireArray(context, treasure.spirit.traits, `${path}.spirit.traits`, '器灵特性')) {
          if (treasure.spirit.traits.length === 0) {
            pushIssue(context, 'MISSING_FIELD', `${path}.spirit.traits`, '器灵至少需要一个特性')
          }
          treasure.spirit.traits.forEach((trait, i) => {
            requireNonEmptyString(context, trait, `${path}.spirit.traits[${i}]`, '器灵特性')
          })
        }
      } else {
        pushIssue(context, 'MISSING_FIELD', `${path}.spirit`, '法宝缺少器灵')
      }

      validateCombatStats(context, treasure.passiveStats, `${path}.passiveStats`, '法宝被动属性')

      scanPlaceholders(context, treasure, path)
    })
  }
}

export function validateTechniques(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.techniques.forEach((technique: TechniqueDefinition, index) => {
      const path = `pack:${pack.id}.techniques[${index}]`
      checkId(context, technique.id, `${path}.id`, '功法 ID')
      requireNonEmptyString(context, technique.name, `${path}.name`, '功法名称')
      requireNonEmptyString(context, technique.description, `${path}.description`, '功法说明')
      requireNonEmptyString(context, technique.schoolId, `${path}.schoolId`, '功法道统')
      requireRange(context, technique.tier, 1, 6, `${path}.tier`, '功法层级')

      if (requireArray(context, technique.nodes, `${path}.nodes`, '功法节点')) {
        if (technique.nodes.length === 0) {
          pushIssue(context, 'MISSING_FIELD', `${path}.nodes`, '功法至少需要一个节点')
        }
        technique.nodes.forEach((node, i) => {
          const nodePath = `${path}.nodes[${i}]`
          checkId(context, node.id, `${nodePath}.id`, '功法节点 ID')
          requireNonEmptyString(context, node.name, `${nodePath}.name`, '功法节点名称')
          requireNonEmptyString(context, node.description, `${nodePath}.description`, '功法节点说明')
          validateRequirements(context, node.requirements, `${nodePath}.requirements`)
          validateEffects(context, node.effects, `${nodePath}.effects`)
          validateCombatStats(context, node.stats, `${nodePath}.stats`, '功法节点属性')
          if (node.cost) {
            const costPath = `${nodePath}.cost`
            requireNumber(context, node.cost.cultivation, `${costPath}.cultivation`, '功法节点修为消耗')
            if (node.cost.cultivation < 0) {
              pushIssue(context, 'INVALID_RANGE', `${costPath}.cultivation`, '修为消耗不能为负数')
            }
            if (node.cost.spiritStones !== undefined) {
              requireNumber(context, node.cost.spiritStones, `${costPath}.spiritStones`, '功法节点灵石消耗')
              if (node.cost.spiritStones < 0) {
                pushIssue(context, 'INVALID_RANGE', `${costPath}.spiritStones`, '灵石消耗不能为负数')
              }
            }
          }
        })
      }

      if (requireArray(context, technique.passive, `${path}.passive`, '功法被动')) {
        technique.passive.forEach((passive, i) => {
          requireNonEmptyString(context, passive, `${path}.passive[${i}]`, '功法被动')
        })
      }

      if (technique.skill) {
        validateCombatSkill(context, technique.skill, `${path}.skill`)
      }

      scanPlaceholders(context, technique, path)
    })
  }
}

export function validateMounts(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.mounts.forEach((mount: MountDefinition, index) => {
      const path = `pack:${pack.id}.mounts[${index}]`
      checkId(context, mount.id, `${path}.id`, '坐骑 ID')
      requireNonEmptyString(context, mount.name, `${path}.name`, '坐骑名称')
      requireNonEmptyString(context, mount.description, `${path}.description`, '坐骑说明')
      requireEnum(context, mount.terrain, MOUNT_TERRAINS, `${path}.terrain`, '坐骑地形')

      if (requireArray(context, mount.stages, `${path}.stages`, '坐骑成长阶段')) {
        if (mount.stages.length === 0) {
          pushIssue(context, 'MISSING_FIELD', `${path}.stages`, '坐骑至少需要一个成长阶段')
        }
        mount.stages.forEach((stage, i) => {
          const stagePath = `${path}.stages[${i}]`
          requireRange(context, stage.stage, 1, 3, `${stagePath}.stage`, '坐骑阶段')
          requireNonEmptyString(context, stage.name, `${stagePath}.name`, '坐骑阶段名称')
          requireNonEmptyString(context, stage.description, `${stagePath}.description`, '坐骑阶段说明')
          validateEffects(context, stage.effects, `${stagePath}.effects`)
          validateCombatStats(context, stage.stats, `${stagePath}.stats`, '坐骑阶段属性')
          if (stage.travelBonus !== undefined) {
            requireRange(context, stage.travelBonus, 0, 2, `${stagePath}.travelBonus`, '坐骑行旅加成')
          }
        })
      }

      scanPlaceholders(context, mount, path)
    })
  }
}

export function validatePets(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.pets.forEach((pet: PetDefinition, index) => {
      const path = `pack:${pack.id}.pets[${index}]`
      checkId(context, pet.id, `${path}.id`, '灵宠 ID')
      requireNonEmptyString(context, pet.name, `${path}.name`, '灵宠名称')
      requireNonEmptyString(context, pet.description, `${path}.description`, '灵宠说明')
      requireEnum(context, pet.role, PET_ROLES, `${path}.role`, '灵宠岗位')
      requireNonEmptyString(context, pet.temperament, `${path}.temperament`, '灵宠性情')

      if (requireArray(context, pet.evolutions, `${path}.evolutions`, '灵宠进化')) {
        if (pet.evolutions.length === 0) {
          pushIssue(context, 'MISSING_FIELD', `${path}.evolutions`, '灵宠至少需要一条进化路线')
        }
        pet.evolutions.forEach((evolution, i) => {
          const evolutionPath = `${path}.evolutions[${i}]`
          checkId(context, evolution.id, `${evolutionPath}.id`, '灵宠进化 ID')
          requireNonEmptyString(context, evolution.name, `${evolutionPath}.name`, '灵宠进化名称')
          requireNonEmptyString(context, evolution.description, `${evolutionPath}.description`, '灵宠进化说明')
          requireEnum(context, evolution.role, PET_ROLES, `${evolutionPath}.role`, '灵宠进化岗位')
          validateEffects(context, evolution.effects, `${evolutionPath}.effects`)
          validateCombatStats(context, evolution.stats, `${evolutionPath}.stats`, '灵宠进化属性')
        })
      }

      scanPlaceholders(context, pet, path)
    })
  }
}
