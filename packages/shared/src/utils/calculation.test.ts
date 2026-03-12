import { calculateBMI, calculateBMICategory, predictWeight, calculateWeightChange } from './calculation'

describe('Calculation Utils', () => {
  describe('calculateBMI', () => {
    it('should calculate BMI correctly', () => {
      const bmi = calculateBMI(65, 170)
      expect(bmi).toBeCloseTo(22.49, 2)
    })

    it('should throw error for invalid inputs', () => {
      expect(() => calculateBMI(-1, 170)).toThrow()
      expect(() => calculateBMI(65, 0)).toThrow()
    })
  })

  describe('calculateBMICategory', () => {
    it('should return underweight for BMI < 18.5', () => {
      expect(calculateBMICategory(18)).toBe('underweight')
    })

    it('should return normal for BMI 18.5-24', () => {
      expect(calculateBMICategory(22)).toBe('normal')
    })

    it('should return overweight for BMI 24-28', () => {
      expect(calculateBMICategory(26)).toBe('overweight')
    })

    it('should return obese for BMI >= 28', () => {
      expect(calculateBMICategory(30)).toBe('obese')
    })
  })

  describe('predictWeight', () => {
    it('should predict future weight using linear regression', () => {
      const records = [
        { date: new Date('2026-03-01'), weight: 70 },
        { date: new Date('2026-03-08'), weight: 69 },
        { date: new Date('2026-03-15'), weight: 68 }
      ]
      const prediction = predictWeight(records, 7)

      expect(prediction).toBeLessThan(68)
      expect(prediction).toBeGreaterThan(66)
    })

    it('should return null for insufficient data', () => {
      const records = [{ date: new Date(), weight: 70 }]
      expect(predictWeight(records, 7)).toBeNull()
    })
  })

  describe('calculateWeightChange', () => {
    it('should calculate weight change', () => {
      expect(calculateWeightChange(65, 66)).toBe(-1)
      expect(calculateWeightChange(66, 65)).toBe(1)
    })
  })
})
