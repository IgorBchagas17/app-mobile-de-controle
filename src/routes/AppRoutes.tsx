import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Dashboard from '../screens/Dashboard';
import Register from '../screens/Register';
import Schedule from '../screens/Schedule';
import FinanceScreen from '../screens/FinanceScreen';
import InvoiceScreen from '../screens/InvoiceScreen'; // IMPORTAÇÃO NOVA

const Tab = createBottomTabNavigator();

export default function AppRoutes() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, 
        tabBarActiveTintColor: '#007AFF', 
        tabBarInactiveTintColor: 'gray', 
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Novo Serviço') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Agenda') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Caixa') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Nota') { // NOVO ÍCONE
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else {
            iconName = 'alert-circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Novo Serviço" component={Register} />
      <Tab.Screen name="Agenda" component={Schedule} />
      <Tab.Screen name="Caixa" component={FinanceScreen} />
      <Tab.Screen name="Nota" component={InvoiceScreen} />
    </Tab.Navigator>
  );
}