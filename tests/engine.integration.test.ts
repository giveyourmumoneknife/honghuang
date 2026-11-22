import { describe, expect, it } from 'vitest'
import { DEFAULT_IDLE_RATES, createIdleState } from '@/core/idle'
import { simulateOffline, type OfflineGate } from '@/core/offline'
import { Rng } from '@/core/rng'
import { SAVE_VERSION } from '@/core/save'
import { SaveSlotStore } from '@/core/saveSlots'
import { createMemorySaveStorage } from '@/core/saveStorage'
import { createClock, REAL_SECONDS_PER_MONTH, releasePauseToken } from '@/core/time'
import type { GameClock, IdleState, RngState } from '@/types/state'

/** 一小时真实时间对应的游戏月数。 */
const MONTHS_PER_HOUR = 3600 / REAL_SECONDS_PER_MONTH

const settings = {
  pauseMode: 'story' as const,
  offlineCapHours: 8,
  offlineEfficiency: 0.5,
}

const gate: OfflineGate = {
  id: 'gate.integration',
  kind: 'breakthrough',
  label: '金丹门槛',
  atMonths: 300,
}

describe('M2 engine integration', () => {
  it('settles offline, saves the result, loads it and keeps idling', async () => {
    const offline = simulateOffline({
      clock: createClock(),
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      settings,
      offlineSeconds: 8 * 3600,
    })
    const storage = createMemorySaveStorage()
    const store = new SaveSlotStore(storage)
    const saveData = {
      schemaVersion: SAVE_VERSION,
      clock: offline.clock,
      idle: offline.idle,
      settings,
      lastSavedAt: '2026-11-21T00:00:00.000Z',
    }

    await store.saveAuto(saveData)
    const loaded = await store.load('auto')
    expect(loaded.ok).toBe(true)
    if (!loaded.ok) return

    const data = loaded.envelope.data as {
      clock: GameClock
      idle: IdleState
      settings: typeof settings
    }
    expect(data.clock).toEqual(offline.clock)
    expect(data.idle).toEqual(offline.idle)

    const continued = simulateOffline({
      clock: data.clock,
      idle: data.idle,
      rates: DEFAULT_IDLE_RATES,
      settings: data.settings,
      offlineSeconds: 3600,
    })
    expect(continued.report.gameMonths).toBe(MONTHS_PER_HOUR)
    expect(continued.report.cultivation).toBe(MONTHS_PER_HOUR / 2)
    expect(continued.clock.elapsedMonths).toBe(9 * MONTHS_PER_HOUR)
  })

  it('stops at a gate, releases its token and resumes the same idle state', () => {
    const stopped = simulateOffline({
      clock: createClock(),
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      gates: [gate],
      settings,
      offlineSeconds: 10 * 3600,
    })

    expect(stopped.report.stoppedByGate).toEqual(gate)
    expect(stopped.clock.elapsedMonths).toBe(gate.atMonths)
    const token = stopped.clock.tokens[0]
    expect(token?.id).toBe(`offline-gate:${gate.id}`)

    const released = releasePauseToken(stopped.clock, token?.id ?? '')
    const resumed = simulateOffline({
      clock: released,
      idle: stopped.idle,
      rates: DEFAULT_IDLE_RATES,
      settings,
      offlineSeconds: 3600,
    })

    expect(resumed.report.paused).toBe(false)
    expect(resumed.clock.elapsedMonths).toBe(gate.atMonths + MONTHS_PER_HOUR)
    expect(resumed.idle.slots.cultivation.months).toBe(gate.atMonths + MONTHS_PER_HOUR)
  })

  it('resumes the exact seeded random stream from a save', async () => {
    const rng = new Rng(20261121)
    rng.next()
    rng.next()
    const snapshot = rng.getState()
    const storage = createMemorySaveStorage()
    const store = new SaveSlotStore(storage)

    await store.save('slot1', { rng: snapshot })
    const loaded = await store.load('slot1')
    expect(loaded.ok).toBe(true)
    if (!loaded.ok) return

    const data = loaded.envelope.data as { rng: RngState }
    const resumed = Rng.fromState(data.rng)
    expect(resumed.next()).toBe(rng.next())
    expect(resumed.getState().draws).toBe(snapshot.draws + 1)
  })
})
