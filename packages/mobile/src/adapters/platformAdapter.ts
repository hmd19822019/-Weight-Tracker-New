import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import type { PlatformAdapter } from '@weight-tracker/shared'

const platformAdapter: PlatformAdapter = {
  storage: {
    async getItem(key: string) {
      return await AsyncStorage.getItem(key)
    },
    async setItem(key: string, value: string) {
      await AsyncStorage.setItem(key, value)
    },
    async removeItem(key: string) {
      await AsyncStorage.removeItem(key)
    }
  },
  network: {
    async isConnected() {
      const state = await NetInfo.fetch()
      return state.isConnected ?? false
    }
  }
}

export default platformAdapter
