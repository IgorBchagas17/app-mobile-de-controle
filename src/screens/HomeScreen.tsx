import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit'; 

import { getServices } from '../database/SQLiteService';
import { ServiceModel } from '../database/types';
import { useDBContext } from '../database/DBContext';
import { Colors, Spacing, Typography, Styles } from '../utils/theme';

const screenWidth = Dimensions.get('window').width;

type FilterType = 'mes' | '3meses' | '6meses' | 'ano' | 'tudo';

export default function HomeScreen() {
    const { isReady } = useDBContext();
    const [allServices, setAllServices] = useState<ServiceModel[]>([]);
    const [filteredServices, setFilteredServices] = useState<ServiceModel[]>([]);
    const [filter, setFilter] = useState<FilterType>('mes');
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!isReady) return;
        setLoading(true);
        try {
            const data = await getServices();
            // Apenas concluídos contam para o gráfico
            const completed = data.filter(s => s.isCompleted === 1);
            setAllServices(completed);
            applyFilter(filter, completed);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // Lógica de Calendário Precisa
    const applyFilter = (selectedFilter: FilterType, data: ServiceModel[]) => {
        setFilter(selectedFilter);
        const now = new Date();
        let startDate = new Date(); // Data de corte

        if (selectedFilter === 'mes') {
            // Dia 1 do mês atual
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (selectedFilter === '3meses') {
            // Dia 1 de 3 meses atrás
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        } else if (selectedFilter === '6meses') {
            startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        } else if (selectedFilter === 'ano') {
            // Dia 1 de Janeiro deste ano
            startDate = new Date(now.getFullYear(), 0, 1);
        } else {
            // Tudo (Data muito antiga)
            startDate = new Date(1970, 0, 1);
        }

        // Filtra comparando timestamps
        const filtered = data.filter(item => {
            const itemDate = new Date(item.date); 
            // Precisamos garantir que a data do item (ex: 2023-10-05) seja considerada >= 2023-10-01
            // Convertendo para 'setHours(0,0,0,0)' para evitar problemas de fuso horário na comparação simples
            const itemTime = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate()).getTime();
            const startTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
            
            return itemTime >= startTime;
        });

        setFilteredServices(filtered);
    };

    useFocusEffect(useCallback(() => { if (isReady) loadData(); }, [isReady]));

    // Totais Dinâmicos
    const totalPeriodo = filteredServices.reduce((acc, curr) => acc + curr.value, 0);
    const totalHoje = filteredServices.filter(s => s.date === new Date().toISOString().split('T')[0]).reduce((acc, s) => acc + s.value, 0);

    // Gráfico Agrupado por Mês (Baseado nos dados filtrados)
    const chartData = useMemo(() => {
        const groups: Record<string, number> = {};
        
        filteredServices.forEach(item => {
            // Chave: "Out/23"
            const dateObj = new Date(item.date);
            // Array de meses curto
            const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
            const key = `${monthNames[dateObj.getMonth()]}`;
            
            groups[key] = (groups[key] || 0) + item.value;
        });

        const labels = Object.keys(groups); // Pode precisar ordenar se a ordem vier errada
        const values = Object.values(groups);

        return {
            labels: labels.length > 0 ? labels : ['Sem dados'],
            datasets: [{ data: values.length > 0 ? values : [0] }]
        };
    }, [filteredServices]);

    const FilterChip = ({ label, value }: { label: string, value: FilterType }) => (
        <TouchableOpacity 
            style={[styles.chip, filter === value && styles.chipSelected]} 
            onPress={() => applyFilter(value, allServices)}
        >
            <Text style={[styles.chipText, filter === value && styles.chipTextSelected]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}>
            <View style={styles.header}>
                <Text style={styles.title}>Visão Geral</Text>
                <Text style={styles.subtitle}>Acompanhe o desempenho do negócio.</Text>
            </View>

            {/* Filtros */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
                <FilterChip label="Este Mês" value="mes" />
                <FilterChip label="3 Meses" value="3meses" />
                <FilterChip label="6 Meses" value="6meses" />
                <FilterChip label="Este Ano" value="ano" />
                <FilterChip label="Tudo" value="tudo" />
            </ScrollView>

            {/* Card Principal */}
            <View style={styles.mainCard}>
                <Text style={styles.mainCardLabel}>Faturamento ({filter === 'mes' ? 'Mês Atual' : filter})</Text>
                <Text style={styles.mainCardValue}>
                    {totalPeriodo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Text>
                <View style={styles.row}>
                    <Text style={styles.miniLabel}>Hoje: {totalHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                    <Text style={styles.miniLabel}>{filteredServices.length} serviços</Text>
                </View>
            </View>

            {/* Gráfico */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Evolução no Período</Text>
                <BarChart
                    data={chartData}
                    width={screenWidth - 40}
                    height={220}
                    yAxisLabel="R$"
                    yAxisSuffix=""
                    chartConfig={{
                        backgroundColor: Colors.cardBackground,
                        backgroundGradientFrom: "#FFF",
                        backgroundGradientTo: "#FFF",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(29, 112, 184, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                        barPercentage: 0.7,
                    }}
                    style={{ borderRadius: 10 }}
                    showValuesOnTopOfBars // Mostra o valor em cima da barra
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, paddingTop: 50 },
    header: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
    title: { fontSize: Typography.fontSize.extraLarge, fontWeight: 'bold', color: Colors.text },
    subtitle: { fontSize: Typography.fontSize.medium, color: Colors.lightText },
    
    filtersContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, height: 50 },
    chip: {
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        backgroundColor: Colors.cardBackground, borderRadius: 20, marginRight: Spacing.sm,
        borderWidth: 1, borderColor: '#E0E0E0', height: 36, justifyContent: 'center'
    },
    chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    chipText: { color: Colors.text, fontSize: 13, fontWeight: '600' },
    chipTextSelected: { color: '#FFF' },

    mainCard: {
        marginHorizontal: Spacing.lg, padding: Spacing.lg, backgroundColor: Colors.cardBackground,
        borderRadius: 16, marginBottom: Spacing.lg,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
    },
    mainCardLabel: { fontSize: Typography.fontSize.small, color: Colors.lightText, textTransform: 'uppercase' },
    mainCardValue: { fontSize: 32, fontWeight: 'bold', color: Colors.success, marginVertical: Spacing.xs },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm },
    miniLabel: { fontSize: Typography.fontSize.small, color: Colors.text, fontWeight: '500' },

    chartContainer: {
        marginHorizontal: Spacing.lg, padding: Spacing.md, backgroundColor: Colors.cardBackground,
        borderRadius: 16, marginBottom: 50
    },
    chartTitle: { fontSize: Typography.fontSize.medium, fontWeight: 'bold', color: Colors.text, marginBottom: Spacing.md }
});