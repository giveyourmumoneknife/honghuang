import type {
  EventId,
  GameSpeed,
  PausePolicy,
  ResourceKey,
} from '@/types/common'
import type { GameClock, IdleState, PauseToken } from '@/types/state'
import { TRAVEL_PROGRESS_CAP, advanceIdle, type IdleRates } from './idle'
import { MONTHS_PER_REAL_SECOND, advanceClockByMonths, blockingPauseTokens } from './time'

export type OfflineGateKind = 'story' | 'breakthrough' | 'era'

export interface OfflineGate {
  id: string
  kind: OfflineGateKind
  label: string
  atMonths: number
  eventId?: EventId
}

export interface OfflineSettings {
  pauseMode: PausePolicy
  offlineCapHours: number
  offlineEfficiency: number
}

export interface OfflineSimulationInput {
  clock: GameClock
  idle: IdleState
  rates: IdleRates
  gates?: readonly OfflineGate[]
  offlineSeconds: number
  settings: OfflineSettings
  offlineSpeed?: GameSpeed
}

export interface OfflineReport {
  requestedSeconds: number
  elapsedSeconds: number
  cappedByLimit: boolean
  paused: boolean
  blockedBy: PauseToken[]
  speed: GameSpeed
  efficiency: number
  gameMonths: number
  cultivation: number
  resources: Partial<Record<ResourceKey, number>>
  travelProgress: number
  travelReady: boolean
  stoppedByGate: OfflineGate | null
  triggeredGates: OfflineGate[]
}

export interface OfflineResult {
  clock: GameClock
  idle: IdleState
  report: OfflineReport
}

const GATE_EPSILON = 1e-9

function positiveDuration(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0
}

function normalizeEfficiency(value: number): number {
  if (!Number.isFinite(value)) return 0.5
  return Math.min(1, Math.max(0, value))
}

function upcomingGates(
  gates: readonly OfflineGate[],
  elapsedMonths: number,
): OfflineGate[] {
  return gates
    .filter(
      (gate) =>
        Number.isFinite(gate.atMonths) &&
        gate.atMonths > elapsedMonths + GATE_EPSILON,
    )
    .sort((left, right) => left.atMonths - right.atMonths)
}

export function simulateOffline(input: OfflineSimulationInput): OfflineResult {
  const requestedSeconds = positiveDuration(input.offlineSeconds)
  const capSeconds = positiveDuration(input.settings.offlineCapHours) * 3600
  const availableSeconds = Math.min(requestedSeconds, capSeconds)
  const cappedByLimit = availableSeconds < requestedSeconds - GATE_EPSILON
  const efficiency = normalizeEfficiency(input.settings.offlineEfficiency)
  const speed = input.offlineSpeed ?? input.clock.speed
  const blockedBy = blockingPauseTokens(input.clock, input.settings.pauseMode)

  if (blockedBy.length > 0) {
    return {
      clock: input.clock,
      idle: input.idle,
      report: {
        requestedSeconds,
        elapsedSeconds: 0,
        cappedByLimit: false,
        paused: true,
        blockedBy,
        speed,
        efficiency,
        gameMonths: 0,
        cultivation: 0,
        resources: {},
        travelProgress: 0,
        travelReady: input.idle.travelProgress >= TRAVEL_PROGRESS_CAP,
        stoppedByGate: null,
        triggeredGates: [],
      },
    }
  }

  const maxMonths = availableSeconds * speed * MONTHS_PER_REAL_SECOND
  const gates = upcomingGates(input.gates ?? [], input.clock.elapsedMonths)
  const nextGate = gates[0] ?? null
  const gateMonths = nextGate
    ? Math.max(0, nextGate.atMonths - input.clock.elapsedMonths)
    : Number.POSITIVE_INFINITY
  const monthsToAdvance = Math.min(maxMonths, gateMonths)
  const stoppedAtGate =
    nextGate !== null && gateMonths <= maxMonths + GATE_EPSILON
  const triggeredGates = stoppedAtGate
    ? gates.filter(
        (gate) => Math.abs(gate.atMonths - nextGate.atMonths) <= GATE_EPSILON,
      )
    : []

  const nextClockBase = advanceClockByMonths(input.clock, monthsToAdvance)
  const { idle: nextIdle, delta } = advanceIdle(
    input.idle,
    monthsToAdvance,
    input.rates,
    efficiency,
  )

  let nextClock = nextClockBase
  for (const gate of triggeredGates) {
    nextClock = {
      ...nextClock,
      tokens: nextClock.tokens.some(
        (token) => token.id === `offline-gate:${gate.id}`,
      )
        ? nextClock.tokens
        : [
            ...nextClock.tokens,
            {
              id: `offline-gate:${gate.id}`,
              source: 'story',
              label: gate.label,
              eventId: gate.eventId,
            },
          ],
    }
  }

  return {
    clock: nextClock,
    idle: nextIdle,
    report: {
      requestedSeconds,
      elapsedSeconds: speed > 0 ? monthsToAdvance / (speed * MONTHS_PER_REAL_SECOND) : 0,
      cappedByLimit,
      paused: false,
      blockedBy: [],
      speed,
      efficiency,
      gameMonths: monthsToAdvance,
      cultivation: delta.cultivation,
      resources: delta.resources,
      travelProgress: delta.travelProgress,
      travelReady: delta.travelReady,
      stoppedByGate: triggeredGates[0] ?? null,
      triggeredGates,
    },
  }
}
