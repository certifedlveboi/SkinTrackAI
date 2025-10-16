export const theme = {
  colors: {
    // Unique gradient palette - Cosmic Aurora
    primary: '#B794F6', // Mystic Purple
    primaryLight: '#E9D5FF',
    primaryDark: '#9F7AEA',
    
    secondary: '#60D9FA', // Cyber Blue
    secondaryLight: '#B8F5FF',
    tertiary: '#F687B3', // Rose Pink
    accent: '#FBD38D', // Golden Glow
    
    background: '#0A0E27',
    backgroundGradientStart: '#1a1033', // Deep Purple-Black
    backgroundGradientEnd: '#0d1b2a', // Deep Ocean Blue
    surface: 'rgba(255, 255, 255, 0.08)',
    surfaceLight: 'rgba(255, 255, 255, 0.12)',
    surfaceDark: 'rgba(0, 0, 0, 0.3)',
    
    glass: 'rgba(255, 255, 255, 0.08)',
    glassStrong: 'rgba(255, 255, 255, 0.15)',
    glassBorder: 'rgba(183, 148, 246, 0.3)',
    
    text: '#FFFFFF',
    textSecondary: '#C4C4D9',
    textLight: '#8B8BA7',
    
    success: '#68D391',
    warning: '#F6AD55',
    error: '#FC8181',
    info: '#63B3ED',
    
    border: 'rgba(183, 148, 246, 0.2)',
    divider: 'rgba(255, 255, 255, 0.08)',
    
    overlay: 'rgba(10, 14, 39, 0.85)',
    shimmer: 'rgba(183, 148, 246, 0.5)',
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
