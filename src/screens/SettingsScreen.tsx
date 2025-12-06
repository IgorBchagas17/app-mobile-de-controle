import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Typography } from '../utils/theme';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
    const { theme, mode, setMode } = useTheme();

    const renderOption = (label: string, value: string, selected: boolean, onPress: () => void) => (
        <TouchableOpacity 
            style={[styles.optionRow, { borderBottomColor: theme.border }]} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.optionText, { color: theme.text }]}>{label}</Text>
            {selected && <Ionicons name="checkmark" size={20} color={theme.primary} />}
        </TouchableOpacity>
    );

    const SettingsSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.subtext }]}>{title.toUpperCase()}</Text>
            <View style={[styles.sectionBody, { backgroundColor: theme.cardBackground }]}>
                {children}
            </View>
        </View>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Ajustes</Text>
            </View>

            <SettingsSection title="Aparência">
                {renderOption("Automático (Sistema)", "system", mode === 'system', () => setMode('system'))}
                {renderOption("Modo Claro", "light", mode === 'light', () => setMode('light'))}
                <View style={[styles.optionRow, { borderBottomWidth: 0 }]}> 
                    <TouchableOpacity 
                        style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}} 
                        onPress={() => setMode('dark')}
                    >
                        <Text style={[styles.optionText, { color: theme.text }]}>Modo Escuro</Text>
                        {mode === 'dark' && <Ionicons name="checkmark" size={20} color={theme.primary} />}
                    </TouchableOpacity>
                </View>
            </SettingsSection>

            <SettingsSection title="Dados e Segurança">
                <TouchableOpacity 
                    style={[styles.optionRow, { borderBottomWidth: 0 }]}
                    onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        Alert.alert("Backup", "Funcionalidade de backup em nuvem em breve.");
                    }}
                >
                    <Text style={[styles.optionText, { color: theme.text }]}>Fazer Backup dos Dados</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.subtext} />
                </TouchableOpacity>
            </SettingsSection>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.subtext }]}>Mestre de Obra v1.0.0</Text>
                <Text style={[styles.footerText, { color: theme.subtext }]}>Feito com ❤️ para o Papai</Text>
            </View>
            <View style={{height: 50}} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    header: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
    // CORREÇÃO: Usando Typography.fontSize em vez de Typography.sizes
    headerTitle: { fontSize: Typography.fontSize.largeTitle, fontWeight: '800' },
    
    sectionContainer: { marginBottom: Spacing.xl },
    sectionTitle: { 
        fontSize: 13, 
        fontWeight: '600', 
        marginLeft: Spacing.lg, 
        marginBottom: Spacing.xs, 
        letterSpacing: 0.5 
    },
    sectionBody: {
        borderRadius: 12,
        marginHorizontal: Spacing.lg,
        overflow: 'hidden',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 0.5,
        marginLeft: Spacing.md,
    },
    optionText: { fontSize: 17, fontWeight: '400' },
    
    footer: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
    footerText: { fontSize: 13 }
});