import { formatDate, parseDate, isToday, getDaysAgo, getDateRange } from './date'

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD by default', () => {
      const date = new Date('2026-03-11')
      expect(formatDate(date)).toBe('2026-03-11')
    })

    it('should format date with custom format', () => {
      const date = new Date('2026-03-11')
      expect(formatDate(date, 'YYYY/MM/DD')).toBe('2026/03/11')
    })
  })

  describe('parseDate', () => {
    it('should parse date string to Date object', () => {
      const result = parseDate('2026-03-11')
      expect(result).toBeInstanceOf(Date)
    })
  })

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date()
      expect(isToday(today)).toBe(true)
    })

    it('should return false for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isToday(yesterday)).toBe(false)
    })
  })

  describe('getDaysAgo', () => {
    it('should return date N days ago', () => {
      const result = getDaysAgo(7)
      expect(result).toBeInstanceOf(Date)
    })
  })

  describe('getDateRange', () => {
    it('should return array of dates between start and end', () => {
      const start = new Date('2026-03-01')
      const end = new Date('2026-03-03')
      const range = getDateRange(start, end)

      expect(range).toHaveLength(3)
      expect(range[0]).toBeInstanceOf(Date)
    })
  })
})
