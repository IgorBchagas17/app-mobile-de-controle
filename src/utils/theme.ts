// src/utils/theme.ts

// 🎨 Paleta de Cores da Aplicação
export const Colors = {
    primary: '#1D70B8',          // Azul Profundo (Novo Azul Principal)
    secondary: '#F39C12',        // Laranja/Amarelo (Para Alertas e Agenda)
    success: '#27AE60',          // Verde (Para Ganhos e Concluído)
    danger: '#E74C3C',           // Vermelho (Para Saídas e Exclusão)
    background: '#F8F9FA',       // Cinza Claro (Fundo Principal)
    cardBackground: '#FFFFFF',   // Branco Puro (Fundo de Cartões)
    text: '#333333',             // Texto Principal Escuro
    lightText: '#999999',        // Texto Secundário
};

// 📏 Configurações de Espaçamento
export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

// ✏️ Tipografia Básica
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

// 📐 Estilos Comuns (Sombra, Borda)
export const Styles = {
    cardShadow: {
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5, // Para Android
        borderRadius: 10,
    },
    buttonBase: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    }
};