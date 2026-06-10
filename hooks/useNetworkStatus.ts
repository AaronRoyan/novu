import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

function getIsOnline(state: Awaited<ReturnType<typeof NetInfo.fetch>>) {
  if (state.isConnected === false) {
    return false;
  }

  return true;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    void NetInfo.fetch().then((state) => {
      setIsOnline(getIsOnline(state));
      setIsChecking(false);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(getIsOnline(state));
      setIsChecking(false);
    });

    return unsubscribe;
  }, []);

  return {
    isOnline,
    isChecking,
  };
}
