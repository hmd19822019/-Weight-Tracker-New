import type { WeightRecord, User, SyncStatus } from '../types/models'

describe('Data Models', () => {
  describe('WeightRecord', () => {
    it('should have all required fields', () => {
      const record: WeightRecord = {
        id: '123',
        date: new Date(),
        weight: 65.5,
        syncStatus: 'local',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(record.id).toBe('123')
      expect(record.weight).toBe(65.5)
      expect(record.syncStatus).toBe('local')
    })

    it('should allow optional fields', () => {
      const record: WeightRecord = {
        id: '123',
        userId: 'user-1',
        date: new Date(),
        weight: 65.5,
        bodyFat: 18.5,
        notes: 'Morning weight',
        photoUrl: 'https://example.com/photo.jpg',
        localPhotoUri: 'file:///photo.jpg',
        syncStatus: 'synced',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(record.userId).toBe('user-1')
      expect(record.bodyFat).toBe(18.5)
      expect(record.notes).toBe('Morning weight')
    })
  })

  describe('SyncStatus', () => {
    it('should only allow valid sync statuses', () => {
      const validStatuses: SyncStatus[] = ['local', 'synced', 'pending']

      validStatuses.forEach(status => {
        expect(['local', 'synced', 'pending']).toContain(status)
      })
    })
  })

  describe('User', () => {
    it('should have all required fields', () => {
      const user: User = {
        id: 'user-1',
        createdAt: new Date()
      }

      expect(user.id).toBe('user-1')
      expect(user.createdAt).toBeInstanceOf(Date)
    })

    it('should allow optional fields', () => {
      const user: User = {
        id: 'user-1',
        phone: '13800138000',
        wechatOpenId: 'wx123',
        nickname: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        height: 170,
        gender: 'male',
        createdAt: new Date()
      }

      expect(user.phone).toBe('13800138000')
      expect(user.height).toBe(170)
      expect(user.gender).toBe('male')
    })
  })
})
