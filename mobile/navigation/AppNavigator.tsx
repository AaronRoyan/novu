import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RunDetailScreen } from '../screens/runs/RunDetailScreen';
import { theme } from '../theme/theme';
import { TabNavigator } from './TabNavigator';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

/** Signed-in app: the tabs, with detail screens pushed on top. */
export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        headerShadowVisible: false,
        headerTintColor: theme.colors.primary,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen component={TabNavigator} name="Tabs" options={{ headerShown: false }} />
      <Stack.Screen component={RunDetailScreen} name="RunDetail" options={{ title: 'Run' }} />
    </Stack.Navigator>
  );
}
