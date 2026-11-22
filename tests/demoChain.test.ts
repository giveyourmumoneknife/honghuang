import { describe, expect, it } from 'vitest'
import { getContentRegistry } from '@/data'
import { resolveEventChoice, processScheduledEvents } from '@/core/eventRuntime'
import { createNewGameSave } from '@/core/newGame'
import type { EventId } from '@/types/common'
import type { GameSaveData } from '@/types/state'

const registry = getContentRegistry()

function advanceToScheduled(state: GameSaveData, eventId: EventId): GameSaveData {
  const entry = state.eventRuntime.scheduled.find(
    (candidate) => candidate.eventId === eventId,
  )
  expect(entry, `${eventId} should be scheduled`).toBeDefined()
  return {
    ...state,
    clock: { ...state.clock, elapsedMonths: entry?.dueMonths ?? state.clock.elapsedMonths },
  }
}

function triggerDue(state: GameSaveData): GameSaveData {
  return processScheduledEvents(state, registry).state
}

function resolve(state: GameSaveData, eventId: EventId, choiceId: string): GameSaveData {
  const event = registry.events.get(eventId)
  expect(event, `${eventId} should exist`).toBeDefined()
  if (!event) return state
  const result = resolveEventChoice(state, event, choiceId, registry)
  expect(result.ok, `${eventId} choice should resolve`).toBe(true)
  return result.state
}

describe('M3 longhan demo chain', () => {
  it('plays from the opening tide to a fully built listening-tide cave', () => {
    let state = createNewGameSave({
      playerName: '无名散修',
      origin: '四海',
      lineage: '人族',
      eraId: 'era.longhan',
      phaseId: 'phase.longhan.dawn',
      regions: [
        {
          id: 'region.longhan.four_seas',
          unlocked: true,
          visited: true,
        },
      ],
      openingEventId: 'event.longhan.tide_wake',
      seed: 1,
    })

    state = triggerDue(state)
    expect(state.inbox.map((entry) => entry.eventId)).toEqual([
      'event.longhan.tide_wake',
    ])

    state = resolve(state, 'event.longhan.tide_wake', 'choice.longhan.tide_wake.bell')
    state = advanceToScheduled(state, 'event.longhan.tide_market')
    state = triggerDue(state)
    state = resolve(state, 'event.longhan.tide_market', 'choice.longhan.tide_market.help')

    state = advanceToScheduled(state, 'event.longhan.dragon_gate')
    state = triggerDue(state)
    state = resolve(state, 'event.longhan.dragon_gate', 'choice.longhan.dragon_gate.accept')
    expect(state.campaign.world.flags['longhan.dragon_gate_answered']).toBe(true)

    state = advanceToScheduled(state, 'event.longhan.ao_guang_bond')
    state = triggerDue(state)
    state = resolve(state, 'event.longhan.ao_guang_bond', 'choice.longhan.ao_guang_bond.accept')
    expect(state.player.partnerIds).toContain('partner.longhan.ao_guang')

    state = advanceToScheduled(state, 'event.longhan.cave_discovery')
    state = triggerDue(state)
    expect(state.cave?.id).toBe('cave.longhan.tide_grotto')
    state = resolve(state, 'event.longhan.cave_discovery', 'choice.longhan.cave_discovery.name_tide')

    state = advanceToScheduled(state, 'event.longhan.cave_spirit_array')
    state = triggerDue(state)
    state = resolve(state, 'event.longhan.cave_spirit_array', 'choice.longhan.cave_spirit_array.sea')

    state = advanceToScheduled(state, 'event.longhan.cave_tide_loft')
    state = triggerDue(state)
    state = resolve(state, 'event.longhan.cave_tide_loft', 'choice.longhan.cave_tide_loft.window')

    state = advanceToScheduled(state, 'event.longhan.cave_herb_garden')
    state = triggerDue(state)
    state = resolve(state, 'event.longhan.cave_herb_garden', 'choice.longhan.cave_herb_garden.salt')

    expect(state.cave?.buildings).toEqual({
      'building.longhan.tide_array': 1,
      'building.longhan.tide_loft': 1,
      'building.longhan.herb_garden': 1,
    })
    expect(state.campaign.world.flags['longhan.cave.complete']).toBe(true)
    expect(state.player.partnerFavor['partner.longhan.ao_guang']).toBeGreaterThanOrEqual(2)
    expect(state.chronicle).toHaveLength(8)
    expect(state.campaign.legacy.memories.map((memory) => memory.id)).toContain(
      'memory.longhan.cave_complete',
    )
    expect(state.inbox.map((entry) => entry.eventId)).toEqual([
      'event.longhan.three_clans_covenant',
    ])
    const eventPauses = state.clock.tokens.filter((token) =>
      token.id.startsWith('event-pause:'),
    )
    expect(eventPauses).toHaveLength(1)
    expect(eventPauses[0]).toMatchObject({
      eventId: 'event.longhan.three_clans_covenant',
    })
  })
})
