// Lashwa Dating App Theme Colors
export const colors = {
  // Primary Colors
  primary: '#A142F4', // Vivid Purple
  accent: '#FF5F6D', // Vibrant Coral Red
  warmOrange: '#FFB347', // Warm Orange
  
  // Gradients
  primaryGradient: ['#A142F4', '#FF5F6D', '#FFB347'],
  purpleToCoral: ['#A142F4', '#FF5F6D'],
  coralToOrange: ['#FF5F6D', '#FFB347'],
  
  // Background Colors
  background: '#FDF5E6', // Soft Cream
  backgroundSecondary: '#FFF8F0', // Lighter Cream
  backgroundTertiary: '#F5E8D0', // Warmer Cream
  
  // Text Colors
  textPrimary: '#2E2E2E', // Charcoal
  textSecondary: '#7A7A7A', // Muted Gray
  textTertiary: '#9E9E9E', // Light Gray
  textInverse: '#FFFFFF', // White
  
  // Status Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Card & Component Colors
  cardBackground: '#FFFFFF',
  cardBorder: '#E8E8E8',
  cardShadow: 'rgba(161, 66, 244, 0.1)',
  
  // Button Colors
  buttonPrimary: '#A142F4',
  buttonSecondary: '#FF5F6D',
  buttonDisabled: '#E0E0E0',
  buttonText: '#FFFFFF',
  
  // Navigation Colors
  navBackground: '#FDF5E6',
  navActive: '#A142F4',
  navInactive: '#7A7A7A',
  
  // Dark Mode Colors (Fallback)
  darkBackground: '#1A1A2E',
  darkCardBackground: '#16213E',
  darkTextPrimary: '#FFFFFF',
  darkTextSecondary: '#B8B8B8',
  darkPrimary: '#8B5CF6',
  darkAccent: '#EC4899',
};

// Gradient configurations
export const gradients = {
  primary: {
    colors: ['#A142F4', '#FF5F6D', '#FFB347'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  purpleToCoral: {
    colors: ['#A142F4', '#FF5F6D'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  coralToOrange: {
    colors: ['#FF5F6D', '#FFB347'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  vertical: {
    colors: ['#A142F4', '#FF5F6D'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};

// Shadow configurations
export const shadows = {
  small: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Border radius configurations
export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 24,
  round: 50,
};

// Spacing configurations
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography configurations
export const typography = {
  fontFamily: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
    light: 'Poppins-Light',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export default {
  colors,
  gradients,
  shadows,
  borderRadius,
  spacing,
  typography,
}; 