import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { RecordScreen } from '../screens/RecordScreen'
import { HistoryScreen } from '../screens/HistoryScreen'
import { StatisticsScreen } from '../screens/StatisticsScreen'
import { InsightsScreen } from '../screens/InsightsScreen'
import { SettingsScreen } from '../screens/SettingsScreen'

export type TabParamList = {
  Record: undefined
  History: undefined
  Statistics: undefined
  Insights: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<TabParamList>()

interface TabNavigatorProps {
  onLogout: () => void
}

export const TabNavigator: React.FC<TabNavigatorProps> = ({ onLogout }) => {
  console.log('[TabNavigator] Rendering TabNavigator')
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Record"
        component={RecordScreen}
        options={{
          title: '记录',
          tabBarLabel: '📝 记录',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: '历史',
          tabBarLabel: '📋 历史',
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: '统计',
          tabBarLabel: '📊 统计',
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          title: '洞察',
          tabBarLabel: '💡 洞察',
        }}
      />
      <Tab.Screen
        name="Settings"
        options={{
          title: '设置',
          tabBarLabel: '⚙️ 设置',
        }}
      >
        {() => <SettingsScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  )
}
