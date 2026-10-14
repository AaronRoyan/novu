import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { useAuth } from '../hooks/useAuth';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { ErrorScreen } from '../screens/fallback/ErrorScreen';
import { NoInternetScreen } from '../screens/fallback/NoInternetScreen';

export function RootNavigator() {
  const { authError, isBootstrapping, retryBootstrap, session } = useAuth();
  const { isChecking, isOnline } = useNetworkStatus();

  if (!isChecking && !isOnline && !session) {
    return <NoInternetScreen onRetry={() => void retryBootstrap()} />;
  }

  if (authError) {
    return <ErrorScreen message={authError} onRetry={() => void retryBootstrap()} />;
  }

  if (isBootstrapping) {
    return null;
  }

  return session ? <TabNavigator /> : <AuthNavigator />;
}
