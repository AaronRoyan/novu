import 'react-native-gesture-handler';

import { GluestackUIProvider } from '@gluestack-ui/themed';
import { gluestackUIConfig } from '@gluestack-ui/config';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandedSplash } from './components/BrandedSplash';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { RootNavigator } from './navigation/RootNavigator';
import { navigationTheme, theme } from './theme/theme';

void SplashScreen.preventAutoHideAsync();

const MIN_SPLASH_DURATION_MS = 1600;

function AppShell() {
  const { isBootstrapping } = useAuth();
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [bootstrappedAt, setBootstrappedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!isLayoutReady) {
      return;
    }

    void SplashScreen.hideAsync();
  }, [isLayoutReady]);

  useEffect(() => {
    if (isBootstrapping || bootstrappedAt !== null) {
      return;
    }

    setBootstrappedAt(Date.now());
  }, [bootstrappedAt, isBootstrapping]);

  useEffect(() => {
    if (bootstrappedAt === null) {
      return;
    }

    const elapsed = Date.now() - bootstrappedAt;
    const timeout = setTimeout(
      () => setIsSplashVisible(false),
      Math.max(0, MIN_SPLASH_DURATION_MS - elapsed),
    );

    return () => clearTimeout(timeout);
  }, [bootstrappedAt]);

  return (
    <View
      style={styles.container}
      onLayout={() => {
        if (!isLayoutReady) {
          setIsLayoutReady(true);
        }
      }}
    >
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
      {isSplashVisible ? <BrandedSplash isBootstrapping={isBootstrapping} /> : null}
      <StatusBar style="dark" backgroundColor={theme.colors.background} />
    </View>
  );
}

export default function App() {
  return (
    <GluestackUIProvider config={gluestackUIConfig}>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
