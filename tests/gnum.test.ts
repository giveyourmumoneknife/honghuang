import { describe, expect, it } from 'vitest'
import {
  addGNum,
  cmpGNum,
  divGNum,
  formatGNum,
  formatGNumScientific,
  fromNumber,
  mulGNum,
  normalizeGNum,
  subGNum,
  toNumber,
} from '@/core/gnum'

describe('GNum', () => {
  it('normalizes mantissa and exponent', () => {
    expect(normalizeGNum(1234, 0)).toMatchObject({ m: expect.closeTo(1.234), e: 3 })
    expect(normalizeGNum(0.00123, 4)).toMatchObject({ m: expect.closeTo(1.23), e: 1 })
    expect(normalizeGNum(0, 9)).toEqual({ m: 0, e: 0 })
  })

  it('converts numbers in both directions', () => {
    const value = fromNumber(1.25e12)
    expect(value.m).toBeCloseTo(1.25)
    expect(value.e).toBe(12)
    expect(toNumber(value)).toBeCloseTo(1.25e12)
    expect(fromNumber(0)).toEqual({ m: 0, e: 0 })
  })

  it('adds and subtracts across exponents', () => {
    expect(addGNum(fromNumber(1e3), fromNumber(2e3))).toMatchObject({
      m: expect.closeTo(3),
      e: 3,
    })
    expect(toNumber(addGNum(fromNumber(1e3), fromNumber(1e-3)))).toBeCloseTo(1000.001)
    expect(toNumber(subGNum(fromNumber(5), fromNumber(3)))).toBeCloseTo(2)
  })

  it('multiplies and divides', () => {
    expect(mulGNum(fromNumber(1.5e3), fromNumber(2e4))).toMatchObject({
      m: expect.closeTo(3),
      e: 7,
    })
    expect(toNumber(divGNum(fromNumber(9e8), fromNumber(3e4)))).toBeCloseTo(3e4)
    expect(() => divGNum(fromNumber(1), fromNumber(0))).toThrow(RangeError)
  })

  it('compares signed values', () => {
    expect(cmpGNum(fromNumber(1e9), fromNumber(1e9))).toBe(0)
    expect(cmpGNum(fromNumber(-2), fromNumber(1))).toBe(-1)
    expect(cmpGNum(fromNumber(2), fromNumber(-1))).toBe(1)
    expect(cmpGNum(fromNumber(-9e3), fromNumber(-1e3))).toBe(-1)
  })

  it('formats Chinese units', () => {
    expect(formatGNum(fromNumber(0))).toBe('0')
    expect(formatGNum(fromNumber(9999))).toBe('9999')
    expect(formatGNum(fromNumber(1e4))).toBe('1万')
    expect(formatGNum(fromNumber(1.23e8))).toBe('1.23亿')
    expect(formatGNum(fromNumber(-1.5e8))).toBe('-1.5亿')
    expect(formatGNum(fromNumber(1e12))).toBe('1兆')
  })

  it('falls back to scientific notation for extreme values', () => {
    expect(formatGNum({ m: 1, e: 48 })).toContain('10^48')
    expect(formatGNumScientific(fromNumber(1e8))).toBe('1×10^8')
  })
})
