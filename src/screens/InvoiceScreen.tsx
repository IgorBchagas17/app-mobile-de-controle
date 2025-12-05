import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print'; // Importação NOVA para PDF
import * as Sharing from 'expo-sharing'; // Importação NOVA para Compartilhar
import { Ionicons } from '@expo/vector-icons';

import { getServiceTypes, getServices } from '../database/SQLiteService';
import { ServiceTypeModel, ServiceModel } from '../database/types';
import { CustomInput } from '../components/CustomInput';

// Estado inicial do formulário (dados da nota)
interface InvoiceData {
  serviceId: number | null;
  clientName: string;
  clientAddress: string;
  invoiceNumber: number;
}

export default function InvoiceScreen() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    serviceId: null,
    clientName: '',
    clientAddress: '',
    invoiceNumber: 1001, // Começa com um número de nota
  });
  const [availableServices, setAvailableServices] = useState<ServiceModel[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceModel | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega todos os serviços concluídos e os tipos
  const loadData = async () => {
    try {
      setLoading(true);
      const allServices = await getServices();
      const completedServices = allServices.filter(s => s.isCompleted === 1);
      setAvailableServices(completedServices);
      setServiceTypes(await getServiceTypes());

      if (completedServices.length > 0) {
        // Seleciona o primeiro serviço concluído como padrão para demonstração
        const latestService = completedServices[0];
        setInvoiceData(prev => ({
          ...prev,
          serviceId: latestService.id || null,
          clientAddress: latestService.location || '',
          // Simula incremento do número da nota
          invoiceNumber: prev.invoiceNumber + completedServices.length,
        }));
        setSelectedService(latestService);
      }
    } catch (error) {
      console.log('Erro ao carregar dados para nota:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  // Função para mapear o serviceTypeId para o Nome do Tipo
  const getServiceTypeName = (id: number | undefined) => {
    if (!id) return 'N/A';
    return serviceTypes.find(t => t.id === id)?.name || 'Serviço Personalizado';
  };

  // -------------------------------------------------------------------
  // --- Geração do HTML (O Layout da Nota) ----------------------------
  // -------------------------------------------------------------------
  const generateInvoiceHTML = (data: InvoiceData, service: ServiceModel) => {
    const serviceType = getServiceTypeName(service.serviceTypeId);
    const date = new Date().toLocaleDateString('pt-BR');

    const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Arial', sans-serif; padding: 20px; color: #333; }
            .container { border: 1px solid #007AFF; padding: 20px; border-radius: 10px; }
            h1 { color: #007AFF; border-bottom: 3px solid #007AFF; padding-bottom: 10px; margin-bottom: 20px; text-align: center; }
            .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .header-info div { width: 48%; }
            .section-title { font-size: 16px; font-weight: bold; margin-top: 15px; margin-bottom: 5px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-size: 20px; font-weight: bold; text-align: right; margin-top: 20px; color: #007AFF; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; }
            .signature { margin-top: 50px; text-align: center; }
            .signature line { border-bottom: 1px solid #333; width: 50%; margin: 0 auto; display: block; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>NOTA DE SERVIÇO Nº ${data.invoiceNumber}</h1>
            
            <div class="header-info">
                <div>
                    <p><strong>PRESTADOR:</strong> Oficina do Papai</p>
                    <p><strong>DATA:</strong> ${date}</p>
                </div>
                <div>
                    <p><strong>CLIENTE:</strong> ${data.clientName || '---'}</p>
                    <p><strong>ENDEREÇO:</strong> ${data.clientAddress || '---'}</p>
                </div>
            </div>
            
            <div class="section-title">SERVIÇOS PRESTADOS</div>
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${service.description}</td>
                  <td>${serviceType}</td>
                  <td>R$ ${service.value.toFixed(2).replace('.', ',')}</td>
                </tr>
              </tbody>
            </table>

            <div class="total">VALOR TOTAL: R$ ${service.value.toFixed(2).replace('.', ',')}</div>

            <div class="signature">
                <line></line>
                <p>Assinatura do Cliente</p>
            </div>
          </div>
          <div class="footer">
            Este é um recibo de serviços. Não tem valor fiscal.
          </div>
        </body>
      </html>
    `;
    return htmlContent;
  };

  // -------------------------------------------------------------------
  // --- Geração e Compartilhamento do PDF -----------------------------
  // -------------------------------------------------------------------
  const printInvoice = async () => {
    if (!selectedService) {
      Alert.alert('Erro', 'Selecione um serviço na lista abaixo.');
      return;
    }
    if (!invoiceData.clientName || !invoiceData.clientAddress) {
        Alert.alert('Erro', 'Preencha o Nome e Endereço do Cliente.');
        return;
    }

    try {
      const html = generateInvoiceHTML(invoiceData, selectedService);

      // 1. Cria o PDF
      const { uri } = await Print.printToFileAsync({ html });

      // 2. Compartilha o PDF
      if (uri && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: '.pdf' });
      } else {
        Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo.');
      }
    } catch (error) {
      console.error('Erro ao gerar/compartilhar PDF:', error);
      Alert.alert('Erro Crítico', 'Não foi possível gerar a nota. Veja o console.');
    }
  };


  // -------------------------------------------------------------------
  // --- Renderização da Tela ------------------------------------------
  // -------------------------------------------------------------------
  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Emissão de Nota de Serviço</Text>
      <Text style={styles.subtitle}>Selecione um serviço concluído para gerar o PDF.</Text>

      {/* DADOS DO CLIENTE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados da Nota</Text>
        <CustomInput 
            label="Nome do Cliente"
            value={invoiceData.clientName}
            onChangeText={(text) => setInvoiceData(prev => ({ ...prev, clientName: text }))}
        />
        <CustomInput 
            label="Endereço do Serviço/Cliente"
            value={invoiceData.clientAddress}
            onChangeText={(text) => setInvoiceData(prev => ({ ...prev, clientAddress: text }))}
        />
        <View style={styles.invoiceNumberBox}>
             <Text style={styles.invoiceNumberLabel}>Nº da Nota:</Text>
             <TextInput 
                style={styles.invoiceNumberInput}
                keyboardType="numeric"
                value={String(invoiceData.invoiceNumber)}
                onChangeText={(text) => setInvoiceData(prev => ({ ...prev, invoiceNumber: parseInt(text) || 0 }))}
             />
        </View>
      </View>

      {/* SELEÇÃO DE SERVIÇO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Serviço Concluído para Faturar</Text>
        <Text style={styles.infoText}>Selecione na lista abaixo o serviço já concluído.</Text>

        <ScrollView horizontal style={styles.horizontalScroll}>
          {loading && availableServices.length === 0 ? (
            <Text style={styles.infoText}>Carregando serviços...</Text>
          ) : availableServices.length === 0 ? (
            <Text style={styles.infoText}>Nenhum serviço concluído para faturar.</Text>
          ) : (
            availableServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceButton,
                  selectedService?.id === service.id && styles.serviceButtonSelected,
                ]}
                onPress={() => {
                  setSelectedService(service);
                  setInvoiceData(prev => ({...prev, clientAddress: service.location || prev.clientAddress}));
                }}
              >
                <Text style={styles.serviceButtonText}>{getServiceTypeName(service.serviceTypeId)}</Text>
                <Text style={styles.serviceButtonValue}>{formatCurrency(service.value)}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {selectedService && (
          <View style={styles.selectedServiceBox}>
            <Text style={styles.selectedServiceText}>Serviço Selecionado:</Text>
            <Text style={styles.selectedServiceDetails}>
                {selectedService.description} em {selectedService.date.split('-').reverse().join('/')}
            </Text>
            <Text style={styles.selectedServiceDetails}>Valor: {formatCurrency(selectedService.value)}</Text>
          </View>
        )}
      </View>

      {/* BOTÃO DE GERAÇÃO */}
      <TouchableOpacity style={styles.printButton} onPress={printInvoice}>
        <Ionicons name="document-text-outline" size={24} color="#FFF" />
        <Text style={styles.printButtonText}>GERAR E COMPARTILHAR PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', marginBottom: 5, marginTop: 40 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  section: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, shadowOpacity: 0.05, elevation: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  infoText: { fontSize: 14, color: '#666', marginBottom: 10 },
  
  // Invoice Number
  invoiceNumberBox: { flexDirection: 'row', alignItems: 'center', marginTop: 10, justifyContent: 'space-between' },
  invoiceNumberLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  invoiceNumberInput: { borderWidth: 1, borderColor: '#CCC', borderRadius: 5, padding: 8, width: 100, textAlign: 'center' },

  // Service Selection
  horizontalScroll: { flexDirection: 'row', marginBottom: 10 },
  serviceButton: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  serviceButtonSelected: {
    backgroundColor: '#D1E6FF',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  serviceButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceButtonValue: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
  },

  // Selected Service
  selectedServiceBox: { backgroundColor: '#E0F0FF', padding: 10, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#007AFF' },
  selectedServiceText: { fontWeight: 'bold', color: '#007AFF', marginBottom: 5 },
  selectedServiceDetails: { fontSize: 14, color: '#333' },

  // Print Button
  printButton: {
    backgroundColor: '#27AE60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 50,
    gap: 10,
    shadowColor: '#27AE60',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  printButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});