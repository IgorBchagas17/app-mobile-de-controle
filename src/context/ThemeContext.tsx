import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Vamos precisar instalar isso se não tiver
import { Palettes } from '../utils/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextData {
    theme: typeof Palettes.light;
    mode: ThemeMode;
    isDark: boolean;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useColorScheme(); // Pega a config do celular
    const [mode, setModeState] = useState<ThemeMode>('system');

    // Carrega a preferência salva
    useEffect(() => {
        const loadTheme = async () => {
            const savedMode = await AsyncStorage.getItem('@theme_mode');
            if (savedMode) setModeState(savedMode as ThemeMode);
        };
        loadTheme();
    }, []);

    const setMode = async (newMode: ThemeMode) => {
        Haptics.selectionAsync(); // Vibração tátil estilo iOS ao trocar
        setModeState(newMode);
        await AsyncStorage.setItem('@theme_mode', newMode);
    };

    // Define se é escuro baseado no modo escolhido ou no sistema
    const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
    const theme = isDark ? Palettes.dark : Palettes.light;

    return (
        <ThemeContext.Provider value={{ theme, mode, isDark, setMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook fácil para usar em qualquer tela
export const useTheme = () => useContext(ThemeContext);