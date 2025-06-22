import { useEffect, useCallback, useRef } from 'react';
import { useMusicStore } from '../store/musicStore';
import { useAuth } from './useAuth';

/**
 * Hook pour la synchronisation automatique en arrière-plan
 */
export const useBackgroundSync = () => {
  const { user } = useAuth();
  const { fetchTracks, shouldRefetch, isLoading } = useMusicStore();
  const intervalRef = useRef<number | null>(null);
  const lastVisibilityRef = useRef<string>(document.visibilityState);

  // Fonction de synchronisation intelligente
  const syncData = useCallback(async () => {
    if (!user || isLoading) return;
    
    if (shouldRefetch()) {
      console.log('🔄 Synchronisation en arrière-plan...');
      await fetchTracks();
    }
  }, [user, isLoading, shouldRefetch, fetchTracks]);

  // Synchronisation périodique (toutes les 5 minutes)
  useEffect(() => {
    if (!user) return;

    // Synchronisation initiale après 1 seconde
    const initialTimer = setTimeout(() => {
      syncData();
    }, 1000);

    // Synchronisation périodique
    intervalRef.current = setInterval(() => {
      // Ne synchroniser que si l'onglet est visible
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

  // Synchronisation lors du retour de focus sur l'onglet
  useEffect(() => {
    const handleVisibilityChange = () => {
      const currentVisibility = document.visibilityState;
      
      // Si l'onglet devient visible après avoir été caché
      if (currentVisibility === 'visible' && lastVisibilityRef.current === 'hidden') {
        // Attendre un peu pour laisser l'UI se stabiliser
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

  // Synchronisation lors du focus de la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      // Synchroniser si la fenêtre n'avait pas le focus depuis longtemps
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
 * Hook pour détecter les changements de connexion réseau
 */
export const useNetworkSync = () => {
  const { syncData } = useBackgroundSync();

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Connexion réseau rétablie, synchronisation...');
      // Attendre un peu pour s'assurer que la connexion est stable
      setTimeout(() => {
        syncData();
      }, 2000);
    };

    const handleOffline = () => {
      console.log('📴 Connexion réseau perdue');
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
