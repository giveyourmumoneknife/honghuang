import { describe, expect, it } from 'vitest'
import {
  DEFAULT_IDLE_RATES,
  TRAVEL_PROGRESS_CAP,
  advanceIdle,
  createIdleState,
  setIdleSlotActive,
} from '@/core/idle'

describe('idle slots', () => {
  it('runs the three slots in parallel', () => {
    const result = advanceIdle(createIdleState(), 12, DEFAULT_IDLE_RATES)

    expect(result.idle.slots.cultivation.months).toBe(12)
    expect(result.idle.slots.cave.months).toBe(12)
    expect(result.idle.slots.travel.months).toBe(12)
    expect(result.delta.cultivation).toBe(12)
    expect(result.delta.resources.spirit_stones).toBe(12)
    expect(result.delta.resources.spirit_herbs).toBe(3)
    expect(result.delta.travelProgress).toBe(6)
    expect(result.delta.travelReady).toBe(false)
    expect(result.delta.months).toBe(12)
    expect(result.delta.effectiveMonths).toBe(12)
  })

  it('applies offline efficiency to output but not to elapsed slot time', () => {
    const result = advanceIdle(createIdleState(), 12, DEFAULT_IDLE_RATES, 0.5)

    expect(result.idle.slots.cultivation.months).toBe(12)
    expect(result.delta.effectiveMonths).toBe(6)
    expect(result.delta.cultivation).toBe(6)
    expect(result.delta.resources.spirit_stones).toBe(6)
    expect(result.delta.resources.spirit_herbs).toBeCloseTo(1.5)
    expect(result.delta.travelProgress).toBe(3)
  })

  it('stops output from inactive slots without resetting their history', () => {
    let idle = advanceIdle(createIdleState(), 5, DEFAULT_IDLE_RATES).idle
    idle = setIdleSlotActive(idle, 'cultivation', false)
    const result = advanceIdle(idle, 2, DEFAULT_IDLE_RATES)

    expect(result.idle.slots.cultivation.months).toBe(5)
    expect(result.delta.cultivation).toBe(0)
    expect(result.idle.slots.cave.months).toBe(7)
  })

  it('caps travel progress and marks it ready once', () => {
    const idle = { ...createIdleState(), travelProgress: TRAVEL_PROGRESS_CAP - 1 }
    const result = advanceIdle(idle, 12, DEFAULT_IDLE_RATES)

    expect(result.idle.travelProgress).toBe(TRAVEL_PROGRESS_CAP)
    expect(result.delta.travelProgress).toBe(1)
    expect(result.delta.travelReady).toBe(true)

    const again = advanceIdle(result.idle, 12, DEFAULT_IDLE_RATES)
    expect(again.idle.travelProgress).toBe(TRAVEL_PROGRESS_CAP)
    expect(again.delta.travelProgress).toBe(0)
    expect(again.delta.travelReady).toBe(true)
  })

  it('ignores invalid durations, efficiency and rates', () => {
    const idle = createIdleState()
    const noTime = advanceIdle(idle, Number.NaN, DEFAULT_IDLE_RATES)
    expect(noTime.delta).toMatchObject({ months: 0, cultivation: 0, travelProgress: 0 })
    expect(noTime.idle).toBe(idle)

    const negative = advanceIdle(idle, -10, DEFAULT_IDLE_RATES)
    expect(negative.idle).toBe(idle)

    const noOutput = advanceIdle(idle, 3, DEFAULT_IDLE_RATES, 0)
    expect(noOutput.delta.cultivation).toBe(0)
    expect(noOutput.delta.effectiveMonths).toBe(0)
    expect(noOutput.delta.travelProgress).toBe(0)

    const invalidRates = advanceIdle(idle, 3, {
      cultivationPerMonth: -5,
      caveYieldPerMonth: { spirit_stones: Number.NaN, ore: -1 },
      travelProgressPerMonth: Number.NaN,
    })
    expect(invalidRates.delta.cultivation).toBe(0)
    expect(invalidRates.delta.resources).toEqual({})
    expect(invalidRates.delta.travelProgress).toBe(0)
  })

  it('preserves fractional yields', () => {
    const result = advanceIdle(createIdleState(), 1.5, DEFAULT_IDLE_RATES, 0.5)
    expect(result.delta.cultivation).toBeCloseTo(0.75)
    expect(result.delta.resources.spirit_herbs).toBeCloseTo(0.1875)
    expect(result.delta.travelProgress).toBeCloseTo(0.375)
    expect(result.idle.slots.cultivation.months).toBeCloseTo(1.5)
  })
})
