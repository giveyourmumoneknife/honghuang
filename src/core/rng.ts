import type { RngState } from '@/types/state'

const UINT32_RANGE = 0x1_0000_0000

/**
 * Mulberry32. The full state is exposed so a save can resume the exact stream.
 */
export class Rng {
  readonly seed: number
  private state: number
  private draws: number

  constructor(seed = 0x9e3779b9) {
    this.seed = seed >>> 0
    this.state = this.seed
    this.draws = 0
  }

  static fromState(snapshot: RngState): Rng {
    const rng = new Rng(snapshot.seed)
    rng.state = snapshot.state >>> 0
    rng.draws = snapshot.draws
    return rng
  }

  getState(): RngState {
    return {
      seed: this.seed,
      state: this.state,
      draws: this.draws,
    }
  }

  nextUint32(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0
    let value = this.state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    this.draws += 1
    return (value ^ (value >>> 14)) >>> 0
  }

  next(): number {
    return this.nextUint32() / UINT32_RANGE
  }

  nextInt(minInclusive: number, maxExclusive: number): number {
    if (!Number.isInteger(minInclusive) || !Number.isInteger(maxExclusive)) {
      throw new TypeError('nextInt 的上下界必须是整数')
    }
    if (maxExclusive <= minInclusive) {
      throw new RangeError('nextInt 的上界必须大于下界')
    }
    return minInclusive + Math.floor(this.next() * (maxExclusive - minInclusive))
  }

  chance(probability: number): boolean {
    if (probability <= 0) return false
    if (probability >= 1) return true
    return this.next() < probability
  }

  pick<T>(items: readonly T[]): T | undefined {
    if (items.length === 0) return undefined
    return items[Math.floor(this.next() * items.length)]
  }

  pickWeighted<T extends { weight: number }>(items: readonly T[]): T | undefined {
    return pickWeighted(items, this.next())
  }
}

/**
 * Pure weight picker used by the class and by balance simulations.
 * Invalid weights are ignored; a roll of 0 hits the first positive item and
 * a roll approaching 1 hits the last one.
 */
export function pickWeighted<T extends { weight: number }>(
  items: readonly T[],
  roll: number,
): T | undefined {
  if (!Number.isFinite(roll)) return undefined

  const valid = items.filter((item) => Number.isFinite(item.weight) && item.weight > 0)
  if (valid.length === 0) return undefined

  const total = valid.reduce((sum, item) => sum + item.weight, 0)
  let remaining = Math.min(Math.max(roll, 0), 1 - Number.EPSILON) * total

  for (const item of valid) {
    if (remaining < item.weight) return item
    remaining -= item.weight
  }

  return valid[valid.length - 1]
}
