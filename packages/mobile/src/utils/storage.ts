import AsyncStorage from '@react-native-async-storage/async-storage'

export const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error(`Error getting item ${key}:`, error)
      return null
    }
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting item ${key}:`, error)
      throw error
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item ${key}:`, error)
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear()
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  },

  // Health check to verify AsyncStorage is working
  async healthCheck(): Promise<{ success: boolean; error?: string }> {
    const testKey = '@weight_tracker:health_check'
    const testValue = { timestamp: Date.now() }

    try {
      console.log('[Storage] Running health check...')

      // Test write
      await AsyncStorage.setItem(testKey, JSON.stringify(testValue))
      console.log('[Storage] Write test passed')

      // Test read
      const retrieved = await AsyncStorage.getItem(testKey)
      if (!retrieved) {
        throw new Error('Failed to retrieve test value')
      }
      console.log('[Storage] Read test passed')

      // Test parse
      const parsed = JSON.parse(retrieved)
      if (parsed.timestamp !== testValue.timestamp) {
        throw new Error('Retrieved value does not match')
      }
      console.log('[Storage] Parse test passed')

      // Cleanup
      await AsyncStorage.removeItem(testKey)
      console.log('[Storage] Health check completed successfully')

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('[Storage] Health check failed:', errorMessage)
      return { success: false, error: errorMessage }
    }
  },
}

export const STORAGE_KEYS = {
  USER_TOKEN: '@weight_tracker:user_token',
  USER_DATA: '@weight_tracker:user_data',
  THEME: '@weight_tracker:theme',
  LANGUAGE: '@weight_tracker:language',
  SETTINGS: '@weight_tracker:settings',
}
