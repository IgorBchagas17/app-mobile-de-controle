import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, ActivityIndicator } from 'react-native';

// Importa a inicialização do banco
import { initDB } from './src/database/DatabaseInit';
// Importa as rotas (menus)
import AppRoutes from './src/routes/AppRoutes';

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // Inicia o banco de dados assim que o app abre
    initDB()
      .then(() => {
        console.log("Banco pronto!");
        setDbReady(true);
      })
      .catch((err) => {
        console.log("Erro crítico:", err);
      });
  }, []);

  // Enquanto o banco carrega, mostra uma bolinha girando
  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Carregando Sistema...</Text>
      </View>
    );
  }

  // Quando estiver pronto, mostra o App com os Menus
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <AppRoutes />
    </NavigationContainer>
  );
}