// ============================================
// ONYX - Theme Constants
// ============================================

export const colors = {
    // Core Background
    bg: '#0A0A0A',
    surface: '#141414',
    elevated: '#1E1E1E',
    border: '#2A2A2A',

    // Text
    text: '#FAFAFA',
    textSecondary: '#A0A0A0',
    muted: '#6B6B6B',

    // Action (Single brand color - Brutalist approach)
    action: '#FF6B35',
    actionHover: '#FF8255',
    actionMuted: 'rgba(255, 107, 53, 0.15)',

    // Semantic
    success: '#4ADE80',
    successMuted: 'rgba(74, 222, 128, 0.15)',
    warning: '#FBBF24',
    warningMuted: 'rgba(251, 191, 36, 0.15)',
    danger: '#EF4444',
    dangerMuted: 'rgba(239, 68, 68, 0.15)',

    // Battery/Mood levels
    battery: {
        1: '#EF4444', // Empty - Red
        2: '#F97316', // Low - Orange
        3: '#FBBF24', // Medium - Yellow
        4: '#84CC16', // Good - Lime
        5: '#4ADE80', // Full - Green
    },
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
} as const;

export const typography = {
    // Font sizes
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,

    // Font weights
    weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
} as const;

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
} as const;

// Animation durations
export const animations = {
    fast: 150,
    normal: 300,
    slow: 500,
} as const;

// Haptic patterns
export const haptics = {
    light: 'light' as const,
    medium: 'medium' as const,
    heavy: 'heavy' as const,
    success: 'success' as const,
    warning: 'warning' as const,
    error: 'error' as const,
};
