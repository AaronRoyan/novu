import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { cardShadow, theme } from '../../theme/theme';

type NoInternetScreenProps = {
  onRetry: () => void;
};

export function NoInternetScreen({ onRetry }: NoInternetScreenProps) {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header
          align="center"
          title="No internet connection"
          subtitle="Reconnect to continue checking auth state or signing into the app."
        />
        <View style={styles.card}>
          <Text style={styles.copy}>
            Your network appears to be offline. Once you are back online, retry and the auth flow will continue.
          </Text>
        </View>
        <Button title="Try again" onPress={onRetry} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  card: {
    ...cardShadow,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
  },
  copy: {
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
});
