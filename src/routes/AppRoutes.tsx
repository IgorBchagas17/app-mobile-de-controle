import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Biblioteca de ícones padrão do Expo

// Importando as telas que acabamos de preencher
import Dashboard from '../screens/Dashboard';
import Register from '../screens/Register';
import Schedule from '../screens/Schedule';

const Tab = createBottomTabNavigator();

export default function AppRoutes() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Esconde o cabeçalho padrão feio
        tabBarActiveTintColor: '#007AFF', // Cor do ícone ativo (Azul)
        tabBarInactiveTintColor: 'gray',  // Cor do ícone inativo
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        // Configuração dinâmica dos ícones
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Novo Serviço') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Agenda') {
            iconName = focused ? 'calendar' : 'calendar-outline';
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
    </Tab.Navigator>
  );
}