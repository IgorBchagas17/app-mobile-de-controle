// src/utils/theme.ts

export const Colors = {
    primary: '#1D70B8',          
    secondary: '#F39C12',        
    success: '#27AE60',          
    danger: '#E74C3C',           
    background: '#F8F9FA',       
    cardBackground: '#FFFFFF',   
    text: '#333333',             
    lightText: '#999999',        
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const Typography = {
    fontSize: {
        small: 12,
        medium: 16,
        large: 20,
        extraLarge: 28,
    },
    fontFamily: {
        regular: 'System', 
        bold: 'System',
    }
};

export const Styles = {
    // Sombra limpa e perfeita
    cardShadow: {
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5, 
        borderRadius: 10,
    },
    buttonBase: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    }
};