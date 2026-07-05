import { describe, it, expect } from 'vitest'
import {
  isToday,
  isThisWeek,
  isThisMonth,
  isOverdue,
  formatDeadline,
  advanceDeadline,
  getPriorityLabel,
  getPriorityTagClass,
  genId,
  genCatId,
} from '../helpers.js'

describe('isToday', () => {
  it('returns true for today', () => {
    const now = new Date().toISOString()
    expect(isToday(now)).toBe(true)
  })
  it('returns false for empty string', () => {
    expect(isToday('')).toBe(false)
  })
  it('returns false for null/undefined', () => {
    expect(isToday(null)).toBe(false)
    expect(isToday(undefined)).toBe(false)
  })
})

describe('isThisWeek', () => {
  it('returns true for today', () => {
    expect(isThisWeek(new Date().toISOString())).toBe(true)
  })
  it('returns false for empty input', () => {
    expect(isThisWeek('')).toBe(false)
  })
})

describe('isOverdue', () => {
  it('returns true for past deadline not done', () => {
    expect(isOverdue({ deadline: '2020-01-01T00:00', done: false })).toBe(true)
  })
  it('returns false for done tasks', () => {
    expect(isOverdue({ deadline: '2020-01-01T00:00', done: true })).toBe(false)
  })
  it('returns false when no deadline', () => {
    expect(isOverdue({ done: false })).toBe(false)
  })
})

describe('formatDeadline', () => {
  it('formats date correctly', () => {
    const result = formatDeadline('2026-07-15T14:30')
    expect(result).toContain('2026/07/15')
    expect(result).toContain('14:30')
  })
  it('returns empty string for empty input', () => {
    expect(formatDeadline('')).toBe('')
  })
})

describe('advanceDeadline', () => {
  it('advances daily by 1 day', () => {
    const result = advanceDeadline('2026-07-15T14:30', 'daily')
    expect(result).toContain('2026-07-16')
  })
  it('advances weekly by 7 days', () => {
    const result = advanceDeadline('2026-07-15T14:30', 'weekly')
    expect(result).toContain('2026-07-22')
  })
  it('returns original for none cycle', () => {
    expect(advanceDeadline('2026-07-15T14:30', 'none')).toBe('2026-07-15T14:30')
  })
  it('returns original for invalid date', () => {
    expect(advanceDeadline('bad', 'daily')).toBe('bad')
  })
})

describe('getPriorityLabel', () => {
  it('returns correct labels', () => {
    expect(getPriorityLabel('critical')).toContain('紧急')
    expect(getPriorityLabel('high')).toContain('高')
    expect(getPriorityLabel('medium')).toContain('中')
    expect(getPriorityLabel('low')).toContain('低')
  })
  it('returns input for unknown', () => {
    expect(getPriorityLabel('unknown')).toBe('unknown')
  })
})

describe('getPriorityTagClass', () => {
  it('returns matching classes for known priorities', () => {
    expect(getPriorityTagClass('critical')).toBe('tag-priority-critical')
    expect(getPriorityTagClass('high')).toBe('tag-priority-high')
  })
  it('returns empty string for unknown', () => {
    expect(getPriorityTagClass('blah')).toBe('')
  })
})

describe('genId', () => {
  it('starts with t', () => {
    expect(genId()).toMatch(/^t/)
  })
  it('generates unique ids', () => {
    const a = genId()
    const b = genId()
    expect(a).not.toBe(b)
  })
})

describe('genCatId', () => {
  it('starts with c', () => {
    expect(genCatId()).toMatch(/^c/)
  })
})
