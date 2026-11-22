import type { PausePolicy } from '@/types/common'
import type { GameClock, PauseToken } from '@/types/state'

export const MONTHS_PER_YEAR = 12

/** At 1×, a game month takes 60 real seconds (half a game day per second). */
export const REAL_SECONDS_PER_MONTH = 60
export const MONTHS_PER_REAL_SECOND = 1 / REAL_SECONDS_PER_MONTH

export interface ClockAdvance {
  clock: GameClock
  monthsAdvanced: number
  paused: boolean
  blockingTokens: PauseToken[]
}

export interface GameCalendar {
  year: number
  month: number
  totalMonths: number
}

export function createClock(
  overrides: Partial<Pick<GameClock, 'elapsedMonths' | 'speed'>> = {},
): GameClock {
  return {
    elapsedMonths: Math.max(0, overrides.elapsedMonths ?? 0),
    speed: overrides.speed ?? 1,
    tokens: [],
  }
}

export function blockingPauseTokens(
  clock: GameClock,
  policy: PausePolicy,
): PauseToken[] {
  return clock.tokens.filter((token) => {
    if (token.source === 'manual') return true
    if (policy === 'all') return true
    if (policy === 'none') return false
    return token.source === 'story'
  })
}

export function isClockPaused(clock: GameClock, policy: PausePolicy): boolean {
  return blockingPauseTokens(clock, policy).length > 0
}

export function pushPauseToken(clock: GameClock, token: PauseToken): GameClock {
  if (clock.tokens.some((existing) => existing.id === token.id)) return clock
  return { ...clock, tokens: [...clock.tokens, token] }
}

export function releasePauseToken(clock: GameClock, tokenId: string): GameClock {
  if (!clock.tokens.some((token) => token.id === tokenId)) return clock
  return { ...clock, tokens: clock.tokens.filter((token) => token.id !== tokenId) }
}

export function clearPauseTokens(clock: GameClock): GameClock {
  return clock.tokens.length === 0 ? clock : { ...clock, tokens: [] }
}

export function setGameSpeed(clock: GameClock, speed: GameClock['speed']): GameClock {
  return clock.speed === speed ? clock : { ...clock, speed }
}

export function advanceClock(
  clock: GameClock,
  realSeconds: number,
  policy: PausePolicy,
): ClockAdvance {
  const blockingTokens = blockingPauseTokens(clock, policy)
  if (blockingTokens.length > 0) {
    return { clock, monthsAdvanced: 0, paused: true, blockingTokens }
  }

  const seconds = Number.isFinite(realSeconds) && realSeconds > 0 ? realSeconds : 0
  const monthsAdvanced = seconds * clock.speed * MONTHS_PER_REAL_SECOND
  if (monthsAdvanced === 0) {
    return { clock, monthsAdvanced: 0, paused: false, blockingTokens }
  }

  return {
    clock: { ...clock, elapsedMonths: clock.elapsedMonths + monthsAdvanced },
    monthsAdvanced,
    paused: false,
    blockingTokens,
  }
}

/** Time-only advance used by offline settlement after it has resolved gates. */
export function advanceClockByMonths(clock: GameClock, months: number): GameClock {
  const delta = Number.isFinite(months) && months > 0 ? months : 0
  if (delta === 0) return clock
  return { ...clock, elapsedMonths: clock.elapsedMonths + delta }
}

export function calendarFromMonths(elapsedMonths: number): GameCalendar {
  const safe = Number.isFinite(elapsedMonths) ? Math.max(0, elapsedMonths) : 0
  const totalMonths = Math.floor(safe)
  return {
    year: Math.floor(totalMonths / MONTHS_PER_YEAR) + 1,
    month: (totalMonths % MONTHS_PER_YEAR) + 1,
    totalMonths,
  }
}

export function formatGameTime(elapsedMonths: number): string {
  const calendar = calendarFromMonths(elapsedMonths)
  return `第${calendar.year}年${calendar.month}月`
}

export function formatGameSpan(months: number): string {
  const total = Number.isFinite(months) ? Math.floor(Math.max(0, months)) : 0
  const years = Math.floor(total / MONTHS_PER_YEAR)
  const remainder = total % MONTHS_PER_YEAR

  if (years === 0) return `${remainder}个月`
  if (remainder === 0) return `${years}年`
  return `${years}年${remainder}个月`
}
