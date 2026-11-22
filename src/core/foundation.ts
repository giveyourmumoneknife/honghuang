import type { PlayerState } from '@/types/state'

export const FOUNDATION_CAPS = {
  health: 80,
  attack: 12,
  defense: 10,
  spirit: 16,
} as const

export interface FoundationGain {
  health?: number
  attack?: number
  defense?: number
  spirit?: number
}

/**
 * 洗髓丹一类的东西只能把后天根基推到上限。返回实际增加的量，
 * 方便事件或日志说明"药力已到尽头"。
 */
export function gainFoundation(player: PlayerState, gain: FoundationGain): FoundationGain {
  const applied: FoundationGain = {}
  for (const key of ['health', 'attack', 'defense', 'spirit'] as const) {
    const requested = gain[key]
    if (typeof requested !== 'number' || !Number.isFinite(requested) || requested <= 0) continue
    const before = player.foundation[key]
    const after = Math.min(FOUNDATION_CAPS[key], before + requested)
    const delta = Math.max(0, after - before)
    if (delta > 0) {
      player.foundation[key] = after
      applied[key] = delta
    }
  }
  return applied
}

export function foundationRemaining(player: PlayerState): FoundationGain {
  return {
    health: Math.max(0, FOUNDATION_CAPS.health - player.foundation.health),
    attack: Math.max(0, FOUNDATION_CAPS.attack - player.foundation.attack),
    defense: Math.max(0, FOUNDATION_CAPS.defense - player.foundation.defense),
    spirit: Math.max(0, FOUNDATION_CAPS.spirit - player.foundation.spirit),
  }
}
