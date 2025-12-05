import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, ActivityIndicator } from 'react-native';

import { initDB } from './src/database/DatabaseInit';
import { initNotifications } from './src/services/NotificationService'; // Importação NOVA
import AppRoutes from './src/routes/AppRoutes';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const startApp = async () => {
      try {
        // 1. Inicia Banco
        await initDB();
        
        // 2. Inicia Notificações (Cria Canal Android)
        await initNotifications();
        
        setReady(true);
      } catch (e) {
        console.log(e);
        setReady(true);
      }
    };
    startApp();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 20 }}>Iniciando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <AppRoutes />
    </NavigationContainer>
  );
}