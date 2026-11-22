import type { DaoClusterDefinition, DaoNodeDefinition, DaoPrincipleDefinition } from '@/types/dao'
import {
  checkId,
  pushIssue,
  requireArray,
  requireNonEmptyString,
  requireNumber,
  requirePositiveInteger,
  scanPlaceholders,
} from './context'
import type { ValidationContext } from './types'

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function validateNumbers(
  context: ValidationContext,
  value: unknown,
  path: string,
  label: string,
): void {
  if (value === undefined) return
  if (!isPlainRecord(value)) {
    pushIssue(context, 'MISSING_FIELD', path, `${label}必须是对象`)
    return
  }
  for (const [key, amount] of Object.entries(value)) {
    requireNumber(context, amount, `${path}.${key}`, `${label}.${key}`)
  }
}

function validateRules(
  context: ValidationContext,
  rules: unknown,
  path: string,
  label: string,
): void {
  if (!requireArray<{ label?: unknown; detail?: unknown }>(context, rules, path, label)) return
  if (rules.length === 0) {
    pushIssue(context, 'MISSING_FIELD', path, `${label}不能为空`)
    return
  }
  rules.forEach((rule, index) => {
    requireNonEmptyString(context, rule?.label, `${path}[${index}].label`, '道途词条名称')
    requireNonEmptyString(context, rule?.detail, `${path}[${index}].detail`, '道途词条说明')
  })
}

function validateCluster(
  context: ValidationContext,
  cluster: DaoClusterDefinition,
  path: string,
): void {
  checkId(context, cluster.id, `${path}.id`, '道途簇 ID')
  requireNonEmptyString(context, cluster.name, `${path}.name`, '道途簇名称')
  requireNonEmptyString(context, cluster.subtitle, `${path}.subtitle`, '道途簇副题')
  requireNonEmptyString(context, cluster.glyph, `${path}.glyph`, '道途簇星号')
  requireNonEmptyString(context, cluster.description, `${path}.description`, '道途簇说明')
  if (!requireArray<string>(context, cluster.nodeIds, `${path}.nodeIds`, '道途簇星位')) return
  if (cluster.nodeIds.length === 0) {
    pushIssue(context, 'MISSING_FIELD', `${path}.nodeIds`, '道途簇至少要有一颗星')
  }
  const seen = new Set<string>()
  cluster.nodeIds.forEach((nodeId, index) => {
    if (seen.has(nodeId)) {
      pushIssue(context, 'DUPLICATE_ID', `${path}.nodeIds[${index}]`, `道途簇内星位重复：${nodeId}`)
    }
    seen.add(nodeId)
    const node = context.index.daoNodes.get(nodeId)
    if (!node) {
      pushIssue(context, 'MISSING_REFERENCE', `${path}.nodeIds[${index}]`, `星位引用不存在：${nodeId}`)
    } else if (node.clusterId !== cluster.id) {
      pushIssue(
        context,
        'MISSING_REFERENCE',
        `${path}.nodeIds[${index}]`,
        `星位 ${nodeId} 属于 ${node.clusterId}，不属于 ${cluster.id}`,
      )
    }
  })
  scanPlaceholders(context, cluster, path)
}

function validateNode(
  context: ValidationContext,
  node: DaoNodeDefinition,
  path: string,
): void {
  checkId(context, node.id, `${path}.id`, '星位 ID')
  requireNonEmptyString(context, node.name, `${path}.name`, '星位名称')
  requireNonEmptyString(context, node.epithet, `${path}.epithet`, '星位题记')
  requireNonEmptyString(context, node.description, `${path}.description`, '星位说明')
  if (checkId(context, node.clusterId, `${path}.clusterId`, '道途簇 ID')) {
    const cluster = context.index.daoClusters.get(node.clusterId)
    if (!cluster) {
      pushIssue(context, 'MISSING_REFERENCE', `${path}.clusterId`, `道途簇引用不存在：${node.clusterId}`)
    } else if (!cluster.nodeIds.includes(node.id)) {
      pushIssue(
        context,
        'MISSING_REFERENCE',
        `${path}.clusterId`,
        `星位 ${node.id} 未列入道途簇 ${node.clusterId} 的星位表`,
      )
    }
  }
  if (requirePositiveInteger(context, node.cost, `${path}.cost`, '星痕消耗')) {
    if (node.cost > 3) {
      pushIssue(context, 'INVALID_RANGE', `${path}.cost`, '单枚星位消耗不应超过 3 点星痕')
    }
  }
  if (node.requires !== undefined) {
    if (checkId(context, node.requires, `${path}.requires`, '前置星位')) {
      const required = context.index.daoNodes.get(node.requires)
      if (!required) {
        pushIssue(context, 'MISSING_REFERENCE', `${path}.requires`, `前置星位不存在：${node.requires}`)
      } else if (required.id === node.id) {
        pushIssue(context, 'INVALID_VALUE', `${path}.requires`, '星位不能以自身为前置')
      } else if (required.clusterId !== node.clusterId) {
        pushIssue(context, 'INVALID_VALUE', `${path}.requires`, '前置星位必须同属一个道途簇')
      }
    }
  }
  validateNumbers(context, node.stats, `${path}.stats`, '星位属性')
  validateNumbers(context, node.mods, `${path}.mods`, '星位增益')
  validateRules(context, node.rules, `${path}.rules`, '星位词条')
  scanPlaceholders(context, node, path)
}

function validatePrinciple(
  context: ValidationContext,
  principle: DaoPrincipleDefinition,
  path: string,
): void {
  checkId(context, principle.id, `${path}.id`, '道则 ID')
  requireNonEmptyString(context, principle.name, `${path}.name`, '道则名称')
  requireNonEmptyString(context, principle.title, `${path}.title`, '道则题记')
  requireNonEmptyString(context, principle.description, `${path}.description`, '道则说明')
  if (checkId(context, principle.clusterId, `${path}.clusterId`, '道途簇 ID')) {
    if (!context.index.daoClusters.has(principle.clusterId)) {
      pushIssue(context, 'MISSING_REFERENCE', `${path}.clusterId`, `道途簇引用不存在：${principle.clusterId}`)
    }
  }
  requirePositiveInteger(context, principle.cost, `${path}.cost`, '道则星痕消耗')
  if (requirePositiveInteger(context, principle.requiredNodes, `${path}.requiredNodes`, '道则所需星数')) {
    if (principle.requiredNodes > 3) {
      pushIssue(context, 'INVALID_RANGE', `${path}.requiredNodes`, '道则最多要求 3 枚星位')
    }
  }
  validateNumbers(context, principle.stats, `${path}.stats`, '道则属性')
  validateNumbers(context, principle.mods, `${path}.mods`, '道则增益')
  validateRules(context, principle.rules, `${path}.rules`, '道则词条')
  scanPlaceholders(context, principle, path)
}

export function validateDao(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.daoClusters.forEach((cluster, index) => {
      validateCluster(context, cluster, `pack:${pack.id}.daoClusters[${index}]`)
    })
    pack.daoNodes.forEach((node, index) => {
      validateNode(context, node, `pack:${pack.id}.daoNodes[${index}]`)
    })
    pack.daoPrinciples.forEach((principle, index) => {
      validatePrinciple(context, principle, `pack:${pack.id}.daoPrinciples[${index}]`)
    })
  }
}
