import type { EventId } from '@/types/common'
import type { EventDefinition } from '@/types/content'
import type { Requirement } from '@/types/dsl'
import type { ChronicleEntry, GameSaveData, InboxEntry, PauseToken } from '@/types/state'
import type { ContentRegistry } from '@/data/registry'
import { evaluateRequirements } from './conditions'
import { applyEffects } from './effects'
import {
  createInboxEntry,
  enqueueInboxEntry,
  eventPauseTokenId,
  hasPendingEvent,
  removeInboxEvent,
} from './inbox'
import { cloneGameSaveData } from './state'
import { calendarFromMonths } from './time'

export type EventUnavailableReason =
  | 'era'
  | 'requirements'
  | 'pending'
  | 'consumed'
  | 'cooldown'

export interface EventEligibility {
  ok: boolean
  reasons: EventUnavailableReason[]
  unmet: Requirement[]
  cooldownRemaining?: number
}

export function checkEventEligibility(
  state: GameSaveData,
  event: EventDefinition,
): EventEligibility {
  const reasons: EventUnavailableReason[] = []
  const history = state.eventRuntime.history[event.id]

  if (state.campaign.currentEra !== event.eraId) {
    reasons.push('era')
  }
  if (hasPendingEvent(state, event.id)) {
    reasons.push('pending')
  }
  if (!event.repeatable && history && history.count > 0) {
    reasons.push('consumed')
  }

  let cooldownRemaining: number | undefined
  if (event.repeatable && event.cooldownMonths && history) {
    const elapsed = state.clock.elapsedMonths
    const readyAt = history.lastTriggeredMonths + event.cooldownMonths
    if (elapsed < readyAt) {
      reasons.push('cooldown')
      cooldownRemaining = readyAt - elapsed
    }
  }

  const requirements = evaluateRequirements(state, event.requirements)
  if (!requirements.ok) {
    reasons.push('requirements')
  }

  return {
    ok: reasons.length === 0,
    reasons,
    unmet: requirements.unmet,
    cooldownRemaining,
  }
}

export interface TriggerEventOptions {
  sourceEventId?: EventId
  now?: Date
}

export interface TriggerEventResult {
  state: GameSaveData
  triggered: boolean
  eligibility: EventEligibility
  entry?: InboxEntry
  overflowed: boolean
}

export function triggerEvent(
  state: GameSaveData,
  event: EventDefinition,
  options: TriggerEventOptions = {},
): TriggerEventResult {
  const eligibility = checkEventEligibility(state, event)
  if (!eligibility.ok) {
    return { state, triggered: false, eligibility, overflowed: false }
  }

  const applied = applyEffects(state, event.onEnter, { sourceEventId: event.id })
  const next = applied === state ? cloneGameSaveData(state) : applied
  const previous = next.eventRuntime.history[event.id]
  next.eventRuntime.history[event.id] = {
    eventId: event.id,
    count: (previous?.count ?? 0) + 1,
    lastTriggeredMonths: next.clock.elapsedMonths,
    lastResolvedMonths: previous?.lastResolvedMonths,
    lastChoiceId: previous?.lastChoiceId,
  }

  const entry = createInboxEntry(
    event,
    next.clock.elapsedMonths,
    options.now,
    options.sourceEventId,
  )
  const pauseToken: PauseToken = {
    id: eventPauseTokenId(event.id),
    source: event.pause,
    label: event.title,
    eventId: event.id,
  }
  const enqueued = enqueueInboxEntry(next, entry, pauseToken)
  if (!enqueued.accepted) {
    return {
      state,
      triggered: false,
      eligibility: { ok: false, reasons: ['pending'], unmet: [] },
      overflowed: false,
    }
  }

  return {
    state: enqueued.state,
    triggered: true,
    eligibility,
    entry,
    overflowed: enqueued.overflowed,
  }
}

export type ChoiceResolutionFailure = 'not-pending' | 'unknown-choice' | 'locked'

export interface ResolveChoiceResult {
  state: GameSaveData
  ok: boolean
  reason?: ChoiceResolutionFailure
  unmet?: Requirement[]
  chronicleEntry?: ChronicleEntry
  nextEventId?: EventId
  nextTrigger?: TriggerEventResult
}

export function resolveEventChoice(
  state: GameSaveData,
  event: EventDefinition,
  choiceId: string,
  registry?: ContentRegistry,
  now = new Date(),
): ResolveChoiceResult {
  if (!hasPendingEvent(state, event.id)) {
    return { state, ok: false, reason: 'not-pending' }
  }

  const choice = event.choices.find((candidate) => candidate.id === choiceId)
  if (!choice) {
    return { state, ok: false, reason: 'unknown-choice' }
  }

  const requirements = evaluateRequirements(state, choice.requirements)
  if (!requirements.ok) {
    return { state, ok: false, reason: 'locked', unmet: requirements.unmet }
  }

  const applied = applyEffects(state, choice.effects, { sourceEventId: event.id })
  let next = applied === state ? cloneGameSaveData(state) : applied
  const history = next.eventRuntime.history[event.id]
  const count = history?.count ?? 1
  const resolvedMonths = next.clock.elapsedMonths
  next.eventRuntime.history[event.id] = {
    eventId: event.id,
    count,
    lastTriggeredMonths: history?.lastTriggeredMonths ?? resolvedMonths,
    lastResolvedMonths: resolvedMonths,
    lastChoiceId: choice.id,
  }

  const chronicleEntry: ChronicleEntry = {
    id: `chronicle:${event.id}:${count}`,
    eraId: state.campaign.currentEra,
    eventId: event.id,
    choiceId: choice.id,
    title: event.title,
    text: choice.outcome,
    year: calendarFromMonths(resolvedMonths).year,
  }
  next.chronicle.push(chronicleEntry)
  next = removeInboxEvent(next, event.id)

  const nextEventId = choice.nextEventId
  if (nextEventId) {
    const nextEvent = registry?.events.get(nextEventId)
    if (nextEvent) {
      const nextTrigger = triggerEvent(next, nextEvent, {
        sourceEventId: event.id,
        now,
      })
      next = nextTrigger.state
      return { state: next, ok: true, chronicleEntry, nextEventId, nextTrigger }
    }
  }

  return { state: next, ok: true, chronicleEntry, nextEventId }
}

export interface ScheduledEventSkip {
  eventId: EventId
  reasons: EventUnavailableReason[] | ['missing-event']
}

export interface ProcessScheduledResult {
  state: GameSaveData
  triggered: EventId[]
  skipped: ScheduledEventSkip[]
}

export function processScheduledEvents(
  state: GameSaveData,
  registry: ContentRegistry,
  now = new Date(),
): ProcessScheduledResult {
  const due = state.eventRuntime.scheduled
    .filter((entry) => entry.dueMonths <= state.clock.elapsedMonths)
    .sort((left, right) => left.dueMonths - right.dueMonths || left.id.localeCompare(right.id))

  if (due.length === 0) {
    return { state, triggered: [], skipped: [] }
  }

  const next = cloneGameSaveData(state)
  next.eventRuntime.scheduled = next.eventRuntime.scheduled.filter(
    (entry) => entry.dueMonths > state.clock.elapsedMonths,
  )

  let current = next
  const triggered: EventId[] = []
  const skipped: ScheduledEventSkip[] = []

  for (const scheduled of due) {
    const event = registry.events.get(scheduled.eventId)
    if (!event) {
      skipped.push({ eventId: scheduled.eventId, reasons: ['missing-event'] })
      continue
    }
    const result = triggerEvent(current, event, {
      sourceEventId: scheduled.sourceEventId,
      now,
    })
    current = result.state
    if (result.triggered) triggered.push(event.id)
    else skipped.push({ eventId: event.id, reasons: result.eligibility.reasons })
  }

  return { state: current, triggered, skipped }
}
