import { describe, expect, it } from 'vitest'
import { getContentRegistry } from '@/data'
import {
  BODY_MAX_STAGE,
  BODY_STAGE_THRESHOLDS,
  BLOODLINE_MAX_PURITY,
  bloodlineContribution,
  bloodlineSkillForCombat,
  bodyBalanceInfo,
  bodyPathDefinition,
  bodyProgressInfo,
  bodyStageDefinition,
  bodyTemperFromBattle,
  bodyTemperFromCultivation,
  physiqueContribution,
} from '@/core/body'
import {
  acquireBloodline,
  applyBodyTemperGain,
  attemptBodyBreakthrough,
  awakenBloodline,
  bodyGainMultiplier,
  characterBodyView,
  refineBloodline,
  setBodyPath,
  severBloodline,
  temperBody,
} from '@/core/bodyActions'
import { SAVE_VERSION, checksum, migrateSaveEnvelope } from '@/core/save'
import type { BodyPath, GameSaveData } from '@/types/state'
import { createTestState } from './helpers/stateFactory'

const registry = getContentRegistry()
const BLOODLINE_ID = 'bloodline.longhan.canglan'
const RICH_RESOURCES = {
  spirit_stones: 1000,
  spirit_herbs: 1000,
  ore: 0,
  beast_cores: 0,
  contribution: 0,
  merit: 0,
  karma: 0,
}

function withPlayer(overrides: Partial<GameSaveData['player']> = {}): GameSaveData {
  const base = createTestState()
  return {
    ...base,
    player: {
      ...base.player,
      resources: { ...base.player.resources },
      ...overrides,
    },
  }
}

function bodyOf(
  overrides: Partial<GameSaveData['player']['body']> = {},
): GameSaveData['player']['body'] {
  return { temper: 0, stage: 0, path: 'dual', flags: {}, ...overrides }
}

describe('body progression', () => {
  it('defines six stages with monotonic thresholds', () => {
    expect(BODY_STAGE_THRESHOLDS).toHaveLength(BODY_MAX_STAGE + 1)
    expect(bodyStageDefinition(-1).stage).toBe(0)
    expect(bodyStageDefinition(99).stage).toBe(5)
    for (let stage = 1; stage < BODY_STAGE_THRESHOLDS.length; stage += 1) {
      expect(BODY_STAGE_THRESHOLDS[stage]).toBeGreaterThan(
        BODY_STAGE_THRESHOLDS[stage - 1],
      )
    }
  })

  it('reports progress, readiness and the cap', () => {
    const almost = bodyProgressInfo(119, 0)
    expect(almost.ready).toBe(false)
    expect(almost.progress).toBeGreaterThan(0.9)

    const ready = bodyProgressInfo(120, 0)
    expect(ready.ready).toBe(true)
    expect(ready.threshold).toBe(120)

    const capped = bodyProgressInfo(9999, BODY_MAX_STAGE)
    expect(capped.atMax).toBe(true)
    expect(capped.progress).toBe(1)
  })

  it('derives all five law-body balance states', () => {
    expect(bodyBalanceInfo({ stage: 0 }, 'mortal', 1).kind).toBe('harmony')
    expect(bodyBalanceInfo({ stage: 0 }, 'qi_refining', 1).kind).toBe('lawFlood')
    expect(bodyBalanceInfo({ stage: 5 }, 'mortal', 1).kind).toBe('bodyFlood')
    expect(bodyBalanceInfo({ stage: 0 }, 'mortal', 3).kind).toBe('lawLean')
    expect(bodyBalanceInfo({ stage: 1 }, 'mortal', 1).kind).toBe('bodyLean')
  })

  it('exposes the three body paths and falls back to dual', () => {
    expect(bodyPathDefinition('law')).toMatchObject({ lawMultiplier: 1.1, bodyRatio: 0.12 })
    expect(bodyPathDefinition('dual')).toMatchObject({ lawMultiplier: 0.95, bodyRatio: 0.45 })
    expect(bodyPathDefinition('body')).toMatchObject({ lawMultiplier: 0.75, bodyRatio: 1 })
    expect(bodyPathDefinition('unknown' as BodyPath).id).toBe('dual')
  })

  it('converts cultivation into tempering with the path and balance multipliers', () => {
    expect(bodyTemperFromCultivation(100, 0.45)).toBe(45)
    expect(bodyTemperFromBattle(100, 0.45)).toBeCloseTo(24.75)
    expect(bodyTemperFromCultivation(0, 1)).toBe(0)
    expect(bodyTemperFromCultivation(-5, 1)).toBe(0)

    const state = withPlayer({ realm: 'mortal', stage: 1 })
    expect(bodyGainMultiplier(state, registry)).toBeCloseTo(0.486)

    const gain = applyBodyTemperGain(state, 100, registry)
    expect(gain).toBeCloseTo(48.6)
    expect(state.player.body.temper).toBeCloseTo(48.6)
    expect(applyBodyTemperGain(state, -1, registry)).toBe(0)
  })
})

describe('physique and bloodline contributions', () => {
  it('adds physique stats and unlocks awakenings by body stage', () => {
    const physique = registry.physiques.get('physique.longhan.chaos_womb')
    expect(physique).toBeDefined()
    if (!physique) return

    const stageTwo = physiqueContribution(physique, 2)
    expect(stageTwo.stats.health).toBe(14)
    expect(stageTwo.mods.regen).toBe(1.5)
    expect(stageTwo.awakenings.filter((entry) => entry.unlocked).map((entry) => entry.stage)).toEqual([
      2,
    ])

    const stageThree = physiqueContribution(physique, 3)
    expect(stageThree.stats.attack).toBe(5)
    expect(stageThree.stats.defense).toBe(4)
    expect(stageThree.awakenings.filter((entry) => entry.unlocked)).toHaveLength(2)
  })

  it('stacks only reached bloodline stages and scales the skill', () => {
    const definition = registry.bloodlines.get(BLOODLINE_ID)
    expect(definition).toBeDefined()
    if (!definition) return

    const stageOne = bloodlineContribution(definition, {
      id: BLOODLINE_ID,
      purity: 20,
      stage: 1,
      flags: {},
    })
    expect(stageOne.stats.health).toBe(20)
    expect(stageOne.stats.defense).toBe(2)

    const stageTwo = bloodlineContribution(definition, {
      id: BLOODLINE_ID,
      purity: 40,
      stage: 2,
      flags: {},
    })
    expect(stageTwo.stats.health).toBe(65)
    expect(stageTwo.stats.defense).toBe(6)
    expect(stageTwo.stats.spirit).toBe(3)

    expect(bloodlineSkillForCombat(definition, 1)).toBeUndefined()
    expect(bloodlineSkillForCombat(definition, 2)?.multiplier).toBe(1.9)
    expect(bloodlineSkillForCombat(definition, 3)?.multiplier).toBe(2.1)
  })

  it('builds a body view with paths, balance and no active bloodline', () => {
    const state = withPlayer()
    const view = characterBodyView(state, registry)

    expect(view.physiqueId).toBe('physique.longhan.mortal')
    expect(view.paths).toHaveLength(3)
    expect(view.paths.filter((entry) => entry.active).map((entry) => entry.id)).toEqual(['dual'])
    expect(view.bloodline.active).toBe(false)
    expect(view.bloodline.options).toHaveLength(registry.bloodlines.size)
    expect(view.bodyTemperMultiplier).toBeGreaterThan(0)
  })
})

describe('body actions', () => {
  it('tempers body with cultivation and resources, then enforces the cooldown', () => {
    const poor = temperBody(withPlayer(), registry)
    expect(poor.ok).toBe(false)

    const state = withPlayer({ cultivation: 1000, resources: RICH_RESOURCES })
    const result = temperBody(state, registry)
    expect(result.ok).toBe(true)
    expect(result.state.player.cultivation).toBe(940)
    expect(result.state.player.body.temper).toBeGreaterThan(0)
    expect(result.state.player.body.flags['temper.readyAt']).toBe(1)
    expect(result.state.player.resources.spirit_stones).toBe(994)
    expect(result.state.player.resources.spirit_herbs).toBe(998)

    const again = temperBody(result.state, registry)
    expect(again.ok).toBe(false)
  })

  it('switches path once and then locks the change behind its cooldown', () => {
    const switched = setBodyPath(withPlayer(), 'law')
    expect(switched.ok).toBe(true)
    expect(switched.state.player.body.path).toBe('law')
    expect(switched.state.player.body.flags['path.readyAt']).toBe(6)

    expect(setBodyPath(switched.state, 'body').ok).toBe(false)
    expect(setBodyPath(withPlayer(), 'dual').ok).toBe(false)
  })

  it('requires enough temper before a breakthrough and resolves it safely', () => {
    const notReady = withPlayer({ body: bodyOf({ temper: 100 }) })
    expect(attemptBodyBreakthrough(notReady, registry).ok).toBe(false)

    const ready = withPlayer({ health: 100000, body: bodyOf({ temper: 120 }) })
    const result = attemptBodyBreakthrough(ready, registry)
    expect(result.ok).toBe(true)
    const advanced = result.state.player.body.stage === 1
    const backlashed = result.state.player.statuses.some(
      (status) => status.id === 'status.longhan.body_backlash',
    )
    expect(advanced || backlashed).toBe(true)
  })

  it('acquires a bloodline only with the right body stage and materials', () => {
    const weak = withPlayer({
      cultivation: 1000,
      resources: RICH_RESOURCES,
      inventory: { 'item.longhan.dragon_scale': 2 },
    })
    expect(acquireBloodline(weak, BLOODLINE_ID, registry).ok).toBe(false)

    const ready = withPlayer({
      cultivation: 1000,
      resources: RICH_RESOURCES,
      inventory: { 'item.longhan.dragon_scale': 2 },
      body: bodyOf({ stage: 1 }),
    })
    const result = acquireBloodline(ready, BLOODLINE_ID, registry)
    expect(result.ok).toBe(true)
    expect(result.state.player.bloodline).toMatchObject({
      id: BLOODLINE_ID,
      purity: 20,
      stage: 0,
    })
    expect(result.state.player.cultivation).toBe(840)
    expect(result.state.player.inventory['item.longhan.dragon_scale']).toBeUndefined()
    expect(acquireBloodline(result.state, BLOODLINE_ID, registry).ok).toBe(false)
  })

  it('refines purity, stops at the cap and awakens with backlash on failure', () => {
    const dormant = withPlayer({
      cultivation: 1000,
      resources: RICH_RESOURCES,
      bloodline: { id: BLOODLINE_ID, purity: 20, stage: 0, flags: {} },
    })
    const refined = refineBloodline(dormant, registry)
    expect(refined.ok).toBe(true)
    expect(refined.state.player.bloodline?.purity).toBe(28)
    expect(refined.state.player.bloodline?.stage).toBe(0)

    const capped = withPlayer({
      cultivation: 1000,
      resources: RICH_RESOURCES,
      bloodline: { id: BLOODLINE_ID, purity: BLOODLINE_MAX_PURITY, stage: 1, flags: {} },
    })
    expect(refineBloodline(capped, registry).ok).toBe(false)

    const tooThin = withPlayer({
      bloodline: { id: BLOODLINE_ID, purity: 19, stage: 0, flags: {} },
      body: bodyOf({ stage: 1 }),
    })
    expect(awakenBloodline(tooThin, registry).ok).toBe(false)

    const ready = withPlayer({
      health: 100000,
      bloodline: { id: BLOODLINE_ID, purity: 20, stage: 0, flags: {} },
      body: bodyOf({ stage: 1 }),
    })
    const awakened = awakenBloodline(ready, registry)
    expect(awakened.ok).toBe(true)
    const woke = (awakened.state.player.bloodline?.stage ?? 0) >= 1
    const backlash = awakened.state.player.statuses.some(
      (status) => status.id === 'status.longhan.bloodline_backlash',
    )
    expect(woke || backlash).toBe(true)
  })

  it('severs the bloodline and records the choice', () => {
    const state = withPlayer({
      cultivation: 1000,
      resources: RICH_RESOURCES,
      bloodline: { id: BLOODLINE_ID, purity: 40, stage: 1, flags: {} },
    })
    const result = severBloodline(state, registry)
    expect(result.ok).toBe(true)
    expect(result.state.player.bloodline).toBeUndefined()
    expect(result.state.player.cultivation).toBe(880)
    expect(result.state.player.flags['body.severedBloodline']).toBe(BLOODLINE_ID)
    expect(severBloodline(result.state, registry).ok).toBe(false)
  })
})

describe('v14 body migration', () => {
  it('fills physique and body defaults for old saves without touching the bloodline', () => {
    const legacy = {
      schemaVersion: 13,
      player: { name: '旧修', realm: 'qi_refining', stage: 1 },
    }
    const envelope = {
      version: 13,
      createdAt: '2026-11-21T00:00:00.000Z',
      updatedAt: '2026-11-21T00:00:00.000Z',
      checksum: checksum(legacy),
      data: legacy,
    }

    const migrated = migrateSaveEnvelope(envelope)
    expect(migrated.version).toBe(SAVE_VERSION)
    const player = (migrated.data as { player: GameSaveData['player'] }).player
    expect(player.physiqueId).toBe('physique.longhan.mortal')
    expect(player.body).toMatchObject({ temper: 0, stage: 0, path: 'dual' })
    expect(player.bloodline).toBeUndefined()
  })
})
