import type { WorldBossDefinition, WorldBossDrop } from '@/types/content'
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
  validateEffects,
  validateRequirements,
} from './context'
import { RESOURCE_KEYS } from './context'
import type { ValidationContext } from './types'

const DROP_KINDS = ['item', 'treasure', 'resource', 'cultivation', 'gear'] as const
const GEAR_SLOTS = [
  'weapon',
  'armor',
  'head',
  'cloak',
  'waist',
  'boots',
  'neck',
  'ring',
  'accessory',
  'talisman',
] as const

function validateDrop(
  context: ValidationContext,
  drop: WorldBossDrop,
  path: string,
): void {
  requireEnum(context, drop.kind, DROP_KINDS, `${path}.kind`, '掉落类型')
  if (requireNumber(context, drop.weight, `${path}.weight`, '掉落权重') && drop.weight <= 0) {
    pushIssue(context, 'INVALID_RANGE', `${path}.weight`, '掉落权重必须为正数')
  }
  if (drop.firstKillOnly !== undefined) {
    requireBoolean(context, drop.firstKillOnly, `${path}.firstKillOnly`, '是否仅首杀掉落')
  }

  if (drop.kind === 'item' || drop.kind === 'treasure') {
    if (checkId(context, drop.itemId, `${path}.itemId`, '掉落物 ID')) {
      if (!context.index.catalog.has(drop.itemId)) {
        pushIssue(
          context,
          'MISSING_REFERENCE',
          `${path}.itemId`,
          `掉落物引用不存在：${drop.itemId}`,
        )
      }
    }
    const min = drop.countMin ?? 1
    const max = drop.countMax ?? min
    if (requireNumber(context, min, `${path}.countMin`, '掉落数量下限')) {
      if (!Number.isInteger(min) || min < 1) {
        pushIssue(context, 'INVALID_RANGE', `${path}.countMin`, '掉落数量下限必须是正整数')
      }
    }
    if (requireNumber(context, max, `${path}.countMax`, '掉落数量上限')) {
      if (!Number.isInteger(max) || max < min) {
        pushIssue(context, 'INVALID_RANGE', `${path}.countMax`, '掉落数量上限必须不小于下限')
      }
    }
    return
  }

  if (drop.kind === 'resource') {
    requireEnum(context, drop.resource, RESOURCE_KEYS, `${path}.resource`, '资源类型')
    const min = drop.amountMin ?? 1
    const max = drop.amountMax ?? min
    if (requireNumber(context, min, `${path}.amountMin`, '资源数量下限')) {
      if (!Number.isInteger(min) || min < 1) {
        pushIssue(context, 'INVALID_RANGE', `${path}.amountMin`, '资源数量下限必须是正整数')
      }
    }
    if (requireNumber(context, max, `${path}.amountMax`, '资源数量上限')) {
      if (!Number.isInteger(max) || max < min) {
        pushIssue(context, 'INVALID_RANGE', `${path}.amountMax`, '资源数量上限必须不小于下限')
      }
    }
    return
  }

  if (drop.kind === 'cultivation') {
    const min = drop.cultivationMin ?? 1
    const max = drop.cultivationMax ?? min
    if (requireNumber(context, min, `${path}.cultivationMin`, '修为下限') && min < 0) {
      pushIssue(context, 'INVALID_RANGE', `${path}.cultivationMin`, '修为下限不能为负')
    }
    if (requireNumber(context, max, `${path}.cultivationMax`, '修为上限') && max < min) {
      pushIssue(context, 'INVALID_RANGE', `${path}.cultivationMax`, '修为上限必须不小于下限')
    }
    return
  }

  if (drop.gearSlot !== undefined) {
    requireEnum(context, drop.gearSlot, GEAR_SLOTS, `${path}.gearSlot`, '装备槽位')
  }
  const tier = drop.gearTier ?? 1
  if (requireRange(context, tier, 1, 6, `${path}.gearTier`, '装备阶位')) {
    if (!Number.isInteger(tier)) {
      pushIssue(context, 'INVALID_RANGE', `${path}.gearTier`, '装备阶位必须是整数')
    }
  }
  if (drop.qualityBonus !== undefined) {
    if (requireNumber(context, drop.qualityBonus, `${path}.qualityBonus`, '品质加成')) {
      if (drop.qualityBonus < 0 || drop.qualityBonus > 4) {
        pushIssue(context, 'INVALID_RANGE', `${path}.qualityBonus`, '品质加成必须在 0–4 之间')
      }
    }
  }
}

function validateDropList(
  context: ValidationContext,
  drops: WorldBossDrop[] | undefined,
  path: string,
  label: string,
): void {
  if (!requireArray<WorldBossDrop>(context, drops, path, label)) return
  drops.forEach((drop, index) => {
    if (!drop || typeof drop !== 'object') {
      pushIssue(context, 'MISSING_FIELD', `${path}[${index}]`, '掉落条目必须是对象')
      return
    }
    validateDrop(context, drop, `${path}[${index}]`)
  })
}

export function validateWorldBosses(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.worldBosses.forEach((boss: WorldBossDefinition, index) => {
      const path = `pack:${pack.id}.worldBosses[${index}]`
      checkId(context, boss.id, `${path}.id`, '世界 Boss ID')
      requireNonEmptyString(context, boss.name, `${path}.name`, '世界 Boss 名称')
      requireNonEmptyString(context, boss.title, `${path}.title`, '世界 Boss 称号')
      requireNonEmptyString(context, boss.originalName, `${path}.originalName`, '世界 Boss 原身名')
      requireNonEmptyString(context, boss.summary, `${path}.summary`, '世界 Boss 摘要')
      requireNonEmptyString(context, boss.description, `${path}.description`, '世界 Boss 说明')
      requireNonEmptyString(context, boss.originalBody, `${path}.originalBody`, '世界 Boss 原身记述')

      if (checkId(context, boss.eraId, `${path}.eraId`, '时代 ID')) {
        if (!context.index.eras.has(boss.eraId)) {
          pushIssue(context, 'MISSING_REFERENCE', `${path}.eraId`, `时代引用不存在：${boss.eraId}`)
        }
      }
      if (checkId(context, boss.regionId, `${path}.regionId`, '区域 ID')) {
        if (!context.index.regions.has(boss.regionId)) {
          pushIssue(
            context,
            'MISSING_REFERENCE',
            `${path}.regionId`,
            `区域引用不存在：${boss.regionId}`,
          )
        }
      }
      if (checkId(context, boss.encounterId, `${path}.encounterId`, '战斗遭遇 ID')) {
        if (!context.index.encounters.has(boss.encounterId)) {
          pushIssue(
            context,
            'MISSING_REFERENCE',
            `${path}.encounterId`,
            `战斗遭遇引用不存在：${boss.encounterId}`,
          )
        }
      }

      if (requireNumber(context, boss.phaseOrder, `${path}.phaseOrder`, '现世阶段顺序')) {
        if (!Number.isInteger(boss.phaseOrder) || boss.phaseOrder < 1) {
          pushIssue(context, 'INVALID_RANGE', `${path}.phaseOrder`, '现世阶段顺序必须是正整数')
        }
      }
      validateRequirements(context, boss.requirements, `${path}.requirements`)

      if (requireNumber(context, boss.respawnMonths, `${path}.respawnMonths`, '复活月数')) {
        if (boss.respawnMonths <= 0) {
          pushIssue(context, 'INVALID_RANGE', `${path}.respawnMonths`, '复活月数必须为正数')
        }
      }
      if (requireNumber(context, boss.killScale, `${path}.killScale`, '重复击杀成长')) {
        if (boss.killScale < 0) {
          pushIssue(context, 'INVALID_RANGE', `${path}.killScale`, '重复击杀成长不能为负')
        }
      }
      if (requireNumber(context, boss.maxScale, `${path}.maxScale`, '成长上限')) {
        if (boss.maxScale < 1) {
          pushIssue(context, 'INVALID_RANGE', `${path}.maxScale`, '成长上限不能小于 1')
        }
      }

      validateDropList(context, boss.guaranteedDrops, `${path}.guaranteedDrops`, '固定掉落')
      if (requireArray<[number, number]>(context, boss.dropPicks, `${path}.dropPicks`, '随机掉落数量')) {
        if (boss.dropPicks.length !== 2) {
          pushIssue(context, 'INVALID_RANGE', `${path}.dropPicks`, '随机掉落数量必须包含上下限两项')
        } else {
          const [min, max] = boss.dropPicks
          if (
            !Number.isInteger(min) ||
            !Number.isInteger(max) ||
            min < 0 ||
            max < min
          ) {
            pushIssue(context, 'INVALID_RANGE', `${path}.dropPicks`, '随机掉落数量必须是非负整数且上限不小于下限')
          }
        }
      }
      validateDropList(context, boss.drops, `${path}.drops`, '随机掉落')
      if (Array.isArray(boss.drops) && boss.drops.length === 0) {
        pushIssue(context, 'MISSING_FIELD', `${path}.drops`, '世界 Boss 至少需要一条随机掉落')
      }

      if (boss.onFirstKill !== undefined) {
        validateEffects(context, boss.onFirstKill, `${path}.onFirstKill`)
      }
      if (boss.onEveryKill !== undefined) {
        validateEffects(context, boss.onEveryKill, `${path}.onEveryKill`)
      }
      if (boss.hidden !== undefined) {
        requireBoolean(context, boss.hidden, `${path}.hidden`, '是否隐藏')
      }
      if (boss.tags !== undefined) {
        if (requireArray<string>(context, boss.tags, `${path}.tags`, '标签')) {
          boss.tags.forEach((tag, i) => {
            requireNonEmptyString(context, tag, `${path}.tags[${i}]`, '标签')
          })
        }
      }

      scanPlaceholders(context, boss, path)
    })
  }
}