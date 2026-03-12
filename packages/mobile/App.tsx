import React, { useState, useEffect } from 'react'
import { StatusBar, useColorScheme, ActivityIndicator, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { TabNavigator } from './src/navigation/TabNavigator'
import { LoginScreen } from './src/screens/LoginScreen'
import { storage, STORAGE_KEYS } from './src/utils/storage'

function App() {
  const isDarkMode = useColorScheme() === 'dark'
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = await storage.getItem<string>(STORAGE_KEYS.USER_TOKEN)
      setIsAuthenticated(!!token)
    } catch (error) {
      console.error('Failed to check auth', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {isAuthenticated ? (
        <NavigationContainer>
          <TabNavigator onLogout={handleLogout} />
        </NavigationContainer>
      ) : (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </SafeAreaProvider>
  )
}

export default App
