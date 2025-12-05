import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { getUnifiedTransactions, deleteTransaction, Transaction } from '../database/SQLiteService';
import { ExpenseModal } from '../components/ExpenseModal';
import { useDBContext } from '../database/DBContext';
import { Colors, Spacing, Typography, Styles } from '../utils/theme';

type FilterType = 'tudo' | 'entrada' | 'saida';

export default function FinanceScreen() {
    const { isReady } = useDBContext();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filter, setFilter] = useState<FilterType>('tudo');
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const loadData = async () => {
        if (!isReady) return;
        setLoading(true);
        try {
            const data = await getUnifiedTransactions();
            setTransactions(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { if (isReady) loadData(); }, [isReady]));

    // 1. Filtragem
    const filteredData = useMemo(() => {
        if (filter === 'tudo') return transactions;
        return transactions.filter(t => t.type === filter);
    }, [transactions, filter]);

    // 2. Cálculo do Saldo (Baseado no filtro ou geral)
    const balance = useMemo(() => {
        const entradas = transactions.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.value, 0);
        const saidas = transactions.filter(t => t.type === 'saida').reduce((acc, t) => acc + t.value, 0);
        return entradas - saidas;
    }, [transactions]);

    // 3. Agrupamento por Data (Para SectionList)
    const sections = useMemo(() => {
        const grouped: { [key: string]: Transaction[] } = {};
        
        filteredData.forEach(item => {
            const dateParts = item.date.split('-'); // YYYY-MM-DD
            const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
            
            // Formata data amigável
            const today = new Date();
            today.setHours(0,0,0,0);
            const itemDateZero = new Date(dateObj);
            itemDateZero.setHours(0,0,0,0);

            let headerTitle = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
            if (itemDateZero.getTime() === today.getTime()) headerTitle = "Hoje";
            
            if (!grouped[headerTitle]) grouped[headerTitle] = [];
            grouped[headerTitle].push(item);
        });

        return Object.keys(grouped).map(key => ({
            title: key,
            data: grouped[key]
        }));
    }, [filteredData]);

    const handleDelete = (item: Transaction) => {
        Alert.alert(
            "Excluir Registro",
            item.origin === 'service' 
                ? "Este registro vem de um Serviço Concluído. Ao excluir aqui, você apagará o serviço original."
                : "Tem certeza que deseja apagar esta despesa?",
            [
                { text: "Cancelar" },
                { text: "Apagar", style: 'destructive', onPress: async () => {
                    await deleteTransaction(item.id, item.origin);
                    loadData();
                }}
            ]
        );
    };

    const SegmentControl = () => (
        <View style={styles.segmentContainer}>
            {(['tudo', 'entrada', 'saida'] as FilterType[]).map((f) => (
                <TouchableOpacity 
                    key={f} 
                    style={[styles.segmentBtn, filter === f && styles.segmentBtnActive]}
                    onPress={() => setFilter(f)}
                >
                    <Text style={[styles.segmentText, filter === f && styles.segmentTextActive]}>
                        {f === 'tudo' ? 'Todos' : f === 'entrada' ? 'Entradas' : 'Saídas'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header Saldo */}
            <View style={styles.header}>
                <Text style={styles.headerLabel}>Saldo em Caixa</Text>
                <Text style={[styles.headerValue, { color: balance >= 0 ? Colors.success : Colors.danger }]}>
                    {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Text>
            </View>

            <SegmentControl />

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 100 }}
                stickySectionHeadersEnabled={false}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity onLongPress={() => handleDelete(item)} activeOpacity={0.7}>
                        <View style={styles.transactionRow}>
                            <View style={[styles.iconBox, { backgroundColor: item.type === 'entrada' ? '#E8F5E9' : '#FFEBEE' }]}>
                                <Ionicons 
                                    name={item.type === 'entrada' ? "arrow-up" : "arrow-down"} 
                                    size={20} 
                                    color={item.type === 'entrada' ? Colors.success : Colors.danger} 
                                />
                            </View>
                            <View style={{ flex: 1, paddingHorizontal: 10 }}>
                                <Text style={styles.transDesc}>{item.description}</Text>
                                <Text style={styles.transOrigin}>{item.origin === 'service' ? 'Serviço' : 'Despesa Manual'}</Text>
                            </View>
                            <Text style={[styles.transValue, { color: item.type === 'entrada' ? Colors.success : Colors.text }]}>
                                {item.type === 'saida' ? '- ' : '+ '}
                                {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.empty}>Nenhum registro encontrado.</Text>}
            />

            {/* FAB APENAS PARA SAÍDA (Pois entradas vêm dos serviços) */}
            <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
                <Ionicons name="remove" size={32} color="#FFF" />
            </TouchableOpacity>

            <ExpenseModal 
                isVisible={isModalVisible} 
                onClose={() => setIsModalVisible(false)} 
                onSuccess={loadData} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, paddingTop: 50 },
    
    // Header Clean iOS
    header: { alignItems: 'center', marginBottom: Spacing.lg },
    headerLabel: { fontSize: 14, color: Colors.lightText, textTransform: 'uppercase', letterSpacing: 1 },
    headerValue: { fontSize: 36, fontWeight: '800', marginTop: 5 },

    // Segment Control (Abas iOS)
    segmentContainer: {
        flexDirection: 'row', backgroundColor: '#E0E0E0', borderRadius: 12, padding: 3,
        marginHorizontal: Spacing.lg, marginBottom: Spacing.lg
    },
    segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    segmentBtnActive: { backgroundColor: '#FFF', shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    segmentText: { fontSize: 13, fontWeight: '600', color: Colors.lightText },
    segmentTextActive: { color: Colors.text },

    // List
    sectionHeader: { 
        fontSize: 18, fontWeight: 'bold', color: Colors.text, 
        marginTop: Spacing.md, marginBottom: Spacing.sm, marginLeft: Spacing.xs 
    },
    transactionRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBackground,
        padding: 16, borderRadius: 16, marginBottom: 8,
        // Sombra suave
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1
    },
    iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    transDesc: { fontSize: 15, fontWeight: '600', color: Colors.text },
    transOrigin: { fontSize: 12, color: Colors.lightText, marginTop: 2 },
    transValue: { fontSize: 15, fontWeight: '700' },
    empty: { textAlign: 'center', marginTop: 50, color: Colors.lightText },

    // FAB Vermelho (Foco em registrar gastos)
    fab: {
        position: 'absolute', right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30,
        backgroundColor: Colors.danger, justifyContent: 'center', alignItems: 'center',
        shadowColor: Colors.danger, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6
    }
});