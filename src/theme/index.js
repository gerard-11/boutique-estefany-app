/**
 * Design Tokens for Boutique Estefany
 * Single Source of Truth for the application's visual identity.
 */

export const theme = {
  colors: {
    primary: '#d63384', // Rosa Boutique
    secondary: '#fce4ec',
    success: '#2ecc71',
    info: '#3498db',
    warning: '#f1c40f',
    danger: '#e74c3c',
    
    // Grises / Neutros
    background: '#f8f9fa',
    white: '#ffffff',
    text: '#333333',
    textSecondary: '#6c757d',
    textMuted: '#adb5bd',
    border: '#f2f2f2',
    
    // Especiales
    googleBlue: '#4285F4',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 28,
    },
    fontWeight: {
      regular: '400',
      medium: '600',
      bold: 'bold',
    }
  },
  
  shadows: {
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    }
  }
};
