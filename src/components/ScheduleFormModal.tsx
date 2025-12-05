import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform, Modal, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // NOVO: Para o efeito blur de fundo (Estilo iOS)

import { CustomInput } from './CustomInput';
import { addService, getServiceTypes } from '../database/SQLiteService';
import { ServiceModel, ServiceTypeModel } from '../database/types';
import { Colors, Typography, Spacing, Styles } from '../utils/theme';

interface ScheduleModalProps {
    isVisible: boolean;
    onClose: () => void;
    onServiceScheduled: () => void;
}

export const ScheduleFormModal = ({ isVisible, onClose, onServiceScheduled }: ScheduleModalProps) => {
    // ESTADOS
    const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<number | null>(null);
    const [serviceDescription, setServiceDescription] = useState('');
    const [serviceValue, setServiceValue] = useState('');
    const [serviceLocation, setServiceLocation] = useState('');
    const [serviceDate, setServiceDate] = useState(new Date());
    const [serviceTypes, setServiceTypes] = useState<ServiceTypeModel[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Carrega tipos de serviço
    React.useEffect(() => {
        if (!isVisible) return;

        const loadTypes = async () => {
            try {
                const types = await getServiceTypes();
                setServiceTypes(types);
                if (types.length > 0) {
                    setSelectedServiceTypeId(types[0].id);
                }
            } catch (error) {
                console.error("Erro ao carregar tipos:", error);
            }
        };
        loadTypes();
    }, [isVisible]);

    const handleDateChange = (event: any, selectedDate: Date | undefined) => {
        const currentDate = selectedDate || serviceDate;
        // Oculta o picker no Android imediatamente, mas no iOS fica sempre visível
        setShowDatePicker(Platform.OS === 'ios' ? true : false); 
        setServiceDate(currentDate);
    };

    const handleSchedule = async () => {
        if (!selectedServiceTypeId || !serviceValue || !serviceLocation) {
            Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
            return;
        }
        
        const numericValue = parseFloat(serviceValue.replace(',', '.'));
        const selectedType = serviceTypes.find(t => t.id === selectedServiceTypeId);
        
        const newService: ServiceModel = {
            serviceTypeId: selectedServiceTypeId,
            description: `${selectedType?.name || 'Agendamento'} - ${serviceDescription || 'Serviço Agendado'}`,
            value: numericValue,
            date: serviceDate.toISOString().split('T')[0],
            location: serviceLocation,
            isCompleted: 0, // FIXO: 0 = Agendado/Pendente
        };

        try {
            await addService(newService);
            
            // Limpa campos e fecha
            setServiceDescription('');
            setServiceValue('');
            setServiceLocation('');

            onServiceScheduled(); // Recarrega a lista da Agenda
            onClose(); 
            
        } catch (error) {
            Alert.alert('Erro', `Falha ao agendar: ${String(error)}`);
        }
    };

    const formattedDate = serviceDate.toLocaleDateString('pt-BR');

    return (
        <Modal
            animationType="slide" 
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            {/* EFEITO BLUR NO FUNDO (Nível iOS) */}
            <BlurView intensity={Platform.OS === 'ios' ? 30 : 80} tint="dark" style={modalStyles.centeredView}>
                <Pressable style={modalStyles.modalView} onPress={() => { /* Evita fechar ao tocar no formulário */ }}>
                    
                    <View style={modalStyles.header}>
                        <Text style={modalStyles.title}>Agendar Novo Serviço</Text>
                        <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                            <Ionicons name="close-circle-outline" size={32} color={Colors.lightText} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={modalStyles.inputLabel}>Tipo de Serviço</Text>
                        <View style={[modalStyles.pickerContainer, Styles.cardShadow]}>
                            <Picker
                                selectedValue={selectedServiceTypeId}
                                onValueChange={(itemValue) => setSelectedServiceTypeId(itemValue)}
                                style={modalStyles.picker}
                            >
                                {serviceTypes.map((type) => (
                                    <Picker.Item key={type.id} label={type.name} value={type.id} />
                                ))}
                            </Picker>
                        </View>
                        
                        {/* INPUT CUSTOMIZADO DE DATA */}
                        <Text style={modalStyles.inputLabel}>Data do Serviço</Text>
                        <TouchableOpacity 
                            style={[modalStyles.dateButton, Styles.cardShadow]} 
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                            <Text style={modalStyles.dateButtonText}>{formattedDate}</Text>
                        </TouchableOpacity>
                        
                        {/* DatePicker para Android e iOS (Mostrado só quando clicado, menos intrusivo) */}
                        {showDatePicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={serviceDate}
                                mode={'date'}
                                is24Hour={true}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'} // Spinner no iOS
                                onChange={handleDateChange}
                            />
                        )}

                        <CustomInput
                            label="Valor Estimado (R$)"
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={serviceValue}
                            onChangeText={setServiceValue}
                        />

                        <CustomInput
                            label="Endereço / Cliente"
                            placeholder="Rua A, N° 123 - Cliente X"
                            value={serviceLocation}
                            onChangeText={setServiceLocation}
                        />
                        
                        <CustomInput
                            label="Descrição Detalhada"
                            placeholder="Breve descrição do trabalho"
                            value={serviceDescription}
                            onChangeText={setServiceDescription}
                        />

                        <TouchableOpacity style={[modalStyles.scheduleButton, Styles.cardShadow]} onPress={handleSchedule}>
                            <Text style={modalStyles.scheduleText}>CONFIRMAR AGENDAMENTO</Text>
                        </TouchableOpacity>

                        <View style={{ height: Spacing.xl }} />
                    </ScrollView>

                </Pressable>
            </BlurView>
        </Modal>
    );
};

// Estilos Nível iOS (Sombras, Fundo semi-transparente)
const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end', // Alinha o modal na parte inferior
    },
    modalView: {
        backgroundColor: Colors.cardBackground,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: Spacing.lg,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        height: '90%', // Altura do modal
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
        // Fontes iOS: O React Native usa a fonte nativa do iOS (San Francisco) por padrão
    },
    closeButton: {
        padding: Spacing.xs
    },
    inputLabel: {
        fontSize: Typography.fontSize.medium,
        color: Colors.text,
        fontWeight: '600',
        marginBottom: Spacing.xs,
        marginTop: Spacing.md,
    },
    pickerContainer: {
        backgroundColor: Colors.background,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.background,
        marginBottom: Spacing.sm,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
        color: Colors.text,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        height: 50,
        paddingHorizontal: Spacing.md,
        borderRadius: 10,
    },
    dateButtonText: {
        marginLeft: Spacing.sm,
        fontSize: Typography.fontSize.medium,
        color: Colors.text,
    },
    scheduleButton: {
        backgroundColor: Colors.secondary, // Laranja para Agendamento
        height: 55,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    scheduleText: {
        color: Colors.cardBackground,
        fontSize: Typography.fontSize.medium,
        fontWeight: 'bold',
    }
});