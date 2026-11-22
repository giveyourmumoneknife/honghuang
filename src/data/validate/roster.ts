import type {
  BloodlineDefinition,
  CharacterOriginDefinition,
  CharacterPhysiqueDefinition,
  CharacterRootDefinition,
  EncounterDefinition,
  EnemyDefinition,
  TalentDefinition,
} from '@/types/content'
import {
  checkId,
  pushIssue,
  requireArray,
  requireBoolean,
  requireEnum,
  requireNonEmptyString,
  requireNumber,
  requireRange,
  scanPlaceholders,
  validateCombatStats,
  validateEffects,
  validateRequirements,
} from './context'
import { validateCombatSkill } from './catalog'
import type { ValidationContext } from './types'

const ELEMENTS = ['metal', 'wood', 'water', 'fire', 'earth', 'thunder', 'ice', 'wind'] as const
const COMBAT_TRAITS = [
  'armored',
  'swift',
  'venom',
  'regenerating',
  'berserk',
  'spirit_eater',
] as const

function validateReward(
  context: ValidationContext,
  reward: EnemyDefinition['reward'] | EncounterDefinition['reward'],
  path: string,
): void {
  if (!reward) return
  if (reward.cultivation !== undefined) {
    requireNumber(context, reward.cultivation, `${path}.cultivation`, '战斗修为奖励')
    if (reward.cultivation < 0) {
      pushIssue(context, 'INVALID_RANGE', `${path}.cultivation`, '修为奖励不能为负数')
    }
  }
  if (reward.resources) {
    for (const [key, amount] of Object.entries(reward.resources)) {
      requireNumber(context, amount, `${path}.resources.${key}`, '战斗资源奖励')
      if ((amount as number) < 0) {
        pushIssue(context, 'INVALID_RANGE', `${path}.resources.${key}`, '资源奖励不能为负数')
      }
    }
  }
  if (reward.items) {
    reward.items.forEach((entry, i) => {
      if (!context.index.catalog.has(entry.itemId)) {
        pushIssue(
          context,
          'MISSING_REFERENCE',
          `${path}.items[${i}].itemId`,
          `奖励物品引用不存在：${entry.itemId}`,
        )
      }
      if (entry.count !== undefined) {
        requireNumber(context, entry.count, `${path}.items[${i}].count`, '奖励物品数量')
      }
    })
  }
}

export function validateCharacterBases(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.origins.forEach((origin: CharacterOriginDefinition, index) => {
      const path = `pack:${pack.id}.origins[${index}]`
      checkId(context, origin.id, `${path}.id`, '出身 ID')
      requireNonEmptyString(context, origin.name, `${path}.name`, '出身名称')
      requireNonEmptyString(context, origin.description, `${path}.description`, '出身说明')
      requireNonEmptyString(context, origin.note, `${path}.note`, '出身提示')
      validateCombatStats(context, origin.stats, `${path}.stats`, '出身属性')
      scanPlaceholders(context, origin, path)
    })

    pack.roots.forEach((root: CharacterRootDefinition, index) => {
      const path = `pack:${pack.id}.roots[${index}]`
      checkId(context, root.id, `${path}.id`, '灵根 ID')
      requireNonEmptyString(context, root.name, `${path}.name`, '灵根名称')
      requireNonEmptyString(context, root.description, `${path}.description`, '灵根说明')
      requireNonEmptyString(context, root.note, `${path}.note`, '灵根提示')
      if (root.element !== undefined) {
        requireEnum(context, root.element, ELEMENTS, `${path}.element`, '灵根属性')
      }
      validateCombatStats(context, root.stats, `${path}.stats`, '灵根属性')
      requireNumber(context, root.cultivationMultiplier, `${path}.cultivationMultiplier`, '灵根修行倍率')
      if (root.cultivationMultiplier <= 0 || root.cultivationMultiplier > 3) {
        pushIssue(context, 'INVALID_RANGE', `${path}.cultivationMultiplier`, '修行倍率必须在 0–3 之间')
      }
      scanPlaceholders(context, root, path)
    })

    pack.talents.forEach((talent: TalentDefinition, index) => {
      const path = `pack:${pack.id}.talents[${index}]`
      checkId(context, talent.id, `${path}.id`, '天赋 ID')
      requireNonEmptyString(context, talent.name, `${path}.name`, '天赋名称')
      requireNonEmptyString(context, talent.description, `${path}.description`, '天赋说明')
      requireNonEmptyString(context, talent.note, `${path}.note`, '天赋提示')
      validateCombatStats(context, talent.stats, `${path}.stats`, '天赋属性')
      if (talent.cultivationBonus !== undefined) {
        requireNumber(context, talent.cultivationBonus, `${path}.cultivationBonus`, '天赋修行加成')
      }
      scanPlaceholders(context, talent, path)
    })

    pack.physiques.forEach((physique: CharacterPhysiqueDefinition, index) => {
      const path = `pack:${pack.id}.physiques[${index}]`
      checkId(context, physique.id, `${path}.id`, '体质 ID')
      requireNonEmptyString(context, physique.name, `${path}.name`, '体质名称')
      requireNonEmptyString(context, physique.description, `${path}.description`, '体质说明')
      requireNonEmptyString(context, physique.note, `${path}.note`, '体质提示')
      validateCombatStats(context, physique.stats, `${path}.stats`, '体质属性')
      requireRange(
        context,
        physique.cultivationMultiplier,
        0.5,
        1.5,
        `${path}.cultivationMultiplier`,
        '体质修行倍率',
      )
      requireRange(
        context,
        physique.bodyTemperMultiplier,
        0.5,
        1.5,
        `${path}.bodyTemperMultiplier`,
        '体质淬体倍率',
      )
      requireRange(
        context,
        physique.bodyBreakthroughBonus,
        -0.15,
        0.2,
        `${path}.bodyBreakthroughBonus`,
        '体质破体加成',
      )
      for (const [bloodlineId, affinity] of Object.entries(physique.bloodlineAffinity)) {
        if (!context.index.bloodlines.has(bloodlineId)) {
          pushIssue(
            context,
            'MISSING_REFERENCE',
            `${path}.bloodlineAffinity.${bloodlineId}`,
            `血脉引用不存在：${bloodlineId}`,
          )
        }
        requireRange(
          context,
          affinity,
          -0.2,
          0.3,
          `${path}.bloodlineAffinity.${bloodlineId}`,
          '血脉亲和',
        )
      }
      if (requireArray(context, physique.awakenings, `${path}.awakenings`, '体质觉醒')) {
        let lastStage = 0
        physique.awakenings.forEach((awakening, i) => {
          const awakeningPath = `${path}.awakenings[${i}]`
          requireNonEmptyString(context, awakening.name, `${awakeningPath}.name`, '觉醒名称')
          requireNonEmptyString(
            context,
            awakening.description,
            `${awakeningPath}.description`,
            '觉醒说明',
          )
          if (requireRange(context, awakening.stage, 1, 5, `${awakeningPath}.stage`, '觉醒体魄阶段')) {
            if (!Number.isInteger(awakening.stage) || awakening.stage <= lastStage) {
              pushIssue(
                context,
                'INVALID_VALUE',
                `${awakeningPath}.stage`,
                '觉醒阶段必须是递增的整数',
              )
            }
            lastStage = awakening.stage
          }
          validateCombatStats(context, awakening.stats, `${awakeningPath}.stats`, '觉醒属性')
        })
      }
      scanPlaceholders(context, physique, path)
    })

    pack.bloodlines.forEach((bloodline: BloodlineDefinition, index) => {
      const path = `pack:${pack.id}.bloodlines[${index}]`
      checkId(context, bloodline.id, `${path}.id`, '血脉 ID')
      requireNonEmptyString(context, bloodline.name, `${path}.name`, '血脉名称')
      requireNonEmptyString(context, bloodline.description, `${path}.description`, '血脉说明')
      requireNonEmptyString(context, bloodline.note, `${path}.note`, '血脉提示')
      if (bloodline.element !== undefined) {
        requireEnum(context, bloodline.element, ELEMENTS, `${path}.element`, '血脉属性')
      }
      bloodline.affinityPhysiqueIds.forEach((physiqueId, i) => {
        if (!context.index.physiques.has(physiqueId)) {
          pushIssue(
            context,
            'MISSING_REFERENCE',
            `${path}.affinityPhysiqueIds[${i}]`,
            `体质引用不存在：${physiqueId}`,
          )
        }
      })
      const acquisitionPath = `${path}.acquisition`
      requireRange(
        context,
        bloodline.acquisition.bodyStage,
        0,
        5,
        `${acquisitionPath}.bodyStage`,
        '承载体魄阶段',
      )
      requireNumber(
        context,
        bloodline.acquisition.cultivation,
        `${acquisitionPath}.cultivation`,
        '承载修为',
      )
      requireNonEmptyString(context, bloodline.acquisition.hint, `${acquisitionPath}.hint`, '承载提示')
      for (const [itemId, count] of Object.entries(bloodline.acquisition.items)) {
        if (!context.index.catalog.has(itemId)) {
          pushIssue(
            context,
            'MISSING_REFERENCE',
            `${acquisitionPath}.items.${itemId}`,
            `物品引用不存在：${itemId}`,
          )
        }
        requireRange(
          context,
          count,
          1,
          99,
          `${acquisitionPath}.items.${itemId}`,
          '承载物品数量',
        )
      }
      const refinePath = `${path}.refinement`
      requireRange(
        context,
        bloodline.refinement.purityGain,
        1,
        20,
        `${refinePath}.purityGain`,
        '炼血纯度',
      )
      requireNumber(
        context,
        bloodline.refinement.baseCultivation,
        `${refinePath}.baseCultivation`,
        '炼血修为',
      )
      requireNumber(
        context,
        bloodline.refinement.cultivationPerStage,
        `${refinePath}.cultivationPerStage`,
        '炼血阶段修为',
      )
      requireNumber(context, bloodline.sever.cultivation, `${path}.sever.cultivation`, '断血修为')
      if (requireArray(context, bloodline.stages, `${path}.stages`, '血脉阶段')) {
        if (bloodline.stages.length !== 6) {
          pushIssue(context, 'INVALID_RANGE', `${path}.stages`, '血脉必须定义 0–5 共六个阶段')
        }
        bloodline.stages.forEach((stage, i) => {
          const stagePath = `${path}.stages[${i}]`
          if (stage.stage !== i) {
            pushIssue(
              context,
              'INVALID_VALUE',
              `${stagePath}.stage`,
              `血脉阶段必须按顺序定义，期望 ${i}`,
            )
          }
          requireNonEmptyString(context, stage.name, `${stagePath}.name`, '血脉阶段名称')
          requireNonEmptyString(context, stage.description, `${stagePath}.description`, '血脉阶段说明')
          requireRange(context, stage.purity, 0, 100, `${stagePath}.purity`, '血脉纯度门槛')
          requireRange(context, stage.bodyStage, 0, 5, `${stagePath}.bodyStage`, '血脉体魄门槛')
          validateCombatStats(context, stage.stats, `${stagePath}.stats`, '血脉属性')
        })
      }
      requireRange(
        context,
        bloodline.skillUnlockStage,
        1,
        5,
        `${path}.skillUnlockStage`,
        '血脉神通解锁阶段',
      )
      validateCombatSkill(context, bloodline.skill, `${path}.skill`)
      scanPlaceholders(context, bloodline, path)
    })
  }
}

export function validateEnemies(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.enemies.forEach((enemy: EnemyDefinition, index) => {
      const path = `pack:${pack.id}.enemies[${index}]`
      checkId(context, enemy.id, `${path}.id`, '敌手 ID')
      requireNonEmptyString(context, enemy.name, `${path}.name`, '敌手名称')
      requireNonEmptyString(context, enemy.title, `${path}.title`, '敌手称号')
      requireNonEmptyString(context, enemy.description, `${path}.description`, '敌手说明')
      if (enemy.element !== undefined) {
        requireEnum(context, enemy.element, ELEMENTS, `${path}.element`, '敌手属性')
      }
      validateCombatStats(context, enemy.stats, `${path}.stats`, '敌手属性')
      if (enemy.stats.health === undefined || enemy.stats.health <= 0) {
        pushIssue(context, 'MISSING_FIELD', `${path}.stats.health`, '敌手必须有正的气血')
      }
      if (requireArray(context, enemy.traits, `${path}.traits`, '敌手特性')) {
        enemy.traits.forEach((trait, i) => {
          requireEnum(context, trait, COMBAT_TRAITS, `${path}.traits[${i}]`, '敌手特性')
        })
      }
      if (requireArray(context, enemy.skills, `${path}.skills`, '敌手技能')) {
        if (enemy.skills.length === 0) {
          pushIssue(context, 'MISSING_FIELD', `${path}.skills`, '敌手至少需要一个技能')
        }
        enemy.skills.forEach((skill, i) => validateCombatSkill(context, skill, `${path}.skills[${i}]`))
      }
      validateReward(context, enemy.reward, `${path}.reward`)
      scanPlaceholders(context, enemy, path)
    })
  }
}

export function validateEncounters(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.encounters.forEach((encounter: EncounterDefinition, index) => {
      const path = `pack:${pack.id}.encounters[${index}]`
      checkId(context, encounter.id, `${path}.id`, '战斗遭遇 ID')
      requireNonEmptyString(context, encounter.name, `${path}.name`, '战斗遭遇名称')
      requireNonEmptyString(context, encounter.summary, `${path}.summary`, '战斗遭遇摘要')
      requireNonEmptyString(context, encounter.description, `${path}.description`, '战斗遭遇说明')
      requireBoolean(context, encounter.fleeAllowed, `${path}.fleeAllowed`, '是否允许逃离')
      if (encounter.tier !== undefined) {
        requireNumber(context, encounter.tier, `${path}.tier`, '遭遇敌势阶')
        if (
          !Number.isInteger(encounter.tier) ||
          encounter.tier < 1 ||
          encounter.tier > 6
        ) {
          pushIssue(context, 'INVALID_RANGE', `${path}.tier`, '遭遇敌势阶必须是 1–6 的整数')
        }
      }

      if (requireArray(context, encounter.enemyIds, `${path}.enemyIds`, '遭遇敌手')) {
        if (encounter.enemyIds.length === 0) {
          pushIssue(context, 'MISSING_FIELD', `${path}.enemyIds`, '战斗遭遇至少需要一个敌手')
        }
        encounter.enemyIds.forEach((enemyId, i) => {
          if (!context.index.enemies.has(enemyId)) {
            pushIssue(
              context,
              'MISSING_REFERENCE',
              `${path}.enemyIds[${i}]`,
              `敌手引用不存在：${enemyId}`,
            )
          }
        })
      }

      if (encounter.regionId && !context.index.regions.has(encounter.regionId)) {
        pushIssue(
          context,
          'MISSING_REFERENCE',
          `${path}.regionId`,
          `战斗遭遇区域引用不存在：${encounter.regionId}`,
        )
      }

      validateRequirements(context, encounter.requirements, `${path}.requirements`)
      validateEffects(context, encounter.victoryEffects, `${path}.victoryEffects`)
      validateEffects(context, encounter.defeatEffects, `${path}.defeatEffects`)
      validateReward(context, encounter.reward, `${path}.reward`)
      scanPlaceholders(context, encounter, path)
    })
  }
}
