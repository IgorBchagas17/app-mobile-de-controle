import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Dimensions, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit'; // Importação NOVA

import { getServices, getMonthlyRevenue } from '../database/SQLiteService'; // getMonthlyRevenue NOVO
import { ServiceModel } from '../database/types';
import { ServiceCard } from '../components/ServiceCard';

const screenWidth = Dimensions.get('window').width;

export default function Dashboard() {
  const [services, setServices] = useState<ServiceModel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string, total: number }[]>([]); // Estado NOVO para o gráfico

  const loadData = async () => {
    try {
      setLoading(true);
      
      const data = await getServices();
      const completedServices = data.filter(s => s.isCompleted === 1);
      setServices(completedServices); // Mostra só os concluídos no histórico

      // 1. Cálculo do Total
      const sum = completedServices.reduce((acc, item) => acc + item.value, 0);
      setTotal(sum);
      
      // 2. Busca de Dados para o Gráfico
      const monthlyData = await getMonthlyRevenue();
      setMonthlyRevenue(monthlyData);
      
    } catch (error) {
      console.log("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Formata os dados para o Gráfico
  const chartData = useMemo(() => {
    const data = monthlyRevenue.sort((a, b) => (a.month > b.month ? 1 : -1));
    const labels = data.map(item => item.month.split('-')[1]); // Pega só o MÊS
    const revenues = data.map(item => item.total);

    return {
      labels: labels.length > 0 ? labels : ['0'],
      datasets: [
        {
          data: revenues.length > 0 ? revenues : [0],
        },
      ],
    };
  }, [monthlyRevenue]);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadData} />
      }
    >
      {/* Cabeçalho Azul com Resumo */}
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeText}>Visão Geral do Faturamento</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Recebido (Todos os tempos)</Text>
          <Text style={styles.summaryValue}>
            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Text>
          <Text style={styles.summaryCount}>{services.length} serviços concluídos</Text>
        </View>
      </View>

      {/* Gráfico de Ganhos Mensais */}
      <View style={styles.chartArea}>
        <Text style={styles.chartTitle}>Ganhos por Mês (Últimos 6 meses)</Text>
        <BarChart
            data={chartData}
            width={screenWidth - 40} // Largura total da tela menos margens
            height={220}
            yAxisLabel="R$"
            yAxisSuffix=""
            chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0, // Sem casas decimais no eixo Y
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // Cor da barra
                labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                style: {
                    borderRadius: 16,
                },
                propsForBackgroundLines: {
                    strokeDasharray: '', // Linhas contínuas
                }
            }}
            style={styles.chartStyle}
        />
      </View>


      {/* Lista de Serviços */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Últimos Faturamentos</Text>
        
        <FlatList
          data={services.slice(0, 5)} // Mostra apenas os 5 mais recentes
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ServiceCard data={item} />}
          scrollEnabled={false} // Para não ter scroll dentro do scroll (FlatList dentro de ScrollView)
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>Cadastre um serviço na aba "Novo Serviço".</Text>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  headerContainer: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
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
  // Gráfico
  chartArea: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 20, // Ajuste para o eixo Y
    backgroundColor: '#FFF',
  },
  // Lista
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    marginTop: 20,
    fontStyle: 'italic',
  }
});