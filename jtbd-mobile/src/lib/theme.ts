export const theme = {
  colors: {
    // Brand colors - keep the identity!
    primary: '#DC2626', // Red - professional button color
    primaryDark: '#B91C1C',
    primaryLight: '#EF4444',

    // Modern light theme
    background: '#FFFFFF', // Clean white
    surface: '#F8F9FA', // Light gray for cards
    surfaceElevated: '#FFFFFF', // Elevated surfaces

    // Text colors - high contrast for readability
    text: '#1F2937', // Dark gray (primary text)
    textSecondary: '#4B5563', // Medium gray
    textMuted: '#9CA3AF', // Light gray
    textInverse: '#FFFFFF', // White text on dark backgrounds

    // Semantic colors
    success: '#10B981', // Green
    warning: '#F59E0B', // Amber
    error: '#EF4444', // Red
    info: '#3B82F6', // Blue

    // UI elements
    border: '#E5E7EB', // Light border
    borderDark: '#D1D5DB', // Darker border for emphasis
    divider: '#F3F4F6', // Subtle dividers

    // Card variations
    card: '#FFFFFF',
    cardBorder: '#E5E7EB',
    cardShadow: 'rgba(0, 0, 0, 0.05)',

    // Interactive states
    ripple: 'rgba(220, 38, 38, 0.12)', // Primary color ripple
    hover: 'rgba(0, 0, 0, 0.04)',
    pressed: 'rgba(0, 0, 0, 0.08)',

    // Status badges
    statusReady: '#10B981',
    statusNeedsWork: '#F59E0B',
    statusNotReady: '#EF4444',
    statusExemplary: '#8B5CF6',

    // Legacy support (for gradual migration)
    chart3: '#10B981',
    destructive: '#EF4444',
    secondary: '#10B981',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  fontSize: {
    // iOS Human Interface Guidelines inspired
    caption: 12,
    footnote: 13,
    subhead: 15,
    callout: 16,
    body: 17,
    headline: 17,
    title3: 20,
    title2: 22,
    title1: 28,
    largeTitle: 34,

    // Legacy support
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 34,
  },
  fontWeight: {
    regular: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
  },
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 8,
    },
  },
  // Minimum touch targets (iOS/Android guidelines)
  touchTarget: {
    min: 44, // iOS minimum
    androidMin: 48, // Android minimum
  },
};
