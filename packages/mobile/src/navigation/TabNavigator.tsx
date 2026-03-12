import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { RecordScreen } from '../screens/RecordScreen'
import { HistoryScreen } from '../screens/HistoryScreen'
import { StatisticsScreen } from '../screens/StatisticsScreen'

export type TabParamList = {
  Record: undefined
  History: undefined
  Statistics: undefined
}

const Tab = createBottomTabNavigator<TabParamList>()

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen
        name="Record"
        component={RecordScreen}
        options={{
          title: '记录',
          tabBarLabel: '记录',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: '历史',
          tabBarLabel: '历史',
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: '统计',
          tabBarLabel: '统计',
        }}
      />
    </Tab.Navigator>
  )
}
