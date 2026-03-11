import { validateWeightRecord, validateFoodRecord, generateUUID } from './validation'

describe('Validation Utils', () => {
  describe('validateWeightRecord', () => {
    const validRecord = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      date: new Date('2026-03-11'),
      weight: 70.5,
      syncStatus: 'local' as const,
      version: 1,
      createdAt: new Date('2026-03-11'),
      updatedAt: new Date('2026-03-11'),
    }

    it('should return success for a valid WeightRecord', () => {
      const result = validateWeightRecord(validRecord)
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept optional fields when provided', () => {
      const recordWithOptionals = {
        ...validRecord,
        userId: 'user-123',
        bodyFat: 22.5,
        notes: 'Morning weigh-in',
        photoUrl: 'https://example.com/photo.jpg',
        localPhotoUri: 'file:///local/photo.jpg',
      }
      const result = validateWeightRecord(recordWithOptionals)
      expect(result.success).toBe(true)
    })

    it('should fail when id is missing', () => {
      const { id: _id, ...recordWithoutId } = validRecord
      const result = validateWeightRecord(recordWithoutId)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail when weight is missing', () => {
      const { weight: _weight, ...recordWithoutWeight } = validRecord
      const result = validateWeightRecord(recordWithoutWeight)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail when weight is negative', () => {
      const result = validateWeightRecord({ ...validRecord, weight: -5 })
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail when weight is zero', () => {
      const result = validateWeightRecord({ ...validRecord, weight: 0 })
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail when bodyFat is out of range', () => {
      const result = validateWeightRecord({ ...validRecord, bodyFat: 101 })
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail when bodyFat is negative', () => {
      const result = validateWeightRecord({ ...validRecord, bodyFat: -1 })
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail when syncStatus is invalid', () => {
      const result = validateWeightRecord({ ...validRecord, syncStatus: 'invalid' })
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail when version is not a positive integer', () => {
      const result = validateWeightRecord({ ...validRecord, version: -1 })
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail when date is missing', () => {
      const { date: _date, ...recordWithoutDate } = validRecord
      const result = validateWeightRecord(recordWithoutDate)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail for non-object input', () => {
      expect(validateWeightRecord(null).success).toBe(false)
      expect(validateWeightRecord(undefined).success).toBe(false)
      expect(validateWeightRecord('string').success).toBe(false)
      expect(validateWeightRecord(42).success).toBe(false)
    })
  })

  describe('validateFoodRecord', () => {
    const validRecord = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      date: new Date('2026-03-11'),
      name: 'Apple',
      calories: 95,
      syncStatus: 'synced' as const,
      version: 1,
      createdAt: new Date('2026-03-11'),
      updatedAt: new Date('2026-03-11'),
    }

    it('should return success for a valid FoodRecord', () => {
      const result = validateFoodRecord(validRecord)
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept optional fields when provided', () => {
      const recordWithOptionals = {
        ...validRecord,
        userId: 'user-123',
        photoUrl: 'https://example.com/food.jpg',
        confidence: 0.95,
      }
      const result = validateFoodRecord(recordWithOptionals)
      expect(result.success).toBe(true)
    })

    it('should fail when id is missing', () => {
      const { id: _id, ...recordWithoutId } = validRecord
      const result = validateFoodRecord(recordWithoutId)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail when name is missing', () => {
      const { name: _name, ...recordWithoutName } = validRecord
      const result = validateFoodRecord(recordWithoutName)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail when name is empty string', () => {
      const result = validateFoodRecord({ ...validRecord, name: '' })
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail when calories is negative', () => {
      const result = validateFoodRecord({ ...validRecord, calories: -1 })
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should accept zero calories', () => {
      const result = validateFoodRecord({ ...validRecord, calories: 0 })
      expect(result.success).toBe(true)
    })

    it('should fail when confidence is out of range (> 1)', () => {
      const result = validateFoodRecord({ ...validRecord, confidence: 1.5 })
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail when confidence is negative', () => {
      const result = validateFoodRecord({ ...validRecord, confidence: -0.1 })
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail when syncStatus is invalid', () => {
      const result = validateFoodRecord({ ...validRecord, syncStatus: 'unknown' })
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail for non-object input', () => {
      expect(validateFoodRecord(null).success).toBe(false)
      expect(validateFoodRecord(undefined).success).toBe(false)
      expect(validateFoodRecord(42).success).toBe(false)
    })
  })

  describe('generateUUID', () => {
    it('should return a string', () => {
      const uuid = generateUUID()
      expect(typeof uuid).toBe('string')
    })

    it('should match UUID v4 format', () => {
      const uuid = generateUUID()
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(uuid).toMatch(uuidV4Regex)
    })

    it('should generate unique values each call', () => {
      const uuids = new Set(Array.from({ length: 100 }, () => generateUUID()))
      expect(uuids.size).toBe(100)
    })
  })
})
