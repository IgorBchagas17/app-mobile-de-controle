// src/utils/theme.ts

export const Palettes = {
    light: {
        primary: '#007AFF',          // Azul Vibrante (iOS Light)
        secondary: '#FF9500',        // Laranja
        success: '#34C759',          // Verde
        danger: '#FF3B30',           // Vermelho
        background: '#F2F2F7',       // Cinza Claro (iOS Background)
        cardBackground: '#FFFFFF',   
        card: '#FFFFFF',
        text: '#000000',
        
        // --- COMPATIBILIDADE ---
        subtext: '#8E8E93',          
        lightText: '#8E8E93',        // Alias para subtext (Resolve seu erro)
        // -----------------------
        
        border: '#C6C6C8',
        tint: 'light'
    },
    dark: {
        primary: '#0A84FF',          // Azul Claro (iOS Dark)
        secondary: '#FF9F0A',
        success: '#30D158',
        danger: '#FF453A',
        background: '#000000',       // Preto Absoluto
        cardBackground: '#1C1C1E',   
        card: '#1C1C1E',
        text: '#FFFFFF',
        
        // --- COMPATIBILIDADE ---
        subtext: '#98989D',
        lightText: '#98989D',        // Alias para subtext
        // -----------------------
        
        border: '#38383A',
        tint: 'dark'
    }
};

// Mantém compatibilidade com código legado que importa Colors diretamente
export const Colors = Palettes.light; 

export const Spacing = {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
};

export const Typography = {
    fontSize: {
        small: 12, medium: 16, large: 20, extraLarge: 28,
        caption: 12, body: 17, title3: 20, title2: 22, title1: 28, largeTitle: 34
    },
    fontFamily: {
        regular: 'System', bold: 'System'
    }
};

export const Styles = {
    cardShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderRadius: 12,
    },
    buttonBase: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    }
};