import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Pressable, Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { CustomInput } from './CustomInput';
import { ServiceModel } from '../database/types';
import { Colors, Typography, Spacing, Styles } from '../utils/theme';

interface InvoiceModalProps {
    isVisible: boolean;
    onClose: () => void;
    service: ServiceModel | null; 
    serviceTypeName: string; 
}

export const InvoiceModal = ({ isVisible, onClose, service, serviceTypeName }: InvoiceModalProps) => {
    const [clientName, setClientName] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState(1001);

    if (!service) return null;

    // Lógica de geração de HTML omitida por brevidade (permanece a mesma)
    const generateInvoiceHTML = (data: ServiceModel) => {
      // ... (código HTML idêntico ao anterior)
      const date = new Date().toLocaleDateString('pt-BR');
        return `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
              <style>
                body { font-family: 'Helvetica Neue', sans-serif; padding: 20px; color: #333; }
                .container { border: 1px solid #1D70B8; padding: 20px; border-radius: 10px; }
                h1 { color: #1D70B8; border-bottom: 2px solid #E0E0E0; padding-bottom: 10px; margin-bottom: 20px; text-align: center; }
                .info-box { margin-bottom: 15px; padding: 10px; background-color: #F0F5FA; border-radius: 5px; }
                .section-title { font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 5px; color: #555; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
                th { background-color: #E0F0FF; font-weight: bold; color: #1D70B8; }
                .total { font-size: 24px; font-weight: bold; text-align: right; margin-top: 30px; color: #27AE60; }
                .signature { margin-top: 70px; text-align: center; }
                .signature-line { border-top: 1px solid #333; width: 60%; margin: 0 auto; padding-top: 5px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>NOTA DE SERVIÇO Nº ${invoiceNumber}</h1>
                
                <div class="info-box">
                    <p><strong>PRESTADOR:</strong> Mestre de Obra App</p>
                    <p><strong>DATA DE EMISSÃO:</strong> ${date}</p>
                    <p><strong>CLIENTE:</strong> ${clientName || 'Cliente Indefinido'}</p>
                    <p><strong>LOCAL:</strong> ${data.location}</p>
                </div>
                
                <div class="section-title">DETALHES DO SERVIÇO</div>
                <table>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Descrição</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${serviceTypeName}</td>
                      <td>${data.description}</td>
                      <td>R$ ${data.value.toFixed(2).replace('.', ',')}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="total">VALOR COBRADO: R$ ${data.value.toFixed(2).replace('.', ',')}</div>

                <div class="signature">
                    <div class="signature-line"></div>
                    <p>Assinatura do Cliente</p>
                </div>
              </div>
            </body>
          </html>
        `;
    };


    // --- Geração e Compartilhamento do PDF (código omitido por brevidade) ---
    const printInvoice = async () => {
        if (!clientName) {
            Alert.alert('Erro', 'O nome do cliente é obrigatório para a Nota.');
            return;
        }

        try {
            const html = generateInvoiceHTML(service);
            const { uri } = await Print.printToFileAsync({ html, base64: false });
            if (uri && await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: '.pdf' });
                onClose();
            } else {
                Alert.alert('Erro', 'Compartilhamento não disponível.');
            }
        } catch (error) {
            console.error('Erro ao gerar/compartilhar PDF:', error);
            Alert.alert('Erro Crítico', 'Não foi possível gerar a nota.');
        }
    };


    return (
        <Modal
            animationType="slide" 
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <BlurView intensity={Platform.OS === 'ios' ? 80 : 95} tint="light" style={modalStyles.centeredView}>
                <Pressable style={modalStyles.modalView} onPress={() => { /* Evita fechar */ }}>
                    
                    <View style={modalStyles.header}>
                        <Text style={modalStyles.title}>Emitir Nota de Serviço</Text>
                        <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                            <Ionicons name="close-circle-outline" size={32} color={Colors.lightText} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={modalStyles.inputLabel}>Dados da Nota</Text>
                        
                        <CustomInput 
                            label="Nome Completo do Cliente"
                            placeholder="João da Silva"
                            value={clientName}
                            onChangeText={setClientName}
                        />

                        <CustomInput 
                            label="Número da Nota"
                            placeholder="1001"
                            keyboardType="numeric"
                            value={String(invoiceNumber)}
                            onChangeText={(text) => setInvoiceNumber(parseInt(text) || 1001)}
                        />

                        <View style={modalStyles.summaryBox}>
                            <Text style={modalStyles.summaryTitle}>Detalhes do Faturamento</Text>
                            <Text style={modalStyles.summaryText}>Tipo: {serviceTypeName}</Text>
                            <Text style={modalStyles.summaryText}>Local: {service.location}</Text>
                            <Text style={modalStyles.summaryValue}>Valor: {service.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                        </View>
                        
                        {/* Botão com Shadow */}
                        <TouchableOpacity 
                            style={[modalStyles.printButton, Styles.cardShadow]} 
                            onPress={printInvoice}
                        >
                            <Ionicons name="share-social-outline" size={24} color={Colors.cardBackground} />
                            <Text style={modalStyles.printButtonText}>GERAR E COMPARTILHAR PDF</Text>
                        </TouchableOpacity>

                        <View style={{ height: Spacing.xl * 3 }} />
                    </ScrollView>

                </Pressable>
            </BlurView>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalView: {
        backgroundColor: Colors.cardBackground,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: Spacing.lg,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
        height: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.background,
        paddingBottom: Spacing.sm,
    },
    title: {
        fontSize: Typography.fontSize.large,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    closeButton: {
        padding: Spacing.xs, 
    },
    inputLabel: {
        fontSize: Typography.fontSize.medium,
        color: Colors.text,
        fontWeight: '600',
        marginBottom: Spacing.xs,
        marginTop: Spacing.md,
    },
    // BLOCO CAUSADOR DO ERRO
    summaryBox: {
        backgroundColor: Colors.background,
        padding: Spacing.md,
        borderRadius: 10, // A vírgula está aqui, o problema é na linha anterior ou posterior.
        marginTop: Spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: Colors.success,
    },
    summaryTitle: {
        fontSize: Typography.fontSize.medium,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    summaryText: {
        fontSize: Typography.fontSize.medium,
        color: Colors.text,
    },
    summaryValue: {
        fontSize: Typography.fontSize.large,
        fontWeight: 'bold',
        color: Colors.success,
        marginTop: Spacing.sm,
    },
    printButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 55,
        borderRadius: 10,
        marginTop: Spacing.xl,
        gap: Spacing.sm,
        // SEM SHADOW AQUI, APLICAMOS VIA ARRAY DE ESTILOS NA CHAMA
    },
    printButtonText: {
        color: Colors.cardBackground,
        fontSize: Typography.fontSize.medium,
        fontWeight: 'bold',
    },
});