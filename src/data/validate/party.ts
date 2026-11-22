import type { CaveDefinition, PartnerDefinition } from '@/types/content'
import {
  checkId,
  pushIssue,
  requireArray,
  requireEnum,
  requireNonEmptyString,
  requireNumber,
  requireRange,
  RESOURCE_KEYS,
  scanPlaceholders,
  validateEffects,
  validateRequirements,
} from './context'
import type { ValidationContext } from './types'

const PARTNER_ROLES = ['companion', 'guardian', 'scout', 'teacher'] as const
const DISCIPLE_ASSIGNMENTS = ['study', 'gather', 'guard', 'craft', 'tend'] as const
const CHAIN_EFFECT_KINDS = [
  'changeResource',
  'gainCultivation',
  'applyStatus',
  'grantItem',
] as const

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function validateResourceCost(
  context: ValidationContext,
  cost: unknown,
  path: string,
): void {
  if (cost === undefined) return
  if (!isPlainRecord(cost)) {
    pushIssue(context, 'MISSING_FIELD', path, '资源消耗必须是对象')
    return
  }
  for (const [key, amount] of Object.entries(cost)) {
    if (!(RESOURCE_KEYS as readonly string[]).includes(key)) {
      pushIssue(context, 'INVALID_ENUM', `${path}.${key}`, `未知资源类型：${key}`)
      continue
    }
    if (requireNumber(context, amount, `${path}.${key}`, '资源消耗量')) {
      if (amount < 0) {
        pushIssue(context, 'INVALID_RANGE', `${path}.${key}`, '资源消耗量不能为负')
      }
    }
  }
}

export function validatePartners(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.partners.forEach((partner: PartnerDefinition, index) => {
      const path = `pack:${pack.id}.partners[${index}]`
      checkId(context, partner.id, `${path}.id`, '道侣 ID')
      requireNonEmptyString(context, partner.name, `${path}.name`, '道侣名称')
      requireNonEmptyString(context, partner.description, `${path}.description`, '道侣说明')
      requireEnum(context, partner.role, PARTNER_ROLES, `${path}.role`, '道侣岗位')

      if (partner.factionId && !context.index.factions.has(partner.factionId)) {
        pushIssue(context, 'MISSING_REFERENCE', `${path}.factionId`, `势力引用不存在：${partner.factionId}`)
      }

      if (partner.eraFates && typeof partner.eraFates === 'object') {
        for (const eraId of Object.keys(partner.eraFates)) {
          if (!context.index.eras.has(eraId)) {
            pushIssue(context, 'MISSING_REFERENCE', `${path}.eraFates.${eraId}`, `时代引用不存在：${eraId}`)
          }
        }
        for (const era of context.index.eras.values()) {
          const fate = partner.eraFates[era.id]
          if (!fate) {
            pushIssue(
              context,
              'CROSS_ERA_FATE_MISSING',
              `${path}.eraFates.${era.id}`,
              `道侣在 ${era.id} 没有下落，必须填写跨劫去向`,
            )
          } else {
            requireNonEmptyString(context, fate, `${path}.eraFates.${era.id}`, '道侣跨劫下落')
          }
        }
      } else {
        pushIssue(context, 'MISSING_FIELD', `${path}.eraFates`, '道侣跨劫下落缺失')
      }

      if (!partner.bond) {
        pushIssue(context, 'PARTNER_BOND_MISSING', `${path}.bond`, '道侣缺少结缘规则')
      } else {
        const bondPath = `${path}.bond`
        requireNonEmptyString(context, partner.bond.description, `${bondPath}.description`, '结缘说明')
        if (requireArray(context, partner.bond.requirements, `${bondPath}.requirements`, '结缘条件')) {
          if (partner.bond.requirements.length === 0) {
            pushIssue(context, 'PARTNER_BOND_MISSING', `${bondPath}.requirements`, '结缘至少需要一个条件')
          }
          validateRequirements(context, partner.bond.requirements, `${bondPath}.requirements`)
        }
        if (partner.bond.eventId && !context.index.events.has(partner.bond.eventId)) {
          pushIssue(context, 'MISSING_REFERENCE', `${bondPath}.eventId`, `结缘事件引用不存在：${partner.bond.eventId}`)
        }
      }

      if (requireArray(context, partner.postBondEventIds, `${path}.postBondEventIds`, '结缘后事件')) {
        if (partner.postBondEventIds.length === 0) {
          pushIssue(
            context,
            'PARTNER_POST_BOND_MISSING',
            `${path}.postBondEventIds`,
            '道侣至少需要一条结缘后内容',
          )
        }
        partner.postBondEventIds.forEach((eventId, i) => {
          if (!context.index.events.has(eventId)) {
            pushIssue(
              context,
              'MISSING_REFERENCE',
              `${path}.postBondEventIds[${i}]`,
              `结缘后事件引用不存在：${eventId}`,
            )
          }
        })
      }

      if (partner.publicEventIds) {
        partner.publicEventIds.forEach((eventId, i) => {
          if (!context.index.events.has(eventId)) {
            pushIssue(
              context,
              'MISSING_REFERENCE',
              `${path}.publicEventIds[${i}]`,
              `公共关系事件引用不存在：${eventId}`,
            )
          }
        })
      }

      scanPlaceholders(context, partner, path)
    })
  }
}

export function validateCaves(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.caves.forEach((cave: CaveDefinition, index) => {
      const path = `pack:${pack.id}.caves[${index}]`
      checkId(context, cave.id, `${path}.id`, '洞府 ID')
      requireNonEmptyString(context, cave.name, `${path}.name`, '洞府名称')
      requireNonEmptyString(context, cave.description, `${path}.description`, '洞府说明')

      const verbIds = new Set<string>()
      if (requireArray(context, cave.buildings, `${path}.buildings`, '洞府建筑')) {
        if (cave.buildings.length !== 8) {
          pushIssue(
            context,
            'MISSING_FIELD',
            `${path}.buildings`,
            'v1 洞府必须有 8 栋建筑',
          )
        }
        cave.buildings.forEach((building, i) => {
          const buildingPath = `${path}.buildings[${i}]`
          checkId(context, building.id, `${buildingPath}.id`, '建筑 ID')
          requireNonEmptyString(context, building.name, `${buildingPath}.name`, '建筑名称')
          requireNonEmptyString(context, building.description, `${buildingPath}.description`, '建筑说明')

          if (requireArray(context, building.levels, `${buildingPath}.levels`, '建筑等级')) {
            if (building.levels.length !== 3) {
              pushIssue(
                context,
                'MISSING_FIELD',
                `${buildingPath}.levels`,
                'v1 建筑必须有 1–3 级，每级解锁一个动词',
              )
            }
            building.levels.forEach((level, j) => {
              const levelPath = `${buildingPath}.levels[${j}]`
              requireRange(context, level.level, 1, 3, `${levelPath}.level`, '建筑等级')
              requireNonEmptyString(context, level.name, `${levelPath}.name`, '建筑等级名称')
              requireNonEmptyString(context, level.description, `${levelPath}.description`, '建筑等级说明')
              validateResourceCost(context, level.cost, `${levelPath}.cost`)
              if (requireArray(context, level.verbs, `${levelPath}.verbs`, '建筑动词')) {
                if (level.verbs.length === 0) {
                  pushIssue(
                    context,
                    'BUILDING_VERB_MISSING',
                    `${levelPath}.verbs`,
                    '建筑升级必须解锁至少一个动词',
                  )
                }
                level.verbs.forEach((verb, k) => {
                  requireNonEmptyString(context, verb, `${levelPath}.verbs[${k}]`, '建筑动词')
                })
              }
              if (!level.verb) {
                pushIssue(
                  context,
                  'BUILDING_VERB_MISSING',
                  `${levelPath}.verb`,
                  '建筑等级缺少可执行的动词定义',
                )
              } else {
                const verbPath = `${levelPath}.verb`
                if (checkId(context, level.verb.id, `${verbPath}.id`, '建筑动词 ID')) {
                  if (verbIds.has(level.verb.id)) {
                    pushIssue(
                      context,
                      'DUPLICATE_ID',
                      `${verbPath}.id`,
                      `建筑动词 ID 重复：${level.verb.id}`,
                    )
                  }
                  verbIds.add(level.verb.id)
                }
                requireNonEmptyString(context, level.verb.name, `${verbPath}.name`, '建筑动词名称')
                requireNonEmptyString(
                  context,
                  level.verb.description,
                  `${verbPath}.description`,
                  '建筑动词说明',
                )
                if (
                  Array.isArray(level.verbs) &&
                  level.verb.name &&
                  !level.verbs.includes(level.verb.name)
                ) {
                  pushIssue(
                    context,
                    'INVALID_VALUE',
                    `${verbPath}.name`,
                    '动词名称必须出现在同级的 verbs 列表中',
                  )
                }
                validateResourceCost(context, level.verb.cost, `${verbPath}.cost`)
                if (
                  requireNumber(
                    context,
                    level.verb.cooldownMonths,
                    `${verbPath}.cooldownMonths`,
                    '动词冷却月数',
                  )
                ) {
                  if (
                    level.verb.cooldownMonths < 1 ||
                    !Number.isInteger(level.verb.cooldownMonths)
                  ) {
                    pushIssue(
                      context,
                      'INVALID_RANGE',
                      `${verbPath}.cooldownMonths`,
                      '动词冷却月数必须是正整数',
                    )
                  }
                }
                validateEffects(context, level.verb.effects, `${verbPath}.effects`)
              }
              validateEffects(context, level.effects, `${levelPath}.effects`)
            })
          }
        })
      }

      if (requireArray(context, cave.chains, `${path}.chains`, '洞府生产链')) {
        if (cave.chains.length !== 3) {
          pushIssue(
            context,
            'MISSING_FIELD',
            `${path}.chains`,
            'v1 洞府必须有 3 条长期生产链',
          )
        }
        const chainIds = new Set<string>()
        const buildingIds = new Set(
          Array.isArray(cave.buildings)
            ? cave.buildings.map((building) => building.id)
            : [],
        )
        cave.chains.forEach((chain, i) => {
          const chainPath = `${path}.chains[${i}]`
          if (checkId(context, chain.id, `${chainPath}.id`, '生产链 ID')) {
            if (chainIds.has(chain.id)) {
              pushIssue(
                context,
                'DUPLICATE_ID',
                `${chainPath}.id`,
                `生产链 ID 重复：${chain.id}`,
              )
            }
            chainIds.add(chain.id)
          }
          requireNonEmptyString(context, chain.name, `${chainPath}.name`, '生产链名称')
          requireNonEmptyString(
            context,
            chain.description,
            `${chainPath}.description`,
            '生产链说明',
          )

          if (
            requireArray(
              context,
              chain.buildingIds,
              `${chainPath}.buildingIds`,
              '生产链建筑',
            )
          ) {
            if (chain.buildingIds.length !== 2) {
              pushIssue(
                context,
                'INVALID_VALUE',
                `${chainPath}.buildingIds`,
                '一条生产链必须由两栋建筑组成',
              )
            }
            chain.buildingIds.forEach((buildingId, j) => {
              const buildingPath = `${chainPath}.buildingIds[${j}]`
              if (!buildingIds.has(buildingId)) {
                pushIssue(
                  context,
                  'MISSING_REFERENCE',
                  buildingPath,
                  `生产链引用了不存在的建筑：${buildingId}`,
                )
              }
            })
          }

          if (
            requireArray(
              context,
              chain.assignments,
              `${chainPath}.assignments`,
              '生产链差事',
            )
          ) {
            if (chain.assignments.length === 0) {
              pushIssue(
                context,
                'MISSING_FIELD',
                `${chainPath}.assignments`,
                '生产链至少需要一种加成差事',
              )
            }
            chain.assignments.forEach((assignment, j) => {
              requireEnum(
                context,
                assignment,
                DISCIPLE_ASSIGNMENTS,
                `${chainPath}.assignments[${j}]`,
                '差事类型',
              )
            })
          }

          if (
            requireNumber(
              context,
              chain.tidePerMonth,
              `${chainPath}.tidePerMonth`,
              '每月潮息消耗',
            ) &&
            chain.tidePerMonth <= 0
          ) {
            pushIssue(
              context,
              'INVALID_RANGE',
              `${chainPath}.tidePerMonth`,
              '每月潮息消耗必须大于 0',
            )
          }
          if (
            requireNumber(
              context,
              chain.intervalMonths,
              `${chainPath}.intervalMonths`,
              '生产周期',
            )
          ) {
            if (
              chain.intervalMonths < 1 ||
              !Number.isInteger(chain.intervalMonths)
            ) {
              pushIssue(
                context,
                'INVALID_RANGE',
                `${chainPath}.intervalMonths`,
                '生产周期必须是正整数月',
              )
            }
          }
          validateResourceCost(context, chain.inputs, `${chainPath}.inputs`)
          if (requireArray(context, chain.outputs, `${chainPath}.outputs`, '生产链产出')) {
            if (chain.outputs.length === 0) {
              pushIssue(
                context,
                'MISSING_FIELD',
                `${chainPath}.outputs`,
                '生产链至少需要一项产出',
              )
            }
            chain.outputs.forEach((effect, j) => {
              if (
                isPlainRecord(effect) &&
                !(CHAIN_EFFECT_KINDS as readonly string[]).includes(
                  String(effect.kind),
                )
              ) {
                pushIssue(
                  context,
                  'INVALID_VALUE',
                  `${chainPath}.outputs[${j}].kind`,
                  '生产链产出只支持资源、修为、状态与物品',
                )
              }
            })
            validateEffects(context, chain.outputs, `${chainPath}.outputs`)
          }
          requireRange(
            context,
            chain.purityPerMonth,
            -1,
            1,
            `${chainPath}.purityPerMonth`,
            '运转灵脉影响',
          )
        })
      }

      if (cave.spiritVein) {
        const veinPath = `${path}.spiritVein`
        requireNonEmptyString(context, cave.spiritVein.name, `${veinPath}.name`, '灵脉名称')
        requireNonEmptyString(context, cave.spiritVein.description, `${veinPath}.description`, '灵脉说明')
        if (requireArray(context, cave.spiritVein.attributes, `${veinPath}.attributes`, '灵脉属性')) {
          if (cave.spiritVein.attributes.length === 0) {
            pushIssue(context, 'MISSING_FIELD', `${veinPath}.attributes`, '灵脉至少需要一个属性')
          }
          cave.spiritVein.attributes.forEach((attribute, i) => {
            requireNonEmptyString(context, attribute, `${veinPath}.attributes[${i}]`, '灵脉属性')
          })
        }
        if (requireArray(context, cave.spiritVein.levels, `${veinPath}.levels`, '灵脉等级')) {
          if (cave.spiritVein.levels.length !== 5) {
            pushIssue(context, 'MISSING_FIELD', `${veinPath}.levels`, '灵脉必须有 1–5 级')
          }
          cave.spiritVein.levels.forEach((level, i) => {
            const levelPath = `${veinPath}.levels[${i}]`
            requireRange(context, level.level, 1, 5, `${levelPath}.level`, '灵脉等级')
            if (level.level !== i + 1) {
              pushIssue(
                context,
                'INVALID_RANGE',
                `${levelPath}.level`,
                '灵脉等级必须从 1 到 5 连续排列',
              )
            }
            requireNonEmptyString(context, level.name, `${levelPath}.name`, '灵脉等级名称')
            requireNonEmptyString(context, level.description, `${levelPath}.description`, '灵脉等级说明')
            validateResourceCost(context, level.cost, `${levelPath}.cost`)
            validateEffects(context, level.effects, `${levelPath}.effects`)
          })
        }
      } else {
        pushIssue(context, 'MISSING_FIELD', `${path}.spiritVein`, '洞府缺少灵脉')
      }

      if (requireArray(context, cave.disciples, `${path}.disciples`, '道童列表')) {
        if (cave.disciples.length < 3) {
          pushIssue(context, 'MISSING_FIELD', `${path}.disciples`, '洞府至少需要三位可收留的道童')
        }
        const discipleIds = new Set<string>()
        cave.disciples.forEach((disciple, i) => {
          const disciplePath = `${path}.disciples[${i}]`
          if (checkId(context, disciple.id, `${disciplePath}.id`, '道童 ID')) {
            if (discipleIds.has(disciple.id)) {
              pushIssue(context, 'DUPLICATE_ID', `${disciplePath}.id`, `道童 ID 重复：${disciple.id}`)
            }
            discipleIds.add(disciple.id)
          }
          requireNonEmptyString(context, disciple.name, `${disciplePath}.name`, '道童名称')
          requireNonEmptyString(context, disciple.title, `${disciplePath}.title`, '道童称谓')
          requireNonEmptyString(context, disciple.description, `${disciplePath}.description`, '道童说明')
          requireNonEmptyString(context, disciple.temperament, `${disciplePath}.temperament`, '道童性情')
          requireNonEmptyString(context, disciple.bondNote, `${disciplePath}.bondNote`, '道童相处记述')
          requireEnum(
            context,
            disciple.aptitude,
            DISCIPLE_ASSIGNMENTS,
            `${disciplePath}.aptitude`,
            '道童擅长差事',
          )
          validateRequirements(context, disciple.requirements, `${disciplePath}.requirements`)
          validateResourceCost(context, disciple.recruitCost, `${disciplePath}.recruitCost`)
          if (requireArray(context, disciple.trustLines, `${disciplePath}.trustLines`, '道童信任语')) {
            if (disciple.trustLines.length < 3) {
              pushIssue(context, 'MISSING_FIELD', `${disciplePath}.trustLines`, '道童至少需要三段信任语')
            }
            disciple.trustLines.forEach((line, j) => {
              requireNonEmptyString(context, line, `${disciplePath}.trustLines[${j}]`, '道童信任语')
            })
          }
        })
      }

      if (requireArray(context, cave.raids, `${path}.raids`, '洞府袭击')) {
        if (cave.raids.length < 3) {
          pushIssue(context, 'MISSING_FIELD', `${path}.raids`, '洞府至少需要三种来袭')
        }
        const raidIds = new Set<string>()
        cave.raids.forEach((raid, i) => {
          const raidPath = `${path}.raids[${i}]`
          if (checkId(context, raid.id, `${raidPath}.id`, '袭击 ID')) {
            if (raidIds.has(raid.id)) {
              pushIssue(context, 'DUPLICATE_ID', `${raidPath}.id`, `袭击 ID 重复：${raid.id}`)
            }
            raidIds.add(raid.id)
          }
          requireNonEmptyString(context, raid.name, `${raidPath}.name`, '袭击名称')
          requireNonEmptyString(context, raid.description, `${raidPath}.description`, '袭击说明')
          requireNonEmptyString(context, raid.warning, `${raidPath}.warning`, '袭击预兆')
          if (checkId(context, raid.encounterId, `${raidPath}.encounterId`, '战斗遭遇 ID')) {
            if (!context.index.encounters.has(raid.encounterId)) {
              pushIssue(
                context,
                'MISSING_REFERENCE',
                `${raidPath}.encounterId`,
                `袭击引用的战斗遭遇不存在：${raid.encounterId}`,
              )
            }
          }
          requireRange(context, raid.minVeinLevel, 1, 5, `${raidPath}.minVeinLevel`, '最低灵脉等级')
          if (requireNumber(context, raid.warningMonths, `${raidPath}.warningMonths`, '预警月数')) {
            if (raid.warningMonths < 1 || !Number.isInteger(raid.warningMonths)) {
              pushIssue(context, 'INVALID_RANGE', `${raidPath}.warningMonths`, '预警月数必须是正整数')
            }
          }
          if (requireNumber(context, raid.weight, `${raidPath}.weight`, '袭击权重')) {
            if (raid.weight <= 0) {
              pushIssue(context, 'INVALID_RANGE', `${raidPath}.weight`, '袭击权重必须大于 0')
            }
          }
          if (raid.veinDamage !== undefined) {
            requireRange(context, raid.veinDamage, 0, 5, `${raidPath}.veinDamage`, '灵脉损伤')
          }
          validateEffects(context, raid.ignoredEffects, `${raidPath}.ignoredEffects`)
        })
      }

      if (requireArray(context, cave.visitors, `${path}.visitors`, '洞府访客')) {
        if (cave.visitors.length < 3) {
          pushIssue(context, 'MISSING_FIELD', `${path}.visitors`, '洞府至少需要三位访客')
        }
        const visitorIds = new Set<string>()
        const choiceIds = new Set<string>()
        cave.visitors.forEach((visitor, i) => {
          const visitorPath = `${path}.visitors[${i}]`
          if (checkId(context, visitor.id, `${visitorPath}.id`, '访客 ID')) {
            if (visitorIds.has(visitor.id)) {
              pushIssue(context, 'DUPLICATE_ID', `${visitorPath}.id`, `访客 ID 重复：${visitor.id}`)
            }
            visitorIds.add(visitor.id)
          }
          requireNonEmptyString(context, visitor.name, `${visitorPath}.name`, '访客名称')
          requireNonEmptyString(context, visitor.title, `${visitorPath}.title`, '访客称谓')
          requireNonEmptyString(context, visitor.description, `${visitorPath}.description`, '访客说明')
          requireNonEmptyString(context, visitor.greeting, `${visitorPath}.greeting`, '访客开场')
          validateRequirements(context, visitor.requirements, `${visitorPath}.requirements`)
          if (requireNumber(context, visitor.weight, `${visitorPath}.weight`, '访客权重')) {
            if (visitor.weight <= 0) {
              pushIssue(context, 'INVALID_RANGE', `${visitorPath}.weight`, '访客权重必须大于 0')
            }
          }
          if (requireArray(context, visitor.choices, `${visitorPath}.choices`, '访客选项')) {
            if (visitor.choices.length < 2) {
              pushIssue(context, 'MISSING_FIELD', `${visitorPath}.choices`, '访客至少需要两个选项')
            }
            visitor.choices.forEach((choice, j) => {
              const choicePath = `${visitorPath}.choices[${j}]`
              if (checkId(context, choice.id, `${choicePath}.id`, '访客选项 ID')) {
                if (choiceIds.has(choice.id)) {
                  pushIssue(context, 'DUPLICATE_ID', `${choicePath}.id`, `访客选项 ID 重复：${choice.id}`)
                }
                choiceIds.add(choice.id)
              }
              requireNonEmptyString(context, choice.label, `${choicePath}.label`, '访客选项标题')
              requireNonEmptyString(
                context,
                choice.description,
                `${choicePath}.description`,
                '访客选项说明',
              )
              validateRequirements(context, choice.requirements, `${choicePath}.requirements`)
              validateResourceCost(context, choice.cost, `${choicePath}.cost`)
              validateEffects(context, choice.effects, `${choicePath}.effects`)
            })
          }
        })
      }

      scanPlaceholders(context, cave, path)
    })
  }
}
