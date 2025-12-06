import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';

import AppRoutes from './src/routes/AppRoutes';
import { DBProvider } from './src/database/DBContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext'; // Importação do Tema

// Componente wrapper para controlar a StatusBar baseado no tema
const AppContent = () => {
  const { isDark } = useTheme();
  return (
    <NavigationContainer>
      {/* StatusBar dinâmica: 'light' (texto branco) se escuro, 'dark' (texto preto) se claro */}
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppRoutes />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <DBProvider>
      <ThemeProvider>
         <AppContent />
      </ThemeProvider>
    </DBProvider>
  );
}