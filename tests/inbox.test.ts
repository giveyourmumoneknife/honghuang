import { describe, expect, it } from 'vitest'
import { processScheduledEvents, resolveEventChoice, triggerEvent } from '@/core/eventRuntime'
import {
  INBOX_CAPACITY,
  INBOX_OVERFLOW_TOKEN_ID,
  appendChronicleEntry,
  eventPauseTokenId,
  markInboxRead,
  removeInboxEvent,
} from '@/core/inbox'
import { getContentRegistry } from '@/data'
import { isClockPaused } from '@/core/time'
import type { EventDefinition } from '@/types/content'
import type { GameSaveData } from '@/types/state'
import { createTestState } from './helpers/stateFactory'

const registry = getContentRegistry()
const fixedNow = new Date('2026-11-21T09:00:00.000Z')

function simpleEvent(index: number): EventDefinition {
  const id = `event.test.inbox_${index}`
  return {
    id,
    eraId: 'era.longhan',
    kind: 'ambient',
    title: `收件箱试炼 ${index}`,
    summary: `第 ${index} 封待决来信。`,
    body: '纸页上有潮声。',
    pause: 'story',
    repeatable: false,
    requirements: [],
    onEnter: [],
    choices: [
      {
        id: `choice.test.inbox_${index}.read`,
        text: '读完了。',
        requirements: [],
        effects: [{ kind: 'setFlag', flag: `test.inbox_${index}_read`, value: true }],
        outcome: `第 ${index} 页翻过去了。`,
      },
    ],
  }
}

function triggerMany(count: number): GameSaveData {
  let state = createTestState()
  for (let index = 1; index <= count; index += 1) {
    const result = triggerEvent(state, simpleEvent(index), { now: fixedNow })
    expect(result.triggered).toBe(true)
    state = result.state
  }
  return state
}

describe('inbox capacity and pause tokens', () => {
  it('keeps exactly eight entries without overflowing', () => {
    const state = triggerMany(INBOX_CAPACITY)

    expect(state.inbox).toHaveLength(INBOX_CAPACITY)
    expect(state.clock.tokens.map((token) => token.id)).not.toContain(
      INBOX_OVERFLOW_TOKEN_ID,
    )
    expect(isClockPaused(state.clock, 'none')).toBe(false)
  })

  it('never drops a story event and escalates overflow to a manual pause', () => {
    const state = triggerMany(INBOX_CAPACITY + 1)

    expect(state.inbox).toHaveLength(INBOX_CAPACITY + 1)
    expect(state.inbox.map((entry) => entry.eventId)).toContain(
      simpleEvent(INBOX_CAPACITY + 1).id,
    )
    expect(state.clock.tokens).toContainEqual({
      id: INBOX_OVERFLOW_TOKEN_ID,
      source: 'manual',
      label: `收件箱积压 ${INBOX_CAPACITY + 1}/${INBOX_CAPACITY}，世界暂停`,
    })
    expect(isClockPaused(state.clock, 'none')).toBe(true)
  })

  it('releases the overflow pause when the queue returns to capacity', () => {
    const state = triggerMany(INBOX_CAPACITY + 1)
    const resolved = resolveEventChoice(
      state,
      simpleEvent(1),
      'choice.test.inbox_1.read',
      registry,
      fixedNow,
    )

    expect(resolved.ok).toBe(true)
    expect(resolved.state.inbox).toHaveLength(INBOX_CAPACITY)
    expect(resolved.state.clock.tokens.map((token) => token.id)).not.toContain(
      INBOX_OVERFLOW_TOKEN_ID,
    )
    expect(resolved.state.clock.tokens.map((token) => token.id)).not.toContain(
      eventPauseTokenId(simpleEvent(1).id),
    )
    expect(isClockPaused(resolved.state.clock, 'none')).toBe(false)
    expect(isClockPaused(resolved.state.clock, 'story')).toBe(true)
  })

  it('rejects duplicate pending events and supports reading marks', () => {
    const event = simpleEvent(1)
    const state = triggerEvent(createTestState(), event, { now: fixedNow }).state
    const duplicate = triggerEvent(state, event, { now: fixedNow })

    expect(duplicate.triggered).toBe(false)
    expect(duplicate.state).toBe(state)

    const read = markInboxRead(state, event.id)
    expect(read.inbox[0]?.read).toBe(true)
    expect(markInboxRead(read, event.id)).toBe(read)
    expect(state.inbox[0]?.read).toBe(false)
  })

  it('removing an absent event is a no-op', () => {
    const state = createTestState()
    expect(removeInboxEvent(state, 'event.test.absent')).toBe(state)
  })

  it('applies overflow to ambient events as well', () => {
    let state = createTestState()
    for (let index = 1; index <= INBOX_CAPACITY + 1; index += 1) {
      const event = { ...simpleEvent(index), pause: 'ambient' as const }
      state = triggerEvent(state, event, { now: fixedNow }).state
    }

    expect(state.inbox).toHaveLength(INBOX_CAPACITY + 1)
    expect(isClockPaused(state.clock, 'story')).toBe(true)
    expect(state.clock.tokens.map((token) => token.id)).toContain(
      INBOX_OVERFLOW_TOKEN_ID,
    )
  })

  it('queues scheduled events through the same overflow path', () => {
    const state = triggerMany(INBOX_CAPACITY)
    const beastTide = registry.events.get('event.longhan.first_beast_tide')
    if (!beastTide) throw new Error('missing fixture event: beast tide')
    state.campaign.world.regions['region.longhan.beast_waste'] = {
      id: 'region.longhan.beast_waste',
      unlocked: true,
      visited: false,
      flags: {},
      unlockedSiteIds: [],
      exploredSites: {},
    }
    state.eventRuntime.scheduled = [
      {
        id: 'schedule.overflow',
        eventId: beastTide.id,
        dueMonths: 0,
      },
    ]

    const result = processScheduledEvents(state, registry, fixedNow)
    expect(result.triggered).toEqual([beastTide.id])
    expect(result.state.inbox).toHaveLength(INBOX_CAPACITY + 1)
    expect(result.state.clock.tokens.map((token) => token.id)).toContain(
      INBOX_OVERFLOW_TOKEN_ID,
    )
  })
})

describe('chronicle archive', () => {
  it('appends entries and replaces an entry with the same id', () => {
    const state = createTestState()
    const entry = {
      id: 'chronicle:test:1',
      eraId: state.campaign.currentEra,
      eventId: 'event.test.chronicle',
      title: '旧事',
      text: '第一次记录。',
      year: 1,
    }
    const first = appendChronicleEntry(state, entry)
    expect(first.chronicle).toEqual([entry])
    expect(state.chronicle).toEqual([])

    const updated = appendChronicleEntry(first, {
      ...entry,
      text: '修订后的记录。',
    })
    expect(updated.chronicle).toHaveLength(1)
    expect(updated.chronicle[0]?.text).toBe('修订后的记录。')
  })
})
