import { describe, expect, it } from 'vitest'
import { Rng, pickWeighted } from '@/core/rng'

describe('seeded rng', () => {
  it('replays the same stream from the same seed', () => {
    const first = new Rng(20261121)
    const second = new Rng(20261121)
    const left = Array.from({ length: 8 }, () => first.next())
    const right = Array.from({ length: 8 }, () => second.next())

    expect(left).toEqual(right)
    expect(left.every((value) => value >= 0 && value < 1)).toBe(true)
  })

  it('resumes from a saved state', () => {
    const rng = new Rng(42)
    rng.next()
    rng.next()
    const snapshot = rng.getState()
    const resumed = Rng.fromState(snapshot)

    expect(resumed.next()).toBe(rng.next())
    expect(resumed.getState().draws).toBe(snapshot.draws + 1)
  })

  it('bounds nextInt', () => {
    const rng = new Rng(7)
    for (let i = 0; i < 50; i += 1) {
      const value = rng.nextInt(3, 8)
      expect(value).toBeGreaterThanOrEqual(3)
      expect(value).toBeLessThan(8)
    }
    expect(() => rng.nextInt(8, 8)).toThrow(RangeError)
  })

  it('handles chance boundaries', () => {
    const rng = new Rng(1)
    expect(rng.chance(0)).toBe(false)
    expect(rng.chance(1)).toBe(true)
  })
})

describe('weighted picking', () => {
  const items = [
    { id: 'common', weight: 1 },
    { id: 'rare', weight: 2 },
    { id: 'ignored', weight: 0 },
  ]

  it('hits the first item at roll zero', () => {
    expect(pickWeighted(items, 0)?.id).toBe('common')
  })

  it('hits the second item exactly at the first boundary', () => {
    expect(pickWeighted(items, 1 / 3)?.id).toBe('rare')
  })

  it('hits the last positive item near roll one', () => {
    expect(pickWeighted(items, 0.999999)?.id).toBe('rare')
  })

  it('ignores zero and invalid weights', () => {
    expect(pickWeighted([{ id: 'a', weight: 0 }], 0.5)).toBeUndefined()
    expect(pickWeighted([{ id: 'a', weight: Number.NaN }], 0.5)).toBeUndefined()
    expect(pickWeighted(items, Number.NaN)).toBeUndefined()
  })
})
