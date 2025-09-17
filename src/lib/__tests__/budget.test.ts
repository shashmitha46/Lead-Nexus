import { describe, it, expect } from 'vitest'

function isBudgetRangeValid(min: number | null, max: number | null): boolean {
  if (min == null || max == null) return true
  return max >= min
}

describe('isBudgetRangeValid', () => {
  it('accepts null values', () => {
    expect(isBudgetRangeValid(null, null)).toBe(true)
    expect(isBudgetRangeValid(100, null)).toBe(true)
    expect(isBudgetRangeValid(null, 100)).toBe(true)
  })

  it('accepts valid ranges', () => {
    expect(isBudgetRangeValid(100, 100)).toBe(true)
    expect(isBudgetRangeValid(100, 200)).toBe(true)
  })

  it('rejects invalid ranges', () => {
    expect(isBudgetRangeValid(200, 100)).toBe(false)
  })
})


