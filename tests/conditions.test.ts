import { describe, expect, it } from 'vitest'
import { evaluateRequirements, requirementMatches } from '@/core/conditions'
import type { Requirement } from '@/types/dsl'
import { createTestState } from './helpers/stateFactory'

describe('condition DSL', () => {
  it('reads flags from world state and supports exact and truthy checks', () => {
    const state = createTestState()
    state.campaign.world.flags['longhan.oath'] = true
    state.campaign.world.flags['longhan.role'] = 'witness'

    expect(requirementMatches(state, { kind: 'flag', flag: 'longhan.oath' })).toBe(true)
    expect(
      requirementMatches(state, { kind: 'flag', flag: 'longhan.role', value: 'witness' }),
    ).toBe(true)
    expect(
      requirementMatches(state, { kind: 'flag', flag: 'longhan.role', value: 'leader' }),
    ).toBe(false)
    expect(requirementMatches(state, { kind: 'flag', flag: 'longhan.missing' })).toBe(false)
    expect(
      requirementMatches(state, { kind: 'flag', flag: 'longhan.missing', value: false }),
    ).toBe(false)
  })

  it('checks era and phase together with the campaign clock', () => {
    const state = createTestState()
    state.campaign.currentEra = 'era.longhan'
    state.campaign.world.phaseId = 'strife'

    expect(requirementMatches(state, { kind: 'era', eraId: 'era.longhan' })).toBe(true)
    expect(
      requirementMatches(state, { kind: 'phase', eraId: 'era.longhan', phaseId: 'strife' }),
    ).toBe(true)
    expect(
      requirementMatches(state, { kind: 'phase', eraId: 'era.longhan', phaseId: 'dawn' }),
    ).toBe(false)
    expect(
      requirementMatches(state, { kind: 'phase', eraId: 'era.prologue', phaseId: 'strife' }),
    ).toBe(false)
  })

  it('checks faction membership and minimum rank', () => {
    const state = createTestState()
    state.campaign.world.factions['faction.longhan.dragon'] = {
      id: 'faction.longhan.dragon',
      membership: true,
      rank: 2,
      contribution: 0,
      reputation: 0,
      fortune: 0,
      flags: {},
    }

    expect(
      requirementMatches(state, {
        kind: 'factionMembership',
        factionId: 'faction.longhan.dragon',
      }),
    ).toBe(true)
    expect(
      requirementMatches(state, {
        kind: 'factionMembership',
        factionId: 'faction.longhan.dragon',
        rankAtLeast: 2,
      }),
    ).toBe(true)
    expect(
      requirementMatches(state, {
        kind: 'factionMembership',
        factionId: 'faction.longhan.dragon',
        rankAtLeast: 3,
      }),
    ).toBe(false)
    expect(
      requirementMatches(state, {
        kind: 'factionMembership',
        factionId: 'faction.longhan.phoenix',
      }),
    ).toBe(false)
  })

  it('checks region unlock and region-local flags', () => {
    const state = createTestState()
    state.campaign.world.regions['region.longhan.four_seas'] = {
      id: 'region.longhan.four_seas',
      unlocked: true,
      visited: true,
      flags: { tide: 'high' },
      unlockedSiteIds: [],
      exploredSites: {},
    }

    expect(
      requirementMatches(state, {
        kind: 'regionUnlocked',
        regionId: 'region.longhan.four_seas',
      }),
    ).toBe(true)
    expect(
      requirementMatches(state, {
        kind: 'regionState',
        regionId: 'region.longhan.four_seas',
        key: 'tide',
        value: 'high',
      }),
    ).toBe(true)
    expect(
      requirementMatches(state, {
        kind: 'regionState',
        regionId: 'region.longhan.four_seas',
        key: 'tide',
        value: 'low',
      }),
    ).toBe(false)
    expect(
      requirementMatches(state, {
        kind: 'regionState',
        regionId: 'region.longhan.rahu_abyss',
        key: 'tide',
        value: 'high',
      }),
    ).toBe(false)
  })

  it('compares realm and stage on a combined ladder', () => {
    const state = createTestState()
    state.player.realm = 'foundation'
    state.player.stage = 2

    expect(
      requirementMatches(state, { kind: 'realm', minRealm: 'foundation', minStage: 1 }),
    ).toBe(true)
    expect(
      requirementMatches(state, { kind: 'realm', minRealm: 'foundation', minStage: 2 }),
    ).toBe(true)
    expect(
      requirementMatches(state, { kind: 'realm', minRealm: 'foundation', minStage: 3 }),
    ).toBe(false)
    expect(requirementMatches(state, { kind: 'realm', minRealm: 'golden_core' })).toBe(false)
    expect(requirementMatches(state, { kind: 'realm', minRealm: 'qi_refining' })).toBe(true)
  })

  it('checks inventory count, known techniques and partner favor tiers', () => {
    const state = createTestState()
    state.player.inventory['item.longhan.dragon_scale'] = 2
    state.player.techniqueIds.push('technique.longhan.tide_script')
    state.player.partnerFavor['partner.longhan.ao_guang'] = 3

    expect(
      requirementMatches(state, { kind: 'item', itemId: 'item.longhan.dragon_scale' }),
    ).toBe(true)
    expect(
      requirementMatches(state, {
        kind: 'item',
        itemId: 'item.longhan.dragon_scale',
        count: 3,
      }),
    ).toBe(false)
    expect(
      requirementMatches(state, {
        kind: 'technique',
        techniqueId: 'technique.longhan.tide_script',
      }),
    ).toBe(true)
    expect(
      requirementMatches(state, {
        kind: 'partnerFavor',
        partnerId: 'partner.longhan.ao_guang',
        minTier: 3,
      }),
    ).toBe(true)
    expect(
      requirementMatches(state, {
        kind: 'partnerFavor',
        partnerId: 'partner.longhan.ao_guang',
        minTier: 4,
      }),
    ).toBe(false)
    expect(
      requirementMatches(state, {
        kind: 'partnerFavor',
        partnerId: 'partner.longhan.unknown',
        minTier: 0,
      }),
    ).toBe(false)
  })

  it('composes all, any and not, and reports the failing leaves', () => {
    const state = createTestState()
    state.campaign.world.flags['longhan.ready'] = true
    const requirements: Requirement[] = [
      {
        kind: 'all',
        of: [
          { kind: 'era', eraId: 'era.longhan' },
          { kind: 'flag', flag: 'longhan.ready' },
        ],
      },
      {
        kind: 'any',
        of: [
          { kind: 'realm', minRealm: 'golden_core' },
          { kind: 'regionUnlocked', regionId: 'region.longhan.four_seas' },
        ],
      },
      { kind: 'not', of: { kind: 'flag', flag: 'longhan.forbidden' } },
    ]

    const evaluation = evaluateRequirements(state, requirements)
    expect(evaluation.ok).toBe(false)
    expect(evaluation.unmet).toHaveLength(1)
    expect(evaluation.unmet[0]?.kind).toBe('any')

    state.campaign.world.regions['region.longhan.four_seas'] = {
      id: 'region.longhan.four_seas',
      unlocked: true,
      visited: false,
      flags: {},
      unlockedSiteIds: [],
      exploredSites: {},
    }
    expect(evaluateRequirements(state, requirements).ok).toBe(true)
  })

  it('treats empty all as true, empty any as false, and rejects unknown kinds', () => {
    const state = createTestState()
    expect(requirementMatches(state, { kind: 'all', of: [] })).toBe(true)
    expect(requirementMatches(state, { kind: 'any', of: [] })).toBe(false)
    expect(() =>
      requirementMatches(state, { kind: 'mystery' } as unknown as Requirement),
    ).toThrow('未知条件类型')
  })
})
