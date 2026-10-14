import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme/theme';

type ScreenWrapperProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function ScreenWrapper({ children, style }: ScreenWrapperProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
});
