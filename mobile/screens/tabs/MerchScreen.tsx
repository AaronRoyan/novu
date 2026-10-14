import { StyleSheet, Text, View } from 'react-native';

import { Header } from '../../components/Header';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { cardShadow, theme } from '../../theme/theme';

export function MerchScreen() {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title="Merch" subtitle="This tab is ready for storefront, drops, and product-detail work later on." />
        <View style={styles.card}>
          <Text style={styles.copy}>Merch screen placeholder</Text>
        </View>
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
  },
  copy: {
    color: theme.colors.text,
    fontSize: 16,
  },
});
