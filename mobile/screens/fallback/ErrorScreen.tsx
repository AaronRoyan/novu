import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { cardShadow, theme } from '../../theme/theme';

type ErrorScreenProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header
          align="center"
          title="Something went wrong"
          subtitle="The app hit an authentication or bootstrap error before navigation could finish loading."
        />
        <View style={styles.card}>
          <Text style={styles.message}>{message}</Text>
        </View>
        <Button title="Retry" onPress={onRetry} />
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
  message: {
    color: theme.colors.error,
    textAlign: 'center',
    lineHeight: 22,
  },
});
