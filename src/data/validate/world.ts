import type {
  EraDefinition,
  FactionDefinition,
  RegionDefinition,
} from '@/types/content'
import {
  checkEffectReferences,
  checkId,
  checkRequirementReferences,
  pushIssue,
  requireArray,
  requireBoolean,
  requireEnum,
  requireNonEmptyString,
  requireNumber,
  requireRange,
  scanPlaceholders,
} from './context'
import type { ValidationContext } from './types'

const FACTION_ARCHETYPES = [
  'race',
  'teaching',
  'court',
  'dynasty',
  'local',
  'rogue',
] as const
const FACTION_STATUSES = ['dominant', 'active', 'declining', 'hidden', 'absent'] as const
const FACTION_STANDINGS = ['ally', 'neutral', 'rival', 'enemy'] as const
const REGION_KINDS = ['land', 'sea', 'volcano', 'cliff', 'abyss', 'wilds', 'mountain', 'palace'] as const
const TRANSITION_MODES = ['continue', 'reincarnate', 'stay'] as const

export function validateEras(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.eras.forEach((era: EraDefinition, index) => {
      const path = `pack:${pack.id}.eras[${index}]`
      checkId(context, era.id, `${path}.id`, '时代 ID')
      requireNonEmptyString(context, era.name, `${path}.name`, '时代名称')
      requireNonEmptyString(context, era.subtitle, `${path}.subtitle`, '时代副标题')
      requireNonEmptyString(context, era.summary, `${path}.summary`, '时代摘要')
      requireNumber(context, era.order, `${path}.order`, '时代顺序')
      if (
        requireNumber(context, era.startYear, `${path}.startYear`, '起始年') &&
        requireNumber(context, era.endYear, `${path}.endYear`, '结束年') &&
        era.endYear <= era.startYear
      ) {
        pushIssue(context, 'INVALID_RANGE', `${path}.endYear`, '结束年必须晚于起始年')
      }

      if (requireArray(context, era.phases, `${path}.phases`, '时代阶段')) {
        if (era.phases.length === 0) {
          pushIssue(context, 'MISSING_FIELD', `${path}.phases`, '时代至少需要一个阶段')
        }
        era.phases.forEach((phase, i) => {
          const phasePath = `${path}.phases[${i}]`
          checkId(context, phase.id, `${phasePath}.id`, '阶段 ID')
          requireNonEmptyString(context, phase.name, `${phasePath}.name`, '阶段名称')
          requireNumber(context, phase.order, `${phasePath}.order`, '阶段顺序')
          requireNonEmptyString(context, phase.summary, `${phasePath}.summary`, '阶段摘要')
          if (requireArray(context, phase.gateRequirements, `${phasePath}.gateRequirements`, '阶段门槛')) {
            phase.gateRequirements.forEach((requirement, j) => {
              checkRequirementReferences(context, requirement, `${phasePath}.gateRequirements[${j}]`)
            })
          }
        })
      }

      if (requireArray(context, era.factionRoster, `${path}.factionRoster`, '势力名录')) {
        if (era.factionRoster.length === 0) {
          pushIssue(context, 'MISSING_FIELD', `${path}.factionRoster`, '时代至少需要一个势力条目')
        }
        era.factionRoster.forEach((presence, i) => {
          const presencePath = `${path}.factionRoster[${i}]`
          if (!context.index.factions.has(presence.factionId)) {
            pushIssue(context, 'MISSING_REFERENCE', `${presencePath}.factionId`, `势力引用不存在：${presence.factionId}`)
          }
          requireEnum(context, presence.status, FACTION_STATUSES, `${presencePath}.status`, '势力状态')
          requireNonEmptyString(context, presence.note, `${presencePath}.note`, '势力备注')
        })
      }

      if (requireArray(context, era.regionIds, `${path}.regionIds`, '区域列表')) {
        if (era.regionIds.length === 0) {
          pushIssue(context, 'MISSING_FIELD', `${path}.regionIds`, '时代至少需要一个区域')
        }
        era.regionIds.forEach((regionId, i) => {
          if (!context.index.regions.has(regionId)) {
            pushIssue(context, 'MISSING_REFERENCE', `${path}.regionIds[${i}]`, `区域引用不存在：${regionId}`)
          }
        })
      }

      if (requireArray(context, era.eventIds, `${path}.eventIds`, '事件列表')) {
        era.eventIds.forEach((eventId, i) => {
          if (!context.index.events.has(eventId)) {
            pushIssue(context, 'MISSING_REFERENCE', `${path}.eventIds[${i}]`, `事件引用不存在：${eventId}`)
          }
        })
      }

      if (era.transition) {
        const transitionPath = `${path}.transition`
        requireNonEmptyString(context, era.transition.summary, `${transitionPath}.summary`, '劫末转世说明')
        if (era.transition.nextEraId && !context.index.eras.has(era.transition.nextEraId)) {
          pushIssue(
            context,
            'MISSING_REFERENCE',
            `${transitionPath}.nextEraId`,
            `下一时代引用不存在：${era.transition.nextEraId}`,
          )
        }
        if (requireArray(context, era.transition.modes, `${transitionPath}.modes`, '转世方式')) {
          if (era.transition.modes.length === 0) {
            pushIssue(context, 'MISSING_FIELD', `${transitionPath}.modes`, '劫末至少需要一种转世方式')
          }
          era.transition.modes.forEach((mode, i) => {
            requireEnum(context, mode, TRANSITION_MODES, `${transitionPath}.modes[${i}]`, '转世方式')
          })
        }
      } else {
        pushIssue(context, 'MISSING_FIELD', `${path}.transition`, '劫末转世定义缺失')
      }

      if (era.settlementRequirements !== undefined) {
        if (
          requireArray(
            context,
            era.settlementRequirements,
            `${path}.settlementRequirements`,
            '劫末门槛',
          )
        ) {
          era.settlementRequirements.forEach((requirement, i) => {
            checkRequirementReferences(
              context,
              requirement,
              `${path}.settlementRequirements[${i}]`,
            )
          })
        }
      }

      if (requireArray(context, era.settlement, `${path}.settlement`, '劫末结算')) {
        if (era.settlement.length === 0) {
          pushIssue(context, 'MISSING_FIELD', `${path}.settlement`, '至少需要一条劫末结算规则')
        }
        era.settlement.forEach((rule, i) => {
          const rulePath = `${path}.settlement[${i}]`
          checkId(context, rule.id, `${rulePath}.id`, '结算规则 ID')
          requireNonEmptyString(context, rule.label, `${rulePath}.label`, '结算规则名称')
          requireNonEmptyString(context, rule.description, `${rulePath}.description`, '结算规则说明')
          if (requireArray(context, rule.effects, `${rulePath}.effects`, '结算效果')) {
            rule.effects.forEach((effect, j) => {
              checkEffectReferences(context, effect, `${rulePath}.effects[${j}]`)
            })
          }
        })
      }

      scanPlaceholders(context, era, path)
    })
  }
}

export function validateFactions(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.factions.forEach((faction: FactionDefinition, index) => {
      const path = `pack:${pack.id}.factions[${index}]`
      checkId(context, faction.id, `${path}.id`, '势力 ID')
      requireNonEmptyString(context, faction.name, `${path}.name`, '势力名称')
      requireEnum(context, faction.archetype, FACTION_ARCHETYPES, `${path}.archetype`, '势力类型')
      requireBoolean(context, faction.joinable, `${path}.joinable`, '是否可加入')
      requireNonEmptyString(context, faction.description, `${path}.description`, '势力说明')

      if (faction.eraPresence && typeof faction.eraPresence === 'object') {
        for (const eraId of Object.keys(faction.eraPresence)) {
          if (!context.index.eras.has(eraId)) {
            pushIssue(context, 'MISSING_REFERENCE', `${path}.eraPresence.${eraId}`, `时代引用不存在：${eraId}`)
          }
        }
        for (const era of context.index.eras.values()) {
          const status = faction.eraPresence[era.id]
          if (!status) {
            pushIssue(
              context,
              'CROSS_ERA_FATE_MISSING',
              `${path}.eraPresence.${era.id}`,
              `势力在 ${era.id} 没有下落，必须填写涵盖该时代的 status`,
            )
          } else {
            requireEnum(context, status, FACTION_STATUSES, `${path}.eraPresence.${era.id}`, '势力时代状态')
          }
        }
      } else {
        pushIssue(context, 'MISSING_FIELD', `${path}.eraPresence`, '势力时代下落缺失')
      }

      if (faction.joinable) {
        if (!faction.join) {
          pushIssue(context, 'FACTION_JOIN_MISSING', `${path}.join`, '可加入势力缺少入门规则')
        } else {
          const joinPath = `${path}.join`
          requireNonEmptyString(context, faction.join.description, `${joinPath}.description`, '入门说明')
          if (requireArray(context, faction.join.requirements, `${joinPath}.requirements`, '入门条件')) {
            faction.join.requirements.forEach((requirement, i) => {
              checkRequirementReferences(context, requirement, `${joinPath}.requirements[${i}]`)
            })
          }
          if (faction.join.entryEventId && !context.index.events.has(faction.join.entryEventId)) {
            pushIssue(
              context,
              'MISSING_REFERENCE',
              `${joinPath}.entryEventId`,
              `入门事件引用不存在：${faction.join.entryEventId}`,
            )
          }
        }

        if (!faction.exit) {
          pushIssue(context, 'FACTION_EXIT_MISSING', `${path}.exit`, '可加入势力缺少退出规则')
        } else {
          const exitPath = `${path}.exit`
          requireBoolean(context, faction.exit.allowed, `${exitPath}.allowed`, '是否允许退出')
          requireNonEmptyString(context, faction.exit.consequence, `${exitPath}.consequence`, '退出代价')
          if (requireArray(context, faction.exit.requirements, `${exitPath}.requirements`, '退出条件')) {
            faction.exit.requirements.forEach((requirement, i) => {
              checkRequirementReferences(context, requirement, `${exitPath}.requirements[${i}]`)
            })
          }
        }

        if (requireArray(context, faction.ranks, `${path}.ranks`, '职位列表')) {
          if (faction.ranks.length < 2) {
            pushIssue(context, 'FACTION_PROMOTION_MISSING', `${path}.ranks`, '可加入势力至少需要两个职位与晋升试炼')
          }
          faction.ranks.forEach((rank, i) => {
            const rankPath = `${path}.ranks[${i}]`
            checkId(context, rank.id, `${rankPath}.id`, '职位 ID')
            requireNonEmptyString(context, rank.title, `${rankPath}.title`, '职位名称')
            requireNumber(context, rank.order, `${rankPath}.order`, '职位顺序')
            if (!requireNonEmptyString(context, rank.trial, `${rankPath}.trial`, '晋升试炼')) {
              pushIssue(context, 'FACTION_PROMOTION_MISSING', `${rankPath}.trial`, '晋升缺少试炼内容')
            }
            if (rank.trialEventId && !context.index.events.has(rank.trialEventId)) {
              pushIssue(context, 'MISSING_REFERENCE', `${rankPath}.trialEventId`, `试炼事件引用不存在：${rank.trialEventId}`)
            }
            if (requireArray(context, rank.requirements, `${rankPath}.requirements`, '晋升条件')) {
              rank.requirements.forEach((requirement, j) => {
                checkRequirementReferences(context, requirement, `${rankPath}.requirements[${j}]`)
              })
            }
          })
        }
      }

      if (requireArray(context, faction.eventIds, `${path}.eventIds`, '势力事件')) {
        faction.eventIds.forEach((eventId, i) => {
          if (!context.index.events.has(eventId)) {
            pushIssue(context, 'MISSING_REFERENCE', `${path}.eventIds[${i}]`, `事件引用不存在：${eventId}`)
          }
        })
      }

      if (requireArray(context, faction.relations, `${path}.relations`, '势力关系')) {
        faction.relations.forEach((relation, i) => {
          const relationPath = `${path}.relations[${i}]`
          if (!context.index.factions.has(relation.factionId)) {
            pushIssue(context, 'MISSING_REFERENCE', `${relationPath}.factionId`, `势力引用不存在：${relation.factionId}`)
          }
          requireEnum(context, relation.standing, FACTION_STANDINGS, `${relationPath}.standing`, '势力关系')
          requireNonEmptyString(context, relation.note, `${relationPath}.note`, '势力关系备注')
        })
      }

      scanPlaceholders(context, faction, path)
    })
  }
}

export function validateRegions(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.regions.forEach((region: RegionDefinition, index) => {
      const path = `pack:${pack.id}.regions[${index}]`
      checkId(context, region.id, `${path}.id`, '区域 ID')
      requireNonEmptyString(context, region.name, `${path}.name`, '区域名称')
      requireEnum(context, region.kind, REGION_KINDS, `${path}.kind`, '区域类型')
      requireNonEmptyString(context, region.description, `${path}.description`, '区域说明')
      requireBoolean(context, region.hidden, `${path}.hidden`, '区域是否隐藏')
      requireRange(context, region.danger, 1, 5, `${path}.danger`, '区域危险度')

      if (requireArray(context, region.neighbors, `${path}.neighbors`, '相邻区域')) {
        if (region.neighbors.length === 0) {
          pushIssue(context, 'MISSING_FIELD', `${path}.neighbors`, '区域至少需要一条潮路')
        }
        region.neighbors.forEach((neighborId, i) => {
          if (neighborId === region.id) {
            pushIssue(context, 'INVALID_VALUE', `${path}.neighbors[${i}]`, '区域不能以自己为邻')
            return
          }
          if (!context.index.regions.has(neighborId)) {
            pushIssue(
              context,
              'MISSING_REFERENCE',
              `${path}.neighbors[${i}]`,
              `相邻区域引用不存在：${neighborId}`,
            )
          }
        })
      }

      if (region.unlockRequirements !== undefined) {
        if (requireArray(context, region.unlockRequirements, `${path}.unlockRequirements`, '区域解锁条件')) {
          region.unlockRequirements.forEach((requirement, i) => {
            checkRequirementReferences(context, requirement, `${path}.unlockRequirements[${i}]`)
          })
        }
      }

      if (requireArray(context, region.eraIds, `${path}.eraIds`, '所属时代')) {
        if (region.eraIds.length === 0) {
          pushIssue(context, 'MISSING_FIELD', `${path}.eraIds`, '区域至少属于一个时代')
        }
        region.eraIds.forEach((eraId, i) => {
          if (!context.index.eras.has(eraId)) {
            pushIssue(context, 'MISSING_REFERENCE', `${path}.eraIds[${i}]`, `时代引用不存在：${eraId}`)
          }
        })
      }

      if (requireArray(context, region.sites, `${path}.sites`, '地点列表')) {
        if (region.sites.length === 0) {
          pushIssue(context, 'MISSING_FIELD', `${path}.sites`, '区域至少需要一个地点')
        }
        region.sites.forEach((site, i) => {
          const sitePath = `${path}.sites[${i}]`
          checkId(context, site.id, `${sitePath}.id`, '地点 ID')
          requireNonEmptyString(context, site.name, `${sitePath}.name`, '地点名称')
          requireNonEmptyString(context, site.description, `${sitePath}.description`, '地点说明')
          requireBoolean(context, site.hidden, `${sitePath}.hidden`, '地点是否隐藏')
          if (requireArray(context, site.unlockRequirements, `${sitePath}.unlockRequirements`, '地点解锁条件')) {
            site.unlockRequirements.forEach((requirement, j) => {
              checkRequirementReferences(context, requirement, `${sitePath}.unlockRequirements[${j}]`)
            })
          }
        })
      }

      if (requireArray(context, region.factionPresence, `${path}.factionPresence`, '区域势力')) {
        region.factionPresence.forEach((factionId, i) => {
          if (!context.index.factions.has(factionId)) {
            pushIssue(context, 'MISSING_REFERENCE', `${path}.factionPresence[${i}]`, `势力引用不存在：${factionId}`)
          }
        })
      }

      if (region.encounterIds !== undefined) {
        if (requireArray(context, region.encounterIds, `${path}.encounterIds`, '区域遭遇')) {
          region.encounterIds.forEach((encounterId, i) => {
            if (!context.index.encounters.has(encounterId)) {
              pushIssue(
                context,
                'MISSING_REFERENCE',
                `${path}.encounterIds[${i}]`,
                `战斗遭遇引用不存在：${encounterId}`,
              )
            }
          })
        }
      }

      scanPlaceholders(context, region, path)
    })
  }
}
