import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { getServices, getServiceTypes } from '../database/SQLiteService';
import { ServiceModel, ServiceTypeModel } from '../database/types';
import { ServiceCard } from '../components/ServiceCard';
import { InvoiceModal } from '../components/InvoiceModal';
import { RegisterModal } from '../components/RegisterModal';
import { useDBContext } from '../database/DBContext';
import { Colors, Spacing, Typography, Styles } from '../utils/theme';

export default function ServicesHistory() {
    const { isReady } = useDBContext();
    const [services, setServices] = useState<ServiceModel[]>([]);
    const [serviceTypes, setServiceTypes] = useState<ServiceTypeModel[]>([]);
    const [loading, setLoading] = useState(true);

    // Modais
    const [isInvoiceVisible, setIsInvoiceVisible] = useState(false);
    const [isRegisterVisible, setIsRegisterVisible] = useState(false);
    const [selectedService, setSelectedService] = useState<ServiceModel | null>(null);

    const loadData = async () => {
        if (!isReady) return;
        try {
            setLoading(true);
            const allData = await getServices();
            const types = await getServiceTypes();
            // Filtra apenas os CONCLUÍDOS (1)
            setServices(allData.filter(s => s.isCompleted === 1));
            setServiceTypes(types);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { if (isReady) loadData(); }, [isReady]));

    const getTypeName = (id?: number) => serviceTypes.find(t => t.id === id)?.name || 'Serviço';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Histórico de Serviços</Text>
                <Text style={styles.subtitle}>Toque em um item para gerar Nota.</Text>
            </View>

            <FlatList
                data={services}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => { setSelectedService(item); setIsInvoiceVisible(true); }}>
                        <ServiceCard data={item} />
                    </TouchableOpacity>
                )}
                contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={[Colors.primary]} enabled={isReady} />}
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>Nenhum serviço faturado ainda.</Text>
                )}
            />

            {/* Botão Flutuante (FAB) para Faturar */}
            <TouchableOpacity style={styles.fab} onPress={() => setIsRegisterVisible(true)}>
                <Ionicons name="receipt-outline" size={28} color={Colors.cardBackground} />
            </TouchableOpacity>

            <RegisterModal 
                isVisible={isRegisterVisible} 
                onClose={() => setIsRegisterVisible(false)} 
                onSuccess={loadData} 
            />

            <InvoiceModal 
                isVisible={isInvoiceVisible} 
                onClose={() => setIsInvoiceVisible(false)} 
                service={selectedService} 
                serviceTypeName={getTypeName(selectedService?.serviceTypeId)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, paddingTop: 50 },
    header: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
    title: { fontSize: Typography.fontSize.extraLarge, fontWeight: 'bold', color: Colors.text },
    subtitle: { fontSize: Typography.fontSize.medium, color: Colors.lightText },
    emptyText: { textAlign: 'center', marginTop: 50, color: Colors.lightText },
    fab: {
        position: 'absolute',
        right: Spacing.lg,
        bottom: Spacing.xl,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.success, // Verde para faturamento
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    }
});