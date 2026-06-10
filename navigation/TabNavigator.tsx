import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { SocialScreen } from '../screens/tabs/SocialScreen';
import { MerchScreen } from '../screens/tabs/MerchScreen';
import { NovuScreen } from '../screens/tabs/NovuScreen';
import { SettingsScreen } from '../screens/tabs/SettingsScreen';
import { theme } from '../theme/theme';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedText,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 72,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen component={NovuScreen} name="Novu" />
      <Tab.Screen component={SocialScreen} name="Social" />
      <Tab.Screen component={MerchScreen} name="Merch" />
      <Tab.Screen component={SettingsScreen} name="Settings" />
    </Tab.Navigator>
  );
}
