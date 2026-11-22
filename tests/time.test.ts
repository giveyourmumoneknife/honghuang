import { describe, expect, it } from 'vitest'
import {
  advanceClock,
  advanceClockByMonths,
  blockingPauseTokens,
  calendarFromMonths,
  clearPauseTokens,
  createClock,
  formatGameSpan,
  formatGameTime,
  isClockPaused,
  pushPauseToken,
  REAL_SECONDS_PER_MONTH,
  releasePauseToken,
  setGameSpeed,
} from '@/core/time'
import type { PauseToken } from '@/types/state'

const storyToken: PauseToken = { id: 'story-1', source: 'story', label: '龙门之变' }
const ambientToken: PauseToken = { id: 'ambient-1', source: 'ambient', label: '荒原异动' }
const manualToken: PauseToken = { id: 'manual-1', source: 'manual', label: '手动暂停' }

describe('game clock', () => {
  it('advances at the configured speed', () => {
    const clock = createClock()
    const first = advanceClock(clock, REAL_SECONDS_PER_MONTH, 'story')

    expect(first.paused).toBe(false)
    expect(first.monthsAdvanced).toBe(1)
    expect(first.clock.elapsedMonths).toBe(1)
    expect(clock.elapsedMonths).toBe(0)

    const faster = setGameSpeed(first.clock, 4)
    const second = advanceClock(faster, REAL_SECONDS_PER_MONTH / 2, 'story')
    expect(second.monthsAdvanced).toBe(2)
    expect(second.clock.elapsedMonths).toBe(3)
  })

  it('does not advance while blocked by the pause policy', () => {
    const clock = pushPauseToken(createClock(), storyToken)
    const result = advanceClock(clock, 10, 'story')

    expect(result.paused).toBe(true)
    expect(result.monthsAdvanced).toBe(0)
    expect(result.blockingTokens).toEqual([storyToken])
    expect(result.clock).toBe(clock)
  })

  it('applies all, story and none policy to each token source', () => {
    const withStory = pushPauseToken(createClock(), storyToken)
    const withAmbient = pushPauseToken(createClock(), ambientToken)
    const withManual = pushPauseToken(createClock(), manualToken)

    expect(isClockPaused(withStory, 'all')).toBe(true)
    expect(isClockPaused(withStory, 'story')).toBe(true)
    expect(isClockPaused(withStory, 'none')).toBe(false)

    expect(isClockPaused(withAmbient, 'all')).toBe(true)
    expect(isClockPaused(withAmbient, 'story')).toBe(false)
    expect(isClockPaused(withAmbient, 'none')).toBe(false)

    expect(isClockPaused(withManual, 'all')).toBe(true)
    expect(isClockPaused(withManual, 'story')).toBe(true)
    expect(isClockPaused(withManual, 'none')).toBe(true)

    expect(blockingPauseTokens(withAmbient, 'all')).toEqual([ambientToken])
    expect(blockingPauseTokens(withAmbient, 'story')).toEqual([])
  })

  it('keeps the clock paused until every blocking token is released', () => {
    let clock = createClock()
    clock = pushPauseToken(clock, storyToken)
    clock = pushPauseToken(clock, manualToken)

    clock = releasePauseToken(clock, storyToken.id)
    expect(isClockPaused(clock, 'story')).toBe(true)

    clock = releasePauseToken(clock, manualToken.id)
    expect(isClockPaused(clock, 'story')).toBe(false)
    expect(clearPauseTokens(clock)).toBe(clock)
  })

  it('ignores duplicate token ids and releases unknown ids safely', () => {
    const clock = pushPauseToken(createClock(), storyToken)
    expect(pushPauseToken(clock, { ...storyToken, label: '重复' })).toBe(clock)
    expect(releasePauseToken(clock, 'missing')).toBe(clock)
  })

  it('sanitizes invalid time and supports direct month advances', () => {
    const clock = createClock()
    expect(advanceClock(clock, -5, 'story').monthsAdvanced).toBe(0)
    expect(advanceClock(clock, Number.NaN, 'story').monthsAdvanced).toBe(0)
    expect(advanceClockByMonths(clock, Number.NaN)).toBe(clock)
    expect(advanceClockByMonths(clock, 3).elapsedMonths).toBe(3)
  })
})

describe('calendar formatting', () => {
  it('derives year and month from elapsed months', () => {
    expect(calendarFromMonths(0)).toEqual({ year: 1, month: 1, totalMonths: 0 })
    expect(calendarFromMonths(11)).toMatchObject({ year: 1, month: 12 })
    expect(calendarFromMonths(12)).toMatchObject({ year: 2, month: 1 })
    expect(calendarFromMonths(23)).toMatchObject({ year: 2, month: 12 })
    expect(calendarFromMonths(24)).toMatchObject({ year: 3, month: 1 })
    expect(calendarFromMonths(25.9)).toMatchObject({ year: 3, month: 2 })
    expect(calendarFromMonths(-5)).toMatchObject({ year: 1, month: 1 })
  })

  it('formats narrative time spans', () => {
    expect(formatGameTime(0)).toBe('第1年1月')
    expect(formatGameTime(25)).toBe('第3年2月')
    expect(formatGameSpan(0)).toBe('0个月')
    expect(formatGameSpan(11)).toBe('11个月')
    expect(formatGameSpan(12)).toBe('1年')
    expect(formatGameSpan(25)).toBe('2年1个月')
    expect(formatGameSpan(-3)).toBe('0个月')
  })
})
