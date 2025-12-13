export const colors = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  secondary: '#8b5cf6',
  
  background: '#0f0f1a',
  surface: '#1a1a2e',
  surfaceLight: '#252542',
  
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  
  statusGreen: '#22c55e',
  statusYellow: '#f59e0b',
  statusRed: '#ef4444',
  
  crisis: '#dc2626',
  crisisGlow: 'rgba(220, 38, 38, 0.3)',
  
  cardPatient: '#3b82f6',
  cardAlly: '#8b5cf6',
  cardTherapist: '#06b6d4',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};
