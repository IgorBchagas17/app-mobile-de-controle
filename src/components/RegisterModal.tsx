import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform, Modal, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { CustomInput } from './CustomInput';
import { addService, getServiceTypes } from '../database/SQLiteService';
import { ServiceModel, ServiceTypeModel } from '../database/types';
import { Colors, Typography, Spacing, Styles } from '../utils/theme';

interface RegisterModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const RegisterModal = ({ isVisible, onClose, onSuccess }: RegisterModalProps) => {
    const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<number | null>(null);
    const [serviceDescription, setServiceDescription] = useState('');
    const [serviceValue, setServiceValue] = useState('');
    const [serviceLocation, setServiceLocation] = useState('');
    const [serviceDate, setServiceDate] = useState(new Date()); 
    const [serviceTypes, setServiceTypes] = useState<ServiceTypeModel[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    React.useEffect(() => {
        if (!isVisible) return;
        const loadTypes = async () => {
            try {
                const types = await getServiceTypes();
                setServiceTypes(types);
                if (types.length > 0) setSelectedServiceTypeId(types[0].id);
            } catch (error) {
                console.error(error);
            }
        };
        loadTypes();
    }, [isVisible]);

    const handleDateChange = (event: any, selectedDate: Date | undefined) => {
        const currentDate = selectedDate || serviceDate;
        setShowDatePicker(Platform.OS === 'ios');
        setServiceDate(currentDate);
    };

    const handleRegister = async () => {
        if (!selectedServiceTypeId || !serviceValue || !serviceLocation) {
            Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
            return;
        }
        
        const numericValue = parseFloat(serviceValue.replace(',', '.'));
        const selectedType = serviceTypes.find(t => t.id === selectedServiceTypeId);

        const newService: ServiceModel = {
            serviceTypeId: selectedServiceTypeId,
            description: `${selectedType?.name} - ${serviceDescription || 'Concluído'}`,
            value: numericValue,
            date: serviceDate.toISOString().split('T')[0],
            location: serviceLocation,
            isCompleted: 1, // 1 = Concluído/Faturado
        };

        try {
            await addService(newService);
            setServiceDescription('');
            setServiceValue('');
            setServiceLocation('');
            onSuccess();
            onClose();
        } catch (error) {
            Alert.alert('Erro', `Falha ao registrar: ${String(error)}`);
        }
    };

    const formattedDate = serviceDate.toLocaleDateString('pt-BR');

    return (
        <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <BlurView intensity={Platform.OS === 'ios' ? 80 : 90} tint="dark" style={styles.centeredView}>
                <Pressable style={styles.modalView} onPress={() => {}}>
                    
                    <View style={styles.header}>
                        <Text style={styles.title}>Faturar Serviço</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close-circle-outline" size={32} color={Colors.lightText} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.inputLabel}>Tipo de Serviço</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedServiceTypeId}
                                onValueChange={(itemValue) => setSelectedServiceTypeId(itemValue)}
                                style={styles.picker}
                            >
                                {serviceTypes.map((type) => (
                                    <Picker.Item key={type.id} label={type.name} value={type.id} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.inputLabel}>Data do Faturamento</Text>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                            <Text style={styles.dateButtonText}>{formattedDate}</Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={serviceDate}
                                mode={'date'}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleDateChange}
                            />
                        )}

                        <CustomInput label="Valor (R$)" placeholder="0.00" keyboardType="numeric" value={serviceValue} onChangeText={setServiceValue} />
                        <CustomInput label="Cliente / Local" placeholder="Nome ou Endereço" value={serviceLocation} onChangeText={setServiceLocation} />
                        <CustomInput label="Descrição Extra" placeholder="Detalhes..." value={serviceDescription} onChangeText={setServiceDescription} />

                        <TouchableOpacity style={styles.button} onPress={handleRegister}>
                            <Text style={styles.buttonText}>CONFIRMAR FATURAMENTO</Text>
                        </TouchableOpacity>
                        <View style={{ height: Spacing.xl }} />
                    </ScrollView>
                </Pressable>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'flex-end' },
    modalView: {
        backgroundColor: Colors.cardBackground,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: Spacing.lg,
        height: '90%',
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    title: { fontSize: Typography.fontSize.large, fontWeight: 'bold', color: Colors.primary },
    closeButton: { padding: Spacing.xs },
    inputLabel: { fontSize: Typography.fontSize.medium, color: Colors.text, fontWeight: '600', marginBottom: Spacing.xs, marginTop: Spacing.md },
    pickerContainer: {
        backgroundColor: Colors.background,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: Spacing.sm,
        overflow: 'hidden',
    },
    picker: { height: 50, width: '100%' },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        height: 50,
        paddingHorizontal: Spacing.md,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    dateButtonText: { marginLeft: Spacing.sm, fontSize: Typography.fontSize.medium, color: Colors.text },
    button: {
        backgroundColor: Colors.success,
        height: 55,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    buttonText: { color: Colors.cardBackground, fontSize: Typography.fontSize.medium, fontWeight: 'bold' },
});