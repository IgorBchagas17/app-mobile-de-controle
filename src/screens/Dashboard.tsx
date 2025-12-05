import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// Importa nossas peças
import { getServices } from '../database/SQLiteService';
import { ServiceModel } from '../database/types';
import { ServiceCard } from '../components/ServiceCard';

export default function Dashboard() {
  const [services, setServices] = useState<ServiceModel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Função que busca os dados
  const loadData = async () => {
    try {
      // Busca a lista do banco
      const data = await getServices();
      setServices(data);

      // Calcula o total somando o valor de todos os itens
      // (reduce é uma função JS para somar arrays)
      const sum = data.reduce((acc, item) => acc + item.value, 0);
      setTotal(sum);
      
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // O Pulo do Gato: Recarrega sempre que a tela aparece
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho Azul com Resumo */}
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeText}>Visão Geral</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Recebido</Text>
          <Text style={styles.summaryValue}>
            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Text>
          <Text style={styles.summaryCount}>{services.length} serviços realizados</Text>
        </View>
      </View>

      {/* Lista de Serviços */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Histórico Recente</Text>
        
        <FlatList
          data={services}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ServiceCard data={item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          // Permite puxar pra baixo pra atualizar
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadData} />
          }
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>Nenhum serviço registrado ainda.</Text>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  headerContainer: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50, // Espaço para a barra de status
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  welcomeText: {
    color: '#FFF',
    fontSize: 18,
    opacity: 0.9,
    marginBottom: 15,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  summaryLabel: {
    color: '#666',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryValue: {
    color: '#333',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  summaryCount: {
    color: '#27AE60',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontStyle: 'italic',
  }
});