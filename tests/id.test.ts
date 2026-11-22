import { describe, expect, it } from 'vitest'
import { assertValidId, isValidId } from '@/utils/id'

describe('content ids', () => {
  it.each([
    'era.longhan',
    'faction.longhan.dragon',
    'event.longhan.dragon_intro',
    'item.jade_001',
  ])('accepts %s', (id) => {
    expect(isValidId(id)).toBe(true)
  })

  it.each([
    '',
    '龙族',
    'Era.Longhan',
    'era..longhan',
    'era.longhan.',
    '1era',
    'era-longhan',
  ])('rejects %s', (id) => {
    expect(isValidId(id)).toBe(false)
  })

  it('throws with a readable message', () => {
    expect(() => assertValidId('龙族')).toThrow('龙族')
  })
})
