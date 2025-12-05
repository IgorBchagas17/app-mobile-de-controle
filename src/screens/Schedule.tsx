import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { getServices, updateServiceStatus, deleteService } from '../database/SQLiteService';
import { ServiceModel } from '../database/types';
import { cancelServiceReminder } from '../services/NotificationService'; 
import { ScheduleFormModal } from '../components/ScheduleFormModal';
import { Colors, Typography, Spacing, Styles } from '../utils/theme';

export default function Schedule() {
  const [items, setItems] = useState<ServiceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false); 

  const loadData = async () => {
    try {
      const allServices = await getServices();
      const pending = allServices.filter(item => item.isCompleted === 0);
      setItems(pending);
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
              await updateServiceStatus(item.id, 1); 
              await cancelServiceReminder(item.id); 
              loadData(); 
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
        await cancelServiceReminder(id); 
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
          <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id!)}>
          <Ionicons name="trash-outline" size={24} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.fullContainer}>
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Agenda de Serviços</Text>
            
            <FlatList
                data={items}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                contentContainerStyle={{ padding: Spacing.md }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={[Colors.primary]} />}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={50} color={Colors.lightText} />
                        <Text style={styles.emptyText}>Nenhum agendamento pendente.</Text>
                        <Text style={styles.emptyTextSmall}>Clique no botão (+) para agendar um novo serviço.</Text>
                    </View>
                )}
            />
        </View>

        {/* Botão Flutuante (FAB) para Agendar */}
        <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
            <Ionicons name="add" size={32} color={Colors.cardBackground} />
        </TouchableOpacity>
        
        {/* Modal de Agendamento (Estilo iOS) */}
        <ScheduleFormModal
            isVisible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onServiceScheduled={loadData} // Recarrega a lista
        />
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingTop: 50 },
  headerTitle: { 
    fontSize: Typography.fontSize.large, 
    fontWeight: 'bold', 
    color: Colors.text, 
    paddingHorizontal: Spacing.md, 
    marginBottom: Spacing.sm, 
  },
  card: { 
    backgroundColor: Colors.cardBackground, 
    ...Styles.cardShadow,
    borderRadius: 12, 
    padding: Spacing.md, 
    marginBottom: Spacing.md, 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderLeftWidth: 5,
    borderLeftColor: Colors.secondary, 
  },
  cardContent: { flex: 1, },
  date: { color: Colors.secondary, fontWeight: 'bold', fontSize: Typography.fontSize.small, marginBottom: Spacing.xs, },
  description: { fontSize: Typography.fontSize.medium, fontWeight: '600', color: Colors.text, marginBottom: 2, },
  location: { fontSize: Typography.fontSize.small, color: Colors.lightText, marginBottom: 4, },
  value: { fontSize: Typography.fontSize.small, fontWeight: 'bold', color: Colors.text, },
  actions: { flexDirection: 'column', alignItems: 'center', gap: Spacing.md, marginLeft: Spacing.md, },
  checkButton: { padding: Spacing.xs, },
  deleteButton: { padding: Spacing.xs, },
  emptyContainer: { alignItems: 'center', marginTop: 100, },
  emptyText: { color: Colors.lightText, marginTop: Spacing.sm, fontSize: Typography.fontSize.medium, },
  emptyTextSmall: { color: Colors.lightText, fontSize: Typography.fontSize.small, marginTop: Spacing.xs, textAlign: 'center' },
  
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: Spacing.lg,
    bottom: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    shadowColor: Colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  }
});