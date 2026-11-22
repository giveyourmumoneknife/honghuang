import type { DataPack, EventDefinition } from '@/types/content'
import type { FlagValue, RealmId, ResourceKey } from '@/types/common'
import type { Effect, Requirement } from '@/types/dsl'
import { EFFECT_KINDS, NUMERIC_EFFECT_KINDS } from '@/types/dsl'
import { isValidId } from '@/utils/id'
import type {
  ContentIndex,
  ValidationCode,
  ValidationContext,
  ValidationIssue,
  ValidationSeverity,
} from './types'

export const PLACEHOLDER_PATTERN = /(?:TODO|TBD|lorem ipsum|待补|占位|\{\{[^}]+\}\})/i
export const DAILY_TASK_PATTERN = /(?:每日|签到|日常任务|daily[\s_-]?(?:task|login))/i

export const RESOURCE_KEYS: readonly ResourceKey[] = [
  'spirit_stones',
  'spirit_herbs',
  'ore',
  'beast_cores',
  'contribution',
  'merit',
  'karma',
]

const REALM_IDS: readonly RealmId[] = [
  'mortal',
  'qi_refining',
  'foundation',
  'golden_core',
]

function isFlagValue(value: unknown): value is FlagValue {
  return (
    typeof value === 'boolean' ||
    typeof value === 'string' ||
    (typeof value === 'number' && Number.isFinite(value))
  )
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function requireFlagValue(
  context: ValidationContext,
  value: unknown,
  path: string,
  label: string,
): boolean {
  if (!isFlagValue(value)) {
    pushIssue(context, 'INVALID_VALUE', path, `${label} 必须是布尔值、有限数字或字符串`)
    return false
  }
  return true
}

export function requirePositiveInteger(
  context: ValidationContext,
  value: unknown,
  path: string,
  label: string,
): boolean {
  if (!requireNumber(context, value, path, label)) return false
  if (!Number.isInteger(value) || value < 1) {
    pushIssue(context, 'INVALID_RANGE', path, `${label} 必须是正整数`)
    return false
  }
  return true
}

function requireNonNegativeInteger(
  context: ValidationContext,
  value: unknown,
  path: string,
  label: string,
): boolean {
  if (!requireNumber(context, value, path, label)) return false
  if (!Number.isInteger(value) || value < 0) {
    pushIssue(context, 'INVALID_RANGE', path, `${label} 必须是非负整数`)
    return false
  }
  return true
}

export function pushIssue(
  context: ValidationContext,
  code: ValidationCode,
  path: string,
  message: string,
  severity: ValidationSeverity = 'error',
): void {
  const issue: ValidationIssue = { code, path, message, severity }
  context.issues.push(issue)
}

export function requireNonEmptyString(
  context: ValidationContext,
  value: unknown,
  path: string,
  label: string,
): value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    pushIssue(context, 'MISSING_FIELD', path, `${label} 缺失或为空`)
    return false
  }
  return true
}

export function requireNumber(
  context: ValidationContext,
  value: unknown,
  path: string,
  label: string,
): value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    pushIssue(context, 'MISSING_FIELD', path, `${label} 必须是有限数字`)
    return false
  }
  return true
}

export function requireBoolean(
  context: ValidationContext,
  value: unknown,
  path: string,
  label: string,
): value is boolean {
  if (typeof value !== 'boolean') {
    pushIssue(context, 'MISSING_FIELD', path, `${label} 必须是布尔值`)
    return false
  }
  return true
}

export function requireArray<T>(
  context: ValidationContext,
  value: unknown,
  path: string,
  label: string,
): value is T[] {
  if (!Array.isArray(value)) {
    pushIssue(context, 'MISSING_FIELD', path, `${label} 必须是数组`)
    return false
  }
  return true
}

export function requireEnum<T extends string>(
  context: ValidationContext,
  value: unknown,
  allowed: readonly T[],
  path: string,
  label: string,
): value is T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    pushIssue(context, 'INVALID_ENUM', path, `${label} 不是合法枚举值：${String(value)}`)
    return false
  }
  return true
}

export function requireRange(
  context: ValidationContext,
  value: unknown,
  min: number,
  max: number,
  path: string,
  label: string,
): value is number {
  if (!requireNumber(context, value, path, label)) return false
  if (value < min || value > max) {
    pushIssue(context, 'INVALID_RANGE', path, `${label} 必须在 ${min}–${max} 之间，收到 ${value}`)
    return false
  }
  return true
}

export function checkId(
  context: ValidationContext,
  value: unknown,
  path: string,
  label: string,
): value is string {
  if (!requireNonEmptyString(context, value, path, label)) return false
  if (!isValidId(value)) {
    pushIssue(context, 'INVALID_ID', path, `${label} 必须是小写命名空间 ID，收到：${value}`)
    return false
  }
  return true
}

export function hasNonNumericEffect(effects: readonly Effect[]): boolean {
  return effects.some(
    (effect) =>
      effect !== null &&
      typeof effect === 'object' &&
      !NUMERIC_EFFECT_KINDS.has(effect.kind),
  )
}

export function collectEventEffects(event: EventDefinition): Effect[] {
  const onEnter = Array.isArray(event.onEnter) ? event.onEnter : []
  const choices = Array.isArray(event.choices) ? event.choices : []
  return [
    ...onEnter,
    ...choices.flatMap((choice) => (Array.isArray(choice.effects) ? choice.effects : [])),
  ]
}

export function scanStrings(
  value: unknown,
  path: string,
  context: ValidationContext,
  predicate: (text: string) => boolean,
  code: ValidationCode,
  message: (text: string) => string,
): void {
  if (typeof value === 'string') {
    if (predicate(value)) pushIssue(context, code, path, message(value))
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanStrings(item, `${path}[${index}]`, context, predicate, code, message))
    return
  }
  if (value !== null && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      scanStrings(nested, `${path}.${key}`, context, predicate, code, message)
    }
  }
}

export function scanPlaceholders(
  context: ValidationContext,
  value: unknown,
  path: string,
): void {
  scanStrings(
    value,
    path,
    context,
    (text) => PLACEHOLDER_PATTERN.test(text),
    'PLACEHOLDER_TEXT',
    (text) => `发现占位文本：${text}`,
  )
}

export function buildContentIndex(context: ValidationContext): ContentIndex {
  const index: ContentIndex = {
    eras: new Map(),
    factions: new Map(),
    regions: new Map(),
    events: new Map(),
    catalog: new Map(),
    techniques: new Map(),
    divineAbilities: new Map(),
    craftRecipes: new Map(),
    partners: new Map(),
    caves: new Map(),
    mounts: new Map(),
    pets: new Map(),
    origins: new Map(),
    roots: new Map(),
    talents: new Map(),
    physiques: new Map(),
    bloodlines: new Map(),
    enemies: new Map(),
    encounters: new Map(),
    secretRealms: new Map(),
    worldBosses: new Map(),
    daoClusters: new Map(),
    daoNodes: new Map(),
    daoPrinciples: new Map(),
    sites: new Map(),
  }
  const seen = new Map<string, { kind: string; path: string }>()

  const register = (
    kind: string,
    id: unknown,
    path: string,
  ): boolean => {
    if (typeof id !== 'string' || id.length === 0) return false
    const existing = seen.get(id)
    if (existing) {
      pushIssue(
        context,
        'DUPLICATE_ID',
        path,
        `ID ${id} 与 ${existing.kind}（${existing.path}）重复`,
      )
      return false
    }
    seen.set(id, { kind, path })
    return true
  }

  for (const pack of context.packs) {
    const packPath = `pack:${pack.id}`
    pack.eras.forEach((entry, i) => {
      const path = `${packPath}.eras[${i}]`
      if (register('era', entry.id, path)) index.eras.set(entry.id, entry)
    })
    pack.factions.forEach((entry, i) => {
      const path = `${packPath}.factions[${i}]`
      if (register('faction', entry.id, path)) index.factions.set(entry.id, entry)
    })
    pack.regions.forEach((entry, i) => {
      const path = `${packPath}.regions[${i}]`
      if (register('region', entry.id, path)) index.regions.set(entry.id, entry)
      entry.sites.forEach((site, j) => {
        const sitePath = `${path}.sites[${j}]`
        if (register('site', site.id, sitePath)) {
          index.sites.set(site.id, { region: entry, site })
        }
      })
    })
    pack.events.forEach((entry, i) => {
      const path = `${packPath}.events[${i}]`
      if (register('event', entry.id, path)) index.events.set(entry.id, entry)
    })
    pack.items.forEach((entry, i) => {
      const path = `${packPath}.items[${i}]`
      if (register('item', entry.id, path)) index.catalog.set(entry.id, entry)
    })
    pack.treasures.forEach((entry, i) => {
      const path = `${packPath}.treasures[${i}]`
      if (register('treasure', entry.id, path)) index.catalog.set(entry.id, entry)
    })
    pack.techniques.forEach((entry, i) => {
      const path = `${packPath}.techniques[${i}]`
      if (register('technique', entry.id, path)) index.techniques.set(entry.id, entry)
    })
    pack.divineAbilities.forEach((entry, i) => {
      const path = `${packPath}.divineAbilities[${i}]`
      if (register('divineAbility', entry.id, path)) {
        index.divineAbilities.set(entry.id, entry)
      }
    })
    pack.craftRecipes.forEach((entry, i) => {
      const path = `${packPath}.craftRecipes[${i}]`
      if (register('craftRecipe', entry.id, path)) {
        index.craftRecipes.set(entry.id, entry)
      }
    })
    pack.partners.forEach((entry, i) => {
      const path = `${packPath}.partners[${i}]`
      if (register('partner', entry.id, path)) index.partners.set(entry.id, entry)
    })
    pack.caves.forEach((entry, i) => {
      const path = `${packPath}.caves[${i}]`
      if (register('cave', entry.id, path)) index.caves.set(entry.id, entry)
    })
    pack.mounts.forEach((entry, i) => {
      const path = `${packPath}.mounts[${i}]`
      if (register('mount', entry.id, path)) index.mounts.set(entry.id, entry)
    })
    pack.pets.forEach((entry, i) => {
      const path = `${packPath}.pets[${i}]`
      if (register('pet', entry.id, path)) index.pets.set(entry.id, entry)
    })
    pack.origins.forEach((entry, i) => {
      const path = `${packPath}.origins[${i}]`
      if (register('origin', entry.id, path)) index.origins.set(entry.id, entry)
    })
    pack.roots.forEach((entry, i) => {
      const path = `${packPath}.roots[${i}]`
      if (register('root', entry.id, path)) index.roots.set(entry.id, entry)
    })
    pack.talents.forEach((entry, i) => {
      const path = `${packPath}.talents[${i}]`
      if (register('talent', entry.id, path)) index.talents.set(entry.id, entry)
    })
    pack.physiques.forEach((entry, i) => {
      const path = `${packPath}.physiques[${i}]`
      if (register('physique', entry.id, path)) index.physiques.set(entry.id, entry)
    })
    pack.bloodlines.forEach((entry, i) => {
      const path = `${packPath}.bloodlines[${i}]`
      if (register('bloodline', entry.id, path)) index.bloodlines.set(entry.id, entry)
    })
    pack.enemies.forEach((entry, i) => {
      const path = `${packPath}.enemies[${i}]`
      if (register('enemy', entry.id, path)) index.enemies.set(entry.id, entry)
    })
    pack.encounters.forEach((entry, i) => {
      const path = `${packPath}.encounters[${i}]`
      if (register('encounter', entry.id, path)) index.encounters.set(entry.id, entry)
    })
    pack.secretRealms.forEach((entry, i) => {
      const path = `${packPath}.secretRealms[${i}]`
      if (register('secretRealm', entry.id, path)) index.secretRealms.set(entry.id, entry)
    })
    pack.worldBosses.forEach((entry, i) => {
      const path = `${packPath}.worldBosses[${i}]`
      if (register('worldBoss', entry.id, path)) index.worldBosses.set(entry.id, entry)
    })
    pack.daoClusters.forEach((entry, i) => {
      const path = `${packPath}.daoClusters[${i}]`
      if (register('daoCluster', entry.id, path)) index.daoClusters.set(entry.id, entry)
    })
    pack.daoNodes.forEach((entry, i) => {
      const path = `${packPath}.daoNodes[${i}]`
      if (register('daoNode', entry.id, path)) index.daoNodes.set(entry.id, entry)
    })
    pack.daoPrinciples.forEach((entry, i) => {
      const path = `${packPath}.daoPrinciples[${i}]`
      if (register('daoPrinciple', entry.id, path)) index.daoPrinciples.set(entry.id, entry)
    })
  }

  return index
}

export function createValidationContext(packs: DataPack[]): ValidationContext {
  const context: ValidationContext = {
    packs,
    index: {
      eras: new Map(),
      factions: new Map(),
      regions: new Map(),
      events: new Map(),
      catalog: new Map(),
      techniques: new Map(),
      partners: new Map(),
      caves: new Map(),
      mounts: new Map(),
      pets: new Map(),
      origins: new Map(),
      roots: new Map(),
      talents: new Map(),
      physiques: new Map(),
      bloodlines: new Map(),
      enemies: new Map(),
      encounters: new Map(),
      secretRealms: new Map(),
      worldBosses: new Map(),
      daoClusters: new Map(),
      daoNodes: new Map(),
      daoPrinciples: new Map(),
      divineAbilities: new Map(),
      craftRecipes: new Map(),
      sites: new Map(),
    },
    issues: [],
  }
  context.index = buildContentIndex(context)
  return context
}

export function missingReference(
  context: ValidationContext,
  path: string,
  kind: string,
  id: string,
): void {
  pushIssue(context, 'MISSING_REFERENCE', path, `${kind} 引用不存在：${id}`)
}

export function checkEffectReferences(
  context: ValidationContext,
  effect: Effect,
  path: string,
): void {
  if (!EFFECT_KIND_SET.has(effect.kind)) {
    pushIssue(context, 'INVALID_ENUM', `${path}.kind`, `未知效果类型：${String(effect.kind)}`)
    return
  }

  switch (effect.kind) {
    case 'setFlag':
      requireNonEmptyString(context, effect.flag, `${path}.flag`, '状态标记')
      requireFlagValue(context, effect.value, `${path}.value`, '状态标记值')
      break
    case 'clearFlag':
      requireNonEmptyString(context, effect.flag, `${path}.flag`, '状态标记')
      break
    case 'scheduleEvent':
      if (checkId(context, effect.eventId, `${path}.eventId`, '事件 ID')) {
        if (!context.index.events.has(effect.eventId)) {
          missingReference(context, `${path}.eventId`, '事件', effect.eventId)
        }
      }
      if (effect.delayMonths !== undefined) {
        if (requireNumber(context, effect.delayMonths, `${path}.delayMonths`, '延迟月数')) {
          if (effect.delayMonths < 0 || !Number.isInteger(effect.delayMonths)) {
            pushIssue(context, 'INVALID_RANGE', `${path}.delayMonths`, '延迟月数必须是非负整数')
          }
        }
      }
      break
    case 'changeFactionState':
      if (checkId(context, effect.factionId, `${path}.factionId`, '势力 ID')) {
        if (!context.index.factions.has(effect.factionId)) {
          missingReference(context, `${path}.factionId`, '势力', effect.factionId)
        }
      }
      if (effect.membership !== undefined) {
        requireBoolean(context, effect.membership, `${path}.membership`, '势力成员状态')
      }
      if (effect.rank !== undefined) {
        requireNonNegativeInteger(context, effect.rank, `${path}.rank`, '势力职位')
      }
      if (effect.contributionDelta !== undefined) {
        requireNumber(context, effect.contributionDelta, `${path}.contributionDelta`, '贡献变化')
      }
      if (effect.reputationDelta !== undefined) {
        requireNumber(context, effect.reputationDelta, `${path}.reputationDelta`, '声望变化')
      }
      if (effect.fortuneDelta !== undefined) {
        requireNumber(context, effect.fortuneDelta, `${path}.fortuneDelta`, '气运变化')
      }
      if (effect.flags !== undefined) {
        if (!isPlainRecord(effect.flags)) {
          pushIssue(context, 'MISSING_FIELD', `${path}.flags`, '势力状态标记必须是对象')
        } else {
          for (const [key, value] of Object.entries(effect.flags)) {
            requireNonEmptyString(context, key, `${path}.flags`, '势力状态标记键')
            requireFlagValue(context, value, `${path}.flags.${key}`, '势力状态标记值')
          }
        }
      }
      break
    case 'changeRegionState':
      if (checkId(context, effect.regionId, `${path}.regionId`, '区域 ID')) {
        if (!context.index.regions.has(effect.regionId)) {
          missingReference(context, `${path}.regionId`, '区域', effect.regionId)
        }
      }
      requireNonEmptyString(context, effect.key, `${path}.key`, '区域状态键')
      requireFlagValue(context, effect.value, `${path}.value`, '区域状态值')
      break
    case 'unlockSite': {
      if (checkId(context, effect.regionId, `${path}.regionId`, '区域 ID')) {
        if (!context.index.regions.has(effect.regionId)) {
          missingReference(context, `${path}.regionId`, '区域', effect.regionId)
        }
      }
      if (!checkId(context, effect.siteId, `${path}.siteId`, '地点 ID')) break
      const site = context.index.sites.get(effect.siteId)
      if (!site) {
        missingReference(context, `${path}.siteId`, '地点', effect.siteId)
      } else if (site.region.id !== effect.regionId) {
        pushIssue(
          context,
          'MISSING_REFERENCE',
          `${path}.regionId`,
          `地点 ${effect.siteId} 属于 ${site.region.id}，不属于 ${effect.regionId}`,
        )
      }
      break
    }
    case 'unlockRegion':
      if (checkId(context, effect.regionId, `${path}.regionId`, '区域 ID')) {
        if (!context.index.regions.has(effect.regionId)) {
          missingReference(context, `${path}.regionId`, '区域', effect.regionId)
        }
      }
      break
    case 'changeEra':
      if (checkId(context, effect.eraId, `${path}.eraId`, '时代 ID')) {
        if (!context.index.eras.has(effect.eraId)) {
          missingReference(context, `${path}.eraId`, '时代', effect.eraId)
        }
      }
      break
    case 'changeDaoguo':
      requireNumber(context, effect.amount, `${path}.amount`, '道果变化量')
      break
    case 'gainStarMark':
      requirePositiveInteger(context, effect.amount, `${path}.amount`, '星痕数量')
      break
    case 'addRumor':
      checkId(context, effect.rumorId, `${path}.rumorId`, '传闻 ID')
      requireNonEmptyString(context, effect.text, `${path}.text`, '传闻文本')
      break
    case 'changeFavorTier':
      if (checkId(context, effect.partnerId, `${path}.partnerId`, '道侣 ID')) {
        if (!context.index.partners.has(effect.partnerId)) {
          missingReference(context, `${path}.partnerId`, '道侣', effect.partnerId)
        }
      }
      requireNumber(context, effect.delta, `${path}.delta`, '情谊层级变化')
      requireNonEmptyString(context, effect.reason, `${path}.reason`, '情谊变化原因')
      break
    case 'bondPartner':
      if (checkId(context, effect.partnerId, `${path}.partnerId`, '道侣 ID')) {
        if (!context.index.partners.has(effect.partnerId)) {
          missingReference(context, `${path}.partnerId`, '道侣', effect.partnerId)
        }
      }
      break
    case 'applyStatus':
      checkId(context, effect.statusId, `${path}.statusId`, '状态 ID')
      if (effect.months !== undefined) {
        requirePositiveInteger(context, effect.months, `${path}.months`, '状态持续月数')
      }
      if (effect.source !== undefined) {
        requireNonEmptyString(context, effect.source, `${path}.source`, '状态来源')
      }
      break
    case 'gainFoundation':
      if (!isPlainRecord(effect.stats)) {
        pushIssue(context, 'MISSING_FIELD', `${path}.stats`, '根基增益必须是对象')
        break
      }
      for (const [key, value] of Object.entries(effect.stats)) {
        if (!['health', 'attack', 'defense', 'spirit'].includes(key)) {
          pushIssue(context, 'INVALID_VALUE', `${path}.stats.${key}`, `未知根基属性：${key}`)
          continue
        }
        if (requireNumber(context, value, `${path}.stats.${key}`, '根基增益')) {
          if (value <= 0) {
            pushIssue(context, 'INVALID_RANGE', `${path}.stats.${key}`, '根基增益必须大于 0')
          }
        }
      }
      break
    case 'grantItem':
    case 'removeItem':
      if (checkId(context, effect.itemId, `${path}.itemId`, '物品 ID')) {
        if (!context.index.catalog.has(effect.itemId)) {
          missingReference(context, `${path}.itemId`, '物品', effect.itemId)
        }
      }
      if (effect.count !== undefined) {
        requirePositiveInteger(context, effect.count, `${path}.count`, '物品数量')
      }
      break
    case 'grantTreasure':
      if (checkId(context, effect.treasureId, `${path}.treasureId`, '法宝 ID')) {
        if (!context.index.catalog.has(effect.treasureId)) {
          missingReference(context, `${path}.treasureId`, '法宝', effect.treasureId)
        }
      }
      break
    case 'grantMount':
      if (checkId(context, effect.mountId, `${path}.mountId`, '坐骑 ID')) {
        if (!context.index.mounts.has(effect.mountId)) {
          missingReference(context, `${path}.mountId`, '坐骑', effect.mountId)
        }
      }
      break
    case 'grantPet':
      if (checkId(context, effect.petId, `${path}.petId`, '灵宠 ID')) {
        if (!context.index.pets.has(effect.petId)) {
          missingReference(context, `${path}.petId`, '灵宠', effect.petId)
        }
      }
      break
    case 'changeResource':
      requireEnum(context, effect.resource, RESOURCE_KEYS, `${path}.resource`, '资源类型')
      requireNumber(context, effect.amount, `${path}.amount`, '资源变化量')
      break
    case 'gainCultivation':
      requireNumber(context, effect.amount, `${path}.amount`, '修为变化量')
      break
    case 'gainBodyTemper':
      requireNumber(context, effect.amount, `${path}.amount`, '淬体值变化量')
      break
    case 'grantBloodline':
      if (checkId(context, effect.bloodlineId, `${path}.bloodlineId`, '血脉 ID')) {
        if (!context.index.bloodlines.has(effect.bloodlineId)) {
          missingReference(context, `${path}.bloodlineId`, '血脉', effect.bloodlineId)
        }
      }
      break
    case 'learnTechnique':
      if (checkId(context, effect.techniqueId, `${path}.techniqueId`, '功法 ID')) {
        if (!context.index.techniques.has(effect.techniqueId)) {
          missingReference(context, `${path}.techniqueId`, '功法', effect.techniqueId)
        }
      }
      break
    case 'unlockCave':
      if (checkId(context, effect.caveId, `${path}.caveId`, '洞府 ID')) {
        if (!context.index.caves.has(effect.caveId)) {
          missingReference(context, `${path}.caveId`, '洞府', effect.caveId)
        }
      }
      break
    case 'unlockBuilding':
      checkId(context, effect.caveBuildingId, `${path}.caveBuildingId`, '洞府建筑 ID')
      if (requireNumber(context, effect.level, `${path}.level`, '建筑等级')) {
        if (!Number.isInteger(effect.level) || effect.level < 1 || effect.level > 3) {
          pushIssue(context, 'INVALID_RANGE', `${path}.level`, '建筑等级必须是 1–3 的整数')
        }
      }
      break
    case 'addMemory':
      checkId(context, effect.memoryId, `${path}.memoryId`, '记忆 ID')
      requireNonEmptyString(context, effect.text, `${path}.text`, '记忆文本')
      break
    case 'startCombat':
      if (checkId(context, effect.encounterId, `${path}.encounterId`, '战斗遭遇 ID')) {
        if (!context.index.encounters.has(effect.encounterId)) {
          missingReference(context, `${path}.encounterId`, '战斗遭遇', effect.encounterId)
        }
      }
      if (effect.fleeAllowed !== undefined) {
        requireBoolean(context, effect.fleeAllowed, `${path}.fleeAllowed`, '是否允许逃离')
      }
      break
    default:
      break
  }
}

export function checkRequirementReferences(
  context: ValidationContext,
  requirement: Requirement,
  path: string,
): void {
  switch (requirement.kind) {
    case 'flag':
      requireNonEmptyString(context, requirement.flag, `${path}.flag`, '状态标记')
      if (requirement.value !== undefined) {
        requireFlagValue(context, requirement.value, `${path}.value`, '状态标记值')
      }
      break
    case 'era':
      if (checkId(context, requirement.eraId, `${path}.eraId`, '时代 ID')) {
        if (!context.index.eras.has(requirement.eraId)) {
          missingReference(context, `${path}.eraId`, '时代', requirement.eraId)
        }
      }
      break
    case 'phase': {
      checkId(context, requirement.phaseId, `${path}.phaseId`, '时代阶段 ID')
      const era = context.index.eras.get(requirement.eraId)
      if (!era) {
        if (checkId(context, requirement.eraId, `${path}.eraId`, '时代 ID')) {
          missingReference(context, `${path}.eraId`, '时代', requirement.eraId)
        }
      } else if (!era.phases.some((phase) => phase.id === requirement.phaseId)) {
        missingReference(context, `${path}.phaseId`, '时代阶段', requirement.phaseId)
      }
      break
    }
    case 'factionMembership':
      if (checkId(context, requirement.factionId, `${path}.factionId`, '势力 ID')) {
        if (!context.index.factions.has(requirement.factionId)) {
          missingReference(context, `${path}.factionId`, '势力', requirement.factionId)
        }
      }
      if (requirement.rankAtLeast !== undefined) {
        requireNonNegativeInteger(
          context,
          requirement.rankAtLeast,
          `${path}.rankAtLeast`,
          '最低职位',
        )
      }
      break
    case 'factionReputation':
      if (checkId(context, requirement.factionId, `${path}.factionId`, '势力 ID')) {
        if (!context.index.factions.has(requirement.factionId)) {
          missingReference(context, `${path}.factionId`, '势力', requirement.factionId)
        }
      }
      requireNumber(context, requirement.minReputation, `${path}.minReputation`, '最低声望')
      break
    case 'regionUnlocked':
    case 'regionVisited':
      if (checkId(context, requirement.regionId, `${path}.regionId`, '区域 ID')) {
        if (!context.index.regions.has(requirement.regionId)) {
          missingReference(context, `${path}.regionId`, '区域', requirement.regionId)
        }
      }
      break
    case 'regionState':
      if (checkId(context, requirement.regionId, `${path}.regionId`, '区域 ID')) {
        if (!context.index.regions.has(requirement.regionId)) {
          missingReference(context, `${path}.regionId`, '区域', requirement.regionId)
        }
      }
      requireNonEmptyString(context, requirement.key, `${path}.key`, '区域状态键')
      requireFlagValue(context, requirement.value, `${path}.value`, '区域状态值')
      break
    case 'realm':
      requireEnum(context, requirement.minRealm, REALM_IDS, `${path}.minRealm`, '最低境界')
      if (requirement.minStage !== undefined) {
        if (requireNumber(context, requirement.minStage, `${path}.minStage`, '最低境界阶段')) {
          if (![1, 2, 3].includes(requirement.minStage)) {
            pushIssue(context, 'INVALID_RANGE', `${path}.minStage`, '境界阶段必须是 1–3')
          }
        }
      }
      break
    case 'bodyStage':
      if (requireNumber(context, requirement.minStage, `${path}.minStage`, '最低体魄阶段')) {
        if (!Number.isInteger(requirement.minStage) || requirement.minStage < 0 || requirement.minStage > 5) {
          pushIssue(context, 'INVALID_RANGE', `${path}.minStage`, '体魄阶段必须是 0–5 的整数')
        }
      }
      break
    case 'bloodlineStage':
      if (requireNumber(context, requirement.minStage, `${path}.minStage`, '最低血脉阶段')) {
        if (!Number.isInteger(requirement.minStage) || requirement.minStage < 0 || requirement.minStage > 5) {
          pushIssue(context, 'INVALID_RANGE', `${path}.minStage`, '血脉阶段必须是 0–5 的整数')
        }
      }
      break
    case 'item':
      if (checkId(context, requirement.itemId, `${path}.itemId`, '物品 ID')) {
        if (!context.index.catalog.has(requirement.itemId)) {
          missingReference(context, `${path}.itemId`, '物品', requirement.itemId)
        }
      }
      if (requirement.count !== undefined) {
        requirePositiveInteger(context, requirement.count, `${path}.count`, '物品数量')
      }
      break
    case 'technique':
      if (checkId(context, requirement.techniqueId, `${path}.techniqueId`, '功法 ID')) {
        if (!context.index.techniques.has(requirement.techniqueId)) {
          missingReference(context, `${path}.techniqueId`, '功法', requirement.techniqueId)
        }
      }
      break
    case 'petNotOwned':
      if (checkId(context, requirement.petId, `${path}.petId`, '灵宠 ID')) {
        if (!context.index.pets.has(requirement.petId)) {
          missingReference(context, `${path}.petId`, '灵宠', requirement.petId)
        }
      }
      break
    case 'mountNotOwned':
      if (checkId(context, requirement.mountId, `${path}.mountId`, '坐骑 ID')) {
        if (!context.index.mounts.has(requirement.mountId)) {
          missingReference(context, `${path}.mountId`, '坐骑', requirement.mountId)
        }
      }
      break
    case 'treasureNotOwned':
      if (checkId(context, requirement.treasureId, `${path}.treasureId`, '法宝 ID')) {
        if (!context.index.catalog.has(requirement.treasureId)) {
          missingReference(context, `${path}.treasureId`, '法宝', requirement.treasureId)
        }
      }
      break
    case 'partnerFavor':
      if (checkId(context, requirement.partnerId, `${path}.partnerId`, '道侣 ID')) {
        if (!context.index.partners.has(requirement.partnerId)) {
          missingReference(context, `${path}.partnerId`, '道侣', requirement.partnerId)
        }
      }
      if (requireNumber(context, requirement.minTier, `${path}.minTier`, '最低情谊层级')) {
        if (!Number.isInteger(requirement.minTier)) {
          pushIssue(context, 'INVALID_VALUE', `${path}.minTier`, '最低情谊层级必须是整数')
        }
      }
      break
    case 'all':
    case 'any':
      if (!requireArray<Requirement>(context, requirement.of, `${path}.of`, '组合条件')) break
      if (requirement.of.length === 0) {
        pushIssue(context, 'INVALID_VALUE', `${path}.of`, '组合条件不能为空')
        break
      }
      requirement.of.forEach((child, i) => {
        if (!child || typeof child !== 'object') {
          pushIssue(context, 'MISSING_FIELD', `${path}.of[${i}]`, '条件项必须是对象')
          return
        }
        checkRequirementReferences(context, child, `${path}.of[${i}]`)
      })
      break
    case 'not':
      if (!requirement.of || typeof requirement.of !== 'object') {
        pushIssue(context, 'MISSING_FIELD', `${path}.of`, '取反条件必须是对象')
        break
      }
      checkRequirementReferences(context, requirement.of, `${path}.of`)
      break
    default:
      pushIssue(
        context,
        'INVALID_ENUM',
        `${path}.kind`,
        `未知条件类型：${String((requirement as { kind?: unknown }).kind)}`,
      )
      break
  }
}

const EFFECT_KIND_SET = new Set<string>(EFFECT_KINDS)

export function validateRequirements(
  context: ValidationContext,
  requirements: Requirement[] | undefined,
  path: string,
): void {
  if (!requireArray<Requirement>(context, requirements, path, '条件列表')) return
  requirements.forEach((requirement, index) => {
    if (!requirement || typeof requirement !== 'object') {
      pushIssue(context, 'MISSING_FIELD', `${path}[${index}]`, '条件项必须是对象')
      return
    }
    checkRequirementReferences(context, requirement, `${path}[${index}]`)
  })
}

export function validateEffects(
  context: ValidationContext,
  effects: Effect[] | undefined,
  path: string,
): void {
  if (!requireArray<Effect>(context, effects, path, '效果列表')) return
  effects.forEach((effect, index) => {
    const effectPath = `${path}[${index}]`
    if (!effect || typeof effect !== 'object') {
      pushIssue(context, 'MISSING_FIELD', effectPath, '效果项必须是对象')
      return
    }
    if (!EFFECT_KIND_SET.has(effect.kind)) {
      pushIssue(context, 'INVALID_ENUM', `${effectPath}.kind`, `未知效果类型：${String(effect.kind)}`)
      return
    }
    checkEffectReferences(context, effect, effectPath)
  })
}

const COMBAT_STAT_KEYS = ['health', 'attack', 'defense', 'speed', 'crit', 'spirit'] as const

export function validateCombatStats(
  context: ValidationContext,
  stats: unknown,
  path: string,
  label: string,
): void {
  if (stats === undefined) return
  if (!isPlainRecord(stats)) {
    pushIssue(context, 'MISSING_FIELD', path, `${label}必须是对象`)
    return
  }
  for (const [key, value] of Object.entries(stats)) {
    if (!(COMBAT_STAT_KEYS as readonly string[]).includes(key)) {
      pushIssue(context, 'INVALID_ENUM', `${path}.${key}`, `${label}包含未知属性：${key}`)
      continue
    }
    requireNumber(context, value, `${path}.${key}`, `${label}.${key}`)
  }
}
