import type { EventId } from '@/types/common'
import type { EventDefinition } from '@/types/content'
import type { ChronicleEntry, GameSaveData, InboxEntry, PauseToken } from '@/types/state'
import { cloneGameSaveData } from './state'
import { pushPauseToken, releasePauseToken } from './time'

export const INBOX_CAPACITY = 8
export const INBOX_OVERFLOW_TOKEN_ID = 'inbox-overflow'

export function eventPauseTokenId(eventId: EventId): string {
  return `event-pause:${eventId}`
}

export function inboxEntryId(eventId: EventId): string {
  return `inbox:${eventId}`
}

export function hasPendingEvent(state: GameSaveData, eventId: EventId): boolean {
  return state.inbox.some((entry) => entry.eventId === eventId)
}

export function getPendingEventEntry(
  state: GameSaveData,
  eventId: EventId,
): InboxEntry | undefined {
  return state.inbox.find((entry) => entry.eventId === eventId)
}

export function createInboxEntry(
  event: EventDefinition,
  createdMonths: number,
  now = new Date(),
  sourceEventId?: EventId,
): InboxEntry {
  return {
    id: inboxEntryId(event.id),
    eventId: event.id,
    kind: event.pause,
    createdAt: now.toISOString(),
    createdMonths,
    read: false,
    sourceEventId,
  }
}

export interface InboxEnqueueResult {
  state: GameSaveData
  accepted: boolean
  overflowed: boolean
}

export function enqueueInboxEntry(
  state: GameSaveData,
  entry: InboxEntry,
  pauseToken?: PauseToken,
): InboxEnqueueResult {
  if (hasPendingEvent(state, entry.eventId)) {
    return { state, accepted: false, overflowed: false }
  }

  const next = cloneGameSaveData(state)
  next.inbox.push(entry)
  if (pauseToken) {
    next.clock = pushPauseToken(next.clock, pauseToken)
  }

  const wasOverflow = state.inbox.length > INBOX_CAPACITY
  const isOverflow = next.inbox.length > INBOX_CAPACITY
  if (isOverflow) {
    next.clock = pushPauseToken(next.clock, {
      id: INBOX_OVERFLOW_TOKEN_ID,
      source: 'manual',
      label: `收件箱积压 ${next.inbox.length}/${INBOX_CAPACITY}，世界暂停`,
    })
  }

  return {
    state: next,
    accepted: true,
    overflowed: isOverflow && !wasOverflow,
  }
}

export function removeInboxEvent(state: GameSaveData, eventId: EventId): GameSaveData {
  if (!hasPendingEvent(state, eventId)) return state

  const next = cloneGameSaveData(state)
  next.inbox = next.inbox.filter((entry) => entry.eventId !== eventId)
  next.clock = releasePauseToken(next.clock, eventPauseTokenId(eventId))
  if (next.inbox.length <= INBOX_CAPACITY) {
    next.clock = releasePauseToken(next.clock, INBOX_OVERFLOW_TOKEN_ID)
  }
  return next
}

export function markInboxRead(state: GameSaveData, eventId: EventId): GameSaveData {
  const entry = getPendingEventEntry(state, eventId)
  if (!entry || entry.read) return state

  const next = cloneGameSaveData(state)
  const target = next.inbox.find((candidate) => candidate.eventId === eventId)
  if (target) target.read = true
  return next
}

export function appendChronicleEntry(
  state: GameSaveData,
  entry: ChronicleEntry,
): GameSaveData {
  const next = cloneGameSaveData(state)
  const index = next.chronicle.findIndex((candidate) => candidate.id === entry.id)
  if (index >= 0) next.chronicle[index] = entry
  else next.chronicle.push(entry)
  return next
}
