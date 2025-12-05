import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';

import AppRoutes from './src/routes/AppRoutes';
import { DBProvider } from './src/database/DBContext'; // NOVO: Provedor de Banco

export default function App() {
  return (
    // O Provedor de Banco de Dados envolve todo o app
    <DBProvider> 
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppRoutes />
      </NavigationContainer>
    </DBProvider>
  );
}