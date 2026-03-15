import React, { useState, useEffect } from 'react'
import { StatusBar, useColorScheme, ActivityIndicator, View, Alert, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { TabNavigator } from './src/navigation/TabNavigator'
import { LoginScreen } from './src/screens/LoginScreen'
import { storage, STORAGE_KEYS } from './src/utils/storage'

function App() {
  const isDarkMode = useColorScheme() === 'dark'
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [storageError, setStorageError] = useState<string | null>(null)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      // Run storage health check
      console.log('[App] Running storage health check...')
      const healthCheck = await storage.healthCheck()

      if (!healthCheck.success) {
        console.error('[App] Storage health check failed:', healthCheck.error)
        setStorageError(healthCheck.error || 'Unknown storage error')
        Alert.alert(
          '存储初始化失败',
          `AsyncStorage 无法正常工作，应用可能无法保存数据。\n\n错误：${healthCheck.error}\n\n请尝试重新安装应用。`,
          [{ text: '确定' }]
        )
      } else {
        console.log('[App] Storage health check passed')
      }

      // Check authentication
      const token = await storage.getItem<string>(STORAGE_KEYS.USER_TOKEN)
      setIsAuthenticated(!!token)
    } catch (error) {
      console.error('[App] Failed to initialize app:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      setStorageError(errorMessage)
      Alert.alert('初始化失败', `应用初始化失败：${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = () => {
    console.log('[App] Login success, setting authenticated to true')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 16, color: '#666' }}>正在初始化...</Text>
        </View>
      </SafeAreaProvider>
    )
  }

  if (storageError) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF3B30', marginBottom: 12 }}>
            ⚠️ 存储错误
          </Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 }}>
            AsyncStorage 初始化失败，应用无法正常保存数据。
          </Text>
          <Text style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 16, lineHeight: 18 }}>
            错误详情：{storageError}
          </Text>
          <Text style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 16 }}>
            请尝试重新安装应用或联系技术支持。
          </Text>
        </View>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {isAuthenticated ? (
        <>
          {console.log('[App] Rendering TabNavigator')}
          <NavigationContainer>
            <TabNavigator onLogout={handleLogout} />
          </NavigationContainer>
        </>
      ) : (
        <>
          {console.log('[App] Rendering LoginScreen')}
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </>
      )}
    </SafeAreaProvider>
  )
}

export default App
