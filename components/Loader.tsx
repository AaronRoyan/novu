import { Spinner, Text } from '@gluestack-ui/themed';
import { StyleSheet, View } from 'react-native';

import { theme } from '../theme/theme';

type LoaderProps = {
  label?: string;
};

export function Loader({ label = 'Loading...' }: LoaderProps) {
  return (
    <View style={styles.wrapper}>
      <Spinner color="$black" size="large" />
      <Text size="sm" color="$coolGray600">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
});
