import { useUserStore } from '../userStore'
import type { User } from '../../types'

describe('userStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUserStore.setState({
      user: null,
      token: null,
      isLoggedIn: false,
    })
  })

  describe('initial state', () => {
    it('should have user as null', () => {
      const { user } = useUserStore.getState()
      expect(user).toBeNull()
    })

    it('should have token as null', () => {
      const { token } = useUserStore.getState()
      expect(token).toBeNull()
    })

    it('should have isLoggedIn as false', () => {
      const { isLoggedIn } = useUserStore.getState()
      expect(isLoggedIn).toBe(false)
    })
  })

  describe('setUser', () => {
    it('should set user and update isLoggedIn to true', () => {
      const mockUser: User = {
        id: 'user1',
        phone: '13800138000',
        nickname: 'Test User',
        createdAt: new Date('2024-01-01'),
      }

      useUserStore.getState().setUser(mockUser)
      const { user, isLoggedIn } = useUserStore.getState()
      expect(user).toEqual(mockUser)
      expect(isLoggedIn).toBe(true)
    })

    it('should clear user and update isLoggedIn to false', () => {
      const mockUser: User = {
        id: 'user1',
        phone: '13800138000',
        createdAt: new Date('2024-01-01'),
      }

      useUserStore.getState().setUser(mockUser)
      useUserStore.getState().setUser(null)
      const { user, isLoggedIn } = useUserStore.getState()
      expect(user).toBeNull()
      expect(isLoggedIn).toBe(false)
    })
  })

  describe('setToken', () => {
    it('should set token', () => {
      const mockToken = 'test-token-123'
      useUserStore.getState().setToken(mockToken)
      const { token } = useUserStore.getState()
      expect(token).toBe(mockToken)
    })

    it('should clear token', () => {
      useUserStore.getState().setToken('test-token')
      useUserStore.getState().setToken(null)
      const { token } = useUserStore.getState()
      expect(token).toBeNull()
    })
  })

  describe('logout', () => {
    it('should clear user, token, and set isLoggedIn to false', () => {
      const mockUser: User = {
        id: 'user1',
        phone: '13800138000',
        createdAt: new Date('2024-01-01'),
      }

      useUserStore.getState().setUser(mockUser)
      useUserStore.getState().setToken('test-token')

      useUserStore.getState().logout()

      const { user, token, isLoggedIn } = useUserStore.getState()
      expect(user).toBeNull()
      expect(token).toBeNull()
      expect(isLoggedIn).toBe(false)
    })

    it('should work when already logged out', () => {
      useUserStore.getState().logout()
      const { user, token, isLoggedIn } = useUserStore.getState()
      expect(user).toBeNull()
      expect(token).toBeNull()
      expect(isLoggedIn).toBe(false)
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete login flow', () => {
      const mockUser: User = {
        id: 'user1',
        phone: '13800138000',
        nickname: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        height: 175,
        gender: 'male',
        createdAt: new Date('2024-01-01'),
      }
      const mockToken = 'jwt-token-xyz'

      useUserStore.getState().setUser(mockUser)
      useUserStore.getState().setToken(mockToken)

      const state = useUserStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe(mockToken)
      expect(state.isLoggedIn).toBe(true)
    })

    it('should handle complete logout flow', () => {
      const mockUser: User = {
        id: 'user1',
        phone: '13800138000',
        createdAt: new Date('2024-01-01'),
      }

      useUserStore.getState().setUser(mockUser)
      useUserStore.getState().setToken('token')
      useUserStore.getState().logout()

      const state = useUserStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isLoggedIn).toBe(false)
    })
  })
})
