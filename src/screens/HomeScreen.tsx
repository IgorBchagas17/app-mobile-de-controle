import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit'; 
import * as Haptics from 'expo-haptics'; // Toque tátil iOS

import { getServices } from '../database/SQLiteService';
import { ServiceModel } from '../database/types';
import { useDBContext } from '../database/DBContext';
import { useTheme } from '../context/ThemeContext'; // Novo Hook de Tema
import { Spacing, Typography, Styles } from '../utils/theme';

const screenWidth = Dimensions.get('window').width;

type FilterType = 'mes' | '3meses' | 'ano';

export default function HomeScreen() {
    const { isReady } = useDBContext();
    const { theme, isDark } = useTheme(); // Usando o tema dinâmico
    
    const [allServices, setAllServices] = useState<ServiceModel[]>([]);
    const [filteredServices, setFilteredServices] = useState<ServiceModel[]>([]);
    const [filter, setFilter] = useState<FilterType>('mes');
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!isReady) return;
        setLoading(true);
        try {
            const data = await getServices();
            const completed = data.filter(s => s.isCompleted === 1);
            setAllServices(completed);
            applyFilter(filter, completed);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = (selectedFilter: FilterType, data: ServiceModel[]) => {
        Haptics.selectionAsync(); // Vibraçãozinha ao trocar filtro
        setFilter(selectedFilter);
        
        const now = new Date();
        let startDate = new Date();

        if (selectedFilter === 'mes') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        else if (selectedFilter === '3meses') startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        else if (selectedFilter === 'ano') startDate = new Date(now.getFullYear(), 0, 1);

        const filtered = data.filter(item => {
            const itemDate = new Date(item.date); 
            // Reset horas para comparação justa
            return new Date(itemDate.toDateString()) >= new Date(startDate.toDateString());
        });

        setFilteredServices(filtered);
    };

    useFocusEffect(useCallback(() => { if (isReady) loadData(); }, [isReady]));

    // Totais
    const totalPeriodo = filteredServices.reduce((acc, curr) => acc + curr.value, 0);

    // Dados do Gráfico
    const chartData = useMemo(() => {
        const groups: Record<string, number> = {};
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        
        // Inicializa os últimos meses com 0 para o gráfico não ficar vazio
        // (Lógica simplificada para visualização)
        
        filteredServices.forEach(item => {
            const dateObj = new Date(item.date);
            const key = monthNames[dateObj.getMonth()];
            groups[key] = (groups[key] || 0) + item.value;
        });

        const labels = Object.keys(groups);
        const values = Object.values(groups);

        return {
            labels: labels.length > 0 ? labels : ['Sem dados'],
            datasets: [{ data: values.length > 0 ? values : [0] }]
        };
    }, [filteredServices]);

    // Componente de Filtro (Segmented Control style)
    const FilterSegment = () => (
        <View style={[styles.segmentContainer, { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' }]}>
            {(['mes', '3meses', 'ano'] as FilterType[]).map((f) => {
                const labels: Record<string, string> = { 'mes': 'Mês', '3meses': 'Trimestre', 'ano': 'Ano' };
                const isActive = filter === f;
                return (
                    <TouchableOpacity 
                        key={f} 
                        style={[styles.segmentBtn, isActive && { backgroundColor: theme.cardBackground, ...Styles.cardShadow }]}
                        onPress={() => applyFilter(f, allServices)}
                    >
                        <Text style={[
                            styles.segmentText, 
                            { color: isActive ? theme.text : theme.subtext, fontWeight: isActive ? '600' : '400' }
                        ]}>
                            {labels[f]}
                        </Text>
                    </TouchableOpacity>
                )
            })}
        </View>
    );

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: theme.background }]} 
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={theme.primary} />}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Visão Geral</Text>
            </View>

            <FilterSegment />

            {/* Card Principal */}
            <View style={[styles.mainCard, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.label, { color: theme.subtext }]}>FATURAMENTO</Text>
                <Text style={[styles.value, { color: theme.success }]}>
                    {totalPeriodo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Text>
            </View>

            {/* Gráfico */}
            <View style={[styles.chartContainer, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.chartTitle, { color: theme.text }]}>Desempenho</Text>
                
                {/* Scroll horizontal para o gráfico não quebrar layout */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                        data={chartData}
                        width={Math.max(screenWidth - 40, chartData.labels.length * 50)} // Largura dinâmica
                        height={220}
                        yAxisLabel="R$"
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: theme.cardBackground,
                            backgroundGradientFrom: theme.cardBackground,
                            backgroundGradientTo: theme.cardBackground,
                            decimalPlaces: 0,
                            color: (opacity = 1) => theme.primary,
                            labelColor: (opacity = 1) => theme.subtext,
                            barPercentage: 0.7,
                            propsForBackgroundLines: { strokeDasharray: "", stroke: theme.border }
                        }}
                        style={{ borderRadius: 12, paddingRight: 40 }}
                        showValuesOnTopOfBars={true}
                        fromZero={true}
                    />
                </ScrollView>
            </View>

            <View style={{height: 100}} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    header: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
    title: { fontSize: 34, fontWeight: 'bold' },
    
    segmentContainer: {
        flexDirection: 'row',
        marginHorizontal: Spacing.lg,
        padding: 2,
        borderRadius: 8,
        marginBottom: Spacing.lg,
        height: 36
    },
    segmentBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 6 },
    segmentText: { fontSize: 13 },

    mainCard: {
        marginHorizontal: Spacing.lg, padding: 20, borderRadius: 16, marginBottom: Spacing.lg,
        // Sombra leve iOS
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4
    },
    label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.8, marginBottom: 4 },
    value: { fontSize: 36, fontWeight: '700' },

    chartContainer: {
        marginHorizontal: Spacing.lg, padding: 16, borderRadius: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
    },
    chartTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 }
});