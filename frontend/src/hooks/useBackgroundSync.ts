import { useEffect, useCallback, useRef } from 'react';
import { useMusicStore } from '../store/musicStore';
import { useAuth } from './useAuth';

/**
 * Background autosync hook
 */
export const useBackgroundSync = () => {
  const { user } = useAuth();
  const { fetchTracks, shouldRefetch, isLoading } = useMusicStore();
  const intervalRef = useRef<number | null>(null);
  const lastVisibilityRef = useRef<string>(document.visibilityState);

  const syncData = useCallback(async () => {
    if (!user || isLoading) return;
    
    if (shouldRefetch()) {
      await fetchTracks();
    }
  }, [user, isLoading, shouldRefetch, fetchTracks]);

  // Perdiodic sync each 5 minutes
  useEffect(() => {
    if (!user) return;

    // Initial sync after 1sec
    const initialTimer = setTimeout(() => {
      syncData();
    }, 1000);

    intervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearTimeout(initialTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, syncData]);

  // Sync when it's back on the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      const currentVisibility = document.visibilityState;
      
      if (currentVisibility === 'visible' && lastVisibilityRef.current === 'hidden') {
        setTimeout(() => {
          syncData();
        }, 500);
      }
      
      lastVisibilityRef.current = currentVisibility;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncData]);

  // Sync when window focus
  useEffect(() => {
    const handleFocus = () => {
      setTimeout(() => {
        syncData();
      }, 1000);
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncData]);

  return {
    syncData,
    isAutoSyncEnabled: !!user
  };
};

/**
 * Switching network hook
 */
export const useNetworkSync = () => {
  const { syncData } = useBackgroundSync();

  useEffect(() => {
    const handleOnline = () => {
      setTimeout(() => {
        syncData();
      }, 2000);
    };

    const handleOffline = () => {
      console.log('Network connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncData]);

  return {
    isOnline: navigator.onLine
  };
};
