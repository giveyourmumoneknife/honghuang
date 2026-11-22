export interface GNum {
  m: number
  e: number
}

export interface FormatGNumOptions {
  digits?: number
}

const CHINESE_UNITS = ['', '万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载'] as const
const UNIT_STEP = 4

export function normalizeGNum(m: number, e: number): GNum {
  if (!Number.isFinite(m) || !Number.isFinite(e)) {
    throw new TypeError('GNum 的尾数与指数必须是有限数字')
  }
  if (m === 0) return { m: 0, e: 0 }

  let mantissa = m
  let exponent = Math.trunc(e)

  while (Math.abs(mantissa) >= 10) {
    mantissa /= 10
    exponent += 1
  }
  while (Math.abs(mantissa) < 1) {
    mantissa *= 10
    exponent -= 1
  }

  return { m: mantissa, e: exponent }
}

export function fromNumber(value: number): GNum {
  if (!Number.isFinite(value)) {
    throw new TypeError('无法把非有限数字转换为 GNum')
  }
  if (value === 0) return { m: 0, e: 0 }

  const sign = value < 0 ? -1 : 1
  const absolute = Math.abs(value)
  const exponent = Math.floor(Math.log10(absolute))
  const mantissa = sign * (absolute / 10 ** exponent)
  return normalizeGNum(mantissa, exponent)
}

export function toNumber(value: GNum): number {
  return value.m * 10 ** value.e
}

export function isZero(value: GNum): boolean {
  return value.m === 0
}

export function negateGNum(value: GNum): GNum {
  return normalizeGNum(-value.m, value.e)
}

export function addGNum(a: GNum, b: GNum): GNum {
  const left = normalizeGNum(a.m, a.e)
  const right = normalizeGNum(b.m, b.e)

  if (left.m === 0) return right
  if (right.m === 0) return left

  const difference = left.e - right.e
  if (difference > 15) return left
  if (difference < -15) return right

  const commonExponent = Math.min(left.e, right.e)
  const mantissa =
    left.m * 10 ** (left.e - commonExponent) +
    right.m * 10 ** (right.e - commonExponent)
  return normalizeGNum(mantissa, commonExponent)
}

export function subGNum(a: GNum, b: GNum): GNum {
  return addGNum(a, negateGNum(b))
}

export function mulGNum(a: GNum, b: GNum): GNum {
  return normalizeGNum(a.m * b.m, a.e + b.e)
}

export function divGNum(a: GNum, b: GNum): GNum {
  if (b.m === 0) throw new RangeError('GNum 不能除以零')
  return normalizeGNum(a.m / b.m, a.e - b.e)
}

export function absGNum(value: GNum): GNum {
  return normalizeGNum(Math.abs(value.m), value.e)
}

export function cmpGNum(a: GNum, b: GNum): -1 | 0 | 1 {
  const left = normalizeGNum(a.m, a.e)
  const right = normalizeGNum(b.m, b.e)

  if (left.m === 0 && right.m === 0) return 0
  if (left.m === 0) return right.m < 0 ? 1 : -1
  if (right.m === 0) return left.m < 0 ? -1 : 1
  if (left.m < 0 && right.m > 0) return -1
  if (left.m > 0 && right.m < 0) return 1

  const leftAbs = Math.abs(left.m)
  const rightAbs = Math.abs(right.m)
  const absoluteComparison =
    left.e === right.e
      ? leftAbs === rightAbs
        ? 0
        : leftAbs > rightAbs
          ? 1
          : -1
      : left.e > right.e
        ? 1
        : -1

  return (left.m < 0 ? -absoluteComparison : absoluteComparison) as -1 | 0 | 1
}

function formatMantissa(value: number, digits: number): string {
  const fixed = value.toFixed(digits)
  return fixed.replace(/\.?0+$/, '')
}

function formatScientific(value: GNum, digits: number): string {
  const sign = value.m < 0 ? '-' : ''
  return `${sign}${formatMantissa(Math.abs(value.m), digits)}×10^${value.e}`
}

export function formatGNum(value: GNum, options: FormatGNumOptions = {}): string {
  const normalized = normalizeGNum(value.m, value.e)
  const digits = options.digits ?? 2

  if (normalized.m === 0) return '0'

  const sign = normalized.m < 0 ? '-' : ''
  const absoluteMantissa = Math.abs(normalized.m)

  if (normalized.e < 0) {
    return formatScientific(normalized, digits)
  }

  const unitIndex = Math.floor(normalized.e / UNIT_STEP)
  if (unitIndex >= CHINESE_UNITS.length) {
    return formatScientific(normalized, digits)
  }

  const scale = 10 ** (normalized.e - unitIndex * UNIT_STEP)
  const scaled = absoluteMantissa * scale
  return `${sign}${formatMantissa(scaled, digits)}${CHINESE_UNITS[unitIndex]}`
}

export function formatGNumScientific(value: GNum, digits = 2): string {
  return formatScientific(normalizeGNum(value.m, value.e), digits)
}
