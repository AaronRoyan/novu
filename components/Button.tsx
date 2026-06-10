import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '../theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
};

export function Button({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
}: ButtonProps) {
  const isInactive = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        pressed && !isInactive ? styles.pressed : null,
        isInactive ? styles.disabled : null,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.inverse : theme.colors.primary}
          size="small"
        />
      ) : null}
      <Text
        style={[
          styles.label,
          variant !== 'primary' ? styles.altLabel : null,
          isLoading ? styles.loadingLabel : null,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.background,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    backgroundColor: theme.colors.disabled,
    borderColor: theme.colors.disabled,
  },
  label: {
    color: theme.colors.inverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  altLabel: {
    color: theme.colors.primary,
  },
  loadingLabel: {
    opacity: 0.95,
  },
});
