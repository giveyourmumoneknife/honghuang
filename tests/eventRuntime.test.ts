import { describe, expect, it } from 'vitest'
import { getContentRegistry } from '@/data'
import {
  checkEventEligibility,
  processScheduledEvents,
  resolveEventChoice,
  triggerEvent,
} from '@/core/eventRuntime'
import { eventPauseTokenId } from '@/core/inbox'
import { isClockPaused } from '@/core/time'
import type { EventDefinition } from '@/types/content'
import { createTestState } from './helpers/stateFactory'

const registry = getContentRegistry()
const fixedNow = new Date('2026-11-21T08:00:00.000Z')

function eventById(id: string): EventDefinition {
  const event = registry.events.get(id)
  if (!event) throw new Error(`missing fixture event: ${id}`)
  return event
}

const dragonGate = eventById('event.longhan.dragon_gate')
const beastTide = eventById('event.longhan.first_beast_tide')
const covenant = eventById('event.longhan.three_clans_covenant')

function unlockRegion(
  state: ReturnType<typeof createTestState>,
  regionId: string,
): ReturnType<typeof createTestState> {
  state.campaign.world.regions[regionId] = {
    id: regionId,
    unlocked: true,
    visited: false,
    flags: {},
    unlockedSiteIds: [],
    exploredSites: {},
  }
  return state
}

function gatedEvent(): EventDefinition {
  return {
    id: 'event.test.gated',
    eraId: 'era.longhan',
    kind: 'faction',
    title: '门槛试炼',
    summary: '一道只认信物的门。',
    body: '门后有潮声。',
    pause: 'story',
    repeatable: false,
    requirements: [],
    onEnter: [],
    choices: [
      {
        id: 'choice.test.gated.enter',
        text: '以龙鳞叩门。',
        requirements: [
          { kind: 'item', itemId: 'item.longhan.dragon_scale', count: 1 },
        ],
        effects: [{ kind: 'setFlag', flag: 'test.gate_opened', value: true }],
        outcome: '门开了。',
      },
    ],
  }
}

describe('event runtime eligibility', () => {
  it('requires the right era, requirements and availability', () => {
    const state = unlockRegion(createTestState(), 'region.longhan.four_seas')
    state.campaign.currentEra = 'era.prologue'
    expect(checkEventEligibility(state, dragonGate).reasons).toContain('era')

    state.campaign.currentEra = 'era.longhan'
    state.campaign.world.regions = {}
    const missingRegion = checkEventEligibility(state, dragonGate)
    expect(missingRegion.ok).toBe(false)
    expect(missingRegion.reasons).toEqual(['requirements'])
    expect(missingRegion.unmet).toEqual([
      { kind: 'regionUnlocked', regionId: 'region.longhan.four_seas' },
    ])

    unlockRegion(state, 'region.longhan.four_seas')
    expect(checkEventEligibility(state, dragonGate).ok).toBe(true)
  })

  it('blocks pending, consumed and cooling-down events', () => {
    const state = unlockRegion(createTestState(), 'region.longhan.beast_waste')
    state.clock.elapsedMonths = 10
    state.eventRuntime.history[beastTide.id] = {
      eventId: beastTide.id,
      count: 1,
      lastTriggeredMonths: 5,
    }

    const cooling = checkEventEligibility(state, beastTide)
    expect(cooling.reasons).toContain('cooldown')
    expect(cooling.cooldownRemaining).toBe(19)

    state.clock.elapsedMonths = 29
    expect(checkEventEligibility(state, beastTide).ok).toBe(true)

    state.eventRuntime.history[dragonGate.id] = {
      eventId: dragonGate.id,
      count: 1,
      lastTriggeredMonths: 1,
    }
    expect(checkEventEligibility(state, dragonGate).reasons).toContain('consumed')

    const pending = triggerEvent(state, beastTide, { now: fixedNow })
    expect(pending.triggered).toBe(true)
    expect(checkEventEligibility(pending.state, beastTide).reasons).toContain('pending')
  })
})

describe('event triggering', () => {
  it('applies onEnter, queues the event and pauses time without mutating the input', () => {
    const state = unlockRegion(createTestState(), 'region.longhan.four_seas')
    const result = triggerEvent(state, dragonGate, { now: fixedNow })

    expect(result.triggered).toBe(true)
    expect(result.overflowed).toBe(false)
    expect(result.entry).toEqual({
      id: `inbox:${dragonGate.id}`,
      eventId: dragonGate.id,
      kind: 'story',
      createdAt: fixedNow.toISOString(),
      createdMonths: 0,
      read: false,
      sourceEventId: undefined,
    })
    expect(result.state.campaign.world.flags['longhan.dragon_gate_seen']).toBe(true)
    expect(result.state.eventRuntime.history[dragonGate.id]).toEqual({
      eventId: dragonGate.id,
      count: 1,
      lastTriggeredMonths: 0,
      lastResolvedMonths: undefined,
      lastChoiceId: undefined,
    })
    expect(result.state.inbox).toHaveLength(1)
    expect(result.state.clock.tokens.map((token) => token.id)).toContain(
      eventPauseTokenId(dragonGate.id),
    )
    expect(isClockPaused(result.state.clock, 'story')).toBe(true)
    expect(state.inbox).toEqual([])
    expect(state.campaign.world.flags['longhan.dragon_gate_seen']).toBeUndefined()

    const duplicate = triggerEvent(result.state, dragonGate, { now: fixedNow })
    expect(duplicate.triggered).toBe(false)
    expect(duplicate.eligibility.reasons).toContain('pending')
    expect(duplicate.state).toBe(result.state)
  })

  it('keeps ambient events queued without blocking the story policy', () => {
    const state = unlockRegion(createTestState(), 'region.longhan.beast_waste')
    const result = triggerEvent(state, beastTide, { now: fixedNow })

    expect(result.triggered).toBe(true)
    expect(result.entry?.kind).toBe('ambient')
    expect(isClockPaused(result.state.clock, 'story')).toBe(false)
    expect(isClockPaused(result.state.clock, 'all')).toBe(true)
  })

  it('records a source event for scheduled triggers', () => {
    const state = unlockRegion(createTestState(), 'region.longhan.beast_waste')
    const result = triggerEvent(state, beastTide, {
      sourceEventId: covenant.id,
      now: fixedNow,
    })

    expect(result.entry?.sourceEventId).toBe(covenant.id)
  })
})

describe('event choice resolution', () => {
  it('applies effects, archives the outcome and releases the pause token', () => {
    const state = unlockRegion(createTestState(), 'region.longhan.four_seas')
    const triggered = triggerEvent(state, dragonGate, { now: fixedNow })
    const resolved = resolveEventChoice(
      triggered.state,
      dragonGate,
      'choice.longhan.dragon_gate.accept',
      registry,
      fixedNow,
    )

    expect(resolved.ok).toBe(true)
    expect(resolved.state.campaign.world.factions['faction.longhan.dragon']).toMatchObject({
      membership: true,
      rank: 1,
    })
    expect(resolved.state.player.inventory['item.longhan.tide_breaker_spear']).toBe(1)
    expect(resolved.state.campaign.legacy.memories).toEqual([
      {
        id: 'memory.longhan.dragon_gate',
        text: '潮退尽时，你在巡海册上留下了自己的名字。',
        createdAtMonths: 0,
        sourceEventId: dragonGate.id,
      },
    ])
    expect(resolved.state.inbox).toEqual([])
    expect(resolved.state.clock.tokens).toEqual([])
    expect(isClockPaused(resolved.state.clock, 'story')).toBe(false)
    expect(resolved.state.eventRuntime.history[dragonGate.id]).toMatchObject({
      count: 1,
      lastResolvedMonths: 0,
      lastChoiceId: 'choice.longhan.dragon_gate.accept',
    })
    expect(resolved.chronicleEntry).toMatchObject({
      id: `chronicle:${dragonGate.id}:1`,
      eventId: dragonGate.id,
      choiceId: 'choice.longhan.dragon_gate.accept',
      title: dragonGate.title,
      year: 1,
    })
    expect(resolved.state.chronicle).toEqual([resolved.chronicleEntry])
    expect(triggered.state.inbox).toHaveLength(1)
    expect(triggered.state.chronicle).toEqual([])
  })

  it('rejects missing, unknown and locked choices without consuming the event', () => {
    const event = gatedEvent()
    const state = createTestState()
    expect(resolveEventChoice(state, event, 'choice.test.gated.enter').reason).toBe(
      'not-pending',
    )

    const triggered = triggerEvent(state, event, { now: fixedNow })
    expect(triggered.triggered).toBe(true)
    expect(
      resolveEventChoice(triggered.state, event, 'choice.test.gated.missing').reason,
    ).toBe('unknown-choice')

    const locked = resolveEventChoice(
      triggered.state,
      event,
      'choice.test.gated.enter',
      registry,
      fixedNow,
    )
    expect(locked.ok).toBe(false)
    expect(locked.reason).toBe('locked')
    expect(locked.unmet).toEqual([
      { kind: 'item', itemId: 'item.longhan.dragon_scale', count: 1 },
    ])
    expect(locked.state.inbox).toHaveLength(1)

    const unlockedState = createTestState()
    unlockedState.player.inventory['item.longhan.dragon_scale'] = 1
    const pending = triggerEvent(unlockedState, event, { now: fixedNow })
    const resolved = resolveEventChoice(
      pending.state,
      event,
      'choice.test.gated.enter',
      registry,
      fixedNow,
    )
    expect(resolved.ok).toBe(true)
    expect(resolved.state.campaign.world.flags['test.gate_opened']).toBe(true)
  })

  it('triggers a chained next event with source provenance', () => {
    const chain: EventDefinition = {
      id: 'event.test.chain',
      eraId: 'era.longhan',
      kind: 'main',
      title: '连锁试炼',
      summary: '一句应答引出下一件事。',
      body: '话出口后，荒原起了风。',
      pause: 'story',
      repeatable: false,
      requirements: [],
      onEnter: [],
      choices: [
        {
          id: 'choice.test.chain.continue',
          text: '继续向前。',
          requirements: [],
          effects: [{ kind: 'setFlag', flag: 'test.chain_done', value: true }],
          outcome: '风把你带向荒原。',
          nextEventId: beastTide.id,
        },
      ],
    }
    const state = unlockRegion(createTestState(), 'region.longhan.beast_waste')
    const triggered = triggerEvent(state, chain, { now: fixedNow })
    const resolved = resolveEventChoice(
      triggered.state,
      chain,
      'choice.test.chain.continue',
      registry,
      fixedNow,
    )

    expect(resolved.ok).toBe(true)
    expect(resolved.nextEventId).toBe(beastTide.id)
    expect(resolved.nextTrigger?.triggered).toBe(true)
    expect(resolved.state.inbox.map((entry) => entry.eventId)).toEqual([beastTide.id])
    expect(resolved.state.inbox[0]?.sourceEventId).toBe(chain.id)
    expect(resolved.state.clock.tokens.map((token) => token.id)).toContain(
      eventPauseTokenId(beastTide.id),
    )
  })

  it('does not consume the next event when its requirements are unmet', () => {
    const chain: EventDefinition = {
      id: 'event.test.blocked_chain',
      eraId: 'era.longhan',
      kind: 'main',
      title: '被阻断的连锁',
      summary: '下一件事还不到时候。',
      body: '你听见远处有骨声。',
      pause: 'story',
      repeatable: false,
      requirements: [],
      onEnter: [],
      choices: [
        {
          id: 'choice.test.blocked_chain.go',
          text: '循声而去。',
          requirements: [],
          effects: [{ kind: 'setFlag', flag: 'test.blocked_chain_done', value: true }],
          outcome: '你记下了方向。',
          nextEventId: beastTide.id,
        },
      ],
    }
    const state = createTestState()
    const triggered = triggerEvent(state, chain, { now: fixedNow })
    const resolved = resolveEventChoice(
      triggered.state,
      chain,
      'choice.test.blocked_chain.go',
      registry,
      fixedNow,
    )

    expect(resolved.ok).toBe(true)
    expect(resolved.nextTrigger?.triggered).toBe(false)
    expect(resolved.nextTrigger?.eligibility.reasons).toContain('requirements')
    expect(resolved.state.inbox).toEqual([])
    expect(resolved.state.eventRuntime.history[beastTide.id]).toBeUndefined()
  })
})

describe('scheduled event processing', () => {
  it('triggers due events, keeps future ones and reports missing definitions', () => {
    const state = unlockRegion(createTestState(), 'region.longhan.beast_waste')
    state.clock.elapsedMonths = 10
    state.eventRuntime.scheduled = [
      {
        id: 'schedule.1',
        eventId: beastTide.id,
        dueMonths: 8,
        sourceEventId: covenant.id,
      },
      {
        id: 'schedule.2',
        eventId: 'event.missing',
        dueMonths: 5,
      },
      {
        id: 'schedule.3',
        eventId: dragonGate.id,
        dueMonths: 20,
      },
    ]

    const result = processScheduledEvents(state, registry, fixedNow)

    expect(result.triggered).toEqual([beastTide.id])
    expect(result.skipped).toEqual([{ eventId: 'event.missing', reasons: ['missing-event'] }])
    expect(result.state.inbox.map((entry) => entry.eventId)).toEqual([beastTide.id])
    expect(result.state.inbox[0]?.createdMonths).toBe(10)
    expect(result.state.inbox[0]?.sourceEventId).toBe(covenant.id)
    expect(result.state.eventRuntime.scheduled).toEqual([
      {
        id: 'schedule.3',
        eventId: dragonGate.id,
        dueMonths: 20,
      },
    ])
    expect(state.eventRuntime.scheduled).toHaveLength(3)
  })

  it('drops due entries that are no longer eligible', () => {
    const state = unlockRegion(createTestState(), 'region.longhan.beast_waste')
    state.clock.elapsedMonths = 10
    const pending = triggerEvent(state, beastTide, { now: fixedNow })
    pending.state.eventRuntime.scheduled = [
      {
        id: 'schedule.1',
        eventId: beastTide.id,
        dueMonths: 10,
      },
    ]

    const result = processScheduledEvents(pending.state, registry, fixedNow)
    expect(result.triggered).toEqual([])
    expect(result.skipped[0]?.eventId).toBe(beastTide.id)
    expect(result.skipped[0]?.reasons).toContain('pending')
    expect(result.state.eventRuntime.scheduled).toEqual([])
    expect(result.state.inbox).toHaveLength(1)
  })

  it('returns the same state when nothing is due', () => {
    const state = createTestState()
    state.eventRuntime.scheduled = [
      { id: 'schedule.1', eventId: beastTide.id, dueMonths: 99 },
    ]
    expect(processScheduledEvents(state, registry, fixedNow).state).toBe(state)
  })
})
