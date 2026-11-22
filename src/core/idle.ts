import type { ResourceKey } from '@/types/common'
import type { IdleSlot, IdleState } from '@/types/state'

export const TRAVEL_PROGRESS_CAP = 100

export interface IdleRates {
  cultivationPerMonth: number
  caveYieldPerMonth: Partial<Record<ResourceKey, number>>
  travelProgressPerMonth: number
}

export interface IdleDelta {
  months: number
  effectiveMonths: number
  cultivation: number
  resources: Partial<Record<ResourceKey, number>>
  travelProgress: number
  travelReady: boolean
}

export interface IdleAdvanceResult {
  idle: IdleState
  delta: IdleDelta
}

export const DEFAULT_IDLE_RATES: IdleRates = {
  cultivationPerMonth: 1,
  caveYieldPerMonth: {
    spirit_stones: 1,
    spirit_herbs: 0.25,
  },
  travelProgressPerMonth: 0.5,
}

export function createIdleState(
  active: Partial<Record<IdleSlot, boolean>> = {},
): IdleState {
  return {
    slots: {
      cultivation: { active: active.cultivation ?? true, months: 0 },
      cave: { active: active.cave ?? true, months: 0 },
      travel: { active: active.travel ?? true, months: 0 },
    },
    travelProgress: 0,
  }
}

export function setIdleSlotActive(
  idle: IdleState,
  slot: IdleSlot,
  active: boolean,
): IdleState {
  if (idle.slots[slot].active === active) return idle
  return {
    ...idle,
    slots: {
      ...idle.slots,
      [slot]: { ...idle.slots[slot], active },
    },
  }
}

export function advanceIdle(
  idle: IdleState,
  months: number,
  rates: IdleRates,
  efficiency = 1,
): IdleAdvanceResult {
  const elapsed = Number.isFinite(months) && months > 0 ? months : 0
  const rateFactor =
    Number.isFinite(efficiency) && efficiency > 0
      ? Math.min(1, efficiency)
      : 0
  const effectiveMonths = elapsed * rateFactor
  if (elapsed === 0) {
    return {
      idle,
      delta: {
        months: 0,
        effectiveMonths: 0,
        cultivation: 0,
        resources: {},
        travelProgress: 0,
        travelReady: idle.travelProgress >= TRAVEL_PROGRESS_CAP,
      },
    }
  }

  const slots = { ...idle.slots }
  for (const slot of Object.keys(slots) as IdleSlot[]) {
    if (slots[slot].active) {
      slots[slot] = { ...slots[slot], months: slots[slot].months + elapsed }
    }
  }

  const cultivationGain =
    slots.cultivation.active && Number.isFinite(rates.cultivationPerMonth)
      ? Math.max(0, rates.cultivationPerMonth) * effectiveMonths
      : 0

  const resources: Partial<Record<ResourceKey, number>> = {}
  if (slots.cave.active) {
    for (const [key, rate] of Object.entries(rates.caveYieldPerMonth)) {
      if (typeof rate === 'number' && Number.isFinite(rate) && rate > 0) {
        resources[key as ResourceKey] = rate * effectiveMonths
      }
    }
  }

  const rawTravelGain =
    slots.travel.active && Number.isFinite(rates.travelProgressPerMonth)
      ? Math.max(0, rates.travelProgressPerMonth) * effectiveMonths
      : 0
  const travelProgress = Math.min(
    TRAVEL_PROGRESS_CAP,
    idle.travelProgress + rawTravelGain,
  )
  const travelGain = travelProgress - idle.travelProgress

  return {
    idle: {
      slots,
      travelProgress,
    },
    delta: {
      months: elapsed,
      effectiveMonths,
      cultivation: cultivationGain,
      resources,
      travelProgress: travelGain,
      travelReady: travelProgress >= TRAVEL_PROGRESS_CAP,
    },
  }
}
