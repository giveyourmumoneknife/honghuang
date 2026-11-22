import type { EventId } from '@/types/common'
import type { GameSaveData } from '@/types/state'
import type { ContentRegistry } from '@/data/registry'
import { checkEventEligibility, triggerEvent } from './eventRuntime'
import { Rng } from './rng'
import { cloneGameSaveData } from './state'

/** Months between two roaming-world events, stored in world flags. */
export const DISPATCH_NEXT_FLAG = 'world.dispatch.next_month'
const DISPATCH_MIN_GAP = 3
const DISPATCH_MAX_GAP = 9
const INBOX_BREATHER = 5

export interface WorldDispatchResult {
  state: GameSaveData
  eventId?: EventId
}

/**
 * The world should keep moving while the player cultivates. This picks at
 * most one requirement-gated event marked `dispatch` per settlement and
 * schedules the next look. Story events keep their pause tokens; ambient
 * events simply wait in the inbox.
 */
export function processWorldDispatch(
  state: GameSaveData,
  registry: ContentRegistry,
  now = new Date(),
): WorldDispatchResult {
  if (state.campaign.ending) return { state }
  if (state.inbox.some((entry) => entry.kind === 'story')) return { state }
  if (state.inbox.length >= INBOX_BREATHER) return { state }

  const current = state.clock.elapsedMonths
  const stored = state.campaign.world.flags[DISPATCH_NEXT_FLAG]
  const nextAt = typeof stored === 'number' ? stored : current + DISPATCH_MIN_GAP
  if (typeof stored !== 'number') {
    const next = cloneGameSaveData(state)
    next.campaign.world.flags[DISPATCH_NEXT_FLAG] = nextAt
    return { state: next }
  }
  if (current < nextAt) return { state }

  const rng = Rng.fromState(state.rng)
  const candidates: Array<{ eventId: EventId; weight: number }> = []
  for (const event of registry.events.values()) {
    if (!event.dispatch || event.eraId !== state.campaign.currentEra) continue
    if (!checkEventEligibility(state, event).ok) continue
    candidates.push({ eventId: event.id, weight: event.weight ?? 10 })
  }

  const gap = rng.nextInt(DISPATCH_MIN_GAP, DISPATCH_MAX_GAP + 1)
  const picked = rng.pickWeighted(candidates)
  if (!picked) {
    const next = cloneGameSaveData(state)
    next.campaign.world.flags[DISPATCH_NEXT_FLAG] = current + gap
    next.rng = rng.getState()
    return { state: next }
  }

  const event = registry.events.get(picked.eventId)
  if (!event) return { state }
  const triggered = triggerEvent(state, event, { now })
  if (!triggered.triggered) return { state }

  const next = triggered.state
  next.campaign.world.flags[DISPATCH_NEXT_FLAG] = current + gap
  next.rng = rng.getState()
  return { state: next, eventId: event.id }
}
