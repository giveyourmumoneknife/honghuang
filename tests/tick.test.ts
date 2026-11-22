import { describe, expect, it } from 'vitest'
import { DEFAULT_IDLE_RATES, createIdleState } from '@/core/idle'
import { tickEngine } from '@/core/tick'
import { createClock, pushPauseToken, REAL_SECONDS_PER_MONTH } from '@/core/time'

describe('engine tick', () => {
  it('advances clock and all three slots for one second', () => {
    const result = tickEngine({
      clock: createClock(),
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      pausePolicy: 'story',
      realSeconds: REAL_SECONDS_PER_MONTH,
    })

    expect(result.monthsAdvanced).toBe(1)
    expect(result.clock.elapsedMonths).toBe(1)
    expect(result.idle.slots.cultivation.months).toBe(1)
    expect(result.delta.cultivation).toBe(1)
    expect(result.delta.resources.spirit_stones).toBe(1)
    expect(result.delta.resources.spirit_herbs).toBe(0.25)
    expect(result.delta.travelProgress).toBe(0.5)
  })

  it('applies speed to the whole tick', () => {
    const result = tickEngine({
      clock: { ...createClock(), speed: 16 },
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      pausePolicy: 'story',
      realSeconds: REAL_SECONDS_PER_MONTH,
    })

    expect(result.monthsAdvanced).toBe(16)
    expect(result.delta.cultivation).toBe(16)
    expect(result.idle.slots.cave.months).toBe(16)
  })

  it('does not produce output while a blocking token is present', () => {
    const idle = createIdleState()
    const clock = pushPauseToken(createClock(), {
      id: 'story.tick',
      source: 'story',
      label: '待决剧情',
    })
    const result = tickEngine({
      clock,
      idle,
      rates: DEFAULT_IDLE_RATES,
      pausePolicy: 'story',
      realSeconds: 10,
    })

    expect(result.paused).toBe(true)
    expect(result.monthsAdvanced).toBe(0)
    expect(result.clock).toBe(clock)
    expect(result.idle).toBe(idle)
    expect(result.delta.cultivation).toBe(0)
    expect(result.blockingTokens).toHaveLength(1)
  })

  it('applies tick efficiency without slowing game time', () => {
    const result = tickEngine({
      clock: createClock(),
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      pausePolicy: 'story',
      realSeconds: REAL_SECONDS_PER_MONTH * 2,
      efficiency: 0.5,
    })

    expect(result.monthsAdvanced).toBe(2)
    expect(result.idle.slots.travel.months).toBe(2)
    expect(result.delta.cultivation).toBe(1)
    expect(result.delta.resources.spirit_stones).toBe(1)
  })

  it('stops a fast tick at the next gate without advancing production past it', () => {
    const result = tickEngine({
      clock: { ...createClock({ elapsedMonths: 10 }), speed: 16 },
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      pausePolicy: 'story',
      realSeconds: REAL_SECONDS_PER_MONTH,
      gates: [{ atMonths: 14 }],
    })

    expect(result.monthsAdvanced).toBe(4)
    expect(result.clock.elapsedMonths).toBe(14)
    expect(result.stoppedAtGate).toBe(14)
    expect(result.idle.slots.cultivation.months).toBe(4)
    expect(result.delta.cultivation).toBe(4)
  })

  it('ignores gates that are already past or later than the tick', () => {
    const past = tickEngine({
      clock: { ...createClock({ elapsedMonths: 10 }), speed: 16 },
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      pausePolicy: 'story',
      realSeconds: REAL_SECONDS_PER_MONTH,
      gates: [{ atMonths: 8 }],
    })
    expect(past.monthsAdvanced).toBe(16)
    expect(past.stoppedAtGate).toBeNull()

    const later = tickEngine({
      clock: createClock(),
      idle: createIdleState(),
      rates: DEFAULT_IDLE_RATES,
      pausePolicy: 'story',
      realSeconds: REAL_SECONDS_PER_MONTH,
      gates: [{ atMonths: 30 }],
    })
    expect(later.monthsAdvanced).toBe(1)
    expect(later.stoppedAtGate).toBeNull()
  })
})
