import type { SecretRealmDefinition, SecretRealmReward } from '@/types/content'
import {
  checkId,
  pushIssue,
  requireArray,
  requireEnum,
  requireNonEmptyString,
  requireNumber,
  requireRange,
  scanPlaceholders,
} from './context'
import type { ValidationContext } from './types'

const REWARD_KINDS = [
  'item',
  'resource',
  'cultivation',
  'gear',
  'technique',
  'treasure',
  'mount',
  'pet',
] as const

const RESOURCE_KEYS = [
  'spirit_stones',
  'spirit_herbs',
  'ore',
  'beast_cores',
  'contribution',
  'merit',
  'karma',
] as const

function checkRange(
  context: ValidationContext,
  min: unknown,
  max: unknown,
  path: string,
  label: string,
): void {
  requireNumber(context, min, `${path}Min`, `${label}下限`)
  requireNumber(context, max, `${path}Max`, `${label}上限`)
  if (typeof min === 'number' && typeof max === 'number' && min > max) {
    pushIssue(context, 'INVALID_RANGE', path, `${label}下限不能大于上限`)
  }
}

function validateReward(
  context: ValidationContext,
  reward: SecretRealmReward,
  path: string,
): void {
  if (!requireEnum(context, reward.kind, REWARD_KINDS, `${path}.kind`, '秘境奖励类型')) {
    return
  }
  requireNumber(context, reward.weight, `${path}.weight`, '秘境奖励权重')
  if (reward.weight <= 0) {
    pushIssue(context, 'INVALID_RANGE', `${path}.weight`, '秘境奖励权重必须大于 0')
  }

  switch (reward.kind) {
    case 'item': {
      if (!reward.itemId || !context.index.catalog.has(reward.itemId)) {
        pushIssue(
          context,
          'MISSING_REFERENCE',
          `${path}.itemId`,
          `秘境奖励物品引用不存在：${String(reward.itemId)}`,
        )
      }
      checkRange(context, reward.countMin ?? 1, reward.countMax ?? 1, `${path}.count`, '秘境物品数量')
      break
    }
    case 'resource': {
      if (!reward.resource) {
        pushIssue(context, 'MISSING_FIELD', `${path}.resource`, '秘境资源奖励缺少资源类型')
      } else {
        requireEnum(context, reward.resource, RESOURCE_KEYS, `${path}.resource`, '秘境资源类型')
      }
      checkRange(context, reward.amountMin ?? 1, reward.amountMax ?? 1, `${path}.amount`, '秘境资源数量')
      break
    }
    case 'cultivation':
      checkRange(
        context,
        reward.cultivationMin ?? 0,
        reward.cultivationMax ?? 0,
        `${path}.cultivation`,
        '秘境修为奖励',
      )
      break
    case 'gear':
      if (reward.gearTier !== undefined) {
        requireRange(context, reward.gearTier, 1, 6, `${path}.gearTier`, '秘境装备阶位')
      }
      if (reward.qualityBonus !== undefined) {
        requireRange(context, reward.qualityBonus, 0, 3, `${path}.qualityBonus`, '秘境装备品相加成')
      }
      break
    case 'technique':
      if (!reward.techniqueId || !context.index.techniques.has(reward.techniqueId)) {
        pushIssue(
          context,
          'MISSING_REFERENCE',
          `${path}.techniqueId`,
          `秘境功法引用不存在：${String(reward.techniqueId)}`,
        )
      }
      break
    case 'treasure':
      if (!reward.treasureId || !context.index.catalog.has(reward.treasureId)) {
        pushIssue(
          context,
          'MISSING_REFERENCE',
          `${path}.treasureId`,
          `秘境法宝引用不存在：${String(reward.treasureId)}`,
        )
      }
      break
    case 'mount':
      if (!reward.mountId || !context.index.mounts.has(reward.mountId)) {
        pushIssue(
          context,
          'MISSING_REFERENCE',
          `${path}.mountId`,
          `秘境坐骑引用不存在：${String(reward.mountId)}`,
        )
      }
      break
    case 'pet':
      if (!reward.petId || !context.index.pets.has(reward.petId)) {
        pushIssue(
          context,
          'MISSING_REFERENCE',
          `${path}.petId`,
          `秘境灵宠引用不存在：${String(reward.petId)}`,
        )
      }
      break
  }
}

function validateSecretRealm(
  context: ValidationContext,
  realm: SecretRealmDefinition,
  path: string,
): void {
  checkId(context, realm.id, `${path}.id`, '秘境 ID')
  requireNonEmptyString(context, realm.name, `${path}.name`, '秘境名称')
  requireNonEmptyString(context, realm.summary, `${path}.summary`, '秘境摘要')
  requireNonEmptyString(context, realm.description, `${path}.description`, '秘境说明')

  if (!context.index.eras.has(realm.eraId)) {
    pushIssue(context, 'MISSING_REFERENCE', `${path}.eraId`, `秘境时代引用不存在：${realm.eraId}`)
  }

  if (requireArray<string>(context, realm.regionIds, `${path}.regionIds`, '秘境地域')) {
    if (realm.regionIds.length === 0) {
      pushIssue(context, 'MISSING_FIELD', `${path}.regionIds`, '秘境至少需要一处地域')
    }
    realm.regionIds.forEach((regionId, index) => {
      const region = context.index.regions.get(regionId)
      if (!region) {
        pushIssue(
          context,
          'MISSING_REFERENCE',
          `${path}.regionIds[${index}]`,
          `秘境地域引用不存在：${regionId}`,
        )
        return
      }
      if (!region.eraIds.includes(realm.eraId)) {
        pushIssue(
          context,
          'INVALID_VALUE',
          `${path}.regionIds[${index}]`,
          `秘境时代 ${realm.eraId} 不在地域 ${regionId} 的时代列表里`,
        )
      }
    })
  }

  requireRange(context, realm.tier, 1, 6, `${path}.tier`, '秘境阶位')
  requireRange(context, realm.weight, 1, 10000, `${path}.weight`, '秘境权重')

  if (requireArray<unknown>(context, realm.rewardPicks, `${path}.rewardPicks`, '秘境奖励抽取')) {
    if (realm.rewardPicks.length !== 2) {
      pushIssue(context, 'INVALID_VALUE', `${path}.rewardPicks`, '秘境奖励抽取必须是 [下限, 上限]')
    } else {
      const [min, max] = realm.rewardPicks
      if (!Number.isInteger(min) || min < 1) {
        pushIssue(context, 'INVALID_RANGE', `${path}.rewardPicks[0]`, '秘境奖励抽取下限必须是正整数')
      }
      if (!Number.isInteger(max) || max < 1) {
        pushIssue(context, 'INVALID_RANGE', `${path}.rewardPicks[1]`, '秘境奖励抽取上限必须是正整数')
      }
      if (min > max) {
        pushIssue(context, 'INVALID_RANGE', `${path}.rewardPicks`, '秘境奖励抽取下限不能大于上限')
      }
    }
  }

  if (requireArray<SecretRealmReward>(context, realm.rewards, `${path}.rewards`, '秘境奖励')) {
    if (realm.rewards.length === 0) {
      pushIssue(context, 'MISSING_FIELD', `${path}.rewards`, '秘境至少需要一条奖励')
    }
    realm.rewards.forEach((reward, index) => {
      validateReward(context, reward, `${path}.rewards[${index}]`)
    })
  }

  scanPlaceholders(context, realm, path)
}

export function validateSecretRealms(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.secretRealms.forEach((realm, index) => {
      validateSecretRealm(context, realm, `pack:${pack.id}.secretRealms[${index}]`)
    })
  }
}