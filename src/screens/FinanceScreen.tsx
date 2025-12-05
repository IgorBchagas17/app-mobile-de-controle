import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { CustomInput } from '../components/CustomInput';
import { addFinanceEntry, getFinanceEntries, getFinanceBalance } from '../database/SQLiteService';
import { FinanceModel } from '../database/types';

export default function FinanceScreen() {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [entries, setEntries] = useState<FinanceModel[]>([]);
  const [balance, setBalance] = useState({ totalEntrada: 0, totalSaida: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  // --- Lógica de Dados ---
  const loadData = async () => {
    try {
      const allEntries = await getFinanceEntries();
      const balanceData = await getFinanceBalance();

      setEntries(allEntries.slice(0, 10)); // Mostrar só os 10 mais recentes
      setBalance(balanceData);
    } catch (error) {
      console.log('Erro ao carregar finanças:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleSave = async (type: 'entrada' | 'saida') => {
    if (!description || !value) {
      Alert.alert('Erro', 'Preencha descrição e valor.');
      return;
    }
    
    try {
      const numericValue = parseFloat(value.replace(',', '.'));
      if (isNaN(numericValue) || numericValue <= 0) {
        Alert.alert('Erro', 'Valor inválido.');
        return;
      }

      const newEntry: FinanceModel = {
        type,
        description,
        value: numericValue,
        date: new Date().toISOString().split('T')[0],
      };

      await addFinanceEntry(newEntry);
      
      setDescription('');
      setValue('');
      loadData(); // Recarrega para atualizar o balanço
      Alert.alert('Sucesso', `Transação de ${type} salva!`);
      
    } catch (error) {
      Alert.alert('Erro', `Falha ao salvar: ${String(error)}`);
    }
  };

  // --- Componentes ---
  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const EntryCard = ({ entry }: { entry: FinanceModel }) => {
    const isSaida = entry.type === 'saida';
    const color = isSaida ? '#E74C3C' : '#27AE60';
    const iconName = isSaida ? 'arrow-down-circle' : 'arrow-up-circle';

    return (
      <View style={styles.entryCard}>
        <Ionicons name={iconName} size={24} color={color} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.entryDescription}>{entry.description}</Text>
          <Text style={styles.entryDate}>{entry.date.split('T')[0]}</Text>
        </View>
        <Text style={[styles.entryValue, { color }]}>{formatCurrency(entry.value)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />} >
        
        <Text style={styles.title}>Caixa e Balanço Geral</Text>

        {/* Cartão de Balanço */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>BALANÇO GERAL</Text>
          <Text style={[styles.balanceValue, { color: balance.balance >= 0 ? '#27AE60' : '#E74C3C' }]}>
            {formatCurrency(balance.balance)}
          </Text>
          <View style={styles.balanceDetail}>
            <Text style={styles.detailText}>Entradas: {formatCurrency(balance.totalEntrada)}</Text>
            <Text style={styles.detailText}>Saídas: {formatCurrency(balance.totalSaida)}</Text>
          </View>
        </View>

        {/* Formulário de Nova Transação */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Registrar Nova Transação (Caixa)</Text>
          
          <CustomInput 
            label="Descrição (Ex: Combustível, Compra de Peças)"
            placeholder="Motivo da entrada/saída"
            value={description}
            onChangeText={setDescription}
          />
          <CustomInput 
            label="Valor (R$)"
            placeholder="0.00"
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.saidaButton]} 
              onPress={() => handleSave('saida')}
            >
              <Text style={styles.buttonText}>Registrar Saída</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.entradaButton]} 
              onPress={() => handleSave('entrada')}
            >
              <Text style={styles.buttonText}>Registrar Entrada</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Histórico de Transações */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Últimas Transações</Text>
          {entries.map(entry => <EntryCard key={entry.id} entry={entry} />)}
          {entries.length === 0 && <Text style={{ color: '#999', textAlign: 'center' }}>Nenhuma transação registrada.</Text>}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F2' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', padding: 20, paddingTop: 60, },
    
    // Balance Card
    balanceCard: { backgroundColor: '#FFF', marginHorizontal: 20, padding: 20, borderRadius: 10, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, marginBottom: 20, },
    balanceLabel: { fontSize: 14, color: '#666', marginBottom: 5, },
    balanceValue: { fontSize: 36, fontWeight: 'bold', },
    balanceDetail: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10, },
    detailText: { fontSize: 14, color: '#666' },

    // Form
    formContainer: { backgroundColor: '#FFF', marginHorizontal: 20, padding: 20, borderRadius: 10, shadowOpacity: 0.05, elevation: 1, marginBottom: 20, },
    formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    buttonRow: { flexDirection: 'row', gap: 10, marginTop: 10, },
    button: { flex: 1, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', },
    saidaButton: { backgroundColor: '#E74C3C', },
    entradaButton: { backgroundColor: '#27AE60', },
    buttonText: { color: '#FFF', fontWeight: 'bold' },

    // History
    historyContainer: { marginHorizontal: 20, marginBottom: 40 },
    historyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    entryCard: { backgroundColor: '#FFF', padding: 10, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center', },
    entryDescription: { fontWeight: '600' },
    entryDate: { fontSize: 12, color: '#999' },
    entryValue: { fontWeight: 'bold', fontSize: 16 }
});