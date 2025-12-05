import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';         // Nova Home (Gráficos)
import ServicesHistory from '../screens/ServicesHistory'; // Antigo Dashboard (Lista)
import Schedule from '../screens/Schedule';             // Agenda
import FinanceScreen from '../screens/FinanceScreen';   // Caixa

const Tab = createBottomTabNavigator();

export default function AppRoutes() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, 
        tabBarActiveTintColor: '#1D70B8', 
        tabBarInactiveTintColor: 'gray', 
        tabBarStyle: { paddingBottom: 5, paddingTop: 5, height: 60 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'alert-circle';

          if (route.name === 'Início') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          else if (route.name === 'Serviços') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'Agenda') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Caixa') iconName = focused ? 'wallet' : 'wallet-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Serviços" component={ServicesHistory} />
      <Tab.Screen name="Agenda" component={Schedule} />
      <Tab.Screen name="Caixa" component={FinanceScreen} />
    </Tab.Navigator>
  );
}