import React, { useState } from 'react';
import { 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  View
} from 'react-native';

import { CustomInput } from '../components/CustomInput';
import { addService } from '../database/SQLiteService';

export default function Register({ navigation }: any) {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = async (isCompleted: number) => {
    if (!description || !value) {
      Alert.alert('Atenção', 'Preencha a descrição e o valor.');
      return;
    }

    try {
      const valorFormatado = parseFloat(value.replace(',', '.'));
      
      const newService = {
        description,
        value: valorFormatado,
        date,
        location,
        isCompleted: isCompleted, // Aqui define se é Agenda (0) ou Faturamento (1)
      };

      await addService(newService);

      const tipo = isCompleted === 1 ? 'faturamento' : 'agenda';
      Alert.alert('Sucesso', `Salvo na ${tipo} com sucesso!`);
      
      setDescription('');
      setValue('');
      setLocation('');

    } catch (error) {
      Alert.alert('Erro Técnico', String(error));
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Novo Serviço</Text>
        <Text style={styles.subtitle}>É um serviço já feito ou um agendamento?</Text>

        <CustomInput 
          label="Descrição" 
          placeholder="Ex: Instalar Ar Condicionado"
          value={description}
          onChangeText={setDescription}
        />

        <CustomInput 
          label="Valor Estimado (R$)" 
          placeholder="0.00"
          keyboardType="numeric"
          value={value}
          onChangeText={setValue}
        />

        <CustomInput 
          label="Data" 
          value={date}
          onChangeText={setDate}
        />

        <CustomInput 
          label="Local / Cliente" 
          placeholder="Ex: Sr. João"
          value={location}
          onChangeText={setLocation}
        />

        <View style={styles.row}>
          {/* Botão de Agendar (Cinza/Amarelo) */}
          <TouchableOpacity 
            style={[styles.button, styles.scheduleButton]} 
            onPress={() => handleSave(0)}
          >
            <Text style={styles.scheduleText}>AGENDAR</Text>
          </TouchableOpacity>

          {/* Botão de Concluir (Azul) */}
          <TouchableOpacity 
            style={[styles.button, styles.confirmButton]} 
            onPress={() => handleSave(1)}
          >
            <Text style={styles.confirmText}>JÁ FIZ (FATURAR)</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  scheduleButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#F1C40F',
  },
  scheduleText: {
    color: '#F39C12',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});