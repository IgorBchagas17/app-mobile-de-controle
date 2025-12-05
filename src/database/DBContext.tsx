import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { initDB } from './DatabaseInit'; // Importa a inicialização real

interface DBContextType {
  isReady: boolean;
}

const DBContext = createContext<DBContextType | undefined>(undefined);

// Hook customizado para usar o estado de prontidão do banco
export const useDBContext = () => {
  const context = useContext(DBContext);
  if (context === undefined) {
    throw new Error('useDBContext deve ser usado dentro de um DBProvider');
  }
  return context;
};

// Componente Provedor (Wrapper)
export const DBProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Inicializa o banco de dados
    initDB()
      .then(() => {
        console.log("Banco de dados pronto para uso.");
        setIsReady(true);
      })
      .catch((err) => {
        console.error("Erro CRÍTICO ao abrir o banco:", err);
        // Em caso de falha, ainda tentamos liberar o app com um aviso
        setIsReady(true); 
      });
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#1D70B8" />
        <Text style={{ marginTop: 20, color: '#333' }}>Carregando dados iniciais...</Text>
      </View>
    );
  }

  // Passa o estado de prontidão para o resto do app
  return (
    <DBContext.Provider value={{ isReady }}>
      {children}
    </DBContext.Provider>
  );
};