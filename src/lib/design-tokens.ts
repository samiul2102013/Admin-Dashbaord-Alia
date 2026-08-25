export const colors = {
  primary: '#781E36',
  primaryHover: '#B83A4A',
  secondary: '#6B5B57',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  sidebarBg: '#1E1E2F',
  sidebarHover: '#2A2A3D',
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;

export const radius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
} as const;

export const typography = {
  fontFamily: 'Inter, sans-serif',
  sizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '24px',
    '2xl': '32px',
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;
