import type { PausePolicy } from '@/types/common'
import type { GameClock, IdleState, PauseToken } from '@/types/state'
import { advanceIdle, type IdleDelta, type IdleRates } from './idle'
import { advanceClock, advanceClockByMonths } from './time'

export interface TickGate {
  atMonths: number
}

export interface EngineTickInput {
  clock: GameClock
  idle: IdleState
  rates: IdleRates
  pausePolicy: PausePolicy
  realSeconds: number
  efficiency?: number
  gates?: readonly TickGate[]
}

export interface EngineTickResult {
  clock: GameClock
  idle: IdleState
  monthsAdvanced: number
  paused: boolean
  blockingTokens: PauseToken[]
  stoppedAtGate: number | null
  delta: IdleDelta
}

export function tickEngine(input: EngineTickInput): EngineTickResult {
  const advance = advanceClock(
    input.clock,
    input.realSeconds,
    input.pausePolicy,
  )

  let monthsAdvanced = advance.monthsAdvanced
  let clock = advance.clock
  let stoppedAtGate: number | null = null
  if (monthsAdvanced > 0 && input.gates?.length) {
    const nextGate = input.gates
      .filter(
        (gate) =>
          Number.isFinite(gate.atMonths) &&
          gate.atMonths > input.clock.elapsedMonths,
      )
      .sort((left, right) => left.atMonths - right.atMonths)[0]
    if (nextGate) {
      const gateMonths = nextGate.atMonths - input.clock.elapsedMonths
      if (gateMonths < monthsAdvanced) {
        monthsAdvanced = gateMonths
        stoppedAtGate = nextGate.atMonths
        clock = {
          ...advanceClockByMonths(input.clock, gateMonths),
          elapsedMonths: Math.max(
            input.clock.elapsedMonths + gateMonths,
            nextGate.atMonths,
          ),
        }
      }
    }
  }

  const { idle, delta } = advanceIdle(
    input.idle,
    monthsAdvanced,
    input.rates,
    input.efficiency ?? 1,
  )

  return {
    clock,
    idle,
    monthsAdvanced,
    paused: advance.paused,
    blockingTokens: advance.blockingTokens,
    stoppedAtGate,
    delta,
  }
}
