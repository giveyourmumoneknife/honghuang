import { describe, expect, it } from 'vitest'
import { DEFAULT_IDLE_RATES, createIdleState } from '@/core/idle'
import { simulateOffline, type OfflineGate } from '@/core/offline'
import { createClock, pushPauseToken, REAL_SECONDS_PER_MONTH } from '@/core/time'
import type { PauseToken } from '@/types/state'

/** 一小时真实时间对应的游戏月数。 */
const MONTHS_PER_HOUR = 3600 / REAL_SECONDS_PER_MONTH

const settings = {
  pauseMode: 'story' as const,
  offlineCapHours: 8,
  offlineEfficiency: 0.5,
}

const storyGate: OfflineGate = {
  id: 'gate.story.longhan',
  kind: 'story',
  label: '龙门之变',
  atMonths: 300,
  eventId: 'event.longhan.dragon_gate',
}

const storyToken: PauseToken = {
  id: 'story-active',
  source: 'story',
  label: '待决剧情',
}

describe('offline settlement', () => {
  it('caps at eight hours and pays half efficiency', () => {
    const result = simulateOffline({
      clock: createClock(),
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      settings,
      offlineSeconds: 10 * 3600,
    })

    expect(result.report.cappedByLimit).toBe(true)
    expect(result.report.elapsedSeconds).toBe(8 * 3600)
    expect(result.report.gameMonths).toBe(8 * MONTHS_PER_HOUR)
    expect(result.report.cultivation).toBe(4 * MONTHS_PER_HOUR)
    expect(result.report.resources.spirit_stones).toBe(4 * MONTHS_PER_HOUR)
    expect(result.report.resources.spirit_herbs).toBe(MONTHS_PER_HOUR)
    expect(result.report.travelProgress).toBe(100)
    expect(result.report.travelReady).toBe(true)
    expect(result.clock.elapsedMonths).toBe(8 * MONTHS_PER_HOUR)
    expect(result.idle.slots.cultivation.months).toBe(8 * MONTHS_PER_HOUR)
  })

  it('does not flag the limit when the absence is within the cap', () => {
    const result = simulateOffline({
      clock: createClock(),
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      settings,
      offlineSeconds: 2 * 3600,
    })

    expect(result.report.cappedByLimit).toBe(false)
    expect(result.report.gameMonths).toBe(2 * MONTHS_PER_HOUR)
    expect(result.report.cultivation).toBe(MONTHS_PER_HOUR)
  })

  it('stops at the next story gate and pauses the clock', () => {
    const result = simulateOffline({
      clock: createClock(),
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      gates: [storyGate],
      settings,
      offlineSeconds: 10 * 3600,
    })

    expect(result.report.stoppedByGate).toEqual(storyGate)
    expect(result.report.triggeredGates).toEqual([storyGate])
    expect(result.report.gameMonths).toBe(storyGate.atMonths)
    expect(result.report.cultivation).toBe(storyGate.atMonths / 2)
    expect(result.clock.tokens).toHaveLength(1)
    expect(result.clock.tokens[0]).toMatchObject({
      id: `offline-gate:${storyGate.id}`,
      source: 'story',
      label: storyGate.label,
      eventId: storyGate.eventId,
    })

    const again = simulateOffline({
      clock: result.clock,
      idle: result.idle,
      rates: DEFAULT_IDLE_RATES,
      gates: [storyGate],
      settings,
      offlineSeconds: 3600,
    })
    expect(again.report.paused).toBe(true)
    expect(again.report.gameMonths).toBe(0)
  })

  it('ignores gates beyond the offline cap', () => {
    const farGate: OfflineGate = {
      id: 'gate.far',
      kind: 'era',
      label: '龙汉劫末',
      atMonths: 50000,
    }
    const result = simulateOffline({
      clock: createClock(),
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      gates: [farGate],
      settings,
      offlineSeconds: 10 * 3600,
    })

    expect(result.report.stoppedByGate).toBeNull()
    expect(result.report.triggeredGates).toEqual([])
    expect(result.clock.tokens).toEqual([])
    expect(result.report.gameMonths).toBe(8 * MONTHS_PER_HOUR)
  })

  it('stops at all gates sharing the same month and ignores stale gates', () => {
    const first: OfflineGate = { ...storyGate, id: 'gate.a', label: '甲', atMonths: 200 }
    const second: OfflineGate = { ...storyGate, id: 'gate.b', label: '乙', atMonths: 200 }
    const later: OfflineGate = { ...storyGate, id: 'gate.c', label: '丙', atMonths: 300 }
    const stale: OfflineGate = { ...storyGate, id: 'gate.stale', atMonths: 100 }
    const clock = { ...createClock(), elapsedMonths: 100 }
    const result = simulateOffline({
      clock,
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      gates: [later, first, second, stale],
      settings,
      offlineSeconds: 6000,
    })

    expect(result.report.gameMonths).toBe(100)
    expect(result.clock.elapsedMonths).toBe(200)
    expect(result.report.triggeredGates).toHaveLength(2)
    expect(result.report.stoppedByGate?.id).toBe('gate.a')
    expect(result.clock.tokens.map((token) => token.id)).toEqual([
      'offline-gate:gate.a',
      'offline-gate:gate.b',
    ])
  })

  it('does not advance while a blocking token is present', () => {
    const clock = pushPauseToken(createClock(), storyToken)
    const idle = createIdleState()
    const result = simulateOffline({
      clock,
      idle,
      rates: DEFAULT_IDLE_RATES,
      settings,
      offlineSeconds: 3600,
    })

    expect(result.report.paused).toBe(true)
    expect(result.report.blockedBy).toEqual([storyToken])
    expect(result.report.gameMonths).toBe(0)
    expect(result.clock).toBe(clock)
    expect(result.idle).toBe(idle)
  })

  it('continues when the player disabled automatic story pauses', () => {
    const result = simulateOffline({
      clock: pushPauseToken(createClock(), storyToken),
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      settings: { ...settings, pauseMode: 'none' },
      offlineSeconds: 3600,
    })

    expect(result.report.paused).toBe(false)
    expect(result.report.gameMonths).toBe(MONTHS_PER_HOUR)
  })

  it('uses the clock speed unless an offline speed is supplied', () => {
    const fast = simulateOffline({
      clock: { ...createClock(), speed: 4 },
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      settings,
      offlineSeconds: 3600,
    })
    expect(fast.report.speed).toBe(4)
    expect(fast.report.gameMonths).toBe(4 * MONTHS_PER_HOUR)
    expect(fast.report.cultivation).toBe(2 * MONTHS_PER_HOUR)

    const base = simulateOffline({
      clock: { ...createClock(), speed: 16 },
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      settings,
      offlineSpeed: 1,
      offlineSeconds: 3600,
    })
    expect(base.report.speed).toBe(1)
    expect(base.report.gameMonths).toBe(MONTHS_PER_HOUR)
  })

  it('clamps efficiency and handles a zero cap', () => {
    const full = simulateOffline({
      clock: createClock(),
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      settings: { ...settings, offlineEfficiency: 2 },
      offlineSeconds: 3600,
    })
    expect(full.report.efficiency).toBe(1)
    expect(full.report.cultivation).toBe(MONTHS_PER_HOUR)

    const fallback = simulateOffline({
      clock: createClock(),
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      settings: { ...settings, offlineEfficiency: Number.NaN },
      offlineSeconds: 3600,
    })
    expect(fallback.report.efficiency).toBe(0.5)

    const noCap = simulateOffline({
      clock: createClock(),
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      settings: { ...settings, offlineCapHours: 0 },
      offlineSeconds: 3600,
    })
    expect(noCap.report.gameMonths).toBe(0)
    expect(noCap.report.cappedByLimit).toBe(true)
  })

  it('handles invalid absence durations without side effects', () => {
    const clock = createClock()
    const idle = createIdleState()
    const result = simulateOffline({
      clock,
      idle,
      rates: DEFAULT_IDLE_RATES,
      settings,
      offlineSeconds: Number.NaN,
    })

    expect(result.report.requestedSeconds).toBe(0)
    expect(result.report.gameMonths).toBe(0)
    expect(result.clock).toBe(clock)
    expect(result.idle).toBe(idle)
    expect(result.clock.tokens).toEqual([])
  })
})
