import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker'; // Importação do Picker

import { CustomInput } from '../components/CustomInput';
import { addService, getServiceTypes } from '../database/SQLiteService'; // getServiceTypes NOVO
import { ServiceModel, ServiceTypeModel } from '../database/types'; // ServiceTypeModel NOVO

export default function Register({ navigation }: { navigation: any }) {
  // Alteramos o estado para armazenar o ID do tipo selecionado
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<number | null>(null);
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceValue, setServiceValue] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeModel[]>([]);

  // Carrega os Tipos de Serviço do banco (Elétrica, Hidráulica, etc.)
  const loadServiceTypes = async () => {
    try {
      const types = await getServiceTypes();
      setServiceTypes(types);
      if (types.length > 0) {
        // Define o primeiro tipo como padrão
        setSelectedServiceTypeId(types[0].id); 
      }
    } catch (error) {
      console.error("Erro ao carregar tipos de serviço:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadServiceTypes();
    }, [])
  );

  const handleRegister = async () => {
    // 1. Validações
    if (!selectedServiceTypeId || !serviceValue || !serviceLocation) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }
    
    const numericValue = parseFloat(serviceValue.replace(',', '.'));
    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert('Erro', 'Valor inválido.');
      return;
    }

    // 2. Encontra o nome do tipo para a descrição
    const selectedType = serviceTypes.find(t => t.id === selectedServiceTypeId);
    if (!selectedType) {
        Alert.alert('Erro', 'Tipo de serviço não encontrado.');
        return;
    }

    const newService: ServiceModel = {
      serviceTypeId: selectedServiceTypeId,
      description: `${selectedType.name} - ${serviceDescription || 'Serviço Padrão'}`, // Descrição combinada
      value: numericValue,
      date: serviceDate,
      location: serviceLocation,
      isCompleted: 0, // Inicia como Aguardando/Pendente
    };

    try {
      await addService(newService);
      
      // Limpa os campos após o cadastro
      setServiceDescription('');
      setServiceValue('');
      setServiceLocation('');

      Alert.alert('Sucesso', 'Serviço agendado e pronto para faturamento!');
      
      // Opcional: Navega para a Agenda
      navigation.navigate('Agenda'); 
    } catch (error) {
      Alert.alert('Erro', `Falha ao registrar serviço: ${String(error)}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registrar Novo Serviço</Text>
      <Text style={styles.subtitle}>Agende um trabalho ou registre um serviço concluído para faturamento.</Text>

      {/* -------------------- CAMPO DE SELEÇÃO (PICKER) -------------------- */}
      <Text style={styles.inputLabel}>Tipo de Serviço</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedServiceTypeId}
          onValueChange={(itemValue) => setSelectedServiceTypeId(itemValue)}
          style={styles.picker}
          enabled={serviceTypes.length > 0}
        >
          {serviceTypes.map((type) => (
            <Picker.Item key={type.id} label={type.name} value={type.id} />
          ))}
        </Picker>
      </View>
      {/* ------------------------------------------------------------------- */}

      <CustomInput
        label="Descrição Detalhada (Opcional)"
        placeholder="Ex: Troca de fiação principal"
        value={serviceDescription}
        onChangeText={setServiceDescription}
      />
      
      <CustomInput
        label="Valor Cobrado (R$)"
        placeholder="150.00"
        keyboardType="numeric"
        value={serviceValue}
        onChangeText={setServiceValue}
      />
      
      <CustomInput
        label="Endereço do Serviço / Nome do Cliente"
        placeholder="Rua da Oficina, 123 - Cliente João Silva"
        value={serviceLocation}
        onChangeText={setServiceLocation}
      />
      
      {/* O campo de data pode ser melhorado depois com um DatePicker */}
      <CustomInput
        label="Data do Serviço"
        placeholder="AAAA-MM-DD"
        value={serviceDate}
        onChangeText={setServiceDate}
        editable={false}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>CADASTRAR E AGENDAR</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', marginBottom: 5, marginTop: 40 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  
  // Picker Styles
  inputLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 15,
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },

  button: {
    backgroundColor: '#27AE60',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
    shadowColor: '#27AE60',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});