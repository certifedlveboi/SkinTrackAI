export const theme = {
  colors: {
    // Clean Natural Palette
    primary: '#7DD3C0', // Soft Mint Green
    primaryLight: '#A8E6D8',
    primaryDark: '#5FB6A8',
    
    secondary: '#F4A460', // Warm Peach
    secondaryLight: '#FFD4A8',
    tertiary: '#D4A5C6', // Soft Lavender
    accent: '#FFD4A8', // Light Peach Glow
    
    background: '#F8F9FA',
    backgroundGradientStart: '#FFFFFF', // Pure White
    backgroundGradientEnd: '#F5F7FA', // Light Blue-Gray
    surface: 'rgba(255, 255, 255, 0.95)',
    surfaceLight: 'rgba(255, 255, 255, 1)',
    surfaceDark: 'rgba(0, 0, 0, 0.05)',
    
    glass: 'rgba(255, 255, 255, 0.7)',
    glassStrong: 'rgba(255, 255, 255, 0.95)',
    glassBorder: 'rgba(125, 211, 192, 0.2)',
    
    text: '#2D3748',
    textSecondary: '#718096',
    textLight: '#A0AEC0',
    
    success: '#48BB78',
    warning: '#ED8936',
    error: '#F56565',
    info: '#4299E1',
    
    border: 'rgba(226, 232, 240, 0.8)',
    divider: 'rgba(0, 0, 0, 0.05)',
    
    overlay: 'rgba(0, 0, 0, 0.4)',
    shimmer: 'rgba(125, 211, 192, 0.3)',
    
    // Additional clean colors
    cardBg: '#FFFFFF',
    cardShadow: 'rgba(0, 0, 0, 0.08)',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 24,
    round: 999,
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
