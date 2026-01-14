/**
 * Material Design 3 (Material You) 색상 시스템
 * 태블릿 앱에 최적화된 색상 팔레트
 */

// Primary Color (오렌지 계열 - 따뜻한 느낌)
export const MaterialColors = {
  primary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800', // Primary
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },
  secondary: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0', // Secondary
    600: '#8E24AA',
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C',
  },
  surface: {
    default: '#FFFFFF',
    variant: '#F5F5F5',
    dim: '#E0E0E0',
  },
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
  },
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    500: '#F44336',
    700: '#D32F2F',
  },
  success: {
    50: '#E8F5E9',
    500: '#4CAF50',
    700: '#388E3C',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)', // High emphasis
    secondary: 'rgba(0, 0, 0, 0.60)', // Medium emphasis
    disabled: 'rgba(0, 0, 0, 0.38)', // Disabled
    hint: 'rgba(0, 0, 0, 0.38)', // Hint text
  },
  divider: 'rgba(0, 0, 0, 0.12)',
};

// Activity Colors (Material Design 호환)
export const ActivityMaterialColors: Record<string, {
  light: string;
  main: string;
  dark: string;
  surface: string;
}> = {
  purple: {
    light: MaterialColors.secondary[100],
    main: MaterialColors.secondary[500],
    dark: MaterialColors.secondary[700],
    surface: MaterialColors.secondary[50],
  },
  blue: {
    light: '#BBDEFB',
    main: '#2196F3',
    dark: '#1976D2',
    surface: '#E3F2FD',
  },
  pink: {
    light: '#F8BBD0',
    main: '#E91E63',
    dark: '#C2185B',
    surface: '#FCE4EC',
  },
  yellow: {
    light: '#FFF9C4',
    main: '#FFEB3B',
    dark: '#FBC02D',
    surface: '#FFFDE7',
  },
  green: {
    light: '#C8E6C9',
    main: '#4CAF50',
    dark: MaterialColors.success[700],
    surface: '#E8F5E9',
  },
  orange: {
    light: MaterialColors.primary[100],
    main: MaterialColors.primary[500],
    dark: MaterialColors.primary[700],
    surface: MaterialColors.primary[50],
  },
  red: {
    light: MaterialColors.error[100],
    main: MaterialColors.error[500],
    dark: MaterialColors.error[700],
    surface: MaterialColors.error[50],
  },
  teal: {
    light: '#B2DFDB',
    main: '#009688',
    dark: '#00796B',
    surface: '#E0F2F1',
  },
};

// Typography Scale (Material Design)
export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '400' as const,
    lineHeight: 40,
    letterSpacing: 0,
  },
  h2: {
    fontSize: 28,
    fontWeight: '400' as const,
    lineHeight: 36,
    letterSpacing: 0,
  },
  h3: {
    fontSize: 24,
    fontWeight: '400' as const,
    lineHeight: 32,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 20,
    fontWeight: '500' as const,
    lineHeight: 28,
    letterSpacing: 0.15,
  },
  h5: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  h6: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  button: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 1.25,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: 10,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
};

// Spacing System (8dp grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Elevation (Material Design)
export const Elevation = {
  0: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 2.62,
    elevation: 4,
  },
  8: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Shape (Border Radius)
export const Shape = {
  none: 0,
  small: 4,
  medium: 8,
  large: 12,
  extraLarge: 16,
  round: 9999,
};

// Component Specific Styles
export const ComponentStyles = {
  card: {
    backgroundColor: MaterialColors.surface.default,
    borderRadius: Shape.medium,
    ...Elevation[1],
    padding: Spacing.md,
  },
  cardElevated: {
    backgroundColor: MaterialColors.surface.default,
    borderRadius: Shape.medium,
    ...Elevation[4],
    padding: Spacing.md,
  },
  button: {
    minHeight: 48, // Material Design minimum touch target
    borderRadius: Shape.medium,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: Shape.round,
    ...Elevation[6],
  },
};


