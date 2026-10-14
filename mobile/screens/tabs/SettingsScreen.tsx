import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../hooks/useAuth';
import { cardShadow, theme } from '../../theme/theme';

export function SettingsScreen() {
  const { signOut, user } = useAuth();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title="Settings" subtitle="Profile, preferences, and account controls live here." />
        <View style={styles.card}>
          <Text style={styles.label}>Signed in as</Text>
          <Text style={styles.value}>{user?.email ?? 'Unknown user'}</Text>
        </View>
        <Button title="Log out" onPress={() => void signOut()} variant="secondary" />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.lg,
  },
  card: {
    ...cardShadow,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.mutedText,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
