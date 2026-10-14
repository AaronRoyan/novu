import { DefaultTheme, type Theme } from '@react-navigation/native';
import { Platform, type ViewStyle } from 'react-native';

export const theme = {
  colors: {
    primary: '#111111',
    background: '#FFFFFF',
    surface: '#F7F7F7',
    text: '#111111',
    mutedText: '#6B6B6B',
    border: '#D9D9D9',
    inverse: '#FFFFFF',
    error: '#C62828',
    success: '#2E7D32',
    disabled: '#BDBDBD',
    overlay: 'rgba(17, 17, 17, 0.08)',
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 24,
    pill: 999,
  },
};

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.background,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.primary,
  },
};

export const cardShadow: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  android: {
    elevation: 3,
  },
  default: {},
}) ?? {};
