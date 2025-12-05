import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { getServices, updateServiceStatus, deleteService } from '../database/SQLiteService';
import { ServiceModel } from '../database/types';
import { scheduleServiceReminder, cancelServiceReminder } from '../services/NotificationService'; // Importação NOVA

export default function Schedule() {
  const [items, setItems] = useState<ServiceModel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const allServices = await getServices();
      const pending = allServices.filter(item => item.isCompleted === 0);
      setItems(pending);
      
      // NOVO: Agenda lembretes para os serviços pendentes
      pending.forEach(item => {
        if (item.id) {
          scheduleServiceReminder(item.id, item.date, item.description);
        }
      });

    } catch (error) {
      console.log('Erro ao carregar agenda:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleFinish = async (item: ServiceModel) => {
    Alert.alert(
      "Concluir Serviço",
      "Deseja marcar este serviço como realizado? Ele irá para o seu faturamento.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Concluir", 
          onPress: async () => {
            if (item.id) {
              await updateServiceStatus(item.id, 1); // Muda status para 1
              await cancelServiceReminder(item.id); // NOVO: Cancela o lembrete
              loadData(); // Recarrega a lista
            }
          }
        }
      ]
    );
  };

  const handleDelete = async (id: number) => {
    Alert.alert("Excluir", "Tem certeza que deseja excluir o agendamento?", [
      { text: "Cancelar" },
      { text: "Sim", onPress: async () => { 
        await deleteService(id); 
        await cancelServiceReminder(id); // NOVO: Cancela o lembrete
        loadData(); 
      } }
    ]);
  };

  const renderItem = ({ item }: { item: ServiceModel }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.date}>{item.date.split('-').reverse().join('/')}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.location}>{item.location || 'Sem local definido'}</Text>
        <Text style={styles.value}>R$ {item.value.toFixed(2).replace('.', ',')}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.checkButton} onPress={() => handleFinish(item)}>
          <Ionicons name="checkmark-circle" size={32} color="#27AE60" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id!)}>
          <Ionicons name="trash-outline" size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Agenda de Serviços</Text>
      
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={50} color="#CCC" />
            <Text style={styles.emptyText}>Nenhum agendamento pendente.</Text>
            <Text style={styles.emptyTextSmall}>Cadastre um serviço na aba "Novo Serviço" e use o botão "Agendar".</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: 50, },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', paddingHorizontal: 20, marginBottom: 10, },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', shadowOpacity: 0.05, elevation: 2, },
  cardContent: { flex: 1, },
  date: { color: '#F39C12', fontWeight: 'bold', fontSize: 14, marginBottom: 4, },
  description: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 2, },
  location: { fontSize: 14, color: '#777', marginBottom: 4, },
  value: { fontSize: 14, fontWeight: 'bold', color: '#555', },
  actions: { flexDirection: 'column', alignItems: 'center', gap: 15, marginLeft: 10, },
  checkButton: { padding: 5, },
  deleteButton: { padding: 5, },
  emptyContainer: { alignItems: 'center', marginTop: 100, },
  emptyText: { color: '#999', marginTop: 10, fontSize: 16, },
  emptyTextSmall: { color: '#999', fontSize: 12, marginTop: 5, textAlign: 'center' }
});