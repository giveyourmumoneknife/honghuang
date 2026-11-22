import type { EventId } from '@/types/common'
import type { ChoiceDefinition, EventDefinition } from '@/types/content'
import {
  DAILY_TASK_PATTERN,
  checkId,
  collectEventEffects,
  hasNonNumericEffect,
  pushIssue,
  requireArray,
  requireBoolean,
  requireEnum,
  requireNonEmptyString,
  requireNumber,
  requireRange,
  scanPlaceholders,
  scanStrings,
  validateEffects,
  validateRequirements,
} from './context'
import type { ValidationContext } from './types'

const EVENT_KINDS = ['main', 'faction', 'partner', 'cave', 'world', 'hidden', 'ambient'] as const
const PAUSE_MODES = ['story', 'ambient'] as const

function validateChoice(
  context: ValidationContext,
  choice: ChoiceDefinition,
  path: string,
): void {
  checkId(context, choice.id, `${path}.id`, '选项 ID')
  requireNonEmptyString(context, choice.text, `${path}.text`, '选项文本')
  requireNonEmptyString(context, choice.outcome, `${path}.outcome`, '选项后果文本')
  validateRequirements(context, choice.requirements, `${path}.requirements`)
  validateEffects(context, choice.effects, `${path}.effects`)
  if (choice.nextEventId && !context.index.events.has(choice.nextEventId)) {
    pushIssue(context, 'MISSING_REFERENCE', `${path}.nextEventId`, `后续事件引用不存在：${choice.nextEventId}`)
  }
  if (!Array.isArray(choice.effects) || choice.effects.length === 0) {
    pushIssue(context, 'EMPTY_BRANCH', `${path}.effects`, '选项没有任何效果，形成空分支')
  }
}

export function validateEvents(context: ValidationContext): void {
  for (const pack of context.packs) {
    pack.events.forEach((event: EventDefinition, index) => {
      const path = `pack:${pack.id}.events[${index}]`
      checkId(context, event.id, `${path}.id`, '事件 ID')
      if (!context.index.eras.has(event.eraId)) {
        pushIssue(context, 'MISSING_REFERENCE', `${path}.eraId`, `时代引用不存在：${event.eraId}`)
      }
      requireEnum(context, event.kind, EVENT_KINDS, `${path}.kind`, '事件类型')
      requireEnum(context, event.pause, PAUSE_MODES, `${path}.pause`, '事件暂停类型')
      requireBoolean(context, event.repeatable, `${path}.repeatable`, '事件是否可重复')
      requireNonEmptyString(context, event.title, `${path}.title`, '事件标题')
      requireNonEmptyString(context, event.summary, `${path}.summary`, '事件摘要')
      requireNonEmptyString(context, event.body, `${path}.body`, '事件正文')
      if (event.weight !== undefined) {
        requireRange(context, event.weight, 1, 100, `${path}.weight`, '事件权重')
      }
      if (event.dispatch !== undefined) {
        requireBoolean(context, event.dispatch, `${path}.dispatch`, '是否进入潮声事件池')
      }
      if (event.cooldownMonths !== undefined) {
        if (
          requireNumber(context, event.cooldownMonths, `${path}.cooldownMonths`, '事件冷却月数') &&
          (event.cooldownMonths < 0 || !Number.isInteger(event.cooldownMonths))
        ) {
          pushIssue(context, 'INVALID_RANGE', `${path}.cooldownMonths`, '事件冷却月数必须是非负整数')
        }
      }
      if (event.factionId && !context.index.factions.has(event.factionId)) {
        pushIssue(context, 'MISSING_REFERENCE', `${path}.factionId`, `势力引用不存在：${event.factionId}`)
      }
      if (event.regionId && !context.index.regions.has(event.regionId)) {
        pushIssue(context, 'MISSING_REFERENCE', `${path}.regionId`, `区域引用不存在：${event.regionId}`)
      }
      if (event.partnerId && !context.index.partners.has(event.partnerId)) {
        pushIssue(context, 'MISSING_REFERENCE', `${path}.partnerId`, `道侣引用不存在：${event.partnerId}`)
      }
      if (event.sourceEventId && !context.index.events.has(event.sourceEventId)) {
        pushIssue(context, 'MISSING_REFERENCE', `${path}.sourceEventId`, `延迟事件来源不存在：${event.sourceEventId}`)
      }

      validateRequirements(context, event.requirements, `${path}.requirements`)
      validateEffects(context, event.onEnter, `${path}.onEnter`)

      if (requireArray<ChoiceDefinition>(context, event.choices, `${path}.choices`, '事件选项')) {
        if (event.choices.length === 0) {
          pushIssue(context, 'EVENT_DEAD_END', `${path}.choices`, '事件没有任何选项，触发后无法解决')
        }
        const choiceIds = new Set<string>()
        event.choices.forEach((choice, i) => {
          const choicePath = `${path}.choices[${i}]`
          if (choice?.id) {
            if (choiceIds.has(choice.id)) {
              pushIssue(context, 'DUPLICATE_ID', `${choicePath}.id`, `事件内选项 ID 重复：${choice.id}`)
            }
            choiceIds.add(choice.id)
          }
          validateChoice(context, choice, choicePath)
        })
      }

      const allEffects = collectEventEffects(event)
      if (event.repeatable && allEffects.some((effect) => effect.kind === 'gainStarMark')) {
        pushIssue(
          context,
          'INVALID_VALUE',
          `${path}.repeatable`,
          '可重复事件不能发放星痕，否则星痕经济会失控',
        )
      }
      if (!hasNonNumericEffect(allEffects)) {
        pushIssue(
          context,
          'NON_NUMERIC_EFFECT_REQUIRED',
          `${path}.choices`,
          '事件至少需要一个非数值后果（flag、势力/区域状态、记忆、物品、调度等）',
        )
      }

      scanStrings(
        { id: event.id, title: event.title, tags: event.tags },
        `${path}.tags`,
        context,
        (text) => DAILY_TASK_PATTERN.test(text),
        'DAILY_TASK_FORBIDDEN',
        (text) => `事件包含每日任务/签到式生成痕迹：${text}`,
      )
      scanPlaceholders(context, event, path)
    })
  }

  validateEventGraph(context)
}

function eventLinks(event: EventDefinition): Set<EventId> {
  const links = new Set<EventId>()
  for (const choice of event.choices) {
    if (choice.nextEventId) links.add(choice.nextEventId)
  }
  for (const effect of collectEventEffects(event)) {
    if (effect.kind === 'scheduleEvent') links.add(effect.eventId)
  }
  return links
}

function collectEventRoots(context: ValidationContext): Set<EventId> {
  const roots = new Set<EventId>()
  for (const pack of context.packs) {
    for (const era of pack.eras) {
      era.eventIds.forEach((eventId) => roots.add(eventId))
      for (const rule of era.settlement) {
        for (const effect of rule.effects) {
          if (effect.kind === 'scheduleEvent') roots.add(effect.eventId)
        }
      }
    }
    for (const faction of pack.factions) {
      faction.eventIds.forEach((eventId) => roots.add(eventId))
      if (faction.join?.entryEventId) roots.add(faction.join.entryEventId)
      for (const rank of faction.ranks) {
        if (rank.trialEventId) roots.add(rank.trialEventId)
      }
    }
    for (const partner of pack.partners) {
      if (partner.bond.eventId) roots.add(partner.bond.eventId)
      partner.postBondEventIds.forEach((eventId) => roots.add(eventId))
      partner.publicEventIds?.forEach((eventId) => roots.add(eventId))
    }
    for (const cave of pack.caves) {
      for (const building of cave.buildings) {
        for (const level of building.levels) {
          for (const effect of level.effects) {
            if (effect.kind === 'scheduleEvent') roots.add(effect.eventId)
          }
        }
      }
    }
  }
  return roots
}

function validateEventGraph(context: ValidationContext): void {
  const paths = new Map<EventId, string>()
  for (const pack of context.packs) {
    pack.events.forEach((event, index) => {
      if (!paths.has(event.id)) paths.set(event.id, `pack:${pack.id}.events[${index}]`)
    })
  }

  const reached = new Set<EventId>()
  const queue = [...collectEventRoots(context)].filter((eventId) =>
    context.index.events.has(eventId),
  )
  while (queue.length > 0) {
    const eventId = queue.shift()
    if (!eventId || reached.has(eventId)) continue
    reached.add(eventId)
    const event = context.index.events.get(eventId)
    if (!event) continue
    for (const link of eventLinks(event)) {
      if (!reached.has(link) && context.index.events.has(link)) queue.push(link)
    }
  }

  for (const pack of context.packs) {
    pack.events.forEach((event, index) => {
      if (!reached.has(event.id)) {
        pushIssue(
          context,
          'EVENT_UNREACHABLE',
          `pack:${pack.id}.events[${index}]`,
          `事件 ${event.id} 没有入口：未被时代/势力/道侣引用，也没有可到达事件调度它`,
        )
      }
    })
  }

  const visitState = new Map<EventId, 'visiting' | 'visited'>()
  const stack: EventId[] = []
  const stackIndex = new Map<EventId, number>()
  const reportedCycles = new Set<string>()

  const visit = (eventId: EventId): void => {
    const event = context.index.events.get(eventId)
    if (!event) return
    visitState.set(eventId, 'visiting')
    stackIndex.set(eventId, stack.length)
    stack.push(eventId)

    for (const link of eventLinks(event)) {
      if (!context.index.events.has(link)) continue
      const linkState = visitState.get(link)
      if (linkState === 'visiting') {
        const start = stackIndex.get(link)
        if (start === undefined) continue
        const cycle = stack.slice(start)
        const allNonRepeatable = cycle.every(
          (id) => context.index.events.get(id)?.repeatable === false,
        )
        if (!allNonRepeatable) continue
        const key = [...cycle].sort().join('|')
        if (reportedCycles.has(key)) continue
        reportedCycles.add(key)
        const first = cycle[0]
        if (!first) continue
        pushIssue(
          context,
          'EVENT_CYCLE',
          paths.get(first) ?? `event:${first}`,
          `不可重复事件形成闭环，链条会在重复处死锁：${[...cycle, first].join(' → ')}`,
        )
      } else if (linkState === undefined) {
        visit(link)
      }
    }

    stack.pop()
    stackIndex.delete(eventId)
    visitState.set(eventId, 'visited')
  }

  for (const eventId of context.index.events.keys()) {
    if (!visitState.has(eventId)) visit(eventId)
  }
}
