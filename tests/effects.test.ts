import { describe, expect, it } from 'vitest'
import { applyEffects } from '@/core/effects'
import type { Effect } from '@/types/dsl'
import { createTestState } from './helpers/stateFactory'

describe('effect runtime', () => {
  it('returns the same state for no effects and never mutates the input', () => {
    const state = createTestState()
    expect(applyEffects(state, [])).toBe(state)

    state.clock.elapsedMonths = 10
    const next = applyEffects(
      state,
      [
        { kind: 'setFlag', flag: 'longhan.oath', value: true },
        { kind: 'grantItem', itemId: 'item.longhan.dragon_scale', count: 2 },
      ],
      { sourceEventId: 'event.longhan.dragon_gate' },
    )

    expect(next).not.toBe(state)
    expect(state.campaign.world.flags['longhan.oath']).toBeUndefined()
    expect(state.player.inventory['item.longhan.dragon_scale']).toBeUndefined()
    expect(next.campaign.world.flags['longhan.oath']).toBe(true)
    expect(next.player.inventory['item.longhan.dragon_scale']).toBe(2)
  })

  it('sets and clears flags and schedules delayed events with provenance', () => {
    const state = createTestState()
    state.clock.elapsedMonths = 10
    const next = applyEffects(
      state,
      [
        { kind: 'setFlag', flag: 'longhan.role', value: 'witness' },
        { kind: 'setFlag', flag: 'longhan.temporary', value: true },
        { kind: 'clearFlag', flag: 'longhan.temporary' },
        {
          kind: 'scheduleEvent',
          eventId: 'event.longhan.first_beast_tide',
          delayMonths: 6,
        },
      ],
      { sourceEventId: 'event.longhan.three_clans_covenant' },
    )

    expect(next.campaign.world.flags['longhan.role']).toBe('witness')
    expect('longhan.temporary' in next.campaign.world.flags).toBe(false)
    expect(next.eventRuntime.scheduled).toEqual([
      {
        id: 'schedule.1',
        eventId: 'event.longhan.first_beast_tide',
        dueMonths: 16,
        sourceEventId: 'event.longhan.three_clans_covenant',
      },
    ])
    expect(next.eventRuntime.nextSequence).toBe(2)
  })

  it('changes faction state, region state, sites and rumors with deduplication', () => {
    const state = createTestState()
    state.clock.elapsedMonths = 4
    const next = applyEffects(state, [
      {
        kind: 'changeFactionState',
        factionId: 'faction.longhan.dragon',
        membership: true,
        rank: 2,
        contributionDelta: 15,
        reputationDelta: -2,
        fortuneDelta: 3,
        flags: { tide_sworn: true },
      },
      {
        kind: 'changeRegionState',
        regionId: 'region.longhan.four_seas',
        key: 'tide',
        value: 'high',
      },
      { kind: 'unlockSite', regionId: 'region.longhan.four_seas', siteId: 'site.longhan.dragon_gate' },
      { kind: 'unlockSite', regionId: 'region.longhan.four_seas', siteId: 'site.longhan.dragon_gate' },
      { kind: 'addRumor', rumorId: 'rumor.longhan.tide', text: '潮水在北岸退了三尺。' },
    ])

    expect(next.campaign.world.factions['faction.longhan.dragon']).toMatchObject({
      membership: true,
      rank: 2,
      contribution: 15,
      reputation: -2,
      fortune: 3,
      flags: { tide_sworn: true },
    })
    expect(next.campaign.world.regions['region.longhan.four_seas']).toMatchObject({
      flags: { tide: 'high' },
      unlockedSiteIds: ['site.longhan.dragon_gate'],
    })
    expect(next.eventRuntime.rumors).toEqual([
      {
        id: 'rumor.longhan.tide',
        text: '潮水在北岸退了三尺。',
        createdAtMonths: 4,
      },
    ])

    const replaced = applyEffects(next, [
      { kind: 'addRumor', rumorId: 'rumor.longhan.tide', text: '潮水又退了半尺。' },
    ])
    expect(replaced.eventRuntime.rumors).toHaveLength(1)
    expect(replaced.eventRuntime.rumors[0]?.text).toBe('潮水又退了半尺。')
  })

  it('resets rank when leaving a faction and accumulates numeric state safely', () => {
    const state = createTestState()
    state.campaign.world.factions['faction.longhan.dragon'] = {
      id: 'faction.longhan.dragon',
      membership: true,
      rank: 3,
      contribution: 10,
      reputation: 5,
      fortune: 2,
      flags: {},
    }
    const next = applyEffects(state, [
      { kind: 'changeFactionState', factionId: 'faction.longhan.dragon', membership: false },
      { kind: 'changeResource', resource: 'spirit_stones', amount: -5 },
      { kind: 'changeResource', resource: 'ore', amount: 12 },
    ])

    expect(next.campaign.world.factions['faction.longhan.dragon']?.rank).toBe(0)
    expect(next.player.resources.spirit_stones).toBe(0)
    expect(next.player.resources.ore).toBe(12)
  })

  it('tracks favor tiers with reasons, statuses with expiry and item counts', () => {
    const state = createTestState()
    state.clock.elapsedMonths = 18
    state.player.inventory['item.longhan.dragon_scale'] = 1
    const next = applyEffects(
      state,
      [
        {
          kind: 'changeFavorTier',
          partnerId: 'partner.longhan.ao_guang',
          delta: 2,
          reason: '替她守住了龙门一夜',
        },
        { kind: 'applyStatus', statusId: 'status.longhan.tide_brand', months: 3 },
        { kind: 'grantItem', itemId: 'item.longhan.dragon_scale', count: 2 },
        { kind: 'removeItem', itemId: 'item.longhan.dragon_scale', count: 1 },
        { kind: 'learnTechnique', techniqueId: 'technique.longhan.tide_script' },
        { kind: 'learnTechnique', techniqueId: 'technique.longhan.tide_script' },
      ],
      { sourceEventId: 'event.longhan.dragon_gate' },
    )

    expect(next.player.partnerFavor['partner.longhan.ao_guang']).toBe(2)
    expect(next.eventRuntime.favorLog).toEqual([
      {
        partnerId: 'partner.longhan.ao_guang',
        delta: 2,
        reason: '替她守住了龙门一夜',
        createdAtMonths: 18,
        sourceEventId: 'event.longhan.dragon_gate',
      },
    ])
    expect(next.player.statuses).toEqual([
      {
        id: 'status.longhan.tide_brand',
        monthsRemaining: 3,
        source: 'event.longhan.dragon_gate',
      },
    ])
    expect(next.player.inventory['item.longhan.dragon_scale']).toBe(2)
    expect(next.player.techniqueIds).toEqual(['technique.longhan.tide_script'])

    const cleared = applyEffects(next, [
      { kind: 'applyStatus', statusId: 'status.longhan.tide_brand', months: 0 },
      { kind: 'removeItem', itemId: 'item.longhan.dragon_scale', count: 99 },
    ])
    expect(cleared.player.statuses).toEqual([])
    expect(cleared.player.inventory['item.longhan.dragon_scale']).toBeUndefined()
  })

  it('unlocks cave buildings, memories and pending encounters', () => {
    const state = createTestState()
    state.clock.elapsedMonths = 30
    const next = applyEffects(
      state,
      [
        { kind: 'unlockBuilding', caveBuildingId: 'building.longhan.spirit_garden', level: 2 },
        { kind: 'unlockBuilding', caveBuildingId: 'building.longhan.spirit_garden', level: 1 },
        { kind: 'unlockBuilding', caveBuildingId: 'building.longhan.quiet_room', level: 9 },
        { kind: 'addMemory', memoryId: 'memory.longhan.dragon_gate', text: '你在龙门下没有退。' },
        { kind: 'startCombat', encounterId: 'encounter.longhan.beast', fleeAllowed: false },
      ],
      { sourceEventId: 'event.longhan.first_beast_tide' },
    )

    expect(next.cave?.buildings).toEqual({
      'building.longhan.spirit_garden': 2,
      'building.longhan.quiet_room': 3,
    })
    expect(next.campaign.legacy.memories).toEqual([
      {
        id: 'memory.longhan.dragon_gate',
        text: '你在龙门下没有退。',
        createdAtMonths: 30,
        sourceEventId: 'event.longhan.first_beast_tide',
      },
    ])
    expect(next.eventRuntime.pendingEncounters).toEqual([
      {
        id: 'encounter.1',
        encounterId: 'encounter.longhan.beast',
        fleeAllowed: false,
        createdAtMonths: 30,
        sourceEventId: 'event.longhan.first_beast_tide',
      },
    ])
  })

  it('bonds a partner once and opens the named cave', () => {
    const state = createTestState()
    const next = applyEffects(state, [
      { kind: 'bondPartner', partnerId: 'partner.longhan.ao_guang' },
      { kind: 'bondPartner', partnerId: 'partner.longhan.ao_guang' },
      { kind: 'unlockCave', caveId: 'cave.longhan.tide_grotto' },
      { kind: 'unlockCave', caveId: 'cave.longhan.tide_grotto' },
    ])

    expect(next.player.partnerIds).toEqual(['partner.longhan.ao_guang'])
    expect(next.cave).toMatchObject({
      id: 'cave.longhan.tide_grotto',
      buildings: {},
      spiritVeinLevel: 1,
      discipleIds: [],
    })
    expect(state.player.partnerIds).toEqual([])
    expect(state.cave).toBeUndefined()
  })

  it('rejects unknown effect kinds', () => {
    const state = createTestState()
    expect(() =>
      applyEffects(state, [{ kind: 'summonDragon' } as unknown as Effect]),
    ).toThrow('未知效果类型')
  })
})
