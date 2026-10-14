import { Heading, Text } from '@gluestack-ui/themed';
import { StyleSheet, View } from 'react-native';

import { theme } from '../theme/theme';

type HeaderProps = {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
};

export function Header({ title, subtitle, align = 'left' }: HeaderProps) {
  return (
    <View style={[styles.wrapper, align === 'center' ? styles.centered : null]}>
      <Heading size="2xl" color="$black">
        {title}
      </Heading>
      {subtitle ? (
        <Text size="md" color="$coolGray600" style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.xs,
  },
  centered: {
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 320,
  },
});
