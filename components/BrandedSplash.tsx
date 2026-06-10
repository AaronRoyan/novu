import { Text } from '@gluestack-ui/themed';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

import { theme } from '../theme/theme';

const LOGO_SIZE = 132;

type BrandedSplashProps = {
  isBootstrapping: boolean;
};

export function BrandedSplash({ isBootstrapping }: BrandedSplashProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const shimmerLoop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1900,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    );

    pulseLoop.start();
    shimmerLoop.start();

    return () => {
      pulseLoop.stop();
      shimmerLoop.stop();
    };
  }, [pulse, shimmer]);

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.16, 0.34],
            }),
            transform: [
              {
                scale: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.18],
                }),
              },
            ],
          },
        ]}
      />
      <View style={styles.logoFrame}>
        <Image source={require('../assets/images/novu-logo.png')} style={styles.logo} />
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [
                {
                  translateX: shimmer.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [-160, 180],
                  }),
                },
                { rotate: '18deg' },
              ],
            },
          ]}
        />
      </View>
      <Text size="xl" color="$black" bold style={styles.wordmark}>
        NOVU
      </Text>
      <Text size="sm" color="$coolGray600">
        {isBootstrapping ? 'Checking your session...' : 'Launching your space...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
  },
  glow: {
    position: 'absolute',
    width: LOGO_SIZE + 80,
    height: LOGO_SIZE + 80,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.overlay,
  },
  logoFrame: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    resizeMode: 'contain',
  },
  shimmer: {
    position: 'absolute',
    width: 42,
    height: LOGO_SIZE + 24,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  wordmark: {
    letterSpacing: 5,
  },
});
