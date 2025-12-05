import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';

import { CustomInput } from './CustomInput';
import { addExpense } from '../database/SQLiteService';
import { Colors, Typography, Spacing, Styles } from '../utils/theme';

interface ExpenseModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ExpenseModal = ({ isVisible, onClose, onSuccess }: ExpenseModalProps) => {
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Categorias rápidas (Tags iOS)
    const quickTags = ["Combustível", "Almoço", "Material", "Peças", "Ajudante"];

    const handleSave = async () => {
        if (!description || !value) {
            Alert.alert("Atenção", "Informe a descrição e o valor.");
            return;
        }
        
        const numValue = parseFloat(value.replace(',', '.'));
        if (isNaN(numValue) || numValue <= 0) {
            Alert.alert("Erro", "Valor inválido.");
            return;
        }

        try {
            await addExpense(description, numValue, date.toISOString().split('T')[0], 'Geral');
            setDescription('');
            setValue('');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    const formattedDate = date.toLocaleDateString('pt-BR');

    return (
        <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <BlurView intensity={Platform.OS === 'ios' ? 50 : 90} tint="dark" style={styles.centeredView}>
                <Pressable style={styles.modalView} onPress={() => {}}>
                    
                    <View style={styles.header}>
                        <Text style={styles.title}>Registrar Saída</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={Colors.lightText} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Valor do Gasto</Text>
                        <CustomInput 
                            label="" 
                            placeholder="R$ 0,00" 
                            keyboardType="numeric" 
                            value={value} 
                            onChangeText={setValue} 
                        />

                        <Text style={styles.label}>O que foi pago?</Text>
                        <CustomInput 
                            label="" 
                            placeholder="Ex: Gasolina, Parafusos..." 
                            value={description} 
                            onChangeText={setDescription} 
                        />

                        {/* Tags Rápidas */}
                        <View style={styles.tagsContainer}>
                            {quickTags.map(tag => (
                                <TouchableOpacity key={tag} style={styles.tag} onPress={() => setDescription(tag)}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Data</Text>
                        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                            <Ionicons name="calendar-outline" size={20} color={Colors.text} />
                            <Text style={styles.dateText}>{formattedDate}</Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(e, d) => {
                                    setShowDatePicker(Platform.OS === 'ios');
                                    if(d) setDate(d);
                                }}
                            />
                        )}

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveText}>CONFIRMAR SAÍDA</Text>
                        </TouchableOpacity>

                        <View style={{height: 50}} />
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.lg,
        height: '85%',
        shadowColor: "#000", shadowOffset: {width: 0, height: -5}, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
    title: { fontSize: 22, fontWeight: '700', color: Colors.danger }, // Vermelho pois é saída
    closeBtn: { padding: 5, backgroundColor: '#F0F0F0', borderRadius: 20 },
    label: { fontSize: 14, fontWeight: '600', color: Colors.lightText, marginTop: Spacing.md, marginBottom: Spacing.xs },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
    tag: { backgroundColor: '#F0F0F0', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15 },
    tagText: { fontSize: 13, color: Colors.text, fontWeight: '500' },
    dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#EEE' },
    dateText: { marginLeft: 10, fontSize: 16, color: Colors.text },
    saveBtn: {
        backgroundColor: Colors.danger, // Vermelho
        height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 30,
        shadowColor: Colors.danger, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4
    },
    saveText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});